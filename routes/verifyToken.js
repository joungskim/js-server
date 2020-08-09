const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    //Check if the token exists from header.
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');

    //Verify token with jwt and token secret.
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
}