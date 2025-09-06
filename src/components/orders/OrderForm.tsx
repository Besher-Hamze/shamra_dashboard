'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, Search, User, Package, Calculator, FileText, Save, X, ShoppingCart, Trash2 } from 'lucide-react';
import { Order, CreateOrderData, UpdateOrderData, OrderItem, Customer, Product, Branch, OrderStatus } from '@/types';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useBranches } from '@/hooks/useBranches';

interface OrderFormProps {
    order?: Order;
    onSubmit: (data: CreateOrderData | UpdateOrderData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    error?: any;
    mode: 'create' | 'edit';
}

export default function OrderForm({
    order,
    onSubmit,
    onCancel,
    isLoading,
    error,
    mode
}: OrderFormProps) {
    const [formData, setFormData] = useState<CreateOrderData>({
        customerId: '',
        branchId: '',
        items: [],
        taxAmount: 0,
        discountAmount: 0,
        notes: '',
        isPaid: false,
    });

    const [customerSearch, setCustomerSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Data queries
    const { data: customersData } = useCustomers({ search: customerSearch, limit: 10 });
    const { data: productsData } = useProducts({ search: productSearch, limit: 20 });
    const { data: branchesData } = useBranches({});

    useEffect(() => {
        if (order) {
            setFormData({
                customerId: order.customerId,
                branchId: order.branchId || '',
                items: order.items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    productSku: item.productSku,
                    quantity: item.quantity,
                    price: item.price
                })),
                taxAmount: order.taxAmount || 0,
                discountAmount: order.discountAmount || 0,
                notes: order.notes || '',
                isPaid: order.isPaid || false,
            });
            setSelectedCustomer(order.customer || null);
        }
    }, [order]);

    const handleInputChange = (field: keyof CreateOrderData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setFormData(prev => ({ ...prev, customerId: customer.id }));
        setCustomerSearch(`${customer.firstName} ${customer.lastName}`);
        setShowCustomerDropdown(false);
    };

    const handleAddProduct = (product: Product) => {
        const existingItemIndex = formData.items.findIndex(item => item.productId === product.id);

        if (existingItemIndex >= 0) {
            // Update existing item quantity
            const newItems = [...formData.items];
            newItems[existingItemIndex].quantity += 1;
            setFormData(prev => ({ ...prev, items: newItems }));
        } else {
            // Add new item
            const newItem: OrderItem = {
                productId: product.id,
                productName: product.name,
                productSku: product.barcode || `SKU-${product.id.slice(-6)}`,
                quantity: 1,
                price: product.salePrice || product.price,
            };
            setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
        }
        setProductSearch('');
        setShowProductDropdown(false);
    };

    const handleUpdateItemQuantity = (index: number, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveItem(index);
            return;
        }

        const newItems = [...formData.items];
        newItems[index].quantity = quantity;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleUpdateItemPrice = (index: number, price: number) => {
        const newItems = [...formData.items];
        newItems[index].price = Math.max(0, price);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleRemoveItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal + (formData.taxAmount || 0) - (formData.discountAmount || 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'edit') {
            const updateData: UpdateOrderData = {
                taxAmount: formData.taxAmount,
                discountAmount: formData.discountAmount,
                notes: formData.notes,
                isPaid: formData.isPaid,
            };
            onSubmit(updateData);
        } else {
            onSubmit(formData);
        }
    };

    const filteredCustomers = customersData?.data?.filter(customer =>
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.email.toLowerCase().includes(customerSearch.toLowerCase())
    ) || [];

    const filteredProducts = productsData?.data?.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(productSearch.toLowerCase())
    ) || [];

    return (
        <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {mode === 'create' ? 'إنشاء طلب جديد' : `تعديل الطلب ${order?.orderNumber}`}
                        </h2>
                        <p className="text-gray-600 mt-1">
                            {mode === 'create' ? 'أضف العناصر وحدد تفاصيل الطلب' : 'تعديل تفاصيل الطلب الحالي'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Customer Selection */}
                        <div className="card">
                            <div className="flex items-center space-x-3 space-x-reverse mb-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">معلومات العميل</h3>
                            </div>

                            <div className="relative">
                                <div className="form-group">
                                    <label className="form-label">العميل *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={customerSearch}
                                            onChange={(e) => {
                                                setCustomerSearch(e.target.value);
                                                setShowCustomerDropdown(true);
                                            }}
                                            onFocus={() => setShowCustomerDropdown(true)}
                                            className="input-field pr-10"
                                            placeholder="البحث عن العميل..."
                                            disabled={mode === 'edit'}
                                            required
                                        />
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>

                                    {showCustomerDropdown && filteredCustomers.length > 0 && mode === 'create' && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {filteredCustomers.map((customer) => (
                                                <div
                                                    key={customer.id}
                                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                    onClick={() => handleCustomerSelect(customer)}
                                                >
                                                    <div className="font-medium text-gray-900">
                                                        {customer.firstName} {customer.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{customer.email}</div>
                                                    {customer.phoneNumber && (
                                                        <div className="text-sm text-gray-500">{customer.phoneNumber}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {selectedCustomer && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                        <div className="text-sm font-medium text-blue-900">
                                            {selectedCustomer.firstName} {selectedCustomer.lastName}
                                        </div>
                                        <div className="text-sm text-blue-700">{selectedCustomer.email}</div>
                                        {selectedCustomer.phoneNumber && (
                                            <div className="text-sm text-blue-700">{selectedCustomer.phoneNumber}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Branch Selection */}
                        <div className="card">
                            <div className="form-group">
                                <label className="form-label">الفرع</label>
                                <select
                                    value={formData.branchId}
                                    onChange={(e) => handleInputChange('branchId', e.target.value)}
                                    className="select-field"
                                    disabled={mode === 'edit'}
                                >
                                    <option value="">اختر الفرع (اختياري)</option>
                                    {branchesData?.data?.map((branch: Branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Package className="h-5 w-5 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">عناصر الطلب</h3>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {formData.items.length} عنصر
                                </span>
                            </div>

                            {/* Add Product Search */}
                            {mode === 'create' && (
                                <div className="relative mb-6">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => {
                                                setProductSearch(e.target.value);
                                                setShowProductDropdown(true);
                                            }}
                                            onFocus={() => setShowProductDropdown(true)}
                                            className="input-field pr-10"
                                            placeholder="البحث عن المنتجات لإضافتها..."
                                        />
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>

                                    {showProductDropdown && filteredProducts.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {filteredProducts.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                    onClick={() => handleAddProduct(product)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{product.name}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {product.barcode} • مخزون: {product.stockQuantity}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-medium text-green-600">
                                                            ${(product.salePrice || product.price).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Items List */}
                            <div className="space-y-3">
                                {formData.items.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                        <p>لا توجد عناصر في الطلب</p>
                                        <p className="text-sm">ابحث عن المنتجات لإضافتها</p>
                                    </div>
                                ) : (
                                    formData.items.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-4 space-x-reverse p-4 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">{item.productName}</div>
                                                <div className="text-sm text-gray-500">{item.productSku}</div>
                                            </div>

                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                                                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                    disabled={mode === 'edit'}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateItemQuantity(index, parseInt(e.target.value) || 1)}
                                                    className="w-16 text-center input-field text-sm"
                                                    disabled={mode === 'edit'}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                                                    className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                                                    disabled={mode === 'edit'}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <span className="text-sm text-gray-500">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={item.price}
                                                    onChange={(e) => handleUpdateItemPrice(index, parseFloat(e.target.value) || 0)}
                                                    className="w-20 text-center input-field text-sm"
                                                    disabled={mode === 'edit'}
                                                />
                                            </div>

                                            <div className="w-20 text-right font-medium text-gray-900">
                                                ${(item.quantity * item.price).toLocaleString()}
                                            </div>

                                            {mode === 'create' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Order Notes */}
                        <div className="card">
                            <div className="flex items-center space-x-3 space-x-reverse mb-4">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">ملاحظات إضافية</h3>
                            </div>

                            <div className="form-group">
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    className="textarea-field"
                                    rows={3}
                                    placeholder="أي ملاحظات خاصة بالطلب..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="card  top-6">
                            <div className="flex items-center space-x-3 space-x-reverse mb-4">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Calculator className="h-5 w-5 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">ملخص الطلب</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">المجموع الفرعي:</span>
                                    <span className="font-medium">${calculateSubtotal().toLocaleString()}</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label text-sm">الضرائب ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.taxAmount}
                                        onChange={(e) => handleInputChange('taxAmount', parseFloat(e.target.value) || 0)}
                                        className="input-field"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label text-sm">الخصم ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.discountAmount}
                                        onChange={(e) => handleInputChange('discountAmount', parseFloat(e.target.value) || 0)}
                                        className="input-field"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>المجموع الإجمالي:</span>
                                        <span className="text-blue-600">${calculateTotal().toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isPaid"
                                        checked={formData.isPaid}
                                        onChange={(e) => handleInputChange('isPaid', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isPaid" className="mr-2 text-sm text-gray-700">
                                        الطلب مدفوع
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Order Actions */}
                        <div className="card">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    className="btn-primary w-full flex items-center justify-center"
                                    disabled={isLoading || formData.items.length === 0 || !formData.customerId}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="loading-spinner mr-2"></div>
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {mode === 'create' ? 'إنشاء الطلب' : 'حفظ التغييرات'}
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="btn-secondary w-full flex items-center justify-center"
                                    disabled={isLoading}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    إلغاء
                                </button>
                            </div>

                            {mode === 'create' && (
                                <div className="mt-4 text-xs text-gray-500">
                                    <p>• يجب اختيار عميل وإضافة منتج واحد على الأقل</p>
                                    <p>• يمكن تعديل الكميات والأسعار قبل الحفظ</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 text-sm">
                            {error?.response?.data?.message || error?.message || 'حدث خطأ أثناء حفظ الطلب'}
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
}
