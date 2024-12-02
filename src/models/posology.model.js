const mongoose = require('mongoose');

const posologySchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  medicationName: {
    type: String,
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('Posology', posologySchema);
