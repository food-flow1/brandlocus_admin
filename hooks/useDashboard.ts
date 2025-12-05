import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '@/lib/api/services/dashboard';
import { DashboardFilterParams } from '@/lib/api/services/dashboard';
import { useIsClient } from './useIsClient';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: (params: DashboardFilterParams) => [...dashboardKeys.all, params] as const,
};

export const userGraphKeys = {
  all: ['userGraph'] as const,
  data: (params: DashboardFilterParams) => [...userGraphKeys.all, params] as const,
};

// Hook to fetch dashboard data with filters
export function useDashboard(params: DashboardFilterParams = {}) {
  const isClient = useIsClient();

  return useQuery({
    queryKey: dashboardKeys.data(params),
    queryFn: () => dashboardApi.getDashboard(params),
    enabled: isClient, // Wait for client-side hydration
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to fetch user graph data with filters
export function useUserGraph(params: DashboardFilterParams = {}) {
  const isClient = useIsClient();

  return useQuery({
    queryKey: userGraphKeys.data(params),
    queryFn: () => dashboardApi.getUserGraph(params),
    enabled: isClient,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
