import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sprout } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { api } from '../../services/api';
import { useFarm } from '../../context/FarmContext';
import { useLanguage } from '../../context/LanguageContext';

export const CreateEditCropPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { fields, selectedField, refreshFarms } = useFarm();
  const { language } = useLanguage();

  const labels = {
    en: {
      createTitle: 'Add Crop to Field',
      editTitle: 'Edit Crop Information',
      subtitle: 'Associate agricultural crop, variety, and growth stage with your field plot.',
      fieldLabel: 'Select Field / Plot',
      cropTypeLabel: 'Crop Type',
      selectCropPlaceholder: '-- Select Crop --',
      varietyLabel: 'Crop Variety',
      varietyPlaceholder: 'e.g. GW-496, Sharbati, Bt Cotton, GG-20',
      sowingDateLabel: 'Planting / Sowing Date',
      growthStageLabel: 'Growth Stage',
      cancel: 'Cancel',
      save: 'Save Crop',
      saving: 'Saving...'
    },
    hi: {
      createTitle: 'खेत में फसल जोड़ें',
      editTitle: 'फसल की जानकारी संपादित करें',
      subtitle: 'खेत/प्लॉट के साथ फसल, किस्म तथा वर्तमान विकास अवस्था जोड़ें।',
      fieldLabel: 'खेत / प्लॉट चुनें',
      cropTypeLabel: 'फसल का प्रकार',
      selectCropPlaceholder: '-- फसल चुनें --',
      varietyLabel: 'फसल की किस्म (वैरायटी)',
      varietyPlaceholder: 'उदा. GW-496, शरबती, बीटी कॉटन, GG-20',
      sowingDateLabel: 'बुवाई की तारीख',
      growthStageLabel: 'विकास की अवस्था (स्टेज)',
      cancel: 'रद्द करें',
      save: 'फसल सुरक्षित करें',
      saving: 'सुरक्षित हो रहा है...'
    },
    gu: {
      createTitle: 'પ્લોટમાં પાકની વિગત ઉમેરો',
      editTitle: 'પાકની વિગત સુધારો',
      subtitle: 'પ્લોટ સાથે પાક, જાત અને વર્તમાન વૃદ્ધિ તબક્કો જોડો.',
      fieldLabel: 'પ્લોટ પસંદ કરો',
      cropTypeLabel: 'પાકનો પ્રકાર',
      selectCropPlaceholder: '-- પાક પસંદ કરો --',
      varietyLabel: 'પાકની જાત / વેરાયટી',
      varietyPlaceholder: 'દા.ત., જીડબલ્યુ-૪૯૬, લોક-૧, જી.કોટ-૨૦, જીજી-૨૦',
      sowingDateLabel: 'વાવણીની તારીખ',
      growthStageLabel: 'વિકાસનો તબક્કો',
      cancel: 'રદ કરો',
      save: 'પાક સેવ કરો',
      saving: 'સેવ થઈ રહ્યું છે...'
    }
  }[language] || {
    createTitle: 'Add Crop to Field',
    editTitle: 'Edit Crop Information',
    subtitle: 'Associate agricultural crop, variety, and growth stage with your field plot.',
    fieldLabel: 'Select Field / Plot',
    cropTypeLabel: 'Crop Type',
    selectCropPlaceholder: '-- Select Crop --',
    varietyLabel: 'Crop Variety',
    varietyPlaceholder: 'e.g. GW-496, Sharbati, Bt Cotton, GG-20',
    sowingDateLabel: 'Planting / Sowing Date',
    growthStageLabel: 'Growth Stage',
    cancel: 'Cancel',
    save: 'Save Crop',
    saving: 'Saving...'
  };

  const initialFieldId = selectedField?.id || (fields.length > 0 ? fields[0].id : '');
  const [fieldId, setFieldId] = useState(initialFieldId);
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [growthStage, setGrowthStage] = useState('Germination');
  const [irrigationMethod, setIrrigationMethod] = useState('Drip');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      api.getCrop(id).then((c) => {
        setFieldId(c.field_id);
        setName(c.name);
        setVariety(c.variety);
        setPlantingDate(c.planting_date.slice(0, 10));
        if (c.expected_harvest_date) setExpectedHarvestDate(c.expected_harvest_date.slice(0, 10));
        setGrowthStage(c.growth_stage);
        if (c.irrigation_method) setIrrigationMethod(c.irrigation_method);
        if (c.notes) setNotes(c.notes);
      });
    } else if (fields.length > 0 && !fieldId) {
      setFieldId(fields[0].id);
    }
  }, [id, isEdit, fields]);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId || !name) return;
    setLoading(true);
    setSubmitError(null);
    try {
      if (isEdit && id) {
        await api.updateCrop(id, {
          name: name.trim(),
          variety: variety.trim(),
          planting_date: plantingDate ? new Date(plantingDate).toISOString() : undefined,
          expected_harvest_date: expectedHarvestDate ? new Date(expectedHarvestDate).toISOString() : undefined,
          growth_stage: growthStage,
          irrigation_method: irrigationMethod,
          notes: notes?.trim() || undefined,
        });
      } else {
        await api.createCrop({
          field_id: fieldId,
          name: name.trim(),
          variety: variety.trim(),
          planting_date: new Date(plantingDate).toISOString(),
          expected_harvest_date: expectedHarvestDate ? new Date(expectedHarvestDate).toISOString() : undefined,
          growth_stage: growthStage,
          irrigation_method: irrigationMethod,
          notes: notes?.trim() || undefined,
        });
      }
      await refreshFarms();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Failed to save crop:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to save crop. Please check the fields and try again.';
      setSubmitError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-krishi-border/60">
        <Link to="/crops" className="p-2 rounded-lg hover:bg-surface-secondary text-krishi-text-secondary">
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
            <label className="block font-semibold text-krishi-text mb-1">{labels.fieldLabel}</label>
            <select
              value={fieldId}
              disabled={isEdit}
              onChange={(e) => setFieldId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white outline-none focus:border-krishi-green font-medium"
              required
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.area} acres)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-krishi-text mb-1">{labels.cropTypeLabel}</label>
              <select
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white outline-none focus:border-krishi-green"
              >
                <option value="">{labels.selectCropPlaceholder}</option>
                <option value="Wheat">Wheat (ઘઉં / गेहूं)</option>
                <option value="Rice">Rice (ડાંગર / धान)</option>
                <option value="Cotton">Cotton (કપાસ / कपास)</option>
                <option value="Groundnut">Groundnut (મગફળી / मूंगफली)</option>
                <option value="Tomato">Tomato (ટામેટા / टमाटर)</option>
                <option value="Mustard">Mustard (રાયડો / सरसों)</option>
                <option value="Sugarcane">Sugarcane (શેરડી / गन्ना)</option>
                <option value="Maize">Maize (મકાઈ / मक्का)</option>
                <option value="Potato">Potato (બટાકા / आलू)</option>
                <option value="Chickpea">Chickpea (ચણા / चना)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-krishi-text mb-1">{labels.varietyLabel}</label>
              <input
                type="text"
                required
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
                placeholder={labels.varietyPlaceholder}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-krishi-text mb-1">{labels.sowingDateLabel}</label>
              <input
                type="date"
                required
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
              />
            </div>

            <div>
              <label className="block font-semibold text-krishi-text mb-1">Expected Harvest Date (Optional)</label>
              <input
                type="date"
                value={expectedHarvestDate}
                onChange={(e) => setExpectedHarvestDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-krishi-text mb-1">{labels.growthStageLabel}</label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white outline-none focus:border-krishi-green"
              >
                <option value="Germination">Germination (અંકુરણ / अंकुरण)</option>
                <option value="Tillering">Tillering (ફૂટ / कल्ले निकलना)</option>
                <option value="Vegetative">Vegetative (વાનસ્પતિક વૃદ્ધિ / वानस्पतिक वृद्धि)</option>
                <option value="Flowering">Flowering (ફૂલ આવવા / फूल आना)</option>
                <option value="Grain Filling">Grain Filling (દાણા ભરાવા / दाना भराव)</option>
                <option value="Maturity">Maturity (પરિપક્વતા / परिपक्वता)</option>
                <option value="Harvest">Harvest Ready (કાપણી લાયક / कटाई योग्य)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-krishi-text mb-1">Irrigation Method</label>
              <select
                value={irrigationMethod}
                onChange={(e) => setIrrigationMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white outline-none focus:border-krishi-green"
              >
                <option value="Drip">Drip Irrigation (ટપક પિયત)</option>
                <option value="Sprinkler">Sprinkler (ફુવારા પિયત)</option>
                <option value="Flood">Flood Irrigation (ધોરિયા પિયત)</option>
                <option value="Furrow">Furrow Irrigation (ચર પિયત)</option>
                <option value="Rainfed">Rainfed / Dryland (વરસાદ આધારિત)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-krishi-text mb-1">Crop Notes / Cultural Practices (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bio-fertilizer applied at sowing, intercropped with pulses..."
              className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none focus:border-krishi-green"
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
    </div>
  );
};
