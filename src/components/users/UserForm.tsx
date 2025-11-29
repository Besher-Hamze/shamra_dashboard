'use client';

import { User, UserRole, UpdateUserData, Branch } from '@/types';
import { X, Eye, EyeOff } from 'lucide-react';
import { useUserForm } from '@/hooks';
import { useBranches } from '@/hooks/useBranches';

interface UserFormProps {
    user?: User | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
    const {
        formData,
        showPassword,
        setShowPassword,
        errors,
        setErrors,
        isSubmitting,
        handleInputChange,
        validateForm,
        handleSubmit,
        mutations,
    } = useUserForm(user);

    // Fetch branches for dropdown
    const { data: branchesData } = useBranches({ limit: 100 });
    const branches = branchesData?.data || [];

    // Handle form submission with success callback
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // In edit mode, we only need to validate role (other fields are read-only)
        if (user) {
            // Just proceed with role update, no validation needed for read-only fields
        } else {
            // In create mode, validate all fields
            if (!validateForm()) {
                return;
            }
        }

        try {
            if (user) {
                // Update existing user - only role can be changed
                const updateData: UpdateUserData = {
                    role: formData.role, // Only role is editable in edit mode
                };

                await mutations.updateUser.mutateAsync({
                    id: user.id,
                    data: updateData,
                });
            } else {
                // Create new user
                await mutations.createUser.mutateAsync(formData);
            }
            onSuccess();
        } catch (error: any) {
            if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            }
        }
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.general}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الأول *
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!!user}
                        readOnly={!!user}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.firstName ? 'border-red-300' : 'border-gray-300'
                            } ${user ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
                        placeholder="أدخل الاسم الأول"
                    />
                    {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                </div>

                {/* Last Name */}
                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الأخير *
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!!user}
                        readOnly={!!user}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lastName ? 'border-red-300' : 'border-gray-300'
                            } ${user ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
                        placeholder="أدخل الاسم الأخير"
                    />
                    {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                </div>


                {/* Phone Number */}
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف
                    </label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!!user}
                        readOnly={!!user}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                            } ${user ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
                        placeholder="أدخل رقم الهاتف"
                    />
                    {errors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                </div>

                {/* Password */}
                {!user && (
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            كلمة المرور *
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="أدخل كلمة المرور"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>
                )}

                {/* Role - Only show in edit mode */}
                {user && (
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                            الدور
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={UserRole.EMPLOYEE}>موظف</option>
                            <option value={UserRole.MANAGER}>مشرف</option>
                            <option value={UserRole.ADMIN}>مدير</option>
                            <option value={UserRole.CUSTOMER}>عميل</option>
                            <option value={UserRole.MERCHANT}>تاجر</option>
                        </select>
                    </div>
                )}

              

                {/* Branch Selection */}
                <div className="md:col-span-2">
                    <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 mb-2">
                        الفرع
                    </label>
                    <select
                        id="branchId"
                        name="branchId"
                        value={formData.branchId || ''}
                        onChange={handleInputChange}
                        disabled={!!user}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${user ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
                    >
                        <option value="">اختر الفرع (اختياري)</option>
                        {branches.map((branch: Branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Active Status */}
                <div className="md:col-span-2">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            disabled={!!user}
                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${user ? 'cursor-not-allowed opacity-50' : ''}`}
                        />
                        <label htmlFor="isActive" className={`mr-2 block text-sm ${user ? 'text-gray-500' : 'text-gray-900'}`}>
                            المستخدم نشط
                        </label>
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    إلغاء
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'جاري الحفظ...' : user ? 'تحديث المستخدم' : 'إنشاء المستخدم'}
                </button>
            </div>
        </form>
    );
}
