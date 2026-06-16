const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const conectarMongo = require("../config/mongodb");
require("dotenv").config();

async function login(req, res) {
    const { usuario, password } = req.body;
    if (!usuario || !password) return res.status(400).json({ error: "Usuario y contraseña son requeridos" });

    const db = await conectarMongo();
    const admin = await db.collection("usuarios").findOne({ usuario, activo: true });
    if (!admin) return res.status(401).json({ error: "Credenciales incorrectas" });

    const passwordValido = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordValido) return res.status(401).json({ error: "Credenciales incorrectas" });

    const token = jwt.sign(
        { id: admin._id.toString(), usuario: admin.usuario, rol: admin.rol },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "8h" }
    );

    res.json({ token, usuario: admin.usuario, rol: admin.rol });
}

module.exports = { login };
