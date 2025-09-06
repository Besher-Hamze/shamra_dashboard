'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  Users,
  Package,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Building2,
  ChevronRight
} from 'lucide-react';
import { AuthService } from '@/lib/auth';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

const navigation: SidebarItem[] = [
  // { name: 'الرئيسية', href: '/dashboard', icon: Home },
  { name: 'التقارير', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'الفروع', href: '/dashboard/branches', icon: Building2 },
  { name: "الاصناف", href: "/dashboard/categories", icon: Package },
  { name: 'المنتجات', href: '/dashboard/products', icon: ShoppingBag },
  // { name: 'الطلبات', href: '/dashboard/orders', icon: ShoppingCart },
  // { name: 'العملاء', href: '/dashboard/customers', icon: Users },
  // { name: 'المخزون', href: '/dashboard/inventory', icon: Package },
  // { name: 'الإشعارات', href: '/dashboard/notifications', icon: Bell, badge: 3 },

];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = AuthService.getUser();

  const handleLogout = async () => {
    try {
      AuthService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage and redirect
      AuthService.logout();
      router.push('/login');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col h-screen lg:h-full ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ش</span>
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">شمرا</h1>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {user?.firstName?.[0] || 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-3 flex-1 overflow-y-auto">
          <div className="space-y-1 pb-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-700'
                      }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-blue-700" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-700" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </>
  );
}