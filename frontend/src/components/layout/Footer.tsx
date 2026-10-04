import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-krishi-border/80 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-krishi-green flex items-center justify-center text-white">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-krishi-text">KrishiMind AI</span>
            </div>
            <p className="text-xs text-krishi-text-secondary leading-relaxed">
              Empowering farmers and agricultural advisors with data-driven decision intelligence, RAG vector retrieval, Gemini 3 reasoning, and multilingual support.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-krishi-green font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>ICAR Aligned Agronomic Knowledge</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-krishi-text mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-krishi-text-secondary">
              <li><Link to="/dashboard" className="hover:text-krishi-green transition-colors">Farm Dashboard</Link></li>
              <li><Link to="/ai-advisor" className="hover:text-krishi-green transition-colors">AI Decision Advisor</Link></li>
              <li><Link to="/crop-image-analysis" className="hover:text-krishi-green transition-colors">Crop Image Analysis</Link></li>
              <li><Link to="/irrigation" className="hover:text-krishi-green transition-colors">Smart Irrigation</Link></li>
              <li><Link to="/weather" className="hover:text-krishi-green transition-colors">Weather Telemetry</Link></li>
            </ul>
          </div>

          {/* Roles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-krishi-text mb-3">Portals</h4>
            <ul className="space-y-2 text-xs text-krishi-text-secondary">
              <li><Link to="/dashboard" className="hover:text-krishi-green transition-colors">Farmer Workspace</Link></li>
              <li><Link to="/advisor/dashboard" className="hover:text-krishi-green transition-colors">Agricultural Advisor Portal</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-krishi-green transition-colors">Admin & RAG Monitoring</Link></li>
              <li><Link to="/admin/knowledge-base" className="hover:text-krishi-green transition-colors">Agronomic Knowledge Base</Link></li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-krishi-text mb-3">Company</h4>
            <ul className="space-y-2 text-xs text-krishi-text-secondary">
              <li><Link to="/about" className="hover:text-krishi-green transition-colors">About KrishiMind</Link></li>
              <li><Link to="/contact" className="hover:text-krishi-green transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-krishi-green transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-krishi-green transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-krishi-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-krishi-muted gap-3">
          <p>© {new Date().getFullYear()} KrishiMind AI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian & Global Agriculture
          </p>
        </div>
      </div>
    </footer>
  );
};
