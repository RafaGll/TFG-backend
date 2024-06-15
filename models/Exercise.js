const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  problem: { type: String, required: true },
  solution: { type: String, required: true },
  level: { type: String, enum: ['basic', 'intermediate', 'advanced'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exercise', ExerciseSchema);