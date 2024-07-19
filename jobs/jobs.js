const cron = require("cron");
const usersdel = require("./functions/usersdel.js");
const cacheup = require("./functions/cacheup.js");

const timezone = "Europe/Berlin";

function init() {
    // User accounts deletion
    new cron.CronJob(
        "0 1 * * *",                // at 01:00
        usersdel.deleteUsersJob,
        null,
        true,
        timezone
    );

    // Cache periodic refresh
    new cron.CronJob(
        "* * * * *",                // every minute
        cacheup.checkAndUpdateCache,
        null,
        true,
        timezone
    );
}

module.exports = {init};