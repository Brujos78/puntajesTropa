const jwt = require("jsonwebtoken");
require("dotenv").config();

function verificarToken(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: "Token requerido" });
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

module.exports = verificarToken;
