import express from "express"

import cache from "../../cache/cache";
import common from "../common";

/* === /stats/* === */

const statsRouter = express.Router()

statsRouter.use(common.checkSessionMiddleware)

statsRouter.get("/averages", async (req, res) => {
    // Retrieve the cached value and send it to the client with status code 200 (OK)
    const value = cache.get("userAverages");
    res.status(200);
    res.json(value);
});

export default statsRouter