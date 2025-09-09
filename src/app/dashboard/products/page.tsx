'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Package,
    AlertTriangle,
    Star,
    ShoppingCart
} from 'lucide-react';
import { useProducts, useDeleteProduct, Product } from '@/hooks/useProducts';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { formatPrice, getImageUrl } from '@/utils/hepler';
import { useCategories } from '@/hooks/useCategories';
import { useSubCategories } from '@/hooks/useSubCategories';
import { useBranches } from '@/hooks/useBranches';
import { Category, SubCategory } from '@/types';

export default function ProductsPage() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { data: categories } = useCategories();
    const { data: subCategories } = useSubCategories();
    const { data: branches } = useBranches();
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const queryParams = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        categoryId: selectedCategory || undefined,
        subCategoryId: selectedSubCategory || undefined,
        branchId: selectedBranch || undefined,
        status: selectedStatus || undefined,
    };

    const { data: productsData, isLoading, error } = useProducts(queryParams);
    const deleteProductMutation = useDeleteProduct();

    const handleEdit = (product: Product) => {
        router.push(`/dashboard/products/${product.id}/edit`);
    };

    const handleDelete = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedProduct) {
            deleteProductMutation.mutate(selectedProduct.id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedProduct(null);
                },
            });
        }
    };

    const getStockStatus = (product: Product) => {
        // Check if any branch has stock
        const hasStock = product.branchPricing?.some(bp => bp.stockQuantity > 0) || false;
        if (!hasStock) {
            return { text: 'نفدت الكمية', color: 'bg-red-100 text-red-800' };
        }
        return { text: 'متوفر', color: 'bg-green-100 text-green-800' };
    };

    const getTotalStock = (product: Product) => {
        return product.branchPricing?.reduce((total, bp) => total + bp.stockQuantity, 0) || 0;
    };

    const getMinPrice = (product: Product) => {
        if (!product.branchPricing || product.branchPricing.length === 0) return 0;
        return Math.min(...product.branchPricing.map(bp => bp.price));
    };

    const getMaxPrice = (product: Product) => {
        if (!product.branchPricing || product.branchPricing.length === 0) return 0;
        return Math.max(...product.branchPricing.map(bp => bp.price));
    };

    const hasSalePrice = (product: Product) => {
        return product.branchPricing?.some(bp => bp.isOnSale && bp.salePrice) || false;
    };

    if (error) {
        return (
            <div className="animate-fade-in">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <div className="mr-3">
                            <h3 className="text-sm font-medium text-red-800">خطأ في تحميل البيانات</h3>
                            <p className="text-sm text-red-700 mt-1">
                                {error.message || 'حدث خطأ أثناء تحميل المنتجات'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">إدارة المنتجات</h1>
                        <p className="text-gray-600 mt-2">
                            إدارة وتنظيم جميع المنتجات في المتجر
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/products/add')}
                        className="btn-primary flex items-center space-x-2 space-x-reverse"
                    >
                        <Plus className="h-5 w-5" />
                        <span>إضافة منتج جديد</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">إجمالي المنتجات</p>
                            <p className="text-xl font-bold text-gray-900">
                                {productsData?.pagination?.total || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">المنتجات النشطة</p>
                            <p className="text-xl font-bold text-gray-900">
                                {productsData?.data?.filter(p => p.isActive).length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">المنتجات المخفضة علي السعر</p>
                            <p className="text-xl font-bold text-gray-900">
                                {productsData?.data?.filter(p => hasSalePrice(p)).length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Star className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">المنتجات المميزة</p>
                            <p className="text-xl font-bold text-gray-900">
                                {productsData?.data?.filter(p => p.isFeatured).length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="البحث في المنتجات..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pr-10"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-secondary flex items-center space-x-2 space-x-reverse"
                    >
                        <Filter className="h-5 w-5" />
                        <span>فلاتر</span>
                    </button>
                    <button
                        onClick={() => {
                            setSelectedCategory('');
                            setSelectedSubCategory('');
                            setSelectedBranch('');
                            setSelectedStatus('');
                        }}
                    >
                        إعادة تعيين
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الفئة
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">جميع الفئات</option>
                                    {categories?.data.map((category: Category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* الفئة الفرعية */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الفئة الفرعية
                                </label>
                                <select
                                    value={selectedSubCategory}
                                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">جميع الفئات الفرعية</option>
                                    {subCategories?.filter(subCategory => subCategory.categoryId === selectedCategory).map((subCategory: SubCategory) => (
                                        <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* الفرع */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الفرع
                                </label>
                                <select
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">جميع الفروع</option>
                                    {branches?.data.map((branch) => (
                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                    ))}

                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Products Table */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">قائمة المنتجات</h3>
                    <div className="text-sm text-gray-500">
                        {productsData?.pagination?.total || 0} منتج
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="mr-3 text-gray-600">جاري التحميل...</span>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>المنتج</TableHead>
                                    <TableHead>الفئة</TableHead>
                                    <TableHead>الفروع</TableHead>
                                    <TableHead>السعر</TableHead>
                                    <TableHead>المخزون</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productsData?.data?.map((product) => {
                                    const stockStatus = getStockStatus(product);
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <img
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                            src={getImageUrl(product.mainImage)}
                                                            alt={product.name}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = '/logo.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mr-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {product.brand}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-900">
                                                    {product.category?.name || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {product.branches && product.branches.length > 0 ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                                            {product.branches.length} فرع
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {product.branchPricing && product.branchPricing.length > 0 ? (
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {getMinPrice(product) === getMaxPrice(product)
                                                                    ? formatPrice(getMinPrice(product), product.branchPricing[0].currency)
                                                                    : `${formatPrice(getMinPrice(product), product.branchPricing[0].currency)} - ${formatPrice(getMaxPrice(product), product.branchPricing[0].currency)}`
                                                                }
                                                            </div>
                                                            {hasSalePrice(product) && (
                                                                <div className="text-green-600 text-xs">
                                                                    في التخفيضات
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {getTotalStock(product)}
                                                    </div>
                                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                                        {stockStatus.text}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {product.isActive ? 'نشط' : 'غير نشط'}
                                                    </span>
                                                    {product.isFeatured && (
                                                        <Star className="h-4 w-4 text-yellow-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    <button
                                                        onClick={() => router.push(`/dashboard/products/${product.id}`)}
                                                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                                        title="تعديل"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product)}
                                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {productsData && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={productsData.pagination?.pages || 1}
                                totalItems={productsData.pagination?.total}
                                itemsPerPage={10}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </div>



            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedProduct(null);
                }}
                title="تأكيد الحذف"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        هل أنت متأكد من حذف المنتج &quot;{selectedProduct?.name}&quot;؟
                        لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="flex justify-end space-x-3 space-x-reverse">
                        <button
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setSelectedProduct(null);
                            }}
                            className="btn-secondary"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={deleteProductMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deleteProductMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
