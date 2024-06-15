const mongoose = require('mongoose');

const TutorialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  level: { type: String, enum: ['basic', 'intermediate', 'advanced'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tutorial', TutorialSchema);