const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Obtener todos los usuarios (solo admin)
router.get('/', auth, admin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtener el progreso del usuario autenticado
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); 
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user.completedExercises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Actualizar los ejercicios completados del usuario autenticado
router.patch('/complete-exercise', auth, async (req, res) => {
  const { categoryId, exerciseId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const categoryIndex = user.completedExercises.findIndex(
      (item) => item.category.toString() === categoryId
    );

    if (categoryIndex > -1) {
      if (!user.completedExercises[categoryIndex].completed.includes(exerciseId)) {
        user.completedExercises[categoryIndex].completed.push(exerciseId);
      }
    } else {
      user.completedExercises.push({ category: categoryId, completed: [exerciseId] });
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
