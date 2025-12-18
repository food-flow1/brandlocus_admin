'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import TimeRangeSelector, { TimeRange, DateRange } from '@/components/TimeRangeSelector';
import SearchInput from '@/components/SearchInput';
import Button from '@/components/Button';
import DataTable, { Column } from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { TbCloudDownload } from 'react-icons/tb';
import FormCard from './FormCard';
import { useForms, FormEntry, FormsFilterParams } from '@/hooks/useForms';
import { formsApi } from '@/lib/api/services/forms';
import { useDebounce } from '@/hooks/useDebounce';
import { AiOutlineEye } from 'react-icons/ai';
import FormDetailsModal from '@/components/modals/FormDetailsModal';
import ExportMenu from '@/components/ExportMenu';


// Map TimeRange to API timeFilter
const getTimeFilter = (range: TimeRange): FormsFilterParams['timeFilter'] => {
  switch (range) {
    case '24hour': return '7days';
    case '7days': return '7days';
    case '30days': return '30days';
    case 'all': return 'alltime';
    default: return 'alltime';
  }
};

// Format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const FormsPage = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  // Local search state for immediate input feedback
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Build filter params
  const filterParams = useMemo((): FormsFilterParams => {
    const params: FormsFilterParams = {
      timeFilter: getTimeFilter(selectedRange),
      page: currentPage - 1,
      limit: itemsPerPage,
    };

    if (debouncedSearchTerm) params.searchTerm = debouncedSearchTerm;
    if (dateRange.startDate) params.startDate = formatDate(dateRange.startDate);
    if (dateRange.endDate) params.endDate = formatDate(dateRange.endDate);

    return params;
  }, [selectedRange, debouncedSearchTerm, dateRange, currentPage]);

  // Fetch forms data (returns both statistics and pagination)
  const { data: formsData, isLoading } = useForms(filterParams);

  // Get forms list from pagination
  const forms = formsData?.pagination?.content || [];
  const totalItems = formsData?.pagination?.totalElements || 0;

  // Get statistics
  const statistics = formsData?.statistics;

  const handleDateRangeSelect = (range: DateRange) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const handleDateRangeClear = () => {
    setDateRange({ startDate: null, endDate: null });
    setCurrentPage(1);
  };


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
      label: 'E-mail',
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
      render: (value: string | null) => value || '-',
    },
    {
      key: 'serviceNeeded',
      label: 'Service Needed',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
          {value.replace(/_/g, ' ').toLowerCase() || "null"}
        </span>
      ),
    },
    {
      key: 'message',
      label: 'Message',
      sortable: true,
      render: (value: string) => (
        <span className="truncate max-w-[200px] block text-gray-500" title={value}>
          {value}
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
          className="flex items-center cursor-pointer justify-center p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
          title="View Details"
        >
          <AiOutlineEye size={18} />
        </button>
      ),
    },
  ];

  const handleExport = async () => {
    const { page, limit, ...exportParams } = filterParams;
    const response = await formsApi.exportForms(exportParams);

    // Extract data and map to clean object for spreadsheet
    const rawData = response.data || [];

    return rawData.map((row: FormEntry) => ({
      'Name': `${row.firstName} ${row.lastName}`,
      'E-mail': row.email,
      'Company Name': row.companyName,
      'Industry': row.industryName || '-',
      'Service Needed': row.serviceNeeded?.replace(/_/g, ' ')?.toLowerCase() || '-',
      'Message': row.message || '-',
      'Date Created': row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : '-'
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TimeRangeSelector
        selectedRange={selectedRange}
        onRangeChange={(range) => {
          setSelectedRange(range);
          setCurrentPage(1);
        }}
        showDatePicker
        onDateRangeSelect={handleDateRangeSelect}
        selectedDateRange={dateRange}
        onDateRangeClear={handleDateRangeClear}
      />

      <FormCard statistics={statistics} isLoading={isLoading} totalElements={totalItems} />

      <section className="mt-6 sm:mt-8 bg-white rounded-lg border border-gray-200">
        <aside className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-6">
          <SearchInput
            placeholder="Search by name, email, company..."
            className="w-full sm:max-w-[500px]"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* <Button icon={<IoFilter size={20} />} text="Filters" onClick={handleFilters} /> */}
            <ExportMenu onExport={handleExport} dname="Forms" disabled={forms.length === 0} />
          </div>
        </aside>

        <div>
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : forms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium">No forms found</p>
              <p className="text-xs mt-1">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              <DataTable
                data={forms}
                columns={columns}
                keyField="formId"
                selectable={false}
              />

              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
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

export default FormsPage;