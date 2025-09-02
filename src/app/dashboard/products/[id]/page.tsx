'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Edit, Trash2, Package, Tag, DollarSign, Archive, Star, Loader2, Eye } from 'lucide-react';
import { useProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';

export default function ProductDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data: product, isLoading, error } = useProduct(productId);
    const deleteProductMutation = useDeleteProduct();

    const handleDelete = async () => {
        try {
            await deleteProductMutation.mutateAsync(productId);
            router.push('/dashboard/products');
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const getStatusBadge = (status: string, isActive: boolean) => {
        if (!isActive) {
            return <span className="badge-danger">غير نشط</span>;
        }
        switch (status) {
            case 'ACTIVE':
                return <span className="badge-success">نشط</span>;
            case 'INACTIVE':
                return <span className="badge-danger">غير نشط</span>;
            case 'DRAFT':
                return <span className="badge-warning">مسودة</span>;
            default:
                return <span className="badge-gray">{status}</span>;
        }
    };

    const formatPrice = (price: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currency,
        }).format(price);
    };

    if (isLoading) {
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

    if (error || !product) {
        return (
            <div className="animate-fade-in">
                <div className="text-center py-12">
                    <div className="text-red-600 mb-4">
                        {error ? 'حدث خطأ في تحميل بيانات المنتج' : 'المنتج غير موجود'}
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/products')}
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
                        onClick={() => router.push('/dashboard/products')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="العودة"
                    >
                        <ArrowRight className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">تفاصيل المنتج</h1>
                        <p className="text-gray-600 mt-1">
                            عرض تفاصيل منتج "{product.nameAr || product.name}"
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                    <button
                        onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                        className="btn-secondary flex items-center"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        تعديل
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="btn-danger flex items-center"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        حذف
                    </button>
                </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Product Image */}
                    {product.mainImage && (
                        <div className="card">
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={product.mainImage}
                                    alt={product.nameAr || product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Basic Info Card */}
                    <div className="card">
                        <div className="flex items-center space-x-3 space-x-reverse mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">المعلومات الأساسية</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">اسم المنتج (عربي)</label>
                                <p className="mt-1 text-gray-900 font-medium">{product.nameAr}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">اسم المنتج (إنجليزي)</label>
                                <p className="mt-1 text-gray-900 font-medium">{product.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">رمز المنتج (SKU)</label>
                                <p className="mt-1 text-gray-900 font-mono">{product.sku}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">الباركود</label>
                                <p className="mt-1 text-gray-900 font-mono">{product.barcode || 'غير محدد'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">الحالة</label>
                                <p className="mt-1">{getStatusBadge(product.status, product.isActive)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">العلامة التجارية</label>
                                <p className="mt-1 text-gray-900">{product.brand || 'غير محدد'}</p>
                            </div>
                            {product.descriptionAr && (
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500">الوصف</label>
                                    <p className="mt-1 text-gray-900">{product.descriptionAr}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing & Inventory Card */}
                    <div className="card">
                        <div className="flex items-center space-x-3 space-x-reverse mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">التسعير والمخزون</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">السعر الأساسي</label>
                                <p className="mt-1 text-gray-900 font-bold text-lg">{formatPrice(product.price, product.currency)}</p>
                            </div>
                            {product.costPrice && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">سعر التكلفة</label>
                                    <p className="mt-1 text-gray-900 font-medium">{formatPrice(product.costPrice, product.currency)}</p>
                                </div>
                            )}
                            {product.salePrice && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">سعر التخفيض</label>
                                    <p className="mt-1 text-red-600 font-bold">{formatPrice(product.salePrice, product.currency)}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-500">الكمية المتاحة</label>
                                <p className="mt-1 text-gray-900 font-medium">{product.stockQuantity}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">الحد الأدنى للمخزون</label>
                                <p className="mt-1 text-gray-900">{product.minStockLevel || 'غير محدد'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Product Features */}
                    <div className="card">
                        <div className="flex items-center space-x-3 space-x-reverse mb-6">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Star className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">خصائص المنتج</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={product.isFeatured}
                                    disabled
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label className="mr-2 text-sm text-gray-700">منتج مميز</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={product.isOnSale}
                                    disabled
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label className="mr-2 text-sm text-gray-700">في التخفيضات</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={product.isActive}
                                    disabled
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label className="mr-2 text-sm text-gray-700">نشط</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Category & Tags Card */}
                    <div className="card">
                        <div className="flex items-center space-x-3 space-x-reverse mb-6">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Tag className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">التصنيف والعلامات</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">الفئة</label>
                                <p className="mt-1 text-gray-900">{product.category?.nameAr || product.category?.name || 'غير محدد'}</p>
                            </div>
                            {product.tags && product.tags.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">العلامات</label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <span key={index} className="badge-info">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dimensions Card */}
                    {product.dimensions && (
                        <div className="card">
                            <div className="flex items-center space-x-3 space-x-reverse mb-6">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Archive className="h-6 w-6 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">الأبعاد والوزن</h3>
                            </div>

                            <div className="space-y-3">
                                {product.weight && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">الوزن</span>
                                        <span className="font-medium">{product.weight} كجم</span>
                                    </div>
                                )}
                                {product.dimensions.length && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">الطول</span>
                                        <span className="font-medium">{product.dimensions.length} سم</span>
                                    </div>
                                )}
                                {product.dimensions.width && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">العرض</span>
                                        <span className="font-medium">{product.dimensions.width} سم</span>
                                    </div>
                                )}
                                {product.dimensions.height && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">الارتفاع</span>
                                        <span className="font-medium">{product.dimensions.height} سم</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Additional Info Card */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات إضافية</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">ترتيب العرض</span>
                                <span className="font-medium">{product.sortOrder || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">تاريخ الإنشاء</span>
                                <span className="font-medium">{new Date(product.createdAt).toLocaleDateString('en-US')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">آخر تحديث</span>
                                <span className="font-medium">{new Date(product.updatedAt).toLocaleDateString('en-US')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <Modal
                    isOpen={true}
                    title="تأكيد الحذف"
                    onClose={() => setShowDeleteModal(false)}
                >
                    <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            هل أنت متأكد من حذف المنتج؟
                        </h3>
                        <p className="text-gray-600 mb-6">
                            سيتم حذف منتج "{product.nameAr || product.name}" نهائياً ولا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex justify-center space-x-3 space-x-reverse">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn-secondary"
                                disabled={deleteProductMutation.isPending}
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn-danger"
                                disabled={deleteProductMutation.isPending}
                            >
                                {deleteProductMutation.isPending ? 'جاري الحذف...' : 'حذف المنتج'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

