import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Clock,
  CloudRain,
  CheckCircle2,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { AIRecommendationCard } from '../../components/ai/AIRecommendationCard';
import { FarmSelector, FieldSelector } from '../../components/common/FarmSelector';
import { useFarm } from '../../context/FarmContext';
import { useLanguage } from '../../context/LanguageContext';
import { api, IrrigationRecord, AIStructuredResponse, WeatherData } from '../../services/api';

export const IrrigationPage: React.FC = () => {
  const { selectedField, selectedCrop, refreshFarms } = useFarm();
  const { language } = useLanguage();

  const [records, setRecords] = useState<IrrigationRecord[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendation, setRecommendation] = useState<AIStructuredResponse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal inputs
  const [amount, setAmount] = useState<number | ''>(25);
  const [method, setMethod] = useState('Drip');
  const [notes, setNotes] = useState('');

  const labels = {
    en: {
      title: 'Irrigation & Water Management',
      subtitle: 'Schedule and track irrigation events, root-zone absorption, and weather-synchronized watering.',
      recordEventBtn: 'Record Irrigation Event',
      noHistoryTitle: 'No irrigation history available.',
      noHistoryDesc: 'No watering events have been logged for this field. Record an event to monitor water consumption and optimize watering schedules.',
      recordFirstBtn: '+ Record First Irrigation Event',
      chartTitle: 'Recorded Water Application (mm)',
      chartDesc: 'Historical watering depth per logged irrigation event',
      recentRecordsTitle: 'Recent Irrigation Events',
      dateCol: 'Date',
      amountCol: 'Amount',
      methodCol: 'Method',
      notesCol: 'Notes',
      actionsCol: 'Action',
      deleteConfirm: 'Delete this irrigation record?',
      weatherSyncTitle: 'Weather Synchronization',
      rainProbText: 'Rain Probability',
      aiDecisionTitle: 'AI Water Decision Guidance',
      consultAiBtn: 'Consult AI Advisor',
      noRecsYet: 'No water recommendation generated yet. Consult the AI advisor to get a personalized recommendation.'
    },
    hi: {
      title: 'सिंचाई एवं जल प्रबंधन',
      subtitle: 'खेत में पानी देने का रिकॉर्ड, खपत एवं मौसम-आधारित जल प्रबंधन।',
      recordEventBtn: 'सिंचाई दर्ज करें',
      noHistoryTitle: 'कोई सिंचाई रिकॉर्ड उपलब्ध नहीं है।',
      noHistoryDesc: 'इस खेत के लिए अभी तक कोई सिंचाई दर्ज नहीं की गई है। पानी की खपत पर नज़र रखने के लिए रिकॉर्ड दर्ज करें।',
      recordFirstBtn: '+ पहली सिंचाई दर्ज करें',
      chartTitle: 'दर्ज सिंचाई मात्रा (मिमी)',
      chartDesc: 'प्रत्येक दर्ज कार्यक्रम में दिए गए पानी की मात्रा',
      recentRecordsTitle: 'हालिया सिंचाई कार्यक्रम',
      dateCol: 'तारीख',
      amountCol: 'मात्रा',
      methodCol: 'पद्धति',
      notesCol: 'टिप्पणी',
      actionsCol: 'कार्य',
      deleteConfirm: 'क्या आप इस रिकॉर्ड को हटाना चाहते हैं?',
      weatherSyncTitle: 'मौसम समन्वय',
      rainProbText: 'वर्षा संभावना',
      aiDecisionTitle: 'एआई सिंचाई निर्णय मार्गदर्शन',
      consultAiBtn: 'एआई सलाहकार से पूछें',
      noRecsYet: 'अभी कोई सिफारिश नहीं है। सलाह प्राप्त करने के लिए एआई से परामर्श करें।'
    },
    gu: {
      title: 'સિંચાઈ અને પિયત વ્યવસ્થાપન',
      subtitle: 'ખેતરમાં પિયતનું આયોજન, પાણીનો વપરાશ અને હવામાન આધારિત સિંચાઈ નિયંત્રણ.',
      recordEventBtn: 'પિયત નોંધણી કરો',
      noHistoryTitle: 'પિયતનો કોઈ ઇતિહાસ ઉપલબ્ધ નથી.',
      noHistoryDesc: 'આ પ્લોટ માટે હજુ સુધી કોઈ પિયત નોંધાયેલ નથી. પાણીનો સંગ્રહ અને બગાડ અટકાવવા માટે નોંધણી કરો.',
      recordFirstBtn: '+ પ્રથમ પિયત નોંધો',
      chartTitle: 'આપેલ પિયતનું પ્રમાણ (મિમી)',
      chartDesc: 'રેકોર્ડ કરેલ દરેક પિયતમાં પાણીની માત્રા',
      recentRecordsTitle: 'તાજેતરની પિયત નોંધણીઓ',
      dateCol: 'તારીખ',
      amountCol: 'પ્રમાણ',
      methodCol: 'પદ્ધતિ',
      notesCol: 'વિગત / નોંધ',
      actionsCol: 'ક્રિયા',
      deleteConfirm: 'શું તમે આ પિયત રેકોર્ડ કાઢી નાખવા માંગો છો?',
      weatherSyncTitle: 'હવામાન સુમેળ',
      rainProbText: 'વરસાદની સંભાવના',
      aiDecisionTitle: 'AI પિયત નિર્ણય માર્ગદર્શન',
      consultAiBtn: 'AI સલાહકાર સાથે ચર્ચા',
      noRecsYet: 'હજુ સુધી કોઈ પિયત ભલામણ નથી. AI સલાહકાર સાથે ચર્ચા કરો.'
    }
  }[language] || {
    title: 'Irrigation & Water Management',
    subtitle: 'Schedule and track irrigation events, root-zone absorption, and weather-synchronized watering.',
    recordEventBtn: 'Record Irrigation Event',
    noHistoryTitle: 'No irrigation history available.',
    noHistoryDesc: 'No watering events have been logged for this field. Record an event to monitor water consumption and optimize watering schedules.',
    recordFirstBtn: '+ Record First Irrigation Event',
    chartTitle: 'Recorded Water Application (mm)',
    chartDesc: 'Historical watering depth per logged irrigation event',
    recentRecordsTitle: 'Recent Irrigation Events',
    dateCol: 'Date',
    amountCol: 'Amount',
    methodCol: 'Method',
    notesCol: 'Notes',
    actionsCol: 'Action',
    deleteConfirm: 'Delete this irrigation record?',
    weatherSyncTitle: 'Weather Synchronization',
    rainProbText: 'Rain Probability',
    aiDecisionTitle: 'AI Water Decision Guidance',
    consultAiBtn: 'Consult AI Advisor',
    noRecsYet: 'No water recommendation generated yet. Consult the AI advisor to get a personalized recommendation.'
  };

  const loadIrrigation = async () => {
    if (selectedField) {
      const data = await api.getIrrigationRecords(selectedField.id);
      setRecords(data);
      try {
        const w = await api.getWeather(selectedField.id);
        setWeather(w);
      } catch {
        setWeather(null);
      }
      const recs = await api.getRecommendations(selectedField.id);
      if (recs.length > 0) {
        const latestDb = recs[0];
        setRecommendation({
          recommendation: latestDb.recommendation,
          reason: latestDb.reason,
          evidence: latestDb.evidence || [],
          data_used: latestDb.data_used || [],
          confidence: latestDb.confidence as any,
          next_action: latestDb.next_action || '',
          warnings: latestDb.warnings || [],
          language: (latestDb.language as any) || language,
        });
      } else {
        setRecommendation(null);
      }
    } else {
      setRecords([]);
      setWeather(null);
      setRecommendation(null);
    }
  };

  useEffect(() => {
    loadIrrigation();
  }, [selectedField, language]);

  const handleAddIrrigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedField) return;
    setLoading(true);
    try {
      await api.createIrrigationRecord({
        field_id: selectedField.id,
        amount: Number(amount) || 25,
        method,
        unit: 'mm',
        notes: notes || undefined,
      });
      await loadIrrigation();
      setShowAddModal(false);
      setNotes('');
      refreshFarms();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(labels.deleteConfirm)) {
      await api.deleteIrrigationRecord(id);
      await loadIrrigation();
      refreshFarms();
    }
  };

  const chartData = [...records].reverse().map((r, idx) => ({
    date: r.date ? new Date(r.date).toLocaleDateString(language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' }) : `E${idx + 1}`,
    amount: r.amount,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <Droplets className="w-5 h-5 text-krishi-blue" />
            {labels.title}
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            {labels.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FarmSelector />
          <FieldSelector />
          <Button size="sm" variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            {labels.recordEventBtn}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Water Application Chart */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-krishi-text mb-1">{labels.chartTitle}</h3>
            <p className="text-xs text-krishi-text-secondary mb-4">{labels.chartDesc}</p>
            {records.length === 0 ? (
              <div className="py-12 text-center text-krishi-text-secondary space-y-3">
                <CloudRain className="w-10 h-10 text-krishi-muted mx-auto opacity-70" />
                <p className="text-sm font-bold text-krishi-text">{labels.noHistoryTitle}</p>
                <p className="text-xs max-w-sm mx-auto">{labels.noHistoryDesc}</p>
                <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                  {labels.recordFirstBtn}
                </Button>
              </div>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E1" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#2E86AB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Records Table */}
          {records.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-krishi-text mb-3">{labels.recentRecordsTitle}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-krishi-border/60 text-krishi-text-secondary">
                      <th className="pb-2 font-semibold">{labels.dateCol}</th>
                      <th className="pb-2 font-semibold">{labels.amountCol}</th>
                      <th className="pb-2 font-semibold">{labels.methodCol}</th>
                      <th className="pb-2 font-semibold">{labels.notesCol}</th>
                      <th className="pb-2 font-semibold text-right">{labels.actionsCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-krishi-border/30">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-surface-secondary/40">
                        <td className="py-2.5 font-medium text-krishi-text">
                          {r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-2.5 font-bold text-krishi-blue">{r.amount} {r.unit || 'mm'}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-surface-secondary text-[11px] font-medium border border-krishi-border/60">
                            {r.method}
                          </span>
                        </td>
                        <td className="py-2.5 text-krishi-text-secondary">{r.notes || '—'}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1 hover:text-krishi-danger rounded text-krishi-muted"
                            title="Delete"
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
          )}
        </div>

        {/* Right Column: AI Guidance & Weather Sync */}
        <div className="space-y-6">
          {/* Weather Sync Card */}
          <Card className="p-5 bg-white shadow-card space-y-3">
            <h3 className="text-sm font-bold text-krishi-text pb-2 border-b border-krishi-border/40">
              {labels.weatherSyncTitle}
            </h3>
            {weather ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary/50">
                  <span className="font-semibold text-krishi-text">{weather.weather_condition}</span>
                  <span className="font-bold text-krishi-blue">{weather.rain_probability}% {labels.rainProbText}</span>
                </div>
                {weather.agricultural_interpretation && (
                  <p className="text-krishi-text-secondary leading-relaxed bg-krishi-green/5 p-2.5 rounded-lg border border-krishi-green/20">
                    {weather.agricultural_interpretation}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-krishi-text-secondary py-4 text-center">
                Weather telemetry unavailable for this location.
              </p>
            )}
          </Card>

          {/* AI Decision Card */}
          <Card className="p-5 bg-white shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-krishi-border/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-krishi-blue" />
                <h3 className="text-sm font-bold text-krishi-text">{labels.aiDecisionTitle}</h3>
              </div>
              <Link to="/ai-advisor">
                <Button variant="secondary" size="sm">
                  {labels.consultAiBtn}
                </Button>
              </Link>
            </div>
            {recommendation ? (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-krishi-text">{recommendation.recommendation}</p>
                <p className="text-krishi-text-secondary leading-relaxed">{recommendation.reason}</p>
                {recommendation.next_action && (
                  <p className="text-[11px] font-semibold text-krishi-green bg-krishi-green/10 p-2 rounded-lg">
                    Next Action: {recommendation.next_action}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-krishi-text-secondary py-4 text-center">
                {labels.noRecsYet}
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Add Irrigation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-krishi-text">{labels.recordEventBtn}</h3>
            <form onSubmit={handleAddIrrigation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Water Amount (mm)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                  placeholder="e.g. 25"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Irrigation Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white outline-none focus:border-krishi-green"
                >
                  <option value="Drip">Drip Irrigation (ટપક પિયત / ड्रिप)</option>
                  <option value="Sprinkler">Sprinkler (ફુવારા / स्प्रिंकलर)</option>
                  <option value="Flood">Flood / Furrow (ધોરીયા / बाढ़)</option>
                  <option value="Manual">Manual (હાથેથી / मैन्युअल)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                  placeholder="e.g. Borewell water, 3 hours duration..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-krishi-border/60">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={loading}>
                  Save Record
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export const IrrigationHistoryPage = IrrigationPage;
