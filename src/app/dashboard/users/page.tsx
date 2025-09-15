'use client';

import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    Crown,
    Eye,
    RefreshCw
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import UserForm from '@/components/users/UserForm';
import { useUserManagement } from '@/hooks';
import { User, UserRole } from '@/types';
import { formatDate } from '@/utils/hepler';

export default function UsersPage() {
    const {
        // State
        searchTerm,
        setSearchTerm,
        roleFilter,
        setRoleFilter,
        statusFilter,
        setStatusFilter,
        currentPage,
        setCurrentPage,
        pageSize,
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
        handleAddUser,
        handleCloseUserForm,
        handleCloseUserDetails,
        handleFormSuccess,

        // Utilities
        getRoleBadgeColor,
        getRoleLabel,
        refetch,
    } = useUserManagement();

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">حدث خطأ في تحميل المستخدمين</div>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
                    <p className="text-gray-600">إدارة جميع المستخدمين في النظام</p>
                </div>
                <button
                    onClick={handleAddUser}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة مستخدم
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="البحث في المستخدمين..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Role Filter */}
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                handleFilterChange();
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">جميع الأدوار</option>
                            <option value="admin">مدير</option>
                            <option value="manager">مشرف</option>
                            <option value="employee">موظف</option>
                            <option value="merchant">تاجر</option>
                            <option value="customer">عميل</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                handleFilterChange();
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">جميع الحالات</option>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>

                        {/* Search Button */}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Search className="w-5 h-5 ml-2 inline" />
                            بحث
                        </button>
                    </div>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    المستخدم
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    البريد الإلكتروني
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الدور
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الحالة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    تاريخ الإنشاء
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 ml-2" />
                                            <span className="text-gray-600">جاري التحميل...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        لا توجد مستخدمين
                                    </td>
                                </tr>
                            ) : (
                                users.map((user: User) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {user.profileImage ? (
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={user.profileImage}
                                                            alt={`${user.firstName} ${user.lastName}`}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mr-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.phoneNumber || 'لا يوجد رقم هاتف'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.isActive ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(new Date(user.createdAt))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowActionsMenu(showActionsMenu === user.id ? null : user.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                                {showActionsMenu === user.id && (
                                                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => {
                                                                    handleViewUser(user);
                                                                    setShowActionsMenu(null);
                                                                }}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                <Eye className="w-4 h-4 ml-3" />
                                                                عرض التفاصيل
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleEditUser(user);
                                                                    setShowActionsMenu(null);
                                                                }}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                <Edit className="w-4 h-4 ml-3" />
                                                                تعديل
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleToggleActive(user);
                                                                    setShowActionsMenu(null);
                                                                }}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                {user.isActive ? (
                                                                    <>
                                                                        <UserX className="w-4 h-4 ml-3" />
                                                                        إلغاء التفعيل
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck className="w-4 h-4 ml-3" />
                                                                        تفعيل
                                                                    </>
                                                                )}
                                                            </button>
                                                            {user.role !== UserRole.MERCHANT && (
                                                                <button
                                                                    onClick={() => {
                                                                        handleUpgradeToMerchant(user);
                                                                        setShowActionsMenu(null);
                                                                    }}
                                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    <Crown className="w-4 h-4 ml-3" />
                                                                    ترقية لتاجر
                                                                </button>
                                                            )}
                                                            {user.role !== UserRole.CUSTOMER && (
                                                                <button
                                                                    onClick={() => {
                                                                        handleUpgradeToCustomer(user);
                                                                        setShowActionsMenu(null);
                                                                    }}
                                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    <UserCheck className="w-4 h-4 ml-3" />
                                                                    ترقية لعميل
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    handleDeleteUser(user);
                                                                    setShowActionsMenu(null);
                                                                }}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4 ml-3" />
                                                                حذف
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={!pagination.hasPrev}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                السابق
                            </button>
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={!pagination.hasNext}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                التالي
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    عرض{' '}
                                    <span className="font-medium">
                                        {((currentPage - 1) * pageSize) + 1}
                                    </span>{' '}
                                    إلى{' '}
                                    <span className="font-medium">
                                        {Math.min(currentPage * pageSize, pagination.total)}
                                    </span>{' '}
                                    من{' '}
                                    <span className="font-medium">{pagination.total}</span>{' '}
                                    نتيجة
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={!pagination.hasPrev}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        السابق
                                    </button>
                                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={!pagination.hasNext}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        التالي
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* User Form Modal */}
            <Modal
                isOpen={showUserForm}
                onClose={handleCloseUserForm}
                title={editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
                size="lg"
            >
                <UserForm
                    user={editingUser}
                    onSuccess={handleFormSuccess}
                    onCancel={handleCloseUserForm}
                />
            </Modal>

            {/* User Details Modal */}
            <Modal
                isOpen={showUserDetails}
                onClose={handleCloseUserDetails}
                title="تفاصيل المستخدم"
                size="md"
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 space-x-reverse">
                            {selectedUser.profileImage ? (
                                <img
                                    className="h-16 w-16 rounded-full object-cover"
                                    src={selectedUser.profileImage}
                                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-lg font-medium text-gray-700">
                                        {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </h3>
                                <p className="text-gray-600">{selectedUser.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">الدور</label>
                                <p className="mt-1 text-sm text-gray-900">{getRoleLabel(selectedUser.role)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">الحالة</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUser.isActive ? 'نشط' : 'غير نشط'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUser.phoneNumber || 'لا يوجد'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">تاريخ الإنشاء</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {formatDate(new Date(selectedUser.createdAt))}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
