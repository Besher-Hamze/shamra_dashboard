'use client';

import { useRouter } from 'next/navigation';
import UserForm from '@/components/users/UserForm';
import { ArrowRight } from 'lucide-react';

export default function AddUserPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/dashboard/users');
    };

    const handleCancel = () => {
        router.push('/dashboard/users');
    };

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
                    <h1 className="text-2xl font-bold text-gray-900">إضافة مستخدم جديد</h1>
                    <p className="text-gray-600">إنشاء حساب مستخدم جديد في النظام</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <UserForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
