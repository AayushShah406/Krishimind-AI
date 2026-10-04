import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Layers,
  Sprout,
  Activity,
  CloudSun,
  Droplets,
  Sparkles,
  History,
  Camera,
  Bell,
  Settings,
  User,
  Users,
  Database,
  FileUp,
  Cpu,
  ShieldAlert,
  Globe2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation('common');

  const farmerLinks = [
    { to: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { to: '/farms', label: t('nav.farms', 'Farms'), icon: MapPin },
    { to: '/fields', label: t('nav.fields', 'Fields'), icon: Layers },
    { to: '/crops', label: t('nav.crops', 'Crops'), icon: Sprout },
    { to: '/soil', label: t('nav.soil', 'Soil'), icon: Activity },
    { to: '/weather', label: t('nav.weather', 'Weather'), icon: CloudSun },
    { to: '/irrigation', label: t('nav.irrigation', 'Irrigation'), icon: Droplets },
    { to: '/ai-advisor', label: t('nav.aiAdvisor', 'AI Advisor'), icon: Sparkles, highlight: true },
    { to: '/recommendations', label: t('nav.recommendations', 'Recommendations'), icon: History },
    { to: '/crop-image-analysis', label: t('nav.imageAnalysis', 'Crop Image Analysis'), icon: Camera },
    { to: '/notifications', label: t('nav.notifications', 'Notifications'), icon: Bell },
  ];

  const advisorLinks = [
    { to: '/advisor/dashboard', label: 'Advisor Dashboard', icon: LayoutDashboard },
    { to: '/advisor/farmers', label: 'Assigned Farmers', icon: Users },
    { to: '/advisor/farms', label: 'Assigned Farms', icon: MapPin },
    { to: '/advisor/fields', label: 'Assigned Fields', icon: Layers },
    { to: '/advisor/recommendations', label: 'AI Recommendations', icon: Activity },
    { to: '/advisor/crop-analysis', label: 'Crop Pathology', icon: Sprout },
    { to: '/advisor/notifications', label: 'Notifications', icon: Bell },
    { to: '/advisor/profile', label: 'Advisor Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/advisors', label: 'Advisor Mapping', icon: ShieldAlert },
    { to: '/admin/farms', label: 'All Farms', icon: MapPin },
    { to: '/admin/fields', label: 'All Fields', icon: Layers },
    { to: '/admin/crops', label: 'Crop Catalog', icon: Sprout },
    { to: '/admin/knowledge', label: 'Knowledge Base', icon: FileUp },
    { to: '/admin/rag', label: 'Pinecone RAG', icon: Database },
    { to: '/admin/ai-monitoring', label: 'AI Monitoring', icon: Cpu },
    { to: '/admin/languages', label: 'Languages', icon: Globe2 },
    { to: '/admin/notifications', label: 'Broadcasts', icon: Bell },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: History },
    { to: '/admin/settings', label: 'Platform Config', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-krishi-text/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-64 bg-surface border-r border-krishi-border flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-krishi-border">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-krishi-green flex items-center justify-center text-white">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-krishi-text">KrishiMind<span className="text-krishi-accent">.AI</span></span>
              <p className="text-[9px] text-krishi-text-secondary -mt-1 font-medium">Enterprise AgriTech</p>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-krishi-text-secondary hover:bg-surface-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Farmer Navigation */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-krishi-muted mb-2">
              Farm Management
            </p>
            <div className="space-y-1">
              {farmerLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => window.innerWidth < 768 && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-krishi-green text-white shadow-xs'
                        : item.highlight
                        ? 'text-krishi-green bg-emerald-50/80 hover:bg-emerald-100/60 font-semibold'
                        : 'text-krishi-text-secondary hover:bg-surface-secondary hover:text-krishi-text'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Advisor Portal (if role allows or visible for quick inspection) */}
          {(user?.role === 'ADVISOR' || user?.role === 'ADMIN') && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-krishi-muted mb-2">
                Advisor Portal
              </p>
              <div className="space-y-1">
                {advisorLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => window.innerWidth < 768 && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-krishi-blue text-white shadow-xs'
                          : 'text-krishi-text-secondary hover:bg-surface-secondary hover:text-krishi-text'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* Admin Management (if role allows) */}
          {user?.role === 'ADMIN' && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-krishi-muted mb-2">
                Admin Center
              </p>
              <div className="space-y-1">
                {adminLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => window.innerWidth < 768 && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-krishi-earth text-white shadow-xs'
                          : 'text-krishi-text-secondary hover:bg-surface-secondary hover:text-krishi-text'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info & Profile Links */}
        <div className="p-3 border-t border-krishi-border space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'bg-surface-secondary text-krishi-green font-bold' : 'text-krishi-text-secondary hover:bg-surface-secondary'
              }`
            }
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'bg-surface-secondary text-krishi-green font-bold' : 'text-krishi-text-secondary hover:bg-surface-secondary'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};
