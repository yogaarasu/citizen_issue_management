// API Configuration for different environments
export const API_BASE_URL = 
  (import.meta as any).env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:5000' 
    : `${window.location.origin}`); // Use full origin for production

// Helper function to make API calls
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: AbortSignal.timeout(30000), // 30 second timeout for mobile
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection and try again.');
    }
    throw error;
  }
};
