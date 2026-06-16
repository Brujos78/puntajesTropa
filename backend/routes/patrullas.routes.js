const express = require("express");
const verificarToken = require("../middleware/auth");
const { listarPatrullas, crearPatrulla, actualizarPatrulla, desactivarPatrulla } = require("../controllers/patrullas.controller");
const router = express.Router();
router.get("/", listarPatrullas);
router.post("/", verificarToken, crearPatrulla);
router.put("/:id", verificarToken, actualizarPatrulla);
router.delete("/:id", verificarToken, desactivarPatrulla);
module.exports = router;
