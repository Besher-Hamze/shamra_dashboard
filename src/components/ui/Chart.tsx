'use client';

import { useMemo } from 'react';

interface ChartData {
    label: string;
    value: number;
    color?: string;
}

interface SimpleBarChartProps {
    data: ChartData[];
    title?: string;
    height?: number;
}

export const SimpleBarChart = ({ data, title, height = 200 }: SimpleBarChartProps) => {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {title && (
                <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            )}
            <div className="space-y-4" style={{ height }}>
                {data.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <div className="w-20 text-sm text-gray-600 flex-shrink-0">
                            {item.label}
                        </div>
                        <div className="flex-1 mx-4">
                            <div className="bg-gray-200 rounded-full h-4 relative">
                                <div
                                    className="h-4 rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${(item.value / maxValue) * 100}%`,
                                        backgroundColor: item.color || '#3B82F6'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="w-16 text-sm font-medium text-gray-900 text-left">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface SimplePieChartProps {
    data: ChartData[];
    title?: string;
    size?: number;
}

export const SimplePieChart = ({ data, title, size = 200 }: SimplePieChartProps) => {
    const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

    const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
    ];

    let cumulativePercentage = 0;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {title && (
                <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            )}
            <div className="flex items-center justify-between">
                <div className="relative" style={{ width: size, height: size }}>
                    <svg width={size} height={size} className="transform -rotate-90">
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={size / 2 - 10}
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="20"
                        />
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const strokeDasharray = `${percentage * 2.83} 283`;
                            const strokeDashoffset = -cumulativePercentage * 2.83;
                            const color = item.color || colors[index % colors.length];

                            cumulativePercentage += percentage;

                            return (
                                <circle
                                    key={index}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={size / 2 - 10}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="20"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-500 ease-out"
                                />
                            );
                        })}
                    </svg>
                </div>
                <div className="flex-1 mr-6 space-y-2">
                    {data.map((item, index) => {
                        const percentage = ((item.value / total) * 100).toFixed(1);
                        const color = item.color || colors[index % colors.length];

                        return (
                            <div key={index} className="flex items-center">
                                <div
                                    className="w-4 h-4 rounded-full ml-2"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {item.value} ({percentage}%)
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

interface SimpleLineChartProps {
    data: { label: string; value: number }[];
    title?: string;
    height?: number;
    color?: string;
}

export const SimpleLineChart = ({ data, title, height = 200, color = '#3B82F6' }: SimpleLineChartProps) => {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
    const minValue = useMemo(() => Math.min(...data.map(d => d.value)), [data]);
    const range = maxValue - minValue || 1;

    const points = data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((item.value - minValue) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {title && (
                <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            )}
            <div className="relative" style={{ height }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                        </linearGradient>
                    </defs>

                    {/* Area under curve */}
                    <polygon
                        points={`0,100 ${points} 100,100`}
                        fill="url(#gradient)"
                    />

                    {/* Line */}
                    <polyline
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        className="transition-all duration-500 ease-out"
                    />

                    {/* Data points */}
                    {data.map((item, index) => {
                        const x = (index / (data.length - 1)) * 100;
                        const y = 100 - ((item.value - minValue) / range) * 100;
                        return (
                            <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="2"
                                fill={color}
                                className="transition-all duration-500 ease-out"
                            />
                        );
                    })}
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                    {data.map((item, index) => (
                        <span key={index} className="transform -translate-x-1/2">
                            {item.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
