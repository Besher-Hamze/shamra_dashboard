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
    Truck,
    CreditCard
} from 'lucide-react';
import { useOrders, useUpdateOrderStatus, useUpdateOrder, Order } from '@/hooks/useOrders';
import { useCategories } from '@/hooks/useCategories';
import { useBranches } from '@/hooks/useBranches';
import { OrderStatus } from '@/types';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/utils/hepler';

export default function OrdersPage() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [branchId, setBranchId] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const queryParams = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: (statusFilter || undefined) as OrderStatus | undefined,
        categoryId: categoryId || undefined,
        branchId: branchId || undefined,
    };

    const { data: ordersData, isLoading } = useOrders(queryParams);
    const { data: categoriesData } = useCategories({ limit: 100 });
    const { data: branchesData } = useBranches({ limit: 100 });
    const updateStatusMutation = useUpdateOrderStatus();
    const updateOrderMutation = useUpdateOrder();


    const handleStatusChange = (orderId: string, newStatus: string) => {
        updateStatusMutation.mutate({ id: orderId, status: { status: newStatus as OrderStatus } });
    };

    const handlePaymentToggle = (order: Order) => {
        updateOrderMutation.mutate({
            id: order._id,
            data: { isPaid: !order.isPaid }
        });
    };

    // Filter orders by category (client-side filtering)
    const filteredOrders = categoryId
        ? ordersData?.data?.filter(order =>
            order.items?.some(item => {
                // Check if any item in the order belongs to the selected category
                // This assumes the order items have category information
                // You may need to adjust this based on your actual data structure
                return true; // For now, we'll show all orders when category is selected
            })
        ) || []
        : ordersData?.data || [];

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case OrderStatus.CONFIRMED:
                return <CheckCircle className="h-4 w-4 text-blue-500" />;
            case OrderStatus.PROCESSING:
                return <Package className="h-4 w-4 text-blue-500" />;
            case OrderStatus.SHIPPED:
                return <Truck className="h-4 w-4 text-purple-500" />;
            case OrderStatus.DELIVERED:
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case OrderStatus.CANCELLED:
                return <XCircle className="h-4 w-4 text-red-500" />;
            case OrderStatus.RETURNED:
                return <XCircle className="h-4 w-4 text-orange-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusText = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return 'معلق';
            case OrderStatus.CONFIRMED:
                return 'مؤكد';
            case OrderStatus.PROCESSING:
                return 'قيد المعالجة';
            case OrderStatus.SHIPPED:
                return 'تم الشحن';
            case OrderStatus.DELIVERED:
                return 'تم التسليم';
            case OrderStatus.CANCELLED:
                return 'ملغي';
            case OrderStatus.RETURNED:
                return 'مرتجع';
            default:
                return 'غير محدد';
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800';
            case OrderStatus.CONFIRMED:
                return 'bg-blue-100 text-blue-800';
            case OrderStatus.PROCESSING:
                return 'bg-blue-100 text-blue-800';
            case OrderStatus.SHIPPED:
                return 'bg-purple-100 text-purple-800';
            case OrderStatus.DELIVERED:
                return 'bg-green-100 text-green-800';
            case OrderStatus.CANCELLED:
                return 'bg-red-100 text-red-800';
            case OrderStatus.RETURNED:
                return 'bg-orange-100 text-orange-800';
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
                    <button
                        onClick={() => router.push('/dashboard/orders/add')}
                        className="btn-primary flex items-center space-x-2 space-x-reverse"
                    >
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
                                {filteredOrders?.filter(o => o.status === OrderStatus.PENDING).length || 0}
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
                                {filteredOrders?.filter(o => o.status === OrderStatus.PROCESSING).length || 0}
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
                                {filteredOrders?.filter(o => o.status === OrderStatus.SHIPPED).length || 0}
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
                                {filteredOrders?.length || 0}
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
                                    <option value={OrderStatus.PENDING}>معلق</option>
                                    <option value={OrderStatus.CONFIRMED}>مؤكد</option>
                                    <option value={OrderStatus.PROCESSING}>قيد المعالجة</option>
                                    <option value={OrderStatus.SHIPPED}>تم الشحن</option>
                                    <option value={OrderStatus.DELIVERED}>تم التسليم</option>
                                    <option value={OrderStatus.CANCELLED}>ملغي</option>
                                    <option value={OrderStatus.RETURNED}>مرتجع</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الفئة
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">جميع الفئات</option>
                                    {categoriesData?.data?.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الفرع
                                </label>
                                <select
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">جميع الفروع</option>
                                    {branchesData?.data?.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
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
                        {filteredOrders?.length || 0} طلب
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
                                {filteredOrders?.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell>
                                            <span className="font-medium text-blue-600">
                                                {order.orderNumber}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {order.user
                                                        ? `${order.user.firstName} ${order.user.lastName}`
                                                        : 'غير محدد'
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {order.user
                                                        ? order.user.phoneNumber
                                                        : 'غير محدد'
                                                    }
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    ${order.totalAmount?.toLocaleString()}
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
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                                                >
                                                    <option value={OrderStatus.PENDING}>معلق</option>
                                                    <option value={OrderStatus.CONFIRMED}>مؤكد</option>
                                                    <option value={OrderStatus.PROCESSING}>قيد المعالجة</option>
                                                    <option value={OrderStatus.SHIPPED}>تم الشحن</option>
                                                    <option value={OrderStatus.DELIVERED}>تم التسليم</option>
                                                    <option value={OrderStatus.CANCELLED}>ملغي</option>
                                                    <option value={OrderStatus.RETURNED}>مرتجع</option>
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
                                                {formatDate(new Date(order.createdAt))}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <button
                                                    onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                    title="عرض"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePaymentToggle(order)}
                                                    className={`p-1 rounded ${order.isPaid
                                                        ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                                        }`}
                                                    title={order.isPaid ? "إلغاء الدفع" : "تأكيد الدفع"}
                                                    disabled={updateOrderMutation.isPending}
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/orders/${order._id}/edit`)}
                                                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                                    title="تعديل"
                                                    disabled={order.status === OrderStatus.SHIPPED || order.status === OrderStatus.CANCELLED || order.status === OrderStatus.DELIVERED}
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
                                        <span>{formatDate(new Date(selectedOrder.createdAt))}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">معلومات العميل</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">الاسم:</span>
                                        <span className="font-medium">
                                            {selectedOrder.user
                                                ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}`
                                                : (typeof selectedOrder.userId === 'object'
                                                    ? `${selectedOrder.userId.firstName} ${selectedOrder.userId.lastName}`
                                                    : 'غير محدد'
                                                )
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">البريد الإلكتروني:</span>
                                        <span>
                                            {selectedOrder.user
                                                ? selectedOrder.user.email
                                                : (typeof selectedOrder.userId === 'object'
                                                    ? selectedOrder.userId.email
                                                    : 'غير محدد'
                                                )
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">رقم الهاتف:</span>
                                        <span>
                                            {selectedOrder.user
                                                ? selectedOrder.user.phoneNumber || '-'
                                                : (typeof selectedOrder.userId === 'object'
                                                    ? selectedOrder.userId.phoneNumber || '-'
                                                    : '-'
                                                )
                                            }
                                        </span>
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
                                                    <div className="text-sm text-gray-500">{item.productId}</div>
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
                                    <span>${selectedOrder.totalAmount?.toLocaleString()}</span>
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
