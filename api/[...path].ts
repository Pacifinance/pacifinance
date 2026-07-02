import type { VercelRequest, VercelResponse } from "@vercel/node"
import serverless from "serverless-http"

import app from "../server/src/index"

const handler = serverless(app)

/**
 * Vercel serverless entrypoint: wraps the existing Express app (lift-and-shift)
 * as a single catch-all function serving everything under /api/*.
 */
export default async function (req: VercelRequest, res: VercelResponse) {
    return handler(req, res)
}
