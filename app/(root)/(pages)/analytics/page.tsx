'use client';

import { useState, useMemo } from 'react';
import TimeRangeSelector, { TimeRange, DateRange } from '@/components/TimeRangeSelector';
import { UserOverviewChart } from '@/components/charts';
import { useDashboard } from '@/hooks/useDashboard';
import { useForms, FormsFilterParams } from '@/hooks/useForms';
import Trends from './Trends';
import KeyWord from './KeyWord';

const AnalyticsPage = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });

  // Map TimeRange to dashboard filter
  const dashboardParams = useMemo(() => {
    const filterMap: Record<TimeRange, string | undefined> = {
      'all': '12months',
      '30days': '30days',
      '7days': '7days',
      '24hour': '24hour',
    };

    // Format dates to YYYY-MM-DD if they exist
    const formatDate = (date: Date | null): string | undefined => {
      if (!date) return undefined;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formattedStartDate = formatDate(dateRange.startDate);
    const formattedEndDate = formatDate(dateRange.endDate);

    // If custom dates are selected, use '12months' filter, otherwise use the selected range filter
    const filter = (formattedStartDate || formattedEndDate)
      ? '12months'
      : filterMap[selectedRange];

    return {
      filter,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    };
  }, [selectedRange, dateRange]);

  // Handle date range selection from TimeRangeSelector
  const handleDateRangeSelect = (range: DateRange) => {
    setDateRange(range);
  };

  // Handle clearing the date range
  const handleDateRangeClear = () => {
    setDateRange({ startDate: null, endDate: null });
  };

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useDashboard(dashboardParams);

  // --- Forms Data Logic Start ---
  
  // Map dashboard filters to forms filters
  const formsFilterParams: FormsFilterParams = useMemo(() => {
    let timeFilter: FormsFilterParams['timeFilter'] = 'alltime';
    if (dashboardParams.filter === '7days') timeFilter = '7days';
    else if (dashboardParams.filter === '30days') timeFilter = '30days';
    else if (dashboardParams.filter === '12months') timeFilter = '12months';
    else if (dashboardParams.filter === '24hour') timeFilter = '7days'; // Fallback

    return {
        timeFilter,
        startDate: dashboardParams.startDate,
        endDate: dashboardParams.endDate
    };
  }, [dashboardParams]);

  // Fetch current forms data
  const { data: formsData, isLoading: isFormsLoading } = useForms(formsFilterParams);

  // Calculate date helpers for previous period (duplicated logic for safety)
  const getPreviousPeriod = (currentParams: FormsFilterParams, filterType: string | undefined): FormsFilterParams | null => {
      if (!filterType || filterType === 'alltime' || filterType === '12months') {
          // logic placeholder
      }

      const now = new Date();
      const endDate = currentParams.endDate ? new Date(currentParams.endDate) : now;
      
      let daysToSubtract = 0;
      if (filterType === '24hour') daysToSubtract = 1;
      else if (filterType === '7days') daysToSubtract = 7;
      else if (filterType === '30days') daysToSubtract = 30;
      else if (filterType === '12months') daysToSubtract = 365;
      else return null;

      // Current Start Date
      const startDate = currentParams.startDate 
          ? new Date(currentParams.startDate) 
          : new Date(endDate.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));

      // Previous End Date = Current Start Date
      const prevEndDate = new Date(startDate);
      
      // Previous Start Date = Previous End Date - Duration
      const prevStartDate = new Date(prevEndDate.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
      
      return {
          timeFilter: undefined,
          startDate: prevStartDate.toISOString().split('T')[0],
          endDate: prevEndDate.toISOString().split('T')[0]
      };
  };

  const previousFilterParams = useMemo(() => {
      return getPreviousPeriod(formsFilterParams, dashboardParams.filter);
  }, [formsFilterParams, dashboardParams.filter]);

  // Fetch previous forms data
  const { data: prevFormsData } = useForms(previousFilterParams || {}, { 
      enabled: !!previousFilterParams 
  });

  // Calculate forms change
  const formSubmissionsChange = useMemo(() => {
      const currentCount = formsData?.pagination?.totalElements || 0;
      if (!previousFilterParams || prevFormsData?.pagination?.totalElements === undefined) return 0;
      
      const prevCount = prevFormsData.pagination.totalElements;
      if (prevCount === 0) return currentCount > 0 ? 100 : 0; 
      
      return ((currentCount - prevCount) / prevCount) * 100;
  }, [formsData, prevFormsData, previousFilterParams]);

  // --- Forms Data Logic End ---


  // Format number
  const formatNumber = (num: number | string | undefined) => {
    if (num === undefined || num === null) return '0';
    const n = typeof num === 'string' ? parseFloat(num) : num;
    return n.toLocaleString();
  };

  // Format change value as percentage string
  const formatChange = (change: number | undefined): string => {
    if (change === undefined || change === null) return '0%';
    return `${change.toFixed(1)}% ${change >= 0 ? 'Increase' : 'Decrease'}`;
  };

  // Get change type from number
  const getChangeType = (change: number | undefined): 'positive' | 'negative' | 'neutral' => {
    if (change === undefined || change === null || change === 0) return 'neutral';
    return change > 0 ? 'positive' : 'negative';
  };

  // Transform chartData for UserOverviewChart (use totalUsers per month)
  const userOverviewData = useMemo(() => {
    if (!dashboardData?.chartData) return [];
    return dashboardData.chartData.map((item) => ({
      date: item.label,
      value: item.totalUsers,
    }));
  }, [dashboardData]);

  const cards = [
    {
      label: 'Total Conversations',
      value: dashboardData?.totalConversations?.toLocaleString() || '0',
      change: formatChange(dashboardData?.conversationChange),
      changeType: getChangeType(dashboardData?.conversationChange),
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="20" fill="#F0F6FF" />
          <path d="M19.9999 10.25C18.3166 10.2496 16.6619 10.6851 15.1968 11.514C13.7317 12.3428 12.5062 13.5369 11.6395 14.98C10.7728 16.423 10.2944 18.0659 10.251 19.7486C10.2076 21.4314 10.6006 23.0967 11.3918 24.5825L10.3277 27.7747C10.2396 28.039 10.2268 28.3226 10.2908 28.5938C10.3548 28.8649 10.493 29.1129 10.69 29.3099C10.887 29.5069 11.135 29.6451 11.4062 29.7091C11.6773 29.7731 11.9609 29.7603 12.2252 29.6722L15.4174 28.6081C16.725 29.3036 18.1739 29.6921 19.654 29.744C21.1342 29.7959 22.6067 29.51 23.9598 28.9079C25.3129 28.3057 26.5111 27.4033 27.4634 26.269C28.4156 25.1346 29.097 23.7983 29.4557 22.3613C29.8144 20.9244 29.841 19.4246 29.5335 17.9758C29.226 16.527 28.5925 15.1673 27.6811 13.9999C26.7697 12.8325 25.6043 11.8881 24.2733 11.2384C22.9424 10.5886 21.481 10.2506 19.9999 10.25ZM19.9999 28.25C18.5496 28.251 17.1247 27.8691 15.8693 27.1428C15.7774 27.0895 15.6752 27.0563 15.5695 27.0455C15.4638 27.0347 15.357 27.0464 15.2562 27.08L11.7499 28.25L12.919 24.7438C12.9527 24.643 12.9646 24.5362 12.9539 24.4305C12.9433 24.3248 12.9103 24.2226 12.8571 24.1306C11.9477 22.5584 11.5826 20.7299 11.8184 18.929C12.0542 17.128 12.8777 15.4552 14.1613 14.1701C15.4448 12.8849 17.1166 12.0593 18.9172 11.8212C20.7179 11.5831 22.5468 11.9459 24.1202 12.8533C25.6936 13.7607 26.9236 15.162 27.6193 16.8398C28.3151 18.5176 28.4377 20.3781 27.9681 22.1327C27.4986 23.8873 26.4632 25.4379 25.0224 26.5439C23.5817 27.65 21.8163 28.2497 19.9999 28.25Z" fill="#005CE8" />
        </svg>

      ),
    },
    {
        label: 'Form Submissions',
        value: formatNumber(formsData?.pagination?.totalElements),
        change: formatChange(formSubmissionsChange),
        changeType: getChangeType(formSubmissionsChange),
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="44" height="44" rx="22" fill="#DEDEFA" />
                <rect x="2" y="2" width="44" height="44" rx="22" stroke="#EFEFFD" strokeWidth="4" />
                <path d="M11.4 23.7999C11.5051 23.8787 11.6246 23.936 11.7518 23.9686C11.879 24.0012 12.0114 24.0084 12.1414 23.9898C12.2714 23.9712 12.3965 23.9272 12.5095 23.8603C12.6225 23.7934 12.7212 23.7049 12.8 23.5999C13.4055 22.7926 14.1906 22.1374 15.0931 21.6861C15.9957 21.2348 16.9909 20.9999 18 20.9999C19.0091 20.9999 20.0043 21.2348 20.9069 21.6861C21.8094 22.1374 22.5945 22.7926 23.2 23.5999C23.3593 23.8118 23.5963 23.9519 23.8588 23.9891C24.1214 24.0264 24.388 23.9579 24.6 23.7986C24.6756 23.7424 24.7425 23.6754 24.7987 23.5999C25.4042 22.7926 26.1893 22.1374 27.0919 21.6861C27.9944 21.2348 28.9897 20.9999 29.9988 20.9999C31.0078 20.9999 32.0031 21.2348 32.9056 21.6861C33.8082 22.1374 34.5933 22.7926 35.1987 23.5999C35.358 23.812 35.5951 23.9522 35.8578 23.9896C36.1204 24.027 36.3872 23.9585 36.5994 23.7992C36.8115 23.6399 36.9518 23.4029 36.9891 23.1402C37.0265 22.8775 36.958 22.6108 36.7987 22.3986C35.9136 21.2119 34.7332 20.2776 33.375 19.6886C34.1196 19.0088 34.6413 18.1197 34.8716 17.1381C35.1019 16.1565 35.03 15.1282 34.6654 14.1881C34.3009 13.2481 33.6606 12.4402 32.8287 11.8706C31.9967 11.3009 31.012 10.9961 30.0037 10.9961C28.9955 10.9961 28.0108 11.3009 27.1788 11.8706C26.3469 12.4402 25.7066 13.2481 25.3421 14.1881C24.9775 15.1282 24.9056 16.1565 25.1359 17.1381C25.3662 18.1197 25.8879 19.0088 26.6325 19.6886C25.6518 20.1127 24.7609 20.7198 24.0075 21.4774C23.2541 20.7198 22.3632 20.1127 21.3825 19.6886C22.1271 19.0088 22.6488 18.1197 22.8791 17.1381C23.1094 16.1565 23.0375 15.1282 22.6729 14.1881C22.3084 13.2481 21.6681 12.4402 20.8362 11.8706C20.0042 11.3009 19.0195 10.9961 18.0112 10.9961C17.003 10.9961 16.0183 11.3009 15.1863 11.8706C14.3544 12.4402 13.7141 13.2481 13.3496 14.1881C12.985 15.1282 12.9131 16.1565 13.1434 17.1381C13.3737 18.1197 13.8954 19.0088 14.64 19.6886C13.2758 20.2757 12.0896 21.2106 11.2 22.3999C11.1212 22.5049 11.0639 22.6245 11.0313 22.7517C10.9987 22.8789 10.9915 23.0113 11.0101 23.1413C11.0286 23.2713 11.0726 23.3964 11.1395 23.5094C11.2064 23.6224 11.2949 23.7211 11.4 23.7999ZM30 12.9999C30.5933 12.9999 31.1734 13.1758 31.6667 13.5055C32.1601 13.8351 32.5446 14.3036 32.7716 14.8518C32.9987 15.4 33.0581 16.0032 32.9424 16.5851C32.8266 17.1671 32.5409 17.7016 32.1213 18.1212C31.7018 18.5407 31.1672 18.8265 30.5853 18.9422C30.0033 19.058 29.4001 18.9986 28.8519 18.7715C28.3038 18.5444 27.8352 18.1599 27.5056 17.6666C27.1759 17.1732 27 16.5932 27 15.9999C27 15.2042 27.3161 14.4411 27.8787 13.8785C28.4413 13.3159 29.2044 12.9999 30 12.9999ZM18 12.9999C18.5933 12.9999 19.1734 13.1758 19.6667 13.5055C20.1601 13.8351 20.5446 14.3036 20.7716 14.8518C20.9987 15.4 21.0581 16.0032 20.9424 16.5851C20.8266 17.1671 20.5409 17.7016 20.1213 18.1212C19.7018 18.5407 19.1672 18.8265 18.5853 18.9422C18.0033 19.058 17.4001 18.9986 16.8519 18.7715C16.3038 18.5444 15.8352 18.1599 15.5056 17.6666C15.1759 17.1732 15 16.5932 15 15.9999C15 15.2042 15.3161 14.4411 15.8787 13.8785C16.4413 13.3159 17.2044 12.9999 18 12.9999ZM33.375 32.6886C34.1196 32.0088 34.6413 31.1197 34.8716 30.1381C35.1019 29.1565 35.03 28.1282 34.6654 27.1881C34.3009 26.2481 33.6606 25.4402 32.8287 24.8706C31.9967 24.3009 31.012 23.9961 30.0037 23.9961C28.9955 23.9961 28.0108 24.3009 27.1788 24.8706C26.3469 25.4402 25.7066 26.2481 25.3421 27.1881C24.9775 28.1282 24.9056 29.1565 25.1359 30.1381C25.3662 31.1197 25.8879 32.0088 26.6325 32.6886C25.6518 33.1127 24.7609 33.7198 24.0075 34.4774C23.2541 33.7198 22.3632 33.1127 21.3825 32.6886C22.1271 32.0088 22.6488 31.1197 22.8791 30.1381C23.1094 29.1565 23.0375 28.1282 22.6729 27.1881C22.3084 26.2481 21.6681 25.4402 20.8362 24.8706C20.0042 24.3009 19.0195 23.9961 18.0112 23.9961C17.003 23.9961 16.0183 24.3009 15.1863 24.8706C14.3544 25.4402 13.7141 26.2481 13.3496 27.1881C12.985 28.1282 12.9131 29.1565 13.1434 30.1381C13.3737 31.1197 13.8954 32.0088 14.64 32.6886C13.2758 20.2757 12.0896 21.2106 11.2 22.3999C11.1212 22.5049 11.0639 22.6245 11.0313 22.7517C10.9987 22.8789 10.9915 23.0113 11.0101 23.1413C11.0286 23.2713 11.0726 23.3964 11.1395 23.5094C11.2064 23.6224 11.2949 23.7211 11.4 23.7999ZM30 12.9999C30.5933 12.9999 31.1734 13.1758 31.6667 13.5055C32.1601 13.8351 32.5446 14.3036 32.7716 14.8518C32.9987 15.4 33.0581 16.0032 32.9424 16.5851C32.8266 17.1671 32.5409 17.7016 32.1213 18.1212C31.7018 18.5407 31.1672 18.8265 30.5853 18.9422C30.0033 19.058 29.4001 18.9986 28.8519 18.7715C28.3038 18.5444 27.8352 18.1599 27.5056 17.6666C27.1759 17.1732 27 16.5932 27 15.9999C27 15.2042 27.3161 14.4411 27.8787 13.8785C28.4413 13.3159 29.2044 12.9999 30 12.9999ZM18 12.9999C18.5933 12.9999 19.1734 13.1758 19.6667 13.5055C20.1601 13.8351 20.5446 14.3036 20.7716 14.8518C20.9987 15.4 21.0581 16.0032 20.9424 16.5851C20.8266 17.1671 20.5409 17.7016 20.1213 18.1212C19.7018 18.5407 19.1672 18.8265 18.5853 18.9422C18.0033 19.058 17.4001 18.9986 16.8519 18.7715C16.3038 18.5444 15.8352 18.1599 15.5056 17.6666C15.1759 17.1732 15 16.5932 15 15.9999C15 15.2042 15.3161 14.4411 15.8787 13.8785C16.4413 13.3159 17.2044 12.9999 18 12.9999ZM33.375 32.6886C34.1196 32.0088 34.6413 31.1197 34.8716 30.1381C35.1019 29.1565 35.03 28.1282 34.6654 27.1881C34.3009 26.2481 33.6606 25.4402 32.8287 24.8706C31.9967 24.3009 31.012 23.9961 30.0037 23.9961C28.9955 23.9961 28.0108 24.3009 27.1788 24.8706C26.3469 25.4402 25.7066 26.2481 25.3421 27.1881C24.9775 28.1282 24.9056 29.1565 25.1359 30.1381C25.3662 31.1197 25.8879 32.0088 26.6325 32.6886C25.6518 33.1127 24.7609 33.7198 24.0075 34.4774C23.2541 33.7198 22.3632 33.1127 21.3825 32.6886Z" fill="#5C59E8" />
            </svg>
        ),
    },
    {
      label: 'Active Users',
      value: dashboardData?.activeUsers?.toLocaleString() || '0',
      change: formatChange(dashboardData?.userChange),
      changeType: getChangeType(dashboardData?.userChange),
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="20" fill="#FFFAC2" />
          <path d="M10.55 19.8499C10.6288 19.909 10.7185 19.952 10.8139 19.9764C10.9093 20.0009 11.0086 20.0063 11.1061 19.9924C11.2036 19.9784 11.2974 19.9454 11.3821 19.8953C11.4669 19.8451 11.5409 19.7787 11.6 19.6999C12.0541 19.0944 12.6429 18.603 13.3198 18.2646C13.9968 17.9261 14.7432 17.7499 15.5 17.7499C16.2568 17.7499 17.0032 17.9261 17.6802 18.2646C18.3571 18.603 18.9459 19.0944 19.4 19.6999C19.5195 19.8589 19.6972 19.9639 19.8941 19.9918C20.091 20.0198 20.291 19.9684 20.45 19.849C20.5067 19.8068 20.5569 19.7566 20.5991 19.6999C21.0532 19.0944 21.642 18.603 22.3189 18.2646C22.9958 17.9261 23.7422 17.7499 24.4991 17.7499C25.2559 17.7499 26.0023 17.9261 26.6792 18.2646C27.3561 18.603 27.945 19.0944 28.3991 19.6999C28.5185 19.859 28.6963 19.9642 28.8933 19.9922C29.0903 20.0203 29.2904 19.9689 29.4495 19.8494C29.6087 19.73 29.7138 19.5522 29.7419 19.3552C29.7699 19.1582 29.7185 18.9581 29.5991 18.799C28.9352 17.909 28.0499 17.2082 27.0312 16.7665C27.5897 16.2566 27.981 15.5898 28.1537 14.8536C28.3264 14.1174 28.2725 13.3461 27.9991 12.6411C27.7256 11.9361 27.2454 11.3302 26.6215 10.9029C25.9976 10.4757 25.259 10.2471 24.5028 10.2471C23.7466 10.2471 23.0081 10.4757 22.3841 10.9029C21.7602 11.3302 21.28 11.9361 21.0066 12.6411C20.7331 13.3461 20.6792 14.1174 20.8519 14.8536C21.0247 15.5898 21.4159 16.2566 21.9744 16.7665C21.2389 17.0845 20.5707 17.5398 20.0056 18.108C19.4406 17.5398 18.7724 17.0845 18.0369 16.7665C18.5953 16.2566 18.9866 15.5898 19.1593 14.8536C19.332 14.1174 19.2781 13.3461 19.0047 12.6411C18.7313 11.9361 18.2511 11.3302 17.6271 10.9029C17.0032 10.4757 16.2646 10.2471 15.5084 10.2471C14.7522 10.2471 14.0137 10.4757 13.3898 10.9029C12.7658 11.3302 12.2856 11.9361 12.0122 12.6411C11.7387 13.3461 11.6848 14.1174 11.8576 14.8536C12.0303 15.5898 12.4215 16.2566 12.98 16.7665C11.9569 17.2068 11.0672 17.908 10.4 18.7999C10.3409 18.8787 10.2979 18.9683 10.2735 19.0638C10.249 19.1592 10.2436 19.2585 10.2575 19.356C10.2715 19.4535 10.3045 19.5473 10.3546 19.632C10.4048 19.7168 10.4712 19.7908 10.55 19.8499ZM24.5 11.7499C24.945 11.7499 25.38 11.8819 25.75 12.1291C26.12 12.3763 26.4084 12.7277 26.5787 13.1389C26.749 13.55 26.7936 14.0024 26.7068 14.4388C26.62 14.8753 26.4057 15.2762 26.091 15.5909C25.7763 15.9056 25.3754 16.1198 24.939 16.2067C24.5025 16.2935 24.0501 16.2489 23.639 16.0786C23.2278 15.9083 22.8764 15.6199 22.6292 15.2499C22.382 14.8799 22.25 14.4449 22.25 13.9999C22.25 13.4032 22.4871 12.8309 22.909 12.4089C23.331 11.9869 23.9033 11.7499 24.5 11.7499ZM15.5 11.7499C15.945 11.7499 16.38 11.8819 16.75 12.1291C17.12 12.3763 17.4084 12.7277 17.5787 13.1389C17.749 13.55 17.7936 14.0024 17.7068 14.4388C17.62 14.8753 17.4057 15.2762 17.091 15.5909C16.7763 15.9056 16.3754 16.1198 15.939 16.2067C15.5025 16.2935 15.0501 16.2489 14.639 16.0786C14.2278 15.9083 13.8764 15.6199 13.6292 15.2499C13.382 14.8799 13.25 14.4449 13.25 13.9999C13.25 13.4032 13.4871 12.8309 13.909 12.4089C14.331 11.9869 14.9033 11.7499 15.5 11.7499ZM27.0312 26.5165C27.5897 26.0066 27.981 25.3398 28.1537 24.6036C28.3264 23.8674 28.2725 23.0961 27.9991 22.3911C27.7256 21.6861 27.2454 21.0802 26.6215 20.6529C25.9976 20.2257 25.259 19.9971 24.5028 19.9971C23.7466 19.9971 23.0081 20.2257 22.3841 20.6529C21.7602 21.0802 21.28 21.6861 21.0066 22.3911C20.7331 23.0961 20.6792 23.8674 20.8519 24.6036C21.0247 25.3398 21.4159 26.0066 21.9744 26.5165C21.2389 26.8345 20.5707 27.2898 20.0056 27.858C19.4406 27.2898 18.7724 26.8345 18.0369 26.5165C18.5953 26.0066 18.9866 25.3398 19.1593 24.6036C19.332 23.8674 19.2781 23.0961 19.0047 22.3911C18.7313 21.6861 18.2511 21.0802 17.6271 20.6529C17.0032 20.2257 16.2646 19.9971 15.5084 19.9971C14.7522 19.9971 14.0137 20.2257 13.3898 20.6529C12.7658 21.0802 12.2856 21.6861 12.0122 22.3911C11.7387 23.0961 11.6848 23.8674 11.8576 24.6036C12.0303 25.3398 12.4215 26.0066 12.98 26.5165C11.9569 26.9568 11.0672 27.658 10.4 28.5499C10.3409 28.6287 10.2979 28.7183 10.2735 28.8138C10.249 28.9092 10.2436 29.0085 10.2575 29.106C10.2715 29.2035 10.3045 29.2973 10.3546 29.382C10.4048 29.4668 10.4712 29.5408 10.55 29.5999C10.6288 29.659 10.7185 29.702 10.8139 29.7264C10.9093 29.7509 11.0086 29.7563 11.1061 29.7424C11.2036 29.7284 11.2974 29.6954 11.3821 29.6452C11.4669 29.5951 11.5409 29.5287 11.6 29.4499C12.0541 28.8444 12.6429 28.353 13.3198 28.0146C13.9968 27.6761 14.7432 27.4999 15.5 27.4999C16.2568 27.4999 17.0032 27.6761 17.6802 28.0146C18.3571 28.353 18.9459 28.8444 19.4 29.4499C19.5195 29.6089 19.6972 29.7139 19.8941 29.7418C20.091 29.7698 20.291 29.7184 20.45 29.599C20.5067 29.5568 20.5569 29.5066 20.5991 29.4499C21.0532 28.8444 21.642 28.353 22.3189 28.0146C22.9958 27.6761 23.7422 27.4999 24.4991 27.4999C25.2559 27.4999 26.0023 27.6761 26.6792 28.0146C27.3561 28.353 27.945 28.8444 28.3991 29.4499C28.5185 29.609 28.6963 29.7142 28.8933 29.7422C29.0903 29.7703 29.2904 29.7189 29.4495 29.5994C29.6087 29.48 29.7138 29.3022 29.7419 29.1052C29.7699 28.9082 29.7185 28.7081 29.5991 28.549C28.9352 27.659 28.0499 26.9582 27.0312 26.5165ZM15.5 21.4999C15.945 21.4999 16.38 21.6319 16.75 21.8791C17.12 22.1263 17.4084 22.4777 17.5787 22.8889C17.749 23.3 17.7936 23.7524 17.7068 24.1888C17.62 24.6253 17.4057 25.0262 17.091 25.3409C16.7763 25.6556 16.3754 25.8698 15.939 25.9567C15.5025 26.0435 15.0501 25.9989 14.639 25.8286C14.2278 25.6583 13.8764 25.3699 13.6292 24.9999C13.382 24.6299 13.25 24.1949 13.25 23.7499C13.25 23.1532 13.4871 22.5809 13.909 22.1589C14.331 21.7369 14.9033 21.4999 15.5 21.4999ZM24.5 21.4999C24.945 21.4999 25.38 21.6319 25.75 21.8791C26.12 22.1263 26.4084 22.4777 26.5787 22.8889C26.749 23.3 26.7936 23.7524 26.7068 24.1888C26.62 24.6253 26.4057 25.0262 26.091 25.3409C25.7763 25.6556 25.3754 25.8698 24.939 25.9567C24.5025 26.0435 24.0501 25.9989 23.639 25.8286C23.2278 25.6583 22.8764 25.3699 22.6292 24.9999C22.382 24.6299 22.25 24.1949 22.25 23.7499C22.25 23.1532 22.4871 22.5809 22.909 22.1589C23.331 21.7369 23.9033 21.4999 24.5 21.4999Z" fill="#191B1C" />
        </svg>

      ),
    },
    // {
    //   label: 'AI AVG. RESPONSE TIME',
    //   value: '3s',
    //   change: '1.7% Increase',
    //   changeType: 'positive' as const,
    //   icon: (
    //     <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    //       <rect width="40" height="40" rx="20" fill="#DEDEFA" />
    //       <path d="M28.2303 19.0786C28.2019 18.9584 28.1443 18.847 28.0625 18.7545C27.9807 18.6619 27.8774 18.591 27.7616 18.548L22.3607 16.522L23.735 9.64734C23.7662 9.48761 23.7445 9.32209 23.6733 9.17576C23.6021 9.02943 23.4852 8.91022 23.3403 8.83614C23.1954 8.76205 23.0304 8.7371 22.8701 8.76505C22.7097 8.793 22.5629 8.87234 22.4516 8.99109L11.9516 20.2411C11.8663 20.3309 11.8046 20.4405 11.772 20.5601C11.7394 20.6796 11.737 20.8053 11.7648 20.926C11.7927 21.0467 11.85 21.1587 11.9317 21.2518C12.0133 21.345 12.1168 21.4164 12.2328 21.4598L17.6357 23.4858L16.265 30.353C16.2339 30.5127 16.2556 30.6782 16.3268 30.8245C16.398 30.9709 16.5149 31.0901 16.6597 31.1642C16.8046 31.2382 16.9697 31.2632 17.13 31.2352C17.2903 31.2073 17.4372 31.128 17.5485 31.0092L28.0485 19.7592C28.1322 19.6693 28.1926 19.5603 28.2243 19.4416C28.256 19.3229 28.2581 19.1983 28.2303 19.0786ZM18.2535 28.0626L19.235 23.152C19.2702 22.9779 19.2423 22.7969 19.1565 22.6413C19.0706 22.4858 18.9324 22.3658 18.7663 22.3026L13.8125 20.4417L21.7457 11.9423L20.765 16.853C20.7299 17.0271 20.7577 17.2081 20.8436 17.3636C20.9294 17.5192 21.0677 17.6392 21.2338 17.7023L26.1838 19.5586L18.2535 28.0626Z" fill="#5C59E8" />
    //     </svg>
    //   ),
    // },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Time Range Selector */}
        <TimeRangeSelector
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          onDateRangeSelect={handleDateRangeSelect}
          onDateRangeClear={handleDateRangeClear}
          selectedDateRange={dateRange}
        />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            // Skeleton cards
            [...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="pt-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : (
            cards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-[#667085] mb-1">{card.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                  </div>
                  <div>
                    {card.icon}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 pt-2">
                    <div
                      className={`flex items-center gap-1 py-1 w-fit rounded-full text-xs font-medium ${card.changeType === 'positive'
                        ? ' text-[#0D894F]'
                        : card.changeType === 'negative'
                          ? ' text-[#D92D20]'
                          : ' text-gray-600'
                        }`}
                    >
                      {card.changeType === 'positive' && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 2L10 8H2L6 2Z" fill="#0D894F" />
                        </svg>
                      )}
                      {card.changeType === 'negative' && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 10L2 4H10L6 10Z" fill="#D92D20" />
                        </svg>
                      )}
                      {card.change}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* User Overview Chart */}
        <UserOverviewChart
          data={userOverviewData}
          isLoading={isLoading}
        />

        <div>
          <Trends chartData={dashboardData?.chartData || []} isLoading={isLoading} filterParams={dashboardParams} />
        </div>

        <div>
          <KeyWord filterParams={dashboardParams} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

