const conectarMongo = require("../config/mongodb");

function sumarRanking(reuniones) {
    const acumulado = {};
    reuniones.forEach(reunion => {
        (reunion.rankingFinal || []).forEach(item => {
            const id = item.patrullaId;
            if (!acumulado[id]) {
                acumulado[id] = {
                    patrullaId: id,
                    nombrePatrulla: item.nombrePatrulla,
                    color: item.color || "#c49a3a",
                    puntaje: 0,
                    victorias: 0
                };
            }
            acumulado[id].puntaje += Number(item.puntaje || 0);
        });
        const mayor = (reunion.rankingFinal || [])[0];
        if (mayor && acumulado[mayor.patrullaId]) acumulado[mayor.patrullaId].victorias += 1;
    });
    return Object.values(acumulado).sort((a, b) => b.puntaje - a.puntaje);
}

async function reporteMensual(req, res) {
    const anio = Number(req.params.anio);
    const mes = Number(req.params.mes);
    const inicio = new Date(anio, mes - 1, 1);
    const fin = new Date(anio, mes, 1);
    const db = await conectarMongo();
    const reuniones = await db.collection("reuniones").find({ fecha: { $gte: inicio, $lt: fin } }).sort({ fecha: 1 }).toArray();
    res.json({ anio, mes, totalReuniones: reuniones.length, ranking: sumarRanking(reuniones), reuniones });
}

async function reporteAnual(req, res) {
    const anio = Number(req.params.anio);
    const inicio = new Date(anio, 0, 1);
    const fin = new Date(anio + 1, 0, 1);
    const db = await conectarMongo();
    const reuniones = await db.collection("reuniones").find({ fecha: { $gte: inicio, $lt: fin } }).sort({ fecha: 1 }).toArray();
    res.json({ anio, totalReuniones: reuniones.length, ranking: sumarRanking(reuniones), reuniones });
}

module.exports = { reporteMensual, reporteAnual };
