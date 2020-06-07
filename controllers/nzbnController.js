const mbieService = require('../services/MbieApi');
const axios = require('axios');

exports.entryPoint = async (req, res) => {
    const businessNumber = req.params.nzbn;
    let accessToken;
    try {
        accessToken = await mbieService.getAccessToken();
    } catch (e) {
        res.status(500)
            .json({
                status: "error",
                message: "Internal server error"
            });
        return;
    }
    res.json(await requestCompanyInfo(businessNumber, accessToken));
}

/**
 *
 * @param nzbn
 * @param accessToken
 * @returns {Promise<JSON>} - Promise with a request result as a JSON
 */
async function requestCompanyInfo(nzbn, accessToken) {
    const nzbnApiBaseUrl = 'https://api.business.govt.nz/services/v4/nzbn/entities/';
    const headers = {
        'Authorization': 'Bearer ' + accessToken
    };

    // Below is the actual call to the API
    const reqResult = axios.get(nzbnApiBaseUrl + nzbn, {headers: headers})
        .then(res => {
            return extractCompanyData(res.data)
        })
        .catch(err => {
            // Somewhere here should be an error processing
            return err.response.data;
        });
    return reqResult;
}

/**
 * Extracts company's data from a successful API's response
 * @param response
 * @returns {Object} - JSON with necessary company's data
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
