'use client';

import { useState, useEffect } from 'react';
import { X, Save, Tag } from 'lucide-react';
import { SubCategory, CreateSubCategoryData } from '@/types';

interface SubCategoryFormProps {
    subCategory?: SubCategory;
    categoryId: string;
    onSubmit: (data: CreateSubCategoryData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    error?: any;
}

export default function SubCategoryForm({
    subCategory,
    categoryId,
    onSubmit,
    onCancel,
    isLoading,
    error
}: SubCategoryFormProps) {
    const [formData, setFormData] = useState<CreateSubCategoryData>({
        name: '',
        categoryId: categoryId,
        isActive: true,
    });

    useEffect(() => {
        if (subCategory) {
            setFormData({
                name: subCategory.name || '',
                categoryId: subCategory.categoryId || categoryId,
                isActive: subCategory.isActive ?? true,
            });
        }
    }, [subCategory, categoryId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleInputChange = (field: keyof CreateSubCategoryData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <Tag className="h-5 w-5 mr-2" />
                        {subCategory ? 'تعديل الفئة الفرعية' : 'إضافة فئة فرعية جديدة'}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">

                        <div className="form-group">
                            <label className="form-label">اسم الفئة الفرعية (بالإنجليزية) *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="input-field"
                                required
                                placeholder="Subcategory Name in English"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="mr-2 text-sm text-gray-700">
                                الفئة الفرعية نشطة
                            </label>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700 text-sm">
                                {error?.response?.data?.message || error?.message || 'حدث خطأ أثناء حفظ الفئة الفرعية'}
                            </p>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 space-x-reverse mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-secondary"
                            disabled={isLoading}
                        >
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
                                    {subCategory ? 'تحديث الفئة الفرعية' : 'إضافة الفئة الفرعية'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

