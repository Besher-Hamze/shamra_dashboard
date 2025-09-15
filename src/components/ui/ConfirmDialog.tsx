'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import Modal from './Modal';

export type DialogType = 'warning' | 'info' | 'success' | 'error';

export interface ConfirmDialogOptions {
    title: string;
    message: string;
    type?: DialogType;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
}

interface DialogContextType {
    showDialog: (options: ConfirmDialogOptions) => void;
    hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useConfirmDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useConfirmDialog must be used within a DialogProvider');
    }
    return context;
};

interface DialogProviderProps {
    children: ReactNode;
}

export function DialogProvider({ children }: DialogProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const showDialog = useCallback((dialogOptions: ConfirmDialogOptions) => {
        setOptions(dialogOptions);
        setIsOpen(true);
    }, []);

    const hideDialog = useCallback(() => {
        setIsOpen(false);
        setOptions(null);
        setIsLoading(false);
    }, []);

    const handleConfirm = async () => {
        if (!options) return;

        try {
            setIsLoading(true);
            await options.onConfirm();
            hideDialog();
        } catch (error) {
            console.error('Dialog confirm error:', error);
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (options?.onCancel) {
            options.onCancel();
        }
        hideDialog();
    };

    const getIcon = () => {
        if (!options) return null;

        switch (options.type) {
            case 'warning':
                return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
            case 'info':
                return <Info className="w-8 h-8 text-blue-600" />;
            case 'success':
                return <CheckCircle className="w-8 h-8 text-green-600" />;
            case 'error':
                return <XCircle className="w-8 h-8 text-red-600" />;
            default:
                return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
        }
    };

    const getIconBackgroundColor = () => {
        if (!options) return 'bg-gradient-to-br from-yellow-100 to-yellow-200';

        switch (options.type) {
            case 'warning':
                return 'bg-gradient-to-br from-yellow-100 to-yellow-200';
            case 'info':
                return 'bg-gradient-to-br from-blue-100 to-blue-200';
            case 'success':
                return 'bg-gradient-to-br from-green-100 to-green-200';
            case 'error':
                return 'bg-gradient-to-br from-red-100 to-red-200';
            default:
                return 'bg-gradient-to-br from-yellow-100 to-yellow-200';
        }
    };

    const getConfirmButtonColor = () => {
        if (!options) return 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:ring-yellow-500';

        switch (options.type) {
            case 'warning':
                return 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:ring-yellow-500';
            case 'info':
                return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500';
            case 'success':
                return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500';
            case 'error':
                return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500';
            default:
                return 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:ring-yellow-500';
        }
    };

    return (
        <DialogContext.Provider value={{ showDialog, hideDialog }}>
            {children}

            {isOpen && options && (
                <Modal
                    isOpen={isOpen}
                    onClose={handleCancel}
                    title=""
                    size="sm"
                >
                    <div className="relative">
                        {/* Close button */}
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="absolute top-0 left-0 p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center pt-8">
                            {/* Icon with enhanced styling */}
                            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${getIconBackgroundColor()} mb-6 shadow-lg`}>
                                {getIcon()}
                            </div>

                            {/* Title with better typography */}
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                                {options.title}
                            </h3>

                            {/* Message with better spacing */}
                            <div className="mb-8">
                                <p className="text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
                                    {options.message}
                                </p>
                            </div>

                            {/* Enhanced Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[120px]"
                                >
                                    {options.cancelText || 'إلغاء'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={isLoading}
                                    className={`px-6 py-3 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[120px] shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${getConfirmButtonColor()}`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                                            جاري المعالجة...
                                        </div>
                                    ) : (
                                        options.confirmText || 'تأكيد'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </DialogContext.Provider>
    );
}

// Convenience functions for different dialog types
export const useDialogHelpers = () => {
    const { showDialog } = useConfirmDialog();

    const confirmDelete = useCallback((
        itemName: string,
        onConfirm: () => void | Promise<void>,
        onCancel?: () => void
    ) => {
        showDialog({
            title: 'تأكيد الحذف',
            message: `هل أنت متأكد من حذف ${itemName}؟ لا يمكن التراجع عن هذا الإجراء.`,
            type: 'error',
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            onConfirm,
            onCancel,
        });
    }, [showDialog]);

    const confirmAction = useCallback((
        title: string,
        message: string,
        onConfirm: () => void | Promise<void>,
        onCancel?: () => void,
        type: DialogType = 'warning'
    ) => {
        showDialog({
            title,
            message,
            type,
            confirmText: 'تأكيد',
            cancelText: 'إلغاء',
            onConfirm,
            onCancel,
        });
    }, [showDialog]);

    const confirmSuccess = useCallback((
        title: string,
        message: string,
        onConfirm: () => void | Promise<void>,
        onCancel?: () => void
    ) => {
        showDialog({
            title,
            message,
            type: 'success',
            confirmText: 'موافق',
            cancelText: 'إلغاء',
            onConfirm,
            onCancel,
        });
    }, [showDialog]);

    const confirmInfo = useCallback((
        title: string,
        message: string,
        onConfirm: () => void | Promise<void>,
        onCancel?: () => void
    ) => {
        showDialog({
            title,
            message,
            type: 'info',
            confirmText: 'موافق',
            cancelText: 'إلغاء',
            onConfirm,
            onCancel,
        });
    }, [showDialog]);

    return {
        confirmDelete,
        confirmAction,
        confirmSuccess,
        confirmInfo,
    };
};
