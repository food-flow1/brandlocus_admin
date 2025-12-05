"use client"

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartDataPoint } from '@/lib/api/services/dashboard'
import { useUserGraph } from '@/hooks/useDashboard'

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Nigeria state/city coordinates mapping
const cityCoordinates: Record<string, [number, number]> = {
  "Lagos": [3.3792, 6.5244],
  "Abuja": [7.4951, 9.0579],
  "Port Harcourt": [7.0498, 4.8156],
  "Abia": [7.4869, 5.4527],
  "Kano": [8.5919, 12.0022],
  "Rivers": [6.8333, 4.75],
  "Oyo": [3.9333, 7.85],
  "Kaduna": [7.4388, 10.5105],
  "Enugu": [7.5139, 6.4402],
  "Delta": [5.6833, 5.8904],
}

// Colors for pie chart
const PIE_COLORS = ['#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16', '#06B6D4', '#A855F7']

interface FilterParams {
  filter?: string;
  startDate?: string;
  endDate?: string;
}

interface TrendsProps {
  chartData: ChartDataPoint[];
  isLoading?: boolean;
  filterParams?: FilterParams;
}

const Trends = ({ chartData, isLoading, filterParams }: TrendsProps) => {
  // Fetch user graph data for location using same params as dashboard
  const { data: userGraphData, isLoading: isUserGraphLoading } = useUserGraph(filterParams || {});

  // Transform chartData to conversation data for pie chart
  // Filter to only show months with conversations
  const conversationData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [];
    }

    // Filter out months with 0 conversations and sort by totalConversations descending
    const filtered = chartData
      .filter(item => item.totalConversations > 0)
      .sort((a, b) => b.totalConversations - a.totalConversations)
      .slice(0, 6); // Take top 6 months

    // Map to pie chart format
    return filtered.map((item, index) => ({
      name: item.label,
      users: item.totalConversations,
      bounceRate: '-', // Not available in API
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [chartData]);

  // Transform userGraphData to location data for map
  const locationData = useMemo(() => {
    if (!userGraphData || userGraphData.length === 0) {
      return [];
    }

    return userGraphData.map((item) => ({
      city: item.state,
      percentage: item.percentage,
      users: `${item.users.toLocaleString()} Users`,
    }));
  }, [userGraphData]);

  // Generate markers from location data
  const markers = useMemo(() => {
    return locationData
      .filter((loc) => cityCoordinates[loc.city])
      .map((loc) => ({
        name: loc.city,
        coordinates: cityCoordinates[loc.city],
      }));
  }, [locationData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Top Conversations */}
      <Card className="h-fit">
        <CardHeader className="pb-2">
          {isLoading ? (
            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
          ) : (
            <CardTitle className="text-sm sm:text-base font-semibold">Top Conversations</CardTitle>
          )}
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {isLoading ? (
            <div className="space-y-6">
              {/* Pie chart skeleton */}
              <div className="flex items-center justify-center py-4">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                  <div className="absolute inset-0 rounded-full border-[20px] border-gray-200 animate-pulse" />
                  <div className="absolute inset-[20px] rounded-full bg-white" />
                </div>
              </div>
              {/* Table skeleton */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 pb-2 border-b">
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-28 bg-gray-200 rounded animate-pulse ml-auto" />
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="grid grid-cols-2 py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          ) : conversationData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm font-medium">No conversation data</p>
              <p className="text-xs mt-1">Conversations will appear here</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center py-2 sm:py-4">
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conversationData}
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="85%"
                        paddingAngle={2}
                        dataKey="users"
                      >
                        {conversationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[280px]">
                  <div className="grid grid-cols-2 text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide pb-2 border-b">
                    <span>Month</span>
                    <span className="text-right">Total Conversations</span>
                  </div>
                  {conversationData.map((item) => (
                    <div key={item.name} className="grid grid-cols-2 py-2 sm:py-3 border-b last:border-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs sm:text-sm text-gray-900 truncate">{item.name}</span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600 text-right">{item.users.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Right Column - User Location */}
      <Card className="h-fit">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          {isUserGraphLoading ? (
            <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
          ) : (
            <CardTitle className="text-sm sm:text-base font-semibold">User Location</CardTitle>
          )}
        </CardHeader>
        <CardContent>
          {isUserGraphLoading ? (
            <div className="space-y-6">
              {/* Map skeleton */}
              <div className="w-full h-[300px] bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg animate-pulse flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              {/* Location stats skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2 text-center sm:text-left">
                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse mx-auto sm:mx-0" />
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mx-auto sm:mx-0" />
                  </div>
                ))}
              </div>
            </div>
          ) : locationData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium">No location data</p>
              <p className="text-xs mt-1">User locations will appear here</p>
            </div>
          ) : (
            <>
              {/* Nigeria Map */}
              <div className="w-full mb-6">
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{
                    scale: 2500,
                    center: [8, 9.5]
                  }}
                  style={{ width: "100%", height: "300px" }}
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const isNigeria = geo.properties.name === "Nigeria"
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={isNigeria ? "#3B82F6" : "#DBEAFE"}
                            stroke="#93C5FD"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: "none" },
                              hover: { outline: "none", fill: isNigeria ? "#2563EB" : "#BFDBFE" },
                              pressed: { outline: "none" },
                            }}
                          />
                        )
                      })
                    }
                  </Geographies>
                  {markers.map(({ name, coordinates }) => (
                    <Marker key={name} coordinates={coordinates}>
                      <circle r={6} fill="#1D4ED8" stroke="#fff" strokeWidth={2} />
                      <text
                        textAnchor="middle"
                        y={-12}
                        style={{ fontSize: 10, fill: "#1D4ED8", fontWeight: 600 }}
                      >
                        {name}
                      </text>
                    </Marker>
                  ))}
                </ComposableMap>
              </div>

              {/* Location Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {locationData.map((location) => (
                  <div key={location.city} className="space-y-1 sm:space-y-2 text-center sm:text-left">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{location.city}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {location.percentage} • {location.users}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Trends