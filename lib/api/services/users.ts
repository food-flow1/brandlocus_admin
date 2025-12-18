import apiClient from '../client';
import { ApiResponse } from '../types';

// User types
export interface User {
  userId: number | null;
  firstName: string;
  lastName: string;
  email: string;
  industryName: string;
  businessName: string;
  businessBrief: string;
  profileImageUrl: string | null;
  role: string;
  state: string;
  country: string;
}

// Users filter params
export interface UsersFilterParams {
  searchTerm?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
  timeFilter?: 'alltime' | '30days' | '7days' | '24hours';
  state?: string;
  country?: string;
  page?: number;
  limit?: number;
}

// Paginated users response
export interface UsersResponse {
  content: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Helper to build query params
const buildQueryParams = (params: UsersFilterParams): string => {
  const queryParams = new URLSearchParams();

  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  if (params.userId) queryParams.append('userId', String(params.userId));
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.timeFilter) queryParams.append('timeFilter', params.timeFilter);
  if (params.state) queryParams.append('state', params.state);
  if (params.country) queryParams.append('country', params.country);
  if (params.page !== undefined) queryParams.append('page', String(params.page));
  if (params.limit !== undefined) queryParams.append('limit', String(params.limit));

  return queryParams.toString();
};

// Users API functions
export const usersApi = {
  // Get all users with filters
  getUsers: async (params: UsersFilterParams = {}): Promise<ApiResponse<UsersResponse>> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/users/?${queryString}` : '/users/';
    const response = await apiClient.get<ApiResponse<UsersResponse>>(url);
    return response.data;
  },

  // Get single user by ID
  getUser: async (userId: number): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId: number, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${userId}`, data);
    return response.data;
  },

  // Export users (Returns JSON now for professional processing)
  exportUsers: async (params: UsersFilterParams = {}): Promise<ApiResponse<User[]>> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/users/export?${queryString}` : '/users/export';
    const response = await apiClient.get<ApiResponse<User[]>>(url);
    return response.data;
  },
};

