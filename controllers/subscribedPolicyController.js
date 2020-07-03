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

const mongoose = require('mongoose');
require("../models/company.model.js");
require("../models/policy.model");
require("../models/SubscribedPolicy.model")
const Company = mongoose.model('Company');
const SubscribedPolicy = mongoose.model('SubscribedPolicy');
const Policy = mongoose.model('Policy');
const User = mongoose.model('User');
const NodeMailer = require('nodemailer');
var moment = require('moment');

exports.getSubscribedPolicy = async (req, res) => {
    let subscribedPolicy = [];
    console.log("CompanyID: " + req.query.company_id)
    if (req.query.policy_type === "one") {
        console.log(req.query.policyId)
        SubscribedPolicy.findOne({
            policy_id: req.query.policyId
        }, function (error, subscribedPolicy) {
            if (!error) {
                res.json(subscribedPolicy)
            }
            else {
                console.log(error)
            }
        })
    }
    else {
        SubscribedPolicy.find({
            company_id: req.query.company_id
        }, function (error, response) {
            subscribedPolicy = response;
            if (error) {
                console.log("Error: " + error);
            } else {
                if (subscribedPolicy !== null) {
                    if (req.query.policy_id !== "") {
                        for (let i = 0; i < subscribedPolicy.length; i++) {
                            if (subscribedPolicy[i].policy_id === req.query.policy_id) {
                                subscribedPolicy = subscribedPolicy[i];
                                break;
                            }
                        }
                    }
                    res.json(subscribedPolicy);
                } else {
                    res.json({
                        message: "empty"
                    });
                }
                console.log(subscribedPolicy);
            }
        })
    }

};

exports.subscribedPolicySave = (req, res) => {
    let subscribedPolicyDetails = req.body;
    var subscribedPolicy = new SubscribedPolicy({
        company_id: subscribedPolicyDetails.companyId,
        policy_id: subscribedPolicyDetails.policyId,
        policy_name: subscribedPolicyDetails.name,
        content: subscribedPolicyDetails.content,
        reviewed_date: subscribedPolicyDetails.reviewed_date,
        approval_date: subscribedPolicyDetails.approval_date,
        date_subscribed: subscribedPolicyDetails.date_subscribed,
        status: subscribedPolicyDetails.status,
        date_subscribed: moment(),
        date_expired: moment().add(12, 'M'),
        version: subscribedPolicyDetails.version
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

    console.log("SUBSCRIBERS==>" + subscribedPolicyDetails.reviewerList);
    console.log("Policy Id" + subscribedPolicyDetails.policy_id)
    SubscribedPolicy.findOne(
        {
            policy_id: subscribedPolicyDetails.policy_id,
            company_id: subscribedPolicyDetails.companyId
        }, function (error, subscribedPolicy) {
            if (error) {
                console.log(error);
                res.json({
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
                    //Replace empty space with dash
                    let pName = subscribedPolicy.policy_name.replace(/\s+/g, "-");

                    let reviewLink = ("http://localhost:3000/review-policy/"
                        + subscribedPolicyDetails.companyId
                        + "/" + subscribedPolicy._id
                        + "/" + user._id);

                    const mailOptions = {
                        from: 'itpsychiatrist.policymanager@gmail.com', // sender address
                        to: user.email,
                        subject: subscribedPolicy.policy_name + " " + 'review request',
                        html: '<h2>Welcome to IT Policy Manager!</h2>' +
                            '<p> You have been set as a reviewer for ' + subscribedPolicy.policy_name + '<br>' +
                            'Below is the link to view and review the policy.<br><br>' +
                            '<a href=' + reviewLink + '>CLICK HERE: Policy document to be reviewed.</a>  '
                    };
                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log(info);
                        }
                    })
                })
            }
            console.log("response is: " + SubscribedPolicy)
            res.json({
                status: "success"
            });

        });

};

exports.sendAssessmentToReviewers = (req, res) => {
    var details = req.body;
    console.log("ID: " + details.policyId)

    Policy.findById({
        _id: details.policyId
    }, function (error, response) {
        if (!error) {
            let generalLink = ("http://localhost:3000/send-assessment/" + response._id + "/" + details.userId);
            const mailOptions = {
                from: 'itpsychiatrist.policymanager@gmail.com', // sender address
                to: details.email,
                subject: 'Awareness Assessment',
                html: 'You have been set to take a short test for ' + response.policy_name + '</br></br>' +
                    'Below is the link to view and review the policy.<br><br>' +
                    '<a href=' + generalLink + '>CLICK HERE: Policy Assessment to be taken.</a>' +
                    '</br></br></br></br></br></br></br>' +
                    'Thank you.</br></br>' +
                    'Regards,</br' +
                    'IT Policy Manager'
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err);
                }
                else {

                    console.log(info);
                }
            })
            res.json({
                status: "success"
            })
        }
        else {
            console.log(error)
        }
    });
}

const transporter = NodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'itpsychiatrist.policymanager@gmail.com',
        pass: 'Aspire2CKD'
    }
});
