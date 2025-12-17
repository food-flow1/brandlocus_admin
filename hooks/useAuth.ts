import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginPayload, RegisterPayload } from '@/lib/api';
import { useRouter } from 'next/navigation';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// Login mutation hook
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const data = await authApi.login(payload);
      if (data.data.role !== 'ADMIN') {
        throw new Error('Access denied: You must be an administrator to log in.');
      }
      return data;
    },
    onSuccess: (data) => {
      // Store authentication data in localStorage
      if (typeof window !== 'undefined' && data.data) {
        // Store JWT token
        if (data.data.jwtToken) {
          localStorage.setItem('auth_token', data.data.jwtToken);
        }
        
        // Store refresh token
        if (data.data.refreshToken) {
          localStorage.setItem('refresh_token', data.data.refreshToken);
        }
        
        // Store user data for quick access
        if (data.data.userId) {
          localStorage.setItem('user_id', String(data.data.userId));
        }
        
        if (data.data.role) {
          localStorage.setItem('user_role', data.data.role);
        }
        
        if (data.data.email) {
          localStorage.setItem('user_email', data.data.email);
        }
      }
      
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      
      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
    },
  });
}

// Register mutation hook
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      // Store authentication data in localStorage
      if (typeof window !== 'undefined' && data.data) {
        // Store JWT token
        if (data.data.jwtToken) {
          localStorage.setItem('auth_token', data.data.jwtToken);
        }
        
        // Store refresh token
        if (data.data.refreshToken) {
          localStorage.setItem('refresh_token', data.data.refreshToken);
        }
        
        // Store user data for quick access
        if (data.data.userId) {
          localStorage.setItem('user_id', String(data.data.userId));
        }
        
        if (data.data.role) {
          localStorage.setItem('user_role', data.data.role);
        }
        
        if (data.data.email) {
          localStorage.setItem('user_email', data.data.email);
        }
      }
      
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      
      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      console.error('Register error:', error);
    },
  });
}

// Logout mutation hook
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      
      // Remove all auth data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_email');
      }
      // Redirect to login
      router.push('/login');
    },
  });
}

// Get user profile query hook
export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authApi.getProfile(),
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

