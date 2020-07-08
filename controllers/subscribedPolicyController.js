/*!
=========================================================
* IT Policy Manager - v1.1.0
=========================================================
* Coded by IT Policy Team
=========================================================
* Policy subscription component for server side.
*/
require('dotenv').config();

const SubscribedPolicyService = require("../services/SubscribedPolicyService.js");
const EmailService = require("../services/EmailService.js");

const mongoose = require('mongoose');
require("../models/company.model.js");
require("../models/policy.model");
require("../models/SubscribedPolicy.model")
const Company = mongoose.model('Company');
const SubscribedPolicy = mongoose.model('SubscribedPolicy');
const Policy = mongoose.model('Policy');
const User = mongoose.model('User');
var ObjectId = mongoose.Types.ObjectId;
const NodeMailer = require('nodemailer');
var moment = require('moment');

exports.getSubscribedPolicy = async (req, res) => {
    SubscribedPolicy.findOne({ _id: new ObjectId(req.query.subscribedPolicyId) })
        .populate('assessment_takers.user')
        .exec((error, subscribedPolicy) => {
            if (error) {
                res.status(500)
                    .json(error);
                console.log(error)
            }
            res.json(subscribedPolicy)
        })
};

exports.getSubscribedPoliciesByCompanyId = async (req, res) => {
    SubscribedPolicy.find({
        company_id: req.query.company_id
    }, function (error, documents) {
        if (error) {
            res.status(500)
                .json(error);
            console.log(error)
        }
        res.json(documents);
    })
}

exports.subscribedPolicySave = (req, res) => {
    let policyDetails = req.body;

    const subscribedPolicyService = new SubscribedPolicyService();
    let subscribedPolicy = new SubscribedPolicy({
        company_id: policyDetails.companyId,
        policy_id: policyDetails.policyData._id,
        policy_name: policyDetails.policyData.policy_name,
        content: policyDetails.policyData.content,
        assessments: policyDetails.policyData.assessments,
        reviewed_date: "",
        approval_date: "",
        date_subscribed: Date.now(),
        status: subscribedPolicyService.getNotReviewStatus(),
        date_subscribed: moment(),
        date_expired: moment().add(12, 'M'),
        version: 1
    });
    subscribedPolicy.save();
}

/**
 * Start reviewing process of a subscribed policy
 * path: /updateSubscribedPolicy
 */
exports.subscribedPolicyUpdate = (req, res) => {
    let subscribedPolicyDetails = req.body;
    const subscribedPolicyService = new SubscribedPolicyService();
    const emailService = new EmailService();
    console.log("SUBSCRIBERS==>" + subscribedPolicyDetails.reviewerList);
    console.log("Policy Id" + subscribedPolicyDetails.policy_id)
    SubscribedPolicy.findOne(
        {
            _id: new ObjectId(subscribedPolicyDetails.policy_id),
        }, function (error, subscribedPolicy) {
            if (error) {
                console.log(error);
                res.status(500)
                    .json({
                        status: "failed"
                    });
            }

            //Set the status to confirmation if the policy status is not reviewed
            if (subscribedPolicy.status === subscribedPolicyService.getNotReviewStatus()) {
                subscribedPolicy.status = subscribedPolicyService.getComfirmationStatus();
                subscribedPolicy.reviewed_date = Date.now();
            }
            let existingIds = new Set(subscribedPolicy.reviewer_list.map(d => d.reviewer_id));
            subscribedPolicy.reviewer_list =
                [...subscribedPolicy.reviewer_list,
                ...subscribedPolicyDetails.reviewer_list.filter(reviewer => !existingIds.has(reviewer.reviewer_id))];
            //Update subscribed policy
            subscribedPolicy.save();

            let user = [];
            for (let i = 0; i < subscribedPolicyDetails.reviewer_list.length; i++) {
                User.findOne({
                    _id: subscribedPolicyDetails.reviewer_list[i].reviewer_id
                }, function (error, response) {
                    user = response;

                    let reviewLink = ("http://localhost:3000/review-policy/"
                        + subscribedPolicyDetails.companyId
                        + "/" + subscribedPolicy._id
                        + "/" + user._id);

                    emailService.sendEmail(user.email,
                        subscribedPolicy.policy_name + " " + 'review request',
                        prepareEmailContentForPolicyReviewer({
                            policy_name: subscribedPolicy.policy_name,
                            reviewLink: reviewLink
                        }));
                })
            }
            console.log("response is: " + SubscribedPolicy)
            res.json({
                status: "success"
            });

        });

};

const prepareEmailContentForPolicyReviewer = function (mailContents) {
    return '<h2>Welcome to IT Policy Manager!</h2>' +
        '<p> You have been set as a reviewer for ' + mailContents.policy_name + '<br>' +
        'Below is the link to view and review the policy.<br><br>' +
        '<a href=' + mailContents.reviewLink + '>CLICK HERE: Policy document to be reviewed.</a>'
}

exports.sendAssessmentToReviewers = (req, res) => {
    var details = req.body;
    const emailService = new EmailService();

    SubscribedPolicy.findById({
        _id: details.policyId
    }, function (error, document) {
        if (error) {
            res.status(500)
                .json(error);
            console.log(error);
        }
        let assessment_takers = [];

        details.selectedUsers.forEach(user => {
            let assessment_taker = {};
            assessment_taker.user = user;
            const assessmentLink =
                "http://localhost:3000/assessment/" + document._id;
            assessment_taker.assigned_date = moment();
            assessment_taker.due_date = moment().add(1, 'M');
            assessment_taker.taken_date = null
            emailService.sendEmail(user.email,
                "Awareness Assessment for " + document.policy_name,
                prepareEmailContentForAssessment({
                    assessmentLink: assessmentLink,
                    policy_name: document.policy_name
                }));
            assessment_takers.push(assessment_taker);
        });

        document.assessment_takers = assessment_takers;
        document.markModified('assessment_takers')
        document.save((saveError) => {
            if (saveError) {
                res.status(500)
                    .json({
                        status: "failed",
                        message: saveError
                    });
            } else {
                res.json({
                    status: "success",
                    message: "Assessment emails have been sent to selected employees."
                })
            }
        });
    });
}

const prepareEmailContentForAssessment = function (mailContents) {
    return 'You have been set to take a short test for ' + mailContents.policy_name + '</br></br>' +
        'Below is the link to view and review the policy.<br><br>' +
        '<a href=' + mailContents.assessmentLink + '>CLICK HERE: Policy Assessment to be taken.</a>' +
        '</br></br>' +
        'Thank you.</br>' +
        'Regards,</br>' +
        'IT Policy Manager';
}

const transporter = NodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'itpsychiatrist.policymanager@gmail.com',
        pass: 'Aspire2CKD'
    }
});
