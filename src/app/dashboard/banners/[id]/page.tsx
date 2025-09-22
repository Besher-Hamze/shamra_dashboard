'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Image,
    Package,
    Tag,
    Layers,
    ArrowUpDown,
    ToggleLeft,
    ToggleRight,
    Calendar,
    User,
} from 'lucide-react';
import { useBanner, useBannerMutations } from '@/hooks/useBanners';
import { formatDate } from '@/utils/hepler';
import Modal from '@/components/ui/Modal';

interface BannerDetailsPageProps {
    params: {
        id: string;
    };
}

export default function BannerDetailsPage({ params }: BannerDetailsPageProps) {
    const router = useRouter();
    const { data: banner, isLoading, error } = useBanner(params.id);
    const { toggleActiveMutation, updateSortOrderMutation, deleteBanner } = useBannerMutations();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDelete = () => {
        if (banner) {
            deleteBanner(banner);
            setIsDeleteModalOpen(false);
        }
    };

    const getBannerType = () => {
        if (!banner) return 'غير محدد';

        if (banner.product || typeof banner.productId === 'object') {
            return 'منتج';
        } else if (banner.category || typeof banner.categoryId === 'object') {
            return 'صنف';
        } else if (banner.subCategory || typeof banner.subCategoryId === 'object') {
            return 'صنف فرعي';
        }
        return 'عام';
    };

    const getBannerTarget = () => {
        if (!banner) return 'غير محدد';

        if (banner.product || typeof banner.productId === 'object') {
            return typeof banner.productId === 'object' ? banner.productId.name : 'منتج';
        } else if (banner.category || typeof banner.categoryId === 'object') {
            return typeof banner.categoryId === 'object' ? banner.categoryId.name : 'صنف';
        } else if (banner.subCategory || typeof banner.subCategoryId === 'object') {
            return typeof banner.subCategoryId === 'object' ? banner.subCategoryId.name : 'صنف فرعي';
        }
        return 'عام';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !banner) {
        return (
            <div className="text-center py-12">
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">البانر غير موجود</h3>
                <p className="mt-1 text-sm text-gray-500">البانر المطلوب غير موجود أو تم حذفه.</p>
                <div className="mt-6">
                    <button
                        onClick={() => router.push('/dashboard/banners')}
                        className="btn-primary"
                    >
                        العودة للقائمة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                    <button
                        onClick={() => router.back()}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">تفاصيل البانر</h1>
                        <p className="text-gray-600">عرض وإدارة بيانات البانر</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                    <button
                        onClick={() => router.push(`/dashboard/banners/${banner._id}/edit`)}
                        className="btn-secondary flex items-center space-x-2 space-x-reverse"
                    >
                        <Edit className="h-4 w-4" />
                        <span>تعديل</span>
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="btn-primary bg-red-600 hover:bg-red-700 flex items-center space-x-2 space-x-reverse"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>حذف</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Banner Image */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">صورة البانر</h3>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={banner.image}
                                alt="Banner"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Banner Details */}
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">النوع</label>
                                <p className="text-sm text-gray-900">{getBannerType()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">الهدف</label>
                                <p className="text-sm text-gray-900">{getBannerTarget()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">ترتيب العرض</label>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <input
                                        type="number"
                                        value={banner.sortOrder}
                                        onChange={(e) => updateSortOrderMutation.mutate({
                                            id: banner._id,
                                            data: { sortOrder: parseInt(e.target.value) }
                                        })}
                                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        min="0"
                                    />
                                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">الحالة</label>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <button
                                        onClick={() => toggleActiveMutation.mutate(banner._id)}
                                        className={`flex items-center space-x-2 space-x-reverse ${banner.isActive ? 'text-green-600' : 'text-gray-400'
                                            }`}
                                        disabled={toggleActiveMutation.isPending}
                                    >
                                        {banner.isActive ? (
                                            <ToggleRight className="h-5 w-5" />
                                        ) : (
                                            <ToggleLeft className="h-5 w-5" />
                                        )}
                                        <span className="text-sm">
                                            {banner.isActive ? 'نشط' : 'غير نشط'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Target Details */}
                    {(banner.product || banner.category || banner.subCategory) && (
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الهدف</h3>
                            <div className="space-y-3">
                                {banner.product && (
                                    <div className="flex items-center space-x-3 space-x-reverse">
                                        <Package className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">منتج</p>
                                            <p className="text-sm text-gray-500">
                                                {typeof banner.productId === 'object' ? banner.productId.name : 'منتج'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {banner.category && (
                                    <div className="flex items-center space-x-3 space-x-reverse">
                                        <Tag className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">صنف</p>
                                            <p className="text-sm text-gray-500">
                                                {typeof banner.categoryId === 'object' ? banner.categoryId.name : 'صنف'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {banner.subCategory && (
                                    <div className="flex items-center space-x-3 space-x-reverse">
                                        <Layers className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">صنف فرعي</p>
                                            <p className="text-sm text-gray-500">
                                                {typeof banner.subCategoryId === 'object' ? banner.subCategoryId.name : 'صنف فرعي'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات النظام</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">تاريخ الإنشاء</p>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(new Date(banner.createdAt))}
                                    </p>
                                </div>
                            </div>
                            {banner.updatedAt && (
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">آخر تحديث</p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(new Date(banner.updatedAt))}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="تأكيد حذف البانر"
            >
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <Trash2 className="h-8 w-8 text-red-500" />
                        <div>
                            <p className="text-gray-900 font-medium">
                                هل أنت متأكد من حذف هذا البانر؟
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                لا يمكن التراجع عن هذا الإجراء.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="btn-secondary"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleDelete}
                            className="btn-primary bg-red-600 hover:bg-red-700"
                        >
                            حذف البانر
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
