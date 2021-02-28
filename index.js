'use strict';

const { fetchActivityTimes } = require('./strava_utils');
const { createJiraIssue, logMovetime } = require('./jira_utils');
const { configure, getLogger } = require("log4js");
// TODO: ロガー設定の共通化
// logger
const logger = getLogger();
logger.level = 'info';
// TODO: デバッグログ表示
// logger.level = 'debug';
configure({
    appenders: { log: { type: "file", filename: "logs/app.log" } },
    categories: { default: { appenders: ["log"], level: "info" } }
});

const reducer = (accumulator, currentValue) => accumulator + currentValue;
const main = async () => {
    const moveTimes = await fetchActivityTimes();
    if (!moveTimes.length) {
        logger.info('Strava activity data is not found.');
        return;
    }
    const sumMoveTimes = await moveTimes.reduce(reducer);
    const createdIssueKey = await createJiraIssue();
    await logMovetime(createdIssueKey, sumMoveTimes);
};

main();
