'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Eye,
    Package,
    User,
    MapPin,
    Calendar,
    DollarSign,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    Mail,
    Phone,
    Building2,
    CreditCard,
    Hash
} from 'lucide-react';
import { useOrder, useUpdateOrderStatus, useDeleteOrder, OrderStatus } from '@/hooks/useOrders';
import Modal from '@/components/ui/Modal';

interface OrderDetailsPageProps {
    params: {
        id: string;
    };
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
    const router = useRouter();
    const { data: order, isLoading, error } = useOrder(params.id);
    const updateStatusMutation = useUpdateOrderStatus();
    const deleteOrderMutation = useDeleteOrder();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(OrderStatus.PENDING);

    const handleStatusUpdate = () => {
        updateStatusMutation.mutate(
            { id: params.id, status: { status: selectedStatus } },
            {
                onSuccess: () => {
                    setIsStatusModalOpen(false);
                },
            }
        );
    };

    const handleDelete = () => {
        deleteOrderMutation.mutate(params.id, {
            onSuccess: () => {
                router.push('/dashboard/orders');
            },
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case OrderStatus.PENDING:
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case OrderStatus.PROCESSING:
                return <Package className="h-5 w-5 text-blue-500" />;
            case OrderStatus.COMPLETED:
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case OrderStatus.CANCELLED:
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case OrderStatus.PENDING:
                return 'معلق';
            case OrderStatus.PROCESSING:
                return 'قيد المعالجة';
            case OrderStatus.COMPLETED:
                return 'مكتمل';
            case OrderStatus.CANCELLED:
                return 'ملغي';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case OrderStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case OrderStatus.PROCESSING:
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case OrderStatus.COMPLETED:
                return 'bg-green-100 text-green-800 border-green-200';
            case OrderStatus.CANCELLED:
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const canEdit = order?.status === OrderStatus.PENDING || order?.status === OrderStatus.PROCESSING;
    const canDelete = order?.status === OrderStatus.PENDING || order?.status === OrderStatus.CANCELLED;

    if (isLoading) {
        return (
            <div className="animate-fade-in">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="mr-3 text-gray-600">جاري تحميل تفاصيل الطلب...</span>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="animate-fade-in">
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">خطأ في تحميل الطلب</h2>
                    <p className="text-gray-600 mb-4">
                        {error?.response?.data?.message || 'لم يتم العثور على الطلب المطلوب'}
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/orders')}
                        className="btn-primary"
                    >
                        العودة إلى قائمة الطلبات
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                        <button
                            onClick={() => router.push('/dashboard/orders')}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">تفاصيل الطلب</h1>
                            <p className="text-gray-600 mt-1">رقم الطلب: {order.orderNumber}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 space-x-reverse">
                        <button
                            onClick={() => setIsStatusModalOpen(true)}
                            className="btn-secondary flex items-center"
                        >
                            <Package className="h-4 w-4 mr-2" />
                            تغيير الحالة
                        </button>

                        {canEdit && (
                            <button
                                onClick={() => router.push(`/dashboard/orders/${params.id}/edit`)}
                                className="btn-secondary flex items-center"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                تعديل
                            </button>
                        )}

                        {canDelete && (
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="btn-secondary text-red-600 hover:bg-red-50 flex items-center"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                حذف
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Order Status Card */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">حالة الطلب</h3>
                            <div className={`inline-flex items-center px-3 py-2 rounded-full border font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="mr-2">{getStatusText(order.status)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 space-x-reverse">
                                <Hash className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">رقم الطلب</p>
                                    <p className="font-medium">{order.orderNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 space-x-reverse">
                                <CreditCard className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">حالة الدفع</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {order.isPaid ? 'مدفوع' : 'غير مدفوع'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="card">
                        <div className="flex items-center space-x-3 space-x-reverse mb-6">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">معلومات العميل</h3>
                        </div>

                        {order.customer ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">الاسم</p>
                                            <p className="font-medium text-gray-900">
                                                {order.customer.firstName} {order.customer.lastName}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                                                <p className="font-medium text-gray-900">{order.customer.email}</p>
                                            </div>
                                        </div>

                                        {order.customer.phoneNumber && (
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">رقم الهاتف</p>
                                                    <p className="font-medium text-gray-900">{order.customer.phoneNumber}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {order.customer.address && (
                                    <div>
                                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm text-gray-500">العنوان</p>
                                        </div>
                                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                            <p>{order.customer.address.street}</p>
                                            <p>{order.customer.address.city}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">لا توجد معلومات عن العميل</p>
                        )}
                    </div>

                    {/* Branch Information */}
                    {order.branch && (
                        <div className="card">
                            <div className="flex items-center space-x-3 space-x-reverse mb-6">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">معلومات الفرع</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500">اسم الفرع</p>
                                    <p className="font-medium text-gray-900">{order.branch.name}</p>
                                </div>

                                {order.branch.phone && (
                                    <div>
                                        <p className="text-sm text-gray-500">رقم الهاتف</p>
                                        <p className="font-medium text-gray-900">{order.branch.phone}</p>
                                    </div>
                                )}

                                {order.branch.address && (
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-500 mb-2">العنوان</p>
                                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                            <p>{order.branch.address.street}, {order.branch.address.city}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="card">
                        <div className="flex items-center space-x-3 space-x-reverse mb-6">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">عناصر الطلب</h3>
                            <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
                                {order.items.length} عنصر
                            </span>
                        </div>

                        <div className="overflow-hidden border border-gray-200 rounded-lg">
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
                                    {order.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{item.productName}</div>
                                                    <div className="text-sm text-gray-500">{item.productSku}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{item.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                ${item.price.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                ${(item.quantity * item.price).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                        <div className="card">
                            <div className="flex items-center space-x-3 space-x-reverse mb-4">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">ملاحظات الطلب</h3>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">{order.notes}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="card sticky top-6">
                        <div className="flex items-center space-x-3 space-x-reverse mb-6">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">ملخص الطلب</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">المجموع الفرعي:</span>
                                <span className="font-medium">${order.subtotal.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">الضرائب:</span>
                                <span className="font-medium">${order.taxAmount.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">الخصم:</span>
                                <span className="font-medium text-red-600">
                                    -${order.discountAmount.toLocaleString()}
                                </span>
                            </div>

                            <div className="border-t pt-3">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>المجموع الإجمالي:</span>
                                    <span className="text-blue-600">${order.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
                        <div className="space-y-3">
                            <button className="btn-secondary w-full flex items-center justify-center">
                                <Download className="h-4 w-4 mr-2" />
                                تحميل الفاتورة
                            </button>

                            <button className="btn-secondary w-full flex items-center justify-center">
                                <Mail className="h-4 w-4 mr-2" />
                                إرسال للعميل
                            </button>

                            <button
                                onClick={() => window.print()}
                                className="btn-secondary w-full flex items-center justify-center"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                طباعة
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                title="تحديث حالة الطلب"
            >
                <div className="space-y-4">
                    <div className="form-group">
                        <label className="form-label">الحالة الجديدة</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                            className="select-field"
                        >
                            <option value={OrderStatus.PENDING}>معلق</option>
                            <option value={OrderStatus.PROCESSING}>قيد المعالجة</option>
                            <option value={OrderStatus.COMPLETED}>مكتمل</option>
                            <option value={OrderStatus.CANCELLED}>ملغي</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
                        <button
                            onClick={() => setIsStatusModalOpen(false)}
                            className="btn-secondary"
                            disabled={updateStatusMutation.isPending}
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleStatusUpdate}
                            className="btn-primary"
                            disabled={updateStatusMutation.isPending}
                        >
                            {updateStatusMutation.isPending ? 'جاري التحديث...' : 'تحديث الحالة'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="تأكيد حذف الطلب"
            >
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <div>
                            <p className="text-gray-900 font-medium">
                                هل أنت متأكد من حذف هذا الطلب؟
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                                لا يمكن التراجع عن هذا الإجراء.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="btn-secondary"
                            disabled={deleteOrderMutation.isPending}
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleDelete}
                            className="btn-primary bg-red-600 hover:bg-red-700"
                            disabled={deleteOrderMutation.isPending}
                        >
                            {deleteOrderMutation.isPending ? 'جاري الحذف...' : 'حذف الطلب'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
