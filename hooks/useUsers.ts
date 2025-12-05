import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, UsersFilterParams, User } from '@/lib/api/services/users';
import { useAuthToken } from './useIsClient';

// Query keys
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params: UsersFilterParams) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: number) => [...usersKeys.details(), id] as const,
};

// Get users with filters
export function useUsers(params: UsersFilterParams = {}) {
  const token = useAuthToken();

  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.getUsers(params),
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get single user
export function useUser(userId: number) {
  const token = useAuthToken();

  return useQuery({
    queryKey: usersKeys.detail(userId),
    queryFn: () => usersApi.getUser(userId),
    enabled: !!token && !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => usersApi.deleteUser(userId),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
    onError: (error: Error) => {
      console.error('Delete user error:', error);
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: Partial<User> }) =>
      usersApi.updateUser(userId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific user and list
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
    onError: (error: Error) => {
      console.error('Update user error:', error);
    },
  });
}

// Export users mutation
export function useExportUsers() {
  return useMutation({
    mutationFn: (params: UsersFilterParams) => usersApi.exportUsers(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error: Error) => {
      console.error('Export users error:', error);
    },
  });
}

