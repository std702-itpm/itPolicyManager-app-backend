const mbieService = require('../services/MbieApi');
const axios = require('axios');

exports.entryPoint = (req, res) => {
    const businessNumber = req.params.nzbn;
    mbieService.getAccessToken()
        .then(token => requestCompanyInfo(businessNumber, token)
            // in case of successful getting  access token
            .then(companyInfo => {
                res.json(companyInfo);
            })
            // in case of failed company's data request
            .catch(() => {
                res.status(400)
                    .json({
                        status: "error",
                        message: "Incorrect NZBN"
                    });
            })
        )
        .catch(() => {
            // In case if MBIE API call has failed
            res.status(500)
                .json({
                    status: "error",
                    message: "Internal server error"
                });
        });
}

/**
 * Creates and makes a request to NZBN API
 * @param nzbn - New Zealand Business Number
 * @param accessToken - API's access token, should be obtained from MBIE API
 * @returns {Promise<JSON>} - a promise with a company data JSON
 */
function requestCompanyInfo(nzbn, accessToken) {
    const nzbnApiBaseUrl = 'https://sandbox.api.business.govt.nz/services/v4/nzbn/entities/';
    const headers = {
        'Authorization': 'Bearer ' + accessToken
    };

    // Below is the actual call to the API
    return axios.get(nzbnApiBaseUrl + nzbn, {headers: headers})
        .then(res => {
            return extractCompanyData(res.data);
        })
        .catch(err => {
            // The error can be handled here, even logged
            throw new Error(err);
        });
}

/**
 * Extracts company's data from a successful API's response
 * @param response - NZBI API's response
 * @returns {Object} - JSON with necessary company's data only
 */
function extractCompanyData(response) {
    const companyData = {
        'nzbn': response.nzbn,
        'companyName': response.entityName,
        'city': response.addresses.addressList[0].address3,
        'zip': response.addresses.addressList[0].postCode,
        'address1': response.addresses.addressList[0].address2
    }
    return companyData;
}
