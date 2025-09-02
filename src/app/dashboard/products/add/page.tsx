'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import ProductFormPage from '@/components/products/ProductFormPage';

export default function AddProductPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/dashboard/products');
    };

    const handleCancel = () => {
        router.push('/dashboard/products');
    };

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                    <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="العودة"
                    >
                        <ArrowRight className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">إضافة منتج جديد</h1>
                        <p className="text-gray-600 mt-1">
                            أضف منتج جديد إلى المتجر مع جميع التفاصيل المطلوبة
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="card">
                <ProductFormPage
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    mode="add"
                />
            </div>
        </div>
    );
}
