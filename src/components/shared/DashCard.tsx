import React from 'react';
import clsx from 'clsx';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import type { IconType } from 'react-icons';

type SplitItem = {
    label: string;
    value: number | string;
    color: string;
};

type DashCardProps = {
    icon?: React.ReactNode;
    title?: number | string;
    value?: number | string;
    active?: boolean;
    percentage?: string;
    subText?: string;
    onClick?: () => void;
    className?: string;
    bgColor?: string;
    topRightText?: string;
    type?: string; // "split" or default
    split?: SplitItem[]; // 👈 unified
    live?: boolean;
    height?: Number;
};

const DashCard: React.FC<DashCardProps> = ({ icon, title, value, percentage,height = 150, subText, onClick, className, active = false, topRightText, type, split, live }) => {
    let percNum: number | undefined;
    let isPositive: boolean | undefined;
    let percentageDisplay: string | undefined;
    let IconComponent: IconType | null = null;

    if (percentage) {
        percNum = parseFloat(percentage);
        isPositive = percNum >= 0;
        percentageDisplay = `${isPositive ? '+' : ''}${percentage}%`;
        IconComponent = isPositive ? MdTrendingUp : MdTrendingDown;
    }

    return (
        <div
            onClick={onClick}
            className={clsx(
                `flex flex-col justify-between 
         p-3 sm:p-4 md:p-5 min-h-[${height}px]
         rounded-2xl sm:rounded-3xl 
         select-none
         cursor-pointer 
         min-w-[140px] sm:min-w-[160px] md:min-w-[180px] 
         dark:bg-primary-black
         transition-all duration-200 ${active ? 'bg-primary-black text-white' : 'bg-primary-white hover:bg-primary-black'}
         hover:scale-[1.03] sm:hover:scale-105 
         hover:shadow-md 
         text-primary-black dark:text-white group
         hover:text-white dark:hover:text-white`,
                className
            )}
        >
            {/* Top Row: Title + Icon on left, TopRightText on right */}
            <div className="flex items-center justify-between w-full relative">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base font-medium opacity-80 dark:opacity-90">
                    {icon && <span className={clsx(`text-base sm:text-lg md:text-xl`, active ? 'text-secondary-blue' : 'group-hover:text-secondary-blue')}>{icon}</span>}
                    {title}
                </div>

                {topRightText ? (
                    <div className="text-xs sm:text-sm md:text-base font-medium opacity-70 dark:opacity-80">{topRightText}</div>
                ) : live ? (
                    <span className="flex items-center  gap-2 text-xs sm:text-sm md:text-base font-medium opacity-70 dark:opacity-80">
                        <span>Live</span>
                        <span className='relative flex w-2 h-2'>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full w-2 h-2 bg-green-500"></span>
                        </span>
                    </span>
                ) : null}
            </div>

            {type === 'split' && split ? (
                <div className={`grid grid-cols-${split.length} gap-4 text-center mt-2 w-full`}>
                    {split.map((item, i) => (
                        <div key={i}>
                            <div className={`text-lg sm:text-xl md:text-2xl font-bold `}>{item.value}</div>
                            <div className="text-gray-400 dark:text-gray-300 whitespace-nowrap">{item.label}</div>
                        </div>
                    ))}
                </div>
            ) : (
                /*   Value + Percentage */
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="mt-1 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-semibold">{value}</div>

                    {/* Percentage & Subtext */}
                    <div
                        className={clsx(
                            `text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1 flex items-center`,
                            isPositive ? 'text-secondary-green dark:text-green-400' : 'text-red-500 dark:text-red-400',
                            'dark:hover:text-blue-500'
                        )}
                    >
                        {percentage && IconComponent && (
                            <>
                                <IconComponent className="mr-1 text-base sm:text-lg" />
                                <span>{percentageDisplay}</span>
                            </>
                        )}
                        {subText && <span className="ml-1 text-gray-400 dark:text-gray-300 whitespace-nowrap">{subText}</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashCard;
