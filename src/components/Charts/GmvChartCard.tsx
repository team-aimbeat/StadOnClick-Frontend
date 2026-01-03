// components/ui/cards/GmvCard.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { HiOutlineCurrencyDollar } from 'react-icons/hi2';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface GmvCardProps {
  title?: string;
  value?: string | number;
  percentage?: number;
  periodLabel?: string;
  trend?: 'up' | 'down';
  className?: string;
  currency?: string;
  showChart?: boolean;
  chartData?: Array<{ day: string; value: number }>;
}

  // Custom chart data for GMV card
 export const gmvChartData = [
    { day: '1', value: 12456 },
    { day: '2', value: 13450 },
    { day: '3', value: 2111890 },
    { day: '4', value: 14560 },
    { day: '5', value: 13210 },
    { day: '6', value: 15670 },
    { day: '7', value: 4000230 },
    { day: '8', value: 16540 },
    { day: '9', value: 15210 },
    { day: '10', value: 17890 },
    { day: '11', value: 16450 },
    { day: '12', value: 19210 },
  ];


const GmvCard: React.FC<GmvCardProps> = ({
  title = "GMV today",
  value = "$1,24,560",
  percentage = 1.01,
  periodLabel = "last month",
  trend = 'up',
  className,
  currency = "$",
  showChart = true,
  chartData = [
    { day: '1', value: 40000 },
    { day: '2', value: 3000 },
    { day: '3', value: 5000 },
    { day: '4', value: 2780 },
    { day: '5', value: 1890 },
    { day: '6', value: 2390 },
    { day: '7', value: 3490 },
    { day: '8', value: 4300 },
    { day: '9', value: 4100 },
    { day: '10', value: 4900 },
    { day: '11', value: 4500 },
    { day: '12', value: 5200 },
  ],
}) => {
  // Format the value properly (Indian numbering system)
  const formatIndianNumber = (num: number): string => {
    if (num >= 100000) {
      const lakhs = num / 100000;
      return `${currency}${lakhs.toFixed(2)} L`;
    }
    
    const numStr = num.toString();
    const lastThree = numStr.slice(-3);
    const otherNumbers = numStr.slice(0, -3);
    
    if (otherNumbers !== '') {
      return `${currency}${otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}`;
    }
    
    return `${currency}${lastThree}`;
  };

  const formattedValue = typeof value === 'number' 
    ? formatIndianNumber(value)
    : value;

  const isPositive = trend === 'up';
  
  // Calculate max value for Y-axis
  const maxValue = Math.max(...chartData.map(d => d.value));
  const yAxisDomain = [0, maxValue * 1.2]; // Add 20% padding

  return (
    <div className={cn(
      "bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800",
      "shadow-sm hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Header with title and icon */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-base font-medium text-gray-600 dark:text-gray-400">
            {title}
          </h3>
          
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            <HiOutlineCurrencyDollar className="w-5 h-5" />
          </div>
        </div>

        {/* Main value - Large and prominent */}
        <div className="mb-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formattedValue}
          </div>
        </div>

        {/* Percentage and trend indicator - Compact and aligned */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            {/* Trend indicator with colored background */}
            <div className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full",
              isPositive 
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500" 
                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500"
            )}>
              <span className="text-xs font-bold">{isPositive ? '↑' : '↓'}</span>
            </div>
            
            {/* Percentage and period label in one line */}
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-sm font-semibold",
                isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
              )}>
                {isPositive ? '+' : ''}{percentage}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                {periodLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Line Chart */}
        {showChart && (
          <div className="mt-auto" style={{ width: '100%', height: 60 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              >
                {/* Grid lines */}
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  strokeOpacity={0.3}
                  horizontal={false}
                  vertical={false}
                />
                
                {/* X-axis with day labels */}
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  interval={1}
                />
                
                {/* Y-axis (hidden but sets scale) */}
                <YAxis 
                  domain={yAxisDomain}
                  axisLine={false}
                  tickLine={false}
                  tick={false}
                />
                
                {/* Tooltip on hover */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#374151' }}
                  formatter={(value) => [`${currency}${value}`, 'Value']}
                />
                
                {/* Main line */}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#3b82f6",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default GmvCard;