import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Category, PaginatedResponse } from '@/types';


export interface CategoriesQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    rootOnly?: boolean;
}

export const useCategories = (params: CategoriesQueryParams = {}) => {
    return useQuery<PaginatedResponse<Category>>({
        queryKey: ['categories', params],
        queryFn: async () => {
            const response = await apiService.getCategories(params);
            return response.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useCategory = (id: string) => {
    return useQuery({
        queryKey: ['categories', id],
        queryFn: async () => {
            const response = await apiService.getCategory(id);
            return response.data.data;
        },
        enabled: !!id,
    });
};

export const useCategoryTree = () => {
    return useQuery({
        queryKey: ['categories', 'tree'],
        queryFn: async () => {
            const response = await apiService.getCategories();
            return response.data.data;
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (categoryData: Partial<Category>) => {
            const response = await apiService.createCategory(categoryData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useCreateCategoryWithImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ categoryData, imageFile }: { categoryData: Partial<Category>; imageFile?: File }) => {
            const response = await apiService.createCategoryWithImage(categoryData, imageFile);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) => {
            const response = await apiService.updateCategoryWithImage(id, data);
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories', id] });
        },
    });
};

export const useUpdateCategoryWithImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, categoryData, imageFile }: { id: string; categoryData: Partial<Category>; imageFile?: File }) => {
            const response = await apiService.updateCategoryWithImage(id, categoryData, imageFile);
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories', id] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiService.deleteCategory(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};
