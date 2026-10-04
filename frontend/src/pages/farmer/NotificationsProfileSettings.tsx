import React, { useState } from 'react';
import { Bell, User, Settings, CheckCircle2, Shield, Globe, Droplets, Thermometer, CloudRain } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Heavy Rainfall Expected Tomorrow',
      message: 'Weather forecast indicates an 82% probability of rain (12-18mm). Irrigation should be delayed on all active plots.',
      type: 'weather_alert',
      time: '1 hour ago',
      read: false,
    },
    {
      id: '2',
      title: 'AI Irrigation Alert for Field A',
      message: 'AI Advisor recommends postponing irrigation by 24 hours to prevent root hypoxia.',
      type: 'irrigation_rec',
      time: '3 hours ago',
      read: false,
    },
    {
      id: '3',
      title: 'Soil Sensor Telemetry Updated',
      message: 'New moisture measurement (71%) received from North Block probe.',
      type: 'system',
      time: 'Yesterday',
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <Bell className="w-5 h-5 text-krishi-green" />
            Field Alerts & Notifications
          </h1>
          <p className="text-xs text-krishi-text-secondary">Hyperlocal weather alerts, AI advisories, and telemetry status</p>
        </div>
        <Button size="sm" variant="secondary" onClick={markAllRead}>
          Mark All Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`p-4 transition-all ${
              !n.read ? 'border-krishi-green/40 bg-emerald-50/15' : 'bg-white opacity-85'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  n.type === 'weather_alert'
                    ? 'bg-sky-100 text-sky-700'
                    : n.type === 'irrigation_rec'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                {n.type === 'weather_alert' ? (
                  <CloudRain className="w-4 h-4" />
                ) : (
                  <Droplets className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-krishi-text text-sm">{n.title}</h4>
                  <span className="text-[10px] text-krishi-muted">{n.time}</span>
                </div>
                <p className="text-krishi-text-secondary leading-relaxed">{n.message}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.location) setLocation(user.location);
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <User className="w-5 h-5 text-krishi-green" />
          Farmer Account Profile
        </h1>
        <p className="text-xs text-krishi-text-secondary">Manage your farmer credentials and contact details</p>
      </div>

      <Card className="p-6 bg-white shadow-card">
        {saved && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-krishi-green" />
            Profile updated successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || 'farmer@krishimind.ai'}
              className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-surface-secondary text-krishi-muted"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Assigned System Role</label>
            <div className="p-2.5 rounded-lg border border-krishi-border bg-surface-secondary font-bold text-krishi-green">
              {user?.role || 'FARMER'}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Primary Farming Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary">Save Profile</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, options } = useLanguage();
  const { logout } = useAuth();

  const [tempUnit, setTempUnit] = useState('celsius');
  const [areaUnit, setAreaUnit] = useState('acres');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <Settings className="w-5 h-5 text-krishi-green" />
          Platform Settings & Preferences
        </h1>
        <p className="text-xs text-krishi-text-secondary">Configure language, units of measurement, and AI preferences</p>
      </div>

      <Card className="p-6 bg-white shadow-card space-y-6">
        {saved && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-krishi-green" />
            Settings saved successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-sm text-krishi-text flex items-center gap-2">
              <Globe className="w-4 h-4 text-krishi-accent" />
              Application & AI Reasoning Language
            </label>
            <p className="text-krishi-text-secondary text-[11px]">
              AI recommendations and pathology reports will be automatically synthesized in this language.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-1">
              {options.map((opt) => (
                <button
                  type="button"
                  key={opt.code}
                  onClick={() => setLanguage(opt.code)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    language === opt.code
                      ? 'border-krishi-green bg-emerald-50/60 ring-2 ring-krishi-green/40'
                      : 'border-krishi-border hover:bg-surface-secondary'
                  }`}
                >
                  <span className="text-lg block mb-1">{opt.flag}</span>
                  <p className="font-bold text-krishi-text">{opt.nativeName}</p>
                  <p className="text-[10px] text-krishi-muted">{opt.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Measurement Units */}
          <div className="pt-4 border-t border-krishi-border/60 space-y-3">
            <h4 className="font-bold text-sm text-krishi-text">Measurement Units</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Temperature</label>
                <select
                  value={tempUnit}
                  onChange={(e) => setTempUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white outline-none"
                >
                  <option value="celsius">Celsius (°C)</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Land Area</label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white outline-none"
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="bigha">Bigha</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-krishi-border/60 flex items-center justify-between">
            <Button type="submit" variant="primary">Save Preferences</Button>
            <Button type="button" variant="danger" onClick={logout}>Sign Out</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
