import express from "express"
import { SessionData } from "express-session"

import db from "../../db/mongo"
import common from "../common"

/* === /logout === */

const logoutRouter = express.Router()

logoutRouter.use(common.checkSessionMiddleware)

logoutRouter.post("/logout", async (req, res) => {
    // Invalidate the session in the database by setting the
    // expiration date to 01/01/1970 and an invalid ID
    const session = req.session as SessionData
    await db.users.setSessionOfUserId(session.userId, session.userId, new Date(0))
    // Destroy the session
    req.session.destroy((err: any) => {})
    // Send status code 200 (OK)
    res.status(200)
    res.send()
})

export default logoutRouter