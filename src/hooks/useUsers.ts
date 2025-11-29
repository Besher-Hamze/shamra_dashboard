import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { User, UsersQueryParams, CreateUserData, UpdateUserData, UserRole } from '@/types';
import { showSuccess, showError, useDialogHelpers } from '@/components/ui/NotificationProvider';

// Hook for managing users list with pagination and filtering
export function useUsers(queryParams: UsersQueryParams) {
    const queryClient = useQueryClient();

    const { data: usersResponse, isLoading, error, refetch } = useQuery({
        queryKey: ['users', queryParams],
        queryFn: () => apiService.getUsers(queryParams),
    });

    const users = usersResponse?.data?.data ? usersResponse?.data?.data : [];
    const pagination = usersResponse?.data?.pagination;

    return {
        users,
        pagination,
        isLoading,
        error,
        refetch,
    };
}

// Hook for managing a single user
export function useUser(userId: string) {
    const { data: userResponse, isLoading, error, refetch } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => apiService.getUserById(userId),
        enabled: !!userId,
    });

    const user = userResponse?.data?.data;

    return {
        user,
        isLoading,
        error,
        refetch,
    };
}

// Hook for user mutations (create, update, delete, etc.)
export function useUserMutations() {
    const queryClient = useQueryClient();

    // Create user mutation
    const createUserMutation = useMutation({
        mutationFn: (userData: CreateUserData) => apiService.createUser(userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            showSuccess('تم إنشاء المستخدم بنجاح', 'تم إضافة المستخدم الجديد إلى النظام');
        },
        onError: (error: any) => {
            showError('خطأ في إنشاء المستخدم', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });

    // Update user mutation
    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
            apiService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            showSuccess('تم تحديث المستخدم بنجاح', 'تم حفظ التغييرات بنجاح');
        },
        onError: (error: any) => {
            showError('خطأ في تحديث المستخدم', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: (id: string) => apiService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            showSuccess('تم حذف المستخدم بنجاح', 'تم حذف المستخدم من النظام');
        },
        onError: (error: any) => {
            showError('خطأ في حذف المستخدم', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });

    // Toggle user active status mutation
    const toggleActiveMutation = useMutation({
        mutationFn: (id: string) => apiService.toggleUserActive(id),
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            showSuccess('تم تحديث حالة المستخدم', 'تم تغيير حالة المستخدم بنجاح');
        },
        onError: (error: any) => {
            showError('خطأ في تحديث حالة المستخدم', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });

    // Change role mutation
    const changeRoleMutation = useMutation({
        mutationFn: ({ id, role }: { id: string; role: UserRole }) => apiService.changeRole(id, role),
        onSuccess: (_, { role }) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            const roleLabel = getRoleLabel(role);
            showSuccess('تم تغيير الدور بنجاح', `تم تغيير دور المستخدم إلى ${roleLabel}`);
        },
        onError: (error: any) => {
            showError('خطأ في تغيير الدور', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });

    // Change branch mutation
    const changeBranchMutation = useMutation({
        mutationFn: ({ id, branchId }: { id: string; branchId: string }) => apiService.changeBranch(id, branchId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            showSuccess('تم تغيير الفرع بنجاح', 'تم تغيير فرع المستخدم بنجاح');
        },
        onError: (error: any) => {
            showError('خطأ في تغيير الفرع', error.response?.data?.message || 'حدث خطأ غير متوقع');
        },
    });

    const getRoleLabel = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'مدير';
            case UserRole.MANAGER:
                return 'مشرف';
            case UserRole.EMPLOYEE:
                return 'موظف';
            case UserRole.MERCHANT:
                return 'تاجر';
            case UserRole.CUSTOMER:
                return 'عميل';
            default:
                return role;
        }
    };

    return {
        createUser: createUserMutation,
        updateUser: updateUserMutation,
        deleteUser: deleteUserMutation,
        toggleActive: toggleActiveMutation,
        changeRole: changeRoleMutation,
        changeBranch: changeBranchMutation,
    };
}

// Hook for user profile management
export function useUserProfile() {
    const queryClient = useQueryClient();

    const { data: profileResponse, isLoading, error, refetch } = useQuery({
        queryKey: ['user-profile'],
        queryFn: () => apiService.getProfile(),
    });

    const profile = profileResponse?.data?.data;

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data: UpdateUserData) => apiService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
    });

    // Change password mutation
    const changePasswordMutation = useMutation({
        mutationFn: (data: { currentPassword: string; newPassword: string }) =>
            apiService.changePassword(data),
        onSuccess: () => {
            // Password change doesn't need to invalidate queries
        },
    });

    return {
        profile,
        isLoading,
        error,
        refetch,
        updateProfile: updateProfileMutation,
        changePassword: changePasswordMutation,
    };
}

// Hook for user management state and actions
export function useUserManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [branchFilter, setBranchFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

    // Build query parameters
    const queryParams: UsersQueryParams = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        role: (roleFilter as UserRole) || undefined,
        isActive: statusFilter ? statusFilter === 'active' : undefined,
        branchId: branchFilter || undefined,
    };

    // Get users data
    const { users, pagination, isLoading, error, refetch } = useUsers(queryParams);

    // Get mutations
    const mutations = useUserMutations();

    // Get dialog helpers
    const { confirmDelete, confirmAction } = useDialogHelpers();

    // Handlers
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        refetch();
    };

    const handleFilterChange = () => {
        setCurrentPage(1);
        refetch();
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setShowUserForm(true);
        setShowActionsMenu(null);
    };

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setShowUserDetails(true);
        setShowActionsMenu(null);
    };

    const handleDeleteUser = (user: User) => {
        confirmDelete(
            `${user.firstName} ${user.lastName}`,
            () => mutations.deleteUser.mutate(user.id)
        );
    };

    const handleToggleActive = (user: User) => {
        const action = user.isActive ? 'إلغاء تفعيل' : 'تفعيل';
        const message = user.isActive
            ? `هل تريد إلغاء تفعيل المستخدم ${user.firstName} ${user.lastName}؟`
            : `هل تريد تفعيل المستخدم ${user.firstName} ${user.lastName}؟`;

        confirmAction(
            `${action} المستخدم`,
            message,
            () => mutations.toggleActive.mutate(user.id),
            undefined,
            user.isActive ? 'warning' : 'info'
        );
    };

    const handleUpgradeToMerchant = (user: User) => {
        confirmAction(
            'ترقية المستخدم',
            `هل تريد ترقية المستخدم ${user.firstName} ${user.lastName} إلى تاجر؟`,
            () => mutations.changeRole.mutate({ id: user.id, role: UserRole.MERCHANT }),
            undefined,
            'info'
        );
    };

    const handleUpgradeToCustomer = (user: User) => {
        confirmAction(
            'ترقية المستخدم',
            `هل تريد ترقية المستخدم ${user.firstName} ${user.lastName} إلى عميل؟`,
            () => mutations.changeRole.mutate({ id: user.id, role: UserRole.CUSTOMER }),
            undefined,
            'info'
        );
    };

    const handleChangeBranch = (user: User, branchId: string) => {
        confirmAction(
            'تغيير الفرع',
            `هل تريد تغيير فرع المستخدم ${user.firstName} ${user.lastName}؟`,
            () => mutations.changeBranch.mutate({ id: user.id, branchId }),
            undefined,
            'info'
        );
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setShowUserForm(true);
    };

    const handleCloseUserForm = () => {
        setShowUserForm(false);
        setEditingUser(null);
    };

    const handleCloseUserDetails = () => {
        setShowUserDetails(false);
        setSelectedUser(null);
    };

    const handleCloseActionsMenu = () => {
        setShowActionsMenu(null);
    };

    const handleFormSuccess = () => {
        handleCloseUserForm();
        refetch();
    };

    // Utility functions
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'bg-red-100 text-red-800';
            case UserRole.MANAGER:
                return 'bg-blue-100 text-blue-800';
            case UserRole.EMPLOYEE:
                return 'bg-green-100 text-green-800';
            case UserRole.MERCHANT:
                return 'bg-purple-100 text-purple-800';
            case UserRole.CUSTOMER:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'مدير';
            case UserRole.MANAGER:
                return 'مشرف';
            case UserRole.EMPLOYEE:
                return 'موظف';
            case UserRole.MERCHANT:
                return 'تاجر';
            case UserRole.CUSTOMER:
                return 'عميل';
            default:
                return role;
        }
    };

    return {
        // State
        searchTerm,
        setSearchTerm,
        roleFilter,
        setRoleFilter,
        statusFilter,
        setStatusFilter,
        branchFilter,
        setBranchFilter,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        showUserForm,
        editingUser,
        selectedUser,
        showUserDetails,
        showActionsMenu,
        setShowActionsMenu,

        // Data
        users,
        pagination,
        isLoading,
        error,

        // Handlers
        handleSearch,
        handleFilterChange,
        handleEditUser,
        handleViewUser,
        handleDeleteUser,
        handleToggleActive,
        handleUpgradeToMerchant,
        handleUpgradeToCustomer,
        handleChangeBranch,
        handleAddUser,
        handleCloseUserForm,
        handleCloseUserDetails,
        handleCloseActionsMenu,
        handleFormSuccess,

        // Mutations
        mutations,

        // Utilities
        getRoleBadgeColor,
        getRoleLabel,
        refetch,
    };
}

// Hook for user form management
export function useUserForm(user?: User | null) {
    const [formData, setFormData] = useState<CreateUserData>({
        firstName: '',
        lastName: '',
        password: '',
        role: UserRole.EMPLOYEE,
        phoneNumber: '',
        profileImage: '',
        branchId: '',
        isActive: true,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const mutations = useUserMutations();

    // Initialize form data when editing
    React.useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber || '',
                password: '', // Don't pre-fill password
                role: user.role,
                profileImage: user.profileImage || '',
                branchId: user.branchId || '',
                isActive: user.isActive,
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'الاسم الأول مطلوب';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'الاسم الأخير مطلوب';
        }


        if (!user && !formData.password.trim()) {
            newErrors.password = 'كلمة المرور مطلوبة';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        }

        if (formData.phoneNumber && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'رقم الهاتف غير صحيح';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            if (user) {
                // Update existing user
                const updateData: UpdateUserData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phoneNumber,
                    profileImage: formData.profileImage,
                    branchId: formData.branchId,
                    isActive: formData.isActive,
                    role: formData.role, // Include role in update
                };

                // Only include password if it's provided
                if (formData.password) {
                    (updateData as any).password = formData.password;
                }

                await mutations.updateUser.mutateAsync({
                    id: user.id,
                    data: updateData,
                });
            } else {
                // Create new user
                await mutations.createUser.mutateAsync(formData);
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        setFormData,
        showPassword,
        setShowPassword,
        errors,
        setErrors,
        isSubmitting,
        handleInputChange,
        validateForm,
        handleSubmit,
        mutations,
    };
}
