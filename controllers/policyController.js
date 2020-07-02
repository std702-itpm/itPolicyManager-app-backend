const mongoose = require('mongoose');
const Policies = require("../models/policy.model.js");

/**
 * Used for both saving a new policy and updating an existing one
 * <p>Path: /edit-policy</p>
 * <p>Method: PUT</p>
 */
exports.updatePolicy = (req, res) => {
    const policyDetails = req.body;
    if (policyDetails._id) {
        // This part is for updating an existing policy
        Policies.findOneAndUpdate({
            "_id": policyDetails._id
        }, {
            "policy_name": policyDetails.policyName,
            "content": policyDetails.content
        })
            .exec()
            .then(policy => {
                res.json(policy);
            })
            .catch(err => {
                console.log("Error while updating a policy: " + err);
                res.status(500)
                    .json({
                        status: "error",
                        message: "Internal server error"
                    })
            });
    } else {
        // This part is for adding a new policy into the database
        const newPolicy = new Policies({
            policy_name: policyDetails.policyName,
            content: policyDetails.content
        });
        newPolicy.save()
            .then((newPolicy) => {
                res.json({
                    status: "success",
                    message: "Policy has been saved with id: " + newPolicy._id
                });
            })
            .catch(err => {
                console.log("Error while saving a new policy: " + err);
                res.status(500)
                    .json({
                        status: "error",
                        message: "Internal server error"
                    })
            });
    }
};

exports.getAllPolicies = (req, res) => {
    Policies.find({}, (err, policies) => {
        if (err) {
            console.log("Error: " + err);
        } else {
            res.json(policies); // returns all policy
        }
    });
}

exports.getOnePolicy = (req, res) => {
    let id = req.params.id;
    Policies.findById({_id: id}, (err, policy) => {
        if (err) {
            console.log("Error: " + err);
        } else {
            res.json(policy);
        }
    });
}

exports.getAssessment = async (req, res) => {
    let id = req.body.policy_id;
    const policy = await Policies.findOne(
        {"_id": id}
    );
    console.log(policy);
}

exports.deletePolicy = (req, res) => {
    const policyId = req.params.policyId;
    Policies.deleteOne({"_id": policyId})
        .exec()
        .then(() => {
            res.json({
                status: "success",
                message: "Policy " + policyId + " has been deleted"
            });
        })
        .catch((err) => {
            console.log("Error while deletion a new policy: " + err);
            res.status(500)
                .json({
                    status: "error",
                    message: "Internal server error"
                })
        });
}
