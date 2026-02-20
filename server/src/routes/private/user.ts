import express from "express"
import { SessionData } from "express-session"

import { ExtDate } from "../../libs/datelib"

import db from "../../db/mongo"
import common from "../common"

/* === /user/* === */

const userRouter = express.Router()

userRouter.post("/logout", async (req, res) => {
    // Invalidate the session 
    req.session.destroy((err: any) => {})
    // Send status code 200 (OK)
    res.status(200)
    res.send()
})

userRouter.post("/delete", async (req, res) => {
    // Check if the user has the right to delete the account.
    // Send status code 403 (Forbidden) if it doesn't
    const session = req.session as SessionData
    const type = await db.users.getTypeOfUserId(session.userId)
    if (type === null || type.type >= db.users.UserType.test.value)
    {
        res.status(403)
        res.send()
        return
    }
    // Add the user to the deletion queue with a deletion delay
    const deletion_delay_days = 30
    let deletion_date = ExtDate.fromNow()
    deletion_date.moveByDays(deletion_delay_days)
    const doc = await db.delqueue.insertNew(session.userId, deletion_date)
    // Check if the document was inserted successfully. Send
    // status code 500 (Internal Server Error) if it failed
    if (doc === null)
    {
        res.status(500)
        res.send()
        return
    }
    // If the document is correctly added, force the logout (redirect to /logout route)
    res.redirect(307, "logout")
})

userRouter.post("/set-id", async (req, res) => {
    // Check if the user has the right to change ID.
    // Send status code 403 (Forbidden) if it doesn't
    const session = req.session as SessionData
    const type = await db.users.getTypeOfUserId(session.userId)
    if (type === null || type.type === db.users.UserType.demo.value)
    {
        res.status(403)
        res.send()
        return
    }
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (empty strings after sanitization)
    let password = common.sanitizeInput(req.body.password)
    if (password === "")
    {
        res.status(400)
        res.send()
        return
    }
    // Check if the user exists in the db. Send status code 401
    // (Unauthorized) if the user does not exist
    const user = await db.users.getPasswordByUserId(session.userId)
    if (user === null)
    {
        res.status(401)
        res.send()
        return
    }
    // Check if the password is correct. Send status code 401
    // (Unauthorized) if the password is wrong
    if (!common.checkPassword(password, user.password))
    {
        res.status(401)
        res.send()
        return
    }
    // Invalidate the session
    const curr_user_id = session.userId
    req.session.destroy((err: any) => {})
    // Generate a new random user ID and update the corresponding User document.
    // Send status code 500 (Internal Server Error) in case of failure
    const new_user_id = await common.generateUserId(db.users.userIdLength)
    const result = await db.users.setUserIdByUserId(curr_user_id, new_user_id)
    if (result === null)
    {
        console.log(`Failed to change ID of user ${curr_user_id} to ${new_user_id}`)
        res.status(500).send()
        return
    }
    // Send the new user ID to the cliend with status code 200 (OK)
    console.log(`Changed ID of user ${curr_user_id} to ${new_user_id}`)
    res.status(200)
    res.json({new_id: new_user_id})
})

userRouter.post("/set-password", async (req, res) => {
    // Check if the user has the right to change password.
    // Send status code 403 (Forbidden) if it doesn't
    const session = req.session as SessionData
    const type = await db.users.getTypeOfUserId(session.userId)
    if (type === null || type.type === db.users.UserType.demo.value)
    {
        res.status(403)
        res.send()
        return
    }
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (empty strings after sanitization)
    let old_pwd = req.body.old_pwd
    let new_pwd = req.body.new_pwd
    let repeated_pwd = req.body.repeated_pwd
    old_pwd = common.sanitizeInput(old_pwd)
    new_pwd = common.sanitizeInput(new_pwd)
    repeated_pwd = common.sanitizeInput(repeated_pwd)
    if (old_pwd === "" || new_pwd === "" || repeated_pwd === "")
    {
        res.status(400)
        res.send()
        return
    }
    // Check if the new password and the repeated new password are the same
    // Send status code 403 (Forbidden) in case of inequality
    if (new_pwd !== repeated_pwd)
    {
        res.status(403)
        res.send()
        return
    }
    // Check if the user exists in the db. Send status code 401
    // (Unauthorized) if the user does not exist
    const user = await db.users.getPasswordByUserId(session.userId)
    if (user === null)
    {
        res.status(401)
        res.send()
        return
    }
    // Check if the password is correct. Send status code 401
    // (Unauthorized) if the password is wrong
    if (!common.checkPassword(old_pwd, user.password))
    {
        res.status(401)
        res.send()
        return
    }
    // The old password is correct and the new passwords are equal:
    // hash the new password and store it in the db
    // Then, force the logout (redirect to /logout route)
    let hashed_new_pwd = common.hashPassword(new_pwd, Number.parseInt(process.env.SALT_ROUNDS || "1"))
    await db.users.setPasswordOfUserId(session.userId, hashed_new_pwd)
    res.redirect(307, "logout")
})

userRouter.post("/get", async (req, res) => {
    // Get the user's public information
    const session = req.session as SessionData
    const user = await db.users.getPublicInfoByUserId(session.userId)
    // Send the data to the client with status code 200 (OK)
    res.status(200)
    res.json(user)
})

userRouter.post("/set", async(req, res) => {
    // Set the user's new public data
    const session = req.session as SessionData
    const doc = await db.users.setPublicInfoOfUserId(
        session.userId, req.body.age, req.body.living_situation, req.body.housing_type,
        req.body.children, req.body.country, req.body.job, req.body.job_type,
        req.body.job_country, req.body.work_time, req.body.remote_type,
        req.body.years_of_experience, req.body.preferred_currency
    )
    // Check if the document was inserted successfully. Send
    // status code 500 (Internal Server Error) if it failed
    if (doc === null)
    {
        res.status(500)
        res.send()
        return
    }
    // Send status code 200 (OK)
    res.status(200)
    res.send()
})

userRouter.post("/goals", async (req, res) => {
    // Set the users's goals and limits
    const session = req.session as SessionData
    let expensesLimit = req.body.expenses_limit
    let savingsPercent = req.body.savings_percent
    let emergencyFundGoal = req.body.emergency_fund_goal
    if (expensesLimit < 0)
        expensesLimit = -1
    if (savingsPercent < 0)
        savingsPercent = -1
    else if (savingsPercent > 100)
        savingsPercent = 100
    if (emergencyFundGoal < 0)
        emergencyFundGoal = -1
    const doc = await db.users.setGoalsOfUserId(
        session.userId, expensesLimit, savingsPercent, emergencyFundGoal
    )
    // Check if the document was inserted successfully. Send
    // status code 500 (Internal Server Error) if it failed
    if (doc === null)
    {
        res.status(500)
        res.send()
        return
    }
    // Send status code 200 (OK)
    res.status(200)
    res.send()
})

userRouter.post("/alldata", async (req, res) => {
    const session = req.session as SessionData
    // Get all user's data. Return status 500 (Internal Server Error) if any
    // of the query fails
    const user = await db.users.getPublicInfoByUserId(session.userId)
    const balances = await db.balances.getAllByUserId(session.userId)
    const expenses = await db.expenses.getAllByUserId(session.userId)
    if (user === null || balances === null || expenses === null)
    {
        res.status(500).send()
        return
    }
    // Build the final object
    const userData = {
        user: {
            userId: user.userId,
            creationDate: user.creationDate,
            age: (user.age as any).label,
            livingSituation: (user.livingSituation as any).label,
            housingType: (user.housingType as any).label,
            children: (user.children as any).label,
            country: (user.country as any).label,
            job: (user.job as any).label,
            jobType: (user.jobType as any).label,
            jobCountry: (user.jobCountry as any).label,
            workTime: (user.workTime as any).label,
            remoteType: (user.remoteType as any).label,
            yearsOfExperience: (user.yearsOfExperience as any).label
        },

        balances: balances.map((balance) => {
            return {
                date: balance.date,
                userDate: balance.userDate,
                bank: balance.bank,
                cash: balance.cash,
                digitalServices: balance.digitalServices,
                stocks: balance.stocks,
                etf: balance.etf,
                bitcoin: balance.bitcoin,
                crypto: balance.crypto
            }
        }),

        expenses: expenses.map((expense) => {
            return {
                date: expense.date,
                amount: expense.amount,
                isExpense: expense.isExpense,
                notes: expense.notes,
                paymentType: (expense.paymentType as any).label,
                categoryTag: (expense.categoryTag as any).label
            }
        })
    }
    // Send the data with status code 200 (OK)
    res.status(200).json(userData)
})

export default userRouter