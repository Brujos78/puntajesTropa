const express = require("express");
const { reporteMensual, reporteAnual } = require("../controllers/reportes.controller");
const router = express.Router();
router.get("/mensual/:anio/:mes", reporteMensual);
router.get("/anual/:anio", reporteAnual);
module.exports = router;
