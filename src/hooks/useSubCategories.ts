import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { PaginatedResponse, SubCategory, SubCategoryQueryParams, CreateSubCategoryData, UpdateSubCategoryData } from '@/types';

// Get sub-categories with filtering and pagination
export const useSubCategories = (params: SubCategoryQueryParams = {}) => {
    return useQuery<SubCategory[]>({
        queryKey: ['sub-categories', params],
        queryFn: async () => {
            const response = await apiService.getSubCategories(params);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Get single sub-category
export const useSubCategory = (id: string) => {
    return useQuery<SubCategory>({
        queryKey: ['sub-category', id],
        queryFn: async () => {
            const response = await apiService.getSubCategory(id);
            return response.data.data;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

// Get sub-categories by category
export const useSubCategoriesByCategory = (categoryId: string) => {
    return useQuery<SubCategory[]>({
        queryKey: ['sub-categories-by-category', categoryId],
        queryFn: async () => {
            const response = await apiService.getSubCategoriesByCategory(categoryId);
            return response.data;
        },
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000,
    });
};


// Create sub-category
export const useCreateSubCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateSubCategoryData) => {
            const response = await apiService.createSubCategory(data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['sub-categories-by-category', variables.categoryId] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

// Create sub-category with image
export const useCreateSubCategoryWithImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ data, imageFile }: { data: CreateSubCategoryData; imageFile?: File }) => {
            const response = await apiService.createSubCategoryWithImage(data, imageFile);
            return response.data;
        },
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['sub-categories-by-category', variables.data.categoryId] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

// Update sub-category
export const useUpdateSubCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateSubCategoryData) => {
            const response = await apiService.updateSubCategory(data.id, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['sub-category', variables.id] });
            if (variables.categoryId) {
                queryClient.invalidateQueries({ queryKey: ['sub-categories-by-category', variables.categoryId] });
            }
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

// Update sub-category with image
export const useUpdateSubCategoryWithImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data, imageFile }: { id: string; data: UpdateSubCategoryData; imageFile?: File }) => {
            const response = await apiService.updateSubCategoryWithImage(id, data, imageFile);
            return response.data;
        },
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['sub-category', variables.id] });
            if (variables.data.categoryId) {
                queryClient.invalidateQueries({ queryKey: ['sub-categories-by-category', variables.data.categoryId] });
            }
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

// Delete sub-category
export const useDeleteSubCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiService.deleteSubCategory(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};
