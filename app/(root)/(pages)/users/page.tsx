'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Select, { StylesConfig } from 'react-select';
import { Country, State, ICountry, IState } from 'country-state-city';
import TimeRangeSelector, { TimeRange, DateRange } from '@/components/TimeRangeSelector';
import SearchInput from '@/components/SearchInput';
import Button from '@/components/Button';
import DataTable, { Column } from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { IoFilter } from 'react-icons/io5';
import { ChevronDown } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { UsersFilterParams, User } from '@/lib/api/services/users';
import { useDebounce } from '@/hooks/useDebounce';
import ExportMenu from '@/components/ExportMenu';
import { usersApi } from '@/lib/api/services/users';
import { AiOutlineEye } from 'react-icons/ai';
import UserDetailsModal from '@/components/modals/UserDetailsModal';

// Extended User type for table display
interface UserEntry extends User {
  id: number | null;
}

// Filter state interface
interface FilterState {
  searchTerm: string;
  state: string;
  stateCode: string;
  country: string;
  countryCode: string;
  startDate: string;
  endDate: string;
}

// Select option type
interface SelectOption {
  value: string;
  label: string;
  code?: string;
}

// Custom styles for react-select
const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: '42px',
    borderRadius: '8px',
    borderColor: state.isFocused ? '#22c55e' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(34, 197, 94, 0.2)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#22c55e' : '#d1d5db',
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#22c55e'
      : state.isFocused
      ? '#f0fdf4'
      : 'white',
    color: state.isSelected ? 'white' : '#374151',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#16a34a',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: '#9ca3af',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#374151',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '200px',
  }),
};

// Nigeria country code
const NIGERIA_CODE = 'NG';

const UsersPage = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserEntry | null>(null);
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

  // Get Nigeria data for default
  const nigeriaData = useMemo(() => Country.getCountryByCode(NIGERIA_CODE), []);

  // Filter state - Nigeria as default country
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    state: '',
    stateCode: '',
    country: nigeriaData?.name || 'Nigeria',
    countryCode: NIGERIA_CODE,
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

  // Temp filter state for dropdown
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  // Get all countries as select options
  const countryOptions: SelectOption[] = useMemo(() => {
    return Country.getAllCountries().map((country: ICountry) => ({
      value: country.isoCode,
      label: country.name,
      code: country.isoCode,
    }));
  }, []);

  // Get states for selected country as select options
  const stateOptions: SelectOption[] = useMemo(() => {
    if (!tempFilters.countryCode) return [];
    return State.getStatesOfCountry(tempFilters.countryCode).map((state: IState) => ({
      value: state.isoCode,
      label: state.name,
      code: state.isoCode,
    }));
  }, [tempFilters.countryCode]);

  // Selected country option
  const selectedCountryOption = useMemo(() => {
    if (!tempFilters.countryCode) return null;
    return countryOptions.find(opt => opt.value === tempFilters.countryCode) || null;
  }, [tempFilters.countryCode, countryOptions]);

  // Selected state option
  const selectedStateOption = useMemo(() => {
    if (!tempFilters.stateCode) return null;
    return stateOptions.find(opt => opt.value === tempFilters.stateCode) || null;
  }, [tempFilters.stateCode, stateOptions]);

  // Map TimeRange to API timeFilter
  const getTimeFilter = (range: TimeRange): UsersFilterParams['timeFilter'] => {
    const mapping: Record<TimeRange, UsersFilterParams['timeFilter']> = {
      all: 'alltime',
      '30days': '30days',
      '7days': '7days',
      '24hour': '24hours',
    };
    return mapping[range];
  };

  // Build API params from current state
  const apiParams: UsersFilterParams = useMemo(() => {
    const params: UsersFilterParams = {
      timeFilter: getTimeFilter(selectedRange),
    };
    
    if (filters.searchTerm && filters.searchTerm.trim()) {
      params.searchTerm = filters.searchTerm.trim();
    }
    
    if (filters.state && filters.state.trim()) {
      params.state = filters.state.trim();
    }
    
    if (filters.country && filters.country.trim()) {
      params.country = filters.country.trim();
    }
    
    
    // Only include dates if they have valid values
    if (filters.startDate && filters.startDate.trim() && filters.startDate !== '') {
      params.startDate = filters.startDate.trim();
    }
    
    if (filters.endDate && filters.endDate.trim() && filters.endDate !== '') {
      params.endDate = filters.endDate.trim();
    }

    // Pagination
    params.page = currentPage - 1;
    params.limit = itemsPerPage;
    
    return params;
  }, [filters, selectedRange, currentPage]);

  // API hooks
  const { data: usersResponse, isLoading, error, refetch } = useUsers(apiParams);

  // Get users data
  const users: UserEntry[] = useMemo(() => {
    if (!usersResponse?.data?.content) return [];
    return usersResponse.data.content.map(user => ({
      ...user,
      id: user.userId,
    }));
  }, [usersResponse]);

  const totalItems = usersResponse?.data?.totalElements || users.length;

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setLocalSearchTerm(value);
  }, []);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setSelectedRange(range);
    setCurrentPage(1);
  }, []);

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleDateRangeSelect = useCallback((range: DateRange) => {
    setDateRange(range);
    // Also update the filters state for consistency
    setFilters(prev => ({
      ...prev,
      startDate: range.startDate ? formatDate(range.startDate) : '',
      endDate: range.endDate ? formatDate(range.endDate) : '',
    }));
    setCurrentPage(1);
  }, []);

  const handleDateRangeClear = useCallback(() => {
    setDateRange({ startDate: null, endDate: null });
    setFilters(prev => ({
      ...prev,
      startDate: '',
      endDate: '',
    }));
    setCurrentPage(1);
  }, []);

  const handleToggleFilters = useCallback(() => {
    if (!showFilterDropdown) {
      // Sync temp filters with current filters (including dates from dateRange)
      setTempFilters({
        ...filters,
        startDate: dateRange.startDate ? formatDate(dateRange.startDate) : filters.startDate,
        endDate: dateRange.endDate ? formatDate(dateRange.endDate) : filters.endDate,
      });
    }
    setShowFilterDropdown(prev => !prev);
  }, [filters, showFilterDropdown, dateRange]);

  const handleApplyFilters = useCallback(() => {
    // Ensure dates are properly formatted
    const formattedFilters = {
      ...tempFilters,
      startDate: tempFilters.startDate || '',
      endDate: tempFilters.endDate || '',
    };
    setFilters(formattedFilters);
    // Sync dateRange state with filter dates
    setDateRange({
      startDate: tempFilters.startDate ? new Date(tempFilters.startDate) : null,
      endDate: tempFilters.endDate ? new Date(tempFilters.endDate) : null,
    });
    setShowFilterDropdown(false);
    setCurrentPage(1);
  }, [tempFilters]);

  const handleClearFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      searchTerm: '',
      state: '',
      stateCode: '',
      country: nigeriaData?.name || 'Nigeria',
      countryCode: NIGERIA_CODE,
      startDate: '',
      endDate: '',
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setDateRange({ startDate: null, endDate: null });
    setShowFilterDropdown(false);
    setCurrentPage(1);
  }, [nigeriaData?.name]);


  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.state) count++;
    if (filters.country) count++;
    // Date filters are now top-level, so we don't count them here
    return count;
  }, [filters]);

  const columns: Column<UserEntry>[] = [
    {
      key: 'firstName',
      label: 'Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {row.profileImageUrl ? (
              <img src={row.profileImageUrl} alt={`${row.firstName} ${row.lastName}`} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-green-700">
                {row.firstName?.[0]}{row.lastName?.[0]}
              </span>
            )}
          </div>
          <span className="font-medium text-gray-900">{`${row.firstName} ${row.lastName}`}</span>
        </div>
      ),
    },
    { key: 'email', label: 'E-mail', sortable: false },
    { key: 'businessName', label: 'Business Name', sortable: true },
    {
      key: 'businessBrief',
      label: 'Business Brief',
      sortable: true,
      render: (value: string) => (
        <span className="truncate max-w-[200px] block" title={value}>
          {value || '-'}
        </span>
      ),
    },
    { key: 'industryName', label: 'Sector', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    { key: 'country', label: 'Country', sortable: true },
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

  const handleView = (user: UserEntry) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TimeRangeSelector
        selectedRange={selectedRange}
        onRangeChange={handleTimeRangeChange}
        showDatePicker={false}
        onDateRangeSelect={handleDateRangeSelect}
        onDateRangeClear={handleDateRangeClear}
        selectedDateRange={dateRange}
        
      />

      <section className="mt-6 sm:mt-8 bg-white rounded-lg border border-gray-200">
        <aside className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-6">
          <SearchInput
            placeholder="Search by name, email, or phone"
            className="w-full sm:max-w-[500px]"
            value={localSearchTerm}
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
                    <span className="text-sm font-semibold text-gray-900">Filter Users</span>
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
                    {/* Country */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                        Country
                      </label>
                      <Select
                        value={selectedCountryOption}
                        onChange={(option) => {
                          setTempFilters(prev => ({
                            ...prev,
                            country: option?.label || '',
                            countryCode: option?.value || '',
                            state: '',
                            stateCode: '',
                          }));
                        }}
                        options={countryOptions}
                        placeholder="Search country..."
                        isClearable
                        isSearchable
                        styles={selectStyles}
                        classNamePrefix="react-select"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                        State / Region
                      </label>
                      <Select
                        value={selectedStateOption}
                        onChange={(option) => {
                          setTempFilters(prev => ({
                            ...prev,
                            state: option?.label || '',
                            stateCode: option?.value || '',
                          }));
                        }}
                        options={stateOptions}
                        placeholder={tempFilters.countryCode ? "Search state..." : "Select country first"}
                        isClearable
                        isSearchable
                        isDisabled={!tempFilters.countryCode}
                        styles={selectStyles}
                        classNamePrefix="react-select"
                        noOptionsMessage={() =>
                          tempFilters.countryCode
                            ? "No states found"
                            : "Select a country first"
                        }
                      />
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

     
            <ExportMenu 
              onExport={async () => {
                const { page, limit, ...exportParams } = apiParams;
                const response = await usersApi.exportUsers(exportParams);
                
                // Extract data and map to clean object for spreadsheet
                const rawData = response.data || [];
                
                return rawData.map((row: User) => ({
                  'Name': `${row.firstName} ${row.lastName}`,
                  'E-mail': row.email || '-',
                  'Business Name': row.businessName || '-',
                  'Business Brief': row.businessBrief || '-',
                  'Industry': row.industryName || '-',
                  'State': row.state || '-',
                  'Country': row.country || '-',
                }));
              }} 
              dname="Users" 
              disabled={users.length === 0} 
            />
          </div>
        </aside>

        <div>
          {isLoading ? (
            <div className="overflow-x-auto bg-white">
              {/* Table Header Skeleton */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-8 gap-4 px-4 sm:px-6 py-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
              {/* Table Rows Skeleton */}
              {[...Array(5)].map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`border-b border-gray-100 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="grid grid-cols-8 gap-4 px-4 sm:px-6 py-4">
                    {[...Array(8)].map((_, colIndex) => (
                      <div
                        key={colIndex}
                        className="h-4 bg-gray-200 rounded animate-pulse"
                        style={{ animationDelay: `${(rowIndex * 7 + colIndex) * 50}ms` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="mb-4 p-3 bg-red-50 rounded-full">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load users</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md">
                We encountered an error while loading the users. Please try again.
              </p>
              <Button text="Retry" variant="primary" onClick={() => refetch()} />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="mb-4 p-3 bg-gray-100 rounded-full">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-sm text-gray-500 mb-1 max-w-md">
                {activeFiltersCount > 0
                  ? 'No users match your current filters. Try adjusting your search criteria.'
                  : 'There are no users in the system yet.'}
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <DataTable
              data={users}
              columns={columns}
              keyField="id"
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

      <UserDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={selectedUser}
      />
    </div>
  );
};

export default UsersPage;