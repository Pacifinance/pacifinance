import express from "express"
import { SessionData } from "express-session"

import db from "../../db/mongo"
import common from "../common"

/* === /user/* === */

const userRouter = express.Router()

userRouter.use(common.checkSessionMiddleware)

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
    let deletion_date = new Date(Date.now())
    deletion_date.setUTCDate(deletion_date.getUTCDate() + deletion_delay_days)
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
    res.redirect(307, "../logout")
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
    // Invalidate the session in the database by setting the
    // expiration date to 01/01/1970 and an invalid ID
    const curr_user_id = session.userId
    await db.users.setSessionOfUserId(curr_user_id, curr_user_id, new Date(0))
    // Destroy the session
    req.session.destroy((err: any) => {})
    // Generate a new random user ID and update the corresponding User document
    const new_user_id = await common.generateUserId()
    await db.users.setUserIdByUserId(curr_user_id, new_user_id)
    // Send the new user ID to the cliend with status code 200 (OK)
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
    res.redirect(307, "../logout")
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
        session.userId, req.body.country, req.body.job, req.body.job_type,
        req.body.job_country, req.body.work_time, req.body.remote_type
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

export default userRouter