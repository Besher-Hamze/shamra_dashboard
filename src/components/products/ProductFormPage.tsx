'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Package, DollarSign, Tag, Settings, Image, Save } from 'lucide-react';
import { useCreateProduct, useUpdateProduct, Product, CreateProductData } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useSubCategoriesByCategory } from '@/hooks/useSubCategories';
import { useBranches } from '@/hooks/useBranches';
import { Branch, Category, SubCategory, ProductStatus } from '@/types';

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
        price: 0,
        costPrice: 0,
        salePrice: 0,
        currency: 'SAR',
        stockQuantity: 0,
        minStockLevel: 0,
        categoryId: '',
        subCategoryId: '',
        branches: [] as string[],
        brand: '',
        status: ProductStatus.ACTIVE,
        isActive: true,
        isFeatured: false,
        isOnSale: false,
        tags: [] as string[],
        images: [] as string[],
        mainImage: '',
        keywords: [] as string[],
        sortOrder: 0,
    });

    const [tagInput, setTagInput] = useState('');
    const [keywordInput, setKeywordInput] = useState('');

    const { data: categoriesData } = useCategories();
    const { data: subCategoriesData } = useSubCategoriesByCategory(formData.categoryId);
    const { data: branchesData } = useBranches({});
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                barcode: product.barcode || '',
                price: product.price || 0,
                costPrice: product.costPrice || 0,
                salePrice: product.salePrice || 0,
                currency: product.currency || 'SAR',
                stockQuantity: product.stockQuantity || 0,
                minStockLevel: product.minStockLevel || 0,
                categoryId: product.categoryId || '',
                subCategoryId: (product as any).subCategoryId || '',
                branches: product.branches?.map((b: any) => typeof b === 'string' ? b : b.id) || [],
                brand: product.brand || '',

                status: product.status || ProductStatus.ACTIVE,
                isActive: product.isActive ?? true,
                isFeatured: product.isFeatured ?? false,
                isOnSale: product.isOnSale ?? false,
                tags: product.tags || [],
                images: product.images || [],
                mainImage: product.mainImage || '',
                keywords: product.keywords || [],
                sortOrder: product.sortOrder || 0,
            });
        }
    }, [product]);


    const handleInputChange = (field: string, value: any) => {
        if (field === 'categoryId') {
            setFormData(prev => ({
                ...prev,
                [field]: value,
                subCategoryId: '', // This correctly resets sub-category when category changes
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

    const handleBranchChange = (branchId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            branches: checked
                ? [...prev.branches, branchId]
                : prev.branches.filter(id => id !== branchId)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const productData: CreateProductData = {
            name: formData.name,
            description: formData.description || undefined,
            barcode: formData.barcode || undefined,
            price: formData.price || 0,
            costPrice: formData.costPrice ? formData.costPrice : undefined,
            salePrice: formData.salePrice ? formData.salePrice : undefined,
            currency: formData.currency,
            stockQuantity: formData.stockQuantity || 0,
            minStockLevel: formData.minStockLevel ? formData.minStockLevel : undefined,
            categoryId: formData.categoryId,
            subCategoryId: formData.subCategoryId || undefined,
            branches: formData.branches,
            images: formData.images,
            mainImage: formData.mainImage || undefined,
            brand: formData.brand || undefined,

            status: formData.status as ProductStatus,
            isActive: formData.isActive,
            isFeatured: formData.isFeatured,
            isOnSale: formData.isOnSale,
            tags: formData.tags,
            keywords: formData.keywords,
            sortOrder: formData.sortOrder ? formData.sortOrder : undefined,
        };

        if (product) {
            updateProductMutation.mutate({ ...productData, id: product.id, data: productData }, {
                onSuccess: () => onSuccess(),
            });
        } else {
            createProductMutation.mutate(productData, {
                onSuccess: () => onSuccess(),
            });
        }
    };

    const isLoading = createProductMutation.isPending || updateProductMutation.isPending;
    const error = createProductMutation.error || updateProductMutation.error;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">
                        {(error as any)?.response?.data?.message || error?.message || 'حدث خطأ أثناء حفظ المنتج'}
                    </p>
                </div>
            )}

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
                        <label className="form-label">اسم المنتج (بالإنجليزية) *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="input-field"
                            required
                            placeholder="Product Name in English"
                        />
                    </div>



                    <div className="form-group">
                        <label className="form-label">الباركود</label>
                        <input
                            type="text"
                            value={formData.barcode}
                            onChange={(e) => handleInputChange('barcode', e.target.value)}
                            className="input-field"
                            placeholder="1234567890123"
                        />
                    </div>

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
                        <label className="form-label">الوصف (بالإنجليزية)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="textarea-field"
                            rows={4}
                            placeholder="Product description in English..."
                        />
                    </div>
                </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 space-x-reverse pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">التسعير والمخزون</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="form-group">
                        <label className="form-label">السعر الأساسي *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className="input-field"
                            required
                            placeholder="0.00"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">سعر التكلفة</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.costPrice}
                            onChange={(e) => handleInputChange('costPrice', e.target.value)}
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
                            value={formData.salePrice}
                            onChange={(e) => handleInputChange('salePrice', e.target.value)}
                            className="input-field"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">العملة</label>
                        <select
                            value={formData.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="select-field"
                        >
                            <option value="SAR">ريال سعودي (SAR)</option>
                            <option value="USD">دولار أمريكي (USD)</option>
                            <option value="EUR">يورو (EUR)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">الكمية المتاحة *</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.stockQuantity}
                            onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                            className="input-field"
                            required
                            placeholder="0"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">الحد الأدنى للمخزون</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.minStockLevel}
                            onChange={(e) => handleInputChange('minStockLevel', e.target.value)}
                            className="input-field"
                            placeholder="0"
                        />
                    </div>



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
                                    checked={formData.branches.includes(branch.id)}
                                    onChange={(e) => handleBranchChange(branch.id, e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`branch-${branch.id}`} className="mr-2 text-sm text-gray-700">
                                    {branch.nameAr || branch.name}
                                </label>
                            </div>
                        ))}
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

            {/* Product Settings */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 space-x-reverse pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Settings className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">إعدادات المنتج</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isOnSale"
                            checked={formData.isOnSale}
                            onChange={(e) => handleInputChange('isOnSale', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isOnSale" className="mr-2 text-sm text-gray-700">
                            في التخفيضات
                        </label>
                    </div>
                </div>
            </div>

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
                    disabled={isLoading || !formData.name || !formData.price}
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
