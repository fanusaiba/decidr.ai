import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function useDecisions() {
  const [decisions, setDecisions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [dec, ins] = await Promise.all([
        api.getDecisions(),
        api.getInsights(),
      ]);
      setDecisions(dec.data || []);
      setInsights(ins.data || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const logDecision = async (data) => {
    const result = await api.logDecision(data);
    await fetchAll();
    return result;
  };

  const predict = async (data) => {
    return api.predictDecision(data);
  };

  return { decisions, insights, loading, error, logDecision, predict, refresh: fetchAll };
}
