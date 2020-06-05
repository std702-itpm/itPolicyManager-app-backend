/**
 * This controller is used for error handling
 */

/**
 * Middleware for request authorization check
 * @param request
 * @param response
 * @param next
 */
exports.AuthorizationFilter = (request, response, next) => {
    if (request.isAuthenticated()) {
        next()
    } else {
        response.status(401)
            .json({
                status: "error",
                message: "Authentication needed"
            });
    }
};

/**
 * Handler for not allowed request's methods
 * @param request
 * @param response
 */
exports.MethodNotAllowed = (request, response) => {
    response
        .status(405)
        .json({error: "Method is not allowed"});
}

/**
 * Handler for resource that could not be found
 * @param request
 * @param response
 */
exports.NotFound = (request, response) => {
    response
        .status(404)
        .json({error: "Requested resource is not found"})
}
