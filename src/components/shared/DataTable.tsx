import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: string[];
  searchPlaceholder?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  // Server-side pagination props
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  serverSide?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchKeys = [],
  searchPlaceholder = 'Search...',
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  className,
  totalCount,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  serverSide = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Ensure data is always an array
  const safeData = useMemo(() => {
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search || serverSide) return safeData;
    
    const searchLower = search.toLowerCase();
    const keysToSearch = searchKeys.length > 0 ? searchKeys : columns.map(c => c.key);
    
    return safeData.filter(item => 
      keysToSearch.some(key => {
        const value = item[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [safeData, search, searchKeys, columns, serverSide]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey || serverSide) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection, serverSide]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (serverSide) return safeData;
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize, serverSide, safeData]);

  const totalItems = serverSide ? (totalCount ?? safeData.length) : sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const activePage = serverSide ? currentPage : page;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (serverSide && onPageChange) {
      onPageChange(newPage);
    } else {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize);
    if (serverSide && onPageSizeChange) {
      onPageSizeChange(size);
    } else {
      setPageSize(size);
      setPage(1);
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-800/50">
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={cn(
                    'text-gray-400 font-medium',
                    column.sortable && 'cursor-pointer select-none',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow 
                  key={item.id || index}
                  className={cn(
                    'border-gray-700',
                    onRowClick && 'cursor-pointer hover:bg-gray-800/50'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={cn('text-gray-300', column.className)}>
                      {column.render 
                        ? column.render(item) 
                        : item[column.key] ?? '-'
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[70px] bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()} className="text-white hover:bg-gray-700">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-4">
            {totalItems === 0 ? 0 : ((activePage - 1) * pageSize) + 1} - {Math.min(activePage * pageSize, totalItems)} of {totalItems}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={activePage === 1 || loading}
            className="h-8 w-8 bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(activePage - 1)}
            disabled={activePage === 1 || loading}
            className="h-8 w-8 bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 text-sm text-gray-400">
            Page {activePage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(activePage + 1)}
            disabled={activePage >= totalPages || loading}
            className="h-8 w-8 bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={activePage >= totalPages || loading}
            className="h-8 w-8 bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
