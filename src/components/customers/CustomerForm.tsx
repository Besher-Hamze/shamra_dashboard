'use client';

import { useState, useEffect } from 'react';
import { useCreateCustomer, useUpdateCustomer, Customer } from '@/hooks/useCustomers';

interface CustomerFormProps {
    customer?: Customer;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        customerCode: '',
        isActive: true,
        notes: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'سوريا',
        },
    });

    const createCustomerMutation = useCreateCustomer();
    const updateCustomerMutation = useUpdateCustomer();

    useEffect(() => {
        if (customer) {
            setFormData({
                firstName: customer.firstName || '',
                lastName: customer.lastName || '',
                email: customer.email || '',
                phoneNumber: customer.phoneNumber || '',
                customerCode: customer.customerCode || '',
                isActive: customer.isActive ?? true,
                notes: customer.notes || '',
                address: {
                    street: customer.address?.street || '',
                    city: customer.address?.city || '',
                    state: customer.address?.state || '',
                    zipCode: customer.address?.zipCode || '',
                    country: customer.address?.country || 'سوريا',
                },
            });
        }
    }, [customer]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name.startsWith('address.')) {
            const addressField = name.replace('address.', '');
            setFormData(prev => ({
                ...prev,
                address: { ...prev.address, [addressField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const customerData = {
            ...formData,
            address: Object.values(formData.address).some(val => val.trim()) ? formData.address : undefined,
        };

        if (customer) {
            updateCustomerMutation.mutate(
                { id: customer.id, data: customerData },
                { onSuccess }
            );
        } else {
            createCustomerMutation.mutate(customerData, { onSuccess });
        }
    };

    const isLoading = createCustomerMutation.isPending || updateCustomerMutation.isPending;
    const error = createCustomerMutation.error || updateCustomerMutation.error;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">
                        {error?.message || 'حدث خطأ أثناء حفظ العميل'}
                    </p>
                </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الأول *
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="محمد"
                    />
                </div>

                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الأخير *
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="أحمد"
                    />
                </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="mohamed.ahmed@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف
                    </label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="+963-999-123456"
                    />
                </div>
            </div>

            {/* Customer Code */}
            <div>
                <label htmlFor="customerCode" className="block text-sm font-medium text-gray-700 mb-2">
                    رمز العميل
                </label>
                <input
                    type="text"
                    id="customerCode"
                    name="customerCode"
                    value={formData.customerCode}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="CUST001"
                />
            </div>

            {/* Address */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">العنوان</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-2">
                            الشارع
                        </label>
                        <input
                            type="text"
                            id="address.street"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="شارع الثورة 123"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-2">
                                المدينة
                            </label>
                            <input
                                type="text"
                                id="address.city"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleInputChange}
                                className="input-field"
                                placeholder="دمشق"
                            />
                        </div>

                        <div>
                            <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-2">
                                المحافظة
                            </label>
                            <input
                                type="text"
                                id="address.state"
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleInputChange}
                                className="input-field"
                                placeholder="دمشق"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                                الرمز البريدي
                            </label>
                            <input
                                type="text"
                                id="address.zipCode"
                                name="address.zipCode"
                                value={formData.address.zipCode}
                                onChange={handleInputChange}
                                className="input-field"
                                placeholder="12345"
                            />
                        </div>

                        <div>
                            <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-2">
                                البلد
                            </label>
                            <select
                                id="address.country"
                                name="address.country"
                                value={formData.address.country}
                                onChange={handleInputChange}
                                className="input-field"
                            >
                                <option value="سوريا">سوريا</option>
                                <option value="لبنان">لبنان</option>
                                <option value="الأردن">الأردن</option>
                                <option value="العراق">العراق</option>
                                <option value="مصر">مصر</option>
                                <option value="السعودية">السعودية</option>
                                <option value="الإمارات">الإمارات</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="أي ملاحظات إضافية حول العميل..."
                />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="mr-2 block text-sm text-gray-900">
                    عميل نشط
                </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn-secondary"
                >
                    إلغاء
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (customer ? 'جاري التحديث...' : 'جاري الحفظ...') : (customer ? 'تحديث العميل' : 'حفظ العميل')}
                </button>
            </div>
        </form>
    );
}
