import { Request, Response, CookieOptions } from "express"
import { Session } from "@supabase/supabase-js"

const ACCESS_COOKIE = "sb-access-token"
const REFRESH_COOKIE = "sb-refresh-token"

const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const baseCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
}

/**
 * Sets the Supabase Auth access/refresh tokens as httpOnly cookies on the response
 * @param res Express response
 * @param session Supabase Auth session returned by signInWithPassword/refreshSession
 */
function setAuthCookies(res: Response, session: Session) {
    const accessMaxAge = (session.expires_in || 3600) * 1000
    res.cookie(ACCESS_COOKIE, session.access_token, {...baseCookieOptions, maxAge: accessMaxAge})
    res.cookie(REFRESH_COOKIE, session.refresh_token, {...baseCookieOptions, maxAge: REFRESH_MAX_AGE_MS})
}

/**
 * Clears the Supabase Auth cookies, effectively logging out the user
 * @param res Express response
 */
function clearAuthCookies(res: Response) {
    res.clearCookie(ACCESS_COOKIE, baseCookieOptions)
    res.clearCookie(REFRESH_COOKIE, baseCookieOptions)
}

/**
 * Reads the Supabase Auth tokens from the request cookies
 * @param req Express request
 */
function getAuthCookies(req: Request) {
    return {
        accessToken: req.cookies?.[ACCESS_COOKIE] as string | undefined,
        refreshToken: req.cookies?.[REFRESH_COOKIE] as string | undefined
    }
}

export default {setAuthCookies, clearAuthCookies, getAuthCookies}
