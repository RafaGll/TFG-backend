const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Asegúrate de cargar dotenv al inicio

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:3001" }));
app.use(express.json());

const tutorialsRouter = require("./routes/tutorials");
const exercisesRouter = require("./routes/exercises");
const authRouter = require("./routes/auth");

app.use("/tutorials", tutorialsRouter);
app.use("/exercises", exercisesRouter);
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
