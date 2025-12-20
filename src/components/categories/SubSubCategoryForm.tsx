'use client';

import { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { SubSubCategory, CreateSubSubCategoryData, UpdateSubSubCategoryData } from '@/types';
import { getImageUrl } from '@/utils/hepler';

interface SubSubCategoryFormProps {
    subSubCategory?: SubSubCategory;
    subCategoryId: string;
    onSubmit: (data: CreateSubSubCategoryData | UpdateSubSubCategoryData, imageFile?: File) => void;
    onCancel: () => void;
    isLoading?: boolean;
    error?: Error | null;
}

export default function SubSubCategoryForm({
    subSubCategory,
    subCategoryId,
    onSubmit,
    onCancel,
    isLoading,
    error
}: SubSubCategoryFormProps) {
    const [formData, setFormData] = useState<CreateSubSubCategoryData>({
        name: '',
        subCategoryId: subCategoryId,
        image: '',
        isActive: true,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        if (subSubCategory) {
            setFormData({
                name: subSubCategory.name || '',
                subCategoryId: subSubCategory.subCategoryId || subCategoryId,
                image: subSubCategory.image || '',
                isActive: subSubCategory.isActive ?? true,
            });
            if (subSubCategory.image) {
                setImagePreview(getImageUrl(subSubCategory.image));
            }
        }
    }, [subSubCategory, subCategoryId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            return;
        }
        onSubmit(formData, imageFile || undefined);
    };

    const handleInputChange = (field: keyof CreateSubSubCategoryData, value: string | boolean) => {
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
        setFormData(prev => ({
            ...prev,
            image: ''
        }));
        const fileInput = document.getElementById('subSubCategoryImageFile') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error.message || 'حدث خطأ أثناء الحفظ'}
                </div>
            )}

            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم *
                </label>
                <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="أدخل اسم الفئة الفرعية"
                    required
                />
            </div>

            {/* Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصورة
                </label>
                <div className="space-y-4">
                    {imagePreview ? (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <label
                                htmlFor="subSubCategoryImageFile"
                                className="cursor-pointer text-sm text-gray-600 hover:text-gray-800"
                            >
                                اضغط لرفع صورة
                            </label>
                            <input
                                type="file"
                                id="subSubCategoryImageFile"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="mr-2 block text-sm text-gray-900">
                    نشط
                </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    إلغاء
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
                >
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'جاري الحفظ...' : subSubCategory ? 'تحديث' : 'حفظ'}</span>
                </button>
            </div>
        </form>
    );
}

