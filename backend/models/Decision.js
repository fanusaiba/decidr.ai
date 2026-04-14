const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  successProbability: { type: Number, min: 0, max: 1 },
  longTermImpact: String,
  factors: [String],
  confidence: { type: Number, min: 0, max: 1 },
}, { _id: false });

const decisionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    enum: ['study', 'sleep', 'spending', 'health', 'social', 'work', 'other'],
    default: 'other',
  },
  mood: { type: String },
  timeOfDay: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
  },
  expectedOutcome: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'positive',
  },
  actualOutcome: {
    type: String,
    enum: ['positive', 'negative', 'neutral', 'pending'],
    default: 'pending',
  },
  prediction: predictionSchema,
}, { timestamps: true });

module.exports = mongoose.model('Decision', decisionSchema);
