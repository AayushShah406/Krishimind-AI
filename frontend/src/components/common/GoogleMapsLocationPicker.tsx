import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  ExternalLink,
  Layers,
  Search,
  AlertCircle,
  Loader2,
  RefreshCw,
  X
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

export interface LocationResult {
  latitude: number;
  longitude: number;
  locationName: string;
  state?: string;
  district?: string;
  city?: string;
  accuracy?: number;
}

interface GoogleMapsLocationPickerProps {
  initialLat?: number;
  initialLon?: number;
  initialLocationName?: string;
  onSelectLocation: (loc: LocationResult) => void;
  onCancel?: () => void;
  isModal?: boolean;
  title?: string;
  subtitle?: string;
}

export const GoogleMapsLocationPicker: React.FC<GoogleMapsLocationPickerProps> = ({
  initialLat,
  initialLon,
  initialLocationName = '',
  onSelectLocation,
  onCancel,
  isModal = false,
  title = 'Live Farm Location (Google Maps)',
  subtitle = 'Detect your live agricultural coordinates with high-accuracy GPS and satellite mapping.',
}) => {
  const [lat, setLat] = useState<number | null>(initialLat ?? null);
  const [lon, setLon] = useState<number | null>(initialLon ?? null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locationName, setLocationName] = useState(initialLocationName);
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  
  const [detecting, setDetecting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'hybrid' | 'roadmap'>('hybrid');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Reverse geocode latitude and longitude to human-readable address
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // 1. Try BigDataCloud Client API (Fast, reliable, CORS-friendly for India/global)
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      const res = await fetch(bdcUrl);
      if (res.ok) {
        const data = await res.json();
        const detectedCity = data.locality || data.city || '';
        const detectedState = data.principalSubdivision || '';
        const detectedDist =
          data.localityInfo?.administrative?.find((a: any) =>
            a.description?.toLowerCase().includes('district')
          )?.name || '';

        const fullAddr = [detectedCity, detectedDist, detectedState]
          .filter(Boolean)
          .join(', ');

        setCity(detectedCity);
        setDistrict(detectedDist);
        setState(detectedState);
        setLocationName(fullAddr || `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
        return;
      }
    } catch (e) {
      console.warn('BigDataCloud reverse geocode error, falling back to Nominatim', e);
    }

    try {
      // 2. Fallback to OpenStreetMap / Nominatim
      const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
      const res = await fetch(nomUrl);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const town = addr.village || addr.town || addr.city || addr.suburb || 'Local Area';
        const dist = addr.state_district || addr.county || '';
        const st = addr.state || '';
        const full = [town, dist, st].filter(Boolean).join(', ');

        setCity(town);
        setDistrict(dist);
        setState(st);
        setLocationName(full || `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
        return;
      }
    } catch {
      // Fallback display
    }

    setLocationName(`${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
  };

  // High-accuracy live GPS detection
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = Number(pos.coords.latitude.toFixed(6));
        const longitude = Number(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy);

        setLat(latitude);
        setLon(longitude);
        setAccuracy(acc);
        setDetecting(false);

        await reverseGeocode(latitude, longitude);
      },
      (err) => {
        setDetecting(false);
        let msg = 'Unable to retrieve location. Please check browser GPS permissions.';
        if (err.code === 1) {
          msg = 'Location permission was denied. Please allow location access in your browser settings.';
        } else if (err.code === 2) {
          msg = 'GPS signal is currently unavailable. Try moving outdoors or search manually.';
        } else if (err.code === 3) {
          msg = 'Location detection timed out. Please try again.';
        }
        setGeoError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Search location name using Open-Meteo geocoding
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setGeoError(null);
    try {
      const encoded = encodeURIComponent(searchQuery.trim());
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=1&language=en&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        if (results.length > 0) {
          const match = results[0];
          const newLat = Number(match.latitude.toFixed(6));
          const newLon = Number(match.longitude.toFixed(6));
          setLat(newLat);
          setLon(newLon);
          setAccuracy(undefined);

          const full = [match.name, match.admin2, match.admin1, match.country]
            .filter(Boolean)
            .join(', ');
          setLocationName(full);
          setCity(match.name || '');
          setState(match.admin1 || '');
          setDistrict(match.admin2 || '');
        } else {
          setGeoError(`No coordinates found for "${searchQuery}". Try a nearby city or district name.`);
        }
      }
    } catch {
      setGeoError('Search request failed. Please check your internet connection.');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    if (lat === null || lon === null) {
      setGeoError('Please detect your live location or enter coordinates before confirming.');
      return;
    }
    onSelectLocation({
      latitude: lat,
      longitude: lon,
      locationName: locationName || `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`,
      state: state || undefined,
      district: district || undefined,
      city: city || undefined,
      accuracy: accuracy || undefined,
    });
  };

  // Google Maps embed URL
  // t=h for hybrid satellite with roads/labels, t=m for roadmap
  const mapEmbedUrl =
    lat !== null && lon !== null
      ? `https://maps.google.com/maps?q=${lat},${lon}&t=${mapType === 'hybrid' ? 'h' : 'm'}&z=16&output=embed`
      : null;

  const googleMapsExternalUrl =
    lat !== null && lon !== null
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
      : null;

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-krishi-border/60">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-krishi-text flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <MapPin className="w-5 h-5" />
            </span>
            <span>{title}</span>
          </h2>
          <p className="text-xs text-krishi-text-secondary mt-1 max-w-xl">
            {subtitle}
          </p>
        </div>
        {isModal && onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Action Controls: Live GPS button + Search box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Live GPS Button */}
        <div className="md:col-span-5">
          <Button
            type="button"
            variant="primary"
            onClick={handleGetLiveLocation}
            disabled={detecting}
            className="w-full justify-center py-2.5 shadow-sm"
            icon={
              detecting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Navigation className="w-4 h-4 text-white" />
              )
            }
          >
            {detecting ? 'Acquiring GPS Satellite Fix...' : 'Get Live GPS Location'}
          </Button>
        </div>

        {/* Search location by village/city */}
        <div className="md:col-span-7">
          <form onSubmit={handleSearchLocation} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Or search village, taluka, city..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-krishi-border bg-white text-krishi-text focus:outline-none focus:ring-2 focus:ring-krishi-green/30"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              disabled={searching || !searchQuery.trim()}
              size="sm"
            >
              {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </Button>
          </form>
        </div>
      </div>

      {/* Geolocation Error Alert */}
      {geoError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <span className="font-semibold">{geoError}</span>
          </div>
        </div>
      )}

      {/* Google Map Viewer & Live Coordinates Status */}
      {lat !== null && lon !== null ? (
        <div className="space-y-3">
          {/* Map Frame Toolbar */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Pin Dropped
              </span>
              {accuracy !== undefined && (
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Accuracy: ±{accuracy}m
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Satellite vs Roadmap */}
              <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setMapType('hybrid')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    mapType === 'hybrid'
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Satellite (Field View)
                </button>
                <button
                  type="button"
                  onClick={() => setMapType('roadmap')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    mapType === 'roadmap'
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Street Map
                </button>
              </div>

              {/* Open in Google Maps */}
              {googleMapsExternalUrl && (
                <a
                  href={googleMapsExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-krishi-blue bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Embedded Google Maps Container */}
          <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
            {mapEmbedUrl && (
              <iframe
                title="Google Maps Location"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            )}
            <div className="absolute bottom-2 left-2 pointer-events-none bg-slate-900/80 backdrop-blur text-white text-[11px] px-2.5 py-1 rounded-md shadow flex items-center gap-1.5 font-mono">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {lat.toFixed(5)}° N, {lon.toFixed(5)}° E
              </span>
            </div>
          </div>

          {/* Location Details Box */}
          <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-krishi-border space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-krishi-text-secondary">
                Resolved Farm Address / Zone
              </label>
              <button
                type="button"
                onClick={() => reverseGeocode(lat, lon)}
                className="text-[11px] text-krishi-green font-semibold hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Re-detect Address
              </button>
            </div>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Anand, Gujarat, India"
              className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-krishi-border bg-white text-krishi-text focus:outline-none focus:ring-2 focus:ring-krishi-green/30"
            />
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Village/City</span>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-2 py-1 text-xs rounded border border-krishi-border bg-white text-krishi-text"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">District</span>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                  className="w-full px-2 py-1 text-xs rounded border border-krishi-border bg-white text-krishi-text"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">State</span>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-full px-2 py-1 text-xs rounded border border-krishi-border bg-white text-krishi-text"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Prompt State */
        <div className="py-8 px-4 text-center rounded-2xl border-2 border-dashed border-krishi-border/80 bg-surface-secondary/40 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-krishi-text">No Coordinates Selected Yet</h3>
            <p className="text-xs text-krishi-text-secondary max-w-sm mx-auto">
              Click <strong>Get Live GPS Location</strong> above to fetch your current physical coordinates and display them on Google Maps.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-krishi-border/60">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} size="sm">
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          onClick={handleConfirm}
          disabled={lat === null || lon === null}
          size="sm"
          icon={<CheckCircle2 className="w-4 h-4 text-white" />}
        >
          Confirm & Use This Location
        </Button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-2xl border border-krishi-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6">
          {content}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-5 bg-white shadow-card">
      {content}
    </Card>
  );
};
