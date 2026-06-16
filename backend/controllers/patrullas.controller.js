const { ObjectId } = require("mongodb");
const conectarMongo = require("../config/mongodb");

async function listarPatrullas(req, res) {
    const incluirInactivas = req.query.incluirInactivas === "true";
    const filtro = incluirInactivas ? {} : { activa: true };
    const db = await conectarMongo();
    const patrullas = await db.collection("patrullas").find(filtro).sort({ activa: -1, nombre: 1 }).toArray();
    res.json(patrullas);
}

async function crearPatrulla(req, res) {
    const { nombre, color } = req.body;
    if (!nombre || !nombre.trim()) return res.status(400).json({ error: "El nombre de la patrulla es requerido" });

    const db = await conectarMongo();
    const patrulla = {
        nombre: nombre.trim().toUpperCase(),
        color: color || "#c49a3a",
        activa: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
    };
    const resultado = await db.collection("patrullas").insertOne(patrulla);
    res.status(201).json({ ...patrulla, _id: resultado.insertedId });
}

async function actualizarPatrulla(req, res) {
    const { id } = req.params;
    const { nombre, color, activa } = req.body;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });

    const cambios = { fechaActualizacion: new Date() };
    if (nombre && nombre.trim()) cambios.nombre = nombre.trim().toUpperCase();
    if (color) cambios.color = color;
    if (typeof activa === "boolean") cambios.activa = activa;

    const db = await conectarMongo();
    await db.collection("patrullas").updateOne({ _id: new ObjectId(id) }, { $set: cambios });
    res.json({ success: true });
}

async function desactivarPatrulla(req, res) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });
    const db = await conectarMongo();
    await db.collection("patrullas").updateOne(
        { _id: new ObjectId(id) },
        { $set: { activa: false, fechaActualizacion: new Date() } }
    );
    res.json({ success: true });
}

module.exports = { listarPatrullas, crearPatrulla, actualizarPatrulla, desactivarPatrulla };
