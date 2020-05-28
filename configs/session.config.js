var session = require('express-session');
const mongoose = require('./mongoose.config');
const mongoStore = require('connect-mongo')(session);

const sessionConfig = {
    secret: process.env.SECRET, // I have access to dotenv because of mongoose import
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 1 // 1 day
    },
    store: new mongoStore({
        mongooseConnection: mongoose.connection
    }),
    resave: true,
    saveUninitialized: false
}

module.exports = sessionConfig;
