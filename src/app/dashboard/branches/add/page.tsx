'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Save, X } from 'lucide-react';
import { useCreateBranch, CreateBranchData } from '@/hooks/useBranches';
import BranchForm from '@/components/branches/BranchForm';

export default function AddBranchPage() {
    const router = useRouter();
    const createBranchMutation = useCreateBranch();

    const handleSubmit = async (data: CreateBranchData) => {
        try {
            await createBranchMutation.mutateAsync(data);
            router.push('/dashboard/branches');
        } catch (error) {
            console.error('Error creating branch:', error);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/branches');
    };

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                    <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="العودة"
                    >
                        <ArrowRight className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">إضافة فرع جديد</h1>
                        <p className="text-gray-600 mt-1">
                            أضف فرع جديد لشركتك مع جميع التفاصيل المطلوبة
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="card max-w-full">
                <BranchForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={createBranchMutation.isPending}
                    error={createBranchMutation.error}
                    mode="add"
                />
            </div>
        </div>
    );
}
