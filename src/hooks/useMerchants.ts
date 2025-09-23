import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { showSuccess, showError, useDialogHelpers } from '@/components/ui/NotificationProvider';
import { cleanQueryParams } from '@/utils/queryParams';
import {
    type MerchantRequest,
    type CreateMerchantRequestData,
    type UpdateMerchantRequestData,
    type ReviewMerchantRequestData,
    type MerchantRequestsQueryParams,
    type MerchantRequestStats,
    MerchantRequestStatus,
} from '@/types';

// Get all merchant requests
export const useMerchantRequests = (params?: MerchantRequestsQueryParams) => {
    // Filter out empty values from params
    const filteredParams = params ? cleanQueryParams(params) : undefined;

    return useQuery({
        queryKey: ['merchantRequests', filteredParams],
        queryFn: () => apiService.getMerchantRequests(filteredParams),
        select: (response) => {
            console.log(response.data.data)
            return response;
        },
    });
};

// Get single merchant request
export const useMerchantRequest = (id: string) => {
    return useQuery({
        queryKey: ['merchantRequest', id],
        queryFn: () => apiService.getMerchantRequest(id),
        select: (response) => response.data,
        enabled: !!id,
    });
};

// Get my merchant request
export const useMyMerchantRequest = () => {
    return useQuery({
        queryKey: ['myMerchantRequest'],
        queryFn: () => apiService.getMyMerchantRequest(),
        select: (response) => response.data,
    });
};

// Get merchant request statistics
export const useMerchantRequestStats = () => {
    return useQuery({
        queryKey: ['merchantRequestStats'],
        queryFn: () => apiService.getMerchantRequestStats(),
        select: (response) => response.data,
    });
};

// Merchant request mutations
export const useMerchantRequestMutations = () => {
    const queryClient = useQueryClient();
    const dialogs = useDialogHelpers();

    const createMerchantRequest = useMutation({
        mutationFn: (data: CreateMerchantRequestData) => apiService.createMerchantRequest(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['merchantRequests'] });
            queryClient.invalidateQueries({ queryKey: ['myMerchantRequest'] });
            queryClient.invalidateQueries({ queryKey: ['merchantRequestStats'] });
            showSuccess('تم إرسال طلب التاجر بنجاح');
        },
        onError: (error: any) => {
            showError(error.response?.data?.message || 'حدث خطأ أثناء إرسال طلب التاجر');
        },
    });

    const updateMyMerchantRequest = useMutation({
        mutationFn: (data: UpdateMerchantRequestData) => apiService.updateMyMerchantRequest(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['merchantRequests'] });
            queryClient.invalidateQueries({ queryKey: ['myMerchantRequest'] });
            showSuccess('تم تحديث طلب التاجر بنجاح');
        },
        onError: (error: any) => {
            showError(error.response?.data?.message || 'حدث خطأ أثناء تحديث طلب التاجر');
        },
    });

    const reviewMerchantRequest = useMutation({
        mutationFn: ({ id, data }: { id: string; data: ReviewMerchantRequestData }) =>
            apiService.reviewMerchantRequest(id, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['merchantRequests'] });
            queryClient.invalidateQueries({ queryKey: ['merchantRequestStats'] });
            const status = response.data.data.status;
            const message = status === 'approved' ? 'تم الموافقة على طلب التاجر بنجاح' : 'تم رفض طلب التاجر';
            showSuccess(message);
        },
        onError: (error: any) => {
            showError(error.response?.data?.message || 'حدث خطأ أثناء مراجعة طلب التاجر');
        },
    });

    const deleteMerchantRequest = useMutation({
        mutationFn: (id: string) => apiService.deleteMerchantRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchantRequests'] });
            queryClient.invalidateQueries({ queryKey: ['merchantRequestStats'] });
            showSuccess('تم حذف طلب التاجر بنجاح');
        },
        onError: (error: any) => {
            showError(error.response?.data?.message || 'حدث خطأ أثناء حذف طلب التاجر');
        },
    });

    return {
        createMerchantRequest,
        updateMyMerchantRequest,
        reviewMerchantRequest,
        deleteMerchantRequest,
    };
};

// Merchant request management hook with helper functions
export const useMerchantRequestManagement = () => {
    const mutations = useMerchantRequestMutations();
    const dialogs = useDialogHelpers();

    const handleApproveRequest = (id: string) => {
        dialogs.confirmAction(
            'الموافقة على طلب التاجر',
            'هل أنت متأكد من الموافقة على طلب التاجر؟',
            () => {
                mutations.reviewMerchantRequest.mutate({
                    id,
                    data: { status: MerchantRequestStatus.APPROVED },
                });
            }
        );
    };

    const handleRejectRequest = (id: string) => {
        dialogs.confirmAction(
            'رفض طلب التاجر',
            'هل أنت متأكد من رفض طلب التاجر؟',
            () => {
                mutations.reviewMerchantRequest.mutate({
                    id,
                    data: { status: MerchantRequestStatus.REJECTED, rejectionReason: 'تم رفض الطلب من قبل الإدارة' },
                });
            }
        );
    };

    const handleDeleteRequest = (id: string) => {
        dialogs.confirmDelete(
            'هل أنت متأكد من حذف طلب التاجر؟ لا يمكن التراجع عن هذا الإجراء.',
            () => {
                mutations.deleteMerchantRequest.mutate(id);
            }
        );
    };

    return {
        ...mutations,
        handleApproveRequest,
        handleRejectRequest,
        handleDeleteRequest,
    };
};

// Merchant request form hook
export const useMerchantRequestForm = (initialData?: Partial<CreateMerchantRequestData>) => {
    const [formData, setFormData] = useState<CreateMerchantRequestData>({
        storeName: '',
        address: '',
        phoneNumber: '',
        ...initialData,
    });

    const updateField = (field: keyof CreateMerchantRequestData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({
            storeName: '',
            address: '',
            phoneNumber: '',
        });
    };

    return {
        formData,
        updateField,
        resetForm,
    };
};
