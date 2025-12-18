'use client';

import { useCallback, useState, useMemo } from 'react';
import DashboardCards from './DashboardCards';
import TextTemplate from '@/components/TextTemplate';
import Button from '@/components/Button';
import { TbCloudDownload } from 'react-icons/tb';
import DataTable, { Column } from '@/components/DataTable';
import { useForms, FormEntry, FormsFilterParams } from '@/hooks/useForms';
import TimeRangeSelector, { TimeRange, DateRange } from '@/components/TimeRangeSelector';
import { AiOutlineEye } from 'react-icons/ai';
import FormDetailsModal from '@/components/modals/FormDetailsModal';
import { useDebounce } from '@/hooks/useDebounce';
import { formsApi } from '@/lib/api/services/forms';
import ExportMenu from '@/components/ExportMenu';
import { usersApi } from '@/lib/api/services/users';


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


  // State for view modal
  const [selectedForm, setSelectedForm] = useState<FormEntry | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleView = (form: FormEntry) => {
    setSelectedForm(form);
    setIsViewModalOpen(true);
  };

  const columns: Column<FormEntry>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'companyName',
      label: 'Company Name',
      sortable: true,
    },
     {
      key: 'industryName',
      label: 'Sector',
      sortable: true,
      // render: (value: string | null) => value || '-',
      render: (value: string) => (
        <span className="truncate capitalize block text-gray-500" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: 'serviceNeeded',
      label: 'Service Needed',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex items-center px-2 capitalize py-0.5 text-sm font-medium rounded-full bg-blue-50 text-blue-700">
          {value.replace(/_/g, ' ').toLowerCase() || "null"}
        </span>
      ),
    },
    {
      key: 'message',
      label: 'Message',
      sortable: true,
      render: (value: string) => (
        <span className="truncate max-w-[200px] block" title={value}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'submittedAt',
      label: 'Date Created',
      sortable: true,
      render: (value: string | null) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleView(row);
          }}
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
          title="View Details"
        >
          <AiOutlineEye size={18} />
        </button>
      ),
    },
  ];

  const handleExport = async () => {
    const response = await formsApi.exportForms(filterParams);
    
    // Extract data and map to clean object for spreadsheet
    const rawData = response.data || [];
    
    return rawData.map((row: FormEntry) => ({
      'Name': `${row.firstName} ${row.lastName}`,
      'E-mail': row.email || '-',
      'Company Name': row.companyName || '-',
      'Sector': row.industryName || '-',
      'Service Needed': row.serviceNeeded?.replace(/_/g, ' ')?.toLowerCase() || '-',
      'Message': row.message || '-',
      'Date Created': row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : '-'
    }));
  };

  return (
    <div className="p-2 sm:p-4 lg:p-8">
      <div className="mb-6">
        <TimeRangeSelector
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          showDatePicker
          onDateRangeSelect={handleDateRangeSelect}
          selectedDateRange={dateRange}
          onDateRangeClear={handleDateRangeClear}
        />
      </div>

      <DashboardCards filterParams={cardFilterParams} />

      <section className="mt-6 sm:mt-8 bg-white rounded-lg border border-gray-200">
        <aside className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-6">
          <TextTemplate
            title="Conversion Pipeline"
            subtitle="Track, filter, and manage all client inquiries across services and industries" />

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <ExportMenu onExport={handleExport} dname="Conversion Pipeline" disabled={forms.length === 0} />
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

      <FormDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={selectedForm}
      />
    </div>
  );
};

export default DashboardPage;

