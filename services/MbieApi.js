'use strict'

require('dotenv').config({path: '../.env'});
const axios = require('axios');

let accessToken;
let expirationTime;

/**
 * Checks if MBIE API access token has been gained and still valid,
 * and makes a request to the API for it, if needed.
 * <p>WARNING: there is NO error handling within the method.</p>
 *
 * @returns {Promise<string>} - A promise with an access token as a string
 */
exports.getAccessToken = async () => {
    if (isRefreshRequired()) {
        await refreshToken();
    }
    return accessToken;
};

function isRefreshRequired() {
    if (!expirationTime) {
        return true;
    } else if (expirationTime < Date.now()) {
        return true;
    } else if (!accessToken) {
        return true;
    } else {
        return false;
    }
}

async function refreshToken() {
    const accessApiUrl = 'https://api.business.govt.nz/services/token';
    const headers = {
        'Authorization': 'Basic ' + getAuthorizationToken()
    };
    const params = {
        'grant_type': 'client_credentials'
    };

    // Below is the actual call to the API
    let data = await axios.post(accessApiUrl, null, {params: params, headers: headers})
        .then(res => {
            return res.data;
        })
        .catch(err => {
            logError(err.response.data);
            // Somewhere here should be an error processing
            throw new Error(err);
        });
    processAccessToken(data);
}

/**
 * Reads MBIE API's credentials from the .env file,
 * than encode these credentials according to documentation.
 * @returns {String} MBIE API access token
 */
function getAuthorizationToken() {
    const customerKey = process.env.CUSTOMER_KEY;
    const customerSecret = process.env.CUSTOMER_SECRET;
    const credentialsString = customerKey + ":" + customerSecret;
    const encodedCredentials = Buffer.from(credentialsString).toString('base64');
    return encodedCredentials;
}

/**
 * Parses successful MBIE API's response
 * in order to obtain access token
 * and its expiration time.
 * @param data - MBIE response's data object
 */
function processAccessToken(data) {
    expirationTime = new Date(Date.now() + data.expires_in);
    accessToken = data.access_token;
}

function logError(data) {
    console.log("MBIE API error:");
    console.log(data);
}
