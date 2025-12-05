import apiClient from '../client';
import { ApiResponse } from '../types';

// Auth types
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwtToken: string;
  refreshToken: string;
  userId: number;
  role: string;
  isActive: boolean;
  email: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  [key: string]: any;
}

// Auth API functions
export const authApi = {
  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register', payload);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Get refresh token from localStorage
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    
    // Build URL with refreshToken query parameter
    const logoutUrl = refreshToken 
      ? `/auth/logout?refreshToken=${refreshToken}`
      : '/auth/logout';
    
    await apiClient.post(logoutUrl);
    
    // Clear all auth data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_email');
    }
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.get<ApiResponse<LoginResponse>>('/profile/');
    return response.data;
  },
};

