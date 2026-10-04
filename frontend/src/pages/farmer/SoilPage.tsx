import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Droplets,
  Plus,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  Trash2,
  AlertCircle,
  FileText,
  Upload,
  Cpu,
  User,
  CheckSquare,
  Clock,
  Loader2,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { MetricCard } from '../../components/common/MetricCard';
import { FarmSelector, FieldSelector } from '../../components/common/FarmSelector';
import { useFarm } from '../../context/FarmContext';
import { useLanguage } from '../../context/LanguageContext';
import { api, SoilReading, SoilReportExtraction } from '../../services/api';

export const SoilPage: React.FC = () => {
  const { selectedField, refreshFarms } = useFarm();
  const { language } = useLanguage();
  const [readings, setReadings] = useState<SoilReading[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'report' | 'sensor'>('manual');
  const [loading, setLoading] = useState(false);

  // Manual Form States
  const [moisture, setMoisture] = useState<number | ''>('');
  const [ph, setPh] = useState<number | ''>('');
  const [nitrogen, setNitrogen] = useState<number | ''>('');
  const [phosphorus, setPhosphorus] = useState<number | ''>('');
  const [potassium, setPotassium] = useState<number | ''>('');
  const [soilTemp, setSoilTemp] = useState<number | ''>('');
  const [ec, setEc] = useState<number | ''>('');
  const [organicCarbon, setOrganicCarbon] = useState<number | ''>('');
  const [soilType, setSoilType] = useState('Sandy Loam');
  const [notes, setNotes] = useState('');
  const [readingDate, setReadingDate] = useState(new Date().toISOString().slice(0, 16));

  // Report Upload States
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<SoilReportExtraction | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  // Verified values from report
  const [verifiedMoisture, setVerifiedMoisture] = useState<number | ''>('');
  const [verifiedPh, setVerifiedPh] = useState<number | ''>('');
  const [verifiedN, setVerifiedN] = useState<number | ''>('');
  const [verifiedP, setVerifiedP] = useState<number | ''>('');
  const [verifiedK, setVerifiedK] = useState<number | ''>('');
  const [verifiedEc, setVerifiedEc] = useState<number | ''>('');
  const [verifiedOc, setVerifiedOc] = useState<number | ''>('');
  const [verifiedNotes, setVerifiedNotes] = useState('');

  // IoT Sensor Simulation State
  const [simulatingSensor, setSimulatingSensor] = useState(false);

  const loadSoil = async () => {
    if (selectedField) {
      const data = await api.getSoilReadings(selectedField.id);
      setReadings(data);
    } else {
      setReadings([]);
    }
  };

  useEffect(() => {
    loadSoil();
  }, [selectedField]);

  // Method 1: Manual Entry Submit
  const handleCreateManualReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedField) return;
    setLoading(true);
    try {
      await api.createSoilReading({
        field_id: selectedField.id,
        moisture: moisture !== '' ? Number(moisture) : undefined,
        ph: ph !== '' ? Number(ph) : undefined,
        nitrogen: nitrogen !== '' ? Number(nitrogen) : undefined,
        phosphorus: phosphorus !== '' ? Number(phosphorus) : undefined,
        potassium: potassium !== '' ? Number(potassium) : undefined,
        soil_temperature: soilTemp !== '' ? Number(soilTemp) : undefined,
        electrical_conductivity: ec !== '' ? Number(ec) : undefined,
        organic_carbon: organicCarbon !== '' ? Number(organicCarbon) : undefined,
        soil_type: soilType || undefined,
        notes: notes || undefined,
        source: 'manual',
        recorded_at: readingDate ? new Date(readingDate).toISOString() : undefined,
      });
      await loadSoil();
      setShowAddModal(false);
      resetManualForm();
      refreshFarms();
    } finally {
      setLoading(false);
    }
  };

  const resetManualForm = () => {
    setMoisture('');
    setPh('');
    setNitrogen('');
    setPhosphorus('');
    setPotassium('');
    setSoilTemp('');
    setEc('');
    setOrganicCarbon('');
    setNotes('');
  };

  // Method 2: Extract Soil Report
  const handleExtractReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportFile) return;
    setExtracting(true);
    setReportError(null);
    try {
      const formData = new FormData();
      formData.append('file', reportFile);
      if (selectedField) formData.append('field_id', selectedField.id);
      formData.append('language', language);

      const result = await api.extractSoilReport(formData);
      setExtractionResult(result);

      // Prepopulate verification inputs
      const ext = result.extracted;
      setVerifiedPh(ext.ph ?? '');
      setVerifiedN(ext.nitrogen ?? '');
      setVerifiedP(ext.phosphorus ?? '');
      setVerifiedK(ext.potassium ?? '');
      setVerifiedEc(ext.electrical_conductivity ?? '');
      setVerifiedOc(ext.organic_carbon ?? '');
      setVerifiedMoisture(ext.moisture ?? '');
      setVerifiedNotes(ext.notes || (ext.lab_name ? `Lab: ${ext.lab_name}` : ''));
    } catch (err: any) {
      setReportError(err.message || 'Failed to extract soil test report. Please check format.');
    } finally {
      setExtracting(false);
    }
  };

  // Method 2: Save Verified Report Data
  const handleSaveVerifiedReport = async () => {
    if (!selectedField) return;
    setLoading(true);
    try {
      await api.createSoilReading({
        field_id: selectedField.id,
        ph: verifiedPh !== '' ? Number(verifiedPh) : undefined,
        nitrogen: verifiedN !== '' ? Number(verifiedN) : undefined,
        phosphorus: verifiedP !== '' ? Number(verifiedP) : undefined,
        potassium: verifiedK !== '' ? Number(verifiedK) : undefined,
        electrical_conductivity: verifiedEc !== '' ? Number(verifiedEc) : undefined,
        organic_carbon: verifiedOc !== '' ? Number(verifiedOc) : undefined,
        moisture: verifiedMoisture !== '' ? Number(verifiedMoisture) : undefined,
        notes: verifiedNotes || (extractionResult?.filename ? `Verified from report: ${extractionResult.filename}` : undefined),
        source: 'soil_report',
        recorded_at: new Date().toISOString(),
      });
      await loadSoil();
      setShowAddModal(false);
      setReportFile(null);
      setExtractionResult(null);
      refreshFarms();
    } finally {
      setLoading(false);
    }
  };

  // Method 3: Simulate IoT Sensor Reading for Testing
  const handleSimulateSensorReading = async () => {
    if (!selectedField) return;
    setSimulatingSensor(true);
    try {
      await api.sendIotSensorReading({
        field_id: selectedField.id,
        device_id: 'ESP32-FIELD-PROBE-01',
        moisture: Number((65 + Math.random() * 8).toFixed(1)),
        soil_temperature: Number((24 + Math.random() * 4).toFixed(1)),
        ph: 6.8,
        electrical_conductivity: 0.42,
      });
      await loadSoil();
      setShowAddModal(false);
      refreshFarms();
    } finally {
      setSimulatingSensor(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this soil reading record?')) {
      await api.deleteSoilReading(id);
      await loadSoil();
      refreshFarms();
    }
  };

  // Latest reading
  const latest = readings.length > 0 ? readings[0] : null;

  // Chart data (only for >= 2 readings)
  const hasSufficientData = readings.length >= 2;
  const chartData = [...readings].reverse().map((r, idx) => ({
    time: r.recorded_at ? new Date(r.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `#${idx + 1}`,
    moisture: r.moisture,
    nitrogen: r.nitrogen,
    phosphorus: r.phosphorus,
    potassium: r.potassium,
    ph: r.ph,
  }));

  // Helper for source badge
  const renderSourceBadge = (source?: string) => {
    switch (source) {
      case 'sensor':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Cpu className="w-3 h-3 text-blue-600" />
            <span>IoT Sensor</span>
          </span>
        );
      case 'soil_report':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <FileText className="w-3 h-3 text-purple-600" />
            <span>Soil Report</span>
          </span>
        );
      case 'manual':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <User className="w-3 h-3 text-emerald-600" />
            <span>Farmer entered</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-krishi-text">
            Soil Chemistry & Moisture Intelligence
          </h1>
          <p className="text-xs text-krishi-text-secondary mt-0.5">
            Real root-zone telemetry, soil acidity (pH), and NPK macronutrient data with clear source attribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Soil Information
          </Button>
          <FarmSelector />
          <FieldSelector />
        </div>
      </div>

      {/* Top 4 KPI Metrics (Latest reading or Not Provided) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Root-Zone Moisture"
          value={latest?.moisture !== undefined && latest.moisture !== null ? `${latest.moisture}%` : 'Not provided'}
          unit={latest?.moisture !== undefined && latest.moisture !== null ? 'RH' : ''}
          subtitle={latest ? `Source: ${latest.source === 'sensor' ? 'IoT Sensor' : latest.source === 'soil_report' ? 'Soil Report' : 'Farmer entered'}` : 'No readings yet'}
          accentColor={latest?.moisture ? (latest.moisture >= 60 && latest.moisture <= 75 ? 'green' : latest.moisture > 75 ? 'danger' : 'gold') : 'neutral'}
          icon={<Droplets className="w-5 h-5" />}
          progress={latest?.moisture !== undefined && latest.moisture !== null ? {
            value: Math.min(100, Math.max(0, latest.moisture)),
            minLabel: '0%',
            maxLabel: '100%',
            targetLabel: '60-75%'
          } : undefined}
          trend={latest ? {
            value: latest.source === 'sensor' ? 'Live Sensor' : 'Logged Test',
            isPositive: true,
            label: latest.recorded_at ? new Date(latest.recorded_at).toLocaleDateString() : 'Recent'
          } : undefined}
        />

        <MetricCard
          title="Soil pH Level"
          value={latest?.ph !== undefined && latest.ph !== null ? `${latest.ph}` : 'Not provided'}
          subtitle={latest?.ph !== undefined && latest.ph !== null ? (latest.ph >= 6.5 && latest.ph <= 7.5 ? 'Neutral reaction (Ideal)' : latest.ph < 6.5 ? 'Acidic reaction' : 'Alkaline reaction') : 'pH test pending'}
          accentColor={latest?.ph ? 'blue' : 'neutral'}
          icon={<Activity className="w-5 h-5" />}
          trend={latest?.ph !== undefined && latest.ph !== null ? {
            value: latest.ph >= 6.0 && latest.ph <= 7.5 ? 'Optimal Range' : 'Attention Needed',
            isPositive: latest.ph >= 6.0 && latest.ph <= 7.5,
            label: 'pH 6.5 - 7.5'
          } : undefined}
        />

        <MetricCard
          title="Primary Nutrients (NPK)"
          value={latest?.nitrogen !== undefined && latest.nitrogen !== null ? `${latest.nitrogen} N` : 'Not provided'}
          unit={latest?.phosphorus !== undefined && latest.phosphorus !== null ? `${latest.phosphorus} P • ${latest.potassium ?? '--'} K` : ''}
          subtitle={latest?.nitrogen ? 'Macronutrient balance (kg/ha)' : 'NPK lab test pending'}
          accentColor={latest?.nitrogen ? 'earth' : 'neutral'}
          icon={<Sparkles className="w-5 h-5" />}
          trend={latest?.nitrogen ? {
            value: 'Nutrient Balance',
            isNeutral: true,
            label: latest.source === 'soil_report' ? 'Soil Health Card' : 'Kit Test'
          } : undefined}
        />

        <MetricCard
          title="Electrical Cond. (EC)"
          value={latest?.electrical_conductivity !== undefined && latest.electrical_conductivity !== null ? `${latest.electrical_conductivity} dS/m` : 'Not provided'}
          unit={latest?.organic_carbon !== undefined && latest.organic_carbon !== null ? `${latest.organic_carbon}% OC` : ''}
          subtitle={latest?.electrical_conductivity ? 'Salinity & organic carbon' : 'EC measurement pending'}
          accentColor={latest?.electrical_conductivity ? 'gold' : 'neutral'}
          icon={<Activity className="w-5 h-5" />}
          trend={latest?.electrical_conductivity ? {
            value: latest.electrical_conductivity < 1.0 ? 'Non-Saline' : 'Salinity Alert',
            isPositive: latest.electrical_conductivity < 1.0,
            label: '< 1.0 dS/m'
          } : undefined}
        />
      </div>

      {/* Main Content: If 0 readings, show clean un-fabricated state */}
      {readings.length === 0 ? (
        <Card className="p-12 text-center space-y-4 bg-white shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <Droplets className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-krishi-text">No soil history available yet</h3>
            <p className="text-xs text-krishi-text-secondary leading-relaxed">
              KrishiMind never invents assumed soil measurements. Add your first field soil test, upload your Soil Health Card, or connect an IoT sensor to begin tracking root-zone chemistry.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button variant="primary" size="md" onClick={() => { setActiveTab('manual'); setShowAddModal(true); }}>
              Method 1: Manual Entry
            </Button>
            <Button variant="secondary" size="md" onClick={() => { setActiveTab('report'); setShowAddModal(true); }}>
              Method 2: Upload Soil Report
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Charts: Rendered ONLY if >= 2 readings exist */}
          {hasSufficientData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Moisture Trend Chart */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-krishi-text">Soil Moisture Trend (%)</h3>
                    <p className="text-[11px] text-krishi-text-secondary">Tracking root-zone field capacity over time</p>
                  </div>
                  <span className="text-[10px] font-semibold text-krishi-green bg-krishi-green/10 px-2 py-0.5 rounded">
                    Field Capacity
                  </span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E1" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="moisture"
                        name="Moisture (%)"
                        stroke="#2E86AB"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#2E86AB' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* NPK Macronutrient Balance Chart */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-krishi-text">NPK Macronutrient Balance (kg/ha)</h3>
                    <p className="text-[11px] text-krishi-text-secondary">Nitrogen (N), Phosphorus (P), and Potassium (K) balance</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E1" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="nitrogen" name="Nitrogen (N)" fill="#2F6B4F" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="phosphorus" name="Phosphorus (P)" fill="#D9A441" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="potassium" name="Potassium (K)" fill="#16A878" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-4 bg-surface-secondary/40 border border-krishi-border/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-krishi-text-secondary">
                <Info className="w-4 h-4 text-krishi-blue shrink-0" />
                <span>
                  1 soil reading recorded. Add 1 more reading to visualize interactive historical moisture and nutrient trends.
                </span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowAddModal(true)}>
                + Add Second Reading
              </Button>
            </Card>
          )}

          {/* Historical Readings Table with Source Attribution */}
          <Card className="p-5 bg-white shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-krishi-text">Historical Soil Readings</h3>
                <p className="text-[11px] text-krishi-text-secondary">Every value shows verified source attribution</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {readings.length} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-krishi-border/60 text-krishi-text-secondary bg-surface-secondary/30">
                    <th className="py-2.5 px-3 font-semibold">Recorded Date</th>
                    <th className="py-2.5 px-3 font-semibold">Data Source</th>
                    <th className="py-2.5 px-3 font-semibold">Moisture</th>
                    <th className="py-2.5 px-3 font-semibold">pH</th>
                    <th className="py-2.5 px-3 font-semibold">N (kg/ha)</th>
                    <th className="py-2.5 px-3 font-semibold">P (kg/ha)</th>
                    <th className="py-2.5 px-3 font-semibold">K (kg/ha)</th>
                    <th className="py-2.5 px-3 font-semibold">EC / OC</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-krishi-border/30">
                  {readings.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-secondary/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-krishi-text whitespace-nowrap">
                        {r.recorded_at ? new Date(r.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {r.recorded_at ? new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {renderSourceBadge(r.source)}
                      </td>

                      <td className="py-3 px-3 font-bold text-krishi-blue">
                        {r.moisture !== undefined && r.moisture !== null ? (
                          `${r.moisture}% RH`
                        ) : (
                          <span className="text-slate-400 font-normal italic">Not provided</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-medium">
                        {r.ph !== undefined && r.ph !== null ? (
                          r.ph
                        ) : (
                          <span className="text-slate-400 font-normal italic">Not provided</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {r.nitrogen !== undefined && r.nitrogen !== null ? (
                          r.nitrogen
                        ) : (
                          <span className="text-slate-400 font-normal italic">Not provided</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {r.phosphorus !== undefined && r.phosphorus !== null ? (
                          r.phosphorus
                        ) : (
                          <span className="text-slate-400 font-normal italic">Not provided</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {r.potassium !== undefined && r.potassium !== null ? (
                          r.potassium
                        ) : (
                          <span className="text-slate-400 font-normal italic">Not provided</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-600">
                        {r.electrical_conductivity ? `${r.electrical_conductivity} dS/m` : ''}
                        {r.organic_carbon ? ` • ${r.organic_carbon}% OC` : ''}
                        {!r.electrical_conductivity && !r.organic_carbon && (
                          <span className="text-slate-400 italic">Not provided</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 hover:text-krishi-danger rounded text-krishi-muted transition-colors"
                          title="Delete reading"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* ========================================================
          ADD SOIL READING MODAL — 3 INPUT METHODS
          ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-krishi-border/60">
              <div>
                <h3 className="text-base font-bold text-krishi-text">Add Soil Information</h3>
                <p className="text-xs text-krishi-text-secondary">Choose the method most convenient for you</p>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setExtractionResult(null); }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* 3 Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`py-2 px-2 rounded-lg text-center transition-all ${
                  activeTab === 'manual'
                    ? 'bg-white text-emerald-800 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Method 1: Manual Entry
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className={`py-2 px-2 rounded-lg text-center transition-all ${
                  activeTab === 'report'
                    ? 'bg-white text-purple-800 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Method 2: Soil Report
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sensor')}
                className={`py-2 px-2 rounded-lg text-center transition-all ${
                  activeTab === 'sensor'
                    ? 'bg-white text-blue-800 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Method 3: IoT Sensor
              </button>
            </div>

            {/* TAB 1: MANUAL ENTRY */}
            {activeTab === 'manual' && (
              <form onSubmit={handleCreateManualReading} className="space-y-4 text-xs pt-1">
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-emerald-800 flex items-start gap-2">
                  <User className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <p>
                    Enter only the values you know. Unentered fields will be saved as <strong>"Not provided"</strong> without guessing or fabrication. Stored with <code className="bg-emerald-100 px-1 rounded">source = "manual"</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-krishi-text">Soil Moisture (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={moisture}
                      onChange={(e) => setMoisture(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                      placeholder="e.g. 68.5 (or leave empty)"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-krishi-text">Soil pH</label>
                    <input
                      type="number"
                      min="0"
                      max="14"
                      step="0.1"
                      value={ph}
                      onChange={(e) => setPh(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                      placeholder="e.g. 6.8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold mb-1 text-krishi-text">Nitrogen (N)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nitrogen}
                      onChange={(e) => setNitrogen(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                      placeholder="kg/ha"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-krishi-text">Phosphorus (P)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={phosphorus}
                      onChange={(e) => setPhosphorus(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                      placeholder="kg/ha"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-krishi-text">Potassium (K)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={potassium}
                      onChange={(e) => setPotassium(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                      placeholder="kg/ha"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold mb-1 text-krishi-text">EC (dS/m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={ec}
                      onChange={(e) => setEc(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                      placeholder="e.g. 0.45"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-krishi-text">Organic Carbon (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={organicCarbon}
                      onChange={(e) => setOrganicCarbon(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                      placeholder="e.g. 0.65"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-krishi-text">Soil Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={soilTemp}
                      onChange={(e) => setSoilTemp(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                      placeholder="e.g. 26.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-krishi-text">Reading Date & Time</label>
                    <input
                      type="datetime-local"
                      value={readingDate}
                      onChange={(e) => setReadingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-krishi-text">Soil Type</label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white outline-none focus:border-krishi-green"
                    >
                      <option value="Sandy Loam">Sandy Loam (રેતાળ ગોરાડુ)</option>
                      <option value="Clay Loam">Clay Loam (કાળી ચીકણી)</option>
                      <option value="Black Soil (Regur)">Black Soil / Regur (કાળી કપાસની)</option>
                      <option value="Alluvial Soil">Alluvial Soil (કાંપવાળી જમીન)</option>
                      <option value="Red Soil">Red Soil (રાતી જમીન)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-krishi-text">Field Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Test taken after morning irrigation, near borewell line..."
                    className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Manual Reading'}
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 2: SOIL TEST REPORT UPLOAD + VERIFICATION */}
            {activeTab === 'report' && (
              <div className="space-y-4 text-xs pt-1">
                {!extractionResult ? (
                  /* Step 1: Upload Report File */
                  <form onSubmit={handleExtractReport} className="space-y-4">
                    <div className="p-3 rounded-lg bg-purple-50/60 border border-purple-200/80 text-purple-900">
                      <p className="font-semibold flex items-center gap-1.5 mb-1">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Upload Soil Health Card or Lab Report
                      </p>
                      <p className="text-purple-700">
                        Supported formats: <strong>PDF, JPG, JPEG, PNG, WEBP</strong>. Our document AI extracts detected values, then presents them for your verification before committing to PostgreSQL.
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-purple-200 rounded-2xl p-6 text-center hover:bg-purple-50/30 transition-colors">
                      <input
                        type="file"
                        id="soilReportInput"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setReportFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="soilReportInput" className="cursor-pointer block space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6" />
                        </div>
                        {reportFile ? (
                          <div className="space-y-1">
                            <span className="font-bold text-sm text-purple-900 block">{reportFile.name}</span>
                            <span className="text-[11px] text-slate-500">{(reportFile.size / 1024).toFixed(1)} KB • Click to change file</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="font-bold text-sm text-krishi-text block">Click to select report file</span>
                            <span className="text-[11px] text-slate-500 block">PDF or clear photo of testing certificate</span>
                          </div>
                        )}
                      </label>
                    </div>

                    {reportError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{reportError}</span>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={!reportFile || extracting}
                        icon={extracting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                      >
                        {extracting ? 'Analyzing Report with AI...' : 'Extract Report Values'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Step 2: Verification Review Screen */
                  <div className="space-y-3 animate-in fade-in">
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckSquare className="w-4 h-4 text-amber-600" />
                        <span>Please verify these values before saving</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Extracted from <strong>{extractionResult.filename}</strong>. Review and correct any number if needed. Only values verified by you become official farmer data.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">Soil pH</label>
                        <input
                          type="number"
                          step="0.1"
                          value={verifiedPh}
                          onChange={(e) => setVerifiedPh(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-krishi-border bg-white text-xs font-bold"
                          placeholder="e.g. 6.8"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">Nitrogen (N)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={verifiedN}
                          onChange={(e) => setVerifiedN(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-krishi-border bg-white text-xs font-bold"
                          placeholder="kg/ha"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">Phosphorus (P)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={verifiedP}
                          onChange={(e) => setVerifiedP(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-krishi-border bg-white text-xs font-bold"
                          placeholder="kg/ha"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">Potassium (K)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={verifiedK}
                          onChange={(e) => setVerifiedK(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-krishi-border bg-white text-xs font-bold"
                          placeholder="kg/ha"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">EC (dS/m)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={verifiedEc}
                          onChange={(e) => setVerifiedEc(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-krishi-border bg-white text-xs"
                          placeholder="e.g. 0.45"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">Organic Carbon (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={verifiedOc}
                          onChange={(e) => setVerifiedOc(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-krishi-border bg-white text-xs"
                          placeholder="e.g. 0.65"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">Moisture (% RH)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={verifiedMoisture}
                          onChange={(e) => setVerifiedMoisture(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-krishi-border bg-white text-xs"
                          placeholder="e.g. 65.0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">Report Notes / Laboratory</label>
                      <input
                        type="text"
                        value={verifiedNotes}
                        onChange={(e) => setVerifiedNotes(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-krishi-border bg-white text-xs"
                        placeholder="Testing Laboratory Notes..."
                      />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setExtractionResult(null)}
                        className="text-xs text-slate-500 hover:text-slate-800 underline"
                      >
                        ← Upload different file
                      </button>

                      <div className="flex gap-2">
                        <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleSaveVerifiedReport}
                          disabled={loading}
                          icon={<CheckCircle2 className="w-4 h-4 text-white" />}
                        >
                          {loading ? 'Saving...' : 'Save Verified Report (source="soil_report")'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FUTURE SOIL SENSOR (IoT) */}
            {activeTab === 'sensor' && (
              <div className="space-y-4 text-xs pt-1">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span>Future Soil Sensor Architecture</span>
                  </div>
                  <p className="text-blue-800 leading-relaxed">
                    KrishiMind is engineered with an open IoT telemetry pipeline. In-field soil sensors stream measurements over WiFi/LoRaWAN via ESP32 microcontrollers directly into PostgreSQL:
                  </p>
                  <div className="p-2.5 rounded-lg bg-white border border-blue-200 font-mono text-[11px] text-blue-950">
                    Soil Sensor → ESP32 → Internet → FastAPI (<code className="text-emerald-700">POST /api/soil/iot/reading</code>) → PostgreSQL → KrishiMind Dashboard
                  </div>
                  <p className="text-[11px] text-blue-700">
                    All telemetry arriving through this hardware pipeline is automatically registered with <code className="bg-blue-100 px-1 rounded">source = "sensor"</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-slate-800">Test In-Field Sensor Integration</h4>
                  <p className="text-slate-600 text-[11px]">
                    While physical IoT probes are optional for the MVP, you can test the streaming endpoint to verify how live sensor readings are displayed with the <span className="font-semibold text-blue-700">Source: IoT Sensor</span> badge.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSimulateSensorReading}
                    disabled={simulatingSensor}
                    icon={simulatingSensor ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-blue-600" />}
                  >
                    {simulatingSensor ? 'Simulating probe telemetry...' : 'Send Test IoT Sensor Reading (source="sensor")'}
                  </Button>
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export const SoilHistoryPage = SoilPage;
