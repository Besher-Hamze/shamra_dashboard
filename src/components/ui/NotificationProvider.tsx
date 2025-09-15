'use client';

import React, { ReactNode } from 'react';
import { DialogProvider, useDialogHelpers } from './ConfirmDialog';
import { ToastContainer, useToast, showSuccess, showError, showWarning, showInfo, showLoading, showPromise } from './Toast';

interface NotificationProviderProps {
    children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    return (
        <DialogProvider>
            {children}
            <ToastContainer />
        </DialogProvider>
    );
}

// Re-export all the hooks and components for convenience
export { useToast, showSuccess, showError, showWarning, showInfo, showLoading, showPromise } from './Toast';
export { useConfirmDialog, useDialogHelpers } from './ConfirmDialog';

// Convenience hook that combines both toast and dialog helpers
export const useNotifications = () => {
    const toast = useToast();
    const dialogs = useDialogHelpers();

    return {
        ...toast,
        ...dialogs,
    };
};
