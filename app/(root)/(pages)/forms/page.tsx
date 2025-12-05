'use client';

import { useState, useMemo } from 'react';
import TimeRangeSelector, { TimeRange, DateRange } from '@/components/TimeRangeSelector';
import SearchInput from '@/components/SearchInput';
import Button from '@/components/Button';
import DataTable, { Column } from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { TbCloudDownload } from 'react-icons/tb';
import FormCard from './FormCard';
import { useForms, FormEntry, FormsFilterParams } from '@/hooks/useForms';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Build filter params
  const filterParams = useMemo((): FormsFilterParams => {
    const params: FormsFilterParams = {
      timeFilter: getTimeFilter(selectedRange),
    };

    if (searchTerm) params.searchTerm = searchTerm;
    if (dateRange.startDate) params.startDate = formatDate(dateRange.startDate);
    if (dateRange.endDate) params.endDate = formatDate(dateRange.endDate);

    return params;
  }, [selectedRange, searchTerm, dateRange]);

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

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
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
      key: 'serviceNeeded',
      label: 'Service Needed',
      sortable: true,
    },
    {
      key: 'source',
      label: 'Source',
      sortable: true,
    },
    // {
    //   key: 'actions',
    //   label: 'Actions',
    //   sortable: false,
    //   render: (_, row) => (
    //     <button
    //       onClick={(e) => {
    //         e.stopPropagation();
    //         router.push(`/forms/${row.formId}`);
    //       }}
    //       className="flex items-center cursor-pointer gap-2 text-blue-600 hover:text-blue-800 transition-colors"
    //     >
    //       <AiOutlineEye size={18} />
    //       <span>View</span>
    //     </button>
    //   ),
    // },
  ];

  const handleExport = () => {
    if (forms.length === 0) return;

    // Helper to escape CSV values
    const escapeCSV = (value: string | null | undefined) => {
      if (!value) return '';
      const escaped = String(value).replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    // Convert data to CSV
    const headers = ['First Name', 'Last Name', 'Email', 'Company Name', 'Service Needed', 'Message', 'Status', 'Date Submitted'];
    const csvRows = [
      headers.join(','),
      ...forms.map(row => [
        escapeCSV(row.firstName),
        escapeCSV(row.lastName),
        escapeCSV(row.email),
        escapeCSV(row.companyName),
        escapeCSV(row.serviceNeeded),
        escapeCSV(row.message),
        escapeCSV(row.status),
        escapeCSV(row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : ''),
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forms-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

      <FormCard statistics={statistics} isLoading={isLoading} />

      <section className="mt-6 sm:mt-8 bg-white rounded-lg border border-gray-200">
        <aside className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-6">
          <SearchInput
            placeholder="Search by name, email, company..."
            className="w-full sm:max-w-[500px]"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* <Button icon={<IoFilter size={20} />} text="Filters" onClick={handleFilters} /> */}
            <Button icon={<TbCloudDownload size={20} />} text="Export" variant="primary" onClick={handleExport} />
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
    </div>
  );
};

export default FormsPage;