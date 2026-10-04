import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Plus, Droplets, Sprout, ArrowRight, Trash2, Edit2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useFarm } from '../../context/FarmContext';
import { api } from '../../services/api';

export const FieldsPage: React.FC = () => {
  const { fields, selectedFarm, refreshFarms, setSelectedFieldId } = useFarm();
  const navigate = useNavigate();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete field plot "${name}"?`)) {
      await api.deleteField(id);
      refreshFarms();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text">Field Plots</h1>
          <p className="text-xs text-krishi-text-secondary">
            Zoned plots with dedicated soil moisture probes and micro-climate tracking.
          </p>
        </div>

        <Link to="/fields/create">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Create Field Plot
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((f) => {
          const moisture = f.latest_soil?.moisture ?? 71;
          const crop = f.current_crop;

          return (
            <Card key={f.id} hoverable className="p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-krishi-blue/10 text-krishi-blue">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-krishi-text">{f.name}</h3>
                      <p className="text-xs text-krishi-text-secondary">{f.soil_type} • {f.area} acres</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-surface-secondary/70 p-3 rounded-lg border border-krishi-border/50">
                  <div>
                    <span className="text-krishi-muted block">Current Crop</span>
                    <span className="font-bold text-krishi-green-dark">{crop?.name || 'Wheat'}</span>
                  </div>
                  <div>
                    <span className="text-krishi-muted block">Growth Stage</span>
                    <span className="font-bold text-krishi-text">{crop?.growth_stage || 'Flowering'}</span>
                  </div>
                  <div>
                    <span className="text-krishi-muted block">Soil Moisture</span>
                    <span className="font-bold text-krishi-blue">{moisture}%</span>
                  </div>
                  <div>
                    <span className="text-krishi-muted block">Temperature</span>
                    <span className="font-bold text-krishi-text">{f.latest_weather?.temperature ?? 31.2}°C</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-krishi-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/fields/${f.id}/edit`)}
                    className="p-1.5 rounded hover:bg-surface-secondary text-krishi-text-secondary"
                    title="Edit Field"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id, f.name)}
                    className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                    title="Delete Field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedFieldId(f.id);
                    navigate(`/fields/${f.id}`);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-krishi-green hover:underline"
                >
                  Field Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
