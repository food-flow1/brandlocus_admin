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
  // Predefined Y-axis ticks matching the design: 0, 100, 500, 1K, 10K, 50K
  const yAxisTicks = useMemo(() => [1, 100, 500, 1000, 10000, 50000], []);

  // Format Y-axis label
  const formatYLabel = (value: number) => {
    if (value === 1) return '00';
    if (value < 1000) return value.toString();
    return `${(value / 1000).toFixed(0)}K`;
  };

  // Calculate domain for logarithmic scale
  const domain = useMemo(() => {
    const values = data.map(d => Math.max(1, d.value));
    const maxValue = Math.max(...values);
    const calculatedMax = Math.ceil(maxValue * 1.1);
    const finalMax = Math.max(50000, calculatedMax);
    return [1, finalMax];
  }, [data]);

  // Filter data to ensure we have the dates we want to show
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      value: Math.max(1, item.value),
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
              scale="log"
              ticks={yAxisTicks}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYLabel}
              width={40}
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