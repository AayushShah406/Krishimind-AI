import React from 'react';
import { Sprout, ShieldCheck, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-3 mb-12">
          <div className="w-12 h-12 rounded-xl bg-krishi-green flex items-center justify-center text-white mx-auto">
            <Sprout className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-krishi-text">About KrishiMind AI</h1>
          <p className="text-sm text-krishi-text-secondary max-w-2xl mx-auto">
            Pioneering verifiable AI decision intelligence for farmers, agronomists, and agricultural advisors worldwide.
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-krishi-text-secondary leading-relaxed">
          <Card className="p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-krishi-text">Our Mission</h2>
            <p>
              Agriculture is the backbone of food security, yet millions of farmers rely on gut instincts or generic search tools that fail to account for root-zone moisture, micro-climates, and variety-specific growth stages. KrishiMind AI bridges the gap between field sensors and agronomic science.
            </p>
            <p>
              By combining Google Gemini 3 reasoning with Pinecone vector retrieval over peer-reviewed ICAR research, we replace subjective guesswork with clear evidence, confidence levels, and actionable recommendations.
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5">
              <h3 className="font-bold text-krishi-text mb-2">Scientific Rigor</h3>
              <p className="text-xs">
                Built on agronomic principles vetted by ICAR, State Agricultural Universities, and FAO standards.
              </p>
            </Card>
            <Card className="p-5">
              <h3 className="font-bold text-krishi-text mb-2">Multi-Modal Telemetry</h3>
              <p className="text-xs">
                Combines soil sensors, satellite weather forecasts, and camera photos to prevent false diagnoses.
              </p>
            </Card>
            <Card className="p-5">
              <h3 className="font-bold text-krishi-text mb-2">Native Multilingual</h3>
              <p className="text-xs">
                Delivering complete AI reasoning in English, Hindi, and Gujarati so every farmer benefits directly.
              </p>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-3 mb-12">
          <h1 className="text-3xl font-extrabold text-krishi-text">Contact Agricultural Support</h1>
          <p className="text-xs sm:text-sm text-krishi-text-secondary">
            Our team of agricultural advisors and AI engineers are here to support your farming operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-krishi-text">Send Us a Message</h3>
            <form className="space-y-3 text-xs" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
              <div>
                <label className="block font-semibold mb-1">Your Name</label>
                <input className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none" placeholder="Ramesh Patel" required />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email / Phone</label>
                <input className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none" placeholder="farmer@krishimind.ai" required />
              </div>
              <div>
                <label className="block font-semibold mb-1">Inquiry Type</label>
                <select className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none bg-white">
                  <option>Agronomic Advisory Support</option>
                  <option>Sensor Integration / Telemetry</option>
                  <option>Enterprise / Co-operative Account</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Message</label>
                <textarea rows={4} className="w-full px-3 py-2 rounded-lg border border-krishi-border outline-none" placeholder="Describe your farm or query..." required />
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full font-bold">
                Submit Inquiry
              </Button>
            </form>
          </Card>

          <div className="space-y-4">
            <Card className="p-6 space-y-4 text-xs">
              <h3 className="text-base font-bold text-krishi-text">Contact Channels</h3>
              <div className="flex items-start gap-3 text-krishi-text">
                <MapPin className="w-4 h-4 text-krishi-earth shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">AgriTech Innovation Center</p>
                  <p className="text-krishi-text-secondary">Sanand, Ahmedabad, Gujarat 382110, India</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-krishi-text">
                <Mail className="w-4 h-4 text-krishi-green shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Support Email</p>
                  <p className="text-krishi-text-secondary">support@krishimind.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-krishi-text">
                <Phone className="w-4 h-4 text-krishi-blue shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Kisan Advisory Helpline</p>
                  <p className="text-krishi-text-secondary">+91 1800-KRISHI-AI (Toll Free)</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-emerald-50/50 border-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-krishi-green">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Agricultural Network</span>
              </div>
              <p className="text-krishi-text-secondary">
                Certified agricultural advisors respond within 24 hours to all agronomic queries submitted through KrishiMind.
              </p>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-krishi-text mb-6">Privacy Policy</h1>
        <Card className="p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-krishi-text-secondary leading-relaxed">
          <p><strong>Effective Date:</strong> January 2026</p>
          <h2 className="text-base font-bold text-krishi-text">1. Farm Data Ownership</h2>
          <p>
            At KrishiMind AI, we firmly believe that your farm telemetry belongs to you. All recorded soil readings, irrigation logs, crop varieties, and GPS plot locations are stored securely and encrypted in transit and at rest.
          </p>
          <h2 className="text-base font-bold text-krishi-text">2. AI & Machine Learning Usage</h2>
          <p>
            Farm measurements provided to Google Gemini 3 and Pinecone are used strictly in real-time to generate your agricultural recommendations. Your proprietary farm metrics are never used to train public open models.
          </p>
          <h2 className="text-base font-bold text-krishi-text">3. Image Privacy</h2>
          <p>
            Photographs uploaded to our Crop Image Analysis module are processed in dedicated secure object storage for visual pathology extraction and are accessible only to you and your assigned agricultural advisors.
          </p>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-krishi-text mb-6">Terms of Service</h1>
        <Card className="p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-krishi-text-secondary leading-relaxed">
          <h2 className="text-base font-bold text-krishi-text">1. Agricultural Decision Support Disclaimer</h2>
          <p>
            KrishiMind AI is a decision support tool designed to assist farmers and advisors with structured telemetry and agronomic evidence. Because real-world weather and micro-climates vary, recommendations must be considered alongside physical on-site inspections. KrishiMind AI does not replace local statutory agrochemical guidelines.
          </p>
          <h2 className="text-base font-bold text-krishi-text">2. Crop Pathology Safety</h2>
          <p>
            Our vision diagnostics highlight "possible causes", "visual indicators", and "potential issues". Users must verify chemical treatments with registered agricultural advisors before applying fertilizers or pesticides.
          </p>
          <h2 className="text-base font-bold text-krishi-text">3. User Responsibilities</h2>
          <p>
            Users are responsible for ensuring accurate calibration of soil moisture probes and honest reporting of irrigation records.
          </p>
        </Card>
      </div>
      <Footer />
    </div>
  );
};
