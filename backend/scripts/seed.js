const bcrypt = require("bcryptjs");
const conectarMongo = require("../config/mongodb");
require("dotenv").config();

async function seed() {
    const db = await conectarMongo();
    await db.collection("usuarios").deleteMany({});
    await db.collection("patrullas").deleteMany({});
    await db.collection("reuniones").deleteMany({});

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "7878", 10);
    await db.collection("usuarios").insertOne({
        usuario: process.env.ADMIN_USER || "dirigente",
        passwordHash,
        rol: "DIRIGENTE",
        activo: true,
        fechaCreacion: new Date()
    });

    await db.collection("patrullas").insertMany([
        { nombre: "HALCONES", color: "#c49a3a", activa: true, fechaCreacion: new Date(), fechaActualizacion: new Date() },
        { nombre: "JAGUARES", color: "#d4722a", activa: true, fechaCreacion: new Date(), fechaActualizacion: new Date() },
        { nombre: "MAPACHES", color: "#8a8a6a", activa: true, fechaCreacion: new Date(), fechaActualizacion: new Date() },
        { nombre: "PANTERAS", color: "#9a9aaa", activa: true, fechaCreacion: new Date(), fechaActualizacion: new Date() },
        { nombre: "GACELAS", color: "#6a9a5a", activa: true, fechaCreacion: new Date(), fechaActualizacion: new Date() },
        { nombre: "LOBAS", color: "#b87a9a", activa: true, fechaCreacion: new Date(), fechaActualizacion: new Date() }
    ]);

    await db.collection("patrullas").createIndex({ nombre: 1 });
    await db.collection("reuniones").createIndex({ fecha: -1 });
    console.log("Base inicial creada correctamente.");
    process.exit(0);
}

seed().catch(error => { console.error(error); process.exit(1); });
