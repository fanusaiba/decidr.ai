// Rule-based statistical predictor
// Swap predict() with a TensorFlow.js model or Python microservice for production

const CATEGORY_WEIGHTS = {
  study: 0.75,
  health: 0.80,
  work: 0.70,
  social: 0.65,
  sleep: 0.70,
  spending: 0.45,
  other: 0.55,
};

const MOOD_WEIGHTS = {
  '🔥 great': 0.90,
  '😊 good': 0.75,
  '😐 neutral': 0.55,
  '😴 tired': 0.35,
  '😤 stressed': 0.30,
};

const TIME_WEIGHTS = {
  morning: 0.80,
  afternoon: 0.70,
  evening: 0.65,
  night: 0.50,
};

const IMPACT_MESSAGES = {
  study: 'Consistent study decisions compound over weeks — this one matters.',
  spending: 'Spending decisions feel good short-term but erode savings over time.',
  health: 'Health decisions have exponential long-term returns.',
  sleep: 'Sleep quality directly affects every decision you make tomorrow.',
  work: 'Work decisions shape your career trajectory gradually.',
  social: 'Social decisions build or drain emotional reserves over time.',
  other: 'This decision will reveal its full impact within 2–4 weeks.',
};

function analyzeTimePatterns(pastDecisions) {
  const timeSuccess = {};
  pastDecisions.forEach(d => {
    if (!d.timeOfDay) return;
    if (!timeSuccess[d.timeOfDay]) timeSuccess[d.timeOfDay] = { good: 0, total: 0 };
    timeSuccess[d.timeOfDay].total++;
    if (d.actualOutcome === 'positive') timeSuccess[d.timeOfDay].good++;
  });
  return timeSuccess;
}

function predict(decisionData, pastDecisions = []) {
  const catScore = CATEGORY_WEIGHTS[decisionData.category] ?? 0.55;
  const moodScore = MOOD_WEIGHTS[decisionData.mood] ?? 0.55;
  const timeScore = TIME_WEIGHTS[decisionData.timeOfDay] ?? 0.60;

  // Historical pattern boost
  const patterns = analyzeTimePatterns(pastDecisions);
  const tp = patterns[decisionData.timeOfDay];
  const patternBoost = tp && tp.total >= 3
    ? ((tp.good / tp.total) - 0.5) * 0.15
    : 0;

  const raw = catScore * 0.40 + moodScore * 0.35 + timeScore * 0.25 + patternBoost;
  const successProbability = Math.min(0.97, Math.max(0.05, raw));

  const factors = [];
  if (moodScore < 0.4) factors.push('⚠️ Low energy state');
  if (timeScore < 0.55) factors.push('🌙 Late-night decisions are riskier');
  if (catScore > 0.72) factors.push('✅ High-impact category');
  if (decisionData.expectedOutcome === 'positive') factors.push('🎯 Positive intent');
  if (pastDecisions.length > 10) factors.push('📊 Pattern data available');
  if (patternBoost > 0.05) factors.push('🔁 You do well at this time of day');
  if (patternBoost < -0.05) factors.push('📉 Historically weak time for decisions');

  return {
    successProbability: parseFloat(successProbability.toFixed(2)),
    longTermImpact: IMPACT_MESSAGES[decisionData.category] || IMPACT_MESSAGES.other,
    factors,
    confidence: pastDecisions.length >= 5 ? 0.82 : 0.51,
  };
}

function generateInsights(decisions) {
  if (!decisions?.length) return null;

  const byCat = {};
  const byTime = {};
  let resolvedCount = 0;
  let positiveCount = 0;

  decisions.forEach(d => {
    byCat[d.category] = (byCat[d.category] || 0) + 1;
    byTime[d.timeOfDay] = (byTime[d.timeOfDay] || 0) + 1;
    if (d.actualOutcome && d.actualOutcome !== 'pending') {
      resolvedCount++;
      if (d.actualOutcome === 'positive') positiveCount++;
    }
  });

  const bestTimeOfDay = Object.entries(byTime).sort((a, b) => b[1] - a[1])[0]?.[0] || 'morning';
  const riskiestCategory = Object.entries(byCat).sort((a, b) => b[1] - a[1])
    .find(([cat]) => ['spending', 'social', 'other'].includes(cat))?.[0] || 'spending';

  const overallSuccessRate = resolvedCount > 0
    ? parseFloat((positiveCount / resolvedCount).toFixed(2))
    : null;

  const nightCount = byTime.night || 0;
  const spendingCount = byCat.spending || 0;
  const studyCount = byCat.study || 0;

  const patterns = [];
  if (nightCount > 0) {
    patterns.push({
      icon: '🕐',
      message: `You make ${nightCount} decision${nightCount > 1 ? 's' : ''} at night — consider waiting until morning when success rates are higher.`,
      type: 'warn',
    });
  }
  if (spendingCount > 0) {
    patterns.push({
      icon: '💸',
      message: `Spending decisions appear ${spendingCount} time${spendingCount > 1 ? 's' : ''}. This category has the lowest success probability.`,
      type: 'risk',
    });
  }
  if (studyCount > 0) {
    patterns.push({
      icon: '📚',
      message: `Study decisions show up ${studyCount} time${studyCount > 1 ? 's' : ''}. This is your highest-ROI category — keep going.`,
      type: 'positive',
    });
  }
  if (patterns.length === 0) {
    patterns.push({
      icon: '🧠',
      message: 'Keep logging decisions to uncover deeper behavioral patterns.',
      type: 'neutral',
    });
  }

  return {
    patterns: patterns.slice(0, 3),
    bestTimeOfDay,
    riskiestCategory,
    overallSuccessRate,
    totalDecisions: decisions.length,
  };
}

module.exports = { predict, generateInsights };
