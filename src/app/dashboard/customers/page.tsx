'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Users,
    UserCheck,
    Star,
    Phone,
    Mail
} from 'lucide-react';
import { useCustomers, useDeleteCustomer, Customer } from '@/hooks/useCustomers';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import CustomerForm from '@/components/customers/CustomerForm';

export default function CustomersPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const queryParams = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        city: cityFilter || undefined,
    };

    const { data: customersData, isLoading, error } = useCustomers(queryParams);
    const deleteCustomerMutation = useDeleteCustomer();

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    const handleView = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsViewModalOpen(true);
    };

    const handleDelete = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedCustomer) {
            deleteCustomerMutation.mutate(selectedCustomer.id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedCustomer(null);
                },
            });
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
                        <p className="text-gray-600 mt-2">
                            إدارة ومتابعة جميع العملاء في النظام
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary flex items-center space-x-2 space-x-reverse"
                    >
                        <Plus className="h-5 w-5" />
                        <span>إضافة عميل جديد</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">إجمالي العملاء</p>
                            <p className="text-xl font-bold text-gray-900">
                                {customersData?.pagination?.total || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">العملاء النشطون</p>
                            <p className="text-xl font-bold text-gray-900">
                                {customersData?.data?.filter((c: Customer) => c.isActive).length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Star className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">عملاء VIP</p>
                            <p className="text-xl font-bold text-gray-900">
                                {customersData?.data?.filter((c: Customer) => c.totalSpent && c.totalSpent > 5000).length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">عملاء جدد</p>
                            <p className="text-xl font-bold text-gray-900">
                                {customersData?.data?.filter((c: Customer) => {
                                    const createdDate = new Date(c.createdAt);
                                    const monthAgo = new Date();
                                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                                    return createdDate > monthAgo;
                                }).length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="البحث في العملاء..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pr-10"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-secondary flex items-center space-x-2 space-x-reverse"
                    >
                        <Filter className="h-5 w-5" />
                        <span>فلاتر</span>
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المدينة
                                </label>
                                <select
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">جميع المدن</option>
                                    <option value="Damascus">دمشق</option>
                                    <option value="Aleppo">حلب</option>
                                    <option value="Homs">حمص</option>
                                    <option value="Latakia">اللاذقية</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Customers Table */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">قائمة العملاء</h3>
                    <div className="text-sm text-gray-500">
                        {customersData?.pagination?.total || 0} عميل
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="mr-3 text-gray-600">جاري التحميل...</span>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>العميل</TableHead>
                                    <TableHead>معلومات الاتصال</TableHead>
                                    <TableHead>المدينة</TableHead>
                                    <TableHead>إجمالي الطلبات</TableHead>
                                    <TableHead>إجمالي الإنفاق</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead>تاريخ التسجيل</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customersData?.data?.map((customer: Customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {customer.firstName?.[0]}{customer.lastName?.[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mr-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {customer.firstName} {customer.lastName}
                                                    </div>
                                                    {customer.customerCode && (
                                                        <div className="text-sm text-gray-500">
                                                            {customer.customerCode}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Mail className="h-3 w-3 text-gray-400 ml-1" />
                                                    {customer.email}
                                                </div>
                                                {customer.phoneNumber && (
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Phone className="h-3 w-3 text-gray-400 ml-1" />
                                                        {customer.phoneNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-900">
                                                {customer.address?.city || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium text-gray-900">
                                                {customer.totalOrders || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    ${customer.totalSpent?.toLocaleString() || '0'}
                                                </div>
                                                {customer.totalSpent && customer.totalSpent > 5000 && (
                                                    <div className="flex items-center text-yellow-600">
                                                        <Star className="h-3 w-3 ml-1" />
                                                        <span className="text-xs">VIP</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {customer.isActive ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-500">
                                                {new Date(customer.createdAt).toLocaleDateString('en-US')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <button
                                                    onClick={() => handleView(customer)}
                                                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                                                    title="عرض"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(customer)}
                                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                    title="تعديل"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer)}
                                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {customersData && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={customersData.pagination?.pages || 1}
                                totalItems={customersData.pagination?.total}
                                itemsPerPage={10}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Create Customer Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="إضافة عميل جديد"
                size="lg"
            >
                <CustomerForm
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                    }}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>

            {/* Edit Customer Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCustomer(null);
                }}
                title="تعديل العميل"
                size="lg"
            >
                {selectedCustomer && (
                    <CustomerForm
                        customer={selectedCustomer}
                        onSuccess={() => {
                            setIsEditModalOpen(false);
                            setSelectedCustomer(null);
                        }}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setSelectedCustomer(null);
                        }}
                    />
                )}
            </Modal>

            {/* View Customer Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedCustomer(null);
                }}
                title="تفاصيل العميل"
                size="lg"
            >
                {selectedCustomer && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">المعلومات الشخصية</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">الاسم الكامل:</span>
                                        <span className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">البريد الإلكتروني:</span>
                                        <span>{selectedCustomer.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">رقم الهاتف:</span>
                                        <span>{selectedCustomer.phoneNumber || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">رمز العميل:</span>
                                        <span>{selectedCustomer.customerCode || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">العنوان</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">الشارع:</span>
                                        <span>{selectedCustomer.address?.street || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">المدينة:</span>
                                        <span>{selectedCustomer.address?.city || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">البلد:</span>
                                        <span>{selectedCustomer.address?.country || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">إحصائيات الطلبات</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">إجمالي الطلبات:</span>
                                        <span className="font-medium">{selectedCustomer.totalOrders || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">إجمالي الإنفاق:</span>
                                        <span className="font-medium">${selectedCustomer.totalSpent?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">آخر طلب:</span>
                                        <span>
                                            {selectedCustomer.lastOrderDate
                                                ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString('en-US')
                                                : '-'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">معلومات الحساب</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">الحالة:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs ${selectedCustomer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {selectedCustomer.isActive ? 'نشط' : 'غير نشط'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">تاريخ التسجيل:</span>
                                        <span>{new Date(selectedCustomer.createdAt).toLocaleDateString('en-US')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">آخر تحديث:</span>
                                        <span>{new Date(selectedCustomer.updatedAt).toLocaleDateString('en-US')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedCustomer.notes && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">ملاحظات</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {selectedCustomer.notes}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedCustomer(null);
                }}
                title="تأكيد الحذف"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        هل أنت متأكد من حذف العميل "{selectedCustomer?.firstName} {selectedCustomer?.lastName}"؟
                        لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="flex justify-end space-x-3 space-x-reverse">
                        <button
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setSelectedCustomer(null);
                            }}
                            className="btn-secondary"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={deleteCustomerMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deleteCustomerMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
