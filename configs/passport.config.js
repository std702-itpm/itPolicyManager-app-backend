const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userSchema = require('../models/company.model');
const User = mongoose.model('User');

passport.use(new LocalStrategy(
    {usernameField: 'username'},
    (username, password, done) => {
        User.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false)
            }
            if (user.password !== password) {
                return done(null, false)
            }
            if (username === user.login && password === user.password) {
                return done(null, user);
            }
        })
    }
));

passport.serializeUser((user, done) => {
    console.log('ser')
    // The second parameter defines what will be stored in the session.passport
    done(null, user);
});

//TODO must be remade in a proper way
passport.deserializeUser((user, done) => {
    console.log('des');
    //I should not store all user information in the session
    done(null, user);
});

module.exports = passport;
