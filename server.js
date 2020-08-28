require('dotenv').config();



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const bodyParser = require('body-parser');

const connectUri = process.env.MONGO_URI;
// let port = process.env.PORT || 3000;

const app = express();
app.use(cors());

app.use(bodyParser.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));

mongoose.Promise = global.Promise;
mongoose.connect(connectUri, {useNewUrlParser: true, useCreateIndex: true});

const connection = mongoose.connection;
connection.once('open', () => console.log('MongoDB -- database connection established successfully'));
connection.on('error', err => {
    console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
    process.exit();
});

app.use(passport.initialize());
require('./middleware/jwt')(passport);

require('./routes/index')(app);


app.listen(5000, () => console.log('Server is running'));
