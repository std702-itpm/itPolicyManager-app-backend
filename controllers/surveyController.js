const mongoose = require('mongoose');
require("../models/question.model.js");
const Questions = mongoose.model('Questions');

//get questions
exports.getQuestions = (req, res) => {
    Questions.find(function (err, questions) {
        if (err) {
            console.log("Error: " + err);
        } else {
            res.json(questions);
        }
    });
};

//add questions
function addQuestions(question){
    var question=new Questions({
        question_content:question.question_content,
        options:question.options
    });
    question.save();
}

//update questions
exports.questionsPost = (req, res) => {
    var questionDetails=req.body;
    questionDetails.questionInputs.map((question) => {
        if(question._id===null){
            addQuestions(question);
        }
        else{
            Questions.findById(question._id, function (err, goalQuestion) {
                goalQuestion.question_content = question.question_content;
            goalQuestion.options = question.options;
            goalQuestion.save();
        });
        }
        
        if(questionDetails.deletedId.length!==0){
            for(var i=0;i<questionDetails.deletedId.length;i++){
                Questions.findByIdAndRemove({_id:questionDetails.deletedId[i]},
                    function (error, response) {
                        if (!error) {
                            //console.log(response);
                        } else {
                            console.log(err);
                        }
                    });
            }
        }
    });
    console.log("response: " + res);
    res.json({
        status: "success",
        message: "Delete Successful!"
    });
}
