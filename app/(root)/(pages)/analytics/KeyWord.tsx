'use client'

import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useUserGraph } from '@/hooks/useDashboard'

interface FilterParams {
  filter?: string;
  startDate?: string;
  endDate?: string;
}

interface KeyWordProps {
  filterParams?: FilterParams;
}

const KeyWord = ({ filterParams }: KeyWordProps) => {
  const { data: userGraphData, isLoading } = useUserGraph(filterParams || {});

  // Transform topKeywords to array
  const keywords = useMemo(() => {
    if (!userGraphData?.topKeywords || typeof userGraphData.topKeywords !== 'object') {
      return [];
    }

    return Object.entries(userGraphData.topKeywords)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count);
  }, [userGraphData]);

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base font-semibold">Key Word Analytics</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {isLoading ? (
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-8 sm:h-10 w-20 sm:w-28 bg-gray-200 rounded-full animate-pulse"
              />
            ))}
          </div>
        ) : keywords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-sm font-medium">No keywords found</p>
            <p className="text-xs mt-1">Keywords will appear here</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {keywords.map(({ keyword, count }, index) => (
              <button
                key={`${keyword}-${index}`}
                className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-gray-700 text-xs sm:text-sm rounded-full border border-blue-100 transition-colors"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                <span className="whitespace-nowrap">{keyword}</span>
                <span className="text-blue-500 font-medium">({count})</span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default KeyWord
