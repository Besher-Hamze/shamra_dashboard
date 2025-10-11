'use client';

import ExcelImportForm from '@/components/inventory/ExcelImportForm';

export default function InventoryPage() {
    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">استيراد المخزون</h1>
                <p className="text-gray-600 mt-2">قم برفع ملف Excel لاستيراد بيانات المخزون</p>
            </div>

            {/* Inline Excel Import Form */}
            <div className="card">
                <ExcelImportForm />
            </div>
        </div>
    );
}
