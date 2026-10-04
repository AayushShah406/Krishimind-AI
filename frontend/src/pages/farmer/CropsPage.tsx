import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Plus, Filter, Calendar, Layers, ArrowRight, Trash2, Edit2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { api, Crop } from '../../services/api';
import { useFarm } from '../../context/FarmContext';

export const CropsPage: React.FC = () => {
  const { crops, refreshFarms, selectedField } = useFarm();
  const navigate = useNavigate();

  const [allCrops, setAllCrops] = useState<Crop[]>([]);
  const [filterCrop, setFilterCrop] = useState('ALL');
  const [filterStage, setFilterStage] = useState('ALL');

  useEffect(() => {
    api.getCrops().then(setAllCrops);
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove crop "${name}"?`)) {
      await api.deleteCrop(id);
      refreshFarms();
      setAllCrops((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const filtered = allCrops.filter((c) => {
    if (filterCrop !== 'ALL' && c.name.toLowerCase() !== filterCrop.toLowerCase()) return false;
    if (filterStage !== 'ALL' && c.growth_stage.toLowerCase() !== filterStage.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text">Crops & Phenology Catalog</h1>
          <p className="text-xs text-krishi-text-secondary">
            Track seed varieties, planting dates, and biological growth stages.
          </p>
        </div>

        <Link to="/crops/create">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Crop Cycle
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <Card className="p-3 bg-white flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-krishi-text-secondary font-semibold">
          <Filter className="w-4 h-4 text-krishi-green" />
          <span>Filters:</span>
        </div>

        <div>
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-krishi-border bg-surface-secondary outline-none font-medium"
          >
            <option value="ALL">All Crops</option>
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice</option>
            <option value="Cotton">Cotton</option>
            <option value="Groundnut">Groundnut</option>
            <option value="Tomato">Tomato</option>
          </select>
        </div>

        <div>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-krishi-border bg-surface-secondary outline-none font-medium"
          >
            <option value="ALL">All Growth Stages</option>
            <option value="Germination">Germination</option>
            <option value="Tillering">Tillering</option>
            <option value="Vegetative">Vegetative</option>
            <option value="Flowering">Flowering</option>
            <option value="Grain Filling">Grain Filling</option>
            <option value="Maturity">Maturity</option>
          </select>
        </div>
      </Card>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((crop) => (
          <Card key={crop.id} hoverable className="p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-krishi-green/10 text-krishi-green">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-krishi-text">{crop.name}</h3>
                    <p className="text-xs text-krishi-text-secondary">Variety: {crop.variety}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-krishi-green border border-emerald-200">
                  {crop.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-surface-secondary/70 p-3 rounded-lg border border-krishi-border/50">
                <div>
                  <span className="text-krishi-muted block">Growth Stage</span>
                  <span className="font-bold text-krishi-text">{crop.growth_stage}</span>
                </div>
                <div>
                  <span className="text-krishi-muted block">Field Plot</span>
                  <span className="font-bold text-krishi-text">{crop.field_name || 'Field A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-krishi-muted block">Sowing / Planting Date</span>
                  <span className="font-medium text-krishi-text">
                    {crop.planting_date?.slice(0, 10)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-krishi-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/crops/${crop.id}/edit`)}
                  className="p-1.5 rounded hover:bg-surface-secondary text-krishi-text-secondary"
                  title="Edit Crop"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(crop.id, crop.name)}
                  className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                  title="Delete Crop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => navigate(`/crops/${crop.id}`)}
                className="flex items-center gap-1 text-xs font-bold text-krishi-green hover:underline"
              >
                Crop Phenology <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const CropDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crop, setCrop] = useState<Crop | null>(null);

  useEffect(() => {
    if (id) {
      api.getCrop(id).then(setCrop);
    }
  }, [id]);

  const stages = [
    { name: 'Germination', days: '0-10 DAS', status: 'COMPLETED' },
    { name: 'Tillering', days: '20-30 DAS', status: 'COMPLETED' },
    { name: 'Vegetative & Jointing', days: '40-50 DAS', status: 'COMPLETED' },
    { name: 'Flowering & Booting', days: '60-75 DAS', status: 'ACTIVE' },
    { name: 'Grain Filling', days: '80-100 DAS', status: 'UPCOMING' },
    { name: 'Maturity & Harvest', days: '110-125 DAS', status: 'UPCOMING' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-2xl font-extrabold text-krishi-text">{crop?.name || 'Wheat'} ({crop?.variety || 'GW-322'})</h1>
          <p className="text-xs text-krishi-text-secondary">
            Planting Date: {crop?.planting_date?.slice(0, 10) || '2026-01-15'} • Current Stage: {crop?.growth_stage || 'Flowering'}
          </p>
        </div>
        <Link to="/ai-advisor">
          <Button size="sm" variant="primary">Consult AI for this Crop</Button>
        </Link>
      </div>

      {/* Phenology Stages Timeline */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-krishi-text mb-4">Biological Phenology Lifecycle</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {stages.map((st, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-xs ${
                st.status === 'ACTIVE'
                  ? 'bg-emerald-50 border-krishi-green text-krishi-green font-bold shadow-xs'
                  : st.status === 'COMPLETED'
                  ? 'bg-surface-secondary border-krishi-border text-krishi-text font-medium opacity-80'
                  : 'bg-stone-50 border-stone-200 text-krishi-muted'
              }`}
            >
              <span className="text-[10px] block opacity-75">{st.days}</span>
              <p className="mt-1 leading-snug">{st.name}</p>
              <span className="mt-2 text-[9px] uppercase tracking-wider block font-semibold">
                {st.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Agricultural Advice Card */}
      <Card className="p-6 bg-white space-y-3">
        <h3 className="text-base font-bold text-krishi-text">Critical Agronomic Management During Flowering</h3>
        <p className="text-xs text-krishi-text-secondary leading-relaxed">
          The flowering stage is the most moisture-critical window in the {crop?.name || 'Wheat'} cycle. Ensure root-zone moisture stays within 65-75%. Avoid water stress or sudden waterlogging. Monitor for aphids or yellow rust symptoms.
        </p>
      </Card>
    </div>
  );
};
