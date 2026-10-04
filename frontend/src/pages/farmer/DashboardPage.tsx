import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CloudSun,
  Droplets,
  Sprout,
  Activity,
  Plus,
  ArrowRight,
  Wind,
  Thermometer,
  Calendar,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  MapPin,
  Navigation,
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { GoogleMapsLocationPicker, LocationResult } from '../../components/common/GoogleMapsLocationPicker';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { Card } from '../../components/common/Card';
import { MetricCard } from '../../components/common/MetricCard';
import { Button } from '../../components/common/Button';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { AIRecommendationCard } from '../../components/ai/AIRecommendationCard';
import { FarmSelector, FieldSelector } from '../../components/common/FarmSelector';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { useLanguage } from '../../context/LanguageContext';
import { api, AIStructuredResponse, WeatherData, SoilReading, AIRecommendation, IrrigationRecord } from '../../services/api';
import { useTranslation } from 'react-i18next';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { farms, fields, crops, selectedFarm, selectedField, selectedCrop, refreshFarms } = useFarm();
  const { language } = useLanguage();
  const { t } = useTranslation('dashboard');

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [recommendation, setRecommendation] = useState<AIStructuredResponse | null>(null);
  const [recentRecs, setRecentRecs] = useState<AIRecommendation[]>([]);
  const [soilHistory, setSoilHistory] = useState<SoilReading[]>([]);
  const [irrigationHistory, setIrrigationHistory] = useState<IrrigationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Google Maps Location Modal
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Modals for quick actions
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [showIrrigModal, setShowIrrigModal] = useState(false);
  const [newMoisture, setNewMoisture] = useState<number | ''>('');
  const [newPh, setNewPh] = useState<number | ''>('');
  const [newNitrogen, setNewNitrogen] = useState<number | ''>('');
  const [newPhosphorus, setNewPhosphorus] = useState<number | ''>('');
  const [newPotassium, setNewPotassium] = useState<number | ''>('');
  const [newSoilTemp, setNewSoilTemp] = useState<number | ''>('');
  const [newAmount, setNewAmount] = useState<number>(25);
  const [newMethod, setNewMethod] = useState('Drip');

  // Multilingual UI Content
  const ui = {
    en: {
      welcome: `Welcome to KrishiMind AI 👋`,
      emptySubtitle: 'Your agricultural workspace is currently empty. Let’s add your farm information to start receiving personalized agricultural insights.',
      noFarmAdded: 'No farm added yet.',
      addFirstFarmBtn: 'Add Your First Farm',
      setupProgress: 'Farm Setup Progress',
      stepLocation: 'Add your location',
      stepFarm: 'Add your first farm',
      stepField: 'Add your field / plot',
      stepCrop: 'Add your crop cycle',
      stepSoil: 'Add soil information',
      stepIrrigation: 'Add irrigation information',
      startSetup: 'Add Your First Farm',
      yourData: 'Your Agricultural Data',
      farmsCount: 'Farms',
      fieldsCount: 'Fields',
      cropsCount: 'Crops',
      soilCount: 'Soil Readings',
      irrigationCount: 'Irrigation Records',
      aiAdvisorTitle: 'AI Decision Advisor',
      aiAdvisorEmpty: 'Add your farm and crop information before requesting personalized recommendations.',
      setUpFarmBtn: 'Add Your First Farm',
      noFieldsAdded: 'No fields added yet.',
      partialFarmAdded: 'No fields added yet.',
      createFirstField: 'Create Your First Field',
      noCropAdded: 'No crop added yet.',
      partialFieldAdded: 'No crop added yet.',
      addFirstCrop: 'Add Your First Crop',
      noSoilReadings: 'No soil readings available.',
      partialSoilTip: 'No soil readings available.',
      uploadCropImageTip: 'Upload a crop image to analyze crop health.',
      addSoilReadingBtn: '+ Add Soil Reading',
      recordIrrigBtn: '+ Record Irrigation',
      soilMoistureTitle: 'Root-Zone Moisture',
      optimalRange: 'Optimal range: 60-75%',
      logFirstSoil: 'No soil readings available',
      noSensorData: 'No soil readings available',
      ambientClimate: 'Ambient Climate',
      weatherUnavailable: 'Weather data unavailable',
      cropPhenology: 'Active Crop Phenology',
      noCrop: 'No active crop',
      assignCrop: 'Assign crop to plot',
      irrigationReadiness: 'Irrigation Readiness',
      noIrrigData: 'No irrigation history available',
      soilHistoryTitle: 'Soil Moisture Trend',
      noSoilHistory: 'No soil history available yet. Record soil moisture tests to visualize trends.',
      oneSoilReading: 'Add more readings to view a soil trend.',
      recentRecsTitle: 'Recent AI Agricultural Recommendations',
      noRecsYet: 'No AI recommendations yet. Consult the AI advisor to generate decisions.',
      consultAiBtn: 'Consult AI Advisor',
      quickActions: 'Quick Agronomic Actions',
      analyzeCropBtn: 'Analyze Crop Image',
      connectingWeather: 'Checking coordinates...',
    },
    hi: {
      welcome: `कृषिमाइंड AI में आपका स्वागत है 👋`,
      emptySubtitle: 'आपका कृषि कार्यक्षेत्र अभी खाली है। व्यक्तिगत कृषि सलाह प्राप्त करने के लिए कृपया अपने फार्म की जानकारी जोड़ें।',
      noFarmAdded: 'No farm added yet.',
      addFirstFarmBtn: 'Add Your First Farm',
      setupProgress: 'फार्म सेटअप प्रगति',
      stepLocation: 'स्थान जोड़ें',
      stepFarm: 'पहला फार्म जोड़ें',
      stepField: 'खेत / प्लॉट जोड़ें',
      stepCrop: 'फसल चक्र जोड़ें',
      stepSoil: 'मिट्टी की जानकारी जोड़ें',
      stepIrrigation: 'सिंचाई की जानकारी जोड़ें',
      startSetup: 'Add Your First Farm',
      yourData: 'आपका कृषि डेटा',
      farmsCount: 'फार्म',
      fieldsCount: 'खेत / प्लॉट',
      cropsCount: 'फसलें',
      soilCount: 'मिट्टी परीक्षण',
      irrigationCount: 'सिंचाई रिकॉर्ड',
      aiAdvisorTitle: 'एआई निर्णय सलाहकार',
      aiAdvisorEmpty: 'व्यक्तिगत सिफारिशें प्राप्त करने से पहले अपने खेत और फसल की जानकारी जोड़ें।',
      setUpFarmBtn: 'Add Your First Farm',
      noFieldsAdded: 'No fields added yet.',
      partialFarmAdded: 'No fields added yet.',
      createFirstField: 'Create Your First Field',
      noCropAdded: 'No crop added yet.',
      partialFieldAdded: 'No crop added yet.',
      addFirstCrop: 'Add Your First Crop',
      noSoilReadings: 'No soil readings available.',
      partialSoilTip: 'No soil readings available.',
      uploadCropImageTip: 'Upload a crop image to analyze crop health.',
      addSoilReadingBtn: '+ मिट्टी परीक्षण जोड़ें',
      recordIrrigBtn: '+ सिंचाई दर्ज करें',
      soilMoistureTitle: 'जड़ क्षेत्र की नमी',
      optimalRange: 'अनुकूल सीमा: 60-75%',
      logFirstSoil: 'No soil readings available',
      noSensorData: 'No soil readings available',
      ambientClimate: 'स्थानीय मौसम',
      weatherUnavailable: 'मौसम डेटा उपलब्ध नहीं है',
      cropPhenology: 'सक्रिय फसल स्थिति',
      noCrop: 'कोई फसल दर्ज नहीं',
      assignCrop: 'प्लॉट में फसल जोड़ें',
      irrigationReadiness: 'सिंचाई तत्परता',
      noIrrigData: 'कोई सिंचाई रिकॉर्ड उपलब्ध नहीं',
      soilHistoryTitle: 'मिट्टी की नमी का रुझान',
      noSoilHistory: 'अभी कोई मिट्टी का इतिहास उपलब्ध नहीं है। रुझान देखने के लिए परीक्षण दर्ज करें।',
      oneSoilReading: 'रुझान ग्राफ देखने के लिए और परीक्षण जोड़ें।',
      recentRecsTitle: 'हाल की एआई सिफारिशें',
      noRecsYet: 'अभी कोई एआई सिफारिश नहीं है। निर्णय प्राप्त करने के लिए एआई से पूछें।',
      consultAiBtn: 'एआई सलाहकार से पूछें',
      quickActions: 'त्वरित कृषि कार्य',
      analyzeCropBtn: 'Analyze Crop Image',
      connectingWeather: 'मौसम प्राप्त हो रहा है...',
    },
    gu: {
      welcome: `કૃષિમાઇન્ડ AI માં આપનું સ્વાગત છે 👋`,
      emptySubtitle: 'તમારું કૃષિ કાર્યક્ષેત્ર હાલમાં ખાલી છે. વ્યક્તિગત કૃષિ સલાહ અને જીવંત નિર્ણયો મેળવવા માટે તમારા ફાર્મની વિગતો ઉમેરો.',
      noFarmAdded: 'No farm added yet.',
      addFirstFarmBtn: 'Add Your First Farm',
      setupProgress: 'ખેતર સેટઅપ પ્રગતિ',
      stepLocation: 'તમારું સ્થાન ઉમેરો',
      stepFarm: 'પ્રથમ ફાર્મ ઉમેરો',
      stepField: 'પ્લોટ / ક્યારી ઉમેરો',
      stepCrop: 'પાકની વિગત ઉમેરો',
      stepSoil: 'માટીની વિગતો ઉમેરો',
      stepIrrigation: 'સિંચાઈની વિગત ઉમેરો',
      startSetup: 'Add Your First Farm',
      yourData: 'તમારો કૃષિ ડેટા',
      farmsCount: 'ફાર્મ',
      fieldsCount: 'પ્લોટ',
      cropsCount: 'પાક',
      soilCount: 'જમીન પરીક્ષણ',
      irrigationCount: 'પિયત રેકોર્ડ',
      aiAdvisorTitle: 'AI નિર્ણય સલાહકાર',
      aiAdvisorEmpty: 'સચોટ ભલામણ મેળવવા પહેલાં કૃપા કરીને ખેતર અને પાકની માહિતી ઉમેરો.',
      setUpFarmBtn: 'Add Your First Farm',
      noFieldsAdded: 'No fields added yet.',
      partialFarmAdded: 'No fields added yet.',
      createFirstField: 'Create Your First Field',
      noCropAdded: 'No crop added yet.',
      partialFieldAdded: 'No crop added yet.',
      addFirstCrop: 'Add Your First Crop',
      noSoilReadings: 'No soil readings available.',
      partialSoilTip: 'No soil readings available.',
      uploadCropImageTip: 'Upload a crop image to analyze crop health.',
      addSoilReadingBtn: '+ જમીન ભેજ ઉમેરો',
      recordIrrigBtn: '+ પિયત નોંધો',
      soilMoistureTitle: 'જમીનમાં ભેજનું પ્રમાણ',
      optimalRange: 'યોગ્ય પ્રમાણ: 60-75%',
      logFirstSoil: 'No soil readings available',
      noSensorData: 'No soil readings available',
      ambientClimate: 'જીવંત હવામાન',
      weatherUnavailable: 'હવામાન ડેટા ઉપલબ્ધ નથી',
      cropPhenology: 'હાલનો પાક તબક્કો',
      noCrop: 'પાક નોંધાયેલ નથી',
      assignCrop: 'પ્લોટમાં પાક જોડો',
      irrigationReadiness: 'પિયત / સિંચાઈ જરૂરિયાત',
      noIrrigData: 'પિયતનો કોઈ ઇતિહાસ ઉપલબ્ધ નથી',
      soilHistoryTitle: 'જમીન ભેજનો ટ્રેન્ડ',
      noSoilHistory: 'હજુ કોઈ જમીન ભેજનો રેકોર્ડ નથી. ટ્રેન્ડ જોવા માટે પ્રથમ ભેજ નોંધો.',
      oneSoilReading: 'આલેખ જોવા માટે વધુ પરીક્ષણ નોંધો ઉમેરો.',
      recentRecsTitle: 'તાજેતરની AI ભલામણો',
      noRecsYet: 'હજુ સુધી કોઈ AI ભલામણ નથી. સલાહકાર સાથે ચર્ચા શરૂ કરો.',
      consultAiBtn: 'AI સલાહકાર સાથે ચર્ચા',
      quickActions: 'ઝડપી કૃષિ કાર્યો',
      analyzeCropBtn: 'Analyze Crop Image',
      connectingWeather: 'હવામાન તપાસી રહ્યું છે...',
    }
  }[language] || {
    welcome: `Welcome to KrishiMind AI 👋`,
    emptySubtitle: 'Your agricultural workspace is currently empty. Let’s add your farm information to start receiving personalized agricultural insights.',
    setupProgress: 'Farm Setup Progress',
    stepLocation: 'Add your location',
    stepFarm: 'Add your first farm',
    stepField: 'Add your field / plot',
    stepCrop: 'Add your crop cycle',
    stepSoil: 'Add soil information',
    stepIrrigation: 'Add irrigation information',
    startSetup: 'Start Farm Setup',
    yourData: 'Your Agricultural Data',
    farmsCount: 'Farms',
    fieldsCount: 'Fields',
    cropsCount: 'Crops',
    soilCount: 'Soil Readings',
    irrigationCount: 'Irrigation Records',
    aiAdvisorTitle: 'AI Decision Advisor',
    aiAdvisorEmpty: 'Add your farm and crop information before requesting personalized recommendations.',
    setUpFarmBtn: 'Set Up Farm',
    partialFarmAdded: 'Your farm has been added. Add a field / plot zone to continue setup.',
    createFirstField: 'Create Your First Field',
    partialFieldAdded: 'Your field has been added. Add a crop to begin receiving crop-specific insights.',
    addFirstCrop: 'Add Your First Crop',
    partialSoilTip: 'Your farm is configured, but adding soil information will improve the accuracy of agricultural recommendations.',
    addSoilReadingBtn: '+ Add Soil Reading',
    recordIrrigBtn: '+ Record Irrigation',
    soilMoistureTitle: 'Root-Zone Moisture',
    optimalRange: 'Optimal range: 60-75%',
    logFirstSoil: 'Log first soil test',
    noSensorData: 'No sensor data',
    ambientClimate: 'Ambient Climate',
    weatherUnavailable: 'Weather data unavailable',
    cropPhenology: 'Active Crop Phenology',
    noCrop: 'No active crop',
    assignCrop: 'Assign crop to plot',
    irrigationReadiness: 'Irrigation Readiness',
    noIrrigData: 'No irrigation history available',
    soilHistoryTitle: 'Soil Moisture Trend',
    noSoilHistory: 'No soil history available yet. Record soil moisture tests to visualize trends.',
    oneSoilReading: 'Add more readings to view a soil trend.',
    recentRecsTitle: 'Recent AI Agricultural Recommendations',
    noRecsYet: 'No AI recommendations yet. Consult the AI advisor to generate decisions.',
    consultAiBtn: 'Consult AI Advisor',
    quickActions: 'Quick Agronomic Actions',
    analyzeCropBtn: 'Analyze Crop Image',
    connectingWeather: 'Checking coordinates...',
  };

  useEffect(() => {
    async function loadDashboardData() {
      if (!selectedField) {
        setLoading(false);
        setWeather(null);
        setSoilHistory([]);
        setIrrigationHistory([]);
        setRecentRecs([]);
        setRecommendation(null);
        return;
      }

      setLoading(true);
      setWeatherError(false);

      try {
        // 1. Fetch real weather based on coordinates
        try {
          const w = await api.getWeather(selectedField.id);
          setWeather(w);
        } catch {
          setWeather(null);
          setWeatherError(true);
        }

        // 2. Load real soil history
        const s = await api.getSoilReadings(selectedField.id);
        setSoilHistory(s);

        // 3. Load real irrigation records
        try {
          const irrig = await api.getIrrigationRecords(selectedField.id);
          setIrrigationHistory(irrig);
        } catch {
          setIrrigationHistory([]);
        }

        // 4. Load real DB recommendations
        const dbRecs = await api.getRecommendations(selectedField.id);
        setRecentRecs(dbRecs);

        if (dbRecs.length > 0) {
          const latestDb = dbRecs[0];
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
      } catch (e) {
        console.error('Dashboard load error', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [selectedField, language]);

  const handleAddSoil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedField) return;
    await api.createSoilReading({
      field_id: selectedField.id,
      moisture: newMoisture !== '' ? Number(newMoisture) : undefined,
      ph: newPh !== '' ? Number(newPh) : undefined,
      nitrogen: newNitrogen !== '' ? Number(newNitrogen) : undefined,
      phosphorus: newPhosphorus !== '' ? Number(newPhosphorus) : undefined,
      potassium: newPotassium !== '' ? Number(newPotassium) : undefined,
      soil_temperature: newSoilTemp !== '' ? Number(newSoilTemp) : undefined,
    });
    const freshSoil = await api.getSoilReadings(selectedField.id);
    setSoilHistory(freshSoil);
    setShowSoilModal(false);
    refreshFarms();
  };

  const handleSaveFarmLocation = async (loc: LocationResult) => {
    if (!selectedFarm) return;
    try {
      await api.updateFarm(selectedFarm.id, {
        latitude: loc.latitude,
        longitude: loc.longitude,
        location: loc.locationName,
        state: loc.state,
        district: loc.district,
        city: loc.city,
      });
      if (selectedField) {
        await api.updateField(selectedField.id, {
          latitude: loc.latitude,
          longitude: loc.longitude,
          location: loc.locationName,
        });
      }
      await refreshFarms();
    } catch (err) {
      console.error('Failed to update farm location', err);
    } finally {
      setShowLocationModal(false);
    }
  };

  const handleAddIrrigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedField) return;
    await api.createIrrigationRecord({
      field_id: selectedField.id,
      amount: Number(newAmount),
      method: newMethod,
      unit: 'mm',
      notes: `${newMethod} irrigation scheduled by farmer`,
    });
    const freshIrrig = await api.getIrrigationRecords(selectedField.id);
    setIrrigationHistory(freshIrrig);
    setShowIrrigModal(false);
  };

  // Dynamic Onboarding Step States
  const hasFarm = farms.length > 0;
  const hasField = fields.length > 0;
  const hasCrop = crops.length > 0;
  const hasSoil = soilHistory.length > 0;
  const hasIrrigation = irrigationHistory.length > 0;
  const hasLocation = hasFarm && Boolean(selectedFarm?.location || selectedFarm?.latitude);

  const soilMoistureVal = soilHistory.length > 0 && soilHistory[0].moisture !== null ? soilHistory[0].moisture : undefined;

  // Format historical chart data ONLY from real DB records
  const chartData = [...soilHistory].reverse().map((s) => ({
    time: s.recorded_at ? new Date(s.recorded_at).toLocaleDateString(language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' }) : '',
    moisture: s.moisture,
  }));

  // ========================================================
  // 1. COMPLETELY EMPTY ONBOARDING DASHBOARD (0 FARMS)
  // ========================================================
  if (!hasFarm) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-krishi-green/15 via-krishi-green/5 to-transparent border border-krishi-green/30 rounded-2xl p-6 sm:p-8">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-krishi-text">
              {ui.welcome}
            </h1>
            <p className="text-sm text-krishi-text-secondary leading-relaxed">
              {ui.emptySubtitle}
            </p>
          </div>
        </div>

        {/* Setup Progress Card */}
        <Card className="p-6 bg-white shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-krishi-border/60">
            <div>
              <h2 className="text-base font-bold text-krishi-text">{ui.setupProgress}</h2>
              <p className="text-xs text-krishi-text-secondary">Complete these steps gradually to receive tailored agronomic intelligence.</p>
            </div>
            <Link to="/farms/create">
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                {ui.startSetup}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-krishi-border bg-surface-secondary/40 text-xs">
              <Circle className="w-4 h-4 text-krishi-muted shrink-0" />
              <span className="font-medium text-krishi-text">{ui.stepLocation}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-krishi-border bg-surface-secondary/40 text-xs">
              <Circle className="w-4 h-4 text-krishi-muted shrink-0" />
              <span className="font-medium text-krishi-text">{ui.stepFarm}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-krishi-border bg-surface-secondary/40 text-xs">
              <Circle className="w-4 h-4 text-krishi-muted shrink-0" />
              <span className="font-medium text-krishi-text">{ui.stepField}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-krishi-border bg-surface-secondary/40 text-xs">
              <Circle className="w-4 h-4 text-krishi-muted shrink-0" />
              <span className="font-medium text-krishi-text">{ui.stepCrop}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-krishi-border bg-surface-secondary/40 text-xs">
              <Circle className="w-4 h-4 text-krishi-muted shrink-0" />
              <span className="font-medium text-krishi-text">{ui.stepSoil}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-krishi-border bg-surface-secondary/40 text-xs">
              <Circle className="w-4 h-4 text-krishi-muted shrink-0" />
              <span className="font-medium text-krishi-text">{ui.stepIrrigation}</span>
            </div>
          </div>
        </Card>

        {/* Real Data Counters (All 0) */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-krishi-text-secondary px-1">{ui.yourData}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card className="p-4 text-center">
              <p className="text-xs text-krishi-text-secondary font-medium">{ui.farmsCount}</p>
              <p className="text-2xl font-black text-krishi-text mt-1">0</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-krishi-text-secondary font-medium">{ui.fieldsCount}</p>
              <p className="text-2xl font-black text-krishi-text mt-1">0</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-krishi-text-secondary font-medium">{ui.cropsCount}</p>
              <p className="text-2xl font-black text-krishi-text mt-1">0</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-krishi-text-secondary font-medium">{ui.soilCount}</p>
              <p className="text-2xl font-black text-krishi-text mt-1">0</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-krishi-text-secondary font-medium">{ui.irrigationCount}</p>
              <p className="text-2xl font-black text-krishi-text mt-1">0</p>
            </Card>
          </div>
        </div>

        {/* AI Advisor Prompt */}
        <Card className="p-6 bg-white border border-krishi-blue/30 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-krishi-blue/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-krishi-blue" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-krishi-text">{ui.aiAdvisorTitle}</h4>
              <p className="text-xs text-krishi-text-secondary max-w-lg mt-0.5">
                {ui.aiAdvisorEmpty}
              </p>
            </div>
          </div>
          <Link to="/farms/create" className="shrink-0 w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full justify-center">
              {ui.setUpFarmBtn}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // ========================================================
  // 2. PARTIAL SETUP DASHBOARD: FARM EXISTS, BUT NO FIELD
  // ========================================================
  if (!hasField || !selectedField) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Onboarding Checklist Status Bar */}
        <Card className="p-4 bg-krishi-green/5 border border-krishi-green/20">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold text-krishi-green">
                <CheckCircle2 className="w-4 h-4" /> {ui.stepFarm}
              </span>
              <span className="flex items-center gap-1.5 text-krishi-text-secondary">
                <Circle className="w-4 h-4" /> {ui.stepField}
              </span>
              <span className="flex items-center gap-1.5 text-krishi-muted">
                <Circle className="w-4 h-4" /> {ui.stepCrop}
              </span>
              <span className="flex items-center gap-1.5 text-krishi-muted">
                <Circle className="w-4 h-4" /> {ui.stepSoil}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-krishi-green bg-white px-2.5 py-1 rounded-md border border-krishi-green/20">
              {selectedFarm?.name} ({selectedFarm?.location})
            </span>
          </div>
        </Card>

        {/* Empty Field Call-to-Action */}
        <Card className="p-12 text-center text-krishi-text-secondary space-y-4 bg-white shadow-card">
          <Layers className="w-12 h-12 mx-auto text-krishi-blue opacity-80" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-krishi-text">{ui.partialFarmAdded}</h3>
            <p className="text-xs text-krishi-text-secondary max-w-md mx-auto">
              Add plot zones and field sections to begin tracking root-zone moisture, microclimate, and crop cultivation cycles.
            </p>
          </div>
          <Link to="/fields/create">
            <Button variant="primary" size="md">
              {ui.createFirstField}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // ========================================================
  // 3. FULLY ACTIVE OR PARTIAL FIELD DASHBOARD
  // ========================================================
  return (
    <div className="space-y-6">
      {/* Top Bar with Farm & Field Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-krishi-text flex items-center gap-2 flex-wrap">
            <span>{selectedFarm?.name || 'Farm'}</span>
            <button
              onClick={() => setShowLocationModal(true)}
              title="Click to view or calibrate live location on Google Maps"
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{selectedFarm?.location || 'Set Live GPS'}</span>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                Google Maps
              </span>
            </button>
          </h1>
          <p className="text-xs text-krishi-text-secondary mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{selectedField?.name} • {selectedField?.area} {selectedFarm?.unit || 'acres'} • {selectedField?.soil_type}</span>
            {selectedFarm?.latitude && selectedFarm?.longitude && (
              <span className="font-mono text-[11px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                {selectedFarm.latitude.toFixed(4)}°N, {selectedFarm.longitude.toFixed(4)}°E
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLocationModal(true)}
            icon={<Navigation className="w-3.5 h-3.5 text-emerald-600" />}
            className="text-xs border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800"
          >
            Live GPS Map
          </Button>
          <FarmSelector />
          <FieldSelector />
        </div>
      </div>

      {/* Partial Setup Banner for Crops */}
      {!hasCrop && (
        <Card className="p-4 bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-krishi-text">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold text-amber-900">{ui.noCropAdded}</span>
          </div>
          <Link to="/crops/create">
            <Button variant="secondary" size="sm">
              {ui.addFirstCrop}
            </Button>
          </Link>
        </Card>
      )}

      {/* Partial Setup Banner for Soil */}
      {hasCrop && !hasSoil && (
        <Card className="p-4 bg-krishi-blue/10 border border-krishi-blue/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-krishi-text">
            <HelpCircle className="w-4 h-4 text-krishi-blue shrink-0" />
            <span className="font-semibold text-sky-950">{ui.noSoilReadings}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowSoilModal(true)}>
            {ui.addSoilReadingBtn}
          </Button>
        </Card>
      )}

      {/* Crop Image Health Analysis Call-to-action */}
      {hasCrop && (
        <Card className="p-3.5 bg-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 text-xs text-emerald-950">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{ui.uploadCropImageTip}</span>
          </div>
          <Link to="/crops/diagnose">
            <Button variant="outline" size="sm" icon={<Camera className="w-3.5 h-3.5 text-emerald-700" />} className="text-xs border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100">
              {ui.analyzeCropBtn}
            </Button>
          </Link>
        </Card>
      )}

      {/* Top 4 Key Agricultural Metric Cards */}
      {(() => {
        const hasValidWeather = weather && typeof weather.temperature === 'number' && !isNaN(weather.temperature);
        const isDelay = recommendation && (
          recommendation.recommendation.toLowerCase().includes('delay') ||
          recommendation.recommendation.toLowerCase().includes('postpone') ||
          recommendation.recommendation.toLowerCase().includes('મુલ્તવી') ||
          recommendation.recommendation.toLowerCase().includes('ટાળો')
        );
        const irrigStatus = recommendation
          ? (isDelay ? 'DELAY' : 'RECOMMENDED')
          : (hasSoil ? 'OPTIMAL' : 'PENDING TEST');

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Root Zone Moisture */}
            {(() => {
              const latestSoil = soilHistory.length > 0 ? soilHistory[0] : null;
              const sourceLabel = latestSoil
                ? (latestSoil.source === 'sensor'
                    ? 'IoT Sensor'
                    : latestSoil.source === 'soil_report'
                    ? 'Soil test report'
                    : 'Farmer entered')
                : 'Not provided';
              const updatedLabel = latestSoil?.recorded_at
                ? new Date(latestSoil.recorded_at).toLocaleDateString()
                : undefined;

              return (
                <MetricCard
                  title={ui.soilMoistureTitle}
                  value={soilMoistureVal !== undefined ? `${soilMoistureVal}%` : ui.noSensorData}
                  unit={soilMoistureVal !== undefined ? 'RH' : ''}
                  subtitle={soilMoistureVal !== undefined ? ui.optimalRange : ui.logFirstSoil}
                  accentColor={soilMoistureVal === undefined ? 'neutral' : soilMoistureVal > 75 ? 'danger' : soilMoistureVal >= 60 ? 'green' : 'gold'}
                  icon={<Droplets className="w-5 h-5" />}
                  sourceBadge={{
                    source: sourceLabel,
                    updated: updatedLabel,
                  }}
                  progress={soilMoistureVal !== undefined ? {
                    value: Math.min(100, Math.max(0, soilMoistureVal)),
                    minLabel: '0%',
                    maxLabel: '100%',
                    targetLabel: '60-75%'
                  } : undefined}
                  trend={soilMoistureVal !== undefined ? {
                    value: 'Telemetry Active',
                    isPositive: true,
                    label: sourceLabel
                  } : undefined}
                />
              );
            })()}

            {/* Metric 2: Ambient Climate (Weather) */}
            <MetricCard
              title={ui.ambientClimate}
              value={hasValidWeather ? `${Math.round(weather.temperature * 10) / 10}°C` : weatherError ? '--°C' : ui.connectingWeather}
              unit={hasValidWeather && weather.humidity !== undefined ? `${weather.humidity}% hum` : ''}
              subtitle={hasValidWeather ? weather.weather_condition : weatherError ? ui.weatherUnavailable : selectedFarm?.location || 'Coordinates pending'}
              accentColor={hasValidWeather ? 'blue' : 'neutral'}
              icon={<CloudSun className="w-5 h-5" />}
              onClick={() => setShowLocationModal(true)}
              sourceBadge={{
                source: 'Weather API (Open-Meteo)',
                updated: hasValidWeather ? 'Live dynamic' : 'Pending',
              }}
              trend={hasValidWeather && weather.rain_probability !== undefined ? {
                value: `${weather.rain_probability}% Rain Prob`,
                isPositive: weather.rain_probability < 50,
                isNeutral: weather.rain_probability === 0,
                label: 'Forecast'
              } : {
                value: 'Live GPS Map',
                isNeutral: true,
                label: 'Click to calibrate'
              }}
            />

            {/* Metric 3: Active Crop Phenology */}
            <MetricCard
              title={ui.cropPhenology}
              value={selectedCrop?.name || ui.noCrop}
              unit={selectedCrop?.variety || ''}
              subtitle={selectedCrop ? `Stage: ${selectedCrop.growth_stage}` : ui.assignCrop}
              accentColor={selectedCrop ? 'earth' : 'neutral'}
              icon={<Sprout className="w-5 h-5" />}
              sourceBadge={{
                source: selectedCrop ? 'Farmer profile' : 'Not added',
                updated: selectedCrop?.planting_date ? `Planted: ${selectedCrop.planting_date}` : undefined,
              }}
              trend={selectedCrop ? {
                value: 'Monitoring Growth',
                isNeutral: true,
                label: selectedCrop.growth_stage || 'Cycle'
              } : undefined}
            />

            {/* Metric 4: Irrigation Readiness */}
            <MetricCard
              title={ui.irrigationReadiness}
              value={irrigStatus}
              subtitle={
                recommendation
                  ? (recommendation.recommendation.slice(0, 36) + '...')
                  : (hasIrrigation ? `${irrigationHistory[0].amount} mm logged` : ui.noIrrigData)
              }
              accentColor={isDelay ? 'danger' : irrigStatus === 'RECOMMENDED' ? 'green' : irrigStatus === 'OPTIMAL' ? 'blue' : 'neutral'}
              icon={<Activity className="w-5 h-5" />}
              sourceBadge={{
                source: recommendation ? 'AI Decision Engine' : hasSoil ? 'Telemetry Rule' : 'Pending Data',
                updated: recommendation ? 'Active' : undefined,
              }}
              trend={{
                value: recommendation ? (isDelay ? 'Delay Advised' : 'Optimal Window') : hasSoil ? 'Moisture Balanced' : 'Test Needed',
                isPositive: !isDelay && irrigStatus !== 'PENDING TEST',
                isNeutral: irrigStatus === 'PENDING TEST',
                label: 'AI Advisory'
              }}
            />
          </div>
        );
      })()}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): AI Recommendation & Soil Trend */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommendation Card */}
          {recommendation ? (
            <AIRecommendationCard
              data={recommendation}
              cropName={selectedCrop?.name}
              fieldName={selectedField?.name}
              onAskFollowUp={(q) => navigate('/ai-advisor', { state: { initialQuestion: q } })}
            />
          ) : (
            <Card className="p-6 bg-white shadow-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-krishi-border/40">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-krishi-blue" />
                  <h3 className="text-sm font-bold text-krishi-text">{ui.recentRecsTitle}</h3>
                </div>
                <Link to="/ai-advisor">
                  <Button variant="primary" size="sm">
                    {ui.consultAiBtn}
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-krishi-text-secondary py-4 text-center">
                {ui.noRecsYet}
              </p>
            </Card>
          )}

          {/* Real Soil Moisture Telemetry Chart */}
          <Card className="p-6 bg-white shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-krishi-border/60">
              <div>
                <h3 className="text-sm font-bold text-krishi-text">{ui.soilHistoryTitle}</h3>
                <p className="text-xs text-krishi-text-secondary">Historical root-zone readings from database telemetry</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowSoilModal(true)}>
                {ui.addSoilReadingBtn}
              </Button>
            </div>

            {chartData.length === 0 ? (
              <div className="py-12 text-center text-krishi-text-secondary space-y-2">
                <Droplets className="w-8 h-8 text-krishi-muted mx-auto opacity-70" />
                <p className="text-xs max-w-sm mx-auto">{ui.noSoilHistory}</p>
              </div>
            ) : chartData.length === 1 ? (
              <div className="py-8 text-center text-krishi-text-secondary space-y-3">
                <div className="text-2xl font-black text-krishi-green">{chartData[0].moisture}% RH</div>
                <p className="text-xs text-krishi-text-secondary font-medium">{ui.oneSoilReading}</p>
              </div>
            ) : (
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="moisture" stroke="#2E7D32" strokeWidth={2} fillOpacity={1} fill="url(#soilGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1 col): Weather Details & Actions */}
        <div className="space-y-6">
          {/* Real Weather Forecast Panel */}
          <Card className="p-6 bg-white shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-krishi-border/40">
              <h3 className="text-sm font-bold text-krishi-text">{t('weatherForecast', 'Weather Forecast')}</h3>
              <CloudSun className="w-4 h-4 text-krishi-blue" />
            </div>

            {weather ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-surface-secondary/50 p-3 rounded-xl">
                  <div>
                    <span className="text-2xl font-black text-krishi-text">{weather.temperature}°C</span>
                    <p className="text-xs text-krishi-text-secondary">{weather.weather_condition}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold text-krishi-blue">{weather.rain_probability}% Rain</p>
                    <p className="text-krishi-text-secondary">{weather.humidity}% Humidity</p>
                  </div>
                </div>

                {weather.agricultural_interpretation && (
                  <p className="text-xs text-krishi-text-secondary bg-krishi-green/5 p-2.5 rounded-lg border border-krishi-green/20 leading-relaxed">
                    {weather.agricultural_interpretation}
                  </p>
                )}

                {/* 24-Hour Forecast Bar/List */}
                {weather.forecast_24h && weather.forecast_24h.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-krishi-text-secondary">Next 24 Hours</p>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                      {weather.forecast_24h.slice(0, 4).map((f, i) => (
                        <div key={i} className="p-2 rounded-lg bg-surface-secondary/40 border border-krishi-border/40">
                          <p className="text-[10px] text-krishi-text-secondary">{f.time}</p>
                          <p className="font-bold text-krishi-text mt-0.5">{f.temperature}°</p>
                          <p className="text-[10px] text-krishi-blue font-semibold">{f.rain_probability}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-krishi-text-secondary space-y-2">
                <CloudSun className="w-8 h-8 text-krishi-muted mx-auto opacity-70" />
                <p className="text-xs">{weatherError ? ui.weatherUnavailable : ui.connectingWeather}</p>
              </div>
            )}
          </Card>

          {/* Quick Actions Card */}
          <Card className="p-6 bg-white shadow-card space-y-3">
            <h3 className="text-sm font-bold text-krishi-text pb-2 border-b border-krishi-border/40">{ui.quickActions}</h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<Droplets className="w-4 h-4" />}
                className="w-full justify-start text-xs"
                onClick={() => setShowSoilModal(true)}
              >
                {ui.addSoilReadingBtn}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Activity className="w-4 h-4" />}
                className="w-full justify-start text-xs"
                onClick={() => setShowIrrigModal(true)}
              >
                {ui.recordIrrigBtn}
              </Button>
              <Link to="/crop-analysis" className="block">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Camera className="w-4 h-4" />}
                  className="w-full justify-start text-xs"
                >
                  {ui.analyzeCropBtn}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal: Add Soil Reading */}
      {showSoilModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl space-y-4">
            <h3 className="text-base font-bold text-krishi-text">{ui.addSoilReadingBtn}</h3>
            <p className="text-xs text-krishi-text-secondary">Enter only the metrics you know. Unknown fields will remain unrecorded.</p>
            <form onSubmit={handleAddSoil} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={newMoisture}
                    onChange={(e) => setNewMoisture(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-krishi-green"
                    placeholder="e.g. 68.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">pH</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={newPh}
                    onChange={(e) => setNewPh(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-krishi-green"
                    placeholder="e.g. 7.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Nitrogen</label>
                  <input
                    type="number"
                    value={newNitrogen}
                    onChange={(e) => setNewNitrogen(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-2 py-2 border rounded-lg outline-none"
                    placeholder="mg/kg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phosphorus</label>
                  <input
                    type="number"
                    value={newPhosphorus}
                    onChange={(e) => setNewPhosphorus(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-2 py-2 border rounded-lg outline-none"
                    placeholder="mg/kg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Potassium</label>
                  <input
                    type="number"
                    value={newPotassium}
                    onChange={(e) => setNewPotassium(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-2 py-2 border rounded-lg outline-none"
                    placeholder="mg/kg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowSoilModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Reading
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Record Irrigation */}
      {showIrrigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl space-y-4">
            <h3 className="text-base font-bold text-krishi-text">{ui.recordIrrigBtn}</h3>
            <form onSubmit={handleAddIrrigation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Amount (mm)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-krishi-green"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Irrigation Method</label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white outline-none"
                >
                  <option value="Drip">Drip</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Flood">Flood</option>
                  <option value="Manual">Manual</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowIrrigModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Record
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Google Maps Live Location */}
      {showLocationModal && (
        <GoogleMapsLocationPicker
          isModal={true}
          initialLat={selectedFarm?.latitude}
          initialLon={selectedFarm?.longitude}
          initialLocationName={selectedFarm?.location}
          title={language === 'gu' ? 'ગુગલ મેપ્સ દ્વારા લાઈવ લોકેશન' : 'Live Farm Location (Google Maps)'}
          subtitle={
            language === 'gu'
              ? 'તમારા ખેતરના અક્ષાંશ-રેખાંશ સેટેલાઇટ મેપ અને જીપીએસ દ્વારા મેળવો જેથી ચોક્કસ હવામાન અને જમીન સલાહ મળે.'
              : 'Acquire high-precision physical GPS coordinates and preview your agricultural plot on Google Maps satellite imagery.'
          }
          onSelectLocation={handleSaveFarmLocation}
          onCancel={() => setShowLocationModal(false)}
        />
      )}
    </div>
  );
};
