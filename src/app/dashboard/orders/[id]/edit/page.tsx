'use client';

import { useRouter } from 'next/navigation';
import { Edit, ArrowLeft, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import OrderForm from '@/components/orders/OrderForm';
import { useOrder, useUpdateOrder, UpdateOrderData } from '@/hooks/useOrders';
import { OrderStatus } from '@/types';

interface EditOrderPageProps {
    params: {
        id: string;
    };
}

export default function EditOrderPage({ params }: EditOrderPageProps) {
    const router = useRouter();
    const { data: order, isLoading: orderLoading, error: orderError } = useOrder(params.id);
    const updateOrderMutation = useUpdateOrder();

    const handleSubmit = (data: UpdateOrderData) => {
        updateOrderMutation.mutate(
            { id: params.id, data },
            {
                onSuccess: () => {
                    router.push(`/dashboard/orders/${params.id}`);
                },
            }
        );
    };

    const handleCancel = () => {
        router.push(`/dashboard/orders/${params.id}`);
    };

    if (orderLoading) {
        return (
            <div className="animate-fade-in">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="mr-3 text-gray-600">جاري تحميل بيانات الطلب...</span>
                </div>
            </div>
        );
    }

    if (orderError || !order) {
        return (
            <div className="animate-fade-in">
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">خطأ في تحميل الطلب</h2>
                    <p className="text-gray-600 mb-4">
                        {orderError?.response?.data?.message || 'لم يتم العثور على الطلب المطلوب'}
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

    // Check if order can be edited
    const canEdit = order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING;

    if (!canEdit) {
        return (
            <div className="animate-fade-in">
                <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">لا يمكن تعديل الطلب</h2>
                    <p className="text-gray-600 mb-4">
                        لا يمكن تعديل الطلبات المكتملة أو الملغاة. يمكنك فقط عرض تفاصيل الطلب.
                    </p>
                    <div className="space-x-4 space-x-reverse">
                        <button
                            onClick={() => router.push(`/dashboard/orders/${params.id}`)}
                            className="btn-primary"
                        >
                            عرض تفاصيل الطلب
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/orders')}
                            className="btn-secondary"
                        >
                            العودة إلى قائمة الطلبات
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-4 space-x-reverse mb-4">
                    <button
                        onClick={() => router.push(`/dashboard/orders/${params.id}`)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <Edit className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">تعديل الطلب</h1>
                        <p className="text-gray-600 mt-1">
                            تعديل تفاصيل الطلب رقم {order.orderNumber}
                        </p>
                    </div>
                </div>

                {/* Order Status Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">تنبيه</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                في وضع التعديل، يمكنك فقط تعديل الضرائب والخصم والملاحظات وحالة الدفع.
                                لا يمكن تعديل العناصر أو العميل أو الفرع.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-green-700 font-medium">الطلب موجود</span>
                    </div>
                    <div className="w-12 h-0.5 bg-blue-600"></div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">2</span>
                        </div>
                        <span className="text-blue-700 font-medium">تعديل التفاصيل</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-gray-500" />
                        </div>
                        <span className="text-gray-500 font-medium">حفظ التغييرات</span>
                    </div>
                </div>
            </div>

            {/* Order Form */}
            <OrderForm
                order={order}
                mode="edit"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateOrderMutation.isPending}
                error={updateOrderMutation.error}
            />

            {/* Success Message */}
            {updateOrderMutation.isSuccess && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 space-x-reverse z-50">
                    <CheckCircle className="h-5 w-5" />
                    <span>تم تحديث الطلب بنجاح!</span>
                </div>
            )}
        </div>
    );
}
