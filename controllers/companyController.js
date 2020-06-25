const mongoose = require('mongoose');
require("../models/company.model.js");
const Company = mongoose.model('Company');
const User = mongoose.model('User');
const Policy = mongoose.model('Policy');

/**
 * Path: /company
 * Method: GET
 */
exports.companyGet = (req, res) => {
    if (req.query.type === "company") {
        Company.findOne({company_name: req.query._id})
            .exec()
            .then(oneCompany => {
                res.json(oneCompany);
            })
            .catch(err => {
                console.log(err);
            });
    } else if (req.query.type === "companyAll") {
        Company.find({status: true})
            .exec()
            .then(companies => {
                res.json(companies);
            })
            .catch(err => {
                console.log(err);
            });
    } else if (req.query.type === "companyAllInactive") {
        Company.find({status: false})
            .exec()
            .then(companies => {
                res.json(companies)
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        // Type = user
        console.log("My role is user" + req.query._id)
        User.findOne({"_id": req.query._id})
            .exec()
            .then(user => {
                console.log("user: " + user);
                res.json(user);
            })
            .catch(err => {
                console.log(err);
            });
    }
};

// below is kinda incomplete version of REST
exports.companyPost = (req, res) => {
    let matchPolicy = req.body;
    console.log("Policies:" + matchPolicy.policies);
    // Here we can see POST
    if (matchPolicy.status === "new") {
        console.log("I am new");
        Company.findByIdAndUpdate(matchPolicy.id,
            {
                "$push": {
                    "match_policy": matchPolicy.policies
                }
            })
            .exec()
            .then(() => {
                res.json({
                    result: "success"
                });
            })
            .catch(err => {
                console.log(err);
            });
        // for some reason there is a user deletion in snippet below
    } else if (matchPolicy.status === "delete") {
        console.log("Status" + matchPolicy.status);
        User.findByIdAndRemove({
            _id: matchPolicy.id
        })
            .exec()
            .then(response => {
                console.log("response: " + response);
                res.json({
                    status: "success",
                    message: "Delete Successful!"
                });
            })
            .catch(err => {
                console.log(err);
            });
        // And of course we need UPDATE
    } else {
        Company.findOneAndUpdate({"company_name": matchPolicy.name},
            {
                "$push": {
                    "match_policy": matchPolicy.policies
                },
                upsert: true,
                new: true
            })
            .exec()
            .then(() => {
                res.json({
                    result: "success"
                });
            })
            .catch(err => {
                    console.log(err);
                }
            );
    }
}

const Nodemailer = require('nodemailer');

//generate username
async function setupUsername(companyName) {
    //remove space
    companyName = companyName.replace(/\s+/g, '');
    //get the first2 and last2 characters
    f2 = companyName.slice(0, 2);
    l2 = companyName.slice(-2);
    //capital
    f2 = changeUppercase(f2);
    l2 = changeUppercase(l2);
    //generate username
    let username = "";
    do {
        username = f2 + getRandomString(4) + l2;
    } while (! await isUsernameUnique(username));
    return username;
}

async function isUsernameUnique(username) {
    let count = await User.countDocuments({username: username})
        .then(count => {    // here count is a Promise
            return count;   // here count is the value of that Promise
        })
        .catch(err => {
            console.log(err);
        });
    return count === 0;
}

function changeUppercase(inputString) {
    re = inputString.split("");
    lengths = re.length;
    inputString = inputString.slice(0, -1).toLowerCase();
    capital = re[lengths - 1].toUpperCase();
    inputString = inputString + capital;
    return inputString;
}

//generate password
function setupPassword() {
    return getRandomString(8);
}

function getRandomString(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let string = "";
    for (let i = 0; i < length; i++) {
        string += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return string;
}

// Email Notification for Registration 
//set up transporter
const transporter = Nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'itpsychiatrist.policymanager@gmail.com',
        pass: 'Aspire2CKD'
    }
});

/**
 * Path: /register
 * Method: POST
 */
exports.registerPost = (req, res) => {
    let companyInfo = extractCompanyInfo(req.body);
    Company.findOne(
        {company_name: companyInfo.company_name, company_email: companyInfo.company_email},
        async function (error, company) {
            if (company) {
                res.json({
                    message: "Company has already been registered! Login Instead",
                    value: false
                })
            } else {
                let username = await setupUsername(companyInfo.company_name);
                let password = setupPassword();
                //Create new company
                var NewCompany = new Company(companyInfo);
                console.log(NewCompany);
                companyId = NewCompany._id;
                NewCompany.save(function (err, Company) {
                    if (err) {
                        res.json({
                            message: "Registration failed!",
                            value: false
                        })
                    }
                    //Create a new user
                    var NewUser = new User({
                        user_type: 'comp_initiator',
                        company: companyId,
                        username: username,
                        password: password
                    })
                    console.log(NewUser);
                    NewUser.save(function (err) {
                        postCreateNewUser(err, NewCompany, NewUser)
                    })
                    res.json({
                        message: "Registration Successful!",
                        value: true,
                        id: companyId
                    })
                })
            }
        });
};

function extractCompanyInfo(requestBody) {
    const companyAddress = [
        requestBody.bAddr,
        requestBody.bAddr2,
        requestBody.bCity,
        requestBody.bState,
        requestBody.bZip
    ].join(" ");

    const normalizedCompanyName = normalizeString(requestBody.bNameInput)
        .toUpperCase();

    const normalizedEmail = requestBody.bEmail
        .trim()
        .replace(/\s+/g, "");

    const companyInfo = {
        company_name: normalizedCompanyName,
        company_email: normalizedEmail,
        contact: "",
        nzbn: requestBody.nzbnInput,
        address: normalizeString(companyAddress),
        date_registered: Date.now(),
        description: normalizeString(requestBody.bDescription),
        status: true
    };

    return companyInfo;
}

function normalizeString(string) {
    return string.trim().replace(/\s+/g, " ");
}

function postCreateNewUser(err, newCompany, newUser) {
    //set up email content
    const mailOptions = {
        from: 'itpsychiatrist.policymanager@gmail.com', // sender address
        to: newCompany.company_email, // list of receivers
        subject: 'Your IT Policy Manager Login Credentials', // Subject line
        html:
            '<h2>Welcome to IT Policy Manager!</h2>' +
            '<p> Thank you for registering. <br>' +
            'Below is your login details, use these credential to acces your IT Policy Manager Account.<br>' +
            '<br>' +
            'User Name:' + newUser.username + ' <br>' +
            'Temporary Password: ' + newUser.password + ' </p>' +
            '<p>Please click on the link to sign-in. </p>' +
            '<a href="http://localhost:3000/signin-page">IT Policy Manager Login</a>  '
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}

exports.companyDelete = (req, res) => {
    let data = req.body;
    Company.findByIdAndRemove({
        _id: data.companyId
    }, function (error, response) {
        if (!error) {
            User.findOneAndRemove({company: data.companyId}, function (error2, response2) {
                if (!error2) {
                    res.json({
                        status: "success"
                    })
                } else {
                    console.log(error2)
                }
            })
        } else {
            console.log(error)
        }
    })
}

exports.getSuggestedPolicy = async (req, res) => {
    let user_id = req.query.user_id;
    let query = await User.findOne({_id: user_id})
        .populate({
            path: 'company',
            model: 'Company',
            populate: {
                path: 'match_policy',
                model: 'Policy'
            }
        });
    res.json(query);
}
