const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const patrullasRoutes = require("./routes/patrullas.routes");
const reunionesRoutes = require("./routes/reuniones.routes");
const reportesRoutes = require("./routes/reportes.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/patrullas", patrullasRoutes);
app.use("/api/reuniones", reunionesRoutes);
app.use("/api/reportes", reportesRoutes);

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => console.log(`Servidor Tropa 78 activo en http://localhost:${PORT}`));
