import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Navigation, CheckCircle2, Edit3, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { GoogleMapsLocationPicker, LocationResult } from '../../components/common/GoogleMapsLocationPicker';
import { api } from '../../services/api';
import { useFarm } from '../../context/FarmContext';
import { useLanguage } from '../../context/LanguageContext';

export const CreateEditFarmPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { refreshFarms } = useFarm();
  const { language } = useLanguage();

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [area, setArea] = useState<number>(5);
  const [unit, setUnit] = useState('acres');
  const [soilType, setSoilType] = useState('Sandy Loam');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Location Detection State
  const [showMapModal, setShowMapModal] = useState(false);
  const [locationMode, setLocationMode] = useState<'prompt' | 'detecting' | 'detected_pending' | 'manual'>('prompt');
  const [detectedLocName, setDetectedLocName] = useState('');
  const [detectedLat, setDetectedLat] = useState<number | null>(null);
  const [detectedLon, setDetectedLon] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Localization strings
  const labels = {
    en: {
      createTitle: 'Create New Farm',
      editTitle: 'Edit Farm',
      subtitle: 'Provide land location, acreage, soil classification, and regional coordinates.',
      locationHeader: 'Step 1: Farm Location & Geolocation',
      locationDesc: 'Accurate location ensures high-precision weather forecasts, rainfall probability, and crop suitability.',
      useMyLocation: 'Use My Location',
      enterManually: 'Enter Location Manually',
      detecting: 'Accessing GPS sensor...',
      detectedNotice: 'Detected Device Location:',
      detectedPrompt: 'Device location may differ from actual farm location. Please confirm:',
      useThisLoc: 'Use This Location',
      changeLoc: 'Change Location',
      stateLabel: 'State',
      districtLabel: 'District',
      cityLabel: 'City / Village / Taluka',
      addrLabel: 'Complete Location / Landmark',
      latLabel: 'Latitude (°N)',
      lonLabel: 'Longitude (°E)',
      farmDetailsHeader: 'Step 2: Farm Characteristics',
      farmNameLabel: 'Farm Name',
      farmNamePlaceholder: 'e.g., Sunrise Organic Farm',
      areaLabel: 'Total Acreage',
      unitLabel: 'Unit',
      acres: 'Acres',
      hectares: 'Hectares',
      bigha: 'Bigha',
      soilTypeLabel: 'Primary Soil Type',
      descLabel: 'Description (Optional)',
      descPlaceholder: 'Water sources, slope, boundary details, or field characteristics...',
      cancel: 'Cancel',
      save: 'Save Farm',
      saving: 'Saving...'
    },
    hi: {
      createTitle: 'नया खेत / फार्म जोड़ें',
      editTitle: 'फार्म संपादित करें',
      subtitle: 'स्थान, कुल रकबा, मिट्टी का प्रकार और भौगोलिक निर्देशांक दर्ज करें।',
      locationHeader: 'चरण 1: फार्म का स्थान एवं भू-स्थिति',
      locationDesc: 'सटीक स्थान से स्थानीय मौसम, वर्षा संभावना एवं उपयुक्त कृषि सलाह प्राप्त होती है।',
      useMyLocation: 'मेरा स्थान उपयोग करें',
      enterManually: 'मैन्युअल रूप से स्थान दर्ज करें',
      detecting: 'जीपीएस स्थान प्राप्त किया जा रहा है...',
      detectedNotice: 'पहचाना गया उपकरण स्थान:',
      detectedPrompt: 'डिवाइस का स्थान खेत के वास्तविक स्थान से भिन्न हो सकता है। कृपया पुष्टि करें:',
      useThisLoc: 'यह स्थान उपयोग करें',
      changeLoc: 'स्थान बदलें',
      stateLabel: 'राज्य',
      districtLabel: 'जिला',
      cityLabel: 'तहसील / गाँव / कस्बा',
      addrLabel: 'पूर्ण पता / स्थान',
      latLabel: 'अक्षांश (Latitude)',
      lonLabel: 'देशांतर (Longitude)',
      farmDetailsHeader: 'चरण 2: फार्म का विवरण',
      farmNameLabel: 'फार्म का नाम',
      farmNamePlaceholder: 'उदा. रामेश्वरम फार्म',
      areaLabel: 'कुल क्षेत्रफल',
      unitLabel: 'इकाई',
      acres: 'एकड़',
      hectares: 'हेक्टेयर',
      bigha: 'बीघा',
      soilTypeLabel: 'मुख्य मिट्टी का प्रकार',
      descLabel: 'विवरण (वैकल्पिक)',
      descPlaceholder: 'पानी का स्रोत, नलकूप, जमीन की ढलान आदि...',
      cancel: 'रद्द करें',
      save: 'फार्म सुरक्षित करें',
      saving: 'सुरक्षित हो रहा है...'
    },
    gu: {
      createTitle: 'નવું ફાર્મ / ખેતર ઉમેરો',
      editTitle: 'ખેતરની વિગતો સુધારો',
      subtitle: 'જમીનનું સ્થાન, વિસ્તાર, જમીનનો પ્રકાર અને ભૌગોલિક વિગતો દાખલ કરો.',
      locationHeader: 'પગલું ૧: ફાર્મનું સ્થાન અને જીપીએસ',
      locationDesc: 'ચોક્કસ સ્થાનથી ખેતર-આધારિત જીવંત હવામાન, વરસાદની આગાહી અને સચોટ સલાહ મળે છે.',
      useMyLocation: 'મારું જીવંત લોકેશન વાપરો',
      enterManually: 'હાથેથી સ્થાન દાખલ કરો',
      detecting: 'જીપીએસ સ્થાન મેળવી રહ્યું છે...',
      detectedNotice: 'શોધાયેલ ડિવાઇસ સ્થાન:',
      detectedPrompt: 'તમારા ફોનનું સ્થાન ખેતરથી અલગ હોઈ શકે છે. કૃપા કરીને ચકાસો:',
      useThisLoc: 'આ સ્થાન વાપરો',
      changeLoc: 'સ્થાન બદલો',
      stateLabel: 'રાજ્ય',
      districtLabel: 'જિલ્લો',
      cityLabel: 'ગામ / તાલુકો',
      addrLabel: 'સંપૂર્ણ સરનામું / વિસ્તાર',
      latLabel: 'અક્ષાંશ (Latitude)',
      lonLabel: 'રેખાંશ (Longitude)',
      farmDetailsHeader: 'પગલું ૨: ખેતરની વિગતો',
      farmNameLabel: 'ખેતરનું નામ',
      farmNamePlaceholder: 'દા.ત., પટેલ વાડી / ફાર્મ',
      areaLabel: 'કુલ જમીન ક્ષેત્રફળ',
      unitLabel: 'એકમ',
      acres: 'એકર',
      hectares: 'હેક્ટર',
      bigha: 'વીઘા',
      soilTypeLabel: 'જમીનનો પ્રકાર',
      descLabel: 'વિગત (વૈકલ્પિક)',
      descPlaceholder: 'પાણીની સગવડ, બોરવેલ, કેનાલ અથવા જમીનની વિગત...',
      cancel: 'રદ કરો',
      save: 'ફાર્મ સેવ કરો',
      saving: 'સેવ થઈ રહ્યું છે...'
    }
  }[language] || labels.en;

  useEffect(() => {
    if (isEdit && id) {
      api.getFarm(id).then((f) => {
        setName(f.name);
        setLocation(f.location);
        setArea(f.area);
        setUnit(f.unit);
        setSoilType(f.soil_type);
        setLatitude(f.latitude);
        setLongitude(f.longitude);
        setState(f.state || '');
        setDistrict(f.district || '');
        setCity(f.city || '');
        setDescription(f.description || '');
        setLocationMode('manual');
      });
    }
  }, [id, isEdit]);

  // Handle Browser Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      setLocationMode('manual');
      return;
    }

    setGeoError(null);
    setLocationMode('detecting');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        setDetectedLat(lat);
        setDetectedLon(lon);

        // Reverse geocoding via Open-Meteo or Nominatim
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const town = addr.village || addr.town || addr.city || addr.suburb || 'Local Area';
            const dist = addr.state_district || addr.county || '';
            const st = addr.state || '';
            const full = [town, dist, st].filter(Boolean).join(', ');
            setDetectedLocName(full || `${lat}, ${lon}`);
            setState(st);
            setDistrict(dist);
            setCity(town);
          } else {
            setDetectedLocName(`${lat}° N, ${lon}° E`);
          }
        } catch {
          setDetectedLocName(`${lat}° N, ${lon}° E`);
        }

        setLocationMode('detected_pending');
      },
      (err) => {
        console.warn('Geolocation failed', err);
        setGeoError('Could not detect location. Please enter your location manually.');
        setLocationMode('manual');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleConfirmDetectedLocation = () => {
    setLocation(detectedLocName);
    setLatitude(detectedLat || undefined);
    setLongitude(detectedLon || undefined);
    setLocationMode('manual');
  };

  const handleLocationSelect = (loc: LocationResult) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setLocation(loc.locationName);
    if (loc.state) setState(loc.state);
    if (loc.district) setDistrict(loc.district);
    if (loc.city) setCity(loc.city);
    setShowMapModal(false);
    setLocationMode('manual');
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    try {
      const finalLoc = location.trim() || `${city || ''}, ${district || ''}, ${state || ''}`.replace(/^, |, $/g, '').trim() || name.trim();
      const payload = {
        name: name.trim(),
        location: finalLoc,
        area: Number(area) || 1,
        unit: unit || 'acres',
        soil_type: soilType || 'Sandy Loam',
        latitude: latitude !== undefined && !isNaN(Number(latitude)) ? Number(latitude) : undefined,
        longitude: longitude !== undefined && !isNaN(Number(longitude)) ? Number(longitude) : undefined,
        state: state.trim() || undefined,
        district: district.trim() || undefined,
        city: city.trim() || undefined,
        description: description.trim() || undefined,
      };

      if (isEdit && id) {
        await api.updateFarm(id, payload);
      } else {
        await api.createFarm(payload);
      }
      await refreshFarms();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Failed to save farm:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to save farm. Please check your network and fields, and try again.';
      setSubmitError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-krishi-border/60">
        <Link to="/farms" className="p-2 rounded-lg hover:bg-surface-secondary text-krishi-text-secondary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text">
            {isEdit ? labels.editTitle : labels.createTitle}
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            {labels.subtitle}
          </p>
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Location-First Section */}
        <Card className="p-6 bg-white shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-krishi-border/40">
            <MapPin className="w-5 h-5 text-krishi-green" />
            <div>
              <h2 className="text-sm font-bold text-krishi-text">{labels.locationHeader}</h2>
              <p className="text-xs text-krishi-text-secondary">{labels.locationDesc}</p>
            </div>
          </div>

          {/* Location Mode with Google Maps */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Button
                type="button"
                variant="primary"
                icon={<Navigation className="w-4 h-4 text-white" />}
                onClick={() => setShowMapModal(true)}
                className="justify-center shadow-sm"
              >
                Get Live Location via Google Maps
              </Button>
              <Button
                type="button"
                variant="secondary"
                icon={<Edit3 className="w-4 h-4" />}
                onClick={() => setLocationMode('manual')}
                className="justify-center"
              >
                {locationMode === 'manual' ? 'Manual Fields Active' : labels.enterManually}
              </Button>
            </div>

            {latitude && longitude && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-52 mt-2 shadow-inner bg-slate-100">
                <iframe
                  title="Google Maps Satellite Preview"
                  src={`https://maps.google.com/maps?q=${latitude},${longitude}&t=h&z=16&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  className="w-full h-full"
                />
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur text-white text-[11px] px-2.5 py-1 rounded-md font-mono flex items-center gap-1.5 shadow">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="text-[11px] font-semibold bg-white/90 backdrop-blur text-slate-800 hover:bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm transition-all"
                  >
                    Change Pin / Re-detect
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Manual Location Form Fields */}
          {locationMode === 'manual' && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-krishi-text mb-1">{labels.stateLabel}</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                    placeholder="Gujarat / Maharashtra..."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-krishi-text mb-1">{labels.districtLabel}</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                    placeholder="Ahmedabad / Nashik..."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-krishi-text mb-1">{labels.cityLabel}</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                    placeholder="Sanand / Dindori..."
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-semibold text-krishi-text mb-1">{labels.addrLabel}</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                  placeholder="e.g. Survey No. 42, Sanand Road, Ahmedabad"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-krishi-text mb-1">{labels.latLabel}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude ?? ''}
                    onChange={(e) => setLatitude(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                    placeholder="23.0225"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-krishi-text mb-1">{labels.lonLabel}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude ?? ''}
                    onChange={(e) => setLongitude(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                    placeholder="72.5714"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="text-xs text-krishi-green font-semibold hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" /> Re-detect live location with Google Maps
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Step 2: Farm Characteristics */}
        <Card className="p-6 bg-white shadow-card space-y-4">
          <h2 className="text-sm font-bold text-krishi-text pb-2 border-b border-krishi-border/40">
            {labels.farmDetailsHeader}
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-krishi-text mb-1">{labels.farmNameLabel}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                placeholder={labels.farmNamePlaceholder}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-krishi-text mb-1">{labels.areaLabel}</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                />
              </div>

              <div>
                <label className="block font-semibold text-krishi-text mb-1">{labels.unitLabel}</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white outline-none"
                >
                  <option value="acres">{labels.acres}</option>
                  <option value="hectares">{labels.hectares}</option>
                  <option value="bigha">{labels.bigha}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-krishi-text mb-1">{labels.soilTypeLabel}</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white outline-none"
              >
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Clay Loam">Clay Loam</option>
                <option value="Alluvial Soil">Alluvial Soil</option>
                <option value="Black Soil (Regur)">Black Soil (Regur)</option>
                <option value="Red Soil">Red Soil</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-krishi-text mb-1">{labels.descLabel}</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                placeholder={labels.descPlaceholder}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-krishi-border/60">
            <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
              {labels.cancel}
            </Button>
            <Button type="submit" variant="primary" isLoading={loading} icon={<Save className="w-4 h-4" />}>
              {loading ? labels.saving : labels.save}
            </Button>
          </div>
        </Card>
      </form>

      {/* Google Maps Live Location Modal */}
      {showMapModal && (
        <GoogleMapsLocationPicker
          isModal={true}
          initialLat={latitude}
          initialLon={longitude}
          initialLocationName={location}
          title="Google Maps Live Location"
          subtitle="Acquire physical GPS coordinates and preview your agricultural plot on Google Maps satellite imagery."
          onSelectLocation={handleLocationSelect}
          onCancel={() => setShowMapModal(false)}
        />
      )}
    </div>
  );
};
