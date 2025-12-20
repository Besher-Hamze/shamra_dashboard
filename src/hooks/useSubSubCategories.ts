import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { SubSubCategory, SubSubCategoryQueryParams, CreateSubSubCategoryData, UpdateSubSubCategoryData } from '@/types';

// Get sub-sub-categories with filtering
export const useSubSubCategories = (params: SubSubCategoryQueryParams = {}) => {
    return useQuery<SubSubCategory[]>({
        queryKey: ['sub-sub-categories', params],
        queryFn: async () => {
            const response = await apiService.getSubSubCategories(params);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Get single sub-sub-category
export const useSubSubCategory = (id: string) => {
    return useQuery<SubSubCategory>({
        queryKey: ['sub-sub-category', id],
        queryFn: async () => {
            const response = await apiService.getSubSubCategory(id);
            return response.data.data;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

// Get sub-sub-categories by sub-category
export const useSubSubCategoriesBySubCategory = (subCategoryId: string) => {
    return useQuery<SubSubCategory[]>({
        queryKey: ['sub-sub-categories-by-sub-category', subCategoryId],
        queryFn: async () => {
            const response = await apiService.getSubSubCategoriesBySubCategory(subCategoryId);
            return response.data;
        },
        enabled: !!subCategoryId,
        staleTime: 5 * 60 * 1000,
    });
};

// Create sub-sub-category
export const useCreateSubSubCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateSubSubCategoryData) => {
            const response = await apiService.createSubSubCategory(data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sub-sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['sub-sub-categories-by-sub-category', variables.subCategoryId] });
            queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

// Create sub-sub-category with image
export const useCreateSubSubCategoryWithImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ data, imageFile }: { data: CreateSubSubCategoryData; imageFile?: File }) => {
            const response = await apiService.createSubSubCategoryWithImage(data, imageFile);
            return response.data;
        },
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sub-sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['sub-sub-categories-by-sub-category', variables.data.subCategoryId] });
            queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

// Update sub-sub-category
export const useUpdateSubSubCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateSubSubCategoryData) => {
            const response = await apiService.updateSubSubCategory(data.id, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sub-sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['sub-sub-category', variables.id] });
            if (variables.subCategoryId) {
                queryClient.invalidateQueries({ queryKey: ['sub-sub-categories-by-sub-category', variables.subCategoryId] });
            }
            queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

// Update sub-sub-category with image
export const useUpdateSubSubCategoryWithImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data, imageFile }: { id: string; data: UpdateSubSubCategoryData; imageFile?: File }) => {
            const response = await apiService.updateSubSubCategoryWithImage(id, data, imageFile);
            return response.data;
        },
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sub-sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['sub-sub-category', variables.id] });
            if (variables.data.subCategoryId) {
                queryClient.invalidateQueries({ queryKey: ['sub-sub-categories-by-sub-category', variables.data.subCategoryId] });
            }
            queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

// Delete sub-sub-category
export const useDeleteSubSubCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiService.deleteSubSubCategory(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sub-sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

