import React, { useRef } from 'react';
import { Upload, Download, FileText, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface FileUploadProps {
  onImport: (data: any[]) => void;
  onExport: (format: 'csv' | 'xlsx') => void;
  data: any[];
  loading?: boolean;
}

export function FileUpload({ onImport, onExport, data, loading }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            toast({
              title: 'Import Error',
              description: 'Failed to parse CSV file',
              variant: 'destructive',
            });
            return;
          }
          onImport(results.data);
          toast({
            title: 'Import Successful',
            description: `Imported ${results.data.length} rows from CSV`,
          });
        },
        error: (error) => {
          toast({
            title: 'Import Error',
            description: error.message,
            variant: 'destructive',
          });
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          onImport(jsonData);
          toast({
            title: 'Import Successful',
            description: `Imported ${jsonData.length} rows from Excel`,
          });
        } catch (error) {
          toast({
            title: 'Import Error',
            description: 'Failed to parse Excel file',
            variant: 'destructive',
          });
        }
      };
      reader.readAsBinaryString(file);
    } else {
      toast({
        title: 'Unsupported File',
        description: 'Please upload a CSV or Excel file',
        variant: 'destructive',
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    if (data.length === 0) {
      toast({
        title: 'No Data',
        description: 'There is no data to export',
        variant: 'destructive',
      });
      return;
    }

    if (format === 'csv') {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `data-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      XLSX.writeFile(workbook, `data-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    }

    onExport(format);
    toast({
      title: 'Export Successful',
      description: `Exported ${data.length} rows as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Import
      </Button>

      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('csv')}
          disabled={loading || data.length === 0}
          className="flex items-center gap-2 rounded-r-none border-r-0"
        >
          <FileText className="w-4 h-4" />
          CSV
        </Button>
        <Button
          variant="outline"
          size="sm" 
          onClick={() => handleExport('xlsx')}
          disabled={loading || data.length === 0}
          className="flex items-center gap-2 rounded-l-none"
        >
          <Table className="w-4 h-4" />
          Excel
        </Button>
      </div>
    </div>
  );
}