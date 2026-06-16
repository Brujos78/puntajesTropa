const express = require("express");
const verificarToken = require("../middleware/auth");
const { crearReunion, listarReuniones } = require("../controllers/reuniones.controller");
const router = express.Router();
router.get("/", listarReuniones);
router.post("/", verificarToken, crearReunion);
module.exports = router;
