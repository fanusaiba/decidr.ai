const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ✅ Common headers
const getHeaders = (auth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// ✅ Common response handler (IMPORTANT)
const handleResponse = async (res) => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

export const api = {
  // ✅ DECISIONS
  async logDecision(data) {
    const res = await fetch(`${BASE_URL}/decisions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getDecisions() {
    const res = await fetch(`${BASE_URL}/decisions`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async predictDecision(data) {
    const res = await fetch(`${BASE_URL}/decisions/predict`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getInsights() {
    const res = await fetch(`${BASE_URL}/decisions/insights`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // ✅ AUTH (NO TOKEN REQUIRED)
  async login(credentials) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  async register(data) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};