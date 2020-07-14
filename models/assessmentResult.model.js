const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assessmentResultSchema = new Schema({
    assessment_taken_date: Date,
    score: Number,
    max_score: Number,
    is_accep_compliance: Boolean,
    assessment_taker: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model("AssessmentResult", assessmentResultSchema);
