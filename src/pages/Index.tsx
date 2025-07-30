import React, { useState } from 'react';
import { DataGrid } from '@/components/data-grid';
import { sampleUsers, userColumns, SampleUser } from '@/components/data-grid/demo-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [data, setData] = useState<SampleUser[]>(sampleUsers);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDataChange = (newData: SampleUser[]) => {
    setData(newData);
  };

  const handleRowEdit = async (row: SampleUser, field: keyof SampleUser, value: any) => {
    // Simulate API call
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
    
    console.log('Editing row:', row, 'field:', field, 'value:', value);
    toast({
      title: "Row Updated",
      description: `${field} updated to ${value}`,
    });
  };

  const handleRowDelete = async (rows: SampleUser[]) => {
    // Simulate API call
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
    
    console.log('Deleting rows:', rows);
    toast({
      title: "Rows Deleted",
      description: `${rows.length} row(s) deleted successfully`,
    });
  };

  const handleImport = (importedData: any[]) => {
    // Process and validate imported data
    const processedData = importedData.map((item, index) => ({
      id: `imported-${index}`,
      name: item.name || 'Unknown',
      email: item.email || 'unknown@example.com',
      age: parseInt(item.age) || 0,
      department: item.department || 'Unknown',
      salary: parseInt(item.salary) || 0,
      status: item.status || 'pending',
      joinDate: item.joinDate || new Date().toISOString().split('T')[0],
      avatar: item.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      performance: parseInt(item.performance) || 0,
      location: item.location || 'Unknown',
      manager: item.manager || 'Unknown'
    })) as SampleUser[];
    
    setData(prev => [...prev, ...processedData]);
    toast({
      title: "Import Successful",
      description: `${processedData.length} rows imported`,
    });
  };

  const handleExport = (exportData: SampleUser[], format: 'csv' | 'xlsx') => {
    console.log(`Exporting ${exportData.length} rows as ${format}`);
    toast({
      title: "Export Successful", 
      description: `Data exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Advanced Data Grid Demo</CardTitle>
            <CardDescription>
              A comprehensive, customizable data grid built with React & @tanstack/react-table v8.
              Features theming, file import/export, inline editing, sorting, filtering, pagination, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">✨ Key Features</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Light/Dark theme with color picker</li>
                  <li>• CSV/Excel import & export</li>
                  <li>• Inline editing (text, number, select)</li>
                  <li>• Column sorting & filtering</li>
                </ul>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🎛️ Interactive Elements</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Global search across columns</li>
                  <li>• Row selection & bulk actions</li>
                  <li>• Column resizing & pinning</li>
                  <li>• Column visibility toggle</li>
                </ul>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">📊 Cell Renderers</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Badges for status display</li>
                  <li>• Image/avatar rendering</li>
                  <li>• Chart bars for metrics</li>
                  <li>• Custom cell types</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card> */}

        <DataGrid
          data={data}
          tableName="Employees"
          columns={userColumns}
          loading={loading}
          onDataChange={handleDataChange}
          onRowEdit={handleRowEdit}
          onRowDelete={handleRowDelete}
          onImport={handleImport}
          onExport={handleExport}
          pagination={{
            pageSize: 10,
            showSizeSelect: true,
            pageSizeOptions: [5, 10, 25, 50, 100, 200, 500]
          }}
          selection={{
            enabled: true,
          }}
          globalSearch={{
            enabled: true,
            placeholder: "Search employees..."
          }}
          theming={{
            enabled: true,
            defaultTheme: 'light'
          }}
          className="bg-card rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
};

export default Index;
