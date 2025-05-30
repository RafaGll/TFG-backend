const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const FRONTEND_URL = process.env.FRONTEND_URL;
app.use(cors({
  origin: FRONTEND_URL, // Cambia esto por el dominio de tu frontend
  credentials: true
}))
// Aumentar el límite de tamaño de la solicitud
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configuración básica de CORS (permite todas las solicitudes desde cualquier origen)

// O puedes usar una configuración más avanzada de CORS
// const corsOptions = {
//   origin: 'https://tu-dominio-permitido.com', // Cambia esto por tu dominio permitido
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
//   optionsSuccessStatus: 204
// };
// app.use(cors(corsOptions));



// Asegúrate de que la carpeta 'uploads' esté disponible para servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const tutorialsRouter = require("./routes/tutorials");
const exercisesRouter = require("./routes/exercises");
const categoriesRouter = require("./routes/categories");
const authRouter = require("./routes/auth");
const uploadRouter = require("./routes/upload");
const usersRouter = require("./routes/users"); // Añadir el router de usuarios

app.use("/tutorials", tutorialsRouter);
app.use("/exercises", exercisesRouter);
app.use("/categories", categoriesRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter); // Usar el router de usuarios
app.use("/", uploadRouter);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// Manejo de errores global
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    // Enviar una respuesta específica si el token es inválido
    res.status(401).json({ message: 'Token inválido' });
  } else {
    next(err);
  }
});