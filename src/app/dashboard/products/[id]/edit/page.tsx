'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import ProductFormPage from '@/components/products/ProductFormPage';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const { data: product, isLoading: loadingProduct, error: loadError } = useProduct(productId);

    const handleSuccess = () => {
        router.push('/dashboard/products');
    };

    const handleCancel = () => {
        router.push('/dashboard/products');
    };

    if (loadingProduct) {
        return (
            <div className="animate-fade-in">
                <div className="flex items-center justify-center min-h-96">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-gray-600">جاري تحميل بيانات المنتج...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (loadError || !product) {
        return (
            <div className="animate-fade-in">
                <div className="text-center py-12">
                    <div className="text-red-600 mb-4">
                        {loadError ? 'حدث خطأ في تحميل بيانات المنتج' : 'المنتج غير موجود'}
                    </div>
                    <button
                        onClick={handleCancel}
                        className="btn-primary"
                    >
                        العودة إلى قائمة المنتجات
                    </button>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-2xl font-bold text-gray-900">تعديل المنتج</h1>
                        <p className="text-gray-600 mt-1">
                            تعديل بيانات منتج "{product.nameAr || product.name}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="card">
                <ProductFormPage
                    product={product}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    mode="edit"
                />
            </div>
        </div>
    );
}
