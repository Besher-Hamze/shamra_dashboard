'use client';

import toast, { Toaster, ToastOptions } from 'react-hot-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

// Custom toast components for different types
const SuccessToast = ({ message, title }: { message?: string; title: string }) => (
    <div className="flex items-start space-x-3 space-x-reverse bg-white border-l-4 border-green-500 rounded-lg shadow-xl p-4 max-w-sm backdrop-blur-sm">
        <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {message && (
                <p className="mt-1 text-sm text-gray-600">{message}</p>
            )}
        </div>
    </div>
);

const ErrorToast = ({ message, title }: { message?: string; title: string }) => (
    <div className="flex items-start space-x-3 space-x-reverse bg-white border-l-4 border-red-500 rounded-lg shadow-xl p-4 max-w-sm backdrop-blur-sm">
        <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {message && (
                <p className="mt-1 text-sm text-gray-600">{message}</p>
            )}
        </div>
    </div>
);

const WarningToast = ({ message, title }: { message?: string; title: string }) => (
    <div className="flex items-start space-x-3 space-x-reverse bg-white border-l-4 border-yellow-500 rounded-lg shadow-xl p-4 max-w-sm backdrop-blur-sm">
        <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {message && (
                <p className="mt-1 text-sm text-gray-600">{message}</p>
            )}
        </div>
    </div>
);

const InfoToast = ({ message, title }: { message?: string; title: string }) => (
    <div className="flex items-start space-x-3 space-x-reverse bg-white border-l-4 border-blue-500 rounded-lg shadow-xl p-4 max-w-sm backdrop-blur-sm">
        <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600" />
            </div>
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {message && (
                <p className="mt-1 text-sm text-gray-600">{message}</p>
            )}
        </div>
    </div>
);

// Toast helper functions
export const showSuccess = (title: string, message?: string, options?: ToastOptions) => {
    return toast.custom(
        (t) => (
            <div className={`transform transition-all duration-500 ease-out ${t.visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}`}>
                <SuccessToast title={title} message={message} />
            </div>
        ),
        {
            duration: 3000,
            position: 'top-left',
            ...options,
        }
    );
};

export const showError = (title: string, message?: string, options?: ToastOptions) => {
    return toast.custom(
        (t) => (
            <div className={`transform transition-all duration-500 ease-out ${t.visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}`}>
                <ErrorToast title={title} message={message} />
            </div>
        ),
        {
            duration: 5000,
            position: 'top-left',
            ...options,
        }
    );
};

export const showWarning = (title: string, message?: string, options?: ToastOptions) => {
    return toast.custom(
        (t) => (
            <div className={`transform transition-all duration-500 ease-out ${t.visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}`}>
                <WarningToast title={title} message={message} />
            </div>
        ),
        {
            duration: 3000,
            position: 'top-left',
            ...options,
        }
    );
};

export const showInfo = (title: string, message?: string, options?: ToastOptions) => {
    return toast.custom(
        (t) => (
            <div className={`transform transition-all duration-500 ease-out ${t.visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}`}>
                <InfoToast title={title} message={message} />
            </div>
        ),
        {
            duration: 3500,
            position: 'top-left',
            ...options,
        }
    );
};

// Loading toast
export const showLoading = (message: string) => {
    return toast.loading(message, {
        position: 'top-left',
    });
};

// Promise toast
export const showPromise = <T,>(
    promise: Promise<T>,
    messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
    }
) => {
    return toast.promise(promise, messages, {
        position: 'top-left',
        duration: 3000,
    });
};

// Hook for easy access
export const useToast = () => {
    return {
        success: showSuccess,
        error: showError,
        warning: showWarning,
        info: showInfo,
        loading: showLoading,
        promise: showPromise,
        dismiss: toast.dismiss,
        remove: toast.remove,
    };
};

// Toast container component
export function ToastContainer() {
    return (
        <Toaster
            position="top-left"
            reverseOrder={false}
            gutter={12}
            containerClassName="!top-4 !right-4"
            containerStyle={{
                zIndex: 9999,
            }}
            toastOptions={{
                // Default options for all toasts
                duration: 3000,
                style: {
                    background: 'transparent',
                    boxShadow: 'none',
                    padding: 0,
                    margin: 0,
                },
                // Success options
                success: {
                    duration: 3000,
                },
                // Error options
                error: {
                    duration: 5000,
                },
                // Loading options
                loading: {
                    duration: Infinity,
                },
            }}
        />
    );
}

// Export all toast functions for convenience
export { toast };