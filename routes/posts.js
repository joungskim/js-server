//NPM Packages
const router = require('express').Router();
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const { BAD_REQUEST, UNAUTHORIZED } = require('http-status-codes');

//Local Files
const verify = require('./verifyToken');
const User = require('../model/User');
const { userValidation } = require('../validation');

/* Get Types of Users */

//Response sends the current user data
router.get('/currentUser', verify, async(req, res) => {
    const cUser = await User.findOne({ _id: req.user }, { nameFirst: 1, nameLast: 1, _id: 1, owner: 1, currentTenant: 1 })
    res.send(cUser);
})

//Response sends a list of owners viewed by anyone.
router.get('/owners', async(req, res) => {
    res.send(await User.find({ owner: true }, { nameFirst: 1, nameLast: 1, _id: 1 }))
})

//Response sends a list of tenants or does not have permission to view tenants.
router.get('/tenants', verify, async(req, res) => {
    const isOwner = (await User.findOne({ _id: req.user }, { owner: 1 })).owner;

    isOwner ?
        res.send(await User.find({ currentTenant: true }, { nameFirst: 1, nameLast: 1, _id: 1 })) :
        res.status(401).send('You do not have permission to view this action.')

})

//Response sends a list of old tenants.
router.get('/tenantsOld', verify, async(req, res) => {
    const isOwner = (await User.findOne({ _id: req.user }, { owner: 1 })).owner;

    isOwner ?
        res.send(await User.find({
            $and: [
                { currentTenant: false },
                { owner: false }
            ]
        }, { nameFirst: 1, nameLast: 1, userName: 1, _id: 1 })) :
        res.status(401).send('You do not have permission to view this action.');


})

//Response sends a list of tenants by search name.
router.get('/searchByName', verify, async(req, res) => {
    const isOwner = (await User.findOne({ _id: req.user }, { owner: 1 })).owner;

    isOwner ?
        res.send(await User.find({
            $or: [
                { nameFirst: req.body.search },
                { nameLast: req.body.search },
                { nameMiddle: req.body.search }
            ]
        }, { nameFirst: 1, nameLast: 1, _id: 1 })) :
        res.status(401).send('You do not have permission to view this action.')
})

/* Patch user profiles */
router.patch('/user/update/', verify, async(req, res) => {
    // Destructure
    const user = req.body;
    console.log({ user })

    // Validate body
    try {
        userValidation(user);
    } catch (error) {
        return res.status(BAD_REQUEST).send('You effed up');
    }

    const sessionUser = (await User.findOne({ _id: req.user }));

    if (!sessionUser.owner && user.owner) {
        return res.status(UNAUTHORIZED).send('You cant make yourself an owner!');
    }

    if (!sessionUser.owner && typeof user.currentTenant == 'boolean') {
        return res.status(UNAUTHORIZED).send('You cant update the currentTenant');
    }


    // If trying updating pw or email
    if (user.password || user.email) {
        // Check they gave us their old password
        if (typeof user.oldPassword === 'undefined' || user.oldPassword == '') {
            return res.status(UNAUTHORIZED).send('You cant do that');
        }

        const salt = await bcrypt.genSalt(10);
        const oldPassword = await bcrypt.hash(user.oldPassword, salt);
        // Compare given pw to known pw.
        if (sessionUser.password != oldPassword) {
            return res.status(UNAUTHORIZED).send('You cant do that');
        }

        if (user.email) {
            const emailExist = await User.findOne({ email: user.email }).email
            if (emailExist) return res.status(UNAUTHORIZED).send('Email already in use.');
        }

        if (user.password) {
            user.password = await bcrypt.hash(user.password, salt);
        }
    }

    try {
        const response = await User.updateOne({ _id: req.user._id }, { $set: user })
        res.status(200).send("User was successfully updated.")
    } catch (error) {
        res.status(400).send(error);
    }
})

module.exports = router;