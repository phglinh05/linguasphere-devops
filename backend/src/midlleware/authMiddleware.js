const jwt = require("jsonwebtoken");

// Middleware for API routes (returns JSON)
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message: "Not authenticated"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err) {
        return res.status(403).json({message: "Invalid token"});
    }
}

// Middleware for page routes (redirects to login)
const authPageMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        return res.redirect("/");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err) {
        return res.redirect("/");
    }
}

module.exports = authMiddleware;
module.exports.authPageMiddleware = authPageMiddleware;