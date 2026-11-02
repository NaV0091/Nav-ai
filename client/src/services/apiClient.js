/**
 * Backend API Client for Nav AI
 * Communicates with Express server for AI scanning, verified food searches,
 * recipe browsing, and guest data migration.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.PROD
    ? ''
    : 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...options.headers };

  // Add auth token if present
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  // Set default JSON Content-Type only if not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || data.error || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If backend is not running or network fails, provide friendly actionable error
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const offlineError = new Error('Cannot reach Nav AI server. Please make sure the Express backend is running on ' + API_BASE_URL);
      offlineError.isNetworkError = true;
      throw offlineError;
    }
    throw err;
  }
}

export async function checkServerHealth() {
  return request('/api/health');
}

export async function analyzeMealImage(formData, token = null) {
  return request('/api/ai/analyze-meal', {
    method: 'POST',
    body: formData,
    token,
  });
}

export async function searchFoods(query) {
  if (!query || query.trim().length === 0) return [];
  const res = await request(`/api/foods/search?q=${encodeURIComponent(query.trim())}`);
  return res.foods || [];
}

export async function getFoodById(id) {
  const res = await request(`/api/foods/${id}`);
  return res.food;
}

export async function getRecipes(category = '', search = '') {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('q', search);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const res = await request(`/api/recipes${queryStr}`);
  return res.recipes || [];
}

export async function getRecipeById(id) {
  const res = await request(`/api/recipes/${id}`);
  return res.recipe;
}

export async function importGuestData(guestData, token) {
  return request('/api/guest/import', {
    method: 'POST',
    body: JSON.stringify(guestData),
    token,
  });
}

export async function getAICoachInsight(userContext, token = null) {
  return request('/api/ai/coach', {
    method: 'POST',
    body: JSON.stringify(userContext),
    token,
  });
}

