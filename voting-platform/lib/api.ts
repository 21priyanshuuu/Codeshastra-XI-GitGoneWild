// API utility functions for interacting with the backend

import axios from 'axios';

interface TokenResponse {
  access: string;
  refresh: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as any;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<TokenResponse>(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handleApiError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Response:', error.response.data);
    throw new Error(error.response.data.error || error.response.data.detail || 'API request failed');
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error Request:', error.request);
    throw new Error('No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error:', error.message);
    throw error;
  }
};

// Authentication API
export const auth = {
  login: async (username: string, password: string) => {
    try {
      console.log('Attempting login with:', { username });
      const response = await api.post('/auth/login/', { username, password });
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  register: async (data: { username: string; password: string; wallet_address: string; facial_data: string }) => {
    try {
      console.log('Attempting registration with:', { username: data.username, wallet_address: data.wallet_address });
      const response = await api.post('/auth/signup/', data);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  verifyFace: async (voter_id: string, facial_data: string) => {
    try {
      const response = await api.post('/auth/verify-face/', { voter_id, facial_data });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/token/refresh/', { refresh: refreshToken });
      const data = response.data as TokenResponse;
      localStorage.setItem('access_token', data.access);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove tokens even if API call fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },
};

// Elections API
export const elections = {
  getAll: async () => {
    try {
      const response = await api.get('/elections/');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/elections/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  vote: async (electionId: string, voteData: any, nullifierHash: string, merkleProof: any) => {
    try {
      const response = await api.post(`/elections/${electionId}/cast_vote/`, {
        vote_data: voteData,
        nullifier_hash: nullifierHash,
        merkle_proof: merkleProof,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getMerkleProof: async (address: string) => {
    try {
      const response = await api.get(`/merkle-proof/?address=${address}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getResults: async (electionId: string, preliminary: boolean = false) => {
    try {
      const endpoint = preliminary
        ? `/elections/${electionId}/preliminary_results/`
        : `/elections/${electionId}/get_results/`;
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Voters API
export const voters = {
  getProfile: async () => {
    try {
      const response = await api.get('/voters/me/');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateProfile: async (data: any) => {
    try {
      const response = await api.patch('/voters/me/', data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getVotingHistory: async () => {
    try {
      const response = await api.get('/votes/');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDisputes: async () => {
    try {
      const response = await api.get('/disputes/');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default api;

