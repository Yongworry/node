const authMiddleware = (req, res, next) => {
    if (req.body.credential.name === process.env.NAME && req.body.credential.password === process.env.PASSWORD) {
        console.log("[AUTH-MIDDLEWARE] Authorized User");
        next();
    }
    else {
        console.log("[AUTH-MIDDLEWARE] Not Authorized User");
        res.status(401).json({ error: "Not Authorized" });
    }
}

module.exports = authMiddleware;