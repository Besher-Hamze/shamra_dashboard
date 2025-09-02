'use client';

import { useState } from 'react';
import { useAdjustStock, InventoryItem } from '@/hooks/useInventory';

interface StockAdjustmentFormProps {
    inventoryItem: InventoryItem;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function StockAdjustmentForm({ inventoryItem, onSuccess, onCancel }: StockAdjustmentFormProps) {
    const [formData, setFormData] = useState({
        type: 'ADJUSTMENT',
        quantity: '',
        unitCost: inventoryItem.unitCost.toString(),
        reference: '',
        notes: '',
    });

    const adjustStockMutation = useAdjustStock();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const adjustmentData = {
            productId: inventoryItem.productId,
            branchId: inventoryItem.branchId,
            type: formData.type,
            quantity: parseInt(formData.quantity) || 0,
            unitCost: parseFloat(formData.unitCost) || inventoryItem.unitCost,
            reference: formData.reference || undefined,
            notes: formData.notes || undefined,
        };

        adjustStockMutation.mutate(adjustmentData, { onSuccess });
    };

    const getNewStockQuantity = () => {
        const quantity = parseInt(formData.quantity) || 0;
        const currentStock = inventoryItem.currentStock;

        switch (formData.type) {
            case 'PURCHASE':
            case 'RETURN':
                return currentStock + quantity;
            case 'SALE':
            case 'DAMAGE':
                return currentStock - quantity;
            case 'ADJUSTMENT':
                return quantity; // Direct set to this quantity
            default:
                return currentStock;
        }
    };

    const newStockQuantity = getNewStockQuantity();
    const isLoading = adjustStockMutation.isPending;
    const error = adjustStockMutation.error;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">
                        {error?.response?.data?.message || error?.message || 'حدث خطأ أثناء تعديل المخزون'}
                    </p>
                </div>
            )}

            {/* Product Info */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">معلومات المنتج</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">المنتج:</span>
                        <span className="font-medium mr-2">
                            {inventoryItem.product?.nameAr || inventoryItem.product?.name}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500">SKU:</span>
                        <span className="font-medium mr-2">{inventoryItem.product?.sku}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">الفرع:</span>
                        <span className="font-medium mr-2">
                            {inventoryItem.branch?.nameAr || inventoryItem.branch?.name}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500">الكمية الحالية:</span>
                        <span className="font-medium mr-2">{inventoryItem.currentStock} {inventoryItem.unit}</span>
                    </div>
                </div>
            </div>

            {/* Adjustment Type */}
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    نوع التعديل *
                </label>
                <select
                    id="type"
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input-field"
                >
                    <option value="PURCHASE">شراء - إضافة مخزون</option>
                    <option value="SALE">بيع - خصم مخزون</option>
                    <option value="ADJUSTMENT">تعديل - تحديد كمية محددة</option>
                    <option value="RETURN">إرجاع - إضافة مخزون</option>
                    <option value="DAMAGE">تلف - خصم مخزون</option>
                </select>
            </div>

            {/* Quantity */}
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.type === 'ADJUSTMENT' ? 'الكمية الجديدة *' : 'الكمية *'}
                </label>
                <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={formData.type === 'ADJUSTMENT' ? 'الكمية الجديدة' : 'الكمية المراد تعديلها'}
                />
                {formData.quantity && (
                    <p className="mt-1 text-sm text-gray-600">
                        الكمية بعد التعديل: <span className="font-medium">{newStockQuantity} {inventoryItem.unit}</span>
                        {newStockQuantity <= inventoryItem.minStockLevel && (
                            <span className="text-yellow-600 mr-2">⚠️ أقل من الحد الأدنى</span>
                        )}
                        {newStockQuantity < 0 && (
                            <span className="text-red-600 mr-2">❌ كمية سالبة</span>
                        )}
                    </p>
                )}
            </div>

            {/* Unit Cost */}
            <div>
                <label htmlFor="unitCost" className="block text-sm font-medium text-gray-700 mb-2">
                    تكلفة الوحدة
                </label>
                <input
                    type="number"
                    id="unitCost"
                    name="unitCost"
                    min="0"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0.00"
                />
            </div>

            {/* Reference */}
            <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
                    المرجع (اختياري)
                </label>
                <input
                    type="text"
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="رقم الفاتورة، رقم الطلب، إلخ"
                />
            </div>

            {/* Notes */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات (اختياري)
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="أي ملاحظات إضافية حول هذا التعديل..."
                />
            </div>

            {/* Summary */}
            {formData.quantity && (
                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">ملخص التعديل</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                        <div className="flex justify-between">
                            <span>الكمية الحالية:</span>
                            <span>{inventoryItem.currentStock} {inventoryItem.unit}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>
                                {formData.type === 'ADJUSTMENT'
                                    ? 'الكمية الجديدة:'
                                    : formData.type === 'PURCHASE' || formData.type === 'RETURN'
                                        ? 'إضافة:'
                                        : 'خصم:'
                                }
                            </span>
                            <span>
                                {formData.type === 'ADJUSTMENT'
                                    ? `${formData.quantity} ${inventoryItem.unit}`
                                    : `${formData.quantity} ${inventoryItem.unit}`
                                }
                            </span>
                        </div>
                        <div className="flex justify-between font-medium border-t border-blue-200 pt-1">
                            <span>الكمية النهائية:</span>
                            <span className={newStockQuantity < 0 ? 'text-red-600' : ''}>
                                {newStockQuantity} {inventoryItem.unit}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn-secondary"
                >
                    إلغاء
                </button>
                <button
                    type="submit"
                    disabled={isLoading || newStockQuantity < 0 || !formData.quantity}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'جاري التعديل...' : 'تأكيد التعديل'}
                </button>
            </div>
        </form>
    );
}
