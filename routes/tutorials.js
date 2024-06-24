const express = require("express");
const router = express.Router();
const Tutorial = require("../models/Tutorial");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Obtener todos los tutoriales
router.get("/", async (req, res) => {
  try {
    const tutorials = await Tutorial.find().sort({ category: 1, order: 1 });
    res.json(tutorials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear un nuevo tutorial (Solo administradores)
router.post("/", auth, admin, async (req, res) => {
  const tutorial = new Tutorial({
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    order: req.body.order,
  });

  try {
    const newTutorial = await tutorial.save();
    res.status(201).json(newTutorial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtener un tutorial por ID
router.get("/:id", getTutorial, (req, res) => {
  res.json(res.tutorial);
});

// Actualizar un tutorial (Solo administradores)
router.patch("/:id", auth, admin, getTutorial, async (req, res) => {
  if (req.body.title != null) {
    res.tutorial.title = req.body.title;
  }
  if (req.body.content != null) {
    res.tutorial.content = req.body.content;
  }
  if (req.body.category != null) {
    res.tutorial.category = req.body.category;
  }
  if (req.body.order != null) {
    res.tutorial.order = req.body.order;
  }

  try {
    const updatedTutorial = await res.tutorial.save();
    res.json(updatedTutorial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar un tutorial (Solo administradores)
router.delete("/:id", auth, admin, getTutorial, async (req, res) => {
  try {
    await res.tutorial.remove();
    res.json({ message: "Deleted Tutorial" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getTutorial(req, res, next) {
  let tutorial;
  try {
    tutorial = await Tutorial.findById(req.params.id);
    if (tutorial == null) {
      return res.status(404).json({ message: "Cannot find tutorial" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.tutorial = tutorial;
  next();
}

module.exports = router;
