const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userSchema = require('../models/company.model');
const User = mongoose.model('User');

passport.use(new LocalStrategy(
    {usernameField: 'username'},
    (username, password, done) => {
        User.findOne({username: username, password: password})
            .populate('company', 'company_name')
            .exec()
            .then(user => {
                if (!user) {
                    return done(null, false)
                }
                if (username === user.username && password === user.password) {
                    return done(null, user);
                }
            })
            .catch(err => {
                return done(err);
            });
    }
));

passport.serializeUser((user, done) => {
    // The second parameter defines what will be stored in the session.passport
    done(null, user);
});

//TODO must be remade in a proper way
passport.deserializeUser((user, done) => {
    //I should not store all user information in the session
    done(null, user);
});

module.exports = passport;
