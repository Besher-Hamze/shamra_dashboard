import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import type {
    Order,
    CreateOrderData,
    OrdersQueryParams,
    OrderStats,
    PaginatedResponse
} from '@/types';

// Re-export types from the main types file
export type { Order, CreateOrderData, OrdersQueryParams, OrderStats } from '@/types';

export const useOrders = (params: OrdersQueryParams = {}) => {
    return useQuery<PaginatedResponse<Order>>({
        queryKey: ['orders', params],
        queryFn: async () => {
            const response = await apiService.getOrders(params);
            return response.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

export const useOrder = (id: string) => {
    return useQuery<Order>({
        queryKey: ['orders', id],
        queryFn: async () => {
            const response = await apiService.getOrder(id);
            return response.data.data;
        },
        enabled: !!id,
    });
};

export const useOrderStats = () => {
    return useQuery<OrderStats>({
        queryKey: ['orders', 'stats'],
        queryFn: async () => {
            const response = await apiService.getOrderStats();
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useRecentOrders = (limit = 10) => {
    return useQuery({
        queryKey: ['orders', 'recent', limit],
        queryFn: async () => {
            const response = await apiService.getRecentOrders(limit);
            return response.data.data;
        },
        staleTime: 2 * 60 * 1000,
        refetchInterval: 30 * 1000, // Refetch every 30 seconds
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderData: CreateOrderData) => {
            const response = await apiService.createOrder(orderData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useUpdateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CreateOrderData> }) => {
            const response = await apiService.updateOrder(id, data);
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['orders', id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const response = await apiService.updateOrderStatus(id, status);
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['orders', id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};
