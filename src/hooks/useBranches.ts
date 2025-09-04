import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { PaginatedResponse, Branch, BaseQueryParams } from '@/types';

export interface BranchesQueryParams extends BaseQueryParams {
    name?: string;
    city?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    isActive?: boolean;
}

export interface CreateBranchData {
    name: string;
    description?: string;
    address: {
        street: string;
        city: string;
    };
    phone?: string;
    email?: string;
    isActive: boolean;
    isMainBranch?: boolean;
    operatingHours?: {
        monday?: { open: string; close: string; };
        tuesday?: { open: string; close: string; };
        wednesday?: { open: string; close: string; };
        thursday?: { open: string; close: string; };
        friday?: { open: string; close: string; };
        saturday?: { open: string; close: string; };
        sunday?: { open: string; close: string; };
    };
    sortOrder?: number;
}

export interface UpdateBranchData extends Partial<CreateBranchData> {
    id: string;
}

// Get branches with filtering and pagination
export const useBranches = (params: BranchesQueryParams = {}) => {
    return useQuery<PaginatedResponse<Branch>>({
        queryKey: ['branches', params],
        queryFn: async () => {
            const response = await apiService.getBranches(params);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Get single branch
export const useBranch = (id: string) => {
    return useQuery<Branch>({
        queryKey: ['branch', id],
        queryFn: async () => {
            const response = await apiService.getBranch(id);
            return response.data.data;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};



// Create branch
export const useCreateBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateBranchData) => {
            const response = await apiService.createBranch(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            queryClient.invalidateQueries({ queryKey: ['branch-stats'] });
        },
    });
};

// Update branch
export const useUpdateBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateBranchData) => {
            const response = await apiService.updateBranch(data.id, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            queryClient.invalidateQueries({ queryKey: ['branch', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['branch-stats'] });
        },
    });
};



// Delete branch
export const useDeleteBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiService.deleteBranch(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            queryClient.invalidateQueries({ queryKey: ['branch-stats'] });
        },
    });
};
