import type { NextFunction, Request, Response } from "express"

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

function hostnameOf(headerValue: string | undefined): string | null {
    if (!headerValue) return null
    try {
        return new URL(headerValue).hostname
    } catch {
        return null
    }
}

/**
 * Lightweight CSRF defense for a cookie-authenticated API: for any
 * state-changing request, the browser-supplied Origin (falling back to
 * Referer) must match the host this request actually arrived on. This is
 * the OWASP-recommended approach for cookie-auth JSON APIs and needs no
 * token/session-storage machinery (unlike the deprecated `csurf` package);
 * it complements, rather than replaces, the `sameSite: "lax"` already set
 * on the auth cookies in authCookies.ts.
 *
 * Deliberately reads the expected host from the request itself
 * (`req.hostname`, correct behind Vercel's proxy since `trust proxy` is set)
 * instead of an env var - this makes it correct automatically for both the
 * hosted deployment and any self-hosted domain, with zero configuration.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
    if (SAFE_METHODS.has(req.method)) {
        next()
        return
    }

    const originHostname = hostnameOf(req.headers.origin) ?? hostnameOf(req.headers.referer)
    if (!originHostname || originHostname !== req.hostname) {
        res.status(403).send()
        return
    }

    next()
}

export default csrfProtection
