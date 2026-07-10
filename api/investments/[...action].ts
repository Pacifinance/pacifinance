import type { VercelRequest, VercelResponse } from "@vercel/node"

import app from "../../server/src/index"

/**
 * Catch-all (not a single [action] segment like the other api/<domain> files):
 * investments routes nest two levels deep (/instruments/search, /holdings/get,
 * /holdings/save, ...), so a single dynamic segment wouldn't match them.
 */
export default async function (req: VercelRequest, res: VercelResponse) {
    return app(req, res)
}
