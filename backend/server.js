require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ✅ CORS FIX (ALLOW MULTIPLE FRONTENDS)
const allowedOrigins = [
  'http://localhost:5173',
  'https://decidr-ai-sandy.vercel.app',
  'https://decidr-ai-git-main-fanusaibas-projects.vercel.app'
  
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));

// ✅ Middleware
app.use(express.json({ limit: '10kb' }));

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/decisions', require('./routes/decisions'));

// ✅ Health check
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);

// ✅ Root route (IMPORTANT for Render)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ 404 handler
app.use((req, res) =>
  res.status(404).json({ error: `Route ${req.path} not found` })
);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ✅ MongoDB + Server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });