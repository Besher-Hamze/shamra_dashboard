'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Truck
} from 'lucide-react';
import { useOrders, useUpdateOrderStatus, Order } from '@/hooks/useOrders';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';

export default function OrdersPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const queryParams = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: (statusFilter || undefined) as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | undefined,
    };

    const { data: ordersData, isLoading, error } = useOrders(queryParams);
    const updateStatusMutation = useUpdateOrderStatus();

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
    };

    const handleStatusChange = (orderId: string, newStatus: string) => {
        updateStatusMutation.mutate({ id: orderId, status: newStatus });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'PROCESSING':
                return <Package className="h-4 w-4 text-blue-500" />;
            case 'COMPLETED':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'CANCELLED':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'معلق';
            case 'PROCESSING':
                return 'قيد المعالجة';
            case 'COMPLETED':
                return 'مكتمل';
            case 'CANCELLED':
                return 'ملغي';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">إدارة الطلبات</h1>
                        <p className="text-gray-600 mt-2">
                            إدارة ومتابعة جميع الطلبات في النظام
                        </p>
                    </div>
                    <button className="btn-primary flex items-center space-x-2 space-x-reverse">
                        <Plus className="h-5 w-5" />
                        <span>إضافة طلب جديد</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">طلبات معلقة</p>
                            <p className="text-xl font-bold text-gray-900">
                                {ordersData?.data?.filter(o => o.status === 'PENDING').length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">قيد المعالجة</p>
                            <p className="text-xl font-bold text-gray-900">
                                {ordersData?.data?.filter(o => o.status === 'PROCESSING').length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">مكتملة</p>
                            <p className="text-xl font-bold text-gray-900">
                                {ordersData?.data?.filter(o => o.status === 'COMPLETED').length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Truck className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                            <p className="text-xl font-bold text-gray-900">
                                {ordersData?.pagination?.total || 0}
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
                                placeholder="البحث في الطلبات..."
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
                                    حالة الطلب
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">جميع الحالات</option>
                                    <option value="PENDING">معلق</option>
                                    <option value="PROCESSING">قيد المعالجة</option>
                                    <option value="COMPLETED">مكتمل</option>
                                    <option value="CANCELLED">ملغي</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Orders Table */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">قائمة الطلبات</h3>
                    <div className="text-sm text-gray-500">
                        {ordersData?.pagination?.total || 0} طلب
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
                                    <TableHead>رقم الطلب</TableHead>
                                    <TableHead>العميل</TableHead>
                                    <TableHead>المبلغ الإجمالي</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead>حالة الدفع</TableHead>
                                    <TableHead>تاريخ الإنشاء</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ordersData?.data?.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <span className="font-medium text-blue-600">
                                                {order.orderNumber}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {order.customer?.firstName} {order.customer?.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {order.customer?.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    ${order.total?.toLocaleString()}
                                                </div>
                                                <div className="text-gray-500">
                                                    {order.items?.length || 0} عنصر
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                {getStatusIcon(order.status)}
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                                                >
                                                    <option value="PENDING">معلق</option>
                                                    <option value="PROCESSING">قيد المعالجة</option>
                                                    <option value="COMPLETED">مكتمل</option>
                                                    <option value="CANCELLED">ملغي</option>
                                                </select>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.isPaid
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {order.isPaid ? 'مدفوع' : 'غير مدفوع'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString('en-US')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                    title="عرض"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                                    title="تعديل"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {ordersData && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={ordersData.pagination?.pages || 1}
                                totalItems={ordersData.pagination?.total}
                                itemsPerPage={10}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Order Details Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedOrder(null);
                }}
                title={`تفاصيل الطلب ${selectedOrder?.orderNumber}`}
                size="xl"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Order Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">معلومات الطلب</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">رقم الطلب:</span>
                                        <span className="font-medium">{selectedOrder.orderNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">الحالة:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                                            {getStatusText(selectedOrder.status)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">تاريخ الإنشاء:</span>
                                        <span>{new Date(selectedOrder.createdAt).toLocaleString('ar-SA')}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">معلومات العميل</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">الاسم:</span>
                                        <span className="font-medium">
                                            {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">البريد الإلكتروني:</span>
                                        <span>{selectedOrder.customer?.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">رقم الهاتف:</span>
                                        <span>{selectedOrder.customer?.phoneNumber || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">عناصر الطلب</h4>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المجموع</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedOrder.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                                                    <div className="text-sm text-gray-500">{item.productSku}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ${item.price.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    ${(item.quantity * item.price).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="border-t pt-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">المجموع الفرعي:</span>
                                    <span>${selectedOrder.subtotal?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">الضرائب:</span>
                                    <span>${selectedOrder.taxAmount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">الخصم:</span>
                                    <span className="text-red-600">-${selectedOrder.discountAmount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-medium text-lg border-t pt-2">
                                    <span>المجموع الإجمالي:</span>
                                    <span>${selectedOrder.total?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {selectedOrder.notes && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">ملاحظات</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {selectedOrder.notes}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
