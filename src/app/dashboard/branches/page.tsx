'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Filter,
    Building2,
    MapPin,
    Phone,
    Mail,
    Edit,
    Trash2,
    Eye,
    Clock,
    Star
} from 'lucide-react';
import { useBranches, useDeleteBranch, BranchesQueryParams } from '@/hooks/useBranches';
import { Branch } from '@/types';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';

export default function BranchesPage() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [cityFilter, setCityFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const limit = 10;
    const queryParams: BranchesQueryParams = {
        page: currentPage,
        limit,
        ...(searchTerm && { name: searchTerm }),
        ...(statusFilter === 'active' && { isActive: true }),
        ...(statusFilter === 'inactive' && { isActive: false }),
        ...(cityFilter && { city: cityFilter }),
    };

    const { data: branchesData, isLoading, error } = useBranches(queryParams);
    const deleteBranchMutation = useDeleteBranch();

    const handleDeleteBranch = async () => {
        if (!selectedBranch) return;
        try {
            await deleteBranchMutation.mutateAsync(selectedBranch.id);
            setShowDeleteModal(false);
            setSelectedBranch(null);
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

    const formatOperatingHours = (operatingHours: Record<string, { open: string; close: string }> | null) => {
        if (!operatingHours) return 'غير محدد';

        const monday = operatingHours.monday;
        if (monday) {
            return `${monday.open} - ${monday.close}`;
        }
        return 'غير محدد';
    };

    if (error) {
        return (
            <div className="p-6 text-center">
                <div className="text-red-600 mb-4">حدث خطأ في تحميل البيانات</div>
                <button
                    onClick={() => window.location.reload()}
                    className="btn-primary"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة الفروع</h1>
                    <p className="text-gray-600 mt-1">
                        إدارة فروع الشركة ومعلومات الاتصال وساعات العمل
                    </p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/branches/add')}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    إضافة فرع جديد
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="stats-card">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">إجمالي الفروع</p>
                            <p className="text-2xl font-bold text-gray-900">{branchesData?.pagination?.total || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Star className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">الفروع النشطة</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {branchesData?.data?.filter((b: Branch) => b.isActive).length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">المدن</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {new Set(branchesData?.data?.map((b: Branch) => b.address.city)).size || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">الفروع الرئيسية</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {branchesData?.data?.filter((b: Branch) => b.isMainBranch).length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="card mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="البحث في الفروع..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pr-10"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-secondary flex items-center"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        تصفية
                    </button>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                            <label className="form-label">حالة الفرع</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="select-field"
                            >
                                <option value="">جميع الحالات</option>
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label">المدينة</label>
                            <input
                                type="text"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                placeholder="اختر المدينة"
                                className="input-field"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setStatusFilter('');
                                    setCityFilter('');
                                    setSearchTerm('');
                                    setCurrentPage(1);
                                }}
                                className="btn-secondary w-full"
                            >
                                إعادة تعيين
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Branches Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="table-header">الفرع</th>
                                <th className="table-header">الموقع</th>
                                <th className="table-header">معلومات الاتصال</th>
                                <th className="table-header">ساعات العمل</th>
                                <th className="table-header">الحالة</th>
                                <th className="table-header">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td className="table-cell">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                                                <div>
                                                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex space-x-2 space-x-reverse">
                                                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : branchesData?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="table-cell text-center py-8 text-gray-500">
                                        لا توجد فروع
                                    </td>
                                </tr>
                            ) : (
                                branchesData?.data?.map((branch: Branch) => (
                                    <tr key={branch.id} className="hover:bg-gray-50">
                                        <td className="table-cell">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="font-medium text-gray-900">{branch.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm text-gray-900">{branch.address?.city}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="space-y-1">
                                                {branch.phone && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {branch.phone}
                                                    </div>
                                                )}
                                                {branch.email && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {branch.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="h-4 w-4 mr-2" />
                                                {formatOperatingHours(branch.operatingHours)}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            {getStatusBadge(branch.isActive, branch.isMainBranch)}
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <button
                                                    onClick={() => router.push(`/dashboard/branches/${branch.id}`)}
                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                    title="عرض التفاصيل"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/branches/${branch.id}/edit`)}
                                                    className="text-green-600 hover:text-green-800 p-1"
                                                    title="تعديل"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBranch(branch);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {branchesData?.pagination && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={branchesData.pagination.pages || 1}
                            onPageChange={setCurrentPage}
                            totalItems={branchesData.pagination.total || 0}
                            itemsPerPage={limit}
                        />
                    </div>
                )}
            </div>





            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedBranch && (
                <Modal
                    isOpen={true}
                    title="تأكيد الحذف"
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedBranch(null);
                    }}
                >
                    <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            هل أنت متأكد من حذف الفرع؟
                        </h3>
                        <p className="text-gray-600 mb-6">
                            سيتم حذف فرع &quot;{selectedBranch.name}&quot; نهائياً ولا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex justify-center space-x-3 space-x-reverse">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedBranch(null);
                                }}
                                className="btn-secondary"
                                disabled={deleteBranchMutation.isPending}
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDeleteBranch}
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