const API_BASE_URL = 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(),
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const authAPI = {
  login: async (credentials) => {
    return apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  signup: async (userData) => {
    return apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }
};

export const dashboardAPI = {
  getStats: async () => {
    return apiRequest('/api/admin/dashboard/stats');
  },

  getAnalytics: async (period = '30') => {
    return apiRequest(`/api/admin/dashboard/analytics?period=${period}`);
  }
};

export const activityAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/activity?${queryString}`);
  },

  getStats: async () => {
    return apiRequest('/api/activity/stats');
  }
};

export const opportunityAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/admin/opportunities?${queryString}`);
  },

  getById: async (id) => {
    return apiRequest(`/api/admin/opportunities/${id}`);
  },

  create: async (opportunityData) => {
    return apiRequest('/api/admin/opportunities', {
      method: 'POST',
      body: JSON.stringify(opportunityData)
    });
  },

  update: async (id, opportunityData) => {
    return apiRequest(`/api/admin/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(opportunityData)
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/admin/opportunities/${id}`, {
      method: 'DELETE'
    });
  },

  toggleFeature: async (id, featured) => {
    return apiRequest(`/api/admin/opportunities/${id}/feature`, {
      method: 'PUT',
      body: JSON.stringify({ featured })
    });
  },

  duplicate: async (id) => {
    return apiRequest(`/api/admin/opportunities/${id}/duplicate`, {
      method: 'POST'
    });
  },

  bulkUpdate: async (opportunityIds, updateData) => {
    return apiRequest('/api/admin/opportunities/bulk-update', {
      method: 'PUT',
      body: JSON.stringify({ opportunityIds, updateData })
    });
  },

  bulkDelete: async (opportunityIds) => {
    return apiRequest('/api/admin/opportunities/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ opportunityIds })
    });
  }
};

export default {
  authAPI,
  dashboardAPI,
  opportunityAPI
};
