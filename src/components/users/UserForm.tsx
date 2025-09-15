'use client';

import { User } from '@/types';
import { X, Eye, EyeOff } from 'lucide-react';
import { useUserForm } from '@/hooks';

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

    // Handle form submission with success callback
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (user) {
                // Update existing user
                const updateData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    profileImage: formData.profileImage,
                    branchId: formData.branchId,
                    isActive: formData.isActive,
                    ...(formData.password && { password: formData.password }),
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

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'مدير';
            case 'MANAGER':
                return 'مشرف';
            case 'EMPLOYEE':
                return 'موظف';
            case 'MERCHANT':
                return 'تاجر';
            case 'CUSTOMER':
                return 'عميل';
            default:
                return role;
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.firstName ? 'border-red-300' : 'border-gray-300'
                            }`}
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lastName ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="أدخل الاسم الأخير"
                    />
                    {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="أدخل البريد الإلكتروني"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="أدخل رقم الهاتف"
                    />
                    {errors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        كلمة المرور {!user && '*'}
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
                            placeholder={user ? 'اترك فارغاً للحفاظ على كلمة المرور الحالية' : 'أدخل كلمة المرور'}
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

                {/* Role */}
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
                        <option value="EMPLOYEE">موظف</option>
                        <option value="MANAGER">مشرف</option>
                        <option value="ADMIN">مدير</option>
                        <option value="CUSTOMER">عميل</option>
                        <option value="MERCHANT">تاجر</option>
                    </select>
                </div>

                {/* Profile Image */}
                <div className="md:col-span-2">
                    <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-2">
                        صورة الملف الشخصي
                    </label>
                    <input
                        type="url"
                        id="profileImage"
                        name="profileImage"
                        value={formData.profileImage}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="أدخل رابط الصورة"
                    />
                </div>

                {/* Branch ID */}
                <div className="md:col-span-2">
                    <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 mb-2">
                        معرف الفرع
                    </label>
                    <input
                        type="text"
                        id="branchId"
                        name="branchId"
                        value={formData.branchId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="أدخل معرف الفرع"
                    />
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
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="mr-2 block text-sm text-gray-900">
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
