const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  posology: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Posology',
    required: true,
  },  
  taken: {
    type: Boolean,
    default: false,
  },
  confirmationTime: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('Reminder', reminderSchema);
