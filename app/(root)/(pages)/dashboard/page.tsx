'use client';

import { useCallback } from 'react';
import DashboardCards from './DashboardCards';
import TextTemplate from '@/components/TextTemplate';
import Button from '@/components/Button';
import { TbCloudDownload } from 'react-icons/tb';
import DataTable, { Column } from '@/components/DataTable';
import { useForms, FormEntry } from '@/hooks/useForms';

const DashboardPage = () => {
  // Fetch forms data with alltime filter
  const { data: formsData, isLoading } = useForms({ timeFilter: 'alltime' });

  // Get forms list from pagination
  const forms = formsData?.pagination?.content || [];

  const handleRowSelect = (selectedRows: FormEntry[]) => {
    console.log('Selected rows:', selectedRows);
  };

  const columns: Column<FormEntry>[] = [
    {
      key: 'firstName',
      label: 'First Name',
      sortable: true,
    },
    {
      key: 'lastName',
      label: 'Last Name',
      sortable: true,
    },
    {
      key: 'companyName',
      label: 'Company Name',
      sortable: true,
    },
    {
      key: 'serviceNeeded',
      label: 'Service Needed',
      sortable: true,
    },
    {
      key: 'submittedAt',
      label: 'Date Created',
      sortable: true,
      render: (value: string | null) => value ? new Date(value).toLocaleDateString() : '-',
    },
  ];

  const handleExport = useCallback(() => {
    if (forms.length === 0) return;

    // Convert data to CSV
    const headers = ['First Name', 'Last Name', 'Company Name', 'Service Needed', 'Date Created'];
    const csvRows = [
      headers.join(','),
      ...forms.map((row: FormEntry) => [
        row.firstName,
        row.lastName,
        row.companyName,
        row.serviceNeeded,
        row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : '',
      ].map(cell => `"${cell || ''}"`).join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversion-pipeline-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [forms]);

  return (
    <div className="p-2 sm:p-4 lg:p-8">
      <DashboardCards />

      <section className="mt-6 sm:mt-8 bg-white rounded-lg border border-gray-200">
        <aside className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-6">
          <TextTemplate
            title="Conversion Pipeline"
            subtitle="Track, filter, and manage all client inquiries across services and industries" />

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Button icon={<TbCloudDownload size={20} />} text="Export CSV" variant='primary' onClick={handleExport} />
          </div>
        </aside>

        <div className=''>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <DataTable
              data={forms}
              columns={columns}
              keyField="formId"
              onRowSelect={handleRowSelect}
              selectable={true}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

