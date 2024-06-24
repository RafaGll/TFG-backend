const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const tutorialsRouter = require("./routes/tutorials");
const exercisesRouter = require("./routes/exercises");
const categoriesRouter = require("./routes/categories");
const authRouter = require("./routes/auth");

app.use("/tutorials", tutorialsRouter);
app.use("/exercises", exercisesRouter);
app.use("/categories", categoriesRouter);
app.use("/auth", authRouter);

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
