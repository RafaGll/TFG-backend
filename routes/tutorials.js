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
  try {
    // Obtener el mayor número de orden dentro de la categoría
    const maxOrderTutorial = await Tutorial.findOne({ category: req.body.category })
      .sort('-order')
      .exec();

    const newOrder = maxOrderTutorial ? maxOrderTutorial.order + 1 : 1;

    const tutorial = new Tutorial({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      order: newOrder,
    });

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
  const { title, content, category, order } = req.body;
  const currentCategory = res.tutorial.category;
  const currentOrder = res.tutorial.order;

  if (title != null) {
    res.tutorial.title = title;
  }
  if (content != null) {
    res.tutorial.content = content;
  }
  if (category != null) {
    res.tutorial.category = category;
  }
  if (order != null) {
    if (category != null && category.toString() !== currentCategory.toString()) {
      // Cambiar de categoría
      const maxOrderInNewCategory = await Tutorial.findOne({ category })
        .sort('-order')
        .exec();
      const newOrder = maxOrderInNewCategory ? maxOrderInNewCategory.order + 1 : 1;

      res.tutorial.order = newOrder;

      // Actualizar el orden en la categoría antigua
      await Tutorial.updateMany(
        { category: currentCategory, order: { $gt: currentOrder } },
        { $inc: { order: -1 } }
      );
    } else if (category == null || category.toString() === currentCategory.toString()) {
      // Misma categoría
      if (order !== currentOrder) {
        if (order > currentOrder) {
          await Tutorial.updateMany(
            { category: currentCategory, order: { $gt: currentOrder, $lte: order } },
            { $inc: { order: -1 } }
          );
        } else {
          await Tutorial.updateMany(
            { category: currentCategory, order: { $lt: currentOrder, $gte: order } },
            { $inc: { order: 1 } }
          );
        }
        res.tutorial.order = order;
      }
    }
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
    const categoryId = res.tutorial.category;
    const currentOrder = res.tutorial.order;

    await Tutorial.deleteOne({ _id: res.tutorial._id });

    // Actualizar el orden de los tutoriales restantes en la misma categoría
    await Tutorial.updateMany(
      { category: categoryId, order: { $gt: currentOrder } },
      { $inc: { order: -1 } }
    );

    res.json({ message: "Deleted Tutorial" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware para obtener un tutorial por ID
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