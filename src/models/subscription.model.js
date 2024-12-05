const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  subscription: { type: Object, required: true },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
