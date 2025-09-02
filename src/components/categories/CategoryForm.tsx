'use client';

import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { useCreateCategory, useUpdateCategory, useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';

interface CategoryFormProps {
    category?: Category;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        slug: '',
        image: '',
        icon: '',
        parentId: '',
        sortOrder: '',
        isActive: true,
        isFeatured: false,
    });

    const createCategoryMutation = useCreateCategory();
    const updateCategoryMutation = useUpdateCategory();

    // Get categories for parent selection
    const { data: categoriesData } = useCategories({ rootOnly: true });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                nameAr: category.nameAr || '',
                description: category.description || '',
                descriptionAr: category.descriptionAr || '',
                slug: category.slug || '',
                image: category.image || '',
                icon: category.icon || '',
                parentId: category.parentId || '',
                sortOrder: category.sortOrder?.toString() || '',
                isActive: category.isActive ?? true,
                isFeatured: category.isFeatured ?? false,
            });
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const categoryData = {
            ...formData,
            sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : undefined,
            parentId: formData.parentId || undefined,
            image: formData.image || undefined,
            icon: formData.icon || undefined,
        };

        if (category) {
            updateCategoryMutation.mutate(
                { id: category.id, data: categoryData },
                { onSuccess }
            );
        } else {
            createCategoryMutation.mutate(categoryData, { onSuccess });
        }
    };

    const isLoading = createCategoryMutation.isPending || updateCategoryMutation.isPending;
    const error = createCategoryMutation.error || updateCategoryMutation.error;



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


            {/* Image and Icon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                        رابط الصورة
                    </label>
                    <input
                        type="url"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="https://example.com/category-image.jpg"
                    />
                    {formData.image && (
                        <div className="mt-2">
                            <img
                                src={formData.image}
                                alt="Category preview"
                                className="w-20 h-20 object-cover rounded-lg border"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}
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
