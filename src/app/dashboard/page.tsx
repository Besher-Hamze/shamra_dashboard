'use client';

import {
    ShoppingBag,
    ShoppingCart,
    Users,
    TrendingUp,
    Package,
    AlertTriangle,
    Eye,
    Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDashboardStats, useSalesData, useCategoryData, useRecentOrders } from '@/hooks/useDashboard';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];


export default function DashboardPage() {
    const { data: stats, isLoading: statsLoading } = useDashboardStats();
    const { data: salesData, isLoading: salesLoading } = useSalesData();
    const { data: categoryData, isLoading: categoryLoading } = useCategoryData();
    const { data: recentOrdersData, isLoading: ordersLoading } = useRecentOrders(5);

    const loading = statsLoading || salesLoading || categoryLoading || ordersLoading;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'مكتمل';
            case 'PENDING':
                return 'معلق';
            case 'PROCESSING':
                return 'قيد المعالجة';
            case 'CANCELLED':
                return 'ملغي';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded mb-4"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    console.log(categoryData);


    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
                <p className="text-gray-600 mt-2">مرحباً بك، إليك نظرة عامة على أداء أعمالك</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">إجمالي المنتجات</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600 font-medium">+5.2%</span>
                        <span className="text-gray-500 ml-2">من الشهر الماضي</span>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600 font-medium">+8.1%</span>
                        <span className="text-gray-500 ml-2">من الشهر الماضي</span>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">إجمالي العملاء</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600 font-medium">+12.3%</span>
                        <span className="text-gray-500 ml-2">من الشهر الماضي</span>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                            <p className="text-2xl font-bold text-gray-900">${stats?.totalRevenue?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600 font-medium">+{stats?.revenueGrowth || 0}%</span>
                        <span className="text-gray-500 ml-2">من الشهر الماضي</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">منتجات منخفضة المخزون</p>
                            <p className="text-xl font-bold text-red-900">{stats?.lowStockProducts || 0}</p>
                        </div>
                    </div>
                    <button className="mt-3 text-sm text-red-700 hover:text-red-800 font-medium">
                        عرض التفاصيل ←
                    </button>
                </div>

                <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-blue-800">طلبات معلقة</p>
                            <p className="text-xl font-bold text-blue-900">{stats?.pendingOrders || 0}</p>
                        </div>
                    </div>
                    <button className="mt-3 text-sm text-blue-700 hover:text-blue-800 font-medium">
                        عرض الطلبات ←
                    </button>
                </div>

                <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">عملاء جدد هذا الشهر</p>
                            <p className="text-xl font-bold text-green-900">{stats?.newCustomersThisMonth || 0}</p>
                        </div>
                    </div>
                    <button className="mt-3 text-sm text-green-700 hover:text-green-800 font-medium">
                        عرض العملاء ←
                    </button>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Sales Chart */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">المبيعات الشهرية</h3>
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">آخر 6 أشهر</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                                formatter={(value, name) => [
                                    name === 'sales' ? `$${value.toLocaleString()}` : value,
                                    name === 'sales' ? 'المبيعات' : 'الطلبات'
                                ]}
                            />
                            <Legend formatter={(value) => value === 'sales' ? 'المبيعات' : 'الطلبات'} />
                            <Bar dataKey="sales" fill="#3B82F6" name="sales" />
                            <Bar dataKey="orders" fill="#10B981" name="orders" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">توزيع المنتجات حسب الفئة</h3>
                        <Eye className="h-4 w-4 text-gray-500" />
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {(categoryData || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">الطلبات الأخيرة</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        عرض الكل ←
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="table-header">رقم الطلب</th>
                                <th className="table-header">العميل</th>
                                <th className="table-header">المبلغ</th>
                                <th className="table-header">الحالة</th>
                                <th className="table-header">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(recentOrdersData || []).map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="table-cell font-medium text-blue-600">
                                        {order.orderNumber}
                                    </td>
                                    <td className="table-cell">{order.customer?.firstName} {order.customer?.lastName}</td>
                                    <td className="table-cell font-medium">
                                        ${order.total?.toLocaleString() || '0'}
                                    </td>
                                    <td className="table-cell">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="table-cell text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString('en-US')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
