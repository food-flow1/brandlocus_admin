import React, { useState } from 'react';
import { TbCloudDownload } from 'react-icons/tb';
import Button from './Button';
import { useToast } from './Toast';
import * as XLSX from 'xlsx';

interface ExportMenuProps {
  onExport: () => Promise<any[]>;
  dname: string;
  disabled?: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ onExport, dname, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const data = await onExport();
      
      if (!data || data.length === 0) {
        showToast('No data to export', 'error');
        return;
      }

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, dname);
      
      // Generate file name
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString().replace(/\//g, "-");
      const formattedTime = currentDate.toLocaleTimeString().replace(/:/g, "-");
      const fileName = `${dname} ${formattedDate}, ${formattedTime}.xlsx`;

      // Trigger download
      XLSX.writeFile(wb, fileName);
      
      showToast(`${dname} exported successfully`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast(`Failed to export ${dname}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      icon={<TbCloudDownload size={20} />}
      text={isLoading ? "Exporting..." : "Export CSV"}
      variant="primary"
      onClick={handleDownload}
      disabled={disabled || isLoading}
    />
  );
};

export default ExportMenu;
