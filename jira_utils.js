'use strict';
const axios = require('axios');

const { configure, getLogger } = require("log4js");
// logger
const logger = getLogger();
logger.level = 'info';
// TODO: debug mode
// logger.level = 'debug';
configure({
    appenders: { log: { type: "file", filename: "logs/app.log" } },
    categories: { default: { appenders: ["log"], level: "info" } }
});

// load params
require('dotenv').config();
const jiraUser = process.env.JIRA_AUTH_USER || null;
const jiraToken = process.env.JIRA_AUTH_TOKEN || null;
const jiraSpace = process.env.JIRA_SPACE || null;
const parentIssueKey = process.env.JIRA_PARENT_ISSUE_KEY || null;
const jiraAssignee = process.env.JIRA_USER_ID || null;
const jiraBaseUrl = `https://${jiraSpace}.atlassian.net/rest/api/3`;
const jiraAgileBaseUrl = `https://${jiraSpace}.atlassian.net/rest/agile/1.0`;

const createJiraIssue = async (issueSummary = 'Strava', parentKey = parentIssueKey, issueTypeId = '10001', projectId = '10000', reporterId = jiraAssignee, assigneeId = jiraAssignee) => {
    const url = jiraBaseUrl + '/issue';
    const bodyData = {
        "fields": {
            "summary": issueSummary,
            "parent": {
                "key": parentKey
            },
            "issuetype": {
                "id": issueTypeId
            },
            "project": {
                "id": projectId
            },
            "reporter": {
                "id": reporterId
            },
            "assignee": {
                "id": assigneeId
            }
        }
    };

    try {
        const res = await axios.post(url, JSON.stringify(bodyData), {
            auth: {
                username: jiraUser,
                password: jiraToken
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const issueKey = res.data.key;
        const activeSprintId = await getActiveSprintId();
        await moveIssueActiveSprint(activeSprintId, issueKey);
        await moveIssueDone(issueKey);
        return issueKey;
    } catch (err) {
        logger.error(err);
    }

};

const logMovetime = async (issueKey, moveTime) => {
    const url = jiraBaseUrl + `/issue/${issueKey}/worklog`;
    const bodyData = {
        "timeSpentSeconds": moveTime
    };

    try {
        const res = await axios.post(url, JSON.stringify(bodyData), {
            auth: {
                username: jiraUser,
                password: jiraToken
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        await logger.debug(res.data);
    } catch (err) {
        logger.error(err);
    }
};

const getActiveSprintId = async () => {
    const url = jiraAgileBaseUrl + `/board/1/sprint?state=active`;

    try {
        const res = await axios.get(url, {
            auth: {
                username: jiraUser,
                password: jiraToken
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        await logeer.info('active sprint id: ', res.data.values[0].id);
        return res.data.values[0].id;
    } catch (err) {
        logger.error(err);
    }

};

const moveIssueActiveSprint = async (sprintId, issueKey) => {
    const url = jiraAgileBaseUrl + `/sprint/${sprintId}/issue`;
    const bodyData = {
        "issues": [
            issueKey
        ]
    };

    try {
        const res = await axios.post(url, JSON.stringify(bodyData), {
            auth: {
                username: jiraUser,
                password: jiraToken
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        await logger.debug(res.data);
    } catch (err) {
        logger.error(err);
    }
};

const moveIssueDone = async (issueKey) => {
    const url = jiraBaseUrl + `/issue/${issueKey}/transitions`;
    const bodyData = {
        'transition': {
            'id': 31
        }
    };
    try {
        const res = await axios.post(url, JSON.stringify(bodyData), {
            auth: {
                username: jiraUser,
                password: jiraToken
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        await logger.debug(res.data);
    } catch (err) {
        logger.error(err);
    }
};

exports.createJiraIssue = createJiraIssue;
exports.logMovetime = logMovetime;
