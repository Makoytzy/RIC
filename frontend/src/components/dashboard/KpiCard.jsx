import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * KpiCard Component
 * Displays key performance indicators with icon, value, and trend
 * 
 * @param {string} title - KPI title
 * @param {string|number} value - Main value to display
 * @param {string} subtitle - Subtitle or description
 * @param {React.Component} icon - Lucide icon component
 * @param {string} trend - Trend indicator: '+8.4%', '-2.1%', etc.
 * @param {string} variant - Color variant: 'blue' | 'green' | 'orange' | 'red' | 'purple'
 */

const VARIANTS = {
  blue: {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    trendUp: 'text-emerald-600',
    trendDown: 'text-red-600',
  },
  green: {
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    trendUp: 'text-emerald-600',
    trendDown: 'text-red-600',
  },
  orange: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    trendUp: 'text-emerald-600',
    trendDown: 'text-red-600',
  },
  red: {
    iconBg: 'bg-red-50',
    iconText: 'text-red-600',
    trendUp: 'text-emerald-600',
    trendDown: 'text-red-600',
  },
  purple: {
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-600',
    trendUp: 'text-emerald-600',
    trendDown: 'text-red-600',
  },
};

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'blue',
}) {
  const colors = VARIANTS[variant] || VARIANTS.blue;
  const isPositiveTrend = trend?.startsWith('+');
  const trendColor = isPositiveTrend ? colors.trendUp : colors.trendDown;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            {trend && (
              <span className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
                <TrendIcon size={16} />
                {trend}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        {Icon && (
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${colors.iconBg}`}>
            <Icon size={24} className={colors.iconText} />
          </div>
        )}
      </div>
    </div>
  );
}
