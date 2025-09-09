'use client';

import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { useCreateCategory, useUpdateCategory, useCreateCategoryWithImage, useUpdateCategoryWithImage, useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';
import { getImageUrl } from '@/utils/hepler';

interface CategoryFormProps {
    category?: Category;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        sortOrder: '',
        isActive: true,
        isFeatured: false,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const createCategoryMutation = useCreateCategory();
    const updateCategoryMutation = useUpdateCategory();
    const createCategoryWithImageMutation = useCreateCategoryWithImage();
    const updateCategoryWithImageMutation = useUpdateCategoryWithImage();

    // Get categories for parent selection

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                description: category.description || '',
                image: category.image || '',
                sortOrder: category.sortOrder?.toString() || '',
                isActive: category.isActive ?? true,
                isFeatured: category.isFeatured ?? false,
            });
            // Set existing image as preview if available
            if (category.image) {
                setImagePreview(category.image);
            }
        }
    }, [category]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));

            // Auto-generate slug from English name
            if (name === 'name' && !category) {
                const slug = value.toLowerCase()
                    .replace(/[^a-z0-9 -]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim();
                setFormData(prev => ({ ...prev, slug }));
            }
        }
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
        setFormData(prev => ({ ...prev, image: '' }));

        // Reset file input
        const fileInput = document.getElementById('imageFile') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const categoryData = {
            ...formData,
            sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : undefined,
            image: formData.image || undefined,
        };

        if (category) {
            // Update existing category
            if (imageFile) {
                updateCategoryWithImageMutation.mutate(
                    { id: category.id, categoryData, imageFile },
                    { onSuccess }
                );
            } else {
                updateCategoryMutation.mutate(
                    { id: category.id, data: categoryData },
                    { onSuccess }
                );
            }
        } else {
            // Create new category
            if (imageFile) {
                createCategoryWithImageMutation.mutate(
                    { categoryData, imageFile },
                    { onSuccess }
                );
            } else {
                createCategoryMutation.mutate(categoryData, { onSuccess });
            }
        }
    };

    const isLoading = createCategoryMutation.isPending || updateCategoryMutation.isPending ||
        createCategoryWithImageMutation.isPending || updateCategoryWithImageMutation.isPending;
    const error = createCategoryMutation.error || updateCategoryMutation.error ||
        createCategoryWithImageMutation.error || updateCategoryWithImageMutation.error;



    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">
                        {error?.message || 'حدث خطأ أثناء حفظ الفئة'}
                    </p>
                </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        اسم الفئة *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Electronics"
                    />
                </div>
            </div>


            {/* Image Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        صورة الفئة
                    </label>

                    {/* File Upload */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <input
                                type="file"
                                id="imageFile"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="imageFile"
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Upload className="w-4 h-4 ml-2" />
                                اختر صورة
                            </label>


                        </div>

                        {/* Image Preview */}
                        {(imagePreview || formData.image) && (
                            <div className="relative inline-block">
                                <img
                                    src={getImageUrl(imagePreview) || getImageUrl(formData.image)}
                                    alt="Category preview"
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


                    </div>
                </div>
            </div>

            {/* Sort Order */}
            <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                    ترتيب العرض
                </label>
                <input
                    type="number"
                    id="sortOrder"
                    name="sortOrder"
                    min="0"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="1"
                />
                <p className="mt-1 text-sm text-gray-500">
                    الرقم الأقل يظهر أولاً
                </p>
            </div>

            {/* Status Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        فئة نشطة
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isFeatured"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFeatured" className="mr-2 block text-sm text-gray-900">
                        فئة مميزة
                    </label>
                </div>
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
                    {isLoading ? (category ? 'جاري التحديث...' : 'جاري الحفظ...') : (category ? 'تحديث الفئة' : 'حفظ الفئة')}
                </button>
            </div>
        </form>
    );
}
