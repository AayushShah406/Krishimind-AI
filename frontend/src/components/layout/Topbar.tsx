import React, { useState } from 'react';
import { Menu, Bell, Shield, LogOut, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { FarmSelector, FieldSelector } from '../common/FarmSelector';
import { Link } from 'react-router-dom';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, switchRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface border-b border-krishi-border px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu + Selectors */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-krishi-text-secondary hover:bg-surface-secondary"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <FarmSelector />
          <FieldSelector />
        </div>
      </div>

      {/* Right: Role Switcher + Language + Notification + Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Role Switcher for seamless testing */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-krishi-border bg-surface-secondary text-xs font-semibold text-krishi-text hover:bg-krishi-border/60 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-krishi-green" />
            <span className="capitalize">{user?.role?.toLowerCase() || 'Farmer'}</span>
            <ChevronDown className="w-3 h-3 text-krishi-muted" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl border border-krishi-border shadow-card py-1.5 z-50">
              <p className="px-3 py-1 text-[10px] uppercase font-bold text-krishi-muted tracking-wider">
                Switch Role (Demo)
              </p>
              {(['FARMER', 'ADVISOR', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-surface-secondary transition-colors ${
                    user?.role === r ? 'font-bold text-krishi-green' : 'text-krishi-text'
                  }`}
                >
                  <span className="capitalize">{r.toLowerCase()}</span>
                  {user?.role === r && <Check className="w-3.5 h-3.5 text-krishi-green" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Multilingual Selector */}
        <LanguageSelector compact />

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-krishi-text-secondary hover:bg-surface-secondary hover:text-krishi-text transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-krishi-accent animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-krishi-accent" />
        </Link>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-secondary transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-krishi-green text-white font-bold text-xs flex items-center justify-center">
              {user?.name
                ? user.name.slice(0, 2).toUpperCase()
                : user?.email
                ? user.email.slice(0, 2).toUpperCase()
                : 'KM'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-krishi-text leading-tight">
                {user?.name || (user?.email ? user.email.split('@')[0] : 'Farmer')}
              </p>
              <p className="text-[10px] text-krishi-text-secondary leading-tight capitalize">
                {user?.role?.toLowerCase() || 'Farmer'}
              </p>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl border border-krishi-border shadow-card py-1.5 z-50">
              <div className="px-3 py-2 border-b border-krishi-border/60">
                <p className="text-xs font-bold text-krishi-text">{user?.name}</p>
                <p className="text-[11px] text-krishi-text-secondary truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="block px-3 py-2 text-xs text-krishi-text hover:bg-surface-secondary"
              >
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="block px-3 py-2 text-xs text-krishi-text hover:bg-surface-secondary"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left border-t border-krishi-border/60"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
