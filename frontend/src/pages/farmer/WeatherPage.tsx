import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  Compass,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Card } from '../../components/common/Card';
import { MetricCard } from '../../components/common/MetricCard';
import { FarmSelector, FieldSelector } from '../../components/common/FarmSelector';
import { useFarm } from '../../context/FarmContext';
import { api, WeatherData } from '../../services/api';

export const WeatherPage: React.FC = () => {
  const { selectedField, selectedCrop } = useFarm();
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (selectedField) {
      api.getWeather(selectedField.id).then(setWeather);
    }
  }, [selectedField]);

  const forecast7d = weather?.forecast_7d || [
    { date: 'Mon', max_temp: 32, min_temp: 24, rainfall_sum: 18, rain_probability: 82 },
    { date: 'Tue', max_temp: 30, min_temp: 23, rainfall_sum: 12, rain_probability: 65 },
    { date: 'Wed', max_temp: 31, min_temp: 24, rainfall_sum: 2, rain_probability: 30 },
    { date: 'Thu', max_temp: 33, min_temp: 25, rainfall_sum: 0, rain_probability: 15 },
    { date: 'Fri', max_temp: 34, min_temp: 25, rainfall_sum: 0, rain_probability: 10 },
    { date: 'Sat', max_temp: 33, min_temp: 24, rainfall_sum: 0, rain_probability: 20 },
    { date: 'Sun', max_temp: 32, min_temp: 24, rainfall_sum: 4, rain_probability: 40 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-krishi-accent" />
            Atmospheric Weather Telemetry & Hyperlocal Forecast
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            Live Open-Meteo environmental modeling for {selectedField?.name || 'Field A'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FarmSelector />
          <FieldSelector />
        </div>
      </div>

      {/* Atmospheric Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Ambient Temp"
          value={`${weather?.temperature ?? 31.2}°C`}
          subtitle="Warm afternoon"
          accentColor="gold"
          icon={<Thermometer className="w-5 h-5" />}
        />
        <MetricCard
          title="Relative Humidity"
          value={`${weather?.humidity ?? 72}%`}
          subtitle="High humidity"
          accentColor="blue"
          icon={<Droplets className="w-5 h-5" />}
        />
        <MetricCard
          title="Rain Probability"
          value={`${weather?.rain_probability ?? 82}%`}
          subtitle="Precipitation likely"
          accentColor="green"
          icon={<CloudRain className="w-5 h-5" />}
        />
        <MetricCard
          title="Recent Precipitation"
          value={`${weather?.rainfall ?? 2.5} mm`}
          subtitle="Past 24 hours"
          accentColor="blue"
          icon={<Droplets className="w-5 h-5" />}
        />
        <MetricCard
          title="Wind Velocity"
          value={`${weather?.wind_speed ?? 14.5}`}
          unit="km/h"
          subtitle="Gentle breeze"
          accentColor="earth"
          icon={<Wind className="w-5 h-5" />}
        />
      </div>

      {/* Agricultural Interpretation Alert */}
      <Card className="p-5 bg-emerald-50/70 border-emerald-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-krishi-green text-white shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-sm text-krishi-green-dark">Agricultural Impact & Phenology Advisory</h3>
            <p className="text-krishi-text-secondary leading-relaxed">
              {weather?.agricultural_interpretation || 'Rainfall expected tomorrow (82% probability) will provide 12-18mm precipitation, reducing immediate field irrigation requirements.'}
            </p>
            <p className="text-krishi-text text-[11px] font-semibold mt-1">
              Impact on Active Crop ({selectedCrop?.name || 'Wheat'} - {selectedCrop?.growth_stage || 'Flowering'}):
              High humidity may promote early fungal vectors. Withhold top irrigation to preserve pollen viability.
            </p>
          </div>
        </div>
      </Card>

      {/* Forecast Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 24-Hour Forecast */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-krishi-text mb-1">24-Hour Temperature & Rain Probability</h3>
          <p className="text-xs text-krishi-text-secondary mb-4">Hyperlocal hourly forecast</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weather?.forecast_24h || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E1" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#D9A441" fill="#D9A441" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="rain_probability" name="Rain Prob (%)" stroke="#16A878" fill="#16A878" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 7-Day Outlook */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-krishi-text mb-1">7-Day Rainfall Outlook (mm Expected)</h3>
          <p className="text-xs text-krishi-text-secondary mb-4">Cumulative natural precipitation estimation</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast7d}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E1" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="rainfall_sum" name="Rainfall (mm)" fill="#2F6B4F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
