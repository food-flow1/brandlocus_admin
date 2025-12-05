'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import DataTable, { Column } from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import TimeRangeSelector, { TimeRange } from '@/components/TimeRangeSelector';
import { ROUTES } from '@/constants/routes';
import { IoEyeOutline, IoFilter } from 'react-icons/io5';
import { TbCloudDownload } from 'react-icons/tb';
import { ChevronDown } from 'lucide-react';
import { useChatSessions, useExportChatSessions } from '@/hooks/useChatSessions';
import { ChatSessionsFilterParams, ChatSession } from '@/lib/api/services/chatSessions';
import { stripMarkdown } from '@/lib/utils/formatMessage';

// Filter state interface
interface FilterState {
  searchTerm: string;
  sessionId: string;
  startDate: string;
  endDate: string;
}

const ChatLogPage = () => {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    sessionId: '',
    startDate: '',
    endDate: '',
  });

  // Temp filter state for dropdown
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  // Map TimeRange to API timeFilter
  const getTimeFilter = (range: TimeRange): ChatSessionsFilterParams['timeFilter'] => {
    const mapping: Record<TimeRange, ChatSessionsFilterParams['timeFilter']> = {
      all: 'alltime',
      '30days': '30days',
      '7days': '7days',
      '24hour': '24hours',
    };
    return mapping[range];
  };

  // Build API params from current state
  const apiParams: ChatSessionsFilterParams = useMemo(() => ({
    searchTerm: filters.searchTerm || undefined,
    sessionId: filters.sessionId ? parseInt(filters.sessionId) : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    timeFilter: getTimeFilter(selectedRange),
  }), [filters, selectedRange]);

  // Fetch chat sessions
  const { data, isLoading, error, refetch } = useChatSessions(apiParams);
  const exportChatSessionsMutation = useExportChatSessions();

  // Extract data from response - API returns { content: [], page, size, totalElements, totalPages, last }
  const chatSessions = data?.content || [];
  const totalItems = data?.totalElements || 0;

  // Count active filters (excluding searchTerm)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.sessionId) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  }, [filters]);

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
    setCurrentPage(1);
  }, []);

  const handleToggleFilters = useCallback(() => {
    if (!showFilterDropdown) {
      setTempFilters(filters);
    }
    setShowFilterDropdown(prev => !prev);
  }, [filters, showFilterDropdown]);

  const handleApplyFilters = useCallback(() => {
    setFilters(tempFilters);
    setShowFilterDropdown(false);
    setCurrentPage(1);
  }, [tempFilters]);

  const handleClearFilters = useCallback(() => {
    const emptyFilters: FilterState = {
      searchTerm: '',
      sessionId: '',
      startDate: '',
      endDate: '',
    };
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
    setShowFilterDropdown(false);
    setCurrentPage(1);
  }, []);

  const handleExport = useCallback(() => {
    exportChatSessionsMutation.mutate(apiParams);
  }, [apiParams, exportChatSessionsMutation]);

  const columns: Column<ChatSession>[] = [
    {
      key: 'sessionId',
      label: 'Session ID',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'content',
      label: 'Content',
      sortable: false,
      render: (value: string) => {
        const cleanContent = stripMarkdown(value);
        return (
          <span className="line-clamp-2 max-w-md" title={cleanContent}>
            {cleanContent}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'ACKNOWLEDGED'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`${ROUTES.chatLog}/${row.sessionId}`);
          }}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <IoEyeOutline size={18} />
          <span>View</span>
        </button>
      ),
    },
  ];


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TimeRangeSelector
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
      />

      <section className="mt-6 sm:mt-8 bg-white rounded-lg border border-gray-200">
        <aside className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-6">
          <SearchInput
            placeholder="Search by name or question"
            className="w-full sm:max-w-[500px]"
            value={filters.searchTerm}
            onSearch={handleSearch}
          />

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Filter Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={handleToggleFilters}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                  showFilterDropdown || activeFiltersCount > 0
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IoFilter size={18} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Filter Dropdown Panel */}
              {showFilterDropdown && (
                <div className="absolute right-0 sm:left-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-900">Filter Sessions</span>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={handleClearFilters}
                        className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Filter Fields */}
                  <div className="p-4 space-y-4">
                    {/* Session ID */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                        Session ID
                      </label>
                      <input
                        type="number"
                        value={tempFilters.sessionId}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, sessionId: e.target.value }))}
                        placeholder="Enter session ID"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                        Date Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input
                            type="date"
                            value={tempFilters.startDate}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          />
                          <span className="absolute -top-2 left-2 px-1 bg-white text-[10px] text-gray-400">From</span>
                        </div>
                        <div className="relative">
                          <input
                            type="date"
                            value={tempFilters.endDate}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          />
                          <span className="absolute -top-2 left-2 px-1 bg-white text-[10px] text-gray-400">To</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button
              icon={<TbCloudDownload size={20} />}
              text={exportChatSessionsMutation.isPending ? 'Exporting...' : 'Export'}
              variant="primary"
              onClick={handleExport}
              disabled={exportChatSessionsMutation.isPending}
            />
          </div>
        </aside>

        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-red-500 mb-4">Failed to load chat sessions</p>
              <Button text="Retry" onClick={() => refetch()} />
            </div>
          ) : chatSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-500 mb-2">No chat sessions found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            <DataTable
              data={chatSessions}
              columns={columns}
              keyField="sessionId"
              selectable={false}
            />
          )}

          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChatLogPage;

