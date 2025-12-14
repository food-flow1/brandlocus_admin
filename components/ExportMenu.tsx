import React, { useRef } from 'react';
import { CSVLink } from 'react-csv';
import { TbCloudDownload } from 'react-icons/tb';
import Button from './Button';

interface ExportMenuProps {
  data: any[];
  dname: string;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ data, dname }) => {
  const csvRef = useRef<any>(null);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString().replace(/\//g, "-");
  const formattedTime = currentDate.toLocaleTimeString().replace(/:/g, "-");
  const baseName = `${dname} ${formattedDate}, ${formattedTime}`;
  const csvFileName = `${baseName}.csv`;

  const handleDownload = () => {
    if (!data?.length) return;
    if (csvRef.current) {
      csvRef.current.link.click();
    }
  };

  return (
    <>
      <Button
        icon={<TbCloudDownload size={20} />}
        text="Export CSV"
        variant="primary"
        onClick={handleDownload}
        disabled={!data || data.length === 0}
      />
      <CSVLink
        data={data}
        filename={csvFileName}
        className="hidden"
        ref={csvRef}
        target="_blank"
      />
    </>
  );
};

export default ExportMenu;
