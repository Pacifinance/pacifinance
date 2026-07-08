import type { VercelRequest, VercelResponse } from "@vercel/node"

import app from "../../server/src/index"

/**
 * Explicit Vercel route for the dependency health check. The catch-all API
 * route handles this locally, but this keeps the nested production URL stable.
 */
export default async function (req: VercelRequest, res: VercelResponse) {
    return app(req, res)
}
