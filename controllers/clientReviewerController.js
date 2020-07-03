const mongoose = require('mongoose');
require("../models/company.model.js");
const Company = mongoose.model('Company');
const SubscribedPolicy = mongoose.model('SubscribedPolicy');
const User = mongoose.model('User');
const Nodemailer = require('nodemailer');
const SubscribedPolicyService = require("../services/SubscribedPolicyService.js");

/**
 * Path: clientReviewer?subscribedPolicyId=xxxxxxxxxxxxxx
 * Method: GET
 */
exports.clientReviewerGet = (req, res) => {
    SubscribedPolicy.findOne({ _id: req.query.subscribedPolicyId },
        (err, docs) => {
            if (err) {
                res.json(err)
            }
            res.json(docs);
        });
};
/**
 * Path: /submitPolicyReview
 * Methed: POST
 */
exports.submitPolicyReview = (request, response) => {
    const subscribedPolicyService = new SubscribedPolicyService();
    let requestData = request.body;
    let reviewerDetail;
    let companyDetail;
    User.findOne({ _id: requestData.userId }, (userError, user) => {
        if (userError) {
            response.status(500).json(userError)
        }
        reviewerDetail = user;
    })
    Company.findOne({ _id: requestData.companyId }, (companyError, company) => {
        if (companyError) {
            response.status(500).json(companyError)
        }
        companyDetail = company;
    })
    SubscribedPolicy.findOne({ _id: requestData.policyId }, (subscribedPolicyError, subscribedPolicy) => {
        if (subscribedPolicyError) {
            response.status(500).json(subscribedPolicyError)
        }
        let reviewedByEveryReviewer = true;

        subscribedPolicy.reviewer_list.forEach(reviewer => {
            if (reviewer.reviewer_id === requestData.userId) {
                //if the policy is accepted or rejected
                reviewer.review_status = requestData.isAccepted;
            }
            //If there's a reviewer that didn't review or rejected the policy
            if (!reviewer.review_status) {
                reviewedByEveryReviewer = false;
            }
        });
        //After all reviewers have finished the review, move the policy status to the next stage
        if (reviewedByEveryReviewer) {
            
            subscribedPolicy.status = subscribedPolicyService.getNextStatus(subscribedPolicy.status);
            subscribedPolicy.approval_date = Date.now();
            //Remove list of reviewers
            subscribedPolicy.reviewer_list = [];
        }
        
        subscribedPolicy.save((saveError, document) => {
            if (saveError) {
                response.status(500).json(saveError)
            }
            //Send a notification email to a company initiator
            emailDetail = {
                company_email: companyDetail.company_email,
                reviewStatus: requestData.isAccepted ? "approved" : "rejected",
                policyName: subscribedPolicy.policy_name,
                reviewerDetail: reviewerDetail,
                feedback: requestData.feedback,
                reviewedByEveryReviewer: reviewedByEveryReviewer
            }
            emailSender(emailDetail);

            response.json(document);
        });
    })
}
/**
 * Path: /policyComment
 * Method: POST
 * @param {*} request 
 * @param {*} response 
 */
exports.policyComment = (request, response) => {
    let requestData = request.body;
    let reviewerDetail;
    let companyDetail;
    User.findOne({ _id: requestData.userId }, (userError, user) => {
        if (userError) {
            response.status(500).json(userError)
        }
        reviewerDetail = user;
    })
    Company.findOne({ _id: requestData.companyId }, (companyError, company) => {
        if (companyError) {
            response.status(500).json(companyError)
        }
        companyDetail = company;
    })
    SubscribedPolicy.findOne({ _id: requestData.policyId }, (subscribedPolicyError, subscribedPolicy) => {
        emailDetail = {
            company_email: companyDetail.company_email,
            reviewStatus: "made a suggestion for",
            policyName: subscribedPolicy.policy_name,
            reviewerDetail: reviewerDetail,
            feedback: requestData.feedback
        }
        emailSender(emailDetail);
        
        response.json("The email has been sent.");
    })
}

//Email Notification for Registration 
//set up transporter
const transporter = Nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'itpsychiatrist.policymanager@gmail.com',
        pass: 'Aspire2CKD'
    }
});

const emailSender = function (emailDetail) {
    let mailContent = '<h1> ' + emailDetail.policyName +
        ' has been reviewed.</h1>' + '<br>'
        + '<p>' + emailDetail.reviewerDetail.fname + ' '
        + emailDetail.reviewerDetail.lname + ' has ' + emailDetail.reviewStatus + ' the policy. </p>';
    if (emailDetail.feedback) {
        mailContent = mailContent + '<p>Below is the detail of the review:</p><br>' +
            '<p>Review Feedback: ' + emailDetail.feedback + '</p><br>';
    } else {
        mailContent = mailContent + '<p>There is no feedback from this reviewer</p><br>'
    }
    mailContent = mailContent + '<p>Please sign-in to your account to view Policy details.</p>';
    if(emailDetail.reviewedByEveryReviewer){
        mailContent = mailContent + 
        '<p>This policy is reviewed by every reviewer and moved to the next status.</p>';
    }

    const mailOptions = {
        from: 'itpsychiatrist.policymanager@gmail.com', // sender address
        to: emailDetail.company_email, // list of receivers
        subject: emailDetail.policyName + ' Review Update', // Subject line
        html: mailContent
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err)
            console.log(err)
        else
            console.log("Email has been sent.", info);
    });
}