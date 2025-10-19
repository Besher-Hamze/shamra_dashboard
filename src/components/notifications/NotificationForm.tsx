'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Users, User, Search, ChevronDown } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useBroadcastNotification, useCreateNotification } from '@/hooks/useNotifications';

interface NotificationFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function NotificationForm({ onSuccess, onCancel }: NotificationFormProps) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [recipientType, setRecipientType] = useState<'all' | 'specific'>('all');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { users: usersData } = useUsers({ page: 1, limit: 100 });
    const createNotificationMutation = useCreateNotification();
    const broadcastNotificationMutation = useBroadcastNotification();

    const users = usersData || [];

    // Filter users based on search term
    const filteredUsers = users.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const phoneNumber = user.phoneNumber?.toLowerCase();
        const searchTerm = userSearchTerm.toLowerCase();
        return fullName.includes(searchTerm) || phoneNumber?.includes(searchTerm) || '';
    });

    // Get selected user details
    const selectedUser = users.find(user => user.id === selectedUserId);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleUserSelect = (userId: string) => {
        setSelectedUserId(userId);
        setIsUserDropdownOpen(false);
        setUserSearchTerm('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !message.trim()) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        if (recipientType === 'specific' && !selectedUserId) {
            alert('يرجى اختيار مستخدم');
            return;
        }

        if (recipientType === 'all') {
            broadcastNotificationMutation.mutate(
                { title: title.trim(), message: message.trim() },
                {
                    onSuccess: () => {
                        onSuccess?.();
                    }
                }
            );
        } else {
            createNotificationMutation.mutate(
                {
                    title: title.trim(),
                    message: message.trim(),
                    recipientId: selectedUserId
                },
                {
                    onSuccess: () => {
                        onSuccess?.();
                    }
                }
            );
        }
    };

    const isLoading = createNotificationMutation.isPending || broadcastNotificationMutation.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان الإشعار <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    placeholder="أدخل عنوان الإشعار"
                    required
                />
            </div>

            {/* Message */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    نص الإشعار <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-field"
                    rows={4}
                    placeholder="أدخل نص الإشعار"
                    required
                />
            </div>

            {/* Recipient Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع المستلم
                </label>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="all"
                            checked={recipientType === 'all'}
                            onChange={(e) => setRecipientType(e.target.value as 'all')}
                            className="ml-2"
                        />
                        <Users className="h-4 w-4 text-blue-600 ml-2" />
                        <span className="text-sm text-gray-700">جميع المستخدمين</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="specific"
                            checked={recipientType === 'specific'}
                            onChange={(e) => setRecipientType(e.target.value as 'specific')}
                            className="ml-2"
                        />
                        <User className="h-4 w-4 text-green-600 ml-2" />
                        <span className="text-sm text-gray-700">مستخدم محدد</span>
                    </label>
                </div>
            </div>

            {/* User Selection */}
            {recipientType === 'specific' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        اختر المستخدم <span className="text-red-500">*</span>
                    </label>
                    <div className="relative" ref={dropdownRef}>
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                value={userSearchTerm}
                                onChange={(e) => {
                                    setUserSearchTerm(e.target.value);
                                    setIsUserDropdownOpen(true);
                                }}
                                onFocus={() => setIsUserDropdownOpen(true)}
                                className="input-field pr-10"
                                placeholder="ابحث عن مستخدم..."
                                required={recipientType === 'specific' && !selectedUserId}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <ChevronDown
                                className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </div>

                        {/* Selected User Display */}
                        {selectedUser && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">
                                            {selectedUser.firstName} {selectedUser.lastName}
                                        </p>
                                        <p className="text-xs text-blue-600">{selectedUser.phoneNumber || '-'}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedUserId('');
                                            setUserSearchTerm('');
                                        }}
                                        className="text-blue-400 hover:text-blue-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Dropdown List */}
                        {isUserDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => handleUserSelect(user.id)}
                                            className="w-full px-4 py-3 text-right hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{user.phoneNumber || '-'}</p>
                                                </div>
                                                <User className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-center text-gray-500 text-sm">
                                        لا توجد نتائج
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary"
                        disabled={isLoading}
                    >
                        إلغاء
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2 space-x-reverse"
                >
                    <Send className="h-4 w-4" />
                    <span>{isLoading ? 'جاري الإرسال...' : 'إرسال الإشعار'}</span>
                </button>
            </div>
        </form>
    );
}
