import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
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
            <h1 className="text-2xl font-extrabold text-krishi-text">Reset Password</h1>
            <p className="text-xs text-krishi-text-secondary">
              Enter your email to receive recovery instructions.
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-white shadow-card">
            {submitted ? (
              <div className="text-center space-y-4 py-3">
                <CheckCircle2 className="w-12 h-12 text-krishi-green mx-auto" />
                <h3 className="text-base font-bold text-krishi-text">Recovery Link Sent</h3>
                <p className="text-xs text-krishi-text-secondary">
                  We've sent a password reset token to <strong>{email}</strong>. Please check your inbox.
                </p>
                <Link to="/reset-password">
                  <Button variant="primary" size="md" className="w-full mt-2 font-bold">
                    Enter Reset Token
                  </Button>
                </Link>
              </div>
            ) : (
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
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-krishi-border focus:border-krishi-green outline-none text-xs"
                      placeholder="farmer@krishimind.ai"
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full font-bold">
                  Send Recovery Link
                </Button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-krishi-border/60 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-krishi-green hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const [token, setToken] = useState('RECOVERY-DEMO-991');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password === confirmPassword) setSuccess(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-krishi-text">Set New Password</h1>
            <p className="text-xs text-krishi-text-secondary">Choose a strong, secure password for your farm portal.</p>
          </div>

          <Card className="p-6 sm:p-8 bg-white shadow-card">
            {success ? (
              <div className="text-center space-y-4 py-3">
                <CheckCircle2 className="w-12 h-12 text-krishi-green mx-auto" />
                <h3 className="text-base font-bold text-krishi-text">Password Updated Successfully</h3>
                <p className="text-xs text-krishi-text-secondary">Your credentials have been securely updated.</p>
                <Link to="/login">
                  <Button variant="primary" size="md" className="w-full font-bold">
                    Sign In with New Password
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-krishi-text mb-1">Reset Code / Token</label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-krishi-text mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none text-xs"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-krishi-text mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none text-xs"
                    placeholder="••••••••"
                  />
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full font-bold">
                  Update Password
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};
