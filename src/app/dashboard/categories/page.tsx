'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    FolderOpen,
    Star,
    ToggleRight,
    Tag,
    List
} from 'lucide-react';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { useCreateSubCategory, useUpdateSubCategory, useDeleteSubCategory, useSubCategories, useCreateSubCategoryWithImage, useUpdateSubCategoryWithImage } from '@/hooks/useSubCategories';
import { useCreateSubSubCategory, useUpdateSubSubCategory, useDeleteSubSubCategory, useSubSubCategories, useCreateSubSubCategoryWithImage, useUpdateSubSubCategoryWithImage } from '@/hooks/useSubSubCategories';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import CategoryForm from '@/components/categories/CategoryForm';
import SubCategoryForm from '@/components/categories/SubCategoryForm';
import SubSubCategoryForm from '@/components/categories/SubSubCategoryForm';
import { Category, SubCategory, SubSubCategory, SubCategoryType } from '@/types';
import { getImageUrl, formatDate } from '@/utils/hepler';

export default function CategoriesPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Sub-category states
    const [selectedCategoryForSubs, setSelectedCategoryForSubs] = useState<Category | null>(null);
    const [isCreateSubModalOpen, setIsCreateSubModalOpen] = useState(false);
    const [isEditSubModalOpen, setIsEditSubModalOpen] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
    const [isDeleteSubModalOpen, setIsDeleteSubModalOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    
    // Sub-sub-category states
    const [selectedSubCategoryForSubSubs, setSelectedSubCategoryForSubSubs] = useState<SubCategory | null>(null);
    const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());
    const [isCreateSubSubModalOpen, setIsCreateSubSubModalOpen] = useState(false);
    const [isEditSubSubModalOpen, setIsEditSubSubModalOpen] = useState(false);
    const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<SubSubCategory | null>(null);
    const [isDeleteSubSubModalOpen, setIsDeleteSubSubModalOpen] = useState(false);

    const queryParams = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    };

    const { data: categoriesData, isLoading } = useCategories(queryParams);
    const deleteCategoryMutation = useDeleteCategory();

    // Sub-category hooks
    const { data: subCategoriesData } = useSubCategories();
    const createSubCategoryMutation = useCreateSubCategory();
    const updateSubCategoryMutation = useUpdateSubCategory();
    const createSubCategoryWithImageMutation = useCreateSubCategoryWithImage();
    const updateSubCategoryWithImageMutation = useUpdateSubCategoryWithImage();
    const deleteSubCategoryMutation = useDeleteSubCategory();

    // Sub-sub-category hooks
    const { data: subSubCategoriesData } = useSubSubCategories();
    const createSubSubCategoryMutation = useCreateSubSubCategory();
    const updateSubSubCategoryMutation = useUpdateSubSubCategory();
    const createSubSubCategoryWithImageMutation = useCreateSubSubCategoryWithImage();
    const updateSubSubCategoryWithImageMutation = useUpdateSubSubCategoryWithImage();
    const deleteSubSubCategoryMutation = useDeleteSubSubCategory();

    // Toggle sub-categories visibility
    const toggleSubCategories = (category: Category) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category.id)) {
            newExpanded.delete(category.id);
            if (selectedCategoryForSubs?.id === category.id) {
                setSelectedCategoryForSubs(null);
            }
        } else {
            newExpanded.add(category.id);
            setSelectedCategoryForSubs(category);
        }
        setExpandedCategories(newExpanded);
    };
    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsEditModalOpen(true);
    };

    const handleDelete = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedCategory) {
            deleteCategoryMutation.mutate(selectedCategory.id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedCategory(null);
                },
            });
        }
    };


    const handleCreateSubCategory = async (data: Record<string, unknown>, imageFile?: File) => {
        try {
            if (imageFile) {
                await createSubCategoryWithImageMutation.mutateAsync({ data, imageFile });
            } else {
                await createSubCategoryMutation.mutateAsync(data);
            }
            setIsCreateSubModalOpen(false);
            // Keep the category expanded to show the new sub-category
            if (selectedCategoryForSubs) {
                setExpandedCategories(prev => new Set(prev).add(selectedCategoryForSubs.id));
            }
        } catch (error) {
            console.error('Error creating sub-category:', error);
        }
    };

    const handleEditSubCategory = (subCategory: SubCategory) => {
        setSelectedSubCategory(subCategory);
        setIsEditSubModalOpen(true);
    };

    const handleUpdateSubCategory = async (data: Record<string, unknown>, imageFile?: File) => {
        if (!selectedSubCategory) return;
        try {
            if (imageFile) {
                await updateSubCategoryWithImageMutation.mutateAsync({
                    id: selectedSubCategory.id,
                    data: { ...data, id: selectedSubCategory.id },
                    imageFile
                });
            } else {
                await updateSubCategoryMutation.mutateAsync({ ...data, id: selectedSubCategory.id });
            }
            setIsEditSubModalOpen(false);
            setSelectedSubCategory(null);
        } catch (error) {
            console.error('Error updating sub-category:', error);
        }
    };

    const handleDeleteSubCategory = (subCategory: SubCategory) => {
        setSelectedSubCategory(subCategory);
        setIsDeleteSubModalOpen(true);
    };

    const confirmDeleteSubCategory = () => {
        if (selectedSubCategory) {
            deleteSubCategoryMutation.mutate(selectedSubCategory.id, {
                onSuccess: () => {
                    setIsDeleteSubModalOpen(false);
                    setSelectedSubCategory(null);
                },
            });
        }
    };

    // Sub-sub-category handlers
    const toggleSubSubCategories = (subCategory: SubCategory) => {
        const newExpanded = new Set(expandedSubCategories);
        if (newExpanded.has(subCategory.id)) {
            newExpanded.delete(subCategory.id);
            if (selectedSubCategoryForSubSubs?.id === subCategory.id) {
                setSelectedSubCategoryForSubSubs(null);
            }
        } else {
            newExpanded.add(subCategory.id);
            setSelectedSubCategoryForSubSubs(subCategory);
        }
        setExpandedSubCategories(newExpanded);
    };

    const handleCreateSubSubCategory = async (data: Record<string, unknown>, imageFile?: File) => {
        try {
            if (imageFile) {
                await createSubSubCategoryWithImageMutation.mutateAsync({ data, imageFile });
            } else {
                await createSubSubCategoryMutation.mutateAsync(data as any);
            }
            setIsCreateSubSubModalOpen(false);
            if (selectedSubCategoryForSubSubs) {
                setExpandedSubCategories(prev => new Set(prev).add(selectedSubCategoryForSubSubs.id));
            }
        } catch (error) {
            console.error('Error creating sub-sub-category:', error);
        }
    };

    const handleEditSubSubCategory = (subSubCategory: SubSubCategory) => {
        setSelectedSubSubCategory(subSubCategory);
        setIsEditSubSubModalOpen(true);
    };

    const handleUpdateSubSubCategory = async (data: Record<string, unknown>, imageFile?: File) => {
        if (!selectedSubSubCategory) return;
        try {
            if (imageFile) {
                await updateSubSubCategoryWithImageMutation.mutateAsync({
                    id: selectedSubSubCategory.id,
                    data: { ...data, id: selectedSubSubCategory.id },
                    imageFile
                });
            } else {
                await updateSubSubCategoryMutation.mutateAsync({ ...data, id: selectedSubSubCategory.id } as any);
            }
            setIsEditSubSubModalOpen(false);
            setSelectedSubSubCategory(null);
        } catch (error) {
            console.error('Error updating sub-sub-category:', error);
        }
    };

    const handleDeleteSubSubCategory = (subSubCategory: SubSubCategory) => {
        setSelectedSubSubCategory(subSubCategory);
        setIsDeleteSubSubModalOpen(true);
    };

    const confirmDeleteSubSubCategory = () => {
        if (selectedSubSubCategory) {
            deleteSubSubCategoryMutation.mutate(selectedSubSubCategory.id, {
                onSuccess: () => {
                    setIsDeleteSubSubModalOpen(false);
                    setSelectedSubSubCategory(null);
                },
            });
        }
    };

    const renderCategoryRow = (category: Category, level = 0) => {
        const rows = [];
        const isMainCategory = level === 0;

        // Main category row
        rows.push(
            <TableRow key={category.id} className={isMainCategory ? 'bg-gray-50' : ''}>
                <TableCell>
                    <div className="flex items-center" style={{ paddingRight: `${level * 20}px` }}>
                        {level > 0 && (
                            <div className="w-4 h-4 border-r border-b border-gray-300 mr-2"></div>
                        )}
                        <div className="flex items-center">

                            <div className="flex-shrink-0 h-8 w-8">
                                <img
                                    className="h-8 w-8 rounded-lg object-cover"
                                    src={getImageUrl(category.image)}
                                    alt={category.name}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/logo.jpg';
                                    }}
                                />
                            </div>
                            <div className="mr-3">
                                <div className={`text-sm ${isMainCategory ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                                    {category.name}
                                    {!isMainCategory && (
                                        <span className="text-xs text-gray-500 mr-2">(فئة فرعية)</span>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </TableCell>

                <TableCell>
                    {isMainCategory && (
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <span className="text-sm text-gray-900">
                                {subCategoriesData?.filter(s => s.categoryId == category.id).length || 0}
                            </span>
                            <button
                                onClick={() => {
                                    setSelectedCategoryForSubs(category);
                                    setIsCreateSubModalOpen(true);
                                }}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                title="إضافة فئة فرعية"
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                    {!isMainCategory && (
                        <span className="text-sm text-gray-500">-</span>
                    )}
                </TableCell>
                <TableCell>
                    <span className="text-sm text-gray-900">
                        {category.sortOrder || 0}
                    </span>
                </TableCell>
                <TableCell>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {category.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                        {category.isFeatured && (
                            <Star className="h-4 w-4 text-yellow-500" />
                        )}
                    </div>
                </TableCell>
                <TableCell>
                    <span className="text-sm text-gray-500">
                        {formatDate(new Date(category.createdAt))}
                    </span>
                </TableCell>
                <TableCell>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        {isMainCategory && (
                            <button
                                onClick={() => toggleSubCategories(category)}
                                className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                                title={expandedCategories.has(category.id) ? 'إخفاء الفئات الفرعية' : 'عرض الفئات الفرعية'}
                            >
                                {expandedCategories.has(category.id) ? (
                                    <Eye className="h-4 w-4" />
                                ) : (
                                    <List className="h-4 w-4" />
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => handleEdit(category)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="تعديل"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(category)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="حذف"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </TableCell>
            </TableRow>
        );

        // Add sub-categories inline if expanded and it's a main category
        if (isMainCategory && expandedCategories.has(category.id) && subCategoriesData && selectedCategoryForSubs?.id === category.id) {
            subCategoriesData.filter(s => s.categoryId == category.id).forEach(subCategory => {
                rows.push(
                    <TableRow key={`sub-${subCategory.id}`} className="bg-purple-25">
                        <TableCell>
                            <div className="flex items-center" style={{ paddingRight: '40px' }}>
                                <div className="w-4 h-4 border-r border-b border-purple-300 mr-2"></div>
                                {subCategory.image && subCategory.image !== '' ? (
                                    <img
                                        src={getImageUrl(subCategory.image)}
                                        alt={subCategory.name}
                                        className="h-7 w-7 object-cover rounded-full mr-2 border border-purple-200"
                                        style={{ minWidth: '28px', minHeight: '28px' }}
                                    />
                                ) : (
                                    <Tag className="h-4 w-4 text-purple-600 mr-2" />
                                )}
                                <div className="mr-3">
                                    <div className="text-sm font-medium text-gray-900">
                                        {subCategory.name}
                                        <span className="text-xs text-purple-600 mr-2">(فئة فرعية)</span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center space-x-2 space-x-reverse">
                                        <span>{subCategory.name}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${subCategory.type === SubCategoryType.FREE_ATTR
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {subCategory.type === SubCategoryType.FREE_ATTR ? 'خصائص حرة' : 'خصائص مخصصة'}
                                        </span>
                                        {subCategory.type === SubCategoryType.CUSTOM_ATTR && subCategory.customFields && (
                                            <span className="text-xs text-gray-400">
                                                ({subCategory.customFields.length} خاصية)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TableCell>

                        <TableCell>
                            <span className="text-sm text-gray-500">-</span>
                        </TableCell>
                        <TableCell>
                            <span className="text-sm text-gray-500">-</span>
                        </TableCell>
                        <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subCategory.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {subCategory.isActive ? 'نشط' : 'غير نشط'}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="text-sm text-gray-500">
                                {formatDate(new Date(subCategory.createdAt))}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <button
                                    onClick={() => toggleSubSubCategories(subCategory)}
                                    className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded"
                                    title={expandedSubCategories.has(subCategory.id) ? 'إخفاء الفئات الفرعية' : 'عرض الفئات الفرعية'}
                                >
                                    {expandedSubCategories.has(subCategory.id) ? (
                                        <Eye className="h-4 w-4" />
                                    ) : (
                                        <List className="h-4 w-4" />
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedSubCategoryForSubSubs(subCategory);
                                        setIsCreateSubSubModalOpen(true);
                                    }}
                                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                    title="إضافة فئة فرعية"
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                                <button
                                    onClick={() => handleEditSubCategory(subCategory)}
                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                    title="تعديل"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteSubCategory(subCategory)}
                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                    title="حذف"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </TableCell>
                    </TableRow>
                );

                // Add sub-sub-categories if expanded
                if (expandedSubCategories.has(subCategory.id) && subSubCategoriesData && selectedSubCategoryForSubSubs?.id === subCategory.id) {
                    subSubCategoriesData.filter(ss => ss.subCategoryId == subCategory.id).forEach(subSubCategory => {
                        rows.push(
                            <TableRow key={`sub-sub-${subSubCategory.id}`} className="bg-orange-25">
                                <TableCell>
                                    <div className="flex items-center" style={{ paddingRight: '60px' }}>
                                        <div className="w-4 h-4 border-r border-b border-orange-300 mr-2"></div>
                                        {subSubCategory.image && subSubCategory.image !== '' ? (
                                            <img
                                                src={getImageUrl(subSubCategory.image)}
                                                alt={subSubCategory.name}
                                                className="h-6 w-6 object-cover rounded-full mr-2 border border-orange-200"
                                                style={{ minWidth: '24px', minHeight: '24px' }}
                                            />
                                        ) : (
                                            <Tag className="h-3 w-3 text-orange-600 mr-2" />
                                        )}
                                        <div className="mr-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {subSubCategory.name}
                                                <span className="text-xs text-orange-600 mr-2">(فئة فرعية فرعية)</span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-500">-</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-500">-</span>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subSubCategory.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {subSubCategory.isActive ? 'نشط' : 'غير نشط'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(new Date(subSubCategory.createdAt))}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <button
                                            onClick={() => handleEditSubSubCategory(subSubCategory)}
                                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                            title="تعديل"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSubSubCategory(subSubCategory)}
                                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                            title="حذف"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    });
                }
            });
        }

        // Add child categories (for hierarchical categories)
        if (category.subCategories && category.subCategories.length > 0) {
            category.subCategories.forEach(child => {
                rows.push(...renderCategoryRow(child as unknown as Category, level + 1));
            });
        }

        return rows;
    };

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">إدارة الفئات</h1>
                        <p className="text-gray-600 mt-2">
                            إدارة وتنظيم فئات المنتجات بشكل هرمي
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary flex items-center space-x-2 space-x-reverse"
                    >
                        <Plus className="h-5 w-5" />
                        <span>إضافة فئة جديدة</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FolderOpen className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">إجمالي الفئات</p>
                            <p className="text-xl font-bold text-gray-900">
                                {categoriesData?.pagination?.total || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <ToggleRight className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">الفئات النشطة</p>
                            <p className="text-xl font-bold text-gray-900">
                                {categoriesData?.data?.filter(c => c.isActive).length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Star className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">الفئات المميزة</p>
                            <p className="text-xl font-bold text-gray-900">
                                {categoriesData?.data?.filter(c => c.isFeatured).length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FolderOpen className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">الفئات الرئيسية</p>
                            <p className="text-xl font-bold text-gray-900">
                                {categoriesData?.data?.filter(c => !c.subCategories).length || 0}
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
                                placeholder="البحث في الفئات..."
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
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الحالة
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">جميع الحالات</option>
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Categories Table */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">قائمة الفئات</h3>
                    <div className="text-sm text-gray-500">
                        {categoriesData?.pagination?.total || 0} فئة
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
                                    <TableHead>الفئة</TableHead>
                                    <TableHead>الفئات الفرعية</TableHead>
                                    <TableHead>ترتيب العرض</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead>تاريخ الإنشاء</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categoriesData?.data?.map((category) =>
                                    renderCategoryRow(category)
                                ).flat()}
                            </TableBody>
                        </Table>

                        {categoriesData && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={categoriesData.pagination?.pages || 1}
                                totalItems={categoriesData.pagination?.total}
                                itemsPerPage={10}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Create Category Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="إضافة فئة جديدة"
                size="lg"
            >
                <CategoryForm
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                    }}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>

            {/* Edit Category Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCategory(null);
                }}
                title="تعديل الفئة"
                size="lg"
            >
                {selectedCategory && (
                    <CategoryForm
                        category={selectedCategory}
                        onSuccess={() => {
                            setIsEditModalOpen(false);
                            setSelectedCategory(null);
                        }}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setSelectedCategory(null);
                        }}
                    />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedCategory(null);
                }}
                title="تأكيد الحذف"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        هل أنت متأكد من حذف الفئة &quot;{selectedCategory?.name}&quot;؟
                    </p>
                    {selectedCategory?.subCategories && selectedCategory.subCategories.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 text-sm">
                                تحذير: هذه الفئة تحتوي على {selectedCategory.subCategories.length} فئة فرعية.
                                سيتم حذف جميع الفئات الفرعية أيضاً.
                            </p>
                        </div>
                    )}
                    <p className="text-gray-600 text-sm">
                        لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="flex justify-end space-x-3 space-x-reverse">
                        <button
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setSelectedCategory(null);
                            }}
                            className="btn-secondary"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={deleteCategoryMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deleteCategoryMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                        </button>
                    </div>
                </div>
            </Modal>



            {/* Create Sub-Category Modal */}
            {isCreateSubModalOpen && selectedCategoryForSubs && (
                <SubCategoryForm
                    categoryId={selectedCategoryForSubs.id}
                    onSubmit={handleCreateSubCategory}
                    onCancel={() => setIsCreateSubModalOpen(false)}
                    isLoading={createSubCategoryMutation.isPending || createSubCategoryWithImageMutation.isPending}
                    error={createSubCategoryMutation.error || createSubCategoryWithImageMutation.error}
                />
            )}

            {/* Edit Sub-Category Modal */}
            {isEditSubModalOpen && selectedSubCategory && selectedCategoryForSubs && (
                <SubCategoryForm
                    subCategory={selectedSubCategory}
                    categoryId={selectedCategoryForSubs.id}
                    onSubmit={handleUpdateSubCategory}
                    onCancel={() => {
                        setIsEditSubModalOpen(false);
                        setSelectedSubCategory(null);
                    }}
                    isLoading={updateSubCategoryMutation.isPending || updateSubCategoryWithImageMutation.isPending}
                    error={updateSubCategoryMutation.error || updateSubCategoryWithImageMutation.error}
                />
            )}

            {/* Delete Sub-Category Confirmation Modal */}
            <Modal
                isOpen={isDeleteSubModalOpen}
                onClose={() => {
                    setIsDeleteSubModalOpen(false);
                    setSelectedSubCategory(null);
                }}
                title="تأكيد حذف الفئة الفرعية"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        هل أنت متأكد من حذف الفئة الفرعية &quot;{selectedSubCategory?.name}&quot;؟
                    </p>
                    <p className="text-gray-600 text-sm">
                        لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="flex justify-end space-x-3 space-x-reverse">
                        <button
                            onClick={() => {
                                setIsDeleteSubModalOpen(false);
                                setSelectedSubCategory(null);
                            }}
                            className="btn-secondary"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={confirmDeleteSubCategory}
                            disabled={deleteSubCategoryMutation.isPending}
                            className="btn-danger"
                        >
                            {deleteSubCategoryMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Create Sub-Sub-Category Modal */}
            {isCreateSubSubModalOpen && selectedSubCategoryForSubSubs && (
                <Modal
                    isOpen={isCreateSubSubModalOpen}
                    onClose={() => setIsCreateSubSubModalOpen(false)}
                    title="إضافة فئة فرعية فرعية"
                    size="lg"
                >
                    <SubSubCategoryForm
                        subCategoryId={selectedSubCategoryForSubSubs.id}
                        onSubmit={handleCreateSubSubCategory}
                        onCancel={() => setIsCreateSubSubModalOpen(false)}
                        isLoading={createSubSubCategoryMutation.isPending || createSubSubCategoryWithImageMutation.isPending}
                        error={createSubSubCategoryMutation.error || createSubSubCategoryWithImageMutation.error}
                    />
                </Modal>
            )}

            {/* Edit Sub-Sub-Category Modal */}
            {isEditSubSubModalOpen && selectedSubSubCategory && selectedSubCategoryForSubSubs && (
                <Modal
                    isOpen={isEditSubSubModalOpen}
                    onClose={() => {
                        setIsEditSubSubModalOpen(false);
                        setSelectedSubSubCategory(null);
                    }}
                    title="تعديل الفئة الفرعية الفرعية"
                    size="lg"
                >
                    <SubSubCategoryForm
                        subSubCategory={selectedSubSubCategory}
                        subCategoryId={selectedSubCategoryForSubSubs.id}
                        onSubmit={handleUpdateSubSubCategory}
                        onCancel={() => {
                            setIsEditSubSubModalOpen(false);
                            setSelectedSubSubCategory(null);
                        }}
                        isLoading={updateSubSubCategoryMutation.isPending || updateSubSubCategoryWithImageMutation.isPending}
                        error={updateSubSubCategoryMutation.error || updateSubSubCategoryWithImageMutation.error}
                    />
                </Modal>
            )}

            {/* Delete Sub-Sub-Category Confirmation Modal */}
            <Modal
                isOpen={isDeleteSubSubModalOpen}
                onClose={() => {
                    setIsDeleteSubSubModalOpen(false);
                    setSelectedSubSubCategory(null);
                }}
                title="تأكيد حذف الفئة الفرعية الفرعية"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        هل أنت متأكد من حذف الفئة الفرعية الفرعية &quot;{selectedSubSubCategory?.name}&quot;؟
                    </p>
                    <p className="text-gray-600 text-sm">
                        لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="flex justify-end space-x-3 space-x-reverse">
                        <button
                            onClick={() => {
                                setIsDeleteSubSubModalOpen(false);
                                setSelectedSubSubCategory(null);
                            }}
                            className="btn-secondary"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={confirmDeleteSubSubCategory}
                            disabled={deleteSubSubCategoryMutation.isPending}
                            className="btn-danger"
                        >
                            {deleteSubSubCategoryMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
