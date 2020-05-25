const express = require('express');
const mongoose = require('./configs/mongoose.config');
var session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const cors = require('cors');
const passport = require('./configs/passport.config')
require('dotenv').config();

const app = express();

app.use(session({
    secret: 'Somesercrets',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 1 // 1 day
    },
    store: new mongoStore({
        mongooseConnection: mongoose.connection
    }),
    resave: true,
    saveUninitialized: false
}));

app.use(cors());
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

// Routing
const indexRoute = require('./routes');
app.use('/', indexRoute);

// invoke express on assigned or 5000 port
const port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Server is running on Port: " + port);
});

module.exports = app;
