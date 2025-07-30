// Main exports for the FluentGrid package
export { DataGrid } from './components/data-grid/DataGrid';
export type { 
  DataGridProps, 
  DataGridColumn, 
  GridTheme, 
  FilterValue, 
  BulkAction,
  CellRendererProps 
} from './components/data-grid/types';

// Export individual components for advanced usage
export { ThemePicker } from './components/data-grid/ThemePicker';
export { FileUpload } from './components/data-grid/FileUpload';
export { GlobalSearch } from './components/data-grid/GlobalSearch';
export { ColumnVisibility } from './components/data-grid/ColumnVisibility';
export { ColumnFilters } from './components/data-grid/ColumnFilters';
export { BulkActions } from './components/data-grid/BulkActions';
export { TablePagination } from './components/data-grid/TablePagination';
export { CellRenderer } from './components/data-grid/CellRenderers';

// Export demo data for testing
export { sampleUsers, userColumns, type SampleUser } from './components/data-grid/demo-data'; 