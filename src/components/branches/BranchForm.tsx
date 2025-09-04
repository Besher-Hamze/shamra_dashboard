'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Globe, Save, X } from 'lucide-react';
import { Branch } from '@/types';
import { CreateBranchData } from '@/hooks/useBranches';

interface BranchFormProps {
    branch?: Branch;
    onSubmit: (data: CreateBranchData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    error?: any;
    mode: 'add' | 'edit';
}

const daysOfWeek = [
    { key: 'monday', label: 'الاثنين' },
    { key: 'tuesday', label: 'الثلاثاء' },
    { key: 'wednesday', label: 'الأربعاء' },
    { key: 'thursday', label: 'الخميس' },
    { key: 'friday', label: 'الجمعة' },
    { key: 'saturday', label: 'السبت' },
    { key: 'sunday', label: 'الأحد' },
];

// Helper function to calculate working hours
const calculateWorkingHours = (openTime: string, closeTime: string): string => {
    if (!openTime || !closeTime) return '0';

    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    const diffMinutes = closeMinutes - openMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (minutes === 0) {
        return hours.toString();
    }
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

export default function BranchForm({ branch, onSubmit, onCancel, isLoading, error, mode }: BranchFormProps) {
    const [formData, setFormData] = useState<CreateBranchData>({
        name: '',
        description: '',
        address: {
            street: '',
            city: '',
        },
        phone: '',
        email: '',
        isActive: true,
        isMainBranch: false,
        operatingHours: {
            monday: { open: '09:00', close: '17:00' },
            tuesday: { open: '09:00', close: '17:00' },
            wednesday: { open: '09:00', close: '17:00' },
            thursday: { open: '09:00', close: '17:00' },
            friday: { open: '09:00', close: '17:00' },
            saturday: { open: '09:00', close: '17:00' },
            sunday: { open: '09:00', close: '17:00' },
        },
        sortOrder: 0,
    });

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name || '',
                description: branch.description || '',
                address: {
                    street: branch.address?.street || '',
                    city: branch.address?.city || '',
                },
                phone: branch.phone || '',
                email: branch.email || '',
                isActive: branch.isActive ?? true,
                isMainBranch: branch.isMainBranch ?? false,
                operatingHours: branch.operatingHours || {
                    monday: { open: '09:00', close: '17:00' },
                    tuesday: { open: '09:00', close: '17:00' },
                    wednesday: { open: '09:00', close: '17:00' },
                    thursday: { open: '09:00', close: '17:00' },
                    friday: { open: '09:00', close: '17:00' },
                    saturday: { open: '09:00', close: '17:00' },
                    sunday: { open: '09:00', close: '17:00' },
                },
                sortOrder: branch.sortOrder || 0,
            });
        }
    }, [branch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleInputChange = (field: string, value: any) => {
        if (field.startsWith('address.')) {
            const addressField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value,
                },
            }));
        } else if (field.startsWith('operatingHours.')) {
            const parts = field.split('.');
            const day = parts[1];
            const timeType = parts[2]; // 'open' or 'close'

            setFormData(prev => ({
                ...prev,
                operatingHours: {
                    ...prev.operatingHours,
                    [day]: {
                        ...prev.operatingHours?.[day as keyof typeof prev.operatingHours],
                        [timeType]: value,
                    },
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-3 space-x-reverse pb-4 border-b border-gray-200">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">المعلومات الأساسية</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">اسم الفرع</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="input-field"
                                    placeholder="فرع الرياض الرئيسي"
                                    required
                                />
                            </div>

                        </div>

                        <div className="form-group">
                            <label className="form-label">الوصف</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="textarea-field"
                                rows={3}
                                placeholder="وصف مختصر عن الفرع..."
                            />
                        </div>


                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-3 space-x-reverse pb-4 border-b border-gray-200">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">معلومات الاتصال</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">رقم الهاتف</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className="input-field"
                                placeholder="+966 11 123 4567"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="input-field"
                                placeholder="riyadh@company.com"
                            />
                        </div>



                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">ترتيب العرض</label>
                                <input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                                    className="input-field"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isActive" className="mr-2 text-sm text-gray-700">
                                    الفرع نشط
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isMainBranch"
                                    checked={formData.isMainBranch}
                                    onChange={(e) => handleInputChange('isMainBranch', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isMainBranch" className="mr-2 text-sm text-gray-700">
                                    الفرع الرئيسي
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Section */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 space-x-reverse pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">العنوان</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label className="form-label">الشارع *</label>
                        <input
                            type="text"
                            value={formData.address.street}
                            onChange={(e) => handleInputChange('address.street', e.target.value)}
                            className="input-field"
                            placeholder="شارع الملك فهد"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">المدينة *</label>
                        <input
                            type="text"
                            value={formData.address.city}
                            onChange={(e) => handleInputChange('address.city', e.target.value)}
                            className="input-field"
                            placeholder="الرياض"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Operating Hours */}
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">ساعات العمل</h3>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                            type="button"
                            onClick={() => {
                                daysOfWeek.forEach(day => {
                                    handleInputChange(`operatingHours.${day.key}.open`, '09:00');
                                    handleInputChange(`operatingHours.${day.key}.close`, '17:00');
                                });
                            }}
                            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                        >
                            تطبيق على الكل (9-5)
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                daysOfWeek.forEach(day => {
                                    if (day.key === 'friday') {
                                        handleInputChange(`operatingHours.${day.key}.open`, '');
                                        handleInputChange(`operatingHours.${day.key}.close`, '');
                                    } else {
                                        handleInputChange(`operatingHours.${day.key}.open`, '09:00');
                                        handleInputChange(`operatingHours.${day.key}.close`, '17:00');
                                    }
                                });
                            }}
                            className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors"
                        >
                            أيام العمل (عدا الجمعة)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {daysOfWeek.map((day) => {
                        const dayHours = formData.operatingHours?.[day.key as keyof typeof formData.operatingHours];
                        const isClosed = !dayHours?.open && !dayHours?.close;

                        return (
                            <div key={day.key} className={`form-group p-4 rounded-xl border-2 transition-all ${isClosed
                                ? 'border-red-200 bg-red-50'
                                : 'border-gray-200 bg-white hover:border-orange-200'
                                }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <label className={`font-medium ${isClosed ? 'text-red-700' : 'text-gray-900'
                                        }`}>
                                        {day.label}
                                    </label>
                                    <div className="flex items-center space-x-1 space-x-reverse">
                                        <input
                                            type="checkbox"
                                            id={`closed-${day.key}`}
                                            checked={isClosed}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    // Mark as closed
                                                    handleInputChange(`operatingHours.${day.key}.open`, '');
                                                    handleInputChange(`operatingHours.${day.key}.close`, '');
                                                } else {
                                                    // Set default hours
                                                    handleInputChange(`operatingHours.${day.key}.open`, '09:00');
                                                    handleInputChange(`operatingHours.${day.key}.close`, '17:00');
                                                }
                                            }}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded transition-colors"
                                        />
                                        <label htmlFor={`closed-${day.key}`} className="text-xs text-red-600 font-medium cursor-pointer">
                                            مغلق
                                        </label>
                                    </div>
                                </div>

                                {isClosed ? (
                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center">
                                        <span className="text-red-700 text-sm font-semibold">مغلق</span>
                                        <div className="text-red-600 text-xs mt-1">لا يوجد عمل في هذا اليوم</div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex space-x-2 space-x-reverse">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-600 mb-1 block">فتح</label>
                                                <input
                                                    type="time"
                                                    value={dayHours?.open || '09:00'}
                                                    onChange={(e) => handleInputChange(`operatingHours.${day.key}.open`, e.target.value)}
                                                    className="input-field w-full text-sm"
                                                />
                                            </div>
                                            <div className="flex items-center justify-center pt-5">
                                                <span className="text-gray-400 text-sm">—</span>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-600 mb-1 block">إغلاق</label>
                                                <input
                                                    type="time"
                                                    value={dayHours?.close || '17:00'}
                                                    onChange={(e) => handleInputChange(`operatingHours.${day.key}.close`, e.target.value)}
                                                    className="input-field w-full text-sm"
                                                />
                                            </div>
                                        </div>
                                        {dayHours?.open && dayHours?.close && (
                                            <div className="text-xs text-gray-500 text-center mt-2">
                                                مدة العمل: {calculateWorkingHours(dayHours.open, dayHours.close)} ساعات
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">
                        {error?.response?.data?.message || error?.message || 'حدث خطأ أثناء حفظ الفرع'}
                    </p>
                </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn-secondary flex items-center"
                    disabled={isLoading}
                >
                    <X className="h-4 w-4 mr-2" />
                    إلغاء
                </button>
                <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={isLoading || !formData.name}
                >
                    {isLoading ? (
                        <>
                            <div className="loading-spinner mr-2"></div>
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            {mode === 'add' ? 'إضافة الفرع' : 'تحديث الفرع'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}