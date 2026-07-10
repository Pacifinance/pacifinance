import type { VercelRequest, VercelResponse } from "@vercel/node"

import app from "../server/src/index"

/**
 * Single Vercel serverless function for the entire Express backend. Vercel
 * Hobby caps a deployment at 12 serverless functions; every /api/* request is
 * routed here via the rewrite in vercel.json (not via a [...path] filesystem
 * catch-all - a previous per-domain-file layout intermittently 404'd on some
 * nested routes at the platform level, before ever reaching Express). Vercel
 * already provides plain Node req/res objects, so the Express app can handle
 * them directly.
 */
export default async function (req: VercelRequest, res: VercelResponse) {
    return app(req, res)
}
