import React from 'react';
import { useTranslation } from 'react-i18next';

interface ConfidenceBadgeProps {
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, size = 'md' }) => {
  const { i18n } = useTranslation();
  const conf = confidence.toUpperCase();

  const labels: Record<string, Record<string, string>> = {
    HIGH: { en: 'High Confidence', hi: 'उच्च विश्वास स्तर', gu: 'ઉચ્ચ વિશ્વાસ સ્તર' },
    MEDIUM: { en: 'Medium Confidence', hi: 'मध्यम विश्वास स्तर', gu: 'મધ્યમ વિશ્વાસ સ્તર' },
    LOW: { en: 'Low Confidence', hi: 'कम विश्वास स्तर', gu: 'ઓછો વિશ્વાસ સ્તર' },
  };

  const styleMap = {
    HIGH: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-stone-50 text-stone-600 border-stone-200',
  }[conf] || 'bg-stone-50 text-stone-600 border-stone-200';

  const dotColor = {
    HIGH: 'bg-emerald-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-stone-400',
  }[conf] || 'bg-stone-400';

  const label = labels[conf]?.[i18n.language] || labels[conf]?.en || conf;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${styleMap}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'gold' | 'danger' | 'earth' | 'neutral';
}> = ({ children, variant = 'green' }) => {
  const variantMap = {
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    blue: 'bg-sky-50 text-sky-800 border-sky-200',
    gold: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    earth: 'bg-amber-100/60 text-amber-900 border-amber-300',
    neutral: 'bg-stone-100 text-stone-800 border-stone-200',
  }[variant];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variantMap}`}>
      {children}
    </span>
  );
};
