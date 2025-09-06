'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Package,
    AlertTriangle,
    TrendingDown,
    RotateCcw,
    ArrowUpDown,
    Eye,
} from 'lucide-react';
import { useInventory, useLowStockItems, useInventoryStats, InventoryItem } from '@/hooks/useInventory';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import StockAdjustmentForm from '@/components/inventory/StockAdjustmentForm';

export default function InventoryPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const queryParams = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        branchId: branchFilter || undefined,
        isLowStock: stockFilter === 'low' ? true : undefined,
        isOutOfStock: stockFilter === 'out' ? true : undefined,
    };

    const { data: inventoryData, isLoading } = useInventory(queryParams);
    const { data: statsData } = useInventoryStats();
    const { data: lowStockData } = useLowStockItems(branchFilter, 5);

    const handleAdjustStock = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsAdjustModalOpen(true);
    };

    const getStockStatus = (item: InventoryItem) => {
        if (item.currentStock === 0) {
            return { text: 'نفدت الكمية', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-4 w-4" /> };
        } else if (item.currentStock <= item.minStockLevel) {
            return { text: 'مخزون منخفض', color: 'bg-yellow-100 text-yellow-800', icon: <TrendingDown className="h-4 w-4" /> };
        }
        return { text: 'متوفر', color: 'bg-green-100 text-green-800', icon: <Package className="h-4 w-4" /> };
    };

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">إدارة المخزون</h1>
                        <p className="text-gray-600 mt-2">
                            مراقبة وإدارة مخزون المنتجات في جميع الفروع
                        </p>
                    </div>
                    <button className="btn-primary flex items-center space-x-2 space-x-reverse">
                        <Plus className="h-5 w-5" />
                        <span>تعديل المخزون</span>
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
                                {statsData?.totalProducts || inventoryData?.pagination?.total || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <TrendingDown className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">مخزون منخفض</p>
                            <p className="text-xl font-bold text-gray-900">
                                {statsData?.lowStockCount || inventoryData?.data?.filter((item: InventoryItem) => item.currentStock <= item.minStockLevel).length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">نفدت الكمية</p>
                            <p className="text-xl font-bold text-gray-900">
                                {statsData?.outOfStockCount || inventoryData?.data?.filter((item: InventoryItem) => item.currentStock === 0).length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <RotateCcw className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-600">إجمالي قيمة المخزون</p>
                            <p className="text-xl font-bold text-gray-900">
                                ${statsData?.totalValue?.toLocaleString() || '0'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockData && lowStockData.length > 0 && (
                <div className="card mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        </div>
                        <div className="mr-3">
                            <h3 className="text-sm font-medium text-yellow-800">تنبيه: منتجات بمخزون منخفض</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>هناك {lowStockData.length} منتج بحاجة إلى إعادة تعبئة:</p>
                                <ul className="mt-1 list-disc list-inside">
                                    {lowStockData.slice(0, 3).map((item) => (
                                        <li key={item.id}>
                                            {item.product?.nameAr || item.product?.name} - متبقي {item.currentStock} قطعة
                                        </li>
                                    ))}
                                    {lowStockData.length > 3 && (
                                        <li>و {lowStockData.length - 3} منتج آخر...</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                placeholder="البحث في المخزون..."
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
                                    الفرع
                                </label>
                                <select
                                    value={branchFilter}
                                    onChange={(e) => setBranchFilter(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">جميع الفروع</option>
                                    <option value="main">الفرع الرئيسي</option>
                                    <option value="branch2">الفرع الثاني</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    حالة المخزون
                                </label>
                                <select
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">جميع الحالات</option>
                                    <option value="low">مخزون منخفض</option>
                                    <option value="out">نفدت الكمية</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Inventory Table */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">جرد المخزون</h3>
                    <div className="text-sm text-gray-500">
                        {inventoryData?.pagination?.total || 0} منتج
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
                                    <TableHead>الفرع</TableHead>
                                    <TableHead>الكمية الحالية</TableHead>
                                    <TableHead>الحد الأدنى</TableHead>
                                    <TableHead>الحد الأقصى</TableHead>
                                    <TableHead>قيمة الوحدة</TableHead>
                                    <TableHead>إجمالي القيمة</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventoryData?.data?.map((item: InventoryItem) => {
                                    const status = getStockStatus(item);
                                    const totalValue = item.currentStock * item.unitCost;

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-lg object-cover"
                                                            src={item.product?.mainImage || '/logo.jpg'}
                                                            alt={item.product?.name}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = '/logo.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mr-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.product?.nameAr || item.product?.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {item.product?.sku}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-900">
                                                    {item.branch?.nameAr || item.branch?.name}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {item.currentStock} {item.unit}
                                                    </div>
                                                    {item.reservedStock && item.reservedStock > 0 && (
                                                        <div className="text-gray-500">
                                                            محجوز: {item.reservedStock}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-900">
                                                    {item.minStockLevel}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-900">
                                                    {item.maxStockLevel || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-900">
                                                    ${item.unitCost.toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium text-gray-900">
                                                    ${totalValue.toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    {status.icon}
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                        {status.text}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    <button
                                                        onClick={() => handleAdjustStock(item)}
                                                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                        title="تعديل المخزون"
                                                    >
                                                        <ArrowUpDown className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {inventoryData && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={inventoryData.pagination?.pages || 1}
                                totalItems={inventoryData.pagination?.total}
                                itemsPerPage={10}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Stock Adjustment Modal */}
            <Modal
                isOpen={isAdjustModalOpen}
                onClose={() => {
                    setIsAdjustModalOpen(false);
                    setSelectedItem(null);
                }}
                title="تعديل المخزون"
                size="lg"
            >
                {selectedItem && (
                    <StockAdjustmentForm
                        inventoryItem={selectedItem}
                        onSuccess={() => {
                            setIsAdjustModalOpen(false);
                            setSelectedItem(null);
                        }}
                        onCancel={() => {
                            setIsAdjustModalOpen(false);
                            setSelectedItem(null);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
}
