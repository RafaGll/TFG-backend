const express = require("express");
const router = express.Router();
const Exercise = require("../models/Exercise");
const auth = require("../middleware/auth"); // Middleware de autenticación
const User = require("../models/User"); // Modelo de usuario

// Obtener todos los ejercicios
router.get("/", async (req, res) => {
  try {
    let query = {};
    if (req.query.categoryId) {
      query.category = req.query.categoryId;
    }

    const exercises = await Exercise.find(query)
      .populate("category")
      .sort({ category: 1, level: 1, order: 1 });
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/total", async (req, res) => {
  try {
    const totalExercisesByCategory = await Exercise.aggregate([
      {
        $group: {
          _id: "$category", // Agrupar por categoría
          count: { $sum: 1 } // Contar el número de ejercicios en cada categoría
        }
      },
      {
        $project: {
          _id: 0, // No mostrar el _id por defecto de MongoDB
          categoryId: "$_id", // Mostrar el _id del grupo como categoryId
          count: 1 // Mostrar el conteo de ejercicios
        }
      }
    ]);
    res.json(totalExercisesByCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtener el siguiente ejercicio no completado por el usuario en una categoría específica
router.get("/next/:categoryId", auth, async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const userId = req.user.id;

    // Obtener el progreso del usuario
    const user = await User.findById(userId);
    const completedExerciseIds = user.completedExercises
      .filter((progress) => progress.category.toString() === categoryId)
      .map((progress) => progress.completed)
      .flat();

    // Obtener todos los ejercicios de la categoría
    const exercises = await Exercise.find({ category: categoryId }).sort({
      level: 1, // Primero ordena por nivel (1 = Fácil, 2 = Difícil)
      order: 1, // Luego ordena por orden dentro de cada nivel
    });
    // Encontrar el primer ejercicio fácil no completado
    for (let exercise of exercises) {
      if (
        // exercise.level === 1 &&
        !completedExerciseIds.toString().includes(exercise._id.toString())
      ) {
        return res.json(exercise);
      }
    }
    return res.json(exercises[0]);

    // Encontrar el primer ejercicio difícil no completado
    // for (let exercise of exercises) {
    //   if (
    //     exercise.level === 2 &&
    //     !completedExerciseIds.toString().includes(exercise._id.toString())
    //   ) {
    //     return res.json(exercise);
    //   }
    // }

    // Si todos los ejercicios están completados, devolver un mensaje de error
    res.status(404).json({ message: "No more exercises in this category." });
  } catch (err) {
    // Manejar errores del servidor
    res.status(500).json({ message: err.message });
  }
});

// Crear un nuevo ejercicio
router.post("/", async (req, res) => {
  const {
    problem,
    level,
    category,
    images,
    correctAnswer,
    incorrectAnswers,
    explanation,
  } = req.body;

  try {
    // Obtener el número de orden adecuado para el nuevo ejercicio
    const exercisesInCategoryAndLevel = await Exercise.find({ category, level })
      .sort({ order: -1 })
      .limit(1);
    const newOrder = exercisesInCategoryAndLevel.length
      ? exercisesInCategoryAndLevel[0].order + 1
      : 1;

    const exercise = new Exercise({
      problem,
      level,
      category,
      images,
      answers: {
        correct: correctAnswer,
        incorrect: incorrectAnswers,
      },
      explanation,
      order: newOrder,
    });

    const newExercise = await exercise.save();
    res.status(201).json(newExercise);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Obtener un ejercicio por ID
router.get("/:id", async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id).populate(
      "category"
    );
    if (exercise == null) {
      return res.status(404).json({ message: "Cannot find exercise" });
    }
    res.exercise = exercise;
    res.json(exercise);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Actualizar un ejercicio
router.patch("/:id", async (req, res) => {
  const {
    problem,
    level,
    category,
    images,
    correctAnswer,
    incorrectAnswers,
    explanation,
    order,
  } = req.body;

  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }

    if (order != null && order !== exercise.order) {
      // Reordenar ejercicios si el orden cambia
      if (order < exercise.order) {
        await Exercise.updateMany(
          {
            category: exercise.category,
            level: exercise.level,
            order: { $gte: order, $lt: exercise.order },
          },
          { $inc: { order: 1 } }
        );
      } else {
        await Exercise.updateMany(
          {
            category: exercise.category,
            level: exercise.level,
            order: { $gt: exercise.order, $lte: order },
          },
          { $inc: { order: -1 } }
        );
      }
      exercise.order = order;
    }

    if (problem != null) exercise.problem = problem;
    if (level != null) exercise.level = level;
    if (category != null) exercise.category = category;
    if (images != null) exercise.images = images;
    if (correctAnswer != null) exercise.answers.correct = correctAnswer;
    if (incorrectAnswers != null) exercise.answers.incorrect = incorrectAnswers;
    if (explanation != null) exercise.explanation = explanation;

    const updatedExercise = await exercise.save();
    res.json(updatedExercise);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar un ejercicio
router.delete("/:id", async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }
    
    // Eliminar el ejercicio de los progresos de los usuarios
    await User.updateMany(
      { "completedExercises.completed": exercise._id },
      { $pull: { "completedExercises.$[].completed": exercise._id } }
    );

    await Exercise.deleteOne({ _id: req.params.id });

    // Actualizar el orden de los ejercicios restantes
    await Exercise.updateMany(
      {
        category: exercise.category,
        level: exercise.level,
        order: { $gt: exercise.order },
      },
      { $inc: { order: -1 } }
    );

    res.json({ message: "Deleted Exercise" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
