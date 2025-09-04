'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Edit, Trash2, MapPin, Phone, Mail, Clock, Globe, Building2, Star, Loader2 } from 'lucide-react';
import { useBranch, useDeleteBranch } from '@/hooks/useBranches';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';

export default function BranchDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const branchId = params.id as string;
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data: branch, isLoading, error } = useBranch(branchId);
    const deleteBranchMutation = useDeleteBranch();

    const handleDelete = async () => {
        try {
            await deleteBranchMutation.mutateAsync(branchId);
            router.push('/dashboard/branches');
        } catch (error) {
            console.error('Error deleting branch:', error);
        }
    };

    const getStatusBadge = (isActive: boolean, isMainBranch: boolean) => {
        if (isMainBranch) {
            return <span className="badge-primary flex items-center"><Star className="h-3 w-3 mr-1" />فرع رئيسي</span>;
        }
        return isActive ?
            <span className="badge-success">نشط</span> :
            <span className="badge-danger">غير نشط</span>;
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in">
                <div className="flex items-center justify-center min-h-96">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-gray-600">جاري تحميل بيانات الفرع...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !branch) {
        return (
            <div className="animate-fade-in">
                <div className="text-center py-12">
                    <div className="text-red-600 mb-4">
                        {error ? 'حدث خطأ في تحميل بيانات الفرع' : 'الفرع غير موجود'}
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/branches')}
                        className="btn-primary"
                    >
                        العودة إلى قائمة الفروع
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
                        onClick={() => router.push('/dashboard/branches')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="العودة"
                    >
                        <ArrowRight className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">تفاصيل الفرع</h1>
                        <p className="text-gray-600 mt-1">
                            عرض تفاصيل فرع "{branch.name}"
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                    <button
                        onClick={() => router.push(`/dashboard/branches/${branch.id}/edit`)}
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

            {/* Branch Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="card">
                        <div className="flex items-center space-x-3 space-x-reverse mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">المعلومات الأساسية</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">اسم الفرع (عربي)</label>
                                <p className="mt-1 text-gray-900 font-medium">{branch.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">الحالة</label>
                                <p className="mt-1">{getStatusBadge(branch.isActive, branch.isMainBranch)}</p>
                            </div>
                            {branch.description && (
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500">الوصف</label>
                                    <p className="mt-1 text-gray-900">{branch.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className="card">
                        <div className="flex items-center space-x-3 space-x-reverse mb-6">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">العنوان</h3>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">الشارع</label>
                                <p className="mt-1 text-gray-900">{branch.address?.street}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">المدينة</label>
                                    <p className="mt-1 text-gray-900">{branch.address?.city}</p>
                                </div>

                            </div>

                        </div>
                    </div>

                    {/* Operating Hours Card */}
                    {branch.operatingHours && (
                        <div className="card">
                            <div className="flex items-center space-x-3 space-x-reverse mb-6">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">ساعات العمل</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(branch.operatingHours)
                                    .filter(([day]) => !['_id', 'id'].includes(day))
                                    .filter(([_, hours]) => (hours as any)?.open && (hours as any)?.close)
                                    .map(([day, hours]) => (
                                        <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-gray-600 capitalize">
                                                {(() => {
                                                    // Optionally localize day names here if needed
                                                    switch (day) {
                                                        case 'saturday': return 'السبت';
                                                        case 'sunday': return 'الأحد';
                                                        case 'monday': return 'الاثنين';
                                                        case 'tuesday': return 'الثلاثاء';
                                                        case 'wednesday': return 'الأربعاء';
                                                        case 'thursday': return 'الخميس';
                                                        case 'friday': return 'الجمعة';
                                                        default: return day;
                                                    }
                                                })()}:
                                            </span>
                                            <span className="font-medium">
                                                {(hours as any).open === 'closed' || (hours as any).close === 'closed'
                                                    ? 'مغلق'
                                                    : `${(hours as any).open} - ${(hours as any).close}`}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact Information Card */}
                    <div className="card">
                        <div className="flex items-center space-x-3 space-x-reverse mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Phone className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">معلومات الاتصال</h3>
                        </div>

                        <div className="space-y-4">
                            {branch.phone && (
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <label className="text-xs text-gray-500">الهاتف</label>
                                        <p className="text-gray-900 font-medium">{branch.phone}</p>
                                    </div>
                                </div>
                            )}
                            {branch.email && (
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <label className="text-xs text-gray-500">البريد الإلكتروني</label>
                                        <p className="text-gray-900 font-medium">{branch.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات إضافية</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">ترتيب العرض</span>
                                <span className="font-medium">{branch.sortOrder || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">تاريخ الإنشاء</span>
                                <span className="font-medium">{new Date(branch.createdAt).toLocaleDateString('en-US')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">آخر تحديث</span>
                                <span className="font-medium">{new Date(branch.updatedAt).toLocaleDateString('en-US')}</span>
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
                            هل أنت متأكد من حذف الفرع؟
                        </h3>
                        <p className="text-gray-600 mb-6">
                            سيتم حذف فرع "{branch.name}" نهائياً ولا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex justify-center space-x-3 space-x-reverse">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn-secondary"
                                disabled={deleteBranchMutation.isPending}
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn-danger"
                                disabled={deleteBranchMutation.isPending}
                            >
                                {deleteBranchMutation.isPending ? 'جاري الحذف...' : 'حذف الفرع'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
