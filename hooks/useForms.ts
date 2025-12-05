import { useQuery } from '@tanstack/react-query';
import { formsApi, FormsFilterParams } from '@/lib/api/services/forms';
import { useAuthToken } from './useIsClient';

// Query keys
export const formsKeys = {
  all: ['forms'] as const,
  lists: () => [...formsKeys.all, 'list'] as const,
  list: (params: FormsFilterParams) => [...formsKeys.lists(), params] as const,
  details: () => [...formsKeys.all, 'detail'] as const,
  detail: (id: string) => [...formsKeys.details(), id] as const,
};

// Hook to fetch forms with filters (returns both statistics and pagination)
export function useForms(params: FormsFilterParams = {}) {
  const token = useAuthToken();

  return useQuery({
    queryKey: formsKeys.list(params),
    queryFn: () => formsApi.getForms(params),
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to fetch single form by ID
export function useForm(formId: string) {
  const token = useAuthToken();

  return useQuery({
    queryKey: formsKeys.detail(formId),
    queryFn: () => formsApi.getForm(formId),
    enabled: !!token && !!formId,
    staleTime: 2 * 60 * 1000,
  });
}

// Re-export types for convenience
export type {
  FormsFilterParams,
  FormEntry,
  FormsPagination,
  FormFilterTerm,
  FormStatistics,
  FormsResponseData,
} from '@/lib/api/services/forms';

