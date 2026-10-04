import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, User, Mail, Lock, MapPin, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'FARMER' | 'ADVISOR'>('FARMER');
  const [preferredLang, setPreferredLang] = useState<'en' | 'hi' | 'gu'>(language);
  const [location, setLocation] = useState('Ahmedabad, Gujarat');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        role,
        preferred_language: preferredLang,
        location,
      });
      setLanguage(preferredLang);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-krishi-green flex items-center justify-center text-white mx-auto shadow-sm">
              <Sprout className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-krishi-text">Create Your KrishiMind Account</h1>
            <p className="text-xs text-krishi-text-secondary">
              Connect your farm telemetry and unlock AI decision intelligence.
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
                <label className="block font-semibold text-krishi-text mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-krishi-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-krishi-border focus:border-krishi-green focus:ring-1 focus:ring-krishi-green outline-none text-xs"
                    placeholder="Ramesh Patel"
                  />
                </div>
              </div>

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
                    placeholder="ramesh@krishimind.ai"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-krishi-text mb-1">Password</label>
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

                <div>
                  <label className="block font-semibold text-krishi-text mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-krishi-muted absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-krishi-border focus:border-krishi-green focus:ring-1 focus:ring-krishi-green outline-none text-xs"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-krishi-text mb-1">Primary Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'FARMER' | 'ADVISOR')}
                    className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white text-krishi-text focus:border-krishi-green outline-none text-xs"
                  >
                    <option value="FARMER">Farmer</option>
                    <option value="ADVISOR">Agricultural Advisor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-krishi-text mb-1">Preferred Language</label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value as 'en' | 'hi' | 'gu')}
                    className="w-full px-3 py-2 rounded-lg border border-krishi-border bg-white text-krishi-text focus:border-krishi-green outline-none text-xs"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="gu">ગુજરાતી (Gujarati)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-krishi-text mb-1">Farm / Region Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-krishi-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-krishi-border focus:border-krishi-green focus:ring-1 focus:ring-krishi-green outline-none text-xs"
                    placeholder="Sanand, Ahmedabad, Gujarat"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full font-bold mt-2"
              >
                Create Account & Launch
              </Button>
            </form>
          </Card>

          <p className="text-center text-xs text-krishi-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-krishi-green hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};
