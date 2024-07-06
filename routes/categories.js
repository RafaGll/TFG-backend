const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Tutorial = require("../models/Tutorial");
const Exercise = require("../models/Exercise");

// Obtener todas las categorías o filtrar por tipo
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type } : {};
    const categories = await Category.find(query);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear una nueva categoría
router.post("/", async (req, res) => {
  const category = new Category({
    name: req.body.name,
    type: req.body.type,
  });

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Actualizar una categoría
router.patch("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    category.name = req.body.name || category.name;
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (err) {
    console.error("Error actualizando categoría:", err); // Información de depuración
    res.status(400).json({ message: err.message });
  }
});

// Eliminar una categoría
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    const tutorials = await Tutorial.find({ category: req.params.id });
    const exercises = await Exercise.find({ category: req.params.id });

    if (tutorials.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "No se puede eliminar la categoría porque hay tutoriales asociados.",
        });
    }

    if (exercises.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "No se puede eliminar la categoría porque hay ejercicios asociados.",
        });
    }

    await category.deleteOne(); // Usar deleteOne en lugar de remove
    res.json({ message: "Categoría eliminada" });
  } catch (err) {
    console.error("Error eliminando categoría:", err); // Información de depuración
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
