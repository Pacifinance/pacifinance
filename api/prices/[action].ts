import type { VercelRequest, VercelResponse } from "@vercel/node"

import app from "../../server/src/index"

export default async function (req: VercelRequest, res: VercelResponse) {
    return app(req, res)
}
