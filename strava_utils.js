'use strict';
const axios = require('axios');
const fs = require('fs');

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

const stravaBaseUrl = 'https://www.strava.com/api/v3';

// load params
require('dotenv').config();
const fileName = '.env';
const stravaClientId = process.env.STRAVA_CLIENT_ID || null;
const stravaClientSecret = process.env.STRAVA_CLIENT_SECRET || null;
const stravaRefreshToken = process.env.STRAVA_REFRESH_TOKEN || null;

const getAccessToken = async () => {
    let res = '';
    const currentEnvParams = fs.readFileSync(`./${fileName}`).toString();
    let updateEnvParams = '';
    if (stravaRefreshToken) {
        res = await refreshAccessToken();
        updateEnvParams = currentEnvParams.replace(stravaRefreshToken, res.data.refresh_token);
    } else {
        logger.error('STRAVA_REFRESH_TOKEN is not set.');
        throw 'STRAVA_REFRESH_TOKEN is not set.';
    }
    try {
        logger.debug(updateEnvParams);
        fs.writeFileSync(`./${fileName}`, updateEnvParams);
    } catch (err) {
        logger.error(err);
    }
    return res.data.access_token;
};

const refreshAccessToken = async () => {
    const url = stravaBaseUrl + '/oauth/token';

    try {
        const res = await axios.post(url, {
            client_id: stravaClientId,
            client_secret: stravaClientSecret,
            grant_type: 'refresh_token',
            refresh_token: stravaRefreshToken
        });
        return res;
    } catch (err) {
        logger.error(err);
    }
};

const fetchActivityTimes = async () => {
    const url = stravaBaseUrl + '/athlete/activities';
    const accessToken = await getAccessToken();
    const date = new Date();
    const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const beginDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);

    try {
        const res = await axios.get(url, {
            params: {
                access_token: accessToken,
                after: beginDate.getTime() / 1000,
                before: endDate.getTime() / 1000
            }
        });

        await logger.debug(res.data);
        return res.data.map(activity => activity.moving_time);
    } catch (err) {
        logger.error(err);
    }
};

exports.fetchActivityTimes = fetchActivityTimes;
