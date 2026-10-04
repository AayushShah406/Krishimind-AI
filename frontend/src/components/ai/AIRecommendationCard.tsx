import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Video,
  Image as ImageIcon,
  ExternalLink,
  ListOrdered,
  PlayCircle
} from 'lucide-react';
import { Card } from '../common/Card';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { AIStructuredResponse } from '../../services/api';
import { useTranslation } from 'react-i18next';

interface AIRecommendationCardProps {
  data: AIStructuredResponse;
  title?: string;
  className?: string;
  cropName?: string;
  fieldName?: string;
  onAskFollowUp?: (question: string) => void;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  data,
  title,
  className = '',
  cropName,
  fieldName,
  onAskFollowUp,
}) => {
  const { t, i18n } = useTranslation('ai');
  const [activeMediaPreview, setActiveMediaPreview] = useState<string | null>(null);

  return (
    <Card className={`border-krishi-accent/30 bg-gradient-to-br from-surface via-surface to-emerald-50/20 shadow-card ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-krishi-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-krishi-green/10 text-krishi-green">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-krishi-text">
              {title || t('recommendation', 'AI Recommendation')}
            </h3>
            <p className="text-xs text-krishi-text-secondary">
              {cropName || fieldName ? `${cropName || 'Crop'} • ${fieldName || 'Field'}` : 'KrishiMind Decision Intelligence'}
            </p>
          </div>
        </div>
        <ConfidenceBadge confidence={data.confidence} />
      </div>

      {/* Main Recommendation Text */}
      <div className="mt-4 p-4 rounded-xl bg-white border border-krishi-accent/20 shadow-xs">
        <p className="text-lg font-bold text-krishi-green-dark leading-snug">
          {data.recommendation}
        </p>
        {data.reason && (
          <p className="mt-2 text-sm text-krishi-text-secondary leading-relaxed">
            <span className="font-semibold text-krishi-text">{t('reason', 'Reason')}: </span>
            {data.reason}
          </p>
        )}
      </div>

      {/* Detailed Operational Guide (Step-by-Step) */}
      {data.detailed_guide && data.detailed_guide.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50/90 border border-slate-200/80">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
            <ListOrdered className="w-4 h-4 text-emerald-600" />
            <span>Detailed Operational Field Guide</span>
          </h4>
          <div className="space-y-2">
            {data.detailed_guide.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5 border border-emerald-200">
                  {idx + 1}
                </span>
                <span className="flex-1">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Educational Media Resources (Video Tutorials & Diagrams) */}
      {data.media_resources && data.media_resources.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-surface border border-blue-200/70">
          <h4 className="text-xs font-bold text-blue-950 flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5">
              <Video className="w-4 h-4 text-blue-600" />
              <span>Recommended Video Tutorials & Visual Guides</span>
            </span>
            <span className="text-[10px] text-blue-600 font-normal">Interactive Media</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.media_resources.map((m, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden border border-blue-200/80 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Thumbnail Preview / Media Header */}
                <div className="relative h-28 w-full bg-slate-900 overflow-hidden">
                  {m.thumbnail_url || (m.type === 'image' && m.url) ? (
                    <img
                      src={m.thumbnail_url || m.url}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      {m.type === 'video' ? <Video className="w-8 h-8 text-blue-400" /> : <ImageIcon className="w-8 h-8 text-emerald-400" />}
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold flex items-center gap-1">
                    {m.type === 'video' ? <PlayCircle className="w-3 h-3 text-rose-400" /> : <ImageIcon className="w-3 h-3 text-emerald-400" />}
                    <span className="uppercase">{m.type}</span>
                  </div>

                  {/* Play Overlay for Video */}
                  {m.type === 'video' && (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors"
                      title="Watch video on YouTube"
                    >
                      <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-6 h-6 fill-current" />
                      </div>
                    </a>
                  )}
                </div>

                {/* Content description */}
                <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {m.title}
                    </h5>
                    {m.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {m.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>{m.type === 'video' ? 'Watch Tutorial' : 'View Full Diagram'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence & Data Used Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {data.evidence && data.evidence.length > 0 && (
          <div className="p-3 rounded-lg bg-surface-secondary/70 border border-krishi-border/50">
            <h4 className="font-semibold text-krishi-text flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-krishi-green" />
              {t('evidence', 'Observed Evidence')}
            </h4>
            <ul className="space-y-1 text-krishi-text-secondary">
              {data.evidence.map((ev, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-krishi-accent shrink-0 mt-1.5" />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.data_used && data.data_used.length > 0 && (
          <div className="p-3 rounded-lg bg-surface-secondary/70 border border-krishi-border/50">
            <h4 className="font-semibold text-krishi-text flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-krishi-blue" />
              {t('dataUsed', 'Telemetry Data Used')}
            </h4>
            <ul className="space-y-1 text-krishi-text-secondary">
              {data.data_used.map((d, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-krishi-blue shrink-0 mt-1.5" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Next Action */}
      {data.next_action && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs">
          <ArrowRight className="w-4 h-4 text-krishi-green shrink-0" />
          <div>
            <span className="font-bold">{t('nextAction', 'Next Action')}: </span>
            <span>{data.next_action}</span>
          </div>
        </div>
      )}

      {/* Warnings */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">{t('warnings', 'Agronomic Warnings')}: </span>
            <span>{data.warnings.join(' ')}</span>
          </div>
        </div>
      )}

      {/* RAG Research Sources */}
      {data.sources_used && data.sources_used.length > 0 && (
        <div className="mt-3 pt-3 border-t border-krishi-border/60 flex items-center gap-2 text-xs text-krishi-muted">
          <BookOpen className="w-3.5 h-3.5 text-krishi-text-secondary" />
          <span>{t('sources', 'Source')}:</span>
          <div className="flex flex-wrap gap-1.5">
            {data.sources_used.map((s, idx) => (
              <span key={idx} className="bg-surface px-2 py-0.5 rounded border border-krishi-border font-medium text-krishi-text-secondary">
                {s.title} ({s.source})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up button */}
      {onAskFollowUp && (
        <div className="mt-3 pt-3 border-t border-krishi-border/60 flex justify-end">
          <button
            type="button"
            onClick={() => onAskFollowUp(data.recommendation)}
            className="text-xs font-bold text-krishi-green hover:text-krishi-green-dark transition-colors flex items-center gap-1"
          >
            <span>{t('askAdvisor', 'Ask follow-up question')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </Card>
  );
};
