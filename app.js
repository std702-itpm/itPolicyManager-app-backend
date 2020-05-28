const express = require('express');
var session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();

const sessionConfig = require('./configs/session.config')
app.use(session(sessionConfig));

const corsConfig = require('./configs/cors.config');
app.use(cors(corsConfig));

const passport = require('./configs/passport.config')
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Routing
const indexRoute = require('./routes');
app.use('/', indexRoute);

// invoke express on assigned or 5000 port
const port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Server is running on Port: " + port);
});
