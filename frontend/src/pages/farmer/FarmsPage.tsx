import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, Layers, Sprout, ArrowRight, Trash2, Edit2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { api, Farm } from '../../services/api';
import { useFarm } from '../../context/FarmContext';

export const FarmsPage: React.FC = () => {
  const { farms, refreshFarms, setSelectedFarmId } = useFarm();
  const navigate = useNavigate();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove farm "${name}"?`)) {
      await api.deleteFarm(id);
      refreshFarms();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text">My Farms</h1>
          <p className="text-xs text-krishi-text-secondary">
            Manage your land holdings, acreage, and active agricultural zones.
          </p>
        </div>

        <Link to="/farms/create">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Create New Farm
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((f) => (
          <Card key={f.id} hoverable className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-krishi-green/10 text-krishi-green">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-krishi-text">{f.name}</h3>
                    <p className="text-xs text-krishi-text-secondary">{f.location}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-surface-secondary/70 p-3 rounded-lg border border-krishi-border/50">
                <div>
                  <span className="text-krishi-muted block">Area</span>
                  <span className="font-bold text-krishi-text">{f.area} {f.unit}</span>
                </div>
                <div>
                  <span className="text-krishi-muted block">Soil Type</span>
                  <span className="font-bold text-krishi-text">{f.soil_type}</span>
                </div>
                <div>
                  <span className="text-krishi-muted block">Fields Count</span>
                  <span className="font-bold text-krishi-text">{f.field_count ?? 2} plots</span>
                </div>
                <div>
                  <span className="text-krishi-muted block">Active Crops</span>
                  <span className="font-bold text-krishi-green-dark">
                    {f.crop_names?.join(', ') || 'Wheat, Cotton'}
                  </span>
                </div>
              </div>

              {f.latest_recommendation && (
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-[11px] text-emerald-900 leading-snug">
                  <strong>Latest AI: </strong>{f.latest_recommendation}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-krishi-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/farms/${f.id}/edit`)}
                  className="p-1.5 rounded hover:bg-surface-secondary text-krishi-text-secondary"
                  title="Edit Farm"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(f.id, f.name)}
                  className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                  title="Delete Farm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedFarmId(f.id);
                  navigate(`/farms/${f.id}`);
                }}
                className="flex items-center gap-1 text-xs font-bold text-krishi-green hover:underline"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const FarmDetailsPage: React.FC = () => {
  const { selectedFarm, fields } = useFarm();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text">{selectedFarm?.name || 'Farm Details'}</h1>
          <p className="text-xs text-krishi-text-secondary">{selectedFarm?.location}</p>
        </div>
        <Link to="/fields/create">
          <Button size="sm" variant="primary" icon={<Plus className="w-4 h-4" />}>
            Add Field Plot
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-krishi-muted">Total Acreage</p>
          <p className="text-xl font-bold text-krishi-text mt-1">{selectedFarm?.area || 25} {selectedFarm?.unit || 'acres'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-krishi-muted">Active Field Plots</p>
          <p className="text-xl font-bold text-krishi-text mt-1">{fields.length} Fields</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-krishi-muted">Primary Soil Composition</p>
          <p className="text-xl font-bold text-krishi-earth mt-1">{selectedFarm?.soil_type || 'Sandy Loam'}</p>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-bold text-krishi-text mb-3">Field Plots in this Farm</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <Card key={f.id} className="p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-krishi-text">{f.name}</h4>
                <p className="text-xs text-krishi-text-secondary mt-0.5">
                  {f.area} acres • Soil: {f.soil_type}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate(`/fields/${f.id}`)}>
                Manage Field
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
