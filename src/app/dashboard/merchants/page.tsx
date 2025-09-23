'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMerchantRequests, useMerchantRequestManagement } from '@/hooks';
import { MerchantRequest, MerchantRequestStatus } from '@/types';
import {
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    Trash2,
    Clock,
    Store,
    User,
    Phone,
    MapPin,
    Calendar
} from 'lucide-react';

const getStatusIcon = (status: MerchantRequestStatus) => {
    switch (status) {
        case MerchantRequestStatus.PENDING:
            return <Clock className="w-4 h-4 text-yellow-500" />;
        case MerchantRequestStatus.APPROVED:
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        case MerchantRequestStatus.REJECTED:
            return <XCircle className="w-4 h-4 text-red-500" />;
        default:
            return <Clock className="w-4 h-4 text-gray-500" />;
    }
};

const getStatusText = (status: MerchantRequestStatus) => {
    switch (status) {
        case MerchantRequestStatus.PENDING:
            return 'في الانتظار';
        case MerchantRequestStatus.APPROVED:
            return 'موافق عليه';
        case MerchantRequestStatus.REJECTED:
            return 'مرفوض';
        default:
            return 'غير محدد';
    }
};

const getStatusColor = (status: MerchantRequestStatus) => {
    switch (status) {
        case MerchantRequestStatus.PENDING:
            return 'bg-yellow-100 text-yellow-800';
        case MerchantRequestStatus.APPROVED:
            return 'bg-green-100 text-green-800';
        case MerchantRequestStatus.REJECTED:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function MerchantsPage() {
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: undefined as MerchantRequestStatus | undefined,
        search: undefined as string | undefined,
    });

    const { data: merchantsResponse, isLoading, error } = useMerchantRequests(filters);
    const { handleApproveRequest, handleRejectRequest, handleDeleteRequest } = useMerchantRequestManagement();

    const merchants = merchantsResponse?.data?.data || [];
    const pagination = merchantsResponse?.data?.pagination;

    const handleFilterChange = (key: string, value: any) => {
        // Convert empty strings to undefined
        const processedValue = value === '' ? undefined : value;
        setFilters(prev => ({ ...prev, [key]: processedValue, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">حدث خطأ أثناء جلب طلبات التجار</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">طلبات التجار</h1>
                    <p className="text-gray-600">إدارة طلبات التجار الجدد</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="البحث في طلبات التجار..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={filters.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                            <option value="">جميع الحالات</option>
                            <option value={MerchantRequestStatus.PENDING}>في الانتظار</option>
                            <option value={MerchantRequestStatus.APPROVED}>موافق عليه</option>
                            <option value={MerchantRequestStatus.REJECTED}>مرفوض</option>
                        </select>
                    </div>

                    <div className="relative">
                        <select
                            value={filters.limit}
                            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                            <option value={10}>10 لكل صفحة</option>
                            <option value={20}>20 لكل صفحة</option>
                            <option value={50}>50 لكل صفحة</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {merchants.filter(m => m.status === MerchantRequestStatus.PENDING).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">موافق عليه</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {merchants.filter(m => m.status === MerchantRequestStatus.APPROVED).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">مرفوض</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {merchants.filter(m => m.status === MerchantRequestStatus.REJECTED).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Merchants Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    التاجر
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    اسم المتجر
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    العنوان
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الهاتف
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الحالة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    تاريخ الطلب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {merchants.map((merchant: MerchantRequest) => (
                                <tr key={merchant._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="mr-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {merchant.user ? merchant.user?.firstName + ' ' + merchant.user?.lastName : 'غير محدد'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Store className="w-4 h-4 text-gray-400 ml-2" />
                                            <span className="text-sm text-gray-900">{merchant.storeName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 text-gray-400 ml-2" />
                                            <span className="text-sm text-gray-900 max-w-xs truncate">{merchant.address}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 text-gray-400 ml-2" />
                                            <span className="text-sm text-gray-900">{merchant.phoneNumber}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(merchant.status)}`}>
                                            {getStatusIcon(merchant.status)}
                                            <span className="mr-1">{getStatusText(merchant.status)}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 text-gray-400 ml-2" />
                                            <span className="text-sm text-gray-900">
                                                {new Date(merchant.createdAt).toLocaleDateString('ar-SA')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <Link
                                                href={`/dashboard/merchants/${merchant._id}`}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                title="عرض التفاصيل"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>

                                            {merchant.status === MerchantRequestStatus.PENDING && (
                                                <>
                                                    <button
                                                        onClick={() => handleApproveRequest(merchant._id)}
                                                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                                        title="الموافقة"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectRequest(merchant._id)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                        title="الرفض"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => handleDeleteRequest(merchant._id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={!pagination.hasPrev}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                السابق
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={!pagination.hasNext}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                التالي
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    عرض <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> إلى{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                                    </span>{' '}
                                    من <span className="font-medium">{pagination.total}</span> نتيجة
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={!pagination.hasPrev}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        السابق
                                    </button>

                                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pagination.page
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={!pagination.hasNext}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        التالي
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {merchants.length === 0 && (
                <div className="text-center py-12">
                    <Store className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات تجار</h3>
                    <p className="mt-1 text-sm text-gray-500">لم يتم العثور على أي طلبات تجار.</p>
                </div>
            )}
        </div>
    );
}
