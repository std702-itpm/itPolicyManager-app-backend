const express = require("express");
const router = express.Router();

/**
 * Controller handling global errors
 */
const errorHandlingController = require("./controllers/errorHandlingController");

// Define controllers here
const authController = require("./controllers/authenticationController");
const surveyController = require("./controllers/surveyController");
const assessmentController = require("./controllers/assessmentController");
const companyController = require("./controllers/companyController");
const userController = require("./controllers/userController");
const policyController = require("./controllers/policyController");
const subscribedPolicyController = require("./controllers/subscribedPolicyController");
const createPaymentController = require("./controllers/createPaymentController");
const editProfileController = require("./controllers/editProfileController");
const reviewPolicyController = require("./controllers/reviewController");
const clientReviewPolicyController = require("./controllers/clientReviewerController");
const assessmentResultController = require("./controllers/assessmentResultController");
const nzbnController = require("./controllers/nzbnController");

/**
 * START - This set of APIs don't go through the authentication controller
 */
// New company registration
router.route("/register")
    .post(companyController.registerPost)
    .all(errorHandlingController.MethodNotAllowed);

// NZBN service
router.route("/nzbn/:nzbn")
    .get(nzbnController.entryPoint)
    .all(errorHandlingController.MethodNotAllowed);

// Login
router.route("/signin")
    .post(authController.signInPost)
    .delete(authController.logout)
    .all(errorHandlingController.MethodNotAllowed);

// Policies are open for viewing on the Landing Page
router.route("/getAllPolicies")
    .get(policyController.getAllPolicies)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/getOnePolicy/:id")
    .get(policyController.getOnePolicy)
    .all(errorHandlingController.MethodNotAllowed);

// Get survey
router.route("/takeSurvey")
    .get(surveyController.getQuestions)
    .all(errorHandlingController.MethodNotAllowed);

// Client review subscribed policy
router.route("/clientReviewer")
    .get(clientReviewPolicyController.clientReviewerGet)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/submitPolicyReview")
    .post(clientReviewPolicyController.submitPolicyReview)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/policyComment")
    .post(clientReviewPolicyController.policyComment)
    .all(errorHandlingController.MethodNotAllowed);
// Subscribed policy
router.route("/getSubscribedPolicy")
    .get(subscribedPolicyController.getSubscribedPolicy)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/getSubscribedPoliciesByCompanyId")
    .get(subscribedPolicyController.getSubscribedPoliciesByCompanyId)
    .all(errorHandlingController.MethodNotAllowed);

/**
 * END - This set of APIs don't go through the authentication controller
 */
// Middleware
// All endpoints below require authentication
router.use(errorHandlingController.AuthorizationFilter);

// Company controller
router.route("/company")
    .get(companyController.companyGet)
    .post(companyController.companyPost)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/deleteCompany")
    .post(companyController.companyDelete)
    .all(errorHandlingController.MethodNotAllowed);

// Company controller
router.route("/user")
    .get(userController.userGet)
    .post(userController.userPost)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/addUser")
    .post(userController.addAccountablePerson)
    .all(errorHandlingController.MethodNotAllowed);

// Policy
router.route("/deletePolicy/:policyId")
    .delete(policyController.deletePolicy)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/edit-policy")
    .put(policyController.updatePolicy)
    .all(errorHandlingController.MethodNotAllowed);

router.route("/updateSurvey")
    .post(surveyController.questionsPost)
    .all(errorHandlingController.MethodNotAllowed);

// Get assessment
router.route("/assessment")
    .get(policyController.getAssessment)
    .put(assessmentController.updateAssessment)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/deleteassessment")
    .post(assessmentController.assessmentDelete)
    .all(errorHandlingController.MethodNotAllowed);

// Payment
router.route("/create_paymentintent")
    .post(createPaymentController.createPaymentPost)
    .all(errorHandlingController.MethodNotAllowed);

// Edit profile
router.route("/editprofile/:id")
    .get(editProfileController.editProfileGet)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/edituserprofile/:id")
    .get(editProfileController.editUserProfileGet)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/editprofile")
    .post(editProfileController.editProfilePost)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/deleteprofile")
    .post(editProfileController.editProfilePut)
    .all(errorHandlingController.MethodNotAllowed);

// Subscribed policy
router.route("/addSubscribedPolicy")
    .post(subscribedPolicyController.subscribedPolicySave)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/updateSubscribedPolicy")
    .post(subscribedPolicyController.subscribedPolicyUpdate)
    .all(errorHandlingController.MethodNotAllowed);
router.route("/sendAssessmentToReviewers")
    .post(subscribedPolicyController.sendAssessmentToReviewers)
    .all(errorHandlingController.MethodNotAllowed);

// Review subscribed policy
router.route("/reviewPolicy")
    .get(reviewPolicyController.reviewPolicyGet)
    .all(errorHandlingController.MethodNotAllowed);

// Assessment Result
router.route("/assessmentResult")
    .post(assessmentResultController.PostResult)
    .all(errorHandlingController.MethodNotAllowed);

// Handler for 404. This method must be placed after all other routes
router.use(errorHandlingController.NotFound);

module.exports = router;
