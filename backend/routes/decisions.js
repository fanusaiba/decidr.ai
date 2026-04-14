const router = require('express').Router();
const auth = require('../middleware/auth');
const Decision = require('../models/Decision');
const { predict, generateInsights } = require('../ml/predictor');

// All routes require auth
router.use(auth);

// POST /api/decisions — log a new decision
router.post('/', async (req, res) => {
  try {
    const past = await Decision.find({ user: req.user.id }).limit(30).lean();
    const prediction = predict(req.body, past);
    const decision = await Decision.create({
      ...req.body,
      user: req.user.id,
      prediction,
    });
    res.status(201).json({ data: decision });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/decisions — fetch all user decisions
router.get('/', async (req, res) => {
  try {
    const decisions = await Decision.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ data: decisions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/decisions/predict — predict without saving
router.post('/predict', async (req, res) => {
  try {
    const past = await Decision.find({ user: req.user.id }).limit(30).lean();
    const prediction = predict(req.body, past);
    res.json({ data: prediction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/decisions/insights — AI-generated pattern insights
router.get('/insights', async (req, res) => {
  try {
    const decisions = await Decision.find({ user: req.user.id }).lean();
    const insights = generateInsights(decisions);
    res.json({ data: insights });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/decisions/chart — data for trend charts
router.get('/chart', async (req, res) => {
  try {
    const decisions = await Decision.find({ user: req.user.id })
      .sort({ createdAt: 1 })
      .lean();

    const chartData = decisions.map((d, i) => ({
      index: i + 1,
      date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      successProbability: d.prediction?.successProbability ?? null,
      category: d.category,
      timeOfDay: d.timeOfDay,
    }));

    // Category breakdown
    const byCategory = {};
    decisions.forEach(d => {
      if (!byCategory[d.category]) byCategory[d.category] = { category: d.category, count: 0, avgProb: 0, total: 0 };
      byCategory[d.category].count++;
      if (d.prediction?.successProbability != null) {
        byCategory[d.category].total += d.prediction.successProbability;
        byCategory[d.category].avgProb = parseFloat(
          (byCategory[d.category].total / byCategory[d.category].count).toFixed(2)
        );
      }
    });

    res.json({ data: { timeline: chartData, byCategory: Object.values(byCategory) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/decisions/:id/outcome — update actual outcome after the fact
router.patch('/:id/outcome', async (req, res) => {
  try {
    const { actualOutcome } = req.body;
    if (!['positive', 'negative', 'neutral'].includes(actualOutcome)) {
      return res.status(400).json({ error: 'Invalid outcome value' });
    }
    const decision = await Decision.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { actualOutcome },
      { new: true }
    );
    if (!decision) return res.status(404).json({ error: 'Decision not found' });
    res.json({ data: decision });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/decisions/:id
router.delete('/:id', async (req, res) => {
  try {
    const decision = await Decision.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!decision) return res.status(404).json({ error: 'Decision not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
