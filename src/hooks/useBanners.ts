'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { showSuccess, showError, useDialogHelpers } from '@/components/ui/NotificationProvider';
import type {
    Banner,
    CreateBannerData,
    UpdateBannerData,
    UpdateSortOrderData,
    BannersQueryParams,
    BannerStats,
    PaginatedResponse,
} from '@/types';

// Get all banners with pagination
export function useBanners(params?: BannersQueryParams) {
    return useQuery({
        queryKey: ['banners', params],
        queryFn: async () => {
            const response = await apiService.getBanners(params);
            return response.data;
        },
    });
}

// Get single banner
export function useBanner(id: string) {
    return useQuery({
        queryKey: ['banner', id],
        queryFn: async () => {
            const response = await apiService.getBanner(id);
            return response.data;
        },
        enabled: !!id,
    });
}

// Get active banners
export function useActiveBanners(limit?: number) {
    return useQuery({
        queryKey: ['banners', 'active', limit],
        queryFn: async () => {
            const response = await apiService.getActiveBanners(limit);
            return response.data;
        },
    });
}

// Get banner statistics
export function useBannerStats() {
    return useQuery({
        queryKey: ['banners', 'stats'],
        queryFn: async () => {
            const response = await apiService.getBannerStats();
            return response.data;
        },
    });
}

// Banner mutations
export function useBannerMutations() {
    const queryClient = useQueryClient();
    const { showConfirmDialog } = useDialogHelpers();

    // Create banner
    const createBannerMutation = useMutation({
        mutationFn: (data: CreateBannerData) => apiService.createBanner(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            showSuccess('تم إنشاء البانر بنجاح', 'تم إضافة البانر الجديد بنجاح');
        },
        onError: (error: any) => {
            showError('خطأ في إنشاء البانر', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });

    // Update banner
    const updateBannerMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBannerData }) =>
            apiService.updateBanner(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            queryClient.invalidateQueries({ queryKey: ['banner'] });
            showSuccess('تم تحديث البانر بنجاح', 'تم حفظ التغييرات بنجاح');
        },
        onError: (error: any) => {
            showError('خطأ في تحديث البانر', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });

    // Toggle banner active status
    const toggleActiveMutation = useMutation({
        mutationFn: (id: string) => apiService.toggleBannerActive(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            queryClient.invalidateQueries({ queryKey: ['banner'] });
            showSuccess('تم تحديث حالة البانر', 'تم تغيير حالة البانر بنجاح');
        },
        onError: (error: any) => {
            showError('خطأ في تحديث حالة البانر', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });

    // Update sort order
    const updateSortOrderMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSortOrderData }) =>
            apiService.updateBannerSortOrder(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            showSuccess('تم تحديث ترتيب البانر', 'تم حفظ الترتيب الجديد بنجاح');
        },
        onError: (error: any) => {
            showError('خطأ في تحديث الترتيب', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });

    // Delete banner
    const deleteBannerMutation = useMutation({
        mutationFn: (id: string) => apiService.deleteBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            showSuccess('تم حذف البانر بنجاح', 'تم حذف البانر نهائياً');
        },
        onError: (error: any) => {
            showError('خطأ في حذف البانر', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });

    // Delete banner with confirmation
    const deleteBanner = (banner: Banner) => {
        showConfirmDialog({
            title: 'تأكيد حذف البانر',
            message: `هل أنت متأكد من حذف هذا البانر؟ لا يمكن التراجع عن هذا الإجراء.`,
            onConfirm: () => deleteBannerMutation.mutate(banner._id),
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            type: 'danger',
        });
    };

    return {
        createBannerMutation,
        updateBannerMutation,
        toggleActiveMutation,
        updateSortOrderMutation,
        deleteBannerMutation,
        deleteBanner,
    };
}

// Banner management hook (combines queries and mutations)
export function useBannerManagement() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');

    const queryParams: BannersQueryParams = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        isActive: statusFilter ? statusFilter === 'active' : undefined,
        productId: typeFilter === 'product' ? undefined : undefined,
        categoryId: typeFilter === 'category' ? undefined : undefined,
        subCategoryId: typeFilter === 'subcategory' ? undefined : undefined,
    };

    const { data: bannersData, isLoading } = useBanners(queryParams);
    const mutations = useBannerMutations();

    const banners = bannersData?.data?.data || [];
    const pagination = bannersData?.data?.pagination;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handleTypeFilter = (type: string) => {
        setTypeFilter(type);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setTypeFilter('');
        setCurrentPage(1);
    };

    return {
        // Data
        banners,
        pagination,
        isLoading,

        // Filters
        currentPage,
        searchTerm,
        statusFilter,
        typeFilter,

        // Handlers
        handlePageChange,
        handleSearch,
        handleStatusFilter,
        handleTypeFilter,
        clearFilters,

        // Mutations
        ...mutations,
    };
}

// Banner form hook
export function useBannerForm(bannerId?: string) {
    const { data: banner, isLoading } = useBanner(bannerId || '');
    const { updateBannerMutation, createBannerMutation } = useBannerMutations();

    const isEditing = !!bannerId;

    const handleSubmit = (data: CreateBannerData | UpdateBannerData) => {
        if (isEditing) {
            updateBannerMutation.mutate({ id: bannerId!, data: data as UpdateBannerData });
        } else {
            createBannerMutation.mutate(data as CreateBannerData);
        }
    };

    return {
        banner,
        isLoading,
        isEditing,
        handleSubmit,
        isSubmitting: isEditing ? updateBannerMutation.isPending : createBannerMutation.isPending,
    };
}
