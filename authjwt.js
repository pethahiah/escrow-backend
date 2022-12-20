const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.SECRET, (err, response) => {
            if (err) {
                return res.status(403).json({success: false, errors: { message : err } });
            }
            req.user = response.user;
            next();
        });
    } else {
        return res.status(401).json({success: false, errors: { message : "Unauthorized" } });
    }
};

module.exports = authenticateJWT;