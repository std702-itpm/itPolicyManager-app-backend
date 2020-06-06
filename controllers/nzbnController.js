const mbieService = require('../services/MbieApi');

exports.entryPoint = async (req, res, next) => {
    try {
        console.log(await mbieService.getAccessToken());
    } catch (e) {
        console.log(e);
    }
    next();
}
