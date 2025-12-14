'use client';

import { useCallback, useState, useMemo } from 'react';
import DashboardCards from './DashboardCards';
import TextTemplate from '@/components/TextTemplate';
import Button from '@/components/Button';
import { TbCloudDownload } from 'react-icons/tb';
import DataTable, { Column } from '@/components/DataTable';
import { useForms, FormEntry, FormsFilterParams } from '@/hooks/useForms';
import TimeRangeSelector, { TimeRange, DateRange } from '@/components/TimeRangeSelector';

// Map TimeRange to API timeFilter
const getTimeFilter = (range: TimeRange): FormsFilterParams['timeFilter'] => {
  switch (range) {
    case '24hour': return '7days'; // Fallback for forms
    case '7days': return '7days';
    case '30days': return '30days';
    case 'all': return 'alltime';
    default: return 'alltime';
  }
};

// Map TimeRange to API filter values for DashboardCards
const getTimeFilterForCards = (range: TimeRange): string => {
    switch (range) {
        case 'all': return '12months';
        case '30days': return '30days';
        case '7days': return '7days';
        case '24hour': return '24hour';
        default: return '12months';
    }
};

// Format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const DashboardPage = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });

  // Build filter params
  const filterParams = useMemo((): FormsFilterParams => {
    const params: FormsFilterParams = {
      timeFilter: getTimeFilter(selectedRange),
    };

    if (dateRange.startDate) params.startDate = formatDate(dateRange.startDate);
    if (dateRange.endDate) params.endDate = formatDate(dateRange.endDate);

    return params;
  }, [selectedRange, dateRange]);

  // Build filter params for cards (separate because different API expectations)
  const cardFilterParams = useMemo(() => {
    return {
      filter: getTimeFilterForCards(selectedRange),
      startDate: dateRange.startDate ? formatDate(dateRange.startDate) : undefined,
      endDate: dateRange.endDate ? formatDate(dateRange.endDate) : undefined,
    };
  }, [selectedRange, dateRange]);

  // Fetch forms data
  const { data: formsData, isLoading } = useForms(filterParams);

  const handleDateRangeSelect = (range: DateRange) => {
    setDateRange(range);
  };

  const handleDateRangeClear = () => {
    setDateRange({ startDate: null, endDate: null });
  };

  // Get forms list from pagination
  const forms = formsData?.pagination?.content || [];



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
      <TimeRangeSelector
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        showDatePicker
        onDateRangeSelect={handleDateRangeSelect}
        selectedDateRange={dateRange}
        onDateRangeClear={handleDateRangeClear}
      />

      <DashboardCards filterParams={cardFilterParams} />

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
              selectable={false}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

