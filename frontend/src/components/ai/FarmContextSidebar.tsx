import React from 'react';
import { Sprout, CloudRain, Droplets, Thermometer, Wind, Compass, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { useFarm } from '../../context/FarmContext';
import { useLanguage } from '../../context/LanguageContext';

export const FarmContextSidebar: React.FC<{ weatherData?: any; lastIrrigation?: any }> = ({ weatherData, lastIrrigation }) => {
  const { selectedFarm, selectedField, selectedCrop } = useFarm();
  const { language } = useLanguage();

  const soilMoisture = selectedField?.latest_soil?.moisture;
  const temp = weatherData?.temperature;
  const rainProb = weatherData?.rain_probability;
  const humidity = weatherData?.humidity;
  const wind = weatherData?.wind_speed;

  const notProvided = language === 'gu' ? 'ઉપલબ્ધ નથી' : language === 'hi' ? 'उपलब्ध नहीं' : 'Not provided';
  const noFarm = language === 'gu' ? 'ખેતર પસંદ કરેલ નથી' : language === 'hi' ? 'कोई खेत चयनित नहीं' : 'No farm selected';
  const noField = language === 'gu' ? 'પ્લોટ પસંદ કરેલ નથી' : language === 'hi' ? 'कोई प्लॉट चयनित नहीं' : 'No field selected';
  const noCrop = language === 'gu' ? 'પાક નોંધાયેલ નથી' : language === 'hi' ? 'कोई फसल दर्ज नहीं' : 'No active crop';

  return (
    <div className="space-y-4">
      {/* Farm & Field Selection Context */}
      <Card className="bg-surface border-krishi-border shadow-xs">
        <h3 className="text-sm font-bold text-krishi-text flex items-center gap-2 mb-3 pb-2 border-b border-krishi-border/60">
          <Compass className="w-4 h-4 text-krishi-green" />
          {language === 'gu' ? 'ખેતર વિગતો' : language === 'hi' ? 'खेत विवरण' : 'Live Field Context'}
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-krishi-border/40">
            <span className="text-krishi-text-secondary">{language === 'gu' ? 'ફાર્મ' : language === 'hi' ? 'फार्म' : 'Farm'}</span>
            <span className={`font-semibold ${selectedFarm ? 'text-krishi-text' : 'text-krishi-muted italic'}`}>
              {selectedFarm?.name || noFarm}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-krishi-border/40">
            <span className="text-krishi-text-secondary">{language === 'gu' ? 'પ્લોટ/ખેતર' : language === 'hi' ? 'प्लॉट' : 'Field'}</span>
            <span className={`font-semibold ${selectedField ? 'text-krishi-text' : 'text-krishi-muted italic'}`}>
              {selectedField?.name || noField}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-krishi-border/40">
            <span className="text-krishi-text-secondary">{language === 'gu' ? 'માટીનો પ્રકાર' : language === 'hi' ? 'मिट्टी का प्रकार' : 'Soil Type'}</span>
            <span className={`font-semibold ${selectedField?.soil_type ? 'text-krishi-text' : 'text-krishi-muted italic'}`}>
              {selectedField?.soil_type || notProvided}
            </span>
          </div>
        </div>
      </Card>

      {/* Active Crop Phenology */}
      <Card className="bg-surface border-krishi-border shadow-xs">
        <h4 className="text-xs font-bold text-krishi-text flex items-center gap-2 mb-3">
          <Sprout className="w-4 h-4 text-krishi-green" />
          {language === 'gu' ? 'સક્રિય પાક સ્થિતિ' : language === 'hi' ? 'सक्रिय फसल स्थिति' : 'Active Crop Phenology'}
        </h4>
        {selectedCrop ? (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-krishi-text-secondary">{language === 'gu' ? 'પાક' : language === 'hi' ? 'फसल' : 'Crop'}</span>
              <span className="font-bold text-krishi-green-dark">
                {selectedCrop.name} {selectedCrop.variety ? `(${selectedCrop.variety})` : ''}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-krishi-text-secondary">{language === 'gu' ? 'વિકાસ તબક્કો' : language === 'hi' ? 'विकास अवस्था' : 'Growth Stage'}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                {selectedCrop.growth_stage}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-krishi-text-secondary">{language === 'gu' ? 'વાવણી તારીખ' : language === 'hi' ? 'बुवाई तिथि' : 'Planting Date'}</span>
              <span className="text-krishi-text font-medium">{selectedCrop.planting_date?.slice(0, 10)}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-krishi-muted py-2 text-center italic">
            {noCrop}
          </div>
        )}
      </Card>

      {/* Root Zone Soil Moisture Meter */}
      <Card className="bg-surface border-krishi-border shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-krishi-text flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-krishi-blue" />
            {language === 'gu' ? 'જમીન ભેજ' : language === 'hi' ? 'मृदा नमी' : 'Root-Zone Soil Moisture'}
          </span>
          <span className={`text-sm font-extrabold ${soilMoisture !== undefined && soilMoisture !== null ? 'text-krishi-blue' : 'text-krishi-muted text-xs'}`}>
            {soilMoisture !== undefined && soilMoisture !== null ? `${soilMoisture}%` : notProvided}
          </span>
        </div>

        {soilMoisture !== undefined && soilMoisture !== null ? (
          <>
            <div className="w-full bg-surface-secondary rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  soilMoisture > 75 ? 'bg-amber-500' : soilMoisture >= 60 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, soilMoisture))}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-krishi-muted">
              <span>Dry (&lt;50%)</span>
              <span className="font-semibold text-emerald-700">Optimal (60-75%)</span>
              <span>Saturated (&gt;80%)</span>
            </div>
          </>
        ) : (
          <p className="text-[11px] text-krishi-muted mt-1 italic">
            {language === 'gu' ? 'કોઈ માટી રીડિંગ દાખલ કરેલ નથી' : language === 'hi' ? 'कोई मृदा रीडिंग दर्ज नहीं की गई है' : 'No soil reading recorded for this field yet.'}
          </p>
        )}
      </Card>

      {/* Live Atmospheric Telemetry */}
      <Card className="bg-surface border-krishi-border shadow-xs">
        <h4 className="text-xs font-bold text-krishi-text flex items-center gap-2 mb-3">
          <CloudRain className="w-4 h-4 text-krishi-accent" />
          {language === 'gu' ? 'હવામાન સ્થિતિ' : language === 'hi' ? 'मौसम स्थिति' : 'Field Atmosphere & Forecast'}
        </h4>

        {temp !== undefined && temp !== null ? (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-surface-secondary/70">
              <div className="flex items-center gap-1 text-krishi-muted">
                <Thermometer className="w-3 h-3 text-amber-600" />
                <span>{language === 'gu' ? 'તાપમાન' : language === 'hi' ? 'तापमान' : 'Temp'}</span>
              </div>
              <p className="mt-0.5 font-bold text-krishi-text">{temp}°C</p>
            </div>
            <div className="p-2 rounded bg-surface-secondary/70">
              <div className="flex items-center gap-1 text-krishi-muted">
                <CloudRain className="w-3 h-3 text-sky-600" />
                <span>{language === 'gu' ? 'વરસાદ શક્યતા' : language === 'hi' ? 'वर्षा संभावना' : 'Rain Prob'}</span>
              </div>
              <p className="mt-0.5 font-bold text-krishi-blue">{rainProb !== undefined ? `${rainProb}%` : notProvided}</p>
            </div>
            <div className="p-2 rounded bg-surface-secondary/70">
              <div className="flex items-center gap-1 text-krishi-muted">
                <Droplets className="w-3 h-3 text-teal-600" />
                <span>{language === 'gu' ? 'ભેજ' : language === 'hi' ? 'आर्द्रता' : 'Humidity'}</span>
              </div>
              <p className="mt-0.5 font-bold text-krishi-text">{humidity !== undefined ? `${humidity}%` : notProvided}</p>
            </div>
            <div className="p-2 rounded bg-surface-secondary/70">
              <div className="flex items-center gap-1 text-krishi-muted">
                <Wind className="w-3 h-3 text-stone-500" />
                <span>{language === 'gu' ? 'પવન' : language === 'hi' ? 'हवा' : 'Wind'}</span>
              </div>
              <p className="mt-0.5 font-bold text-krishi-text">{wind !== undefined ? `${wind} km/h` : notProvided}</p>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-krishi-muted py-2 text-center italic">
            {language === 'gu' ? 'ખેતરનું હવામાન ઉપલબ્ધ નથી' : language === 'hi' ? 'खेत का मौसम उपलब्ध नहीं है' : 'Weather data not loaded for this location.'}
          </p>
        )}
      </Card>

      {/* Last Irrigation */}
      <Card className="bg-surface border-krishi-border shadow-xs">
        <div className="flex items-center gap-2 text-xs text-krishi-text-secondary">
          <Calendar className="w-4 h-4 text-krishi-earth" />
          <div>
            <p className="font-semibold text-krishi-text">
              {language === 'gu' ? 'છેલ્લી સિંચાઈ' : language === 'hi' ? 'अंतिम सिंचाई' : 'Last Irrigation Recorded'}
            </p>
            <p className="text-[11px] text-krishi-muted">
              {lastIrrigation
                ? `${lastIrrigation.amount} ${lastIrrigation.unit || 'mm'} via ${lastIrrigation.method}`
                : (language === 'gu' ? 'કોઈ સિંચાઈ નોંધાયેલ નથી' : language === 'hi' ? 'कोई सिंचाई दर्ज नहीं है' : 'No irrigation recorded yet')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
