import { Plus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const keywords = [
  'Consultation',
  'Marketing',
  'Sales',
  'Partnership',
  'Performance',
  'Content Creation',
  'Lead Generation',
  'Funding',
  'Rebranding',
  'Customer Experience',
  'Campaigns',
  'Campaigns',
  'Innovations',
]

const KeyWord = () => {
  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base font-semibold">Key Word Analytics</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {keywords.map((keyword, index) => (
            <button
              key={`${keyword}-${index}`}
              className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-gray-700 text-xs sm:text-sm rounded-full border border-blue-100 transition-colors"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
              <span className="whitespace-nowrap">{keyword}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default KeyWord
