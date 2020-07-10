const mongoose = require("mongoose");
require("../models/assessmentResult.model.js");
const AssessmentResult = mongoose.model("AssessmentResult");

//Save the score from assessment result
exports.PostResult = (req, res) => {
    let data = req.body;
    let assessmentResult = new AssessmentResult({
        score: data.score,
        max_score: data.maxScore,
        assessment_taken_date: Date.now(),
        is_accep_compliance: data.isComplianceChecked,
        assessment_taker: data.user,
    })
    assessmentResult.save(function (err, document) {
        if (err) {
            res.status(500)
                .json(error);
            console.log(error)
        }
        console.log(document)
        res.json({
            message: "Your assessment has been saved successfully.",
            result: document
        })
    });
};