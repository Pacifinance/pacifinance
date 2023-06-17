const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const db = require("./db/mongo.js");
const utils = require("./utils.js");

const day_ms = 24 * 60 * 60 * 1000;

/* ==================== Express.js server initialization ==================== */

const app = express();
app.use(cookieParser());
app.use(session({
    name: '__session',
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
    cookie: {maxAge: day_ms}
}));
app.use(express.static("build"));
app.use(express.json());

/* ============================ Express.js routes ============================ */

async function checkUserSession(session) {
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
    const session_id = utils.generateSessionId();
    const now = new Date(Date.now());
    const expiration_date = utils.incrementDateByOneDay(now);
    // Add the user ID and session information to the cookie
    req.session.userId = user_id;
    req.session.sessionId = session_id;
    req.session.expirationDate = expiration_date;
    // Add the session information to the database
    await db.users.setSessionOfUserId(user_id, session_id, expiration_date);
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
    await db.users.setSessionOfUserId(req.session.userId, "0", new Date(0));
    // Destroy the session
    req.session.destroy();
    // Send status code 200 (OK)
    res.status(200);
    res.send();
});

app.post("/pwdchange", async (req, res) => {
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
    // The new passwords are equal: hash the new password and store it in the db
    // Then, force the logout (redirect to /logout route)
    let hashed_new_pwd = utils.hashPassword(new_pwd, process.env.SALT_ROUNDS);
    await db.users.setPasswordOfUserId(req.session.userId, hashed_new_pwd);
    res.redirect("logout");
});

app.get("/balances/get", async (req, res) => {
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
    const balances = await db.balances.getYearlyBalanceByUserId(req.session.userId);
    let balances_data = [];
    for (let balance of balances)
        balances_data.push(balance);
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(balances_data);
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
    // Check if the user has the rights to insert its balance.
    // Send status code 403 (Forbidden) if it has no rights
    const user = await db.users.getRightsByUserId(req.session.userId);
    if (user === null || !user.insertRights)
    {
        res.status(403);
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
    // Add the balance to the database and send status code 200 (OK)
    await db.balances.insertNew(
        req.session.userId, Date.now(), balance.stocks.real, balance.stocks.invested,
        balance.bank, balance.cash, balance.crypto.real, balance.crypto.invested
    );
    res.status(200);
    res.send();
});

app.get("/leaderboards", async (req, res) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }
    // Get the list of all users
    const users = await db.users.getAllUsersIds();
    // For each user get its latest balance
    let balances = [];
    for (let user of users)
    {
        const balance = await db.balances.getLatestByUserId(user.userId);
        if (balance !== null)
            balances.push(balance);
    }
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(balances);
});

app.listen(process.env.PORT, () => {
    console.log("Server is listening");
    db.connect(process.env.DB_URI)
        .then(() => {
            console.log("Connected to DB");
        })
        .catch(() => {
            console.log("Cannot connect to DB: exiting");
            process.exit(1);
        });
});
