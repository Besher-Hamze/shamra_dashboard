import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';

export interface InventoryItem {
    id: string;
    productId: string;
    product?: {
        id: string;
        name: string;
        nameAr: string;
        sku: string;
        mainImage?: string;
    };
    branchId: string;
    branch?: {
        id: string;
        name: string;
        nameAr: string;
    };
    currentStock: number;
    reservedStock?: number;
    availableStock?: number;
    minStockLevel: number;
    maxStockLevel?: number;
    reorderPoint?: number;
    reorderQuantity?: number;
    unitCost: number;
    currency: string;
    unit: string;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    lastUpdated: string;
    createdAt: string;
    updatedAt: string;
}

export interface InventoryTransaction {
    id: string;
    productId: string;
    branchId: string;
    type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN';
    quantity: number;
    unitCost?: number;
    reference?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
}

export interface InventoryQueryParams {
    page?: number;
    limit?: number;
    productId?: string;
    branchId?: string;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    search?: string;
}

export const useInventory = (params: InventoryQueryParams = {}) => {
    return useQuery<PaginatedResponse<InventoryItem>>({
        queryKey: ['inventory', params],
        queryFn: async () => {
            const response = await apiService.getInventory(params);
            return response.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

export const useInventoryItem = (id: string) => {
    return useQuery({
        queryKey: ['inventory', id],
        queryFn: async () => {
            const response = await apiService.getInventory({ productId: id });
            return response.data.data;
        },
        enabled: !!id,
    });
};

export const useLowStockItems = (branchId?: string, limit = 20) => {
    return useQuery({
        queryKey: ['inventory', 'low-stock', branchId, limit],
        queryFn: async () => {
            const response = await apiService.getLowStockItems({ branchId, limit });
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useInventoryStats = (branchId?: string) => {
    return useQuery({
        queryKey: ['inventory', 'stats', branchId],
        queryFn: async () => {
            const response = await apiService.getInventoryStats(branchId);
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useInventoryTransactions = (params: {
    productId?: string;
    branchId?: string;
    type?: string;
    reference?: string;
    page?: number;
    limit?: number;
} = {}) => {
    return useQuery({
        queryKey: ['inventory', 'transactions', params],
        queryFn: async () => {
            // This would be a new API endpoint for inventory transactions
            // const response = await apiService.getInventoryTransactions(params);
            // return response.data.data;

            // Mock data for now
            return {
                transactions: [],
                total: 0,
                page: params.page || 1,
                totalPages: 1
            };
        },
        staleTime: 2 * 60 * 1000,
    });
};

export const useAdjustStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            productId: string;
            branchId: string;
            type: string;
            quantity: number;
            unitCost?: number;
            reference?: string;
            notes?: string;
        }) => {
            const response = await apiService.adjustStock(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useTransferStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            productId: string;
            fromBranchId: string;
            toBranchId: string;
            quantity: number;
            unitCost?: number;
            reference?: string;
            notes?: string;
        }) => {
            // This would use a transfer stock API endpoint
            const response = await apiService.adjustStock({
                ...data,
                branchId: data.fromBranchId,
                type: 'TRANSFER'
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useReserveStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            productId: string;
            branchId: string;
            quantity: number;
        }) => {
            // This would use a reserve stock API endpoint
            const response = await apiService.adjustStock({
                ...data,
                type: 'RESERVATION'
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
    });
};
