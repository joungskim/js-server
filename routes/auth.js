//NPM Packages
const router = require('express').Router();
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Local Files
const User = require('../model/User');
const { registerValidation, loginValidation } = require('../validation');

router.post('/register', async(req, res) => {
    //Validate data before submitting user
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    //Checking if the user/email is already in the database
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).send('Email already in use.');
    const userExist = await User.findOne({ userName: req.body.userName });
    if (userExist) return res.status(400).send('Username already in use.')

    //Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);


    //Create new User
    const user = new User({
        userName: req.body.userName,
        nameFirst: req.body.nameFirst,
        nameMiddle: req.body.nameMiddle,
        nameLast: req.body.nameLast,
        email: req.body.email,
        password: hashPassword,
        currentTenant: req.body.currentTenant,
        owner: req.body.owner
    });
    try {
        const savedUser = await user.save();
        res.send({ user: user._id });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/login', async(req, res) => {
    //Validate data
    const { error } = loginValidation(req.body);
    if (error) res.status(400).send(error.details[0].message);

    //Find user by email or userName
    const user = await User.findOne({
        $or: [
            { email: req.body.login },
            { userName: req.body.login }
        ]
    })

    //Check if a user was found.
    if (_.isEmpty(user)) return res.status(400).send('User name or email does not exist.')

    //Password is correct.
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Invalid Password.');

    //Create and assign token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
});

module.exports = router;