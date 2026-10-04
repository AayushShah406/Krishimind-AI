import React from 'react';

export type MetricAccent = 'green' | 'blue' | 'earth' | 'gold' | 'danger' | 'neutral';

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  subtitle?: string;
  sourceBadge?: {
    source: string;
    updated?: string;
  };
  trend?: {
    value: string;
    label?: string; // Default: 'vs last reading'. Set to '' or custom label
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  accentColor?: MetricAccent;
  progress?: {
    value: number; // 0-100 percentage
    minLabel?: string;
    maxLabel?: string;
    targetLabel?: string;
  };
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  subtitle,
  sourceBadge,
  trend,
  accentColor = 'green',
  progress,
  className = '',
  onClick,
}) => {
  const themes = {
    green: {
      topBorder: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300/40',
      bgGlow: 'bg-emerald-500/[0.04]',
      iconBox: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-sm shadow-emerald-600/10 group-hover:bg-emerald-100/80 group-hover:scale-105',
      trendBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      trendDot: 'bg-emerald-500',
      progressGradient: 'from-emerald-500 to-teal-400',
    },
    blue: {
      topBorder: 'bg-gradient-to-r from-sky-500 via-blue-400 to-sky-300/40',
      bgGlow: 'bg-sky-500/[0.04]',
      iconBox: 'bg-sky-50 text-sky-700 border-sky-200/80 shadow-sm shadow-sky-600/10 group-hover:bg-sky-100/80 group-hover:scale-105',
      trendBadge: 'bg-sky-50 text-sky-700 border-sky-200/80',
      trendDot: 'bg-sky-500',
      progressGradient: 'from-sky-500 to-blue-500',
    },
    earth: {
      topBorder: 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-400/40',
      bgGlow: 'bg-amber-600/[0.04]',
      iconBox: 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-sm shadow-amber-600/10 group-hover:bg-amber-100/80 group-hover:scale-105',
      trendBadge: 'bg-amber-50 text-amber-800 border-amber-200/80',
      trendDot: 'bg-amber-600',
      progressGradient: 'from-amber-600 to-amber-500',
    },
    gold: {
      topBorder: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300/40',
      bgGlow: 'bg-amber-500/[0.04]',
      iconBox: 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-sm shadow-amber-500/10 group-hover:bg-amber-100/80 group-hover:scale-105',
      trendBadge: 'bg-amber-50 text-amber-700 border-amber-200/80',
      trendDot: 'bg-amber-500',
      progressGradient: 'from-amber-400 to-yellow-400',
    },
    danger: {
      topBorder: 'bg-gradient-to-r from-rose-500 via-red-400 to-rose-300/40',
      bgGlow: 'bg-rose-500/[0.04]',
      iconBox: 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-sm shadow-rose-600/10 group-hover:bg-rose-100/80 group-hover:scale-105',
      trendBadge: 'bg-rose-50 text-rose-700 border-rose-200/80',
      trendDot: 'bg-rose-500 animate-pulse',
      progressGradient: 'from-rose-500 to-red-400',
    },
    neutral: {
      topBorder: 'bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200',
      bgGlow: 'bg-slate-300/[0.03]',
      iconBox: 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200/70 group-hover:scale-105',
      trendBadge: 'bg-slate-100 text-slate-600 border-slate-200',
      trendDot: 'bg-slate-400',
      progressGradient: 'from-slate-400 to-slate-300',
    },
  }[accentColor];

  // Trend color determination
  const trendStyle = trend?.isNeutral
    ? 'bg-slate-100 text-slate-600 border-slate-200'
    : trend?.isPositive
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    : 'bg-rose-50 text-rose-700 border-rose-200/80';

  const trendDot = trend?.isNeutral
    ? 'bg-slate-400'
    : trend?.isPositive
    ? 'bg-emerald-500'
    : 'bg-rose-500';

  // Determine whether unit should be an inline suffix or a styled badge pill
  const isShortUnit = unit && unit.length <= 4 && !unit.includes(' ');

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] hover:shadow-[0_12px_24px_-4px_rgba(15,23,42,0.08),0_4px_8px_-2px_rgba(15,23,42,0.03)] hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-300 p-5 flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top Accent Gradient Line */}
      <div className={`absolute top-0 left-0 right-0 h-[2.5px] ${themes.topBorder}`} />

      {/* Ambient background glow on hover */}
      <div
        className={`absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 opacity-40 group-hover:opacity-100 ${themes.bgGlow}`}
      />

      {/* Header Row: Title & Styled Icon */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-500 leading-tight">
            {title}
          </p>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 ${themes.iconBox}`}
          >
            {icon}
          </div>
        </div>

        {/* Primary Value & Unit */}
        <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900 leading-tight">
            {value}
          </span>

          {unit && isShortUnit && (
            <span className="text-xs font-semibold text-slate-400 self-baseline">
              {unit}
            </span>
          )}

          {unit && !isShortUnit && (
            <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70 self-center">
              {unit}
            </span>
          )}
        </div>

        {/* Context / Subtitle */}
        {subtitle && (
          <p className="mt-1.5 text-xs text-slate-500 font-medium line-clamp-1" title={subtitle}>
            {subtitle}
          </p>
        )}

        {/* Optional Progress Gauge */}
        {progress && (
          <div className="mt-3 pt-1">
            <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 mb-1">
              <span>{progress.minLabel || '0%'}</span>
              {progress.targetLabel && (
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                  {progress.targetLabel}
                </span>
              )}
              <span>{progress.maxLabel || '100%'}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${themes.progressGradient}`}
                style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Data Source Transparency Badge */}
      {sourceBadge && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span className="font-semibold text-slate-600 truncate">
            Source: <span className="font-medium text-slate-700">{sourceBadge.source}</span>
          </span>
          {sourceBadge.updated && (
            <span className="text-[10px] text-slate-400 shrink-0 ml-1">{sourceBadge.updated}</span>
          )}
        </div>
      )}

      {/* Trend / Status Footer */}
      {trend && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100/90 flex items-center justify-between gap-2 text-xs">
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${trendStyle}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${trendDot}`} />
            <span>{trend.value}</span>
          </div>
          {trend.label !== '' && (
            <span className="text-[11px] text-slate-400 font-normal truncate">
              {trend.label || 'vs last reading'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
