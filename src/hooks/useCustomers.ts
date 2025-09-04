import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { CreateCustomerData, PaginatedResponse } from '@/types';

export interface CustomerAddress {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
}

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    customerCode?: string;
    address?: CustomerAddress;
    isActive: boolean;
    notes?: string;
    totalOrders?: number;
    totalSpent?: number;
    lastOrderDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CustomersQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    city?: string;
    sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt' | 'totalSpent';
    sortOrder?: 'asc' | 'desc';
}

export const useCustomers = (params: CustomersQueryParams = {}) => {
    return useQuery<PaginatedResponse<Customer>>({
        queryKey: ['customers', params],
        queryFn: async () => {
            const response = await apiService.getCustomers(params);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useCustomer = (id: string) => {
    return useQuery({
        queryKey: ['customers', id],
        queryFn: async () => {
            const response = await apiService.getCustomer(id);
            return response.data.data;
        },
        enabled: !!id,
    });
};

export const useCustomerStats = () => {
    return useQuery({
        queryKey: ['customers', 'stats'],
        queryFn: async () => {
            const response = await apiService.getCustomerStats();
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useTopCustomers = (limit = 10) => {
    return useQuery({
        queryKey: ['customers', 'top', limit],
        queryFn: async () => {
            const response = await apiService.getTopCustomers(limit);
            return response.data.data;
        },
        staleTime: 10 * 60 * 1000,
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (customerData: CreateCustomerData) => {
            const response = await apiService.createCustomer(customerData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
            const response = await apiService.updateCustomer(id, data);
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['customers', id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiService.deleteCustomer(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};
