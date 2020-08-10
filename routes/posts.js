//NPM Packages
const router = require('express').Router();
const _ = require('lodash');
const bcrypt = require('bcryptjs');

//Local Files
const verify = require('./verifyToken');
const User = require('../model/User');
const { object } = require('@hapi/joi');
const { isEmpty } = require('lodash');

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

    //Hash Password
    let hashPassword;

    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        hashPassword = await bcrypt.hash(req.body.password, salt);
    }

    const isOwner = (await User.findOne({ _id: req.user }, { owner: 1 })).owner;

    const user = {
        userName: _.toLower(req.body.userName),
        nameFirst: req.body.nameFirst,
        nameMiddle: req.body.nameMiddle,
        nameLast: req.body.nameLast,
        email: _.toLower(req.body.email),
        password: hashPassword,
        currentTenant: req.body.currentTenant,
        owner: req.body.owner
    };

    if (!isOwner) {
        delete user.owner;
        delete user.userName;
        delete user.currentTenant;
        delete user.date;
    }

    for (const key in user) {
        if (user.hasOwnProperty(key)) {
            if (user[key] === null || isEmpty(user[key] || user[key] === 'undefined')) {
                delete user[key];
            }
        }
    }
    try {
        await User.updateOne({ _id: req.user._id }, { $set: req.body })
            .then(res.status(200).send("User was successfully updated."))
    } catch (error) {
        res.status(400).send(error);
    }
})

module.exports = router;