'use client';

import { useState, useEffect } from 'react';
import { X, Save, Tag, Upload } from 'lucide-react';
import { SubCategory, CreateSubCategoryData } from '@/types';

interface SubCategoryFormProps {
    subCategory?: SubCategory;
    categoryId: string;
    onSubmit: (data: CreateSubCategoryData, imageFile?: File) => void;
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

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

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
        onSubmit(formData, imageFile || undefined);
    };

    const handleInputChange = (field: keyof CreateSubCategoryData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');

        // Reset file input
        const fileInput = document.getElementById('subCategoryImageFile') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
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

                        {/* Image Upload */}
                        <div className="form-group">
                            <label className="form-label">صورة الفئة الفرعية</label>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 space-x-reverse">
                                    <input
                                        type="file"
                                        id="subCategoryImageFile"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="subCategoryImageFile"
                                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Upload className="w-4 h-4 ml-2" />
                                        اختر صورة
                                    </label>
                                </div>

                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="SubCategory preview"
                                            className="w-32 h-32 object-cover rounded-lg border"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <p className="text-sm text-gray-500">
                                    اختياري: يمكنك رفع صورة للفئة الفرعية
                                </p>
                            </div>
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

