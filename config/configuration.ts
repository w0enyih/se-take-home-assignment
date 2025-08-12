import * as path from "path";

export default () => ({
    bot: {
        processingTimeInMS: process.env.BOT_PROCESSING_TIME_MS
    },
    dispatcher: {
        sleepInMS: process.env.DISPATCHER_SLEEP_TIME_MS
    }
});
