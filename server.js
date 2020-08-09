const express = require('express');
const app = express();
const dotenv = require('dotenv')
const mongoose = require('mongoose');

//Import Routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');

//.env file
dotenv.config({
    path: './.env'
});

//Connect to JSDB
mongoose.connect(process.env.CONNECTDB, { useNewUrlParser: true, useUnifiedTopology: true }, () =>
    console.log('Successfully connected to DB')
);

//Middleware
app.use(express.json());

//Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/posts', postRoute);


app.listen(3000, () => console.log('Server is running!'));