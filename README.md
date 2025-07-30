# DataGrid Component

A powerful, customizable data grid component built with React, TypeScript, and TanStack Table v8. Features column pinning, resizing, sorting, filtering, pagination, and more - inspired by AG Grid.

## ✨ Features

- **Column Pinning**: Pin columns to left or right with visual separators
- **Column Resizing**: Real-time column width adjustment with persistence
- **Sorting & Filtering**: Multi-column sorting and advanced filtering
- **Pagination**: Configurable pagination with page size options
- **Row Selection**: Single and multi-row selection with bulk actions
- **Global Search**: Search across all columns with customizable scope
- **Theme Support**: Light/dark themes with custom color options
- **Import/Export**: CSV and Excel file support
- **Inline Editing**: Edit cells directly in the grid
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Full TypeScript support with comprehensive types

## 🚀 Installation

```bash
npm install datagrid-component
```

### Peer Dependencies

Make sure you have these installed in your project:

```bash
npm install react react-dom @tanstack/react-table
```

## 📦 Usage

### Basic Example

```tsx
import React from 'react';
import { DataGrid, sampleUsers, userColumns } from 'datagrid-component';

function App() {
  return (
    <DataGrid
      data={sampleUsers}
      columns={userColumns}
      pagination={{
        pageSize: 10,
        showSizeSelect: true,
        pageSizeOptions: [5, 10, 25, 50]
      }}
      selection={{ enabled: true }}
      globalSearch={{ enabled: true }}
      theming={{ enabled: true }}
    />
  );
}
```

### Advanced Example

```tsx
import React, { useState } from 'react';
import { DataGrid, DataGridColumn } from 'datagrid-component';

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  department: string;
  salary: number;
  status: 'active' | 'inactive';
}

const columns: DataGridColumn<User>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    type: 'text',
    editable: true,
    sortable: true,
    pinnable: true,
    width: 200,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    type: 'text',
    editable: true,
    sortable: true,
    width: 250,
  },
  {
    id: 'department',
    accessorKey: 'department',
    header: 'Department',
    type: 'select',
    editable: true,
    sortable: true,
    width: 150,
    options: [
      { label: 'Engineering', value: 'Engineering' },
      { label: 'Marketing', value: 'Marketing' },
      { label: 'Sales', value: 'Sales' },
    ],
  },
  {
    id: 'salary',
    accessorKey: 'salary',
    header: 'Salary',
    type: 'number',
    editable: true,
    sortable: true,
    width: 120,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    type: 'badge',
    editable: true,
    sortable: true,
    width: 100,
  },
];

function AdvancedGrid() {
  const [data, setData] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', age: 30, department: 'Engineering', salary: 80000, status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25, department: 'Marketing', salary: 65000, status: 'active' },
  ]);

  const handleRowEdit = async (row: User, field: keyof User, value: any) => {
    console.log('Editing:', row, field, value);
    // Update your data source here
  };

  const handleRowDelete = async (rows: User[]) => {
    console.log('Deleting rows:', rows);
    // Delete rows from your data source
  };

  return (
    <DataGrid
      data={data}
      columns={columns}
      onDataChange={setData}
      onRowEdit={handleRowEdit}
      onRowDelete={handleRowDelete}
      pagination={{
        pageSize: 25,
        showSizeSelect: true,
        pageSizeOptions: [10, 25, 50, 100]
      }}
      selection={{ enabled: true }}
      globalSearch={{
        enabled: true,
        placeholder: "Search users..."
      }}
      theming={{
        enabled: true,
        defaultTheme: 'light'
      }}
    />
  );
}
```

## 🎛️ API Reference

### DataGrid Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | - | Array of data objects |
| `columns` | `DataGridColumn<T>[]` | - | Column definitions |
| `loading` | `boolean` | `false` | Loading state |
| `error` | `string` | - | Error message |
| `onDataChange` | `(data: T[]) => void` | - | Called when data changes |
| `onRowEdit` | `(row: T, field: keyof T, value: any) => Promise<void>` | - | Called when a cell is edited |
| `onRowDelete` | `(rows: T[]) => Promise<void>` | - | Called when rows are deleted |
| `onExport` | `(data: T[], format: 'csv' \| 'xlsx') => void` | - | Called when data is exported |
| `onImport` | `(data: T[]) => void` | - | Called when data is imported |
| `pagination` | `PaginationConfig` | `{ pageSize: 25, showSizeSelect: true, pageSizeOptions: [10, 25, 50, 100] }` | Pagination settings |
| `selection` | `SelectionConfig` | `{ enabled: true }` | Row selection settings |
| `globalSearch` | `GlobalSearchConfig` | `{ enabled: true, placeholder: "Search..." }` | Global search settings |
| `theming` | `ThemingConfig` | `{ enabled: true, defaultTheme: 'light' }` | Theme settings |
| `className` | `string` | `""` | Additional CSS classes |

### Column Types

| Type | Description | Renderer |
|------|-------------|----------|
| `text` | Plain text | Text input |
| `number` | Numeric values | Number input |
| `select` | Dropdown selection | Select dropdown |
| `date` | Date values | Date picker |
| `badge` | Status badges | Colored badges |
| `image` | Images/avatars | Image display |
| `chart` | Progress bars | Progress bars |

### Column Pinning

Use the column header menu to pin columns:

- **Pin Left**: Pins column to the left side
- **Pin Right**: Pins column to the right side
- **Unpin**: Removes column from pinned state

Pinned columns have visual separators and stay in place during horizontal scrolling.

### Column Resizing

- Hover over the right edge of any column header
- Click and drag to resize
- Column widths are automatically saved

## 🎨 Styling

The component uses Tailwind CSS classes. Make sure your project has Tailwind CSS configured.

### Custom Themes

```tsx
<DataGrid
  theming={{
    enabled: true,
    defaultTheme: 'dark',
    customPrimaryColor: '#3b82f6'
  }}
/>
```

### Custom CSS Variables

You can override CSS variables for custom styling:

```css
:root {
  --primary: #3b82f6;
  --background: #ffffff;
  --foreground: #000000;
}
```

## 🔧 Development

### Building the Package

```bash
npm run build
```

### Publishing

```bash
npm login
npm publish --access public
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

