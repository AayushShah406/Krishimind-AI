import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowRight } from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-krishi-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-krishi-green flex items-center justify-center text-white shadow-sm">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-krishi-text">KrishiMind<span className="text-krishi-accent">.AI</span></span>
              <p className="text-[10px] text-krishi-text-secondary -mt-1 hidden sm:block">Smarter farming decisions with AI</p>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-krishi-text-secondary">
            <Link to="/about" className="hover:text-krishi-green transition-colors">About</Link>
            <Link to="/contact" className="hover:text-krishi-green transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-krishi-green transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-krishi-green transition-colors">Terms</Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <LanguageSelector compact />
            {user ? (
              <Link to="/dashboard">
                <Button size="sm" variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button size="sm" variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" variant="primary">Start Your Farm</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
