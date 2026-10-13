import type { DashboardStats } from '../../lib/types';
import { formatDuration } from '../../lib/utils';

interface DashboardStatsProps {
  stats: DashboardStats;
  loading: boolean;
}

export const DashboardStatsComponent = ({ stats, loading }: DashboardStatsProps) => {
  const statCards = [
    {
      label: 'Open Tickets',
      value: stats.totalOpen,
      color: 'bg-blue-500',
      icon: '📋',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      color: 'bg-yellow-500',
      icon: '🔄',
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      color: 'bg-green-500',
      icon: '✅',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      color: 'bg-red-500',
      icon: '⚠️',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {statCards.map((card) => (
        <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl lg:text-2xl">{card.icon}</span>
            <div className={`w-3 h-3 rounded-full ${card.color}`}></div>
          </div>
          <p className="text-xs lg:text-sm text-gray-600 mb-1">{card.label}</p>
          <p className="text-2xl lg:text-3xl font-semibold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export const AvgResponseTime = ({ stats, loading }: { stats: DashboardStats; loading: boolean }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl lg:text-2xl">⏱️</span>
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
      </div>
      <p className="text-xs lg:text-sm text-gray-600 mb-1">Avg First Response Time</p>
      <p className="text-2xl lg:text-3xl font-semibold text-gray-900">
        {stats.avgFirstResponseTime !== null ? formatDuration(stats.avgFirstResponseTime) : 'N/A'}
      </p>
    </div>
  );
};
