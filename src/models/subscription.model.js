const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: String, 
        ref: 'User',
  required: true},
  subscription: { type: Object, required: true },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
