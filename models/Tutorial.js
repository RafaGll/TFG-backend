const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Tutorial', tutorialSchema);