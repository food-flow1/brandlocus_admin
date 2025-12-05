import apiClient from '../client';

// Dashboard filter params
export interface DashboardFilterParams {
  filter?: string; // e.g., '12months', '30days', '7days', '24hour'
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

// Chart data point for trends
export interface ChartDataPoint {
  label: string;
  value: number;
  totalUsers: number;
  totalConversations: number;
}

// Dashboard data from API (inner data)
export interface DashboardData {
  totalConversations: number;
  activeUsers: number;
  conversationChange: number;
  userChange: number;
  chartData: ChartDataPoint[];
}

// Inner body response
interface DashboardBodyData {
  requestTime: string;
  requestType: string;
  referenceId: string;
  status: boolean;
  message: string;
  data: DashboardData;
}

// Outer API response wrapper (nested structure)
export interface DashboardApiResponse {
  requestTime: string | null;
  requestType: string | null;
  referenceId: string | null;
  status: boolean;
  message: string;
  data: {
    headers: Record<string, unknown>;
    body: DashboardBodyData;
    statusCode: string;
    statusCodeValue: number;
  };
}

// Get dashboard data with filters
export const getDashboard = async (params: DashboardFilterParams = {}): Promise<DashboardData> => {
  const queryParams = new URLSearchParams();

  if (params.filter) queryParams.append('filter', params.filter);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const url = `/admin/dashboard${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<DashboardApiResponse>(url);
  // Handle nested response structure: data.body.data
  return response.data.data.body.data;
};

// User graph data point (location distribution)
export interface UserLocationDataPoint {
  percentage: string;
  state: string;
  users: number;
}

// User graph API response
export interface UserGraphApiResponse {
  requestTime: string;
  requestType: string;
  referenceId: string;
  status: boolean;
  message: string;
  data: UserLocationDataPoint[];
}

// Get user graph data with filters
export const getUserGraph = async (params: DashboardFilterParams = {}): Promise<UserLocationDataPoint[]> => {
  const queryParams = new URLSearchParams();

  if (params.filter) queryParams.append('filter', params.filter);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const url = `/admin/user-graph${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<UserGraphApiResponse>(url);
  return response.data.data;
};
