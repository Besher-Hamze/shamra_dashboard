'use client';

import { MapPin, Navigation, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface OrderLocationMapProps {
    location: {
        lat: number;
        lng: number;
    };
    orderNumber?: string;
    className?: string;
}

export default function OrderLocationMap({ location, orderNumber, className = '' }: OrderLocationMapProps) {
    const [copied, setCopied] = useState(false);

    // Validate location coordinates
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return (
            <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
                <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">إحداثيات الموقع غير صحيحة</p>
                </div>
            </div>
        );
    }

    const openInGoogleMaps = () => {
        const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
        window.open(url, '_blank');
    };

    const openInWaze = () => {
        const url = `https://waze.com/ul?ll=${location.lat},${location.lng}&navigate=yes`;
        window.open(url, '_blank');
    };

    const copyCoordinates = async () => {
        const coords = `${location.lat}, ${location.lng}`;
        try {
            await navigator.clipboard.writeText(coords);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy coordinates:', err);
        }
    };

    return (
        <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">موقع الطلب</h3>
                    </div>
                </div>
            </div>

            {/* Location Info */}
            <div className="p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">موقع الطلب</h4>
                    {orderNumber && (
                        <p className="text-sm text-gray-600 mb-4">رقم الطلب: {orderNumber}</p>
                    )}
                </div>

                {/* Location Preview */}
                <div className="mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <MapPin className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-sm text-gray-600 mb-2">الموقع محدد بدقة</p>
                            <p className="text-xs text-gray-500">انقر على الأزرار أدناه للتنقل</p>
                        </div>
                    </div>
                </div>

                {/* Coordinates */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">الإحداثيات</p>
                            <p className="font-mono text-sm text-gray-900">
                                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </p>
                        </div>
                        <button
                            onClick={copyCoordinates}
                            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="نسخ الإحداثيات"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={openInGoogleMaps}
                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ExternalLink className="h-5 w-5 ml-2" />
                        فتح في خرائط جوجل
                    </button>

                    <button
                        onClick={openInWaze}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Navigation className="h-5 w-5 ml-2" />
                        فتح في ويز
                    </button>
                </div>
            </div>
        </div>
    );
}
