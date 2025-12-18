import { FileText, BarChart3, Tag, Grid3X3, TrendingUp, ClipboardList, LucideIcon, HelpCircle, Megaphone, Mail } from 'lucide-react'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { FormStatistics } from '@/hooks/useForms'

interface FormStat {
  title: string;
  value: number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

interface FormCardProps {
  statistics?: FormStatistics;
  isLoading?: boolean;
  totalElements?: number;
}

// Build form stats from API statistics
const getFormStats = (stats?: FormStatistics, totalElements?: number): FormStat[] => {
  const total = totalElements ?? 0;
  
  // const knownTotal = stats
  //   ? (stats.businessDevelopment + stats.brandDevelopment + stats.capacityBuilding +
  //      stats.tradeAndInvestmentFacilitation + stats.businessQuest)
  //   : 0;

  // const others = Math.max(0, total - knownTotal);
  const others = stats?.others ?? 0;

  return [
    {
      title: 'Total Forms Submitted',
      value: total,
      icon: FileText,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
    {
      title: 'Business Development',
      value: stats?.businessDevelopment || 0,
      icon: BarChart3,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Brand Management',
      value: stats?.brandDevelopment || 0,
      icon: Tag,
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-500',
    },
    {
      title: 'Capacity Building',
      value: stats?.capacityBuilding || 0,
      icon: Grid3X3,
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-500',
    },
    {
      title: 'Trade And Investment Facilitation',
      value: stats?.tradeAndInvestmentFacilitation || 0,
      icon: TrendingUp,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
    },
    {
      title: 'Business Quest',
      value: stats?.businessQuest || 0,
      icon: ClipboardList,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Marketing Consulting',
      value: stats?.marketingConsulting || 0,
      icon: Megaphone,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Contact',
      value: stats?.contact || 0,
      icon: Mail,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Others',
      value: others,
      icon: HelpCircle,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-500', 
    },
  ];
};

const FormCard = ({ statistics, isLoading, totalElements }: FormCardProps) => {
  const formStats = getFormStats(statistics, totalElements);
  
  // Split stats into 3 rows of 3
  const row1Stats = formStats.slice(0, 3);
  const row2Stats = formStats.slice(3, 6);
  const row3Stats = formStats.slice(6, 9);

  const StatCard = ({ stat, loading }: { stat?: FormStat; loading?: boolean }) => {
    if (loading) {
      return (
        <Card>
          <CardContent className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-gray-200 animate-pulse w-10 h-10" />
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (!stat) return null;
    const Icon = stat.icon;
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">{stat.title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-2 sm:p-3 rounded-full ${stat.iconBg} flex-shrink-0`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 my-4 sm:my-6">
      {/* Row 1: 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {isLoading 
          ? [...Array(3)].map((_, i) => <StatCard key={`row1-loading-${i}`} loading />)
          : row1Stats.map((stat) => <StatCard key={stat.title} stat={stat} />)
        }
      </div>
      
      {/* Row 2: 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {isLoading
          ? [...Array(3)].map((_, i) => <StatCard key={`row2-loading-${i}`} loading />)
          : row2Stats.map((stat) => <StatCard key={stat.title} stat={stat} />)
        }
      </div>

      {/* Row 3: 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {isLoading
          ? [...Array(3)].map((_, i) => <StatCard key={`row3-loading-${i}`} loading />)
          : row3Stats.map((stat) => <StatCard key={stat.title} stat={stat} />)
        }
      </div>
    </div>
  );
}

export default FormCard