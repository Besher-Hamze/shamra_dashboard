'use client';

import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { useImportInventory, useDownloadTemplate } from '@/hooks/useInventory';
import { useBranches } from '@/hooks/useBranches';

interface ExcelImportFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ExcelImportForm({ onSuccess, onCancel }: ExcelImportFormProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [importMode, setImportMode] = useState<'replace' | 'add' | 'subtract'>('replace');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: branchesData } = useBranches();
    const importMutation = useImportInventory();
    const downloadTemplateMutation = useDownloadTemplate();

    const branches = branchesData?.data || [];

    const handleFileSelect = (file: File) => {
        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('نوع الملف غير مدعوم. يرجى رفع ملف Excel (.xlsx, .xls) أو CSV');
            return;
        }

        setSelectedFile(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleSubmit = () => {
        if (!selectedFile || !selectedBranch) {
            alert('يرجى اختيار الملف والفرع');
            return;
        }

        importMutation.mutate({
            file: selectedFile,
            branchId: selectedBranch,
            importMode
        }, {
            onSuccess: () => {
                onSuccess?.();
            }
        });
    };

    const handleDownloadTemplate = () => {
        downloadTemplateMutation.mutate();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 ml-2" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-800">تعليمات الاستيراد</h3>
                        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                            <li>قم بتحميل قالب Excel أولاً لمعرفة التنسيق المطلوب</li>
                            <li>يجب أن يحتوي الملف على أعمدة: رمز المنتج، الكمية، تكلفة الوحدة (اختياري)</li>
                            <li>أنواع الملفات المدعومة: .xlsx, .xls, .csv</li>
                            <li>الحد الأقصى لحجم الملف: 10 ميجابايت</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Download Template */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 text-green-600 ml-2" />
                    <div>
                        <p className="text-sm font-medium text-gray-900">قالب الاستيراد</p>
                        <p className="text-xs text-gray-500">تحميل قالب Excel مع التنسيق المطلوب</p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadTemplate}
                    disabled={downloadTemplateMutation.isPending}
                    className="btn-secondary flex items-center space-x-2 space-x-reverse"
                >
                    <Download className="h-4 w-4" />
                    <span>تحميل القالب</span>
                </button>
            </div>

            {/* Branch Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفرع <span className="text-red-500">*</span>
                </label>
                <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="input-field"
                    required
                >
                    <option value="">اختر الفرع</option>
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Import Mode */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    وضع الاستيراد
                </label>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="replace"
                            checked={importMode === 'replace'}
                            onChange={(e) => setImportMode(e.target.value as 'replace')}
                            className="ml-2"
                        />
                        <span className="text-sm text-gray-700">استبدال الكمية الحالية</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="add"
                            checked={importMode === 'add'}
                            onChange={(e) => setImportMode(e.target.value as 'add')}
                            className="ml-2"
                        />
                        <span className="text-sm text-gray-700">إضافة للكمية الحالية</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="subtract"
                            checked={importMode === 'subtract'}
                            onChange={(e) => setImportMode(e.target.value as 'subtract')}
                            className="ml-2"
                        />
                        <span className="text-sm text-gray-700">طرح من الكمية الحالية</span>
                    </label>
                </div>
            </div>

            {/* File Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملف Excel <span className="text-red-500">*</span>
                </label>
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                        ? 'border-blue-400 bg-blue-50'
                        : selectedFile
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileInputChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {selectedFile ? (
                        <div className="flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600 ml-2" />
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                                اسحب الملف هنا أو{' '}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-blue-600 hover:text-blue-500"
                                >
                                    اختر ملف
                                </button>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                .xlsx, .xls, .csv حتى 10 ميجابايت
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
                <button
                    onClick={onCancel}
                    className="btn-secondary"
                    disabled={importMutation.isPending}
                >
                    إلغاء
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || !selectedBranch || importMutation.isPending}
                    className="btn-primary"
                >
                    {importMutation.isPending ? 'جاري الاستيراد...' : 'استيراد البيانات'}
                </button>
            </div>
        </div>
    );
}
