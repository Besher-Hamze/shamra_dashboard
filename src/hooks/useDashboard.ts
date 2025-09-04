import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import {
    TopSellingProduct,
    CustomerReportData,
    InventoryReportData,
    BranchPerformance,
    ProductPerformanceData,
    FinancialReportData,
    SalesReportData,
    DashboardSummaryData
} from '@/types';

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

// Additional Report Hooks
export const useTopSellingProducts = (params: { startDate: string; endDate: string; limit?: number; branchId?: string }) => {
    return useQuery<TopSellingProduct[]>({
        queryKey: ['reports', 'top-selling-products', params],
        queryFn: async () => {
            const response = await apiService.getTopSellingProducts(params);
            return response.data.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!params.startDate && !!params.endDate,
    });
};

export const useCustomerReport = (params: { startDate: string; endDate: string }) => {
    return useQuery<CustomerReportData>({
        queryKey: ['reports', 'customers', params],
        queryFn: async () => {
            const response = await apiService.getCustomerReport(params);
            return response.data.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!params.startDate && !!params.endDate,
    });
};

export const useInventoryReport = (params?: { branchId?: string }) => {
    return useQuery<InventoryReportData>({
        queryKey: ['reports', 'inventory', params],
        queryFn: async () => {
            const response = await apiService.getInventoryReport(params);
            return response.data.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useBranchPerformanceReport = (params: { startDate: string; endDate: string }) => {
    return useQuery<BranchPerformance[]>({
        queryKey: ['reports', 'branch-performance', params],
        queryFn: async () => {
            const response = await apiService.getBranchPerformanceReport(params);
            return response.data.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!params.startDate && !!params.endDate,
    });
};

export const useProductPerformanceReport = (params: { startDate: string; endDate: string; branchId?: string }) => {
    return useQuery<ProductPerformanceData[]>({
        queryKey: ['reports', 'product-performance', params],
        queryFn: async () => {
            const response = await apiService.getProductPerformanceReport(params);
            return response.data.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!params.startDate && !!params.endDate,
    });
};

export const useFinancialReport = (params: { startDate: string; endDate: string; branchId?: string }) => {
    return useQuery<FinancialReportData>({
        queryKey: ['reports', 'financial', params],
        queryFn: async () => {
            const response = await apiService.getFinancialReport(params);
            return response.data.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!params.startDate && !!params.endDate,
    });
};



// Export functionality
export const useExportSalesReport = () => {
    return useMutation({
        mutationFn: async (params: { startDate: string; endDate: string; branchId?: string; format?: 'csv' | 'json' }) => {
            const response = await apiService.exportSalesReport(params);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sales-report-${params.startDate}-${params.endDate}.${params.format || 'json'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return response.data;
        },
    });
};
