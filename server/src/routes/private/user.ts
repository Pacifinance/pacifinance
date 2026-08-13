import express from "express"

import { ExtDate } from "../../libs/datelib"

import db from "../../db/db"
import common from "../common"
import authCookies from "../authCookies"
import supabase from "../../db/supabase"
import { generateRecoveryCode, hashRecoveryCode } from "../../db/recoveryCode"
import { logger } from "../../libs/logger"
import { USER_DATA_DOMAINS } from "../../libs/userDataDomains"

/* === /user/* === */

const userRouter = express.Router()

userRouter.post("/logout", async (req, res) => {
    // Best-effort revoke of the refresh token on Supabase's side; the cookies
    // are cleared regardless, which is what actually ends the session client-side
    const {accessToken} = authCookies.getAuthCookies(req)
    if (accessToken)
        await supabase.auth.admin.signOut(accessToken).catch(() => {})
    authCookies.clearAuthCookies(res)
    // Send status code 200 (OK)
    res.status(200)
    res.send()
})

userRouter.post("/delete", async (req, res) => {
    // Check if the user has the right to delete the account.
    // Send status code 403 (Forbidden) if it doesn't
    const userId = req.userId as string
    const type = await db.users.getTypeOfUserId(userId)
    if (type === null || type.type >= db.users.UserType.test.value)
    {
        res.status(403)
        res.send()
        return
    }
    // Add the user to the deletion queue with a deletion delay
    const deletion_delay_days = 30
    const deletion_date = ExtDate.fromNow()
    deletion_date.moveByDays(deletion_delay_days)
    const doc = await db.delqueue.insertNew(userId, deletion_date)
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
    const userId = req.userId as string
    const type = await db.users.getTypeOfUserId(userId)
    if (type === null || type.type === db.users.UserType.demo.value)
    {
        res.status(403)
        res.send()
        return
    }
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (empty strings after sanitization)
    const password = common.sanitizeInput(req.body.password)
    if (password === "")
    {
        res.status(400)
        res.send()
        return
    }
    // Check if the password is correct. Send status code 401
    // (Unauthorized) if the password is wrong
    if (!(await db.users.verifyPassword(userId, password)))
    {
        res.status(401)
        res.send()
        return
    }
    // Generate a new random public user ID and update the corresponding profile
    // (and the internal synthetic email). Send status code 500 (Internal Server
    // Error) in case of failure
    const new_user_id = await common.generateUserId(db.users.userIdLength)
    const result = await db.users.setUserIdByUserId(userId, new_user_id)
    if (result === null)
    {
        logger.info(`Failed to change ID of user ${userId} to ${new_user_id}`)
        res.status(500).send()
        return
    }
    // Force the logout: the client must log back in with the new ID
    authCookies.clearAuthCookies(res)
    // Send the new user ID to the client with status code 200 (OK)
    logger.info(`Changed ID of user ${userId} to ${new_user_id}`)
    res.status(200)
    res.json({new_id: new_user_id})
})

userRouter.post("/set-password", async (req, res) => {
    // Check if the user has the right to change password.
    // Send status code 403 (Forbidden) if it doesn't
    const userId = req.userId as string
    const type = await db.users.getTypeOfUserId(userId)
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
    // Check if the old password is correct. Send status code 401
    // (Unauthorized) if the password is wrong
    if (!(await db.users.verifyPassword(userId, old_pwd)))
    {
        res.status(401)
        res.send()
        return
    }
    // The old password is correct and the new passwords are equal:
    // update it via the Supabase Auth Admin API, then force the logout
    await db.users.setPasswordOfUserId(userId, new_pwd)
    res.redirect(307, "logout")
})

userRouter.post("/recovery-code/generate", async (req, res) => {
    // Check if the user has the right to generate a recovery code.
    // Send status code 403 (Forbidden) if it doesn't
    const userId = req.userId as string
    const type = await db.users.getTypeOfUserId(userId)
    if (type === null || type.type === db.users.UserType.demo.value)
    {
        res.status(403)
        res.send()
        return
    }
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (empty strings after sanitization)
    const password = common.sanitizeInput(req.body?.password)
    if (password === "")
    {
        res.status(400)
        res.send()
        return
    }
    // Check if the password is correct. Send status code 401
    // (Unauthorized) if the password is wrong
    if (!(await db.users.verifyPassword(userId, password)))
    {
        res.status(401)
        res.send()
        return
    }
    // Generate a fresh code — this always overwrites (invalidates) any
    // previous one, whether this is a first-time generation (existing
    // account created before this feature) or an explicit regeneration.
    const recoveryCode = generateRecoveryCode()
    const saved = await db.users.setRecoveryCodeHash(userId, hashRecoveryCode(recoveryCode.bytes))
    if (saved === null)
    {
        res.status(500).send()
        return
    }
    // Shown once, exactly like at registration — only the hash persists.
    res.status(200)
    res.json({
        recovery_code_base32: recoveryCode.base32,
        recovery_code_words: recoveryCode.words,
    })
})

userRouter.post("/recovery-code/status", async (req, res) => {
    const userId = req.userId as string
    const status = await db.users.getRecoveryCodeStatusByUserId(userId)
    if (status === null)
    {
        res.status(500).send()
        return
    }
    res.status(200)
    res.json({
        configured: status.configured,
        generated_at: status.generatedAt,
    })
})

userRouter.post("/get", async (req, res) => {
    // Get the user's public information
    const user = await db.users.getPublicInfoByUserId(req.userId as string)
    // Send the data to the client with status code 200 (OK)
    res.status(200)
    res.json(user)
})

userRouter.post("/set", async(req, res) => {
    // Set the user's new public data
    const doc = await db.users.setPublicInfoOfUserId(
        req.userId as string, req.body.age, req.body.living_situation, req.body.housing_type,
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

/** Opt in or revoke participation in hosted anonymous community benchmarks. */
userRouter.post("/benchmark-consent", async (req, res) => {
    if (typeof req.body?.contribute !== "boolean") {
        res.status(400).send()
        return
    }
    const userId = req.userId as string
    const result = await db.users.setBenchmarkConsentByUserId(userId, req.body.contribute)
    if (result === null) {
        res.status(500).send()
        return
    }

    // Revocation deletes the user's persisted profile buckets immediately.
    // Cached aggregates expire naturally; no transaction or note is stored in
    // this benchmark layer at any point.
    if (!req.body.contribute)
        await db.benchmarkSnapshots.deleteProfilesByUserId(userId)
    res.status(200).json(result)
})

/** Overwrites the set of gamification badge IDs already notified to the user. */
userRouter.post("/seen-badges", async (req, res) => {
    const badgeIds = req.body?.badge_ids
    if (!Array.isArray(badgeIds) || !badgeIds.every((id) => typeof id === "string")) {
        res.status(400).send()
        return
    }
    const result = await db.users.setSeenBadgesByUserId(req.userId as string, badgeIds)
    if (result === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(result)
})

userRouter.post("/goals", async (req, res) => {
    // Set the users's goals and limits
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
    const optionalNumber = (key: string, max?: number): number | null | undefined => {
        const raw = req.body[key]
        if (raw === undefined || raw === null || raw === "") return null
        const value = Number(raw)
        if (!Number.isFinite(value) || value < 0 || (max !== undefined && value > max)) return undefined
        return value
    }
    const categoryLimitsRaw = req.body.category_spending_limits ?? {}
    const categorySpendingLimits = typeof categoryLimitsRaw === "object" && !Array.isArray(categoryLimitsRaw)
        ? Object.fromEntries(Object.entries(categoryLimitsRaw).filter(([key, value]) =>
            key.length <= 80 && Number.isFinite(Number(value)) && Number(value) >= 0,
        ).map(([key, value]) => [common.sanitizeInput(key), Number(value)]))
        : null
    const controls = {
        expensesLimit,
        savingsPercent,
        emergencyFundGoal,
        expensesLimitPercent: optionalNumber("expenses_limit_percent", 100),
        expensesLimitPercentEnabled: req.body.expenses_limit_percent_enabled !== false,
        savingsAmountGoal: optionalNumber("savings_amount_goal"),
        savingsAmountGoalEnabled: req.body.savings_amount_goal_enabled !== false,
        emergencyFundMonths: optionalNumber("emergency_fund_months"),
        emergencyFundMonthsEnabled: req.body.emergency_fund_months_enabled !== false,
        fixedExpensesPercent: optionalNumber("fixed_expenses_percent", 100),
        categorySpendingLimits,
        debtReductionGoal: optionalNumber("debt_reduction_goal"),
        positionConcentrationLimit: optionalNumber("position_concentration_limit", 100),
        assetCategoryConcentrationLimit: optionalNumber("asset_category_concentration_limit", 100),
        annualPassiveIncomeGoal: optionalNumber("annual_passive_income_goal"),
    }
    if (Object.values(controls).some((value) => value === undefined) || categorySpendingLimits === null) {
        res.status(400).send()
        return
    }
    const doc = await db.users.setGoalsOfUserId(
        req.userId as string,
        controls as import("../../db/models/users").FinancialControlsInput,
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

/**
 * GDPR data-export endpoint: returns every domain of the user's own data,
 * driven by USER_DATA_DOMAINS (server/src/libs/userDataDomains.ts) so a new
 * domain only has to be registered once to be included here automatically
 * (and to be caught by server/__tests__/userDataDomains.test.ts if it isn't).
 * Only a failed `profile` fetch (the one domain whose model returns null on
 * error, not an empty array) fails the whole request — every other domain
 * degrades to an empty result the same way its own feature pages already do,
 * consistent with how the rest of this codebase treats list-getter failures.
 */
userRouter.post("/alldata", async (req, res) => {
    const userId = req.userId as string
    const entries = await Promise.all(
        USER_DATA_DOMAINS.map(async (domain) => [domain.key, await domain.fetch(userId)] as const),
    )
    const userData = Object.fromEntries(entries) as Record<string, unknown>
    if (userData.profile === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(userData)
})

export default userRouter
