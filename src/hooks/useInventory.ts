import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { showSuccess, showError } from '@/components/ui/NotificationProvider';
import type { ImportResult, PaginatedResponse, InventoryItem as ApiInventoryItem, StockAdjustmentData } from '@/types';

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
    currency: 'USD';
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
    return useQuery<PaginatedResponse<ApiInventoryItem>>({
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
        mutationFn: async (data: StockAdjustmentData) => {
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
                type: 'ADJUSTMENT'
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
    });
};

// Excel Import hooks
export const useImportInventory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            file: File;
            branchId: string;
            importMode: 'replace' | 'add' | 'subtract';
        }) => {
            const response = await apiService.importInventoryFromExcel(
                data.file,
                data.branchId,
                data.importMode
            );
            return response.data.data as ImportResult;
        },
        onSuccess: (result: ImportResult) => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });

            if (result.success) {
                showSuccess(
                    'تم استيراد البيانات بنجاح',
                    `تم معالجة ${result.processedRows} من أصل ${result.totalRows} صف`
                );
            } else {
                showError('خطأ في الاستيراد', result.message);
            }
        },
        onError: (error: any) => {
            showError('خطأ في استيراد البيانات', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });
};

export const useDownloadTemplate = () => {
    return useMutation({
        mutationFn: async () => {
            const response = await apiService.downloadInventoryTemplate();
            return response.data;
        },
        onSuccess: (blob: Blob) => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'inventory_import_template.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showSuccess('تم تحميل القالب', 'تم تحميل قالب الاستيراد بنجاح');
        },
        onError: (error: any) => {
            showError('خطأ في تحميل القالب', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });
};

export const useExportInventory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (branchId?: string) => {
            const response = await apiService.exportInventoryToExcel(branchId);
            return response.data;
        },
        onSuccess: (blob: Blob) => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showSuccess('تم تصدير البيانات', 'تم تصدير بيانات المخزون بنجاح');
        },
        onError: (error: any) => {
            showError('خطأ في التصدير', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });
};

export const useDeleteAllInventory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await apiService.deleteAllInventory();
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });

            showSuccess('تم حذف جميع البيانات', 'تم حذف جميع بيانات المخزون بنجاح');
        },
        onError: (error: any) => {
            showError('خطأ في الحذف', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });
};
