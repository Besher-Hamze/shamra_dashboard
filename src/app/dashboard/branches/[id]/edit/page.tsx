'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Save, X, Loader2 } from 'lucide-react';
import { useBranch, useUpdateBranch, CreateBranchData } from '@/hooks/useBranches';
import BranchForm from '@/components/branches/BranchForm';

export default function EditBranchPage() {
    const router = useRouter();
    const params = useParams();
    const branchId = params.id as string;

    const { data: branch, isLoading: loadingBranch, error: loadError } = useBranch(branchId);
    const updateBranchMutation = useUpdateBranch();

    const handleSubmit = async (data: CreateBranchData) => {
        try {
            await updateBranchMutation.mutateAsync({ ...data, id: branchId });
            router.push('/dashboard/branches');
        } catch (error) {
            console.error('Error updating branch:', error);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/branches');
    };

    if (loadingBranch) {
        return (
            <div className="animate-fade-in">
                <div className="flex items-center justify-center min-h-96">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-gray-600">جاري تحميل بيانات الفرع...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (loadError || !branch) {
        return (
            <div className="animate-fade-in">
                <div className="text-center py-12">
                    <div className="text-red-600 mb-4">
                        {loadError ? 'حدث خطأ في تحميل بيانات الفرع' : 'الفرع غير موجود'}
                    </div>
                    <button
                        onClick={handleCancel}
                        className="btn-primary"
                    >
                        العودة إلى قائمة الفروع
                    </button>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-2xl font-bold text-gray-900">تعديل الفرع</h1>
                        <p className="text-gray-600 mt-1">
                            تعديل بيانات فرع "{branch.name}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="card max-w-6xl">
                <BranchForm
                    branch={branch}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={updateBranchMutation.isPending}
                    error={updateBranchMutation.error}
                    mode="edit"
                />
            </div>
        </div>
    );
}
