'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import TimeRangeSelector, { TimeRange } from '@/components/TimeRangeSelector';
import { ROUTES } from '@/constants/routes';
import { IoEyeOutline } from 'react-icons/io5';
import { useChatSessions } from '@/hooks/useChatSessions';
import { ChatSessionsFilterParams, ChatSession } from '@/lib/api/services/chatSessions';
import { stripMarkdown } from '@/lib/utils/formatMessage';
import { useDebounce } from '@/hooks/useDebounce';
import ExportMenu from '@/components/ExportMenu';
import Button from '@/components/Button';

// Filter state interface
interface FilterState {
  searchTerm: string;
  startDate: string;
  endDate: string;
}

const ChatLogPage = () => {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    startDate: '',
    endDate: '',
  });

  // Local search state for immediate input feedback
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  // Update filters when debounced search term changes
  useEffect(() => {
    setFilters(prev => {
      if (prev.searchTerm === debouncedSearchTerm) return prev;
      return { ...prev, searchTerm: debouncedSearchTerm };
    });
    // Only reset page if search term actually changed
    if (filters.searchTerm !== debouncedSearchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

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
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    timeFilter: getTimeFilter(selectedRange),
    page: currentPage - 1,
    size: itemsPerPage,
  }), [filters, selectedRange, currentPage]);

  // Fetch chat sessions
  const { data, isLoading, error, refetch } = useChatSessions(apiParams);

  // Extract data from response - API returns { content: [], page, size, totalElements, totalPages, last }
  const chatSessions = data?.content || [];
  const totalItems = data?.totalElements || 0;

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setLocalSearchTerm(value);
  }, []);

  const handleDateRangeSelect = useCallback((range: { startDate: Date | null; endDate: Date | null }) => {
    if (range.startDate && range.endDate) {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setFilters(prev => ({
        ...prev,
        startDate: formatDate(range.startDate!),
        endDate: formatDate(range.endDate!),
      }));
      setCurrentPage(1);
    }
  }, []);

  const handleDateRangeClear = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      startDate: '',
      endDate: '',
    }));
    setCurrentPage(1);
  }, []);

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
        onDateRangeSelect={handleDateRangeSelect}
        onDateRangeClear={handleDateRangeClear}
        selectedDateRange={
          filters.startDate && filters.endDate
            ? {
                startDate: new Date(filters.startDate),
                endDate: new Date(filters.endDate),
              }
            : undefined
        }
      />

      <section className="mt-6 sm:mt-8 bg-white rounded-lg border border-gray-200">
        <aside className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-6">
          <SearchInput
            placeholder="Search by name or question"
            className="w-full sm:max-w-[500px]"
            value={localSearchTerm}
            onSearch={handleSearch}
          />

          {/* <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <ExportMenu data={chatSessions} dname="Chat_Logs" />
          </div> */}
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