import { useQuery, useMutation } from '@tanstack/react-query';
import * as chatSessionsApi from '@/lib/api/services/chatSessions';
import { ChatSessionsFilterParams, ChatDetailsFilterParams } from '@/lib/api/services/chatSessions';
import { useAuthToken } from './useIsClient';

// Query keys
export const chatSessionsKeys = {
  all: ['chatSessions'] as const,
  lists: () => [...chatSessionsKeys.all, 'list'] as const,
  list: (params: ChatSessionsFilterParams) => [...chatSessionsKeys.lists(), params] as const,
  details: () => [...chatSessionsKeys.all, 'detail'] as const,
  detail: (id: number) => [...chatSessionsKeys.details(), id] as const,
};

// Hook to fetch chat sessions with filters
export function useChatSessions(params: ChatSessionsFilterParams = {}) {
  const token = useAuthToken();

  return useQuery({
    queryKey: chatSessionsKeys.list(params),
    queryFn: () => chatSessionsApi.getChatSessions(params),
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to fetch chat details (messages) by session ID with filters
export function useChatDetails(params: ChatDetailsFilterParams) {
  const token = useAuthToken();

  return useQuery({
    queryKey: chatSessionsKeys.detail(params.sessionId),
    queryFn: () => chatSessionsApi.getChatDetails(params),
    enabled: !!token && !!params.sessionId,
  });
}

// Hook to export chat sessions
export function useExportChatSessions() {
  return useMutation({
    mutationFn: (params: ChatSessionsFilterParams) => chatSessionsApi.exportChatSessions(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-sessions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}



// Hook to update AI response
export function useUpdateAIResponse(sessionId: number) {
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: number; content: string }) =>
      chatSessionsApi.updateAIResponse(messageId, { content }),
    onSuccess: () => {
      // Invalidate chat details to refetch updated data
      // Note: queryClient needs to be passed or imported for proper invalidation
    },
  });
}
