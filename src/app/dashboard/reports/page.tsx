'use client';

import { useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    ShoppingCart,
    Package,
    DollarSign,
    Calendar,
    Download,
    Filter,
    RefreshCw,
    Building2,
    Target
} from 'lucide-react';
import {
    useDashboardStats,
    useSalesData,
    useTopSellingProducts,
    useCustomerReport,
    useInventoryReport,
    useBranchPerformanceReport,
    useProductPerformanceReport,
    useFinancialReport,
    useExportSalesReport
} from '@/hooks/useDashboard';
import { useProductStats } from '@/hooks/useProducts';
import { useCustomerStats } from '@/hooks/useCustomers';
import { useOrderStats } from '@/hooks/useOrders';
import { useInventoryStats } from '@/hooks/useInventory';
import { useBranches } from '@/hooks/useBranches';
import { SimpleBarChart, SimplePieChart, SimpleLineChart } from '@/components/ui/Chart';

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [selectedBranch, setSelectedBranch] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'products' | 'customers' | 'orders' | 'inventory' | 'branches' | 'financial'>('overview');

    // Fetch data
    const { data: dashboardStats, isLoading: dashboardLoading, refetch: refetchDashboard } = useDashboardStats();
    const { data: salesData, isLoading: salesLoading, refetch: refetchSales } = useSalesData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        branchId: selectedBranch || undefined
    });
    const { data: productStats, isLoading: productLoading, refetch: refetchProducts } = useProductStats();
    const { data: customerStats, isLoading: customerLoading, refetch: refetchCustomers } = useCustomerStats();
    const { data: orderStats, isLoading: orderLoading, refetch: refetchOrders } = useOrderStats();
    const { data: inventoryStats, isLoading: inventoryLoading, refetch: refetchInventory } = useInventoryStats(selectedBranch);
    const { data: branchesData } = useBranches();

    // Additional report data
    const { data: topSellingProducts } = useTopSellingProducts({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: 10,
        branchId: selectedBranch || undefined
    });
    const { data: customerReport } = useCustomerReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
    });
    const { data: inventoryReport } = useInventoryReport({
        branchId: selectedBranch || undefined
    });
    const { data: branchPerformance, isLoading: branchPerformanceLoading } = useBranchPerformanceReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
    });
    const { data: productPerformance } = useProductPerformanceReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        branchId: selectedBranch || undefined
    });
    const { data: financialReport, isLoading: financialLoading } = useFinancialReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        branchId: selectedBranch || undefined
    });

    const exportSalesMutation = useExportSalesReport();

    const branches = branchesData?.data || [];

    const handleRefreshAll = () => {
        refetchDashboard();
        refetchSales();
        refetchProducts();
        refetchCustomers();
        refetchOrders();
        refetchInventory();
    };

    const handleExportData = () => {
        exportSalesMutation.mutate({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            branchId: selectedBranch || undefined,
            format: 'csv'
        });
    };

    const tabs = [
        { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
        { id: 'sales', label: 'المبيعات', icon: TrendingUp },
        { id: 'products', label: 'المنتجات', icon: Package },
        { id: 'customers', label: 'العملاء', icon: Users },
        { id: 'orders', label: 'الطلبات', icon: ShoppingCart },
        { id: 'inventory', label: 'المخزون', icon: Package },
        { id: 'branches', label: 'أداء الفروع', icon: Building2 },
        { id: 'financial', label: 'التقارير المالية', icon: DollarSign }
    ];

    const StatCard = ({ title, value, icon: Icon, change, changeType }: {
        title: string;
        value: string | number;
        icon: React.ComponentType<{ className?: string }>;
        change?: string;
        changeType?: 'positive' | 'negative' | 'neutral';
    }) => (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                    {change && (
                        <p className={`text-sm mt-2 flex items-center ${changeType === 'positive' ? 'text-green-600' :
                            changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                            {change}
                        </p>
                    )}
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        تتبع أداء متجرك وتحليل البيانات
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3 space-x-reverse">
                    <button
                        onClick={handleRefreshAll}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <RefreshCw className="h-4 w-4 ml-2" />
                        تحديث
                    </button>
                    <button
                        onClick={handleExportData}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Download className="h-4 w-4 ml-2" />
                        تصدير
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">من تاريخ:</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <label className="text-sm font-medium text-gray-700">إلى تاريخ:</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">الفرع:</label>
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">جميع الفروع</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 space-x-reverse px-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="h-5 w-5 ml-2" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {dashboardLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="طلبات اليوم"
                                        value={(dashboardStats as Record<string, unknown>)?.today?.orders || 0}
                                        icon={ShoppingCart}
                                    />
                                    <StatCard
                                        title="إيرادات اليوم"
                                        value={`$${(dashboardStats as Record<string, unknown>)?.today?.revenue || 0}`}
                                        icon={DollarSign}
                                        changeType="positive"
                                    />
                                    <StatCard
                                        title="إجمالي العملاء"
                                        value={(dashboardStats as Record<string, unknown>)?.totals?.customers || 0}
                                        icon={Users}
                                    />
                                    <StatCard
                                        title="إجمالي المنتجات"
                                        value={(dashboardStats as Record<string, unknown>)?.totals?.products || 0}
                                        icon={Package}
                                    />
                                    <StatCard
                                        title="منتجات مخزون منخفض"
                                        value={(dashboardStats as Record<string, unknown>)?.totals?.lowStockItems || 0}
                                        icon={Package}
                                        changeType="negative"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sales Tab */}
                    {activeTab === 'sales' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">تقرير المبيعات</h3>
                            {salesLoading ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
                                    <div className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
                                </div>
                            ) : salesData && (salesData as Record<string, unknown>).dailyData && (salesData as Record<string, unknown>).dailyData.length > 0 ? (
                                <div className="space-y-6">
                                    {/* Charts */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <SimpleLineChart
                                            data={(salesData as Record<string, unknown>).dailyData.map((item: Record<string, unknown>) => ({
                                                label: (item._id as Record<string, unknown>).date,
                                                value: item.totalRevenue
                                            }))}
                                            title="اتجاه المبيعات"
                                            color="#10B981"
                                        />
                                        <SimpleBarChart
                                            data={(salesData as Record<string, unknown>).dailyData.map((item: Record<string, unknown>) => ({
                                                label: (item._id as Record<string, unknown>).date,
                                                value: item.totalOrders,
                                                color: '#3B82F6'
                                            }))}
                                            title="عدد الطلبات"
                                        />
                                    </div>

                                    {/* Data Table */}
                                    <div className="bg-white rounded-lg border border-gray-200">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h4 className="text-lg font-medium text-gray-900">تفاصيل المبيعات</h4>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبيعات</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الطلبات</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العناصر</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {(salesData as Record<string, unknown>).dailyData.map((item: Record<string, unknown>, index: number) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {(item._id as Record<string, unknown>).date}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                ${item.totalRevenue}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {item.totalOrders}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {item.totalItems}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-12 text-center">
                                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">لا توجد بيانات مبيعات للفترة المحددة</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">إحصائيات المنتجات</h3>
                            {productLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <StatCard
                                        title="إجمالي المنتجات"
                                        value={productStats?.totalProducts || 0}
                                        icon={Package}
                                    />
                                    <StatCard
                                        title="المنتجات النشطة"
                                        value={productStats?.activeProducts || 0}
                                        icon={Package}
                                        changeType="positive"
                                    />
                                    <StatCard
                                        title="المنتجات المميزة"
                                        value={productStats?.featuredProducts || 0}
                                        icon={Package}
                                        changeType="positive"
                                    />
                                    <StatCard
                                        title="مخزون منخفض"
                                        value={productStats?.lowStockProducts || 0}
                                        icon={Package}
                                        changeType="negative"
                                    />
                                    <StatCard
                                        title="نفد من المخزون"
                                        value={productStats?.outOfStockProducts || 0}
                                        icon={Package}
                                        changeType="negative"
                                    />
                                    <StatCard
                                        title="قيمة المخزون الإجمالية"
                                        value={`$${productStats?.totalInventoryValue || 0}`}
                                        icon={DollarSign}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Customers Tab */}
                    {activeTab === 'customers' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">إحصائيات العملاء</h3>
                            {customerLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <StatCard
                                        title="إجمالي العملاء"
                                        value={customerStats?.totalCustomers || 0}
                                        icon={Users}
                                    />
                                    <StatCard
                                        title="العملاء النشطون"
                                        value={customerStats?.activeCustomers || 0}
                                        icon={Users}
                                        changeType="positive"
                                    />
                                    <StatCard
                                        title="عملاء جدد هذا الشهر"
                                        value={customerStats?.newCustomersThisMonth || 0}
                                        icon={Users}
                                        changeType="positive"
                                    />
                                </div>
                            )}

                            {/* Top Customers */}
                            {customerReport?.topCustomers && customerReport.topCustomers.length > 0 && (
                                <div className="bg-white rounded-lg border border-gray-200">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h4 className="text-lg font-medium text-gray-900">أفضل العملاء</h4>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {customerReport.topCustomers.map((customer, index) => (
                                            <div key={customer._id} className="px-6 py-4 flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-blue-600">
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mr-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {customer.firstName} {customer.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {customer.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        ${customer.totalSpent}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {customer.totalOrders} طلب
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">إحصائيات الطلبات</h3>
                            {orderLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <StatCard
                                            title="إجمالي الطلبات"
                                            value={orderStats?.totalOrders || 0}
                                            icon={ShoppingCart}
                                        />
                                        <StatCard
                                            title="طلبات معلقة"
                                            value={orderStats?.pendingOrders || 0}
                                            icon={ShoppingCart}
                                            changeType="neutral"
                                        />
                                        <StatCard
                                            title="طلبات قيد التنفيذ"
                                            value={orderStats?.processingOrders || 0}
                                            icon={ShoppingCart}
                                            changeType="positive"
                                        />
                                        <StatCard
                                            title="طلبات مكتملة"
                                            value={orderStats?.completedOrders || 0}
                                            icon={ShoppingCart}
                                            changeType="positive"
                                        />
                                        <StatCard
                                            title="طلبات ملغية"
                                            value={orderStats?.cancelledOrders || 0}
                                            icon={ShoppingCart}
                                            changeType="negative"
                                        />
                                        <StatCard
                                            title="إجمالي الإيرادات"
                                            value={`$${orderStats?.totalRevenue || 0}`}
                                            icon={DollarSign}
                                        />
                                        <StatCard
                                            title="متوسط قيمة الطلب"
                                            value={`$${orderStats?.averageOrderValue || 0}`}
                                            icon={DollarSign}
                                        />
                                    </div>

                                    {/* Order Status Distribution Chart */}
                                    {orderStats && (
                                        <SimplePieChart
                                            data={[
                                                { label: 'معلقة', value: orderStats.pendingOrders, color: '#F59E0B' },
                                                { label: 'قيد التنفيذ', value: orderStats.processingOrders, color: '#3B82F6' },
                                                { label: 'مكتملة', value: orderStats.completedOrders, color: '#10B981' },
                                                { label: 'ملغية', value: orderStats.cancelledOrders, color: '#EF4444' }
                                            ].filter(item => item.value > 0)}
                                            title="توزيع حالات الطلبات"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Inventory Tab */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">إحصائيات المخزون</h3>
                            {inventoryLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <StatCard
                                        title="إجمالي المنتجات"
                                        value={inventoryStats?.totalProducts || 0}
                                        icon={Package}
                                    />
                                    <StatCard
                                        title="مخزون منخفض"
                                        value={inventoryStats?.lowStockCount || 0}
                                        icon={Package}
                                        changeType="negative"
                                    />
                                    <StatCard
                                        title="نفد من المخزون"
                                        value={inventoryStats?.outOfStockCount || 0}
                                        icon={Package}
                                        changeType="negative"
                                    />
                                    <StatCard
                                        title="القيمة الإجمالية"
                                        value={`$${inventoryStats?.totalValue || 0}`}
                                        icon={DollarSign}
                                    />
                                    <StatCard
                                        title="متوسط مستوى المخزون"
                                        value={inventoryStats?.averageStockLevel || 0}
                                        icon={Package}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Branches Tab */}
                    {activeTab === 'branches' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">تقرير أداء الفروع</h3>
                            {branchPerformanceLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
                                    ))}
                                </div>
                            ) : branchPerformance && branchPerformance.length > 0 ? (
                                <div className="space-y-6">
                                    {/* Branch Performance Chart */}
                                    <SimpleBarChart
                                        data={branchPerformance.map(branch => ({
                                            label: branch.branchName,
                                            value: branch.totalRevenue,
                                            color: '#10B981'
                                        }))}
                                        title="مبيعات الفروع"
                                    />

                                    {/* Branch Performance Table */}
                                    <div className="bg-white rounded-lg border border-gray-200">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h4 className="text-lg font-medium text-gray-900">تفاصيل أداء الفروع</h4>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفرع</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبيعات</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الطلبات</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العناصر</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">متوسط الطلب</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {branchPerformance.map((branch) => (
                                                        <tr key={branch._id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {branch.branchName}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                ${branch.totalRevenue}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {branch.totalOrders}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {branch.totalItems}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                ${Math.round(branch.averageOrderValue)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-12 text-center">
                                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">لا توجد بيانات أداء للفروع في الفترة المحددة</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Financial Tab */}
                    {activeTab === 'financial' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">التقرير المالي</h3>
                            {financialLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
                                    ))}
                                </div>
                            ) : financialReport ? (
                                <div className="space-y-6">
                                    {/* Financial KPIs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <StatCard
                                            title="إجمالي الإيرادات"
                                            value={`$${financialReport.summary.totalRevenue}`}
                                            icon={DollarSign}
                                            changeType="positive"
                                        />
                                        <StatCard
                                            title="إجمالي الطلبات"
                                            value={financialReport.summary.totalOrders}
                                            icon={ShoppingCart}
                                            changeType="positive"
                                        />
                                        <StatCard
                                            title="متوسط قيمة الطلب"
                                            value={`$${Math.round(financialReport.summary.averageOrderValue)}`}
                                            icon={Target}
                                            changeType="positive"
                                        />
                                        <StatCard
                                            title="إجمالي الضرائب"
                                            value={`$${financialReport.summary.totalTax}`}
                                            icon={DollarSign}
                                            changeType="neutral"
                                        />
                                        <StatCard
                                            title="إجمالي الخصومات"
                                            value={`$${financialReport.summary.totalDiscount}`}
                                            icon={DollarSign}
                                            changeType="negative"
                                        />
                                    </div>

                                    {/* Financial Charts */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <SimpleLineChart
                                            data={financialReport.dailyData.map(item => ({
                                                label: item._id.date,
                                                value: item.revenue
                                            }))}
                                            title="اتجاه الإيرادات"
                                            color="#10B981"
                                        />
                                        <SimpleBarChart
                                            data={financialReport.dailyData.map(item => ({
                                                label: item._id.date,
                                                value: item.orders,
                                                color: '#3B82F6'
                                            }))}
                                            title="الطلبات اليومية"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-12 text-center">
                                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">لا توجد بيانات مالية للفترة المحددة</p>
                                </div>
                            )}
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
}

