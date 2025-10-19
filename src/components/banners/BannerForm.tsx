'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Image as ImageIcon, ChevronDown, ShoppingBag, Package, Tag } from 'lucide-react';
import { useBannerForm } from '@/hooks/useBanners';
import { useProducts, useCategories, useSubCategories } from '@/hooks';
import { CreateBannerData, UpdateBannerData, Product, Category, SubCategory } from '@/types';
import { getImageUrl } from '@/utils/hepler';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

interface BannerFormProps {
    bannerId?: string;
}

export default function BannerForm({ bannerId }: BannerFormProps) {
    const router = useRouter();
    const { banner, isLoading, isEditing, handleSubmit, isSubmitting } = useBannerForm(bannerId);

    const [searchTerms, setSearchTerms] = useState<{
        product: string;
        category: string;
        subcategory: string;
    }>({
        product: '',
        category: '',
        subcategory: '',
    });

    // Debounced search terms for API calls
    const debouncedProductSearch = useDebounce(searchTerms.product, 300);
    const debouncedCategorySearch = useDebounce(searchTerms.category, 300);
    const debouncedSubCategorySearch = useDebounce(searchTerms.subcategory, 300);

    // Fetch data for dropdowns with search parameters
    const { data: productsData, isLoading: productsLoading } = useProducts({
        limit: 100,
        search: debouncedProductSearch || undefined,
        // isActive: true
    });
    const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
        limit: 100,
        search: debouncedCategorySearch || undefined,
        // isActive: true
    });
    const { data: subCategoriesData, isLoading: subCategoriesLoading } = useSubCategories({
        limit: 100,
        search: debouncedSubCategorySearch || undefined,
        // isActive: true
    });

    const products = (productsData as any)?.data?.data || (productsData as any)?.data || [];
    const categories = (categoriesData as any)?.data?.data || (categoriesData as any)?.data || [];
    const subCategories = (subCategoriesData as any)?.data?.data || (subCategoriesData as any)?.data || [];

    const [formData, setFormData] = useState<CreateBannerData>({
        image: '',
        productId: '',
        categoryId: '',
        subCategoryId: '',
        sortOrder: 0,
        isActive: true,
    });

    const [imagePreview, setImagePreview] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [selectedTargetType, setSelectedTargetType] = useState<'product' | 'category' | 'subcategory' | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState<{
        product: boolean;
        category: boolean;
        subcategory: boolean;
    }>({
        product: false,
        category: false,
        subcategory: false,
    });

    const dropdownRefs = {
        product: useRef<HTMLDivElement>(null),
        category: useRef<HTMLDivElement>(null),
        subcategory: useRef<HTMLDivElement>(null),
    };

    // Load banner data when editing
    useEffect(() => {
        if (isEditing && banner?.data) {
            const bannerData = banner.data;
            setFormData({
                image: bannerData.image || '',
                productId: typeof bannerData.productId === 'string' ? bannerData.productId : '',
                categoryId: typeof bannerData.categoryId === 'string' ? bannerData.categoryId : '',
                subCategoryId: typeof bannerData.subCategoryId === 'string' ? bannerData.subCategoryId : '',
                sortOrder: bannerData.sortOrder || 0,
                isActive: bannerData.isActive ?? true,
            });
            setImagePreview(bannerData.image || '');

            // Set the selected target type based on existing data
            if (bannerData.productId) {
                setSelectedTargetType('product');
            } else if (bannerData.categoryId) {
                setSelectedTargetType('category');
            } else if (bannerData.subCategoryId) {
                setSelectedTargetType('subcategory');
            }
        }
    }, [isEditing, banner]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            Object.entries(dropdownRefs).forEach(([key, ref]) => {
                if (ref.current && !ref.current.contains(event.target as Node)) {
                    setIsDropdownOpen(prev => ({
                        ...prev,
                        [key]: false,
                    }));
                }
            });
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
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
    };

    // Helper functions for getting selected items
    const getSelectedProduct = () => {
        return products.find((p: any) => (p._id || p.id) === formData.productId);
    };

    const getSelectedCategory = () => {
        return categories.find((c: any) => (c._id || c.id) === formData.categoryId);
    };

    const getSelectedSubCategory = () => {
        return subCategories.find((sc: any) => (sc._id || sc.id) === formData.subCategoryId);
    };

    // Helper functions for getting total counts (for display purposes)
    const getTotalProducts = () => {
        return (productsData as any)?.total || products.length;
    };

    const getTotalCategories = () => {
        return (categoriesData as any)?.total || categories.length;
    };

    const getTotalSubCategories = () => {
        return (subCategoriesData as any)?.total || subCategories.length;
    };

    const handleTargetTypeChange = (type: 'product' | 'category' | 'subcategory') => {
        setSelectedTargetType(type);
        setFormData(prev => ({
            ...prev,
            productId: '',
            categoryId: '',
            subCategoryId: ''
        }));
        setIsDropdownOpen({
            product: false,
            category: false,
            subcategory: false,
        });
        // Clear search terms when changing target type
        setSearchTerms({
            product: '',
            category: '',
            subcategory: '',
        });
    };

    const handleItemSelect = (type: 'product' | 'category' | 'subcategory', item: Product | Category | SubCategory) => {
        const itemId = (item as any)._id || (item as any).id;
        setFormData(prev => ({
            ...prev,
            productId: type === 'product' ? itemId : '',
            categoryId: type === 'category' ? itemId : '',
            subCategoryId: type === 'subcategory' ? itemId : '',
        }));
        setIsDropdownOpen(prev => ({
            ...prev,
            [type]: false,
        }));
        // Clear search term when item is selected
        setSearchTerms(prev => ({
            ...prev,
            [type]: '',
        }));
    };

    const toggleDropdown = (type: 'product' | 'category' | 'subcategory') => {
        setIsDropdownOpen(prev => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const handleSearchChange = (type: 'product' | 'category' | 'subcategory', value: string) => {
        setSearchTerms(prev => ({
            ...prev,
            [type]: value,
        }));
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that a target type is selected
        if (!selectedTargetType) {
            alert('يرجى اختيار نوع الهدف (منتج أو صنف أو صنف فرعي)');
            return;
        }

        // Validate that the corresponding ID is provided
        if (selectedTargetType === 'product' && !formData.productId) {
            alert('يرجى إدخال معرف المنتج');
            return;
        }
        if (selectedTargetType === 'category' && !formData.categoryId) {
            alert('يرجى إدخال معرف الصنف');
            return;
        }
        if (selectedTargetType === 'subcategory' && !formData.subCategoryId) {
            alert('يرجى إدخال معرف الصنف الفرعي');
            return;
        }

        // Validate image is provided
        if (!imageFile && !imagePreview) {
            alert('يرجى اختيار صورة للبانر');
            return;
        }

        // Prepare data with only the selected target and proper image handling
        const submitData = {
            ...formData,
            image: imageFile || imagePreview, // Use File object if available, otherwise use string URL
            productId: selectedTargetType === 'product' ? formData.productId : '',
            categoryId: selectedTargetType === 'category' ? formData.categoryId : '',
            subCategoryId: selectedTargetType === 'subcategory' ? formData.subCategoryId : '',
        };

        handleSubmit(submitData);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4 space-x-reverse">
                <button
                    onClick={() => router.back()}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'تعديل البانر' : 'إضافة بانر جديد'}
                    </h1>
                    <p className="text-gray-600">
                        {isEditing ? 'تعديل بيانات البانر' : 'إضافة بانر جديد للنظام'}
                    </p>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Image Upload */}
                    <div className="lg:col-span-2">
                        <label className="form-label text-lg font-semibold text-gray-800">صورة البانر *</label>
                        <p className="text-sm text-gray-600 mb-4">اختر صورة عالية الجودة للبانر</p>
                        <div className="mt-1">
                            {imagePreview ? (
                                <div className="relative group">
                                    <img
                                        src={getImageUrl(imagePreview)}
                                        alt="Banner preview"
                                        className="w-full h-48 object-cover rounded-lg border border-gray-300 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-3 left-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                        معاينة البانر
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <ImageIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <span className="block text-lg font-medium text-gray-900 mb-2">
                                                اختر صورة البانر
                                            </span>
                                            <span className="block text-sm text-gray-500 mb-4">
                                                PNG, JPG, GIF حتى 10MB
                                            </span>
                                            <div className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                                <Upload className="h-4 w-4 ml-2" />
                                                رفع صورة
                                            </div>
                                        </label>
                                        <input
                                            id="image-upload"
                                            name="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="sr-only"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Target Selection */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <label className="form-label text-lg font-semibold text-gray-800">الهدف *</label>
                        <p className="text-sm text-gray-600 mb-4">اختر نوع الهدف الذي سيتم عرض البانر له</p>
                        <div className="space-y-6">
                            {/* Product Selection */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="targetType"
                                        value="product"
                                        checked={selectedTargetType === 'product'}
                                        onChange={() => handleTargetTypeChange('product')}
                                        className="ml-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                                            <ShoppingBag className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900">منتج</span>
                                            <p className="text-sm text-gray-500">عرض البانر لمنتج محدد</p>
                                        </div>
                                    </div>
                                </label>
                                {selectedTargetType === 'product' && (
                                    <div ref={dropdownRefs.product} className="mt-2 relative">
                                        <button
                                            type="button"
                                            onClick={() => toggleDropdown('product')}
                                            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <span className="text-right">
                                                {getSelectedProduct()?.name || 'اختر منتج...'}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </button>

                                        {isDropdownOpen.product && (
                                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                {/* Search Input */}
                                                <div className="p-2 border-b border-gray-200">
                                                    <input
                                                        type="text"
                                                        placeholder="البحث في المنتجات..."
                                                        value={searchTerms.product}
                                                        onChange={(e) => handleSearchChange('product', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    {searchTerms.product && (
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {products.length} من {getTotalProducts()} منتج
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Results */}
                                                <div className="max-h-48 overflow-auto">
                                                    {productsLoading ? (
                                                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                                            <div className="flex items-center justify-center">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                                                                جاري البحث...
                                                            </div>
                                                        </div>
                                                    ) : products.length > 0 ? (
                                                        products.map((product: any) => (
                                                            <button
                                                                key={product._id || product.id}
                                                                type="button"
                                                                onClick={() => handleItemSelect('product', product)}
                                                                className="w-full text-right px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                                            >
                                                                {product.name}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                                            {searchTerms.product ? 'لا توجد منتجات مطابقة' : 'لا توجد منتجات متاحة'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Category Selection */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="targetType"
                                        value="category"
                                        checked={selectedTargetType === 'category'}
                                        onChange={() => handleTargetTypeChange('category')}
                                        className="ml-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center ml-3">
                                            <Package className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900">صنف</span>
                                            <p className="text-sm text-gray-500">عرض البانر لصنف محدد</p>
                                        </div>
                                    </div>
                                </label>
                                {selectedTargetType === 'category' && (
                                    <div ref={dropdownRefs.category} className="mt-2 relative">
                                        <button
                                            type="button"
                                            onClick={() => toggleDropdown('category')}
                                            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <span className="text-right">
                                                {getSelectedCategory()?.name || 'اختر صنف...'}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </button>

                                        {isDropdownOpen.category && (
                                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                {/* Search Input */}
                                                <div className="p-2 border-b border-gray-200">
                                                    <input
                                                        type="text"
                                                        placeholder="البحث في الأصناف..."
                                                        value={searchTerms.category}
                                                        onChange={(e) => handleSearchChange('category', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    {searchTerms.category && (
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {categories.length} من {getTotalCategories()} صنف
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Results */}
                                                <div className="max-h-48 overflow-auto">
                                                    {categoriesLoading ? (
                                                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                                            <div className="flex items-center justify-center">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                                                                جاري البحث...
                                                            </div>
                                                        </div>
                                                    ) : categories.length > 0 ? (
                                                        categories.map((category: any) => (
                                                            <button
                                                                key={category._id || category.id}
                                                                type="button"
                                                                onClick={() => handleItemSelect('category', category)}
                                                                className="w-full text-right px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                                            >
                                                                {category.name}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                                            {searchTerms.category ? 'لا توجد أصناف مطابقة' : 'لا توجد أصناف متاحة'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* SubCategory Selection */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="targetType"
                                        value="subcategory"
                                        checked={selectedTargetType === 'subcategory'}
                                        onChange={() => handleTargetTypeChange('subcategory')}
                                        className="ml-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center ml-3">
                                            <Tag className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900">صنف فرعي</span>
                                            <p className="text-sm text-gray-500">عرض البانر لصنف فرعي محدد</p>
                                        </div>
                                    </div>
                                </label>
                                {selectedTargetType === 'subcategory' && (
                                    <div ref={dropdownRefs.subcategory} className="mt-2 relative">
                                        <button
                                            type="button"
                                            onClick={() => toggleDropdown('subcategory')}
                                            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <span className="text-right">
                                                {getSelectedSubCategory()?.name || 'اختر صنف فرعي...'}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </button>

                                        {isDropdownOpen.subcategory && (
                                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                {/* Search Input */}
                                                <div className="p-2 border-b border-gray-200">
                                                    <input
                                                        type="text"
                                                        placeholder="البحث في الأصناف الفرعية..."
                                                        value={searchTerms.subcategory}
                                                        onChange={(e) => handleSearchChange('subcategory', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    {searchTerms.subcategory && (
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {subCategories.length} من {getTotalSubCategories()} صنف فرعي
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Results */}
                                                <div className="max-h-48 overflow-auto">
                                                    {subCategoriesLoading ? (
                                                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                                            <div className="flex items-center justify-center">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                                                                جاري البحث...
                                                            </div>
                                                        </div>
                                                    ) : subCategories.length > 0 ? (
                                                        subCategories.map((subCategory: any) => (
                                                            <button
                                                                key={subCategory._id || subCategory.id}
                                                                type="button"
                                                                onClick={() => handleItemSelect('subcategory', subCategory)}
                                                                className="w-full text-right px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                                            >
                                                                {subCategory.name}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                                            {searchTerms.subcategory ? 'لا توجد أصناف فرعية مطابقة' : 'لا توجد أصناف فرعية متاحة'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sort Order */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <label htmlFor="sortOrder" className="form-label text-lg font-semibold text-gray-800">
                            ترتيب العرض
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                id="sortOrder"
                                name="sortOrder"
                                value={formData.sortOrder}
                                onChange={handleInputChange}
                                min="0"
                                className="input-field text-center text-lg font-medium"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                            البانرات ذات الترتيب الأقل تظهر أولاً
                        </p>
                    </div>

                    {/* Active Status */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="ml-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-3 ${formData.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <div className={`w-3 h-3 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                </div>
                                <div>
                                    <span className="text-lg font-medium text-gray-900">
                                        البانر نشط
                                    </span>
                                    <p className="text-sm text-gray-500">
                                        البانرات غير النشطة لن تظهر في الموقع
                                    </p>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="bg-gray-50 rounded-lg p-6 border-t border-gray-200">
                    <div className="flex justify-end space-x-4 space-x-reverse">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                            disabled={isSubmitting}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 space-x-reverse"
                            disabled={isSubmitting || (!imageFile && !imagePreview)}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                <>
                                    <span>{isEditing ? 'تحديث البانر' : 'إنشاء البانر'}</span>
                                    <ImageIcon className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
