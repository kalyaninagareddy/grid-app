import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  ColumnOrderState,
  ColumnSizingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Pin, PinOff, MoreVerticalIcon, Text, Hash, List, Calendar, BadgeCheck, Image as ImageIcon, BarChart2, Clock, ArrowLeft, ArrowRight, Filter, EyeOff, Minus, GripVertical, MoveLeft, MoveRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

import { DataGridProps, DataGridColumn, GridTheme, FilterValue, BulkAction } from './types';
import { ThemePicker } from './ThemePicker';
import { FileUpload } from './FileUpload';
import { GlobalSearch } from './GlobalSearch';
import { ThemeAwareSearch } from './ThemeAwareSearch';
import { ColumnVisibility } from './ColumnVisibility';
import { ColumnFilters } from './ColumnFilters';
import { BulkActions } from './BulkActions';
import { TablePagination } from './TablePagination';
import { CellRenderer } from './CellRenderers';
import { DensitySelector } from './DensitySelector';
import { PinnedColumnsIndicator } from './PinnedColumnsIndicator';

export interface DataGridApiConfig {
  fetchUrl?: string;
  updateUrl?: string;
  deleteUrl?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

const densityOptions: Array<{
  label: string;
  value: 'compact' | 'comfortable' | 'spacious';
  row: string;
  cell: string;
  header: string;
}> = [
  { label: 'Compact', value: 'compact', row: 'h-6', cell: 'py-0.5 px-1', header: 'h-6' },
  { label: 'Comfortable', value: 'comfortable', row: 'h-12', cell: 'py-3 px-4', header: 'h-12' },
  { label: 'Spacious', value: 'spacious', row: 'h-16', cell: 'py-5 px-6', header: 'h-16' },
];

const typeIcons: Record<string, JSX.Element> = {
  text: <Text className="w-4 h-4 text-blue-500" />,
  number: <Hash className="w-4 h-4 text-green-500" />,
  select: <List className="w-4 h-4 text-purple-500" />,
  date: <Calendar className="w-4 h-4 text-yellow-500" />,
  badge: <BadgeCheck className="w-4 h-4 text-pink-500" />,
  image: <ImageIcon className="w-4 h-4 text-orange-500" />,
  chart: <BarChart2 className="w-4 h-4 text-cyan-500" />,
  timestamp: <Clock className="w-4 h-4 text-gray-500" />,
};

export function DataGrid<T extends Record<string, any>>({
  data: initialData,
  columns,
  tableName,
  loading: loadingProp = false,
  error: errorProp,
  onDataChange,
  onRowEdit,
  onRowDelete,
  onExport,
  onImport,
  pagination = { pageSize: 25, showSizeSelect: true, pageSizeOptions: [10, 25, 50, 100] },
  selection = { enabled: true },
  globalSearch = { enabled: true, placeholder: "Search across all columns..." },
  theming = { enabled: true, defaultTheme: 'light' },
  className = "",
  apiConfig,
}: DataGridProps<T>) {
  const { toast } = useToast();

  // State management
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [pinnedColumns, setPinnedColumns] = useState<{ left: string[]; right: string[] }>({ left: [], right: [] });
  const [customFilters, setCustomFilters] = useState<FilterValue[]>([]);
  const [theme, setTheme] = useState<GridTheme>({ mode: theming.defaultTheme || 'light' });
  // const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(columns.map(col => col.id));
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    const dataColumnIds = columns.map(col => col.id);
    return selection.enabled ? ['select', ...dataColumnIds] : dataColumnIds;
  });
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  
  // Debug density changes
  useEffect(() => {
    console.log('Density changed to:', density);
  }, [density]);
  const [selectedGlobalSearchColumns, setSelectedGlobalSearchColumns] = useState<string[]>(columns.map(c => c.id));
  
  // Pagination state
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: pagination.pageSize || 25,
  });

  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(loadingProp);
  const [error, setError] = useState<string | undefined>(errorProp);

  // Add column sizing state
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  // Initialize theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.mode === 'dark');
    if (theme.customPrimaryColor) {
      document.documentElement.style.setProperty('--primary', theme.customPrimaryColor);
    }
  }, [theme.mode, theme.customPrimaryColor]);

  // API fetch logic
  useEffect(() => {
    if (apiConfig?.fetchUrl) {
      setLoading(true);
      fetch(apiConfig.fetchUrl)
        .then(res => res.json())
        .then(json => {
          setData(json);
          setLoading(false);
        })
        .catch(e => {
          setError(e.message);
          setLoading(false);
        });
    }
  }, [apiConfig?.fetchUrl]);

  // Helper function for pinned column positioning (use actual widths)
  const getPinnedPosition = (columnId: string, side: 'left' | 'right'): number => {
    const pinnedCols = pinnedColumns[side];
    const index = pinnedCols.indexOf(columnId);
    let position = 0;
    for (let i = 0; i < index; i++) {
      const colId = pinnedCols[i];
      // Use columnSizing if available, else fallback to column width/minWidth/150
      const col = columns.find(c => c.id === colId);
      const sizedWidth = columnSizing[colId];
      position += sizedWidth || col?.width || col?.minWidth || 150;
    }
    return position;
  };

  // Create table columns with custom renderers
  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = [];

    // Selection column
    if (selection.enabled) {
      cols.push({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      });
    }

    // Data columns
    columns.forEach((column) => {
      const isPinned = pinnedColumns.left.includes(column.id) || pinnedColumns.right.includes(column.id);
      
      cols.push({
        id: column.id,
        accessorKey: column.accessorKey as string,
        header: ({ column: col }) => {
          const isSorted = col.getIsSorted();
          return (
            <div className="flex items-center gap-1">
              {typeIcons[column.type || 'text']}
              <Button
                variant="ghost"
                onClick={() => column.sortable !== false && col.toggleSorting(isSorted === "asc")}
                className="h-auto p-0 font-medium hover:bg-transparent"
                disabled={column.sortable === false}
              >
                <div className="flex items-center gap-1">
                  {pinnedColumns.left.includes(column.id) && (
                    <Pin className="h-3 w-3 text-blue-500" />
                  )}
                  {pinnedColumns.right.includes(column.id) && (
                    <Pin className="h-3 w-3 text-green-500" />
                  )}
                  <span>{column.header}</span>
                  {column.sortable !== false && (
                    <div className="ml-1">
                      {isSorted === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : isSorted === "desc" ? (
                        <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </div>
                  )}
                  {/* Position indicators */}
                  {column.id !== 'select' && (
                    <>
                      {columnOrder.indexOf(column.id) === (selection.enabled ? 1 : 0) && (
                        <div title="Leftmost column">
                          <ChevronsLeft className="h-3 w-3 text-orange-500" />
                        </div>
                      )}
                      {columnOrder.indexOf(column.id) === columnOrder.length - 1 && (
                        <div title="Rightmost column">
                          <ChevronsRight className="h-3 w-3 text-orange-500" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Button>
              
              {/* Drag Handle */}
              {column.id !== 'select' && (
                <div
                  className="drag-handle p-1 rounded flex-shrink-0"
                  draggable
                  onDragStart={() => handleDragStart(column.id)}
                  title="Drag to reorder column"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              
              {column.pinnable !== false && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto w-auto p-1 flex-shrink-0">
                      <MoreVerticalIcon className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setColumnVisibility(prev => ({ ...prev, [column.id]: false }))}>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Hide Column
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setColumnFilters(prev => [...prev, { id: column.id, value: '' }])}>
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSorting([{ id: column.id, desc: false }])}>
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Sort Ascending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSorting([{ id: column.id, desc: true }])}>
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Sort Descending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      // Move column left
                      const idx = columnOrder.indexOf(column.id);
                      if (idx > 0) {
                        const newOrder = [...columnOrder];
                        [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
                        setColumnOrder(newOrder);
                      }
                    }}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Move Left
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      // Move column right
                      const idx = columnOrder.indexOf(column.id);
                      if (idx < columnOrder.length - 1) {
                        const newOrder = [...columnOrder];
                        [newOrder[idx + 1], newOrder[idx]] = [newOrder[idx], newOrder[idx + 1]];
                        setColumnOrder(newOrder);
                      }
                    }}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Move Right
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMoveToLeftEnd(column.id)}>
                      <ChevronsLeft className="mr-2 h-4 w-4" />
                      Move to Left End
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMoveToRightEnd(column.id)}>
                      <ChevronsRight className="mr-2 h-4 w-4" />
                      Move to Right End
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePinColumn(column.id, 'left')}>
                      <MoveLeft className="mr-2 h-4 w-4" />
                      Pin to Left
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePinColumn(column.id, 'right')}>
                      <MoveRight className="mr-2 h-4 w-4" />
                      Pin to Right
                    </DropdownMenuItem>
                    {(pinnedColumns.left.includes(column.id) || pinnedColumns.right.includes(column.id)) && (
                      <DropdownMenuItem onClick={() => handleUnpinColumn(column.id)}>
                        <PinOff className="mr-2 h-4 w-4" />
                        Unpin Column
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        },
        cell: ({ row, column: col }) => {
          const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === column.id;
          const value = row.getValue(column.id);
          
          return (
            <div
              className="cursor-pointer"
              onDoubleClick={() => column.editable && setEditingCell({ rowId: row.id, columnId: column.id })}
            >
              <CellRenderer
                value={value}
                row={row.original}
                column={column}
                isEditing={isEditing}
                onSave={(newValue) => handleCellSave(row.original, column.accessorKey as keyof T, newValue)}
                onCancel={() => setEditingCell(null)}
              />
            </div>
          );
        },
        enableSorting: column.sortable !== false,
        enableHiding: true,
        size: column.width || 150,
        minSize: column.minWidth,
        maxSize: column.maxWidth,
        meta: {
          className: isPinned 
            ? `${
                pinnedColumns.left.includes(column.id) 
                  ? 'pinned-column-left' 
                  : 'pinned-column-right'
              }` 
            : '',
          style: isPinned ? {
            left: pinnedColumns.left.includes(column.id) ? `${getPinnedPosition(column.id, 'left')}px` : undefined,
            right: pinnedColumns.right.includes(column.id) ? `${getPinnedPosition(column.id, 'right')}px` : undefined,
          } : {},
        },
      });
    });

    return cols;
  }, [columns, pinnedColumns, editingCell, selection.enabled, columnVisibility, columnFilters, sorting, columnOrder, columnSizing]);

  // Drag-and-drop logic for column headers
  const dragColId = useRef<string | null>(null);
  const handleDragStart = (colId: string) => {
    dragColId.current = colId;
  };
  const handleDragOver = (e: React.DragEvent<HTMLTableHeaderCellElement>) => {
    e.preventDefault();
  };
  // Update handleDrop logic to always keep 'select' as the first column
  const handleDrop = (targetColId: string) => {
    if (!dragColId.current || dragColId.current === targetColId) return;
    if (dragColId.current === 'select' || targetColId === 'select') return; // never drag or drop on selection column
    const newOrder = [...columnOrder];
    const fromIdx = newOrder.indexOf(dragColId.current);
    const toIdx = newOrder.indexOf(targetColId);
    if (fromIdx === -1 || toIdx === -1) return;
    // If dropping on the first column, insert at index 1 (after 'select')
    if (toIdx === 0) {
      newOrder.splice(fromIdx, 1);
      newOrder.splice(1, 0, dragColId.current);
    } else {
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, dragColId.current);
    }
    // Always enforce 'select' as the first column
    const filteredOrder = newOrder.filter(id => id !== 'select');
    setColumnOrder(['select', ...filteredOrder]);
    dragColId.current = null;
  };

  // Table instance
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply custom filters first
    if (customFilters.length > 0) {
      filtered = filtered.filter(row => {
        return customFilters.every(filter => {
          const column = columns.find(col => col.id === filter.id);
          if (!column) return true;
          
          const value = row[column.accessorKey as keyof T];
          if (!value) return false;

          switch (filter.type) {
            case 'text':
              return value.toString().toLowerCase().includes(filter.value.toLowerCase());
            case 'select':
              return value.toString() === filter.value.toString();
            case 'date':
              return value.toString().includes(filter.value);
            case 'number': {
              const numValue = Number(value);
              const filterNum = Number(filter.value);
              return !isNaN(numValue) && !isNaN(filterNum) && numValue === filterNum;
            }
            default:
              return value.toString().toLowerCase().includes(filter.value.toLowerCase());
          }
        });
      });
    }

    // Apply global search
    if (globalFilter) {
      filtered = filtered.filter(row =>
        columns.some(col => {
          const value = row[col.accessorKey as keyof T];
          return value && value.toString().toLowerCase().includes(globalFilter.toLowerCase());
        })
      );
    }

    return filtered;
  }, [data, globalFilter, selectedGlobalSearchColumns, columns, customFilters]);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: paginationState,
      columnOrder,
      columnSizing, // <-- add this
    },
    enableRowSelection: selection.enabled,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPaginationState,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing, // <-- add this
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    enableColumnResizing: true, // <-- enable resizing
    columnResizeMode: 'onChange', // or 'onEnd' for resize mode
  });

  // Handlers
  const handleCellSave = async (row: T, field: keyof T, value: any) => {
    try {
      let updatedRow = { ...row, [field]: value };
      
      // Call onRowEdit callback if provided
      if (onRowEdit) {
        await onRowEdit(row, field, value);
      }
      
      // Make API call if updateUrl is provided
      if (apiConfig?.updateUrl) {
        await fetch(apiConfig.updateUrl, {
          method: apiConfig.method || 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedRow),
        });
      }
      
      // Update local data immediately
      setData(prev => prev.map(item => 
        item === row ? updatedRow : item
      ));
      
      // Call onDataChange callback with updated data
      const updatedData = data.map(item => item === row ? updatedRow : item);
      onDataChange?.(updatedData);
      
      // Clear editing state
      setEditingCell(null);
      
      // Show success toast
      toast({ 
        title: "Success", 
        description: "Cell updated successfully",
        duration: 1000
      });
    } catch (error) {
      console.error('Error updating cell:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update cell", 
        variant: "destructive",
        duration: 1000
      });
    }
  };

  const handlePinColumn = (columnId: string, side: 'left' | 'right') => {
    setPinnedColumns(prev => ({
      left: side === 'left' ? [...prev.left.filter(id => id !== columnId), columnId] : prev.left.filter(id => id !== columnId),
      right: side === 'right' ? [...prev.right.filter(id => id !== columnId), columnId] : prev.right.filter(id => id !== columnId),
    }));
  };

  const handleUnpinColumn = (columnId: string) => {
    setPinnedColumns(prev => ({
      left: prev.left.filter(id => id !== columnId),
      right: prev.right.filter(id => id !== columnId),
    }));
  };

  const handleMoveToLeftEnd = (columnId: string) => {
    if (columnId === 'select') return; // Never move selection column
    const newOrder = [...columnOrder];
    const currentIndex = newOrder.indexOf(columnId);
    if (currentIndex > 0) {
      newOrder.splice(currentIndex, 1);
      // Insert after 'select' column if it exists, otherwise at the beginning
      const insertIndex = selection.enabled ? 1 : 0;
      newOrder.splice(insertIndex, 0, columnId);
      setColumnOrder(newOrder);
    }
  };

  const handleMoveToRightEnd = (columnId: string) => {
    if (columnId === 'select') return; // Never move selection column
    const newOrder = [...columnOrder];
    const currentIndex = newOrder.indexOf(columnId);
    if (currentIndex >= 0 && currentIndex < newOrder.length - 1) {
      newOrder.splice(currentIndex, 1);
      newOrder.push(columnId);
      setColumnOrder(newOrder);
    }
  };

  const handleBulkDelete = async (selectedRows: any[]) => {
    try {
      const rows = selectedRows.map(row => row.original);
      
      if (onRowDelete) {
        await onRowDelete(rows);
      }
      if (apiConfig?.deleteUrl) {
        await fetch(apiConfig.deleteUrl, {
          method: apiConfig.method || 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rows),
        });
      }
      setData(prev => prev.filter(item => !rows.includes(item)));
      onDataChange?.(data.filter(item => !rows.includes(item)));
      setRowSelection({});
      toast({ title: "Success", description: "Rows deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete rows", variant: "destructive" });
    }
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: MoreVerticalIcon,
      variant: 'destructive',
      action: handleBulkDelete,
    },
  ];

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div className="text-destructive">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-1">
          {/* Table Name and Global Search */}
          <div className="flex items-center gap-3">
            {tableName && (
              <div className="flex items-center gap-2">
                <h2 className="text-lg data-grid-table-name">{tableName}</h2>
                <div className="w-px h-6 bg-border"></div>
              </div>
            )}
            {globalSearch.enabled && (
              <ThemeAwareSearch
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder={globalSearch.placeholder}
              />
            )}
          </div>
          
          <BulkActions
            selectedRows={selectedRows}
            actions={bulkActions}
            onDelete={handleBulkDelete}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <FileUpload
            onImport={onImport || (() => {})}
            onExport={(format) => onExport?.(data, format)}
            data={data}
            loading={loading}
          />
          
          <ColumnVisibility
            columns={columns}
            visibleColumns={Object.keys(columnVisibility).filter(key => columnVisibility[key] !== false)}
            onVisibilityChange={(columnId, visible) => 
              setColumnVisibility(prev => ({ ...prev, [columnId]: visible }))
            }
          />
          
          {theming.enabled && (
            <ThemePicker theme={theme} onThemeChange={setTheme} />
          )}
          {/* Density Selector */}
          <DensitySelector
            value={density}
            onChange={setDensity}
            options={densityOptions}
          />

        </div>
      </div>

      {/* Pinned Columns Indicator */}
      <PinnedColumnsIndicator
        pinnedColumns={pinnedColumns}
        columns={columns}
        onUnpinColumn={handleUnpinColumn}
      />

      {/* Filters */}
      <ColumnFilters
        columns={columns}
        filters={customFilters}
        onFiltersChange={setCustomFilters}
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-md border bg-background relative">
        <table className="w-full caption-bottom text-sm data-grid-table">
          <thead className="[&_tr]:border-b bg-grid-header-bg">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b transition-colors hover:bg-grid-row-hover/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 text-left align-middle font-medium text-muted-foreground border-grid-header-border border-r last:border-r-0 bg-grid-header-bg ${densityOptions.find(opt => opt.value === density)?.header || 'h-12'} ${(header.column.columnDef.meta as any)?.className || ''}`}
                    style={{
                      width: header.getSize(),
                      minWidth: header.getSize(),
                      ...(header.column.columnDef.meta as any)?.style,
                      position: pinnedColumns.left.includes(header.column.id) || pinnedColumns.right.includes(header.column.id) ? 'sticky' : 'relative',
                      left: pinnedColumns.left.includes(header.column.id) ? getPinnedPosition(header.column.id, 'left') : undefined,
                      right: pinnedColumns.right.includes(header.column.id) ? getPinnedPosition(header.column.id, 'right') : undefined,
                      zIndex: pinnedColumns.left.includes(header.column.id) || pinnedColumns.right.includes(header.column.id) ? 10 : undefined,
                      background: pinnedColumns.left.includes(header.column.id) || pinnedColumns.right.includes(header.column.id) ? 'hsl(var(--background))' : undefined,
                    }}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(header.column.id)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {/* Column Resizer */}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`column-resize-handle ${
                          header.column.getIsResizing() ? 'resizing' : ''
                        }`}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {loading ? (
              <tr>
                <td colSpan={table.getAllColumns().length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b transition-colors hover:bg-grid-row-hover data-[state=selected]:bg-grid-row-selected ${densityOptions.find(opt => opt.value === density)?.row || 'h-12'}`}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`align-middle border-grid-cell-border border-r last:border-r-0 ${
                        (cell.column.columnDef.meta as any)?.className || ''
                      } ${densityOptions.find(opt => opt.value === density)?.cell || 'py-3 px-4'} ${
                        editingCell?.rowId === row.id && editingCell?.columnId === cell.column.id ? 'editing' : ''
                      }`}
                      data-editable={columns.find(col => col.id === cell.column.id)?.editable ? 'true' : 'false'}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                        ...(cell.column.columnDef.meta as any)?.style,
                        position: pinnedColumns.left.includes(cell.column.id) || pinnedColumns.right.includes(cell.column.id) ? 'sticky' : undefined,
                        left: pinnedColumns.left.includes(cell.column.id) ? getPinnedPosition(cell.column.id, 'left') : undefined,
                        right: pinnedColumns.right.includes(cell.column.id) ? getPinnedPosition(cell.column.id, 'right') : undefined,
                        zIndex: pinnedColumns.left.includes(cell.column.id) || pinnedColumns.right.includes(cell.column.id) ? 10 : undefined,
                        background: pinnedColumns.left.includes(cell.column.id) || pinnedColumns.right.includes(cell.column.id) ? 'hsl(var(--background))' : undefined,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={table.getAllColumns().length} className="h-24 text-center">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        table={table}
        pageSizeOptions={pagination.pageSizeOptions}
        showPageSizeSelect={pagination.showSizeSelect}
      />
    </div>
  );
}