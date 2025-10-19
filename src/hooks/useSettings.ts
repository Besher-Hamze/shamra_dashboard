import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { useNotifications } from '@/components/ui/NotificationProvider';

export interface Setting {
    _id: string;
    key: string;
    value: any;
    description: string;
    descriptionAr: string;
    type: 'string' | 'number' | 'boolean';
    category: string;
    isPublic: boolean;
    isEditable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PointsSettings {
    points_rate_usd: number;
    points_rate_syp: number;
    points_rate_try: number;
    points_discount_rate: number;
    points_max_discount_percent: number;
}

export const useSettings = (category?: string) => {
    return useQuery({
        queryKey: ['settings', category],
        queryFn: async () => {
            if (category) {
                const response = await apiService.getSettingsByCategory(category);
                return response.data;
            } else {
                const response = await apiService.getSettings();
                return response.data;
            }
        },
    });
};

export const usePointsSettings = () => {
    return useQuery({
        queryKey: ['settings', 'points'],
        queryFn: async () => {
            const response = await apiService.getSettingsByCategory('system');
            const settings = response.data.data;

            // Filter and format points-related settings
            const pointsSettings: PointsSettings = {
                points_rate_usd: settings.find((s: Setting) => s.key === 'points_rate_usd')?.value || 10,
                points_rate_syp: settings.find((s: Setting) => s.key === 'points_rate_syp')?.value || 10,
                points_rate_try: settings.find((s: Setting) => s.key === 'points_rate_try')?.value || 10,
                points_discount_rate: settings.find((s: Setting) => s.key === 'points_discount_rate')?.value || 1,
                points_max_discount_percent: settings.find((s: Setting) => s.key === 'points_max_discount_percent')?.value || 50,
            };

            return pointsSettings;
        },
    });
};

export const useUpdateSetting = () => {
    const queryClient = useQueryClient();
    const { error, success } = useNotifications();

    return useMutation({
        mutationFn: async ({ key, value }: { key: string; value: any }) => {
            const response = await apiService.updateSetting(key, { value });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            success('تم التحديث بنجاح', 'تم تحديث الإعداد بنجاح');
        },
        onError: (error: any) => {
            error('خطأ في التحديث', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });
};

export const useBulkUpdateSettings = () => {
    const queryClient = useQueryClient();
    const { success, error } = useNotifications();

    return useMutation({
        mutationFn: async (settings: Array<{ key: string; value: any }>) => {
            const response = await apiService.bulkUpdateSettings(settings);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            success('تم التحديث بنجاح', 'تم تحديث جميع الإعدادات بنجاح');
        },
        onError: (error: any) => {
            error('خطأ في التحديث', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });
};
