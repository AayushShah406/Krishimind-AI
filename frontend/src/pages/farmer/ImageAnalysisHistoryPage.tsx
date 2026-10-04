import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { api, ImageAnalysis } from '../../services/api';

export const ImageAnalysisHistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<ImageAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ImageAnalysis | null>(null);

  useEffect(() => {
    api.getAllAnalyses().then((res) => {
      setAnalyses(res);
      if (res.length > 0) setSelectedAnalysis(res[0]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-krishi-border/60">
        <div className="flex items-center gap-3">
          <Link to="/crop-image-analysis" className="p-2 rounded-lg hover:bg-surface-secondary text-krishi-text-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-krishi-text">Crop Visual Pathology History</h1>
            <p className="text-xs text-krishi-text-secondary">Historical camera captures and pathology diagnoses</p>
          </div>
        </div>

        <Link to="/crop-image-analysis">
          <Button size="sm" variant="primary">New Photo Check</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List of images (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {analyses.map((a) => (
            <Card
              key={a.id}
              hoverable
              onClick={() => setSelectedAnalysis(a)}
              className={`p-4 transition-all ${
                selectedAnalysis?.id === a.id ? 'border-krishi-green ring-1 ring-krishi-green bg-emerald-50/20' : ''
              }`}
            >
              <div className="flex items-center gap-3 text-xs">
                <div className="w-16 h-16 rounded-lg bg-surface-secondary overflow-hidden shrink-0 border border-krishi-border flex items-center justify-center">
                  <Camera className="w-6 h-6 text-krishi-muted" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-krishi-text">{a.crop_name || 'Wheat'}</span>
                    <ConfidenceBadge confidence={a.confidence} size="sm" />
                  </div>
                  <p className="text-krishi-text-secondary text-[11px] line-clamp-1">
                    {a.possible_causes?.[0] || 'Pathology evaluation'}
                  </p>
                  <p className="text-[10px] text-krishi-muted">
                    {a.field_name} • {a.created_at?.slice(0, 10)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Selected Analysis Full View (7 cols) */}
        <div className="lg:col-span-7">
          {selectedAnalysis ? (
            <Card className="p-6 space-y-5 bg-white shadow-card">
              <div className="flex items-start justify-between pb-3 border-b border-krishi-border/60">
                <div>
                  <h3 className="text-base font-extrabold text-krishi-text">
                    Detailed Pathology Report
                  </h3>
                  <p className="text-xs text-krishi-text-secondary">
                    {selectedAnalysis.crop_name} • {selectedAnalysis.field_name}
                  </p>
                </div>
                <ConfidenceBadge confidence={selectedAnalysis.confidence} />
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-krishi-muted mb-2">Visual Observations</h4>
                <div className="space-y-1 text-xs bg-surface-secondary/70 p-3 rounded-xl border border-krishi-border/50">
                  {selectedAnalysis.visual_observations.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 text-krishi-text">
                      <span className="w-1.5 h-1.5 rounded-full bg-krishi-blue" />
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-krishi-muted mb-2">Potential Causes</h4>
                <div className="space-y-1 text-xs bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                  {selectedAnalysis.possible_causes.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-amber-900 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-950 block mb-1">Recommended Action:</span>
                <p className="text-emerald-900 leading-relaxed font-medium">{selectedAnalysis.recommendation}</p>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-xs text-krishi-muted">
              Select an image from the left to inspect its pathology report.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
