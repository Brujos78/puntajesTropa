const conectarMongo = require("../config/mongodb");

function calcularRanking(actividades) {
    const totales = {};
    actividades.forEach(actividad => {
        (actividad.resultados || []).forEach(resultado => {
            const id = resultado.patrullaId;
            if (!totales[id]) {
                totales[id] = {
                    patrullaId: id,
                    nombrePatrulla: resultado.nombrePatrulla,
                    color: resultado.color || "#c49a3a",
                    puntaje: 0
                };
            }
            totales[id].puntaje += Number(resultado.puntaje || 0);
        });
    });
    return Object.values(totales).sort((a, b) => b.puntaje - a.puntaje);
}

async function crearReunion(req, res) {
    const { fecha, nombre, actividades, observaciones } = req.body;
    if (!Array.isArray(actividades) || actividades.length === 0) {
        return res.status(400).json({ error: "Debe incluir al menos una actividad" });
    }

    const rankingFinal = calcularRanking(actividades);
    const mayorPuntaje = rankingFinal.length ? rankingFinal[0].puntaje : 0;
    const ganadores = rankingFinal.filter(p => p.puntaje === mayorPuntaje && mayorPuntaje > 0);

    const reunion = {
        fecha: fecha ? new Date(`${fecha}T12:00:00`) : new Date(),
        nombre: nombre || "Reunión ordinaria",
        actividades,
        rankingFinal,
        ganador: ganadores.map(g => g.nombrePatrulla).join(", "),
        observaciones: observaciones || "",
        fechaCreacion: new Date()
    };

    const db = await conectarMongo();
    const resultado = await db.collection("reuniones").insertOne(reunion);
    res.status(201).json({ ...reunion, _id: resultado.insertedId });
}

async function listarReuniones(req, res) {
    const db = await conectarMongo();
    const reuniones = await db.collection("reuniones").find().sort({ fecha: -1 }).limit(200).toArray();
    res.json(reuniones);
}

module.exports = { crearReunion, listarReuniones };
