import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (role: 'farmer' | 'advisor' | 'admin') => {
    if (role === 'farmer') {
      setEmail('farmer@krishimind.ai');
      setPassword('password123');
    } else if (role === 'advisor') {
      setEmail('advisor@krishimind.ai');
      setPassword('password123');
    } else {
      setEmail('admin@krishimind.ai');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-krishi-green flex items-center justify-center text-white mx-auto shadow-sm">
              <Sprout className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-krishi-text">Sign In to KrishiMind AI</h1>
            <p className="text-xs text-krishi-text-secondary">
              Access your agricultural telemetry, RAG knowledge, and decision intelligence.
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-white shadow-card">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-krishi-text mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-krishi-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-krishi-border focus:border-krishi-green focus:ring-1 focus:ring-krishi-green outline-none text-xs"
                    placeholder="farmer@krishimind.ai"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-krishi-text">Password</label>
                  <Link to="/forgot-password" className="text-krishi-green hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-krishi-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-krishi-border focus:border-krishi-green focus:ring-1 focus:ring-krishi-green outline-none text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-krishi-border text-krishi-green focus:ring-krishi-green"
                  />
                  <span className="text-krishi-text-secondary">Remember me</span>
                </label>
                <LanguageSelector compact />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full font-bold mt-2"
              >
                Sign In
              </Button>
            </form>

            {/* Quick Demo Logins */}
            <div className="mt-6 pt-5 border-t border-krishi-border/60">
              <p className="text-[11px] font-bold uppercase tracking-wider text-krishi-muted text-center mb-2.5">
                Quick Demo Credentials
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => autofillDemo('farmer')}
                  className="py-1.5 px-2 rounded-lg border border-krishi-border text-xs font-semibold text-krishi-text hover:bg-emerald-50 hover:border-krishi-green transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sprout className="w-3.5 h-3.5 text-krishi-green" />
                  <span>Farmer</span>
                </button>
                <button
                  type="button"
                  onClick={() => autofillDemo('advisor')}
                  className="py-1.5 px-2 rounded-lg border border-krishi-border text-xs font-semibold text-krishi-text hover:bg-sky-50 hover:border-krishi-blue transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-krishi-blue" />
                  <span>Advisor</span>
                </button>
                <button
                  type="button"
                  onClick={() => autofillDemo('admin')}
                  className="py-1.5 px-2 rounded-lg border border-krishi-border text-xs font-semibold text-krishi-text hover:bg-amber-50 hover:border-krishi-earth transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-krishi-earth" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          </Card>

          <p className="text-center text-xs text-krishi-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-krishi-green hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};
