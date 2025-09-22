'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Image,
    ArrowUpDown,
    MoreVertical,
    ToggleLeft,
    ToggleRight,
    GripVertical,
} from 'lucide-react';
import { useBannerManagement } from '@/hooks/useBanners';
import { Banner } from '@/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/utils/hepler';

export default function BannersPage() {
    const router = useRouter();
    const {
        banners,
        pagination,
        isLoading,
        currentPage,
        searchTerm,
        statusFilter,
        typeFilter,
        handlePageChange,
        handleSearch,
        handleStatusFilter,
        handleTypeFilter,
        clearFilters,
        toggleActiveMutation,
        updateSortOrderMutation,
        deleteBanner,
    } = useBannerManagement();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
    const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

    const handleDeleteClick = (banner: Banner) => {
        setSelectedBanner(banner);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedBanner) {
            deleteBanner(selectedBanner);
            setIsDeleteModalOpen(false);
            setSelectedBanner(null);
        }
    };

    const handleSortOrderChange = (bannerId: string, newSortOrder: number) => {
        updateSortOrderMutation.mutate({
            id: bannerId,
            data: { sortOrder: newSortOrder }
        });
    };

    const getBannerType = (banner: Banner) => {
        if (banner.product || typeof banner.productId === 'object') {
            return 'منتج';
        } else if (banner.category || typeof banner.categoryId === 'object') {
            return 'صنف';
        } else if (banner.subCategory || typeof banner.subCategoryId === 'object') {
            return 'صنف فرعي';
        }
        return 'عام';
    };

    const getBannerTarget = (banner: Banner) => {
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">البانرات</h1>
                    <p className="text-gray-600">إدارة البانرات والإعلانات</p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/banners/add')}
                    className="btn-primary flex items-center space-x-2 space-x-reverse"
                >
                    <Plus className="h-4 w-4" />
                    <span>إضافة بانر جديد</span>
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="البحث في البانرات..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="input-field pr-10"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="md:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="select-field"
                        >
                            <option value="">جميع الحالات</option>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div className="md:w-48">
                        <select
                            value={typeFilter}
                            onChange={(e) => handleTypeFilter(e.target.value)}
                            className="select-field"
                        >
                            <option value="">جميع الأنواع</option>
                            <option value="product">منتج</option>
                            <option value="category">صنف</option>
                            <option value="subcategory">صنف فرعي</option>
                            <option value="general">عام</option>
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <button
                        onClick={clearFilters}
                        className="btn-secondary flex items-center space-x-2 space-x-reverse"
                    >
                        <Filter className="h-4 w-4" />
                        <span>مسح الفلاتر</span>
                    </button>
                </div>
            </div>

            {/* Banners Table */}
            <div className="card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>الصورة</TableHead>
                            <TableHead>النوع</TableHead>
                            <TableHead>الهدف</TableHead>
                            <TableHead>الترتيب</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>تاريخ الإنشاء</TableHead>
                            <TableHead>الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {banners.map((banner) => (
                            <TableRow key={banner._id}>
                                <TableCell>
                                    <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={banner.image}
                                            alt="Banner"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-medium text-gray-900">
                                        {getBannerType(banner)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-600">
                                        {getBannerTarget(banner)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <input
                                            type="number"
                                            value={banner.sortOrder}
                                            onChange={(e) => handleSortOrderChange(banner._id, parseInt(e.target.value))}
                                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                        />
                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                    </div>
                                </TableCell>
                                <TableCell>
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
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(new Date(banner.createdAt))}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <button
                                            onClick={() => router.push(`/dashboard/banners/${banner._id}`)}
                                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                            title="عرض"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => router.push(`/dashboard/banners/${banner._id}/edit`)}
                                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                            title="تعديل"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(banner)}
                                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                            title="حذف"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {pagination && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.pages || 1}
                        totalItems={pagination.total}
                        onPageChange={handlePageChange}
                    />
                )}
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
                            onClick={handleDeleteConfirm}
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
