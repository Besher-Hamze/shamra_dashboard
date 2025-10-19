'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, DollarSign, Coins, Percent } from 'lucide-react';
import { usePointsSettings, useBulkUpdateSettings, PointsSettings } from '@/hooks/useSettings';

export default function SettingsPage() {
    const { data: pointsSettings, isLoading, error } = usePointsSettings();
    const bulkUpdateMutation = useBulkUpdateSettings();

    const [formData, setFormData] = useState<PointsSettings>({
        points_rate_usd: 10,
        points_rate_syp: 10,
        points_rate_try: 10,
        points_discount_rate: 1,
        points_max_discount_percent: 50,
    });

    const [hasChanges, setHasChanges] = useState(false);

    // Update form data when settings are loaded
    useEffect(() => {
        if (pointsSettings) {
            setFormData(pointsSettings);
        }
    }, [pointsSettings]);

    const handleInputChange = (key: keyof PointsSettings, value: number) => {
        setFormData(prev => ({
            ...prev,
            [key]: value,
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        const settings = Object.entries(formData).map(([key, value]) => ({
            key,
            value,
        }));

        await bulkUpdateMutation.mutateAsync(settings);
        setHasChanges(false);
    };

    const handleReset = () => {
        if (pointsSettings) {
            setFormData(pointsSettings);
            setHasChanges(false);
        }
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
                <div className="text-red-600 mb-4">خطأ في تحميل الإعدادات {error.message}</div>
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إعدادات النقاط</h1>
                    <p className="text-gray-600">إدارة نظام النقاط والمكافآت</p>
                </div>
                <div className="flex space-x-3 space-x-reverse">
                    {hasChanges && (
                        <button
                            onClick={handleReset}
                            className="btn-secondary flex items-center space-x-2 space-x-reverse"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>إعادة تعيين</span>
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || bulkUpdateMutation.isPending}
                        className="btn-primary flex items-center space-x-2 space-x-reverse"
                    >
                        <Save className="h-4 w-4" />
                        <span>
                            {bulkUpdateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Points Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Coins className="h-5 w-5 ml-2 text-yellow-500" />
                        معدلات كسب النقاط
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        تحديد عدد النقاط المكتسبة لكل عملة
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* USD Points Rate */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <DollarSign className="h-4 w-4 inline ml-1" />
                                النقاط لكل 100 دولار أمريكي
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.points_rate_usd}
                                    onChange={(e) => handleInputChange('points_rate_usd', Number(e.target.value))}
                                    className="input-field pl-8"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Coins className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                كل 100$ = {formData.points_rate_usd} نقاط
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                💰 النقاط لكل 100,000 ليرة سورية
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.points_rate_syp}
                                    onChange={(e) => handleInputChange('points_rate_syp', Number(e.target.value))}
                                    className="input-field pl-8"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Coins className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                كل 100,000 ل.س = {formData.points_rate_syp} نقاط
                            </p>
                        </div>
                    </div>

                    {/* TRY Points Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🇹🇷 النقاط لكل 1,000 ليرة تركية
                        </label>
                        <div className="relative max-w-md">
                            <input
                                type="number"
                                min="0"
                                value={formData.points_rate_try}
                                onChange={(e) => handleInputChange('points_rate_try', Number(e.target.value))}
                                className="input-field pl-8"
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Coins className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            كل 1,000 ₺ = {formData.points_rate_try} نقاط
                        </p>
                    </div>
                </div>
            </div>

            {/* Discount Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Percent className="h-5 w-5 ml-2 text-green-500" />
                        إعدادات الخصم بالنقاط
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        تحديد كيفية استخدام النقاط للحصول على خصم
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Discount Rate */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نسبة الخصم لكل نقطة
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={formData.points_discount_rate}
                                    onChange={(e) => handleInputChange('points_discount_rate', Number(e.target.value))}
                                    className="input-field pl-8"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Percent className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                1 نقطة = {formData.points_discount_rate}% خصم
                            </p>
                        </div>

                        {/* Max Discount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الحد الأقصى للخصم
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.points_max_discount_percent}
                                    onChange={(e) => handleInputChange('points_max_discount_percent', Number(e.target.value))}
                                    className="input-field pl-8"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Percent className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                حد أقصى {formData.points_max_discount_percent}% خصم
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص النظام</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <div className="font-medium text-gray-900">معدل كسب النقاط</div>
                        <div className="text-gray-600 mt-1">
                            USD: {formData.points_rate_usd} نقاط/100$<br />
                            SYP: {formData.points_rate_syp} نقاط/100K ل.س<br />
                            TRY: {formData.points_rate_try} نقاط/1K ₺
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <div className="font-medium text-gray-900">قيمة النقاط</div>
                        <div className="text-gray-600 mt-1">
                            1 نقطة = {formData.points_discount_rate}% خصم
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <div className="font-medium text-gray-900">حد الخصم</div>
                        <div className="text-gray-600 mt-1">
                            حد أقصى {formData.points_max_discount_percent}% خصم
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
