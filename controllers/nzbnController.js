const mbieService = require('../services/MbieApi');
const axios = require('axios');

exports.entryPoint = (req, res) => {
    const businessNumber = req.params.nzbn;

    // First, the NZBN gained must be checked for matching NZBN format
    if (!isInNzbnFormat(businessNumber)) {
        console.log("> nzbn " + businessNumber + " has been declared INCORRECT");
        res.status(400).json(getIncorrectNzbnBody());
        return;
    }

    console.log("> " + businessNumber + " is a CORRECT NZBN");

    mbieService.getAccessToken()
        .then(token => requestCompanyInfo(businessNumber, token)
            // in case of successful getting  access token
            .then(companyInfo => {
                res.json(companyInfo);
            })
            // in case of failed company's data request
            .catch(() => {
                res.status(400)
                    .json(getIncorrectNzbnBody());
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
    const nzbnApiBaseUrl = 'https://api.business.govt.nz/services/v4/nzbn/entities/';
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
            console.log(err.response.data);
            throw new Error(err);
        });
}

function isInNzbnFormat(nzbn) {
    const nzbnFormat = /^\d{13}$/;
    return nzbnFormat.test(nzbn);
}

/**
 * Extracts company's data from a successful API's response
 * @param response - NZBI API's response
 * @returns {Object} - JSON with necessary company's data only
 */
function extractCompanyData(response) {
    let companyData = {
        'nzbn': response.nzbn,
        'companyName': response.entityName,
        'city': response.addresses.addressList[0].address3,
        'zip': response.addresses.addressList[0].postCode,
        'phoneNumber': extractPhoneNumber(response.phoneNumbers),
        'email': extractEmail(response.emailAddresses)
    };
    const addresses = extractAddresses(response.addresses.addressList);
    companyData = Object.assign(companyData, addresses)
    return companyData;
}

function extractPhoneNumber(phoneNumbers) {
    if (!phoneNumbers.length) {
        return "";
    }
    let extractedPhoneNumber;
    extractedPhoneNumber =
        "+" + phoneNumbers[0].phoneCountryCode +
        phoneNumbers[0].phoneAreaCode +
        phoneNumbers[0].phoneNumber;
    return extractedPhoneNumber;
}

function extractEmail(emailAddresses) {
    if (!emailAddresses.length) {
        return "";
    }
    return emailAddresses[0].emailAddress;
}

function extractAddresses(addressesList) {
    if (!addressesList.length) {
        return null;
    }

    const address1 = [addressesList[0].address1, addressesList[0].address2].join(", ");
    let address2 = "";
    if (addressesList.length > 1) {
        address2 = [addressesList[1].address1, addressesList[1].address2].join(", ");
    }
    const address = {
        'address1' : address1,
        'address2' : address2
    }
    return address;
}

function getIncorrectNzbnBody() {
    const responseBody = {
        status: "error",
        message: "Incorrect NZBN"
    };
    return responseBody;
}
