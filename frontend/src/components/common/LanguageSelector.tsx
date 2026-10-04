import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false, className = '' }) => {
  const { language, setLanguage, options } = useLanguage();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="flex items-center gap-1.5 bg-surface border border-krishi-border rounded-lg px-2.5 py-1.5 shadow-xs text-xs font-medium text-krishi-text hover:border-krishi-green transition-all">
        <Globe className="w-3.5 h-3.5 text-krishi-green shrink-0" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
          className="bg-transparent border-none outline-none cursor-pointer font-medium text-krishi-text pr-2"
          aria-label="Select Language"
        >
          {options.map((opt) => (
            <option key={opt.code} value={opt.code} className="text-krishi-text py-1">
              {compact ? `${opt.code.toUpperCase()} — ${opt.nativeName}` : `${opt.nativeName} (${opt.name})`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
