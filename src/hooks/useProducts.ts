import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import type {
    Product,
    CreateProductData,
    ProductsQueryParams,
    ProductStats,
    PaginatedResponse
} from '@/types';

// Re-export types from the main types file
export type { Product, CreateProductData, ProductsQueryParams, ProductStats } from '@/types';

export const useProducts = (params: ProductsQueryParams = {}) => {
    return useQuery<PaginatedResponse<Product>>({
        queryKey: ['products', params],
        queryFn: async () => {
            const response = await apiService.getProducts(params);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useProduct = (id: string) => {
    return useQuery<Product>({
        queryKey: ['products', id],
        queryFn: async () => {
            const response = await apiService.getProduct(id);
            return response.data.data;
        },
        enabled: !!id,
    });
};

export const useFeaturedProducts = (limit = 8) => {
    return useQuery<Product[]>({
        queryKey: ['products', 'featured', limit],
        queryFn: async () => {
            const response = await apiService.getFeaturedProducts(limit);
            return response.data.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useProductStats = () => {
    return useQuery<ProductStats>({
        queryKey: ['products', 'stats'],
        queryFn: async () => {
            const response = await apiService.getProductStats();
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (productData: CreateProductData) => {
            const response = await apiService.createProduct(productData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProductData> }) => {
            const response = await apiService.updateProduct(id, data);
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['products', id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiService.deleteProduct(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};
