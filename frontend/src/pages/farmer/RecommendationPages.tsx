import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  History,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { AIRecommendationCard } from '../../components/ai/AIRecommendationCard';
import { api, AIRecommendation } from '../../services/api';
import { useFarm } from '../../context/FarmContext';

export const RecommendationHistoryPage: React.FC = () => {
  const { selectedField } = useFarm();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [filterType, setFilterType] = useState('ALL');
  const [filterConf, setFilterConf] = useState('ALL');

  useEffect(() => {
    api.getRecommendations(selectedField?.id).then(setRecommendations);
  }, [selectedField]);

  const filtered = recommendations.filter((r) => {
    if (filterType !== 'ALL' && r.type.toLowerCase() !== filterType.toLowerCase()) return false;
    if (filterConf !== 'ALL' && r.confidence.toUpperCase() !== filterConf.toUpperCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <History className="w-5 h-5 text-krishi-green" />
            AI Agricultural Recommendation Archive
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            Auditable history of all decision intelligence outputs and agronomic reasoning.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-3 bg-white flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-krishi-text-secondary">
          <Filter className="w-4 h-4 text-krishi-green" />
          <span>Filter Decisions:</span>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-krishi-border bg-surface-secondary outline-none font-medium"
        >
          <option value="ALL">All Types</option>
          <option value="Irrigation">Irrigation</option>
          <option value="Nutrient">Nutrient</option>
          <option value="Pest">Pest / Pathology</option>
          <option value="Decision Support">Decision Support</option>
        </select>

        <select
          value={filterConf}
          onChange={(e) => setFilterConf(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-krishi-border bg-surface-secondary outline-none font-medium"
        >
          <option value="ALL">All Confidence Levels</option>
          <option value="HIGH">High Confidence</option>
          <option value="MEDIUM">Medium Confidence</option>
          <option value="LOW">Low Confidence</option>
        </select>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((r) => (
          <Card key={r.id} hoverable className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-krishi-text">{r.recommendation}</span>
                <ConfidenceBadge confidence={r.confidence} size="sm" />
              </div>
              <p className="text-krishi-text-secondary leading-relaxed">
                <span className="font-semibold text-krishi-text">Reason: </span>
                {r.reason}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-krishi-muted pt-1">
                <span>Field: <strong>{r.field_name}</strong></span>
                <span>•</span>
                <span>Type: <strong>{r.type}</strong></span>
                <span>•</span>
                <span>Language: <strong>{r.language?.toUpperCase() || 'EN'}</strong></span>
                <span>•</span>
                <span>{r.created_at.slice(0, 10)}</span>
              </div>
            </div>

            <Link to={`/recommendations/${r.id}`}>
              <Button size="sm" variant="outline" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Details
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const AIRecommendationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [rec, setRec] = useState<AIRecommendation | null>(null);

  useEffect(() => {
    if (id) {
      api.getRecommendationDetails(id).then(setRec);
    }
  }, [id]);

  if (!rec) {
    return <div className="p-8 text-center text-xs text-krishi-muted">Loading recommendation details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-krishi-border/60">
        <Link to="/recommendations" className="p-2 rounded-lg hover:bg-surface-secondary text-krishi-text-secondary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text">Decision Detail Dossier</h1>
          <p className="text-xs text-krishi-text-secondary">Generated on {rec.created_at.slice(0, 16).replace('T', ' ')}</p>
        </div>
      </div>

      <AIRecommendationCard
        data={{
          recommendation: rec.recommendation,
          reason: rec.reason,
          evidence: rec.evidence || [],
          data_used: rec.data_used || [],
          confidence: rec.confidence,
          next_action: rec.next_action || 'Continue standard field telemetry monitoring.',
          warnings: rec.warnings || [],
          language: rec.language || 'en',
          sources_used: [
            { title: 'ICAR Agronomic Guidelines', source: 'ICAR', language: 'en' }
          ]
        }}
        title={`${rec.type} Decision Specification`}
      />
    </div>
  );
};
