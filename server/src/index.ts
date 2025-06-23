import express from "express";
import session, { SessionData } from "express-session";
import cookieParser from "cookie-parser";
import path from "path";

import db from "./db/mongo.js";
import cache from "./cache/cache.js";
import jobs from "./jobs/jobs.js";
import utils from "./utils.js";

const day_ms = 24 * 60 * 60 * 1000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:\n', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:\n', promise, '\nreason:\n', reason);
    process.exit(1);
});

/* ==================== Express.js server initialization ==================== */

const app = express();
app.use(cookieParser());
app.use(session({
    name: '__session',
    secret: process.env.SESSION_SECRET || "",
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: day_ms}
}));
app.use(express.static(path.join(__dirname, "../../build")));
app.use(express.json());

async function generateUserId() {
    // Get the list of all user IDs
    const users = await db.users.getAllUsersIds();
    let ids = users.map(({userId}) => userId);
    // Generate a random user ID until a unique one is generated
    let user_id = "";
    do {
        user_id = utils.generateRandomString(db.users.userIdLength, false);
    } while (ids.includes(user_id));
    return user_id;
}

async function checkUserSession(session: session.Session & Partial<session.SessionData>) {
    const now = new Date(Date.now());
    // Check if the session in the cookie is valid
    if (!session || !session.userId || !session.sessionId ||
        !session.expirationDate || session.expirationDate < now)
        return false;
    // Check if the user has session information in the database
    const user = await db.users.getSessionByUserId(session.userId);
    if (user === null)
        return false;
    // Check if this session info is valid
    if (user.session.sessionId !== session.sessionId ||
        user.session.expirationDate < now)
        return false;
    return true;
}

/* ============================ Express.js routes ============================ */

app.get("/health", (req, res) => {
    res.status(200).send("OK")
})

app.post("/registration", async (req, res) => {
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (empty strings after sanitization)
    // or if the two passwords don't match
    let user_pwd = req.body.user_pwd;
    let repeated_pwd = req.body.repeated_pwd;
    let turnstile_token = req.body.turnstile_token;
    user_pwd = utils.sanitizeInput(user_pwd);
    repeated_pwd = utils.sanitizeInput(repeated_pwd);
    if (user_pwd === "" || repeated_pwd === "" || user_pwd !== repeated_pwd || turnstile_token == undefined)
    {
        res.status(400);
        res.send();
        return;
    }
    // Verify Cloudflare Turnstile token. Send status code 500 (Internal Server
    // Error) if no response is received, or 401 (Unauthorized) if the token
    // verification failed
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: 'POST',
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify({
            secret: process.env.CF_KEY,
            response: turnstile_token
        })
    });
    if (response.status != 200)
        res.status(500).send()
    const verification = await response.json()
    if (!verification.success)
        res.status(401).send()
    // Generate a random user ID
    const user_id = await generateUserId();
    // Hash the password
    const hashed_password = utils.hashPassword(user_pwd, Number.parseInt(process.env.SALT_ROUNDS || "0"));
    // Add the user to the DB
    await db.users.insertNew(user_id, hashed_password);
    // Send the user ID to the client with status code 200 (OK)
    res.status(200);
    res.json({user_id: user_id});
});

app.post("/login", async (req, res) => {
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (empty strings after sanitization)
    let user_id = req.body.user_id;
    let user_pwd = req.body.password;
    user_id = utils.sanitizeInput(user_id);
    user_pwd = utils.sanitizeInput(user_pwd);
    if (user_id === "" || user_pwd === "")
    {
        res.status(400);
        res.send();
        return;
    }
    // Check if the user exists in the db. Send status code 401
    // (Unauthorized) if the user does not exist
    const user = await db.users.getPasswordByUserId(user_id);
    if (user === null)
    {
        res.status(401);
        res.send();
        return;
    }
    // Check if the password is correct. Send status code 401
    // (Unauthorized) if the password is wrong
    if (!utils.checkPassword(user_pwd, user.password))
    {
        res.status(401);
        res.send();
        return;
    }
    // The password is correct:
    // Generate a random session ID and set the session expiration date
    const session_id = utils.generateRandomString(db.users.sessionIdLength, true);
    const now = new Date(Date.now());
    const expiration_date = utils.incrementDateByOneDay(now);
    // Add the user ID and session information to the cookie
    req.session.userId = user_id;
    req.session.sessionId = session_id;
    req.session.expirationDate = expiration_date;
    // Add the session information to the database
    await db.users.setSessionOfUserId(user_id, session_id, expiration_date);
    // Remove the account from the deletion queue
    await db.delqueue.removeFromQueueByUserRef(user._id);
    // Send status code 200 (OK)
    res.status(200);
    res.send();
});

app.post("/logout", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Invalidate the session in the database by setting the
    // expiration date to 01/01/1970 and an invalid ID
    const session = req.session as SessionData
    await db.users.setSessionOfUserId(session.userId, session.userId, new Date(0));
    // Destroy the session
    req.session.destroy((err: any) => {});
    // Send status code 200 (OK)
    res.status(200);
    res.send();
});

app.post("/user/delete", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Check if the user has the right to delete the account.
    // Send status code 403 (Forbidden) if it doesn't
    const session = req.session as SessionData
    const type = await db.users.getTypeOfUserId(session.userId);
    if (type === null || type.type >= db.users.UserType.test.value)
    {
        res.status(403);
        res.send();
        return;
    }
    // Add the user to the deletion queue with a deletion delay
    const deletion_delay_days = 30;
    let deletion_date = new Date(Date.now());
    deletion_date.setUTCDate(deletion_date.getUTCDate() + deletion_delay_days);
    const doc = await db.delqueue.insertNew(session.userId, deletion_date);
    // Check if the document was inserted successfully. Send
    // status code 500 (Internal Server Error) if it failed
    if (doc === null)
    {
        res.status(500);
        res.send();
        return;
    }
    // If the document is correctly added, force the logout (redirect to /logout route)
    res.redirect(307, "../logout");
});

app.post("/user/set-id", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Check if the user has the right to change ID.
    // Send status code 403 (Forbidden) if it doesn't
    const session = req.session as SessionData
    const type = await db.users.getTypeOfUserId(session.userId);
    if (type === null || type.type === db.users.UserType.demo.value)
    {
        res.status(403);
        res.send();
        return;
    }
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (empty strings after sanitization)
    let password = utils.sanitizeInput(req.body.password);
    if (password === "")
    {
        res.status(400);
        res.send();
        return;
    }
    // Check if the user exists in the db. Send status code 401
    // (Unauthorized) if the user does not exist
    const user = await db.users.getPasswordByUserId(session.userId);
    if (user === null)
    {
        res.status(401);
        res.send();
        return;
    }
    // Check if the password is correct. Send status code 401
    // (Unauthorized) if the password is wrong
    if (!utils.checkPassword(password, user.password))
    {
        res.status(401);
        res.send();
        return;
    }
    // Invalidate the session in the database by setting the
    // expiration date to 01/01/1970 and an invalid ID
    const curr_user_id = session.userId;
    await db.users.setSessionOfUserId(curr_user_id, curr_user_id, new Date(0));
    // Destroy the session
    req.session.destroy((err: any) => {});
    // Generate a new random user ID and update the corresponding User document
    const new_user_id = await generateUserId();
    await db.users.setUserIdByUserId(curr_user_id, new_user_id);
    // Send the new user ID to the cliend with status code 200 (OK)
    res.status(200);
    res.json({new_id: new_user_id});
});

app.post("/user/set-password", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Check if the user has the right to change password.
    // Send status code 403 (Forbidden) if it doesn't
    const session = req.session as SessionData
    const type = await db.users.getTypeOfUserId(session.userId);
    if (type === null || type.type === db.users.UserType.demo.value)
    {
        res.status(403);
        res.send();
        return;
    }
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (empty strings after sanitization)
    let old_pwd = req.body.old_pwd;
    let new_pwd = req.body.new_pwd;
    let repeated_pwd = req.body.repeated_pwd;
    old_pwd = utils.sanitizeInput(old_pwd);
    new_pwd = utils.sanitizeInput(new_pwd);
    repeated_pwd = utils.sanitizeInput(repeated_pwd);
    if (old_pwd === "" || new_pwd === "" || repeated_pwd === "")
    {
        res.status(400);
        res.send();
        return;
    }
    // Check if the new password and the repeated new password are the same
    // Send status code 403 (Forbidden) in case of inequality
    if (new_pwd !== repeated_pwd)
    {
        res.status(403);
        res.send();
        return;
    }
    // Check if the user exists in the db. Send status code 401
    // (Unauthorized) if the user does not exist
    const user = await db.users.getPasswordByUserId(session.userId);
    if (user === null)
    {
        res.status(401);
        res.send();
        return;
    }
    // Check if the password is correct. Send status code 401
    // (Unauthorized) if the password is wrong
    if (!utils.checkPassword(old_pwd, user.password))
    {
        res.status(401);
        res.send();
        return;
    }
    // The old password is correct and the new passwords are equal:
    // hash the new password and store it in the db
    // Then, force the logout (redirect to /logout route)
    let hashed_new_pwd = utils.hashPassword(new_pwd, Number.parseInt(process.env.SALT_ROUNDS || "1"));
    await db.users.setPasswordOfUserId(session.userId, hashed_new_pwd);
    res.redirect(307, "../logout");
});

app.post("/user/get", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Get the user's public information
    const session = req.session as SessionData
    const user = await db.users.getPublicInfoByUserId(session.userId);
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(user);
});

app.post("/user/set", async(req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Set the user's new public data
    const session = req.session as SessionData
    const doc = await db.users.setPublicInfoOfUserId(
        session.userId, req.body.country, req.body.job, req.body.job_type,
        req.body.job_country, req.body.work_time, req.body.remote_type
    );
    // Check if the document was inserted successfully. Send
    // status code 500 (Internal Server Error) if it failed
    if (doc === null)
    {
        res.status(500);
        res.send();
        return;
    }
    // Send status code 200 (OK)
    res.status(200);
    res.send();
});

app.post("/balances/add", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (not numbers)
    let balance = req.body.balance;
    if (!utils.isBalanceValid(balance))
    {
        res.status(400);
        res.send();
        return;
    }
    // Add the balance to the database
    const session = req.session as SessionData
    const doc = await db.balances.insertNew(
        session.userId, balance.date, balance.bank, balance.cash, balance.digital_services,
        balance.stocks.real, balance.stocks.invested, balance.etf.real, balance.etf.invested,
        balance.bitcoin.real, balance.bitcoin.invested, balance.crypto.real, balance.crypto.invested
    );
    // Check if the document was inserted successfully. Send
    // status code 500 (Internal Server Error) if it failed
    if (doc === null)
    {
        res.status(500);
        res.send();
        return;
    }
    // Send status code 200 (OK)
    res.status(200);
    res.send();
});

app.post("/balances/get", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Get the last 12 month of balances from the database
    const session = req.session as SessionData
    const balances = await db.balances.getYearlyBalanceByUserId(session.userId);
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(balances);
});

app.post("/expenses/add", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (not numbers)
    let expense = req.body.expense;
    if (!utils.isExpenseValid(expense))
    {
        res.status(400);
        res.send();
        return;
    }
    // Add the expense to the database
    const session = req.session as SessionData
    const doc = await db.expenses.insertNew(
        session.userId, expense.date, expense.amount, expense.is_expense,
        expense.notes, expense.payment_type, expense.category_tag
    );
    // Check if the document was inserted successfully. Send
    // status code 500 (Internal Server Error) if it failed
    if (doc === null)
    {
        res.status(500);
        res.send();
        return;
    }
    // Send status code 200 (OK)
    res.status(200);
    res.send();
});

app.post("/expenses/get", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Retrieve the expenses for a full year
    let year = [];
    let reference_date = new Date(Date.now());
    const session = req.session as SessionData
    for (let i = 0; i <= 12; i++) {
        // Get the expenses from the database for the desired month and add them to the year array
        const expenses = await db.expenses.getMonthlyExpensesByUserId(session.userId, reference_date);
        year.push(expenses);
        // Go to the next month
        reference_date = utils.decrementDateByOneMonth(reference_date);
    }
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(year);
});

app.post("/expenses/delete", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Delete the requested expense
    const expense = req.body.expense;
    const session = req.session as SessionData
    const del_res = await db.expenses.deleteExpenseByData(session.userId, expense.date, expense.amount, expense.is_expense);
    // Check if the document was deleted successfully. Send
    // status code 500 (Internal Server Error) if it failed
    if (del_res === null || del_res.deletedCount !== 1)
    {
        res.status(500);
        res.send();
        return;
    }
    // Send status code 200 (OK)
    res.status(200);
    res.send();
});

app.post("/tags/get", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Get all the tags from the database
    let tags: any = {}
    for (let tag_type of Object.keys(db.tags.TagType))
    {
        // @ts-ignore
        const tag_type_name = db.tags.TagType[tag_type].name;
        // @ts-ignore
        const tag_type_value = db.tags.TagType[tag_type].value;
        const tags_of_type = await db.tags.getAllTagsByType(tag_type_value);
        tags[tag_type_name] = tags_of_type;
    }
    // Send the array of tags to the client with status code 200 (OK)
    res.status(200);
    res.json(tags);
});

app.post("/rank/balances", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // If the user is of test/demo type, assign some random values
    const session = req.session as SessionData
    const target_user = session.userId;
    const user_type = await db.users.getTypeOfUserId(target_user);
    if (user_type === null || user_type.type >= db.users.UserType.test.value)
    {
        const fake_balances = [
            {user: "0"}, {user: "1"}, {user: target_user}, {user: "2"}
        ];
        const fake_rank = utils.computeRankOfUser(fake_balances, target_user);
        res.status(200);
        res.json(fake_rank);
        return;
    }
    // Check if the ranking is requested among all users or only similar users
    let reference_user = undefined;
    if (req.body.similar)
        reference_user = target_user;
    // Get the list of all/similar users IDs
    const users = await db.users.getAllUsersIds(reference_user, true);
    // For each user get its latest balance up to the last day of the last month
    let now = new Date(Date.now());
    let limit_date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()));
    let balances = [];
    for (let user of users) {
        const balance = await db.balances.getTotalLatestByUserId(user.userId, limit_date);
        if (balance !== null)
            balances.push({user: user.userId, balance: balance});
    }
    // Sort the array of balances to get the rank of the user
    balances.sort((a, b) => a.balance - b.balance);
    const rank = utils.computeRankOfUser(balances, target_user);
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(rank);
});

app.post("/rank/expenses", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // If the user is of test/demo type, assign some random values
    const session = req.session as SessionData
    const target_user = session.userId;
    const user_type = await db.users.getTypeOfUserId(target_user);
    if (user_type === null || user_type.type >= db.users.UserType.test.value)
    {
        const fake_expenses = [
            {user: "0"}, {user: target_user}, {user: "1"}, {user: "2"}
        ];
        const fake_rank = utils.computeRankOfUser(fake_expenses, target_user);
        res.status(200);
        res.json(fake_rank);
        return;
    }
    // Check if the ranking is requested among all users or only similar users
    let reference_user = undefined;
    if (req.body.similar)
        reference_user = target_user;
    // Get the list of all/similar users IDs
    const users = await db.users.getAllUsersIds(reference_user, true);
    // For each user get the expenses/incomes of the last month
    let reference_date = new Date(Date.now()); reference_date.setUTCMonth(reference_date.getUTCMonth()-1);
    let is_expense_filter = Boolean(req.body.expenses);
    let expenses = [];
    for (let user of users) {
        const total_amount = await db.expenses.getTotalMonthlyExpensesByUserId(user.userId, reference_date, is_expense_filter);
        if (total_amount !== null)
            expenses.push({user: user.userId, amount: total_amount});
    }
    // Sort the array of expenses to get the rank of the user
    expenses.sort((a, b) => a.amount - b.amount);
    const rank = utils.computeRankOfUser(expenses, target_user);
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(rank);
});

app.get("/prices/:key", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Check if the price key is valid is valid. Send status 404
    // (Not Found) if it's not valid
    const key = req.params.key;
    if (!["crypto"].includes(key))
    {
        res.status(404);
        res.send();
        return;
    }
    // Retrieve the cached value and send it to the client with status code 200 (OK)
    const value = cache.get(key);
    res.status(200);
    res.json(value);
});

app.get("/*", (req, res) => {
    // Refresh handler
    res.sendFile(path.join(__dirname, "../../build/index.html"));
    // res.redirect("/");
});

db.connect(process.env.DB_URI || "")
    .then(async () => {
        console.log("Connected to DB");
        await cache.init();
        jobs.init();
    })
    .catch((err: any) => {
        console.error(err);
        process.exit(1);
    });

// Start the server
app.listen(process.env.PORT || 3000, () => {
    console.log("Server is listening...");
}).on('error', (err) => {
    console.error("Startup error:\n", err);
    process.exit(1);
})