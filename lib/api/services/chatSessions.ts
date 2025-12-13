import apiClient from '../client';

// Filter params interface
export interface ChatSessionsFilterParams {
  searchTerm?: string;
  sessionId?: number;
  startDate?: string;
  endDate?: string;
  timeFilter?: 'alltime' | '30days' | '7days' | '24hours';
}

// Chat session interface (list view)
export interface ChatSession {
  sessionId: number;
  name: string;
  createdAt: string;
  status: string;
  content: string;
}

// Individual chat message interface
export interface ChatMessage {
  sessionId: number;
  messageId: number;
  userType: 'USER' | 'AI';
  chatType: 'PROMPT' | 'PROMPT_RESPONSE';
  content: string;
  name: string;
  industryName: string;
  businessName: string;
  createdAt: string;
}

// Chat details API response - data is directly an array of messages
export interface ChatDetailsApiResponse {
  requestTime: string;
  requestType: string;
  referenceId: string;
  status: boolean;
  message: string;
  data: ChatMessage[];
}

// API response data structure
export interface ChatSessionsData {
  content: ChatSession[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Full API response interface
export interface ChatSessionsApiResponse {
  requestTime: string;
  requestType: string;
  referenceId: string;
  status: boolean;
  message: string;
  data: ChatSessionsData;
}

// Get chat sessions with filters
export const getChatSessions = async (params: ChatSessionsFilterParams = {}): Promise<ChatSessionsData> => {
  const queryParams = new URLSearchParams();

  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  if (params.sessionId) queryParams.append('sessionId', params.sessionId.toString());
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.timeFilter) queryParams.append('timeFilter', params.timeFilter);

  const queryString = queryParams.toString();
  const url = `/session/admin/chat-sessions${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<ChatSessionsApiResponse>(url);
  return response.data.data;
};

// Chat details filter params
export interface ChatDetailsFilterParams {
  sessionId: number;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
}

// Get chat details (messages) by session ID
export const getChatDetails = async (params: ChatDetailsFilterParams): Promise<ChatMessage[]> => {
  const queryParams = new URLSearchParams();

  queryParams.append('sessionId', params.sessionId.toString());
  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const url = `/session/admin/chat-sessions?${queryParams.toString()}`;

  const response = await apiClient.get<ChatDetailsApiResponse>(url);
  return response.data.data;
};

// Export chat sessions to CSV
export const exportChatSessions = async (params: ChatSessionsFilterParams = {}): Promise<Blob> => {
  const queryParams = new URLSearchParams();

  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  if (params.sessionId) queryParams.append('sessionId', params.sessionId.toString());
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.timeFilter) queryParams.append('timeFilter', params.timeFilter);

  const queryString = queryParams.toString();
  const url = `/session/admin/chat-sessions/export${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get(url, { responseType: 'blob' });
  return response.data;
};



// Update AI response payload
export interface UpdateAIResponsePayload {
  content: string;
}

// Update AI response API response
export interface UpdateAIResponseApiResponse {
  requestTime: string;
  requestType: string;
  referenceId: string;
  status: boolean;
  message: string;
  data: ChatMessage;
}

// Update AI response by message ID (using local proxy to avoid CORS)
export const updateAIResponse = async (
  messageId: number,
  payload: UpdateAIResponsePayload
): Promise<ChatMessage> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const response = await fetch(`/api/chats/review/${messageId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update AI response');
  }

  const data: UpdateAIResponseApiResponse = await response.json();
  return data.data;
};