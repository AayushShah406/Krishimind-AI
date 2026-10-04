import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Layers } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { GoogleMapsLocationPicker, LocationResult } from '../../components/common/GoogleMapsLocationPicker';
import { api } from '../../services/api';
import { useFarm } from '../../context/FarmContext';
import { useLanguage } from '../../context/LanguageContext';

export const CreateEditFieldPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { farms, selectedFarm, refreshFarms } = useFarm();
  const { language } = useLanguage();

  const labels = {
    en: {
      createTitle: 'Create Field / Plot',
      editTitle: 'Edit Field / Plot',
      subtitle: 'Add zone boundaries, acreage, and agronomic properties under your farm.',
      parentFarm: 'Associated Farm',
      fieldName: 'Field / Plot Name',
      fieldNamePlaceholder: 'e.g. North Plot #1, Borewell Zone',
      area: 'Plot Area',
      soilType: 'Soil Type',
      location: 'Plot Location / Section (Optional)',
      locationPlaceholder: 'Inherits farm location if empty',
      lat: 'Field Latitude (°N)',
      lon: 'Field Longitude (°E)',
      desc: 'Description / Notes',
      descPlaceholder: 'Drainage conditions, slope, shade, or irrigation line details...',
      cancel: 'Cancel',
      save: 'Save Field',
      saving: 'Saving...'
    },
    hi: {
      createTitle: 'नया खेत / प्लॉट जोड़ें',
      editTitle: 'प्लॉट संपादित करें',
      subtitle: 'फार्म के अंतर्गत खेत की सीमा, क्षेत्रफल व मिट्टी का प्रकार दर्ज करें।',
      parentFarm: 'संबंधित फार्म',
      fieldName: 'खेत / प्लॉट का नाम',
      fieldNamePlaceholder: 'उदा. उत्तर का खेत, ट्यूबवेल वाला हिस्सा',
      area: 'क्षेत्रफल (एकड़)',
      soilType: 'मिट्टी का प्रकार',
      location: 'प्लॉट का स्थान (वैकल्पिक)',
      locationPlaceholder: 'खाली रहने पर फार्म का स्थान लिया जाएगा',
      lat: 'प्लॉट अक्षांश (Latitude)',
      lon: 'प्लॉट देशांतर (Longitude)',
      desc: 'विवरण / टिप्पणियाँ',
      descPlaceholder: 'जल निकासी, ढलान, या ड्रिप लाइन की स्थिति...',
      cancel: 'रद्द करें',
      save: 'प्लॉट सुरक्षित करें',
      saving: 'सुरक्षित हो रहा है...'
    },
    gu: {
      createTitle: 'નવો પ્લોટ / ક્યારી ઉમેરો',
      editTitle: 'પ્લોટની વિગતો સુધારો',
      subtitle: 'ખેતર હેઠળ પ્લોટનું ક્ષેત્રફળ, જમીનનો પ્રકાર અને વિગતો દાખલ કરો.',
      parentFarm: 'સંબંધિત ફાર્મ',
      fieldName: 'પ્લોટ / ખેતરનું નામ',
      fieldNamePlaceholder: 'દા.ત., ઉત્તર પ્લોટ નં. ૧, બોરવેલ વાળો ભાગ',
      area: 'પ્લોટનું ક્ષેત્રફળ (એકર)',
      soilType: 'જમીનનો પ્રકાર',
      location: 'પ્લોટનું ચોક્કસ સ્થાન (વૈકલ્પિક)',
      locationPlaceholder: 'ખાલી રાખવાથી મુખ્ય ફાર્મનું સ્થાન લેવાશે',
      lat: 'પ્લોટ અક્ષાંશ (Latitude)',
      lon: 'પ્લોટ રેખાંશ (Longitude)',
      desc: 'વિગત / નોંધ',
      descPlaceholder: 'પાણી નિકાલની સ્થિતિ, ઢાળ અથવા ડ્રિપ લાઇન...',
      cancel: 'રદ કરો',
      save: 'પ્લોટ સેવ કરો',
      saving: 'સેવ થઈ રહ્યું છે...'
    }
  }[language] || {
    createTitle: 'Create Field / Plot',
    editTitle: 'Edit Field / Plot',
    subtitle: 'Add zone boundaries, acreage, and agronomic properties under your farm.',
    parentFarm: 'Associated Farm',
    fieldName: 'Field / Plot Name',
    fieldNamePlaceholder: 'e.g. North Plot #1, Borewell Zone',
    area: 'Plot Area',
    soilType: 'Soil Type',
    location: 'Plot Location / Section (Optional)',
    locationPlaceholder: 'Inherits farm location if empty',
    lat: 'Field Latitude (°N)',
    lon: 'Field Longitude (°E)',
    desc: 'Description / Notes',
    descPlaceholder: 'Drainage conditions, slope, shade, or irrigation line details...',
    cancel: 'Cancel',
    save: 'Save Field',
    saving: 'Saving...'
  };

  const initialFarmId = selectedFarm?.id || (farms.length > 0 ? farms[0].id : '');
  const [farmId, setFarmId] = useState(initialFarmId);
  const [name, setName] = useState('');
  const [area, setArea] = useState<number>(5);
  const [soilType, setSoilType] = useState('Sandy Loam');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const handleLocationSelect = (loc: LocationResult) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    if (!location) setLocation(loc.locationName);
    setShowMapModal(false);
  };

  useEffect(() => {
    if (isEdit && id) {
      api.getField(id).then((f) => {
        setFarmId(f.farm_id);
        setName(f.name);
        setArea(f.area);
        setSoilType(f.soil_type);
        setLocation(f.location || '');
        setLatitude(f.latitude);
        setLongitude(f.longitude);
        setDescription(f.description || '');
      });
    } else if (farms.length > 0 && !farmId) {
      setFarmId(farms[0].id);
      if (farms[0].latitude) setLatitude(farms[0].latitude);
      if (farms[0].longitude) setLongitude(farms[0].longitude);
      if (farms[0].soil_type) setSoilType(farms[0].soil_type);
    }
  }, [id, isEdit, farms]);

  const handleFarmChange = (selectedId: string) => {
    setFarmId(selectedId);
    const parent = farms.find(f => f.id === selectedId);
    if (parent) {
      if (parent.latitude && latitude === undefined) setLatitude(parent.latitude);
      if (parent.longitude && longitude === undefined) setLongitude(parent.longitude);
      if (parent.soil_type) setSoilType(parent.soil_type);
    }
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const payload = {
        farm_id: farmId,
        name: name.trim(),
        area: Number(area) || 1,
        area_unit: 'acres',
        soil_type: soilType || 'Sandy Loam',
        location: location.trim() || undefined,
        latitude: latitude !== undefined && !isNaN(Number(latitude)) ? Number(latitude) : undefined,
        longitude: longitude !== undefined && !isNaN(Number(longitude)) ? Number(longitude) : undefined,
        description: description.trim() || undefined,
      };

      if (isEdit && id) {
        await api.updateField(id, payload);
      } else {
        await api.createField(payload);
      }
      await refreshFarms();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Failed to save field:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to save field. Please check the fields and try again.';
      setSubmitError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-krishi-border/60">
        <Link to="/fields" className="p-2 rounded-lg hover:bg-surface-secondary text-krishi-text-secondary">
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

      <Card className="p-6 bg-white shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-krishi-text mb-1">{labels.parentFarm}</label>
            <select
              value={farmId}
              onChange={(e) => handleFarmChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white outline-none focus:border-krishi-green font-medium"
              required
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-krishi-text mb-1">{labels.fieldName}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
              placeholder={labels.fieldNamePlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-krishi-text mb-1">{labels.area}</label>
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
              <label className="block font-semibold text-krishi-text mb-1">{labels.soilType}</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white outline-none focus:border-krishi-green"
              >
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Clay Loam">Clay Loam</option>
                <option value="Alluvial Soil">Alluvial Soil</option>
                <option value="Black Soil (Regur)">Black Soil (Regur)</option>
                <option value="Red Soil">Red Soil</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-krishi-text mb-1">{labels.location}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
              placeholder={labels.locationPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-krishi-text">{labels.lat} & {labels.lon}</label>
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="text-xs text-krishi-green font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Pinpoint via Google Maps (GPS)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude ?? ''}
                  onChange={(e) => setLatitude(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green text-xs"
                  placeholder="e.g. 23.0225"
                />
              </div>

              <div>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude ?? ''}
                  onChange={(e) => setLongitude(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green text-xs"
                  placeholder="e.g. 72.5714"
                />
              </div>
            </div>

            {latitude && longitude && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-40 mt-1 shadow-inner bg-slate-100">
                <iframe
                  title="Field Google Map Preview"
                  src={`https://maps.google.com/maps?q=${latitude},${longitude}&t=h&z=17&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  className="w-full h-full"
                />
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded font-mono shadow">
                  {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-krishi-text mb-1">{labels.desc}</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
              placeholder={labels.descPlaceholder}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-krishi-border/60">
            <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
              {labels.cancel}
            </Button>
            <Button type="submit" variant="primary" isLoading={loading} icon={<Save className="w-4 h-4" />}>
              {loading ? labels.saving : labels.save}
            </Button>
          </div>
        </form>
      </Card>

      {/* Google Maps Live Location Modal */}
      {showMapModal && (
        <GoogleMapsLocationPicker
          isModal={true}
          initialLat={latitude}
          initialLon={longitude}
          initialLocationName={location}
          title="Pinpoint Field on Google Maps"
          subtitle="Acquire physical GPS coordinates and preview your agricultural plot on Google Maps satellite imagery."
          onSelectLocation={handleLocationSelect}
          onCancel={() => setShowMapModal(false)}
        />
      )}
    </div>
  );
};
