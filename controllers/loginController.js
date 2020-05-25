const passport = require('../configs/passport.config')

// Inside I use IIFE, as recommended PassportJS authenticate() documentation
// http://www.passportjs.org/docs/authenticate/
exports.signInPost = ((req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
        if (info) {
            return res.json({
                status: "info",
                message: info
            });
        }
        if (error) {
            return next(error);
        }
        if (!user) {
            return res
                .status(401)
                .json(getInvalidCredentialsMessage());
        }
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            return res
                .status(200)
                .json(getLoginMessage(user));
        })
    })(req, res, next);
});

/**
 * Creates a message, in case of successful login
 * @param result
 * @returns Message object
 */
function getLoginMessage(result) {
    return {
        message: "Welcome " + result.username,
        value: true,
        userId: result._id,
        userType: result.user_type,
        companyId: result.company._id,
        company_name: result.company.company_name
    };
}

/**
 * Creates a message, if by given credentials not a single user has been found
 * @returns Message object
 */
function getInvalidCredentialsMessage() {
    return {
        status: 'error',
        message: 'Invalid credentials'
    };
}
