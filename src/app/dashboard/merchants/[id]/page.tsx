'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMerchantRequest, useMerchantRequestManagement } from '@/hooks';
import { MerchantRequestStatus } from '@/types';
import {
    ArrowRight,
    CheckCircle,
    XCircle,
    Clock,
    Store,
    User,
    Phone,
    MapPin,
    Calendar,
    Mail,
    Trash2,
    Edit
} from 'lucide-react';

const getStatusIcon = (status: MerchantRequestStatus) => {
    switch (status) {
        case MerchantRequestStatus.PENDING:
            return <Clock className="w-5 h-5 text-yellow-500" />;
        case MerchantRequestStatus.APPROVED:
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case MerchantRequestStatus.REJECTED:
            return <XCircle className="w-5 h-5 text-red-500" />;
        default:
            return <Clock className="w-5 h-5 text-gray-500" />;
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
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case MerchantRequestStatus.APPROVED:
            return 'bg-green-100 text-green-800 border-green-200';
        case MerchantRequestStatus.REJECTED:
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export default function MerchantRequestDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const merchantId = params.id as string;

    const { data: merchantResponse, isLoading, error } = useMerchantRequest(merchantId);
    const { handleApproveRequest, handleRejectRequest, handleDeleteRequest } = useMerchantRequestManagement();

    const merchant = merchantResponse?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !merchant) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">حدث خطأ أثناء جلب تفاصيل طلب التاجر</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    العودة
                </button>
            </div>
        );
    }

    const handleBack = () => {
        router.push('/dashboard/merchants');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">تفاصيل طلب التاجر</h1>
                        <p className="text-gray-600">عرض تفاصيل طلب التاجر</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                    {merchant.status === MerchantRequestStatus.PENDING && (
                        <>
                            <button
                                onClick={() => handleApproveRequest(merchant._id)}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <CheckCircle className="w-4 h-4 ml-2" />
                                الموافقة
                            </button>
                            <button
                                onClick={() => handleRejectRequest(merchant._id)}
                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <XCircle className="w-4 h-4 ml-2" />
                                الرفض
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => handleDeleteRequest(merchant._id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                    </button>
                </div>
            </div>

            {/* Status Card */}
            <div className={`border-2 rounded-lg p-6 ${getStatusColor(merchant.status)}`}>
                <div className="flex items-center">
                    {getStatusIcon(merchant.status)}
                    <div className="mr-4">
                        <h3 className="text-lg font-semibold">حالة الطلب</h3>
                        <p className="text-sm opacity-90">{getStatusText(merchant.status)}</p>
                    </div>
                </div>
                {merchant.rejectionReason && (
                    <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
                        <p className="text-sm font-medium">سبب الرفض:</p>
                        <p className="text-sm mt-1">{merchant.rejectionReason}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Merchant Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 ml-2 text-blue-600" />
                        معلومات التاجر
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 ml-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {typeof merchant.user === 'object' ?
                                        `${merchant.user?.firstName} ${merchant.user?.lastName}` :
                                        'غير محدد'
                                    }
                                </p>
                                <p className="text-sm text-gray-500">الاسم الكامل</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 ml-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {typeof merchant.user === 'object' ? merchant.user?.email : merchant.userId}
                                </p>
                                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 ml-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date(merchant.createdAt).toLocaleDateString('ar-SA', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                                <p className="text-sm text-gray-500">تاريخ الطلب</p>
                            </div>
                        </div>

                        {merchant.reviewedAt && (
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-gray-400 ml-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(merchant.reviewedAt).toLocaleDateString('ar-SA', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <p className="text-sm text-gray-500">تاريخ المراجعة</p>
                                </div>
                            </div>
                        )}

                        {merchant.reviewer && (
                            <div className="flex items-center">
                                <User className="w-4 h-4 text-gray-400 ml-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {typeof merchant.reviewer === 'object' ?
                                            `${merchant.reviewer?.firstName} ${merchant.reviewer?.lastName}` :
                                            merchant.reviewedBy
                                        }
                                    </p>
                                    <p className="text-sm text-gray-500">المراجع</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Store Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Store className="w-5 h-5 ml-2 text-green-600" />
                        معلومات المتجر
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Store className="w-4 h-4 text-gray-400 ml-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{merchant.storeName}</p>
                                <p className="text-sm text-gray-500">اسم المتجر</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <MapPin className="w-4 h-4 text-gray-400 ml-3 mt-1" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{merchant.address}</p>
                                <p className="text-sm text-gray-500">العنوان</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 ml-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{merchant.phoneNumber}</p>
                                <p className="text-sm text-gray-500">رقم الهاتف</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">سجل الطلب</h3>
                <div className="flow-root">
                    <ul className="-mb-8">
                        <li>
                            <div className="relative pb-8">
                                <div className="relative flex space-x-3 space-x-reverse">
                                    <div>
                                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                            <Calendar className="h-4 w-4 text-white" />
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4 space-x-reverse">
                                        <div>
                                            <p className="text-sm text-gray-500">تم إنشاء طلب التاجر</p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                            {new Date(merchant.createdAt).toLocaleDateString('ar-SA')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>

                        {merchant.reviewedAt && (
                            <li>
                                <div className="relative pb-8">
                                    <div className="relative flex space-x-3 space-x-reverse">
                                        <div>
                                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${merchant.status === MerchantRequestStatus.APPROVED
                                                    ? 'bg-green-500'
                                                    : 'bg-red-500'
                                                }`}>
                                                {merchant.status === MerchantRequestStatus.APPROVED ? (
                                                    <CheckCircle className="h-4 w-4 text-white" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-white" />
                                                )}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4 space-x-reverse">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    {merchant.status === MerchantRequestStatus.APPROVED
                                                        ? 'تم الموافقة على الطلب'
                                                        : 'تم رفض الطلب'
                                                    }
                                                </p>
                                                {merchant.rejectionReason && (
                                                    <p className="text-sm text-gray-400 mt-1">{merchant.rejectionReason}</p>
                                                )}
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                {new Date(merchant.reviewedAt).toLocaleDateString('ar-SA')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
