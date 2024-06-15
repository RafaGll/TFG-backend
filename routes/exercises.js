const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Obtener todos los ejercicios
router.get('/', async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear un nuevo ejercicio (Solo administradores)
router.post('/', auth, admin, async (req, res) => {
  const exercise = new Exercise({
    title: req.body.title,
    problem: req.body.problem,
    solution: req.body.solution,
    level: req.body.level,
  });

  try {
    const newExercise = await exercise.save();
    res.status(201).json(newExercise);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtener un ejercicio por ID
router.get('/:id', getExercise, (req, res) => {
  res.json(res.exercise);
});

// Actualizar un ejercicio (Solo administradores)
router.patch('/:id', auth, admin, getExercise, async (req, res) => {
  if (req.body.title != null) {
    res.exercise.title = req.body.title;
  }
  if (req.body.problem != null) {
    res.exercise.problem = req.body.problem;
  }
  if (req.body.solution != null) {
    res.exercise.solution = req.body.solution;
  }
  if (req.body.level != null) {
    res.exercise.level = req.body.level;
  }

  try {
    const updatedExercise = await res.exercise.save();
    res.json(updatedExercise);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar un ejercicio (Solo administradores)
router.delete('/:id', auth, admin, getExercise, async (req, res) => {
  try {
    await res.exercise.remove();
    res.json({ message: 'Deleted Exercise' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getExercise(req, res, next) {
  let exercise;
  try {
    exercise = await Exercise.findById(req.params.id);
    if (exercise == null) {
      return res.status(404).json({ message: 'Cannot find exercise' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.exercise = exercise;
  next();
}

module.exports = router;