//NPM Packages
const router = require('express').Router();
const _ = require('lodash');

//Local Files
const verify = require('./verifyToken');
const User = require('../model/User');

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

router.patch('/updateUser', verify, async(req, res) => {
    const isOwner = (await User.findOne({ _id: req.user }, { owner: 1 })).owner;
    const isTenant = (await User.findOne({ _id: req.user }, { currentTenant: 1 })).currentTenant;

    console.log("Logging Tenant: " + isTenant)
    console.log("Logging req.body.currentTenant: " + req.body.currentTenant)

    //TODO: Ask joe how to handle this in a better way.
    if (isTenant && req.body.owner || !isOwner && !isTenant && req.body.owner) req.body.owner = false;
    if (isTenant && req.body.userName || !isOwner && !isTenant && req.body.userName)
        req.body.userName = (await User.findOne({ _id: req.user }, { userName: 1 })).userName;
    if (isTenant && !req.body.currentTenant || !isOwner && !isTenant && !req.body.currentTenant) req.body.currentTenant = true;

    await User.updateOne({ _id: req.user._id }, { $set: req.body })
    res.status(200).send("User was successfully updated.")
})

module.exports = router;