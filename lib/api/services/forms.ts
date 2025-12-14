import apiClient from '../client';

// Form entry interface
export interface FormEntry {
  formId: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  serviceNeeded: string;
  message: string;
  adminReply: string | null;
  status: string | null;
  isActive: boolean | null;
  submittedAt: string | null;
  repliedAt: string | null;
}

// Form stats from API
export interface FormStatistics {
  activeConversations: number;
  activeConversationsChange: number | null;
  repliedForms: number;
  repliedFormsChange: number | null;
  businessDevelopment: number;
  brandDevelopment: number;
  capacityBuilding: number;
  tradeAndInvestmentFacilitation: number;
  businessQuest: number;
}

// Pagination data
export interface FormsPagination {
  content: FormEntry[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Combined data response
export interface FormsResponseData {
  statistics: FormStatistics;
  pagination: FormsPagination;
}

// Filter term enum
export type FormFilterTerm =
  | 'BUSINESS_DEVELOPMENT'
  | 'BRAND_MANAGEMENT'
  | 'CAPACITY_BUILDING'
  | 'TRADE_AND_INVESTMENT'
  | 'BUSINESS_QUEST';

// Forms filter params
export interface FormsFilterParams {
  searchTerm?: string;
  filterTerm?: FormFilterTerm;
  timeFilter?: '7days' | '30days' | '12months' | 'alltime';
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
}

// API response structure
export interface FormsApiResponse {
  requestTime: string;
  requestType: string;
  referenceId: string;
  status: boolean;
  message: string;
  data: FormsResponseData;
}

// Helper to build query params
const buildQueryParams = (params: FormsFilterParams): string => {
  const queryParams = new URLSearchParams();

  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  if (params.filterTerm) queryParams.append('filterTerm', params.filterTerm);
  if (params.timeFilter) queryParams.append('timeFilter', params.timeFilter);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page !== undefined) queryParams.append('page', String(params.page));
  if (params.limit !== undefined) queryParams.append('limit', String(params.limit));

  return queryParams.toString();
};

// Forms API functions
export const formsApi = {
  // Get all forms with filters (returns both statistics and pagination)
  getForms: async (params: FormsFilterParams = {}): Promise<FormsResponseData> => {
    const queryString = buildQueryParams(params);
    const url = `/forms/get${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<FormsApiResponse>(url);
    return response.data.data;
  },

  // Get form by ID
  getForm: async (formId: string): Promise<FormEntry> => {
    const response = await apiClient.get<{ data: FormEntry }>(`/forms/${formId}`);
    return response.data.data;
  },

  // Export forms to CSV
  exportForms: async (params: FormsFilterParams = {}): Promise<Blob> => {
    const queryString = buildQueryParams(params);
    const url = `/forms/export${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get(url, { responseType: 'blob' });
    return response.data;
  },
};

