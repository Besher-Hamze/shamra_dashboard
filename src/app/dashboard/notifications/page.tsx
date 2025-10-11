'use client';

import NotificationForm from '@/components/notifications/NotificationForm';

export default function NotificationsPage() {
    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">إرسال إشعار</h1>
                <p className="text-gray-600 mt-2">أرسل إشعاراً لجميع المستخدمين أو لمستخدم محدد</p>
            </div>

            {/* Inline Create Notification Form */}
            <div className="card">
                <NotificationForm />
            </div>
        </div>
    );
}
