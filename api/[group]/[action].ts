import type { VercelRequest, VercelResponse } from "@vercel/node"

import app from "../../../server/src/index"

/**
 * Vercel entrypoint for nested API URLs such as /api/tags/get and /api/user/get.
 * The Express app owns the actual routing and authorization logic.
 */
export default async function (req: VercelRequest, res: VercelResponse) {
    return app(req, res)
}
