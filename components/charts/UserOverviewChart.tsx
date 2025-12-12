"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface DataPoint {
  date: string;
  value: number;
}

export interface UserOverviewChartProps {
  data: DataPoint[];
  isLoading?: boolean;
}

const chartConfig = {
  value: {
    label: "Users",
    color: "#3B82F6",
  },
} satisfies ChartConfig

const UserOverviewChart: React.FC<UserOverviewChartProps> = ({ data, isLoading }) => {
  // Calculate Y-axis ticks dynamically based on data
  const { yAxisTicks, domain } = useMemo(() => {
    if (!data || data.length === 0) {
      return { yAxisTicks: [0, 25, 50, 75, 100], domain: [0, 100] };
    }

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);

    // If all values are 0, return default scale
    if (maxValue === 0) {
      return { yAxisTicks: [0, 25, 50, 75, 100], domain: [0, 100] };
    }

    // Calculate a nice max value (round up to a nice number)
    const getNiceMax = (max: number): number => {
      if (max <= 5) return 5;
      if (max <= 10) return 10;
      if (max <= 25) return 25;
      if (max <= 50) return 50;
      if (max <= 100) return 100;
      if (max <= 250) return 250;
      if (max <= 500) return 500;
      if (max <= 1000) return 1000;
      if (max <= 2500) return 2500;
      if (max <= 5000) return 5000;
      if (max <= 10000) return 10000;
      if (max <= 25000) return 25000;
      if (max <= 50000) return 50000;
      if (max <= 100000) return 100000;
      // For larger values, round up to nearest power of 10
      const magnitude = Math.pow(10, Math.ceil(Math.log10(max)));
      return magnitude;
    };

    const niceMax = getNiceMax(maxValue * 1.1); // Add 10% padding

    // Generate 5 evenly spaced ticks from 0 to niceMax
    const tickCount = 5;
    const tickInterval = niceMax / (tickCount - 1);
    const ticks = Array.from({ length: tickCount }, (_, i) => Math.round(i * tickInterval));

    return { yAxisTicks: ticks, domain: [0, niceMax] };
  }, [data]);

  // Format Y-axis label
  const formatYLabel = (value: number) => {
    if (value === 0) return '0';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      value: Math.max(0, item.value),
    }));
  }, [data]);

  // Check if data is empty or all zeros
  const hasData = data.length > 0 && data.some(d => d.value > 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full">
            <div className="flex h-full">
              {/* Y-axis skeleton */}
              <div className="flex flex-col justify-between py-4 pr-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
              {/* Chart area skeleton */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg animate-pulse" />
                {/* X-axis skeleton */}
                <div className="flex justify-between pt-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-medium">No user data available</p>
            <p className="text-xs mt-1">Data will appear here once users start interacting</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Overview</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 10, right: 12, left: 12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="userOverviewGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={50}
            />
            <YAxis
              type="number"
              domain={domain}
              ticks={yAxisTicks}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYLabel}
              width={45}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              type="natural"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              fill="url(#userOverviewGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default UserOverviewChart;