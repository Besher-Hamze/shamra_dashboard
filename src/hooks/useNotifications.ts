import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { showSuccess, showError } from '@/components/ui/NotificationProvider';
import type { Notification, CreateNotificationData, NotificationStats } from '@/types';

// Get user notifications
export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await apiService.getNotifications();
            return response.data.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Get notification stats
export const useNotificationStats = () => {
    return useQuery({
        queryKey: ['notifications', 'stats'],
        queryFn: async () => {
            const response = await apiService.getNotificationStats();
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Create notification for specific user
export const useCreateNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateNotificationData) => {
            const response = await apiService.createNotification(data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
            showSuccess('تم إرسال الإشعار بنجاح', 'تم إرسال الإشعار للمستخدم المحدد');
        },
        onError: (error: any) => {
            showError('خطأ في إرسال الإشعار', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });
};

// Broadcast notification to all users
export const useBroadcastNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { title: string; message: string }) => {
            const response = await apiService.broadcastNotification(data.title, data.message);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
            showSuccess('تم إرسال الإشعار بنجاح', 'تم إرسال الإشعار لجميع المستخدمين');
        },
        onError: (error: any) => {
            showError('خطأ في إرسال الإشعار', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });
};

// Mark notification as read
export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiService.markNotificationAsRead(id);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
        },
        onError: (error: any) => {
            showError('خطأ في تحديث الإشعار', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });
};

// Mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await apiService.markAllNotificationsAsRead();
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
            showSuccess('تم تحديث الإشعارات', 'تم تحديد جميع الإشعارات كمقروءة');
        },
        onError: (error: any) => {
            showError('خطأ في تحديث الإشعارات', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });
};

// Delete notification
export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiService.deleteNotification(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
            showSuccess('تم حذف الإشعار', 'تم حذف الإشعار بنجاح');
        },
        onError: (error: any) => {
            showError('خطأ في حذف الإشعار', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });
};
