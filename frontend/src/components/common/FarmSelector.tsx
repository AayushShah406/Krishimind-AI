import React from 'react';
import { Layers, MapPin } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export const FarmSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { farms, selectedFarm, setSelectedFarmId } = useFarm();

  if (farms.length === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 bg-surface border border-krishi-border rounded-lg px-2.5 py-1.5 shadow-xs text-xs font-medium ${className}`}>
      <MapPin className="w-3.5 h-3.5 text-krishi-earth shrink-0" />
      <select
        value={selectedFarm?.id || ''}
        onChange={(e) => setSelectedFarmId(e.target.value)}
        className="bg-transparent border-none outline-none cursor-pointer font-medium text-krishi-text pr-1"
        aria-label="Select Farm"
      >
        {farms.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name} ({f.area} {f.unit})
          </option>
        ))}
      </select>
    </div>
  );
};

export const FieldSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { fields, selectedField, setSelectedFieldId } = useFarm();

  if (fields.length === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 bg-surface border border-krishi-border rounded-lg px-2.5 py-1.5 shadow-xs text-xs font-medium ${className}`}>
      <Layers className="w-3.5 h-3.5 text-krishi-green shrink-0" />
      <select
        value={selectedField?.id || ''}
        onChange={(e) => setSelectedFieldId(e.target.value)}
        className="bg-transparent border-none outline-none cursor-pointer font-medium text-krishi-text pr-1"
        aria-label="Select Field"
      >
        {fields.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name} ({f.area} ac - {f.soil_type})
          </option>
        ))}
      </select>
    </div>
  );
};
