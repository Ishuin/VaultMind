const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const getAuthHeader = () => {
  const token = localStorage.getItem('thoughtweb-token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    ...options.headers,
    ...getAuthHeader(),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Handle FastAPI validation errors (which are lists)
      if (Array.isArray(data.detail)) {
        const messages = data.detail.map((err: any) => {
          const field = err.loc[err.loc.length - 1];
          return `${field}: ${err.msg}`;
        });
        throw new Error(messages.join(', '));
      }
      
      // Handle string details or fallbacks
      throw new Error(data.detail || 'An unexpected error occurred');
    }

    return data;
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Could not connect to the backend server. Please ensure it is running.');
    }
    throw error;
  }
};
