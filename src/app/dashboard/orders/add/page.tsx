'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, CheckCircle } from 'lucide-react';
import OrderForm from '@/components/orders/OrderForm';
import { useCreateOrder, CreateOrderData, UpdateOrderData, useUpdateOrder } from '@/hooks/useOrders';

export default function AddOrderPage() {
    const router = useRouter();
    const createOrderMutation = useCreateOrder();
    const updateOrderMutation = useUpdateOrder();

    const handleSubmit = (data: CreateOrderData | UpdateOrderData) => {
        if ('id' in data) {
            updateOrderMutation.mutate({ id: data.id as string, data: data as UpdateOrderData }, {
                onSuccess: () => {
                    router.push(`/dashboard/orders/${data.id}`);
                },
            });
        } else {
            createOrderMutation.mutate(data as CreateOrderData, {
                onSuccess: (response) => {
                    router.push(`/dashboard/orders/${response.data.id}`);
                },
            });
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/orders');
    };

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-4 space-x-reverse mb-4">
                    <button
                        onClick={() => router.push('/dashboard/orders')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">إنشاء طلب جديد</h1>
                        <p className="text-gray-600 mt-1">
                            أضف العناصر وحدد تفاصيل الطلب الجديد
                        </p>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">1</span>
                        </div>
                        <span className="text-blue-700 font-medium">تفاصيل الطلب</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-gray-500" />
                        </div>
                        <span className="text-gray-500 font-medium">مراجعة وحفظ</span>
                    </div>
                </div>
            </div>

            {/* Order Form */}
            <OrderForm
                mode="create"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={createOrderMutation.isPending}
                error={createOrderMutation.error}
            />

            {/* Success Message */}
            {createOrderMutation.isSuccess && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 space-x-reverse z-50">
                    <CheckCircle className="h-5 w-5" />
                    <span>تم إنشاء الطلب بنجاح!</span>
                </div>
            )}
        </div>
    );
}
