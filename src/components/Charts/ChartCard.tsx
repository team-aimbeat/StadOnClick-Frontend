// components/ui/charts/DualBarChart.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { HiOutlineArrowRight } from 'react-icons/hi2';

interface BarData {
  day: string;
  value1: number;
  value2: number;
  label1?: string;
  label2?: string;
}

interface DualBarChartProps {
  title?: string;
  value?: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  data: BarData[];
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  showValues?: boolean;
  className?: string;
  barWidth?: number;
  gap?: number;
  primaryLabel?: string;
  secondaryLabel?: string;
  showLegend?: boolean;
  showReportButton?: boolean;
  periodOptions?: string[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  onViewReport?: () => void;
}

  export const bookingsData = [
    { day: '01', value1: 3456, value2: 3200, label1: '3,456', label2: '3,200' },
    { day: '02', value1: 4567, value2: 4200, label1: '4,567', label2: '4,200' },
    { day: '03', value1: 2890, value2: 3100, label1: '2,890', label2: '3,100' },
    { day: '04', value1: 5123, value2: 4800, label1: '5,123', label2: '4,800' },
    { day: '05', value1: 4789, value2: 4500, label1: '4,789', label2: '4,500' },
    { day: '06', value1: 6123, value2: 5500, label1: '6,123', label2: '5,500' },
    { day: '07', value1: 5345, value2: 5000, label1: '5,345', label2: '5,000' },
    { day: '08', value1: 4678, value2: 4300, label1: '4,678', label2: '4,300' },
    { day: '09', value1: 3890, value2: 3700, label1: '3,890', label2: '3,700' },
    { day: '10', value1: 5456, value2: 5200, label1: '5,456', label2: '5,200' },
    { day: '11', value1: 4789, value2: 4600, label1: '4,789', label2: '4,600' },
    { day: '12', value1: 6234, value2: 5800, label1: '6,234', label2: '5,800' },
  ];


const ChartCard: React.FC<DualBarChartProps> = ({
  title = "Bookings Trend",
  value = "3,456,773",
  trend = {
    value: 21,
    isPositive: true,
    label: "vs last week"
  },
  data,
  height = 180,
  primaryColor = '#8789FF',
  secondaryColor = '#C8CFFF',
  showValues = false,
  className,
  barWidth = 14,
  gap = 6,
  primaryLabel = 'Current',
  secondaryLabel = 'Previous',
  showLegend = true,
  showReportButton = true,
  periodOptions = ['Last Week'],
  activePeriod = 'Last 6 days',
  onPeriodChange,
  onViewReport,
}) => {
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.value1, d.value2))
  );
  
  const calculateHeight = (value: number) => {
    return (value / maxValue) * (height - 50);
  };

  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full",
                trend.isPositive
                  ? "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                  : "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
              )}>
                <span className="text-xs">{trend.isPositive ? '↑' : '↓'}</span>
                <span>{trend.value}%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right side with period selector and report button */}
        <div className="flex items-center gap-4">
          {/* Period Selector */}
         

          {/* Report Button */}
          {showReportButton && (
  <button
    onClick={onViewReport}
    className="flex items-center gap-2 px-4 py-2
               bg-[#3289FF] hover:bg-[#1F73E8]
               text-white rounded-lg
               font-medium text-sm
               transition-colors"
  >
    View Report
  </button>
)}

        </div>
      </div>

      {/* Chart Container */}
      <div 
        className="relative flex items-end justify-between"
        style={{ height }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 0.25, 0.5, 0.75, 1].map((percent, index) => (
            <div
              key={index}
              className="border-t border-gray-200 dark:border-gray-800"
              style={{ bottom: `${percent * 100}%` }}
            />
          ))}
        </div>

        {/* Bars */}
        {data.map((item, index) => {
          const bar1Height = calculateHeight(item.value1);
          const bar2Height = calculateHeight(item.value2);
          
          return (
            <div
              key={index}
              className="flex flex-col items-center relative"
              style={{ width: `${100 / data.length}%` }}
            >
              {/* Bars container */}
              <div 
                className="flex items-end relative"
                style={{ gap: `${gap}px` }}
              >
                {/* Primary Bar (value1) */}
                <div className="flex flex-col items-center">
                  {showValues && (
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {item.label1 || item.value1.toLocaleString()}
                    </div>
                  )}
                  <div
                    className="rounded-t-md transition-all duration-300 hover:opacity-90 cursor-pointer"
                    style={{
                      width: `${barWidth}px`,
                      height: `${bar1Height}px`,
                      backgroundColor: primaryColor,
                      minHeight: '2px',
                    }}
                    title={`${primaryLabel}: ${item.value1.toLocaleString()}`}
                  />
                </div>

                {/* Secondary Bar (value2) */}
                <div className="flex flex-col items-center">
                  {showValues && (
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {item.label2 || item.value2.toLocaleString()}
                    </div>
                  )}
                  <div
                    className="rounded-t-md transition-all duration-300 hover:opacity-90 cursor-pointer"
                    style={{
                      width: `${barWidth}px`,
                      height: `${bar2Height}px`,
                      backgroundColor: secondaryColor,
                      minHeight: '2px',
                    }}
                    title={`${secondaryLabel}: ${item.value2.toLocaleString()}`}
                  />
                </div>
              </div>

              {/* Day label */}
              <div className="mt-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                {item.day}
              </div>
            </div>
          );
        })}
      </div>

      
      {/* Legend */}
      {showLegend && (
        <div className="flex items-center mt-10 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-xl" 
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {activePeriod}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-xl" 
              style={{ backgroundColor: secondaryColor }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {periodOptions}
            </span>
          </div>
        </div>
      )}


    </div>
  );
};

export default ChartCard;