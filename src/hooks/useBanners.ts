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

// Helper functions for banner filtering
const getBannerType = (banner: Banner) => {
    if (banner.product || typeof banner.productId === 'object') {
        return 'منتج';
    } else if (banner.category || typeof banner.categoryId === 'object') {
        return 'صنف';
    } else if (banner.subCategory || typeof banner.subCategoryId === 'object') {
        return 'صنف فرعي';
    }
    return 'عام';
};

const getBannerTarget = (banner: Banner) => {
    if (banner.product || typeof banner.productId === 'object') {
        return typeof banner.productId === 'object' ? banner.productId.name : 'منتج';
    } else if (banner.category || typeof banner.categoryId === 'object') {
        return typeof banner.categoryId === 'object' ? banner.categoryId.name : 'صنف';
    } else if (banner.subCategory || typeof banner.subCategoryId === 'object') {
        return typeof banner.subCategoryId === 'object' ? banner.subCategoryId.name : 'صنف فرعي';
    }
    return 'عام';
};

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
    const { confirmDelete } = useDialogHelpers();

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
        confirmDelete(
            'هذا البانر',
            () => deleteBannerMutation.mutate(banner._id)
        );
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

    // Fetch all banners without search/filter parameters for local filtering
    const { data: allBannersData, isLoading } = useBanners();
    const mutations = useBannerMutations();

    const allBanners = allBannersData?.data || [];

    // Local filtering logic
    const filteredBanners = allBanners.filter((banner) => {
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const bannerType = getBannerType(banner).toLowerCase();
            const bannerTarget = getBannerTarget(banner).toLowerCase();

            if (!bannerType.includes(searchLower) && !bannerTarget.includes(searchLower)) {
                return false;
            }
        }

        // Status filter
        if (statusFilter) {
            if (statusFilter === 'active' && !banner.isActive) {
                return false;
            }
            if (statusFilter === 'inactive' && banner.isActive) {
                return false;
            }
        }

        // Type filter
        if (typeFilter) {
            const bannerType = getBannerType(banner);
            if (typeFilter === 'product' && bannerType !== 'منتج') {
                return false;
            }
            if (typeFilter === 'category' && bannerType !== 'صنف') {
                return false;
            }
            if (typeFilter === 'subcategory' && bannerType !== 'صنف فرعي') {
                return false;
            }
            if (typeFilter === 'general' && bannerType !== 'عام') {
                return false;
            }
        }

        return true;
    });

    // Local pagination
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const banners = filteredBanners.slice(startIndex, endIndex);

    const pagination = {
        page: currentPage,
        pages: totalPages,
        total: filteredBanners.length,
        limit: itemsPerPage
    };

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
        setSearchTerm,
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
