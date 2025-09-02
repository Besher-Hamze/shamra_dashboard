'use client';

import { ReactNode } from 'react';

interface TableProps {
    children: ReactNode;
}

interface TableHeaderProps {
    children: ReactNode;
}

interface TableBodyProps {
    children: ReactNode;
}

interface TableRowProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
}

interface TableCellProps {
    children: ReactNode;
    className?: string;
}

interface TableHeadProps {
    children: ReactNode;
    className?: string;
}

export function Table({ children }: TableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children }: TableHeaderProps) {
    return (
        <thead className="bg-gray-50">
            {children}
        </thead>
    );
}

export function TableBody({ children }: TableBodyProps) {
    return (
        <tbody className="bg-white divide-y divide-gray-200">
            {children}
        </tbody>
    );
}

export function TableRow({ children, onClick, className = '' }: TableRowProps) {
    return (
        <tr
            className={`hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </tr>
    );
}

export function TableHead({ children, className = '' }: TableHeadProps) {
    return (
        <th className={`table-header ${className}`}>
            {children}
        </th>
    );
}

export function TableCell({ children, className = '' }: TableCellProps) {
    return (
        <td className={`table-cell ${className}`}>
            {children}
        </td>
    );
}
