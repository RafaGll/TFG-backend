const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  problem: { type: String, required: true },
  level: { type: Number, enum: [1, 2], required: true }, 
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: { type: [String] },
  answers: {
    correct: { type: String, required: true },
    incorrect: { type: [String], validate: [arrayLimit, '{PATH} exceeds the limit of 5'] }
  },
  explanation: { type: String },
  order: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

function arrayLimit(val) {
  return val.length <= 5;
}

module.exports = mongoose.model('Exercise', ExerciseSchema);