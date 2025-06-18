import { CronJob } from "cron";
import usersdel from "./functions/usersdel.js";
import cacheup from "./functions/cacheup.js";

const timezone = "Europe/Berlin";

function init() {
    // User accounts deletion
    new CronJob(
        "0 1 * * *",                // at 01:00
        usersdel.deleteUsersJob,
        null,
        true,
        timezone
    );

    // Cache periodic refresh
    new CronJob(
        "* * * * *",                // every minute
        cacheup.checkAndUpdateCache,
        null,
        true,
        timezone
    );
}

export default {init};