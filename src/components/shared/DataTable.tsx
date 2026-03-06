import { Check, ChevronDown, Columns, X, Calendar, Filter, AlertCircle } from 'lucide-react';
import React, { ReactNode, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { ActionConfig } from '../../types/Table/action';
import dayjs from 'dayjs';

// Type definitions (unchanged)
export type RowData = Record<string, any>;
type SortDirection = 'asc' | 'desc';
type FilterOption = { label: string; value: string };
const NOOP = () => {};

export interface DataTableSortStatus {
    columnAccessor: string;
    direction: SortDirection;
}

export interface ColumnConfig {
    key: string;
    title: string | ReactNode;
    render?: (value: any, row: RowData, index: number) => ReactNode;
    sortable?: boolean;
    breadCrumbTitle?: string;
    align?: 'left' | 'center' | 'right';
    headerClassName?: string;
    cellClassName?: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
}

export interface SortOption {
    key: string;
    label: string;
}

interface ControlledPagination {
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
}

// Reusable Dropdown Component (fixed: moved handleClickOutside outside useEffect)
interface DropdownProps {
    isOpen: boolean;
    onToggle: () => void;
    trigger: ReactNode;
    children: ReactNode;
    className?: string;
}

const Dropdown: React.FC<DropdownProps> = React.memo(({ isOpen, onToggle, trigger, children, className = '' }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Moved outside: handleClickOutside with proper deps
    const handleClickOutside = useCallback((event: MouseEvent) => {
        const target = event.target as Node;
        if (dropdownRef.current && !dropdownRef.current.contains(target) && !(target instanceof Element && target.closest('.MuiPickersPopper-root'))) {
            onToggle();
        }
    }, [onToggle]);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);  // Now stable

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <div onClick={onToggle}>{trigger}</div>
            {isOpen && <div className="absolute right-0 top-full mt-1 z-50">{children}</div>}
        </div>
    );
});
Dropdown.displayName = 'Dropdown';

// Custom Checkbox Component (memoized, unchanged)
interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

const CustomCheckbox: React.FC<CheckboxProps> = React.memo(({ checked, onChange, className = '' }) => {
    return (
        <div className={`relative ${className}`}>
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
            <div
                onClick={() => onChange(!checked)}
                className={`w-4 h-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                    checked ? 'bg-primary-red border-primary-red shadow-sm' : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
            >
                {checked && <Check className="w-3 h-3 text-white" />}
            </div>
        </div>
    );
});
CustomCheckbox.displayName = 'CustomCheckbox';

// Skeleton Loader Row (memoized, unchanged)
const SkeletonRow: React.FC<{ columns: ColumnConfig[]; showSerialNumber?: boolean; selectable?: boolean }> = React.memo(({ columns, showSerialNumber, selectable }) => (
    <tr>
        {selectable && (
            <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4"></div>
            </td>
        )}
        {showSerialNumber && (
            <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
            </td>
        )}
        {columns.map((_, index) => (
            <td key={index} className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            </td>
        ))}
    </tr>
));
SkeletonRow.displayName = 'SkeletonRow';

// Loading Overlay (memoized, unchanged)
const LoadingOverlay: React.FC<{ title?: string }> = React.memo(({ title }) => {
    const resolvedTitle = title ?? 'Data Table';

    return (
        <div className="absolute inset-0 flex flex-col bg-white rounded-lg shadow-sm transition-opacity duration-300 ease-in-out opacity-100 z-10">
            <div className="flex flex-col items-center justify-center py-4">
                <div className="relative flex items-center justify-center mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-red"></div>
                    <div className="absolute h-8 w-8 rounded-full bg-orange-500/20 animate-pulse"></div>
                </div>
                <p className="text-lg font-medium text-gray-700 animate-pulse">Fetching {resolvedTitle}...</p>
            </div>
        </div>
    );
});
LoadingOverlay.displayName = 'LoadingOverlay';

// Error Message Component (memoized, unchanged)
const ErrorMessage: React.FC<{ error: string | null; onDismiss?: () => void }> = React.memo(({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="relative flex items-start gap-3 p-4 mx-3  rounded-2xl my-2 bg-red-50 border border-red-200 text-red-800 animate-fadeIn">
      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
      <p className="text-sm font-medium leading-snug">{error}</p>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-100 transition-colors"
        >
          <X className="w-4 h-4 text-red-500" />
        </button>
      )}
    </div>
  );
});
ErrorMessage.displayName = 'ErrorMessage';

// Quick Calendar Dropdown Component (memoized, unchanged)
interface QuickCalendarDropdownProps {
    onDateSelect: (date: string) => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    setDateRange: (range: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => void;
}

const QuickCalendarDropdown: React.FC<QuickCalendarDropdownProps> = React.memo(({ onDateSelect, selectedDate, setSelectedDate, setDateRange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDateSelect = useCallback((rangeType: string) => {
        let startDate = null;
        let endDate = null;

        switch (rangeType) {
            case 'This Week':
                startDate = dayjs().startOf('week');
                endDate = dayjs().endOf('week');
                break;

            case 'Last Week':
                startDate = dayjs().subtract(1, 'week').startOf('week');
                endDate = dayjs().subtract(1, 'week').endOf('week');
                break;

            case 'This Month':
                startDate = dayjs().startOf('month');
                endDate = dayjs().endOf('month');
                break;

            case 'Last Month':
                startDate = dayjs().subtract(1, 'month').startOf('month');
                endDate = dayjs().subtract(1, 'month').endOf('month');
                break;

            default:
                console.log('Unknown range type');
                return;
        }

        const formatted = `${startDate.format('YYYY/MM/DD')} - ${endDate.format('YYYY/MM/DD')}`;

        console.log('Selected date range:', formatted);

        setSelectedDate(formatted);
        onDateSelect(formatted);
        setDateRange([startDate, endDate]);
        setIsOpen(false);
    }, [onDateSelect, setSelectedDate, setDateRange]);

    const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

    const trigger = useMemo(() => (
        <div
            className={`
        px-4 py-2 border border-gray-200 rounded-sm !h-10 cursor-pointer flex items-center justify-between 
        transition-all duration-200 relative group
        ${isOpen ? 'bg-primary-red text-white' : 'bg-primary-white   text-gray-700  hover:text-primary-red'}
      `}
        >
            <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{selectedDate || 'Select date'}</span>
            </div>
            <ChevronDown
                className={`
                    w-4 h-4 transition-transform duration-200 
                    ${isOpen ? 'rotate-180' : ''}
                `}
            />
        </div>
    ), [isOpen, selectedDate]);

    const content = useMemo(() => (
        <div className="p-4 border border-gray-200 rounded-lg shadow-lg bg-white min-w-48 absolute right-0 mt-1 z-50">
            <button onClick={() => handleDateSelect('This Week')} className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors">
                This Week
            </button>
            <button onClick={() => handleDateSelect('Last Week')} className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors">
                Last Week
            </button>
            <button onClick={() => handleDateSelect('This Month')} className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors">
                This Month
            </button>
            <button onClick={() => handleDateSelect('Last Month')} className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors">
                Last Month
            </button>
        </div>
    ), [handleDateSelect]);

    return (
        <Dropdown
            isOpen={isOpen}
            onToggle={toggleOpen}
            trigger={trigger}
            children={content}
        />
    );
});
QuickCalendarDropdown.displayName = 'QuickCalendarDropdown';

// Memoized Filter Dropdown Component (unchanged)
interface FilterDropdownProps {
    filter: FilterConfig;
    isOpen: boolean;
    activeFilters: Record<string, string>;
    onToggle: () => void;
    onFilter: (key: string, value: string) => void;
    onClearFilter: (key: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = React.memo(({ filter, isOpen, activeFilters, onToggle, onFilter, onClearFilter }) => {
    const trigger = useMemo(() => (
        <div
            className={`
    px-4 py-2 border border-gray-200 rounded-sm !h-10 cursor-pointer flex items-center justify-between 
    transition-all duration-200 relative group
    ${isOpen ? 'bg-primary-red text-white' : 'bg-primary-white   text-gray-700  hover:text-primary-red'}
  `}
        >
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{filter.label}</span>
                {activeFilters[filter.key] && (
                    <div className="flex items-center">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{activeFilters[filter.key]}</span>
                        <button
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onClearFilter(filter.key);
                            }}
                            className="ml-1 text-gray-400"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
            <ChevronDown
                className={`
                    w-4 h-4 transition-transform duration-200 
                    ${isOpen ? 'rotate-180' : ''}
                `}
            />
        </div>
    ), [isOpen, filter.label, activeFilters[filter.key], onClearFilter, filter.key]);

    const content = useMemo(() => (
        <div className="p-4 border rounded-lg shadow-md bg-white min-w-48 absolute right-0 mt-1 z-50 -top-6 origin-top-right">
            <div className="space-y-2">
                {filter.options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onFilter(filter.key, option.value)}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors"
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    ), [filter.options, onFilter, filter.key]);

    return (
        <Dropdown
            isOpen={isOpen}
            onToggle={onToggle}
            trigger={trigger}
            children={content}
        />
    );
});
FilterDropdown.displayName = 'FilterDropdown';

// Memoized Column Dropdown Component (unchanged)
interface ColumnDropdownProps {
    isOpen: boolean;
    columns: ColumnConfig[];
    hiddenColumns: string[];
    onToggle: () => void;
    onToggleColumn: (key: string) => void;
}

const ColumnDropdown: React.FC<ColumnDropdownProps> = React.memo(({ isOpen, columns, hiddenColumns, onToggle, onToggleColumn }) => {
    const trigger = useMemo(() => (
        <div
            className={`
    px-4 py-2 border border-gray-200 rounded-sm !h-10 cursor-pointer flex items-center justify-between 
    transition-all duration-200 relative group
    ${isOpen ? 'bg-primary-red text-white' : 'bg-primary-white   text-gray-700  hover:text-primary-red'}
  `}
        >
                <div className="flex items-center space-x-2">
                    <Columns className="w-4 h-4" />
                    <span className="text-sm font-medium">Columns</span>
                </div>
            <ChevronDown
                className={`
                    w-4 h-4 transition-transform duration-200 
                    ${isOpen ? 'rotate-180' : ''}
                `}
            />
        </div>
    ), [isOpen]);

    const content = useMemo(() => (
        <div className="p-4 border border-gray-200 rounded-lg shadow-lg bg-white min-w-48 absolute right-0 mt-1 z-50 -top-2 origin-top-right">
            <div className="space-y-3">
                <div className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Show / Hide columns</div>
                {columns
                    .filter((col) => col.key !== 'select')
                    .map((col) => (
                        <div key={col.key} className="flex items-center justify-between py-1">
                            <span className="text-sm text-gray-700">{typeof col.title === 'string' ? col.title : col.key}</span>
                            <CustomCheckbox checked={!hiddenColumns.includes(col.key)} onChange={(checked: boolean) => onToggleColumn(col.key)} />
                        </div>
                    ))}
            </div>
        </div>
    ), [columns, hiddenColumns, onToggleColumn, ]);

    return (
        <Dropdown
            isOpen={isOpen}
            onToggle={onToggle}
            trigger={trigger}
            children={content}
        />
    );
});
ColumnDropdown.displayName = 'ColumnDropdown';

// Memoized Sort Dropdown Component (unchanged)
interface SortDropdownProps {
    isOpen: boolean;
    sortOptions: SortOption[];
    currentSortStatus: DataTableSortStatus;
    onToggle: () => void;
    onSort: (status: DataTableSortStatus) => void;
    isSortControlled: boolean;
    setSortStatusState: (status: DataTableSortStatus) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = React.memo(({ isOpen, sortOptions, currentSortStatus, onToggle, onSort, isSortControlled, setSortStatusState }) => {
    const handleSortOptionClick = useCallback((option: SortOption) => {
        let newDirection: SortDirection = 'asc';
        const labelLower = option.label.toLowerCase();
        if (labelLower.includes('z-a') || labelLower.includes('newest first') || labelLower.includes('desc')) {
            newDirection = 'desc';
        }
        const newSortStatus: DataTableSortStatus = {
            columnAccessor: option.key,
            direction: newDirection,
        };
        if (!isSortControlled) {
            setSortStatusState(newSortStatus);
        }
        onSort(newSortStatus);
        onToggle(); // Close dropdown
    }, [isSortControlled, setSortStatusState, onSort, onToggle]);

    const trigger = useMemo(() => (
        <div
            className={`
    px-4 py-2 border border-gray-200 rounded-sm !h-10 cursor-pointer flex items-center justify-between 
    transition-all duration-200 relative group
    ${isOpen ? 'bg-primary-red text-white' : 'bg-primary-white   text-gray-700  hover:text-primary-red'}
  `}
        >
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Sort by</span>
                {currentSortStatus.columnAccessor && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {sortOptions.find((opt) => opt.key === currentSortStatus.columnAccessor)?.label} ({currentSortStatus.direction})
                    </span>
                )}
            </div>
            <ChevronDown
                className={`
                    w-4 h-4 transition-transform duration-200 
                    ${isOpen ? 'rotate-180' : ''}
                `}
            />
        </div>
    ), [isOpen, currentSortStatus, sortOptions]);

    const content = useMemo(() => (
        <div className="p-4 border rounded-lg shadow-md bg-white min-w-48 absolute right-0 mt-1 z-50 -top-6 origin-top-right">
            <div className="space-y-2">
                {sortOptions.map((option) => (
                    <button
                        key={option.key}
                        onClick={() => handleSortOptionClick(option)}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors"
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    ), [sortOptions, handleSortOptionClick]);

    return (
        <Dropdown
            isOpen={isOpen}
            onToggle={onToggle}
            trigger={trigger}
            children={content}
        />
    );
});
SortDropdown.displayName = 'SortDropdown';

// Memoized Header Cell Component (unchanged)
interface HeaderCellProps {
    column: ColumnConfig;
    currentSortStatus: DataTableSortStatus;
    onSort: (key: string) => void;
    loading: boolean;
}

const HeaderCell: React.FC<HeaderCellProps> = React.memo(({ column, currentSortStatus, onSort, loading }) => (
    <th
        className={`px-6 py-3 text-xs font-bold text-black uppercase tracking-wider ${
            column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
        } ${column.key === 'jobTitle' ? 'min-w-[200px]' : ''} ${column.headerClassName || ''}`}
    >
        <div
            className={`flex items-center ${
                column.align === 'right'
                    ? 'justify-end'
                    : column.align === 'center'
                      ? 'justify-center'
                      : 'justify-start'
            }`}
        >
            <span>{column.title}</span>
            {column.sortable && (
                <button 
                    onClick={() => onSort(column.key)} 
                    className="ml-1 hover:bg-gray-200 rounded p-1 transition-colors" 
                    disabled={loading}
                >
                    <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                            currentSortStatus.columnAccessor === column.key ? (currentSortStatus.direction === 'desc' ? 'rotate-180' : '') : ''
                        }`}
                    />
                </button>
            )}
        </div>
    </th>
));
HeaderCell.displayName = 'HeaderCell';

// Reusable Data Table Component (main changes: use memoized subcomponents, unchanged otherwise)
export interface DataTableProps {
    title?: string;
    breadCrumbTitle?: string;
    data: RowData[] | { data: RowData[] };
    columns: ColumnConfig[];
    filters?: FilterConfig[];
    sortOptions?: SortOption[];
    searchable?: boolean;
    showSerialNumber?: boolean;
    searchValue?: string;
    searchPlaceholder?: string;
    selectable?: boolean;
    actions?: ActionConfig[];
    rowsPerPageOptions?: number[];
    defaultRowsPerPage?: number;
    initialHiddenColumns?: string[];
    defaultSortColumn?: string;
    sortStatus?: DataTableSortStatus;
    loading?: boolean;
    error?: string | null;
    noRecordText?: string;
    children?: ReactNode;
    onRowSelect?: (selectedRows: string[]) => void;
    onSearch?: (term: string) => void;
    onFilter?: (filters: Record<string, string>) => void;
    onSort?: (sortStatus: DataTableSortStatus) => void;
    onPaginationChange?: (pagination: { page: number; pageSize: number }) => void;
    controlledPagination?: ControlledPagination;
    customRowRenderer?: (row: RowData, index: number) => ReactNode;
    defaultActiveFilters?: Record<string, string>;
    className?: string;
    onDismissError?: () => void;
    minHeight?: number;
    onDateRangeSelect?: (dateRange: string) => void;
    dateControl?: ReactNode;
    showDefaultDateControl?: boolean;
    showFilterButton?: boolean;
    onFilterClick?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
    title = 'Data Table',
    breadCrumbTitle = '',
    data = [],
    columns = [],
    filters = [],
    sortOptions = [],
    searchPlaceholder,
    searchable = false,
    showSerialNumber = true,
    searchValue,
    selectable = true,
    actions = [],
    rowsPerPageOptions = [10, 25, 50],
    defaultRowsPerPage = 10,
    initialHiddenColumns = ['id', 'companyId', 'branchId', 'roleId'],
    defaultSortColumn = 'id',
    sortStatus: controlledSortStatus,
    loading = false,
    error = null,
    noRecordText = 'No data found',
    children,
    onRowSelect = NOOP,
    onSearch = NOOP,
    onFilter = NOOP,
    onSort = NOOP,
    onPaginationChange,
    controlledPagination,
    customRowRenderer = null,
    defaultActiveFilters,
    className = '',
    onDismissError = NOOP,
    minHeight = 200,
    onDateRangeSelect = NOOP,
    dateControl,
    showDefaultDateControl = true,
    showFilterButton = false,
    onFilterClick = NOOP,
}) => {
    const effectiveTitle = title || 'Data Table';
    const resolvedSearchPlaceholder = searchPlaceholder || 'Search...';
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

    // State management - only for non-controlled
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(defaultRowsPerPage);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
        () => defaultActiveFilters || {}
    );
    const [sortStatusState, setSortStatusState] = useState<DataTableSortStatus>({
        columnAccessor: defaultSortColumn,
        direction: 'asc' as SortDirection,
    });
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
    const [hiddenColumns, setHiddenColumns] = useState<string[]>(initialHiddenColumns);
    const [dismissedError, setDismissedError] = useState<boolean>(false);

    // Controlled values
    const isPaginationControlled = !!controlledPagination;
    const controlledPage = controlledPagination?.page || 1;
    const controlledPageSize = controlledPagination?.pageSize || defaultRowsPerPage;
    const controlledTotalPages = controlledPagination?.totalPages || 1;
    const controlledTotalRecords = controlledPagination?.totalRecords || 0;

    const isSortControlled = !!controlledSortStatus;
    const currentSortStatus = isSortControlled ? controlledSortStatus : sortStatusState;

    // Normalize data
    const safeData: RowData[] = useMemo(() => {
        return Array.isArray(data) ? data : (data as any)?.data && Array.isArray((data as any).data) ? (data as any).data : [];
    }, [data]);

    const inputRef = useRef<HTMLInputElement | null>(null);

    // Sync default filters when provided
    useEffect(() => {
        if (defaultActiveFilters) {
            setActiveFilters(defaultActiveFilters);
            if (!isPaginationControlled) {
                setCurrentPage(1);
            }
            onFilter(defaultActiveFilters);
        }
    }, [defaultActiveFilters, isPaginationControlled, onFilter]);

    // Memoized visible columns
    const visibleColumns = useMemo(() => 
        columns.filter((col) => !hiddenColumns.includes(col.key)),
    [columns, hiddenColumns]);

    // Memoized toggleDropdown
    const toggleDropdown = useCallback((key: string): void => {
        setOpenDropdowns((prev) => {
            if (prev[key]) {
                return {};
            }
            return { [key]: true };
        });
    }, []);

    // Memoized handlers for stability
    const handleSearchInternal = useCallback((term: string): void => {
        if (isPaginationControlled) {
            onSearch(term);
        } else {
            setSearchTerm(term);
            setCurrentPage(1);
            onSearch(term);
        }
    }, [isPaginationControlled, onSearch]);

    const handleFilter = useCallback((filterKey: string, value: string): void => {
        const newFilters = { ...activeFilters, [filterKey]: value };
        setActiveFilters(newFilters);
        if (!isPaginationControlled) setCurrentPage(1);
        onFilter(newFilters);
        setOpenDropdowns({});
    }, [activeFilters, isPaginationControlled, onFilter]);

    const clearFilter = useCallback((filterKey: string): void => {
        const newFilters = { ...activeFilters };
        delete newFilters[filterKey];
        setActiveFilters(newFilters);
        onFilter(newFilters);
        setOpenDropdowns({});
    }, [activeFilters, onFilter]);

    const toggleColumnVisibility = useCallback((columnKey: string): void => {
        setHiddenColumns((prev) => (prev.includes(columnKey) ? prev.filter((c) => c !== columnKey) : [...prev, columnKey]));
        setOpenDropdowns({});
    }, []);

    const handleSortInternal = useCallback((key: string): void => {
        let newDirection: SortDirection;
        if (currentSortStatus.columnAccessor === key) {
            newDirection = currentSortStatus.direction === 'asc' ? 'desc' : 'asc';
        } else {
            if (key === 'createdAt') {
                newDirection = 'desc';
            } else {
                newDirection = 'asc';
            }
        }

        const newSortStatus: DataTableSortStatus = {
            columnAccessor: key,
            direction: newDirection,
        };

        if (!isSortControlled) {
            setSortStatusState(newSortStatus);
        }
        onSort(newSortStatus);
        setOpenDropdowns({});
    }, [currentSortStatus, isSortControlled, onSort]);

    const handleRowSelect = useCallback((rowId: string): void => {
        const newSelectedRows: string[] = selectedRows.includes(rowId) ? selectedRows.filter((id) => id !== rowId) : [...selectedRows, rowId];
        setSelectedRows(newSelectedRows);
        onRowSelect(newSelectedRows);
    }, [selectedRows, onRowSelect]);

    const handleSelectAll = useCallback((): void => {
        const allIds: string[] = safeData.map((row) => row.id as string);
        const newSelectedRows: string[] = selectedRows.length === safeData.length ? [] : allIds;
        setSelectedRows(newSelectedRows);
        onRowSelect(newSelectedRows);
    }, [safeData, selectedRows, onRowSelect]);

    const handlePageChange = useCallback((newPage: number) => {
        if (onPaginationChange && controlledPagination) {
            onPaginationChange({ page: newPage, pageSize: controlledPageSize });
        } else if (!isPaginationControlled) {
            setCurrentPage(newPage);
        }
    }, [onPaginationChange, controlledPagination, controlledPageSize, isPaginationControlled]);

    const handlePageSizeChange = useCallback((newSize: number) => {
        const newPage = isPaginationControlled ? 1 : Math.max(1, currentPage);
        if (onPaginationChange && controlledPagination) {
            onPaginationChange({ page: newPage, pageSize: newSize });
        } else if (!isPaginationControlled) {
            setRowsPerPage(newSize);
            setCurrentPage(newPage);
        }
    }, [onPaginationChange, controlledPagination, isPaginationControlled, currentPage]);

    // Normalized search term for local filtering (trim and collapse spaces)
    const normalizedSearchTerm = useMemo(() => (searchTerm || '').trim().replace(/\s+/g, ' ').toLowerCase(), [searchTerm]);

    // Filtered and sorted data - fixed for controlled mode, use JSON.stringify for activeFilters to stabilize
    const activeFiltersString = useMemo(() => JSON.stringify(activeFilters), [activeFilters]);
    const processedData = useMemo((): RowData[] => {
        if (isPaginationControlled) {
            return safeData;
        }

        // Never mutate source arrays from props/RTK Query cache.
        let filtered: RowData[] = [...safeData];

        if (searchTerm && searchable) {
            filtered = filtered.filter((row) =>
                visibleColumns.some((col) => {
                    const value = row[col.key];
                    return value && value.toString().toLowerCase().includes(normalizedSearchTerm);
                })
            );
        }

        // Use activeFiltersString if needed, but since deps use string, it's stable
        Object.keys(activeFilters).forEach((filterKey) => {
            const filterValue = activeFilters[filterKey];
            if (filterValue && filterValue !== 'all') {
                filtered = filtered.filter((row) => {
                    const rowValue = row[filterKey];
                    return rowValue && rowValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                });
            }
        });

        if (currentSortStatus.columnAccessor) {
            filtered.sort((a, b) => {
                const aValue = a[currentSortStatus.columnAccessor];
                const bValue = b[currentSortStatus.columnAccessor];
                if (aValue < bValue) return currentSortStatus.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return currentSortStatus.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [safeData, isPaginationControlled, searchTerm, searchable, activeFiltersString, currentSortStatus.columnAccessor, currentSortStatus.direction, visibleColumns, normalizedSearchTerm]);

    // Pagination calculations
    const totalPages: number = isPaginationControlled ? controlledTotalPages : Math.ceil(processedData.length / rowsPerPage);
    const startIdx: number = isPaginationControlled ? (controlledPage - 1) * controlledPageSize + 1 : (currentPage - 1) * rowsPerPage + 1;
    const endIdx: number = isPaginationControlled ? Math.min(startIdx + safeData.length - 1, controlledTotalRecords) : Math.min(startIdx + rowsPerPage - 1, processedData.length);
    const totalCount: number = isPaginationControlled ? controlledTotalRecords : processedData.length;
    const paginatedData: RowData[] = isPaginationControlled ? processedData : processedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // Handle pagination change for non-controlled
    useEffect(() => {
        if (onPaginationChange && !isPaginationControlled) {
            onPaginationChange({ page: currentPage, pageSize: rowsPerPage });
        }
    }, [currentPage, rowsPerPage, onPaginationChange, isPaginationControlled]);

    // Handle search and filter reset to page 1 for non-controlled
    useEffect(() => {
        if (!isPaginationControlled) {
            setCurrentPage(1);
        }
        if (searchable && inputRef.current) {
            inputRef.current.focus();
        }
    }, [searchTerm, searchable, activeFiltersString, isPaginationControlled]);  // Use string for stability

    // Handle error dismissal
    const handleDismissError = useCallback(() => {
        setDismissedError(true);
        onDismissError();
    }, [onDismissError]);

    // Default row renderer (memoized)
    const defaultRowRenderer = useCallback((row: RowData, index: number): ReactNode => {
        const serialNumber = startIdx + index;

        return (
            <tr key={row.id || index} className="odd:bg-white even:bg-slate-50 hover:bg-slate-100 transition-colors">
                {selectable && (
                    <td className="px-6 py-4">
                        <CustomCheckbox checked={selectedRows.includes(row.id as string)} onChange={(checked: boolean) => handleRowSelect(row.id as string)} />
                    </td>
                )}
                {showSerialNumber && (
                    <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{serialNumber}</span>
                    </td>
                )}
                {visibleColumns.map((col) => (
                    <td
                        key={col.key}
                        className={`px-6 py-4 ${
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        } ${col.key === 'jobTitle' ? 'min-w-[200px]' : ''} ${col.cellClassName || ''}`}
                    >
                        {col.render ? col.render(row[col.key], row, index) : <span className="text-sm text-gray-900">{row[col.key]}</span>}
                    </td>
                ))}
                {actions.length > 0 && (
                    <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                            {actions.map((action, idx) => (
                                <React.Fragment key={idx}>
                                    {action.component ? (
                                        <action.component row={row} />
                                    ) : (
                                        action.icon &&
                                        action.onClick && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (action.onClick) {
                                                    action.onClick(row);
                                                }
                                            }}
                                            className="group inline-flex items-center justify-center rounded-full p-2 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 hover:scale-105 active:scale-95 text-gray-600"
                                            title={action.title}
                                            aria-label={action.title}
                                        >
                                            <action.icon className="h-4 w-4 transition-colors group-hover:text-indigo-600 group-active:text-indigo-700" />
                                        </button>
                                        )
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </td>
                )}
            </tr>
        );
    }, [visibleColumns, selectable, showSerialNumber, selectedRows, handleRowSelect, actions, startIdx]);

    // Loading skeleton table (memoized)
    const renderSkeletonTable = useCallback(() => (
        <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                    {selectable && (
                        <th className="px-6 py-3 text-left">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-4"></div>
                        </th>
                    )}
                    {showSerialNumber && (
                        <th className="px-6 py-3 text-left">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                        </th>
                    )}
                    {visibleColumns
                        .filter((col) => col.key !== 'id')
                        .map((_, index) => (
                            <th key={index} className="px-6 py-3 text-left">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                            </th>
                        ))}
                    {actions.length > 0 && (
                        <th className="px-6 py-3 text-left">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                        </th>
                    )}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonRow key={index} columns={visibleColumns} showSerialNumber={showSerialNumber} selectable={selectable} />
                ))}
            </tbody>
        </table>
    ), [visibleColumns, selectable, showSerialNumber, actions.length]);

    // Memoized select all checkbox
    const selectAllCheckbox = useMemo(() => (
        <CustomCheckbox checked={selectedRows.length === safeData.length && safeData.length > 0} onChange={handleSelectAll} />
    ), [selectedRows, safeData.length, handleSelectAll]);

    // Memoized serial header
    const serialHeader = useMemo(() => 
        showSerialNumber ? <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Sr No</th> : null,
    [showSerialNumber]);

    // Memoized actions header
    const actionsHeader = useMemo(() => 
        actions.length > 0 ? <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Actions</th> : null,
    [actions.length]);

    // Memoized header cells
    const headerCells = useMemo(() => 
        visibleColumns.map((col) => (
            <HeaderCell 
                key={col.key} 
                column={col} 
                currentSortStatus={currentSortStatus} 
                onSort={handleSortInternal} 
                loading={loading} 
            />
        )),
    [visibleColumns, currentSortStatus, handleSortInternal, loading]);

    // Memoized tbody rows
    const tableRows = useMemo(() => 
        paginatedData.length > 0 
            ? paginatedData.map((row, index) => (customRowRenderer ? customRowRenderer(row, index) : defaultRowRenderer(row, index)))
            : <tr>
                <td
                    colSpan={visibleColumns.length + (selectable ? 1 : 0) + (showSerialNumber ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className="px-6 py-12 text-center text-gray-500"
                >
                    {noRecordText}
                </td>
            </tr>,
    [paginatedData, customRowRenderer, defaultRowRenderer, visibleColumns.length, selectable, showSerialNumber, actions.length, noRecordText]);

    // Memoized pagination footer
    const paginationFooter = useMemo(() => 
        !loading && totalCount > 0 ? (
            <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        {`Showing ${startIdx}-${endIdx} of ${totalCount}`}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange((isPaginationControlled ? controlledPage : currentPage) - 1)}
                            disabled={(isPaginationControlled ? controlledPage : currentPage) === 1 || loading}
                            className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronDown className="w-4 h-4 rotate-90 text-gray-400" />
                        </button>

                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = i + 1;
                            const isActivePage = (isPaginationControlled ? controlledPage : currentPage) === pageNum;
                            return (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => handlePageChange(pageNum)}
                                    disabled={loading}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                        isActivePage ? 'bg-primary-red text-white shadow-sm' : 'hover:bg-gray-100 text-gray-700'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange((isPaginationControlled ? controlledPage : currentPage) + 1)}
                            disabled={(isPaginationControlled ? controlledPage : currentPage) === totalPages || loading}
                            className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>
        ) : null,
    [loading, totalCount, startIdx, endIdx, isPaginationControlled, controlledPage, currentPage, totalPages, handlePageChange, ]);
    return (
        <div
            className={`bg-white rounded-lg shadow-sm relative overflow-hidden transition-opacity duration-300 ease-in-out ${className}`}
            style={{ minHeight: `${minHeight}px` }}
        >
            {/* Header Section */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        {effectiveTitle && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{effectiveTitle}</h2>
                                {breadCrumbTitle && <span className="text-sm text-gray-500 block mt-1">{breadCrumbTitle}</span>}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {showDefaultDateControl && (
                            <QuickCalendarDropdown onDateSelect={onDateRangeSelect} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setDateRange={setDateRange} />
                        )}
                        {dateControl}
                        {filters.map((filter) => (
                            <FilterDropdown
                                key={filter.key}
                                filter={filter}
                                isOpen={openDropdowns[filter.key]}
                                activeFilters={activeFilters}
                                onToggle={() => toggleDropdown(filter.key)}
                                onFilter={handleFilter}
                                onClearFilter={clearFilter}
                            />
                        ))}
                        {showFilterButton && (
                            <button onClick={onFilterClick} className="px-4 py-2 border border-gray-200 rounded-sm h-10 flex items-center gap-2 text-gray-700 hover:text-primary-red">
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <ColumnDropdown
                            isOpen={openDropdowns.columns}
                            columns={columns}
                            hiddenColumns={hiddenColumns}
                            onToggle={() => toggleDropdown('columns')}
                            onToggleColumn={toggleColumnVisibility}
                        />

                        {children}

                        {sortOptions.length > 0 && (
                            <SortDropdown
                                isOpen={openDropdowns.sort}
                                sortOptions={sortOptions}
                                currentSortStatus={currentSortStatus}
                                onToggle={() => toggleDropdown('sort')}
                                onSort={onSort}
                                isSortControlled={isSortControlled}
                                setSortStatusState={setSortStatusState}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Rows per page</span>
                        <select
                            value={isPaginationControlled ? controlledPageSize : rowsPerPage}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                handlePageSizeChange(Number(e.target.value));
                            }}
                            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-red"
                            disabled={loading}
                        >
                            {rowsPerPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-gray-600">entries</span>
                    </div>
                </div>

                <div className="relative max-w-sm" hidden={!searchable}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={resolvedSearchPlaceholder}
                        value={searchValue !== undefined ? searchValue : searchTerm}
                        onChange={(e) => handleSearchInternal(e.target.value)}
                        className="h-10 w-64 rounded-md border border-gray-300 px-3 pr-9 text-sm focus:border-primary-red focus:ring-2 focus:ring-primary-red/30 transition"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">⌕</span>
                </div>
            </div>

            {!dismissedError && error && <ErrorMessage error={error} onDismiss={handleDismissError} />}

            <div className="relative overflow-x-auto" style={{ minHeight: `${minHeight}px` }}>
                {loading ? (
                    renderSkeletonTable()
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    {selectable && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {selectAllCheckbox}
                                        </th>
                                    )}
                                    {serialHeader}
                                    {headerCells}
                                    {actionsHeader}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tableRows}
                            </tbody>
                        </table>
                    </>
                )}

                {loading && <LoadingOverlay title={effectiveTitle} />}
            </div>

            {paginationFooter}
        </div>
    );
};
