'use client';

import { useParams, useRouter } from 'next/navigation';
import UserForm from '@/components/users/UserForm';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useUser } from '@/hooks';

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const { user, isLoading, error } = useUser(userId);

    const handleSuccess = () => {
        router.push('/dashboard/users');
    };

    const handleCancel = () => {
        router.push('/dashboard/users');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600 ml-2" />
                    <span className="text-gray-600">جاري التحميل...</span>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">حدث خطأ في تحميل بيانات المستخدم</div>
                    <button
                        onClick={() => router.push('/dashboard/users')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        العودة للمستخدمين
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4 space-x-reverse">
                <button
                    onClick={() => router.push('/dashboard/users')}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowRight className="w-5 h-5 ml-2" />
                    العودة للمستخدمين
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">تعديل المستخدم</h1>
                    <p className="text-gray-600">تعديل بيانات المستخدم: {user.firstName} {user.lastName}</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <UserForm
                    user={user}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
