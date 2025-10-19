'use client';

import { useParams, useRouter } from 'next/navigation';
import {
    ArrowRight,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    Crown,
    RefreshCw,
    Mail,
    Phone,
    Calendar,
    Shield
} from 'lucide-react';
import { useUser, useUserMutations } from '@/hooks';
import { UserRole } from '@/types';
import { useDialogHelpers } from '@/components/ui/NotificationProvider';
import { formatDate } from '@/utils/hepler';

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const { user, isLoading, error, refetch } = useUser(userId);
    const { deleteUser, toggleActive, changeRole } = useUserMutations();
    const { confirmDelete, confirmAction } = useDialogHelpers();

    const handleDeleteUser = () => {
        if (user) {
            confirmDelete(
                `${user.firstName} ${user.lastName}`,
                () => deleteUser.mutate(user.id, {
                    onSuccess: () => {
                        router.push('/dashboard/users');
                    },
                })
            );
        }
    };

    const handleToggleActive = () => {
        if (user) {
            const action = user.isActive ? 'إلغاء تفعيل' : 'تفعيل';
            const message = user.isActive
                ? `هل تريد إلغاء تفعيل المستخدم ${user.firstName} ${user.lastName}؟`
                : `هل تريد تفعيل المستخدم ${user.firstName} ${user.lastName}؟`;

            confirmAction(
                `${action} المستخدم`,
                message,
                () => toggleActive.mutate(user.id),
                undefined,
                user.isActive ? 'warning' : 'info'
            );
        }
    };

    const handleUpgradeToMerchant = () => {
        if (user) {
            confirmAction(
                'ترقية المستخدم',
                `هل تريد ترقية المستخدم ${user.firstName} ${user.lastName} إلى تاجر؟`,
                () => changeRole.mutate({ id: user.id, role: UserRole.MERCHANT }),
                undefined,
                'info'
            );
        }
    };

    const handleUpgradeToCustomer = () => {
        if (user) {
            confirmAction(
                'ترقية المستخدم',
                `هل تريد ترقية المستخدم ${user.firstName} ${user.lastName} إلى عميل؟`,
                () => changeRole.mutate({ id: user.id, role: UserRole.CUSTOMER }),
                undefined,
                'info'
            );
        }
    };

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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600 ml-2" />
                    <span className="text-gray-600">جاري التحميل...</span>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">حدث خطأ في تحميل بيانات المستخدم</div>
                    <button
                        onClick={() => router.push('/dashboard/users')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        العودة للمستخدمين
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                    <button
                        onClick={() => router.push('/dashboard/users')}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowRight className="w-5 h-5 ml-2" />
                        العودة للمستخدمين
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">تفاصيل المستخدم</h1>
                        <p className="text-gray-600">عرض وتعديل بيانات المستخدم</p>
                    </div>
                </div>
                <div className="flex space-x-3 space-x-reverse">
                    <button
                        onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل
                    </button>
                </div>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-8">
                    <div className="flex items-start space-x-6 space-x-reverse">
                        {/* Profile Image */}
                        <div className="flex-shrink-0">
                            {user.profileImage ? (
                                <img
                                    className="h-24 w-24 rounded-full object-cover"
                                    src={user.profileImage}
                                    alt={`${user.firstName} ${user.lastName}`}
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-2xl font-medium text-gray-700">
                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* User Details */}
                        <div className="flex-1">
                            <div className="flex items-center space-x-4 space-x-reverse mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                </span>
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${user.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {user.isActive ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Mail className="w-5 h-5 text-gray-400 ml-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">رقم الهاتف</p>
                                            <p className="text-sm text-gray-900">{user.phoneNumber || '-'}</p>
                                        </div>
                                    </div>

                                    {user.phoneNumber && (
                                        <div className="flex items-center">
                                            <Phone className="w-5 h-5 text-gray-400 ml-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">رقم الهاتف</p>
                                                <p className="text-sm text-gray-900">{user.phoneNumber}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 text-gray-400 ml-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">تاريخ الإنشاء</p>
                                            <p className="text-sm text-gray-900">
                                                {formatDate(new Date(user.createdAt))}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {user.branchId && (
                                        <div className="flex items-center">
                                            <Shield className="w-5 h-5 text-gray-400 ml-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">معرف الفرع</p>
                                                <p className="text-sm text-gray-900">{user.branchId}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 text-gray-400 ml-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">آخر تحديث</p>
                                            <p className="text-sm text-gray-900">
                                                {formatDate(new Date(user.updatedAt))}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-3 space-x-reverse">
                            <button
                                onClick={handleToggleActive}
                                disabled={toggleActive.isPending}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${user.isActive
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    } disabled:opacity-50`}
                            >
                                {user.isActive ? (
                                    <>
                                        <UserX className="w-4 h-4 ml-2" />
                                        إلغاء التفعيل
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="w-4 h-4 ml-2" />
                                        تفعيل
                                    </>
                                )}
                            </button>

                            {user.role !== UserRole.MERCHANT && user.role !== UserRole.CUSTOMER && (
                                <button
                                    onClick={handleUpgradeToMerchant}
                                    disabled={changeRole.isPending}
                                    className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium disabled:opacity-50"
                                >
                                    <Crown className="w-4 h-4 ml-2" />
                                    ترقية لتاجر
                                </button>
                            )}
                            {user.role !== UserRole.CUSTOMER && user.role !== UserRole.MERCHANT && (
                                <button
                                    onClick={handleUpgradeToCustomer}
                                    disabled={changeRole.isPending}
                                    className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium disabled:opacity-50"
                                >
                                    <UserCheck className="w-4 h-4 ml-2" />
                                    ترقية لعميل
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleDeleteUser}
                            disabled={deleteUser.isPending}
                            className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف المستخدم
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
