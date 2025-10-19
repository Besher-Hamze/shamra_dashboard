import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthService, User } from '@/lib/auth';
import { apiService } from '@/lib/api';

export const useAuth = () => {
    return {
        user: AuthService.getUser(),
        isAuthenticated: AuthService.isAuthenticated(),
        logout: () => {
            AuthService.logout();
            window.location.href = '/login';
        }
    };
};

export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ phoneNumber, password }: { phoneNumber: string; password: string }) => {
            const response = await apiService.login(phoneNumber, password);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                const { access_token, refresh_token, user } = data.data;
                AuthService.setTokens(access_token, refresh_token);
                AuthService.setUser(user as any);
                queryClient.invalidateQueries();
                router.push('/dashboard/reports');
            }
        },
    });
};

export const useProfile = () => {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await apiService.getProfile();
            return response.data.data;
        },
        enabled: AuthService.isAuthenticated(),
    });
};
