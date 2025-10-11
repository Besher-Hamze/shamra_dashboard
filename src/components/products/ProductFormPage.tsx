'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Package, DollarSign, Tag, Settings, Image, Save, Ruler, FileText, Info, Star, InfoIcon } from 'lucide-react';
import { useCreateProduct, useUpdateProduct, useCreateProductWithImages, useUpdateProductWithImages, Product, CreateProductData } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useSubCategoriesByCategory } from '@/hooks/useSubCategories';
import { useBranches } from '@/hooks/useBranches';
import { Branch, Category, SubCategory, ProductStatus, SubCategoryType, BranchPricing } from '@/types';
import { getImageUrl } from '@/utils/hepler';

interface ProductFormPageProps {
    product?: Product;
    onSuccess: () => void;
    onCancel: () => void;
    mode: 'add' | 'edit';
}

export default function ProductFormPage({ product, onSuccess, onCancel, mode }: ProductFormPageProps) {
    const [formData, setFormData] = useState<CreateProductData>({
        name: '',
        description: '',
        barcode: '',
        categoryId: '',
        subCategoryId: '',
        branches: [] as string[],
        branchPricing: [] as BranchPricing[],
        brand: '',
        specifications: {},
        status: ProductStatus.ACTIVE,
        isActive: true,
        isFeatured: false,
        tags: [] as string[],
        images: [] as string[],
        mainImage: '',
        keywords: [] as string[],
        sortOrder: 0,
    });

    const [tagInput, setTagInput] = useState('');
    const [keywordInput, setKeywordInput] = useState('');
    const [specificationKey, setSpecificationKey] = useState('');
    const [specificationValue, setSpecificationValue] = useState('');
    const [selectedMainImage, setSelectedMainImage] = useState<File | null>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string>('');

    const { data: categoriesData } = useCategories();
    const { data: subCategoriesData } = useSubCategoriesByCategory(formData.categoryId);

    // Get selected subcategory data
    const selectedSubCategory = subCategoriesData?.find(sub => sub.id === formData.subCategoryId);
    const { data: branchesData } = useBranches({});
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const createProductWithImagesMutation = useCreateProductWithImages();
    const updateProductWithImagesMutation = useUpdateProductWithImages();

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                barcode: product.barcode || '',
                categoryId: product.categoryId || '',
                subCategoryId: product.subCategoryId || '',
                branches: product.branches?.map((b: any) => typeof b === 'string' ? b : b.id) || [],
                branchPricing: product.branchPricing || [],
                brand: product.brand || '',
                specifications: product.specifications || {},
                status: product.status || ProductStatus.ACTIVE,
                isActive: product.isActive ?? true,
                isFeatured: product.isFeatured ?? false,
                tags: product.tags || [],
                images: product.images || [],
                mainImage: product.mainImage || '',
                keywords: product.keywords || [],
                sortOrder: product.sortOrder || 0,
            });
        }
    }, [product]);

    // Cleanup URL objects on unmount
    useEffect(() => {
        return () => {
            if (mainImagePreviewUrl) {
                URL.revokeObjectURL(mainImagePreviewUrl);
            }
            imagePreviewUrls.forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [mainImagePreviewUrl, imagePreviewUrls]);


    const handleInputChange = (field: string, value: any) => {
        if (field === 'categoryId') {
            setFormData(prev => ({
                ...prev,
                [field]: value,
                subCategoryId: '', // This correctly resets sub-category when category changes
                specifications: {}, // Clear specifications when category changes
            }));
        } else if (field === 'subCategoryId') {
            // When subcategory changes, handle specifications based on the new subcategory type
            const newSubCategory = subCategoriesData?.find(sub => sub.id === value);
            let newSpecifications = {};

            if (newSubCategory?.type === SubCategoryType.CUSTOM_ATTR && newSubCategory.customFields) {
                // For custom attributes, only keep specifications that match the allowed fields
                newSpecifications = Object.fromEntries(
                    Object.entries(formData.specifications || {}).filter(([key]) =>
                        newSubCategory.customFields?.includes(key)
                    )
                );
            } else if (newSubCategory?.type === SubCategoryType.FREE_ATTR) {
                // For free attributes, keep all existing specifications
                newSpecifications = formData.specifications || {};
            }

            setFormData(prev => ({
                ...prev,
                [field]: value,
                specifications: newSpecifications,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags || [], tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
        }));
    };

    const addKeyword = () => {
        if (keywordInput.trim() && !formData.keywords?.includes(keywordInput.trim())) {
            setFormData(prev => ({
                ...prev,
                keywords: [...prev.keywords || [], keywordInput.trim()]
            }));
            setKeywordInput('');
        }
    };

    const removeKeyword = (keywordToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            keywords: prev.keywords?.filter(keyword => keyword !== keywordToRemove) || []
        }));
    };

    const addSpecification = () => {
        if (specificationKey.trim() && specificationValue.trim()) {
            setFormData(prev => ({
                ...prev,
                specifications: {
                    ...prev.specifications,
                    [specificationKey.trim()]: specificationValue.trim()
                }
            }));
            setSpecificationKey('');
            setSpecificationValue('');
        }
    };

    const removeSpecification = (keyToRemove: string) => {
        setFormData(prev => {
            const newSpecs = { ...prev.specifications };
            delete newSpecs[keyToRemove];
            return {
                ...prev,
                specifications: newSpecs
            };
        });
    };

    const handleMainImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedMainImage(file);
            const previewUrl = URL.createObjectURL(file);
            setMainImagePreviewUrl(previewUrl);
        }
    };

    const handleImagesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            setSelectedImages(prev => [...prev, ...files]);

            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const removeSelectedImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => {
            const newUrls = prev.filter((_, i) => i !== index);
            // Clean up URL object
            URL.revokeObjectURL(prev[index]);
            return newUrls;
        });
    };

    const removeMainImage = () => {
        if (mainImagePreviewUrl) {
            URL.revokeObjectURL(mainImagePreviewUrl);
        }
        setSelectedMainImage(null);
        setMainImagePreviewUrl('');
        setFormData(prev => ({
            ...prev,
            mainImage: ''
        }));
    };

    const removeExistingImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index) || []
        }));
    };



    const handleBranchChange = (branchId: string, checked: boolean) => {
        setFormData(prev => {
            const newBranches = checked
                ? [...(prev.branches || []), branchId]
                : (prev.branches || []).filter(id => id !== branchId);

            // Update branch pricing accordingly
            let newBranchPricing = [...(prev.branchPricing || [])];

            if (checked) {
                // Add new branch pricing if it doesn't exist
                const existingPricing = newBranchPricing.find(p => p.branchId === branchId);
                if (!existingPricing) {
                    newBranchPricing.push({
                        branchId,
                        price: 0,
                        costPrice: 0,
                        sku: '',
                        wholeSalePrice: 0,
                        salePrice: undefined,
                        currency: 'USD',
                        stockQuantity: 0,
                        isOnSale: false,
                        isActive: true
                    });
                }
            } else {
                // Remove branch pricing
                newBranchPricing = newBranchPricing.filter(p => p.branchId !== branchId);
            }

            return {
                ...prev,
                branches: newBranches,
                branchPricing: newBranchPricing
            };
        });
    };

    const handleBranchPricingChange = (branchId: string, field: keyof BranchPricing, value: any) => {
        setFormData(prev => {
            const newBranchPricing = [...(prev.branchPricing || [])];
            const existingIndex = newBranchPricing.findIndex(p => p.branchId === branchId);

            if (existingIndex >= 0) {
                newBranchPricing[existingIndex] = {
                    ...newBranchPricing[existingIndex],
                    [field]: value
                };
            }

            return {
                ...prev,
                branchPricing: newBranchPricing
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const productData: CreateProductData = {
            name: formData.name,
            description: formData.description || undefined,
            barcode: formData.barcode || undefined,
            categoryId: formData.categoryId,
            subCategoryId: formData.subCategoryId || undefined,
            branches: formData.branches || [],
            branchPricing: formData.branchPricing || [],
            images: formData.images || [],
            mainImage: formData.mainImage || undefined,
            brand: formData.brand || undefined,
            specifications: formData.specifications && Object.keys(formData.specifications).length > 0 ? formData.specifications : undefined,
            status: formData.status as ProductStatus,
            isActive: formData.isActive ?? true,
            isFeatured: formData.isFeatured ?? false,
            tags: formData.tags || [],
            keywords: formData.keywords || [],
            sortOrder: Number(formData.sortOrder) || 0,
        };

        // Check if we have files to upload
        const hasFiles = selectedMainImage || selectedImages.length > 0;

        if (product) {
            if (hasFiles) {
                updateProductWithImagesMutation.mutate({
                    id: product.id,
                    data: productData,
                    files: {
                        mainImage: selectedMainImage || undefined,
                        images: selectedImages.length > 0 ? selectedImages : undefined
                    }
                }, {
                    onSuccess: () => onSuccess(),
                });
            } else {
                updateProductMutation.mutate({ id: product.id, data: productData }, {
                    onSuccess: () => onSuccess(),
                });
            }
        } else {
            if (hasFiles) {
                createProductWithImagesMutation.mutate({
                    productData,
                    files: {
                        mainImage: selectedMainImage || undefined,
                        images: selectedImages.length > 0 ? selectedImages : undefined
                    }
                }, {
                    onSuccess: () => onSuccess(),
                });
            } else {
                createProductMutation.mutate(productData, {
                    onSuccess: () => onSuccess(),
                });
            }
        }
    };

    const isLoading = createProductMutation.isPending || updateProductMutation.isPending ||
        createProductWithImagesMutation.isPending || updateProductWithImagesMutation.isPending;
    const error = createProductMutation.error || updateProductMutation.error ||
        createProductWithImagesMutation.error || updateProductWithImagesMutation.error;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">


            {/* Basic Information */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 space-x-reverse pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">المعلومات الأساسية</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <div className="form-group">
                        <label className="form-label">اسم المنتج *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="input-field"
                            required
                            placeholder="اسم المنتج"
                        />
                    </div>



                    {/* <div className="form-group">
                        <label className="form-label">الباركود</label>
                        <input
                            type="text"
                            value={formData.barcode}
                            onChange={(e) => handleInputChange('barcode', e.target.value)}
                            className="input-field"
                            placeholder="1234567890123"
                        />
                    </div> */}

                    <div className="form-group">
                        <label className="form-label">العلامة التجارية</label>
                        <input
                            type="text"
                            value={formData.brand}
                            onChange={(e) => handleInputChange('brand', e.target.value)}
                            className="input-field"
                            placeholder="اسم العلامة التجارية"
                        />
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                    <div className="form-group">
                        <label className="form-label">الوصف</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="textarea-field"
                            rows={4}
                            placeholder="وصف المنتج"
                        />
                    </div>
                </div>
            </div>

            {/* Product Settings */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 space-x-reverse pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Settings className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">إعدادات المنتج</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-group">
                        <label className="form-label">ترتيب العرض</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.sortOrder}
                            onChange={(e) => handleInputChange('sortOrder', e.target.value)}
                            className="input-field"
                            placeholder="0"
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
                            المنتج نشط
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isFeatured"
                            checked={formData.isFeatured}
                            onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isFeatured" className="mr-2 text-sm text-gray-700">
                            منتج مميز
                        </label>
                    </div>
                </div>
            </div>

            {/* Category & Branches */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 space-x-reverse pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Tag className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">التصنيف والفروع</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-group">
                        <label className="form-label">الفئة *</label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => handleInputChange('categoryId', e.target.value)}
                            className="select-field"
                            required
                        >
                            <option value="">اختر الفئة</option>
                            {categoriesData?.data?.map((category: Category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">الفئة الفرعية</label>
                        <select
                            value={formData.subCategoryId}
                            onChange={(e) => handleInputChange('subCategoryId', e.target.value)}
                            className="select-field"
                            disabled={!formData.categoryId}
                        >
                            <option value="">اختر الفئة الفرعية (اختياري)</option>
                            {subCategoriesData?.map((subCategory: SubCategory) => (
                                <option key={subCategory.id} value={subCategory.id}>
                                    {subCategory.name}
                                </option>
                            ))}
                        </select>
                        {!formData.categoryId && (
                            <p className="text-xs text-gray-500 mt-1">اختر الفئة أولاً</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">الحالة</label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="select-field"
                        >
                            <option value={ProductStatus.ACTIVE}>نشط</option>
                            <option value={ProductStatus.INACTIVE}>غير نشط</option>
                            <option value={ProductStatus.OUT_OF_STOCK}>نفدت الكمية</option>
                        </select>
                    </div>
                </div>

                {/* Branches Selection */}
                <div className="form-group">
                    <label className="form-label">الفروع المتاحة</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        {branchesData?.data?.map((branch: Branch) => (
                            <div key={branch.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`branch-${branch.id}`}
                                    checked={(formData.branches || []).includes(branch.id)}
                                    onChange={(e) => handleBranchChange(branch.id, e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`branch-${branch.id}`} className="mr-2 text-sm text-gray-700">
                                    {(branch as any).nameAr || branch.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Branch Pricing Section */}
                {formData.branches && formData.branches.length > 0 && (
                    <div className="form-group">
                        <label className="form-label">تسعير الفروع</label>
                        <div className="mt-4 space-y-6">
                            {formData.branches.map((branchId) => {
                                const branch = branchesData?.data?.find((b: Branch) => b.id === branchId);
                                const branchPricing = formData.branchPricing?.find(p => p.branchId === branchId);

                                if (!branch || !branchPricing) return null;

                                return (
                                    <div key={branchId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                                            تسعير فرع: {(branch as any).nameAr || branch.name}
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="form-group">
                                                <label className="form-label">رقم المنتج</label>
                                                <input
                                                    type="text"
                                                    value={branchPricing.sku}
                                                    onChange={(e) => handleBranchPricingChange(branchId, 'sku', e.target.value)}
                                                    className="input-field"
                                                    placeholder="رقم المنتج"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">السعر</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={branchPricing.price}
                                                    onChange={(e) => handleBranchPricingChange(branchId, 'price', Number(e.target.value))}
                                                    className="input-field"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">سعر التكلفة</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={branchPricing.costPrice}
                                                    onChange={(e) => handleBranchPricingChange(branchId, 'costPrice', Number(e.target.value))}
                                                    className="input-field"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">سعر الجملة</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={branchPricing.wholeSalePrice}
                                                    onChange={(e) => handleBranchPricingChange(branchId, 'wholeSalePrice', Number(e.target.value))}
                                                    className="input-field"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">سعر التخفيض</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={branchPricing.salePrice || ''}
                                                    onChange={(e) => handleBranchPricingChange(branchId, 'salePrice', e.target.value ? Number(e.target.value) : undefined)}
                                                    className="input-field"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">العملة</label>
                                                <select
                                                    value={branchPricing.currency}
                                                    onChange={(e) => handleBranchPricingChange(branchId, 'currency', e.target.value)}
                                                    className="select-field"
                                                >
                                                    <option value="SYP">ليرة سورية (SYP)</option>
                                                    <option value="USD">دولار أمريكي (USD)</option>
                                                    <option value="EUR">يورو (EUR)</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">الكمية</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={branchPricing.stockQuantity}
                                                    onChange={(e) => handleBranchPricingChange(branchId, 'stockQuantity', Number(e.target.value))}
                                                    className="input-field"
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div className="flex items-center space-x-4 space-x-reverse">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`isOnSale-${branchId}`}
                                                        checked={branchPricing.isOnSale}
                                                        onChange={(e) => handleBranchPricingChange(branchId, 'isOnSale', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor={`isOnSale-${branchId}`} className="mr-2 text-sm text-gray-700">
                                                        في التخفيضات
                                                    </label>
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`isActive-${branchId}`}
                                                        checked={branchPricing.isActive}
                                                        onChange={(e) => handleBranchPricingChange(branchId, 'isActive', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor={`isActive-${branchId}`} className="mr-2 text-sm text-gray-700">
                                                        نشط
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Images */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 space-x-reverse pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Image className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">صور المنتج</h3>
                </div>

                {/* Main Image Upload */}
                <div className="form-group">
                    <label className="form-label">الصورة الرئيسية</label>
                    <div className="mt-2">
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="main-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">اضغط لتحميل</span> الصورة الرئيسية
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                                </div>
                                <input
                                    id="main-image-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleMainImageSelect}
                                />
                            </label>
                        </div>

                        {(mainImagePreviewUrl || (formData.mainImage && !selectedMainImage)) && (
                            <div className="mt-4">
                                <div className="relative inline-block">
                                    <img
                                        src={mainImagePreviewUrl || getImageUrl(formData.mainImage)}
                                        alt="الصورة الرئيسية"
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeMainImage}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                        title="حذف الصورة"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                        رئيسية
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Images Upload */}
                <div className="form-group">
                    <label className="form-label">صور إضافية</label>
                    <div className="mt-2">
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="images-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Image className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">اضغط لتحميل</span> صور إضافية
                                    </p>
                                    <p className="text-xs text-gray-500">يمكن اختيار عدة صور (MAX. 5MB لكل صورة)</p>
                                </div>
                                <input
                                    id="images-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImagesSelect}
                                />
                            </label>
                        </div>

                        {/* Display existing images from product */}
                        {formData.images && formData.images.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">الصور الحالية:</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {formData.images.map((image, index) => (
                                        <div key={`existing-${index}`} className="relative">
                                            <img
                                                src={getImageUrl(image)}
                                                alt={`صورة ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                                title="حذف الصورة"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                            <div className="absolute bottom-1 left-1 bg-gray-600 text-white text-xs px-1 py-0.5 rounded">
                                                موجودة
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Display selected new images */}
                        {imagePreviewUrls.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">الصور الجديدة المختارة:</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {imagePreviewUrls.map((url, index) => (
                                        <div key={`new-${index}`} className="relative">
                                            <img
                                                src={url}
                                                alt={`صورة جديدة ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSelectedImage(index)}
                                                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                                title="حذف الصورة"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                            <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-1 py-0.5 rounded">
                                                جديدة
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dimensions & Specifications */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 space-x-reverse pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <InfoIcon className="h-5 w-5 text-cyan-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">المواصفات</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Specifications - Dynamic based on subcategory type */}
                    <div className="form-group">
                        <label className="form-label flex items-center">
                            المواصفات التقنية
                            {selectedSubCategory && (
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${selectedSubCategory.type === SubCategoryType.FREE_ATTR
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {selectedSubCategory.type === SubCategoryType.FREE_ATTR ? 'خصائص حرة' : 'خصائص مخصصة'}
                                </span>
                            )}
                        </label>

                        {/* Show different UI based on subcategory type */}
                        {!selectedSubCategory ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                <InfoIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p>اختر فئة فرعية لتحديد نوع المواصفات</p>
                            </div>
                        ) : selectedSubCategory.type === SubCategoryType.FREE_ATTR ? (
                            // Free attributes - allow any specifications
                            <>
                                <div className="space-y-2">
                                    <div className="flex space-x-2 space-x-reverse">
                                        <input
                                            type="text"
                                            value={specificationKey}
                                            onChange={(e) => setSpecificationKey(e.target.value)}
                                            className="input-field flex-1"
                                            placeholder="المفتاح (مثل: اللون)"
                                        />
                                        <input
                                            type="text"
                                            value={specificationValue}
                                            onChange={(e) => setSpecificationValue(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecification())}
                                            className="input-field flex-1"
                                            placeholder="القيمة (مثل: أحمر)"
                                        />
                                        <button
                                            type="button"
                                            onClick={addSpecification}
                                            className="btn-secondary"
                                        >
                                            إضافة
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    يمكنك إضافة أي مواصفات تريدها لهذا المنتج
                                </p>
                            </>
                        ) : (
                            // Custom attributes - only allow predefined fields
                            <>
                                {selectedSubCategory.customFields && selectedSubCategory.customFields.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedSubCategory.customFields.map((field, index) => (
                                            <div key={index} className="flex items-center space-x-2 space-x-reverse">
                                                <label className="w-32 text-sm font-medium text-gray-700 text-right">
                                                    {field}:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={(formData.specifications as any)?.[field] || ''}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            specifications: {
                                                                ...prev.specifications,
                                                                [field]: e.target.value
                                                            }
                                                        }));
                                                    }}
                                                    className="input-field flex-1"
                                                    placeholder={`أدخل ${field}`}
                                                />
                                                {(formData.specifications as any)?.[field] && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newSpecs = { ...formData.specifications };
                                                            delete newSpecs[field];
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                specifications: newSpecs
                                                            }));
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <p className="text-sm text-gray-500">
                                            المواصفات محددة مسبقاً حسب الفئة الفرعية المختارة
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                                        <Settings className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                        <p>لا توجد خصائص مخصصة محددة لهذه الفئة</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Show current specifications */}
                        {formData.specifications && Object.keys(formData.specifications).length > 0 && selectedSubCategory?.type === SubCategoryType.FREE_ATTR && (
                            <div className="mt-3 space-y-2">
                                {Object.entries(formData.specifications).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                        <div className="flex-1">
                                            <span className="font-medium text-gray-900">{key}:</span>
                                            <span className="text-gray-700 mr-2">{String(value)}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSpecification(key)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tags & Keywords */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 space-x-reverse pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Tag className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">العلامات والكلمات المفتاحية</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label className="form-label">العلامات</label>
                        <div className="flex space-x-2 space-x-reverse">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="input-field flex-1"
                                placeholder="أضف علامة"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="btn-secondary"
                            >
                                إضافة
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.tags?.map((tag, index) => (
                                <span key={index} className="badge-info flex items-center">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="mr-1 hover:text-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">الكلمات المفتاحية</label>
                        <div className="flex space-x-2 space-x-reverse">
                            <input
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                                className="input-field flex-1"
                                placeholder="أضف كلمة مفتاحية"
                            />
                            <button
                                type="button"
                                onClick={addKeyword}
                                className="btn-secondary"
                            >
                                إضافة
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.keywords?.map((keyword, index) => (
                                <span key={index} className="badge-info flex items-center">
                                    {keyword}
                                    <button
                                        type="button"
                                        onClick={() => removeKeyword(keyword)}
                                        className="mr-1 hover:text-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            {/* Form Actions */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">
                        {(error as any)?.response?.data?.message || error?.message || 'حدث خطأ أثناء حفظ المنتج'}
                    </p>
                </div>
            )}
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
                    disabled={isLoading || !formData.name || !formData.categoryId}
                >
                    {isLoading ? (
                        <>
                            <div className="loading-spinner mr-2"></div>
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            {mode === 'add' ? 'إضافة المنتج' : 'تحديث المنتج'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
