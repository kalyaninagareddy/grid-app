import { ColumnDef, Row } from '@tanstack/react-table';

export type DataGridColumn<T = any> = ColumnDef<T> & {
  id: string;
  accessorKey?: keyof T;
  header: string;
  type?: 'text' | 'number' | 'select' | 'date' | 'badge' | 'image' | 'chart' | 'largeText';
  editable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pinnable?: boolean;
  options?: Array<{ label: string; value: any }>;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface DataGridProps<T = any> {
  data: T[];
  columns: DataGridColumn<T>[];
  tableName?: string;
  loading?: boolean;
  error?: string;
  onDataChange?: (data: T[]) => void;
  onRowEdit?: (row: T, field: keyof T, value: any) => Promise<void>;
  onRowDelete?: (rows: T[]) => Promise<void>;
  onExport?: (data: T[], format: 'csv' | 'xlsx') => void;
  onImport?: (data: T[]) => void;
  pagination?: {
    pageSize?: number;
    showSizeSelect?: boolean;
    pageSizeOptions?: number[];
  };
  selection?: {
    enabled?: boolean;
    onSelectionChange?: (selectedRows: T[]) => void;
  };
  globalSearch?: {
    enabled?: boolean;
    placeholder?: string;
  };
  theming?: {
    enabled?: boolean;
    defaultTheme?: 'light' | 'dark';
    customPrimaryColor?: string;
  };
  className?: string;
}

export interface GridTheme {
  mode: 'light' | 'dark';
  primaryColor?: string;
}

export interface FilterValue {
  id: string;
  value: any;
  type: 'text' | 'select' | 'date' | 'dateRange';
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  action: (selectedRows: Row<any>[]) => void;
  variant?: 'default' | 'destructive';
}

export interface CellRendererProps<T = any> {
  value: any;
  row: T;
  column: DataGridColumn<T>;
  isEditing?: boolean;
  onSave?: (value: any) => void;
  onCancel?: () => void;
}