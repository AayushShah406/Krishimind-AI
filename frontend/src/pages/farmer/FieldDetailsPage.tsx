import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  Sprout,
  Droplets,
  CloudSun,
  Activity,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AIRecommendationCard } from '../../components/ai/AIRecommendationCard';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { api, Field, Crop, SoilReading, IrrigationRecord, WeatherData, AIStructuredResponse } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export const FieldDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();

  const [field, setField] = useState<Field | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [soil, setSoil] = useState<SoilReading[]>([]);
  const [irrigations, setIrrigations] = useState<IrrigationRecord[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [analysisRec, setAnalysisRec] = useState<AIStructuredResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (id) {
      api.getField(id).then(setField);
      api.getCrops(id).then(setCrops);
      api.getSoilReadings(id).then(setSoil);
      api.getIrrigationRecords(id).then(setIrrigations);
      api.getWeather(id).then(setWeather);
    }
  }, [id]);

  const handleAnalyzeField = async () => {
    if (!id) return;
    setAnalyzing(true);
    try {
      const rec = await api.askAI({
        field_id: id,
        question: language === 'gu'
          ? 'આ પ્લોટ માટે સંપૂર્ણ કૃષિ વિશ્લેષણ અને ભલામણ આપો.'
          : language === 'hi'
          ? 'इस खेत के लिए व्यापक कृषि निर्णय एवं सिफारिश उत्पन्न करें।'
          : 'Provide a comprehensive agronomic decision for this field.',
        language,
      });
      setAnalysisRec(rec);
    } finally {
      setAnalyzing(false);
    }
  };

  const chartMoistureData = [...soil].reverse().map((r, i) => ({
    index: `R${i + 1}`,
    moisture: r.moisture,
  }));

  const chartIrrigData = [...irrigations].reverse().map((r) => ({
    date: r.date.slice(5, 10),
    amount: r.amount,
  }));

  const activeCrop = crops.find(c => c.status === 'ACTIVE') || crops[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-krishi-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs text-krishi-muted">
            <Link to="/fields" className="hover:underline">Fields</Link>
            <span>/</span>
            <span className="text-krishi-text font-bold">{field?.name || 'Field Details'}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-krishi-text mt-1">{field?.name || 'Field Plot'}</h1>
          <p className="text-xs text-krishi-text-secondary">
            {field?.soil_type} • {field?.area} acres • Location: {field?.location || 'Gujarat'}
          </p>
        </div>

        {/* AI Action Button */}
        <Button
          variant="primary"
          size="md"
          isLoading={analyzing}
          onClick={handleAnalyzeField}
          icon={<Sparkles className="w-4 h-4" />}
        >
          {analyzing ? 'Reasoning with Gemini...' : 'Analyze This Field'}
        </Button>
      </div>

      {/* Real-time Field Recommendation Banner */}
      {analysisRec && (
        <AIRecommendationCard
          data={analysisRec}
          title="On-Demand Field Decision Synthesis"
        />
      )}

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-krishi-muted uppercase font-bold">Active Crop</span>
          <p className="text-lg font-bold text-krishi-text mt-1">{activeCrop?.name || 'Wheat'} ({activeCrop?.variety || 'GW-322'})</p>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-2 inline-block">
            Stage: {activeCrop?.growth_stage || 'Flowering'}
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-krishi-muted uppercase font-bold">Soil Moisture</span>
          <p className="text-2xl font-extrabold text-krishi-blue mt-1">
            {soil[0]?.moisture ?? 71}%
          </p>
          <p className="text-xs text-krishi-muted mt-1">Soil pH: {soil[0]?.ph ?? 6.8}</p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-krishi-muted uppercase font-bold">Ambient Weather</span>
          <p className="text-2xl font-extrabold text-krishi-text mt-1">
            {weather?.temperature ?? 31.2}°C
          </p>
          <p className="text-xs text-krishi-accent font-semibold mt-1">
            Rain Prob: {weather?.rain_probability ?? 82}%
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-krishi-muted uppercase font-bold">Last Irrigation</span>
          <p className="text-lg font-bold text-krishi-text mt-1">
            {irrigations[0] ? `${irrigations[0].amount} mm (${irrigations[0].method})` : 'No logs recorded'}
          </p>
          <p className="text-xs text-krishi-muted mt-1">
            {irrigations[0]?.date ? new Date(irrigations[0].date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Awaiting first record'}
          </p>
        </Card>
      </div>

      {/* Telemetry Charts: Moisture Trend & Water Applied */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-krishi-text flex items-center gap-2">
              <Droplets className="w-4 h-4 text-krishi-blue" />
              Soil Moisture History (%)
            </h3>
            <span className="text-xs text-krishi-muted">Sensor Readings</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartMoistureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E1" vertical={false} />
                <XAxis dataKey="index" tick={{ fontSize: 11 }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="moisture" stroke="#2E86AB" fill="#2E86AB" fillOpacity={0.2} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-krishi-text flex items-center gap-2">
              <Activity className="w-4 h-4 text-krishi-green" />
              Irrigation History (mm Water Applied)
            </h3>
            <span className="text-xs text-krishi-muted">Log Entries</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartIrrigData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E1" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="amount" fill="#2F6B4F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Field Actions Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-krishi-border">
        <span className="text-xs text-krishi-text-secondary">
          Need to upload an inspection photo or adjust crop variety for this plot?
        </span>
        <div className="flex items-center gap-2">
          <Link to="/crop-image-analysis">
            <Button size="sm" variant="secondary">Upload Crop Photo</Button>
          </Link>
          <Link to="/ai-advisor">
            <Button size="sm" variant="primary">Ask AI About This Field</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
