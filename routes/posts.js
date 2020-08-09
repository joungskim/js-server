//NPM Packages
const router = require('express').Router();

//Local Files
const verify = require('./verifyToken');
const User = require('../model/User');


router.get('/', verify, async(req, res) => {
    res.send(await User.findOne({ _id: req.user }))
})

module.exports = router;