import type { VercelRequest, VercelResponse } from "@vercel/node"

import app from "../server/src/index"

/**
 * Vercel Node.js entrypoint: Vercel already provides Node req/res objects, so
 * the Express app can handle them directly.
 */
export default async function (req: VercelRequest, res: VercelResponse) {
    return app(req, res)
}
