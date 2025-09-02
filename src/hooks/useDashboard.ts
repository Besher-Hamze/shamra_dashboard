import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: async () => {
            const response = await apiService.getDashboardStats();
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useSalesData = (params?: { startDate?: string; endDate?: string; branchId?: string }) => {
    return useQuery({
        queryKey: ['dashboard', 'sales', params],
        queryFn: async () => {
            const response = await apiService.getSalesReport(params);
            return response.data.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useCategoryData = () => {
    return useQuery({
        queryKey: ['dashboard', 'categories'],
        queryFn: async () => {
            const response = await apiService.getCategories();
            return response.data.data || [];
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
    });
};

export const useRecentOrders = (limit = 5) => {
    return useQuery({
        queryKey: ['dashboard', 'recent-orders', limit],
        queryFn: async () => {
            const response = await apiService.getRecentOrders(limit);
            return response.data.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 30 * 1000, // Refetch every 30 seconds
    });
};
