import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Sparkles,
  CloudRain,
  Activity,
  Layers,
  Camera,
  Languages,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Droplets,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { useLanguage } from '../../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const { language } = useLanguage();
  const [selectedDemoTab, setSelectedDemoTab] = useState<'irrigation' | 'yellowing' | 'flowering'>('irrigation');

  const demoScenarios = {
    irrigation: {
      question: language === 'gu'
        ? 'શું મારે કાલે ઘઉંના ખેતરમાં સિંચાઈ કરવી જોઈએ?'
        : language === 'hi'
        ? 'क्या मुझे कल गेहूं के खेत में पानी देना चाहिए?'
        : 'Should I irrigate my wheat field tomorrow?',
      recommendation: language === 'gu'
        ? 'સિંચાઈ લગભગ 24 કલાક માટે મુલતવી રાખો.'
        : language === 'hi'
        ? 'सिंचाई लगभग 24 घंटे के लिए टालें।'
        : 'Delay irrigation by 24 hours.',
      reason: language === 'gu'
        ? 'હાલમાં જમીનમાં ભેજનું સ્તર 71% છે અને આવતીકાલે વરસાદની શક્યતા 82% છે.'
        : language === 'hi'
        ? 'वर्तमान में मिट्टी में 71% नमी है और कल 82% वर्षा की संभावना है।'
        : 'Current root-zone moisture is sufficient (71%) and incoming rain probability is 82%.',
      evidence: ['Soil Moisture: 71%', 'Rain Probability: 82%', 'Growth Stage: Flowering'],
      confidence: 'HIGH',
      nextAction: language === 'gu'
        ? 'આવતીકાલે ફરીથી માટીની ભેજ તપાસો.'
        : language === 'hi'
        ? 'कल वर्षा के पश्चात मिट्टी की नमी का पुनः आकलन करें।'
        : 'Recheck soil moisture tomorrow after rainfall.',
    },
    yellowing: {
      question: language === 'gu'
        ? 'નીચલા પાંદડા પીળા કેમ પડી રહ્યા છે?'
        : language === 'hi'
        ? 'निचली पत्तियां पीली क्यों हो रही हैं?'
        : 'Why are the lower wheat leaves turning yellow?',
      recommendation: language === 'gu'
        ? 'જમીનનું ડ્રેનેજ સુનિશ્ચિત કરો અને નાઇટ્રોજન ખાતરની ચકાસણી કરો.'
        : language === 'hi'
        ? 'खेत में जल निकास सुनिश्चित करें और नाइट्रोजन स्तर की जांच करें।'
        : 'Inspect field drainage and assess nitrogen supplementation.',
      reason: language === 'gu'
        ? 'વધુ પડતી ભેજથી મૂળમાં ઓક્સિજનની અછત અને નાઇટ્રોજન લીચિંગના લક્ષણ છે.'
        : language === 'hi'
        ? 'अत्यधिक नमी से जड़ों में ऑक्सीजन की कमी और नाइट्रोजन लीचिंग के लक्षण हैं।'
        : 'Prolonged saturation causes root hypoxia and temporary nitrogen leaching.',
      evidence: ['Visual symptom: Lower interveinal chlorosis', 'Soil Moisture: 71%', 'ICAR Wheat Soil Guide'],
      confidence: 'MEDIUM',
      nextAction: language === 'gu'
        ? 'પાંદડાનો નજીકથી ફોટો પાક રોગ કેમેરામાં અપલોડ કરો.'
        : language === 'hi'
        ? 'पत्ती की स्पष्ट तस्वीर फसल विश्लेषण टूल में अपलोड करें।'
        : 'Upload close-up photo to Crop Image Analysis tool.',
    },
    flowering: {
      question: language === 'gu'
        ? 'ફૂલ આવવાની અવસ્થામાં શું સાવચેતી રાખવી?'
        : language === 'hi'
        ? 'फूल आने की अवस्था में क्या प्रबंधन करना चाहिए?'
        : 'What agronomic management is recommended during flowering?',
      recommendation: language === 'gu'
        ? 'જમીનમાં સંતુલિત ભેજ જાળવો અને ભારે ખાતરો ટાળો.'
        : language === 'hi'
        ? 'संतुलित नमी बनाए रखें और भारी उर्वरक डालने से बचें।'
        : 'Maintain stable 60-70% root-zone moisture and avoid chemical stress.',
      reason: language === 'gu'
        ? 'ફૂલ અવસ્થામાં પાણીની અછત કે વધુ પડતું પાણી બંને દાણાની ગુણવત્તા બગાડે છે.'
        : language === 'hi'
        ? 'इस चरण में जल तनाव परागण और दाना भरने को सीधे प्रभावित करता है।'
        : 'Moisture volatility during anthesis risks pollen sterility and grain shriveling.',
      evidence: ['Crop: GW-322 Wheat', 'Growth Stage: Flowering (Day 65)', 'DWR Phenology Guidelines'],
      confidence: 'HIGH',
      nextAction: language === 'gu'
        ? 'હળવું પિયત શિડ્યુલ મોનિટર કરો.'
        : language === 'hi'
        ? 'हल्की सिंचाई अनुसूची पर ध्यान दें।'
        : 'Monitor light irrigation schedule and scout for aphids.',
    },
  };

  const currentScenario = demoScenarios[selectedDemoTab];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-krishi-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-krishi-green border border-emerald-200 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Agricultural Decision Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-krishi-text tracking-tight leading-[1.12]">
                Smarter farming decisions with{' '}
                <span className="text-krishi-green underline decoration-krishi-accent decoration-wavy decoration-2">
                  AI & Real Farm Data
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-krishi-text-secondary max-w-2xl leading-relaxed">
                KrishiMind AI synthesizes structured farm telemetry, live soil sensors, precision weather forecasts, ICAR agronomic research via Pinecone RAG, and Gemini 3 reasoning — delivering actionable decisions with verifiable evidence.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/register">
                  <Button size="lg" variant="primary" icon={<ArrowRight className="w-5 h-5" />}>
                    Start Your Farm
                  </Button>
                </Link>
                <Link to="/ai-advisor">
                  <Button size="lg" variant="secondary" icon={<Sparkles className="w-5 h-5 text-krishi-green" />}>
                    Explore AI Advisor
                  </Button>
                </Link>
              </div>

              {/* Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-krishi-text-secondary font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-krishi-green" />
                  No Hallucinations Guarantee
                </span>
                <span className="flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-krishi-accent" />
                  English • हिन्दी • ગુજરાતી
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-krishi-earth" />
                  Role-Based (Farmer, Advisor, Admin)
                </span>
              </div>
            </div>

            {/* Right Interactive Simulation Card */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Glow backdrop */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-krishi-green to-krishi-accent rounded-2xl blur-lg opacity-20" />

                <Card className="relative bg-white/95 backdrop-blur-md border-krishi-accent/30 shadow-card p-6">
                  {/* Demo Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-krishi-border/60">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold text-krishi-text uppercase tracking-wider">
                        Live Decision Engine
                      </span>
                    </div>
                    <ConfidenceBadge confidence={currentScenario.confidence} size="sm" />
                  </div>

                  {/* Interactive Query Tabs */}
                  <div className="flex gap-1.5 mt-3 p-1 bg-surface-secondary rounded-lg text-xs">
                    {(['irrigation', 'yellowing', 'flowering'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedDemoTab(tab)}
                        className={`flex-1 py-1.5 px-2 rounded-md font-medium capitalize transition-all ${
                          selectedDemoTab === tab
                            ? 'bg-white text-krishi-green shadow-xs font-bold'
                            : 'text-krishi-text-secondary hover:text-krishi-text'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Question Asked */}
                  <div className="mt-4 p-3 rounded-lg bg-surface-secondary/70 border border-krishi-border/60 text-xs">
                    <p className="text-[11px] text-krishi-muted uppercase font-bold">Farmer Query</p>
                    <p className="mt-1 font-semibold text-krishi-text text-sm">
                      "{currentScenario.question}"
                    </p>
                  </div>

                  {/* AI Structured Recommendation */}
                  <div className="mt-3 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-krishi-green">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Actionable Recommendation</span>
                    </div>
                    <p className="mt-1.5 text-base font-bold text-krishi-green-dark">
                      {currentScenario.recommendation}
                    </p>
                    <p className="mt-2 text-xs text-krishi-text-secondary leading-relaxed">
                      {currentScenario.reason}
                    </p>
                  </div>

                  {/* Evidence list */}
                  <div className="mt-3 space-y-1">
                    <p className="text-[11px] font-bold text-krishi-text-secondary uppercase">
                      Sensor Evidence & RAG Context
                    </p>
                    {currentScenario.evidence.map((ev, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-krishi-text">
                        <CheckCircle2 className="w-3 h-3 text-krishi-accent shrink-0" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>

                  {/* Next Action */}
                  <div className="mt-4 pt-3 border-t border-krishi-border/60 flex items-center justify-between text-xs">
                    <div className="text-krishi-text-secondary">
                      <span className="font-semibold text-krishi-text">Next Step: </span>
                      {currentScenario.nextAction}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-surface border-b border-krishi-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-krishi-earth mb-2">The Agricultural Dilemma</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-krishi-text">
              Generic chat models don't farm land. Decisions need verified telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-rose-100 bg-rose-50/20">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h3 className="text-base font-bold text-krishi-text mb-1">Generic Chatbot Hallucinations</h3>
              <p className="text-xs text-krishi-text-secondary leading-relaxed">
                Standard LLMs guess soil moisture and invent weather trends. An erroneous irrigation recommendation during flowering causes root hypoxia, square drop, or fungal outbreaks.
              </p>
            </Card>

            <Card className="border-amber-100 bg-amber-50/20">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h3 className="text-base font-bold text-krishi-text mb-1">Disconnected Data Silos</h3>
              <p className="text-xs text-krishi-text-secondary leading-relaxed">
                Farmers have soil testing papers, local rain gauges, state agricultural bulletins, and drone/phone photos in separate places without a central decision synthesis engine.
              </p>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50/20">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-krishi-green flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h3 className="text-base font-bold text-krishi-text mb-1">The KrishiMind AI Solution</h3>
              <p className="text-xs text-krishi-text-secondary leading-relaxed">
                KrishiMind AI aggregates live farm soil telemetry, weather forecast APIs, and Pinecone hybrid vector retrieval, using Google ADK tools and Gemini 3 to deliver grounded decisions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How KrishiMind Works Section */}
      <section className="py-20 bg-background border-b border-krishi-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-krishi-green mb-2">Core Technology Architecture</h2>
            <p className="text-3xl font-extrabold text-krishi-text">
              How KrishiMind AI Produces Grounded Decisions
            </p>
            <p className="mt-3 text-sm text-krishi-text-secondary">
              A 5-pillar intelligence pipeline combining physical sensors, external atmospheric models, vector databases, and multi-modal vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hoverable className="p-6">
              <div className="p-3 w-fit rounded-xl bg-krishi-green/10 text-krishi-green mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-krishi-text mb-2">1. Farm & Soil Telemetry</h3>
              <p className="text-xs text-krishi-text-secondary leading-relaxed">
                Root-zone moisture (%), soil pH, nitrogen, phosphorus, and potassium tracking across individual field plots.
              </p>
            </Card>

            <Card hoverable className="p-6">
              <div className="p-3 w-fit rounded-xl bg-krishi-blue/10 text-krishi-blue mb-4">
                <CloudRain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-krishi-text mb-2">2. Live Atmospheric Models</h3>
              <p className="text-xs text-krishi-text-secondary leading-relaxed">
                24-hour and 7-day hyperlocal forecast modeling precipitation volume, rain probability, humidity, and wind.
              </p>
            </Card>

            <Card hoverable className="p-6">
              <div className="p-3 w-fit rounded-xl bg-krishi-earth/10 text-krishi-earth mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-krishi-text mb-2">3. Pinecone RAG Knowledge</h3>
              <p className="text-xs text-krishi-text-secondary leading-relaxed">
                Hybrid vector & BM25 retrieval over ICAR, State Agricultural University guidelines, and crop growth stage indices.
              </p>
            </Card>

            <Card hoverable className="p-6">
              <div className="p-3 w-fit rounded-xl bg-krishi-gold/20 text-krishi-text mb-4">
                <Cpu className="w-6 h-6 text-krishi-earth" />
              </div>
              <h3 className="text-base font-bold text-krishi-text mb-2">4. Gemini 3 Reasoning</h3>
              <p className="text-xs text-krishi-text-secondary leading-relaxed">
                Controlled ADK tool calling synthesizes multi-source context into structured JSON with confidence and evidence.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Multilingual AI Showcase */}
      <section className="py-20 bg-surface border-b border-krishi-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-krishi-green text-xs font-semibold mb-3">
                <Languages className="w-3.5 h-3.5" />
                <span>Zero Language Barriers</span>
              </div>
              <h2 className="text-3xl font-extrabold text-krishi-text mb-4">
                True Multilingual AI — English, हिन्दी & ગુજરાતી
              </h2>
              <p className="text-sm text-krishi-text-secondary leading-relaxed mb-6">
                Multilingual support in KrishiMind AI is not just translated buttons. The underlying AI reasoning, crop pathology, and RAG knowledge understand queries across Hindi and Gujarati while preserving exact sensor telemetry (71%, 31°C, 18 mm).
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-krishi-border bg-surface-secondary/60 flex items-start gap-3">
                  <div className="p-2 rounded bg-krishi-green/10 text-krishi-green font-bold text-xs shrink-0">EN</div>
                  <div>
                    <p className="text-xs font-bold text-krishi-text">English</p>
                    <p className="text-xs text-krishi-text-secondary mt-0.5">"Delay irrigation by 24 hours. Current soil moisture is sufficient."</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-krishi-border bg-surface-secondary/60 flex items-start gap-3">
                  <div className="p-2 rounded bg-krishi-accent/10 text-krishi-accent font-bold text-xs shrink-0">HI</div>
                  <div>
                    <p className="text-xs font-bold text-krishi-text">हिन्दी (Hindi)</p>
                    <p className="text-xs text-krishi-text-secondary mt-0.5">"सिंचाई लगभग 24 घंटे के लिए टालें। वर्तमान में मिट्टी में पर्याप्त नमी है।"</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-krishi-border bg-surface-secondary/60 flex items-start gap-3">
                  <div className="p-2 rounded bg-krishi-earth/10 text-krishi-earth font-bold text-xs shrink-0">GU</div>
                  <div>
                    <p className="text-xs font-bold text-krishi-text">ગુજરાતી (Gujarati)</p>
                    <p className="text-xs text-krishi-text-secondary mt-0.5">"સિંચાઈ લગભગ 24 કલાક માટે મુલતવી રાખો. હાલમાં જમીનમાં ભેજનું સ્તર પૂરતું છે."</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Crop Image Analysis Preview */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-surface to-surface-secondary border border-krishi-border shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-krishi-border/60">
                <span className="text-xs font-bold text-krishi-text flex items-center gap-2">
                  <Camera className="w-4 h-4 text-krishi-green" />
                  Crop Vision Pathology Module
                </span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Moderate Severity
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden border border-krishi-border bg-stone-100 flex items-center justify-center p-4 min-h-[160px]">
                  <div className="text-center">
                    <Sprout className="w-12 h-12 text-krishi-green mx-auto mb-2 opacity-80" />
                    <p className="text-xs font-semibold text-krishi-text">Wheat Leaf Sample</p>
                    <p className="text-[10px] text-krishi-muted">GW-322 Phenology Check</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-krishi-muted">Visual Observations</p>
                    <p className="font-semibold text-krishi-text mt-0.5">• Yellowing leaves with localized chlorosis</p>
                    <p className="font-semibold text-krishi-text">• Peripheral brown necrotic margins</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-krishi-muted">Potential Causes</p>
                    <p className="text-krishi-text-secondary">• Root hypoxia from high soil saturation</p>
                    <p className="text-krishi-text-secondary">• Early nitrogen leaching indicator</p>
                  </div>
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase text-krishi-muted">Confidence</p>
                    <p className="font-bold text-krishi-green">Medium (Guaranteed diagnosis avoided)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-krishi-green-dark via-krishi-green to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to upgrade your farm with real AI decision intelligence?
          </h2>
          <p className="text-base text-emerald-100 max-w-2xl mx-auto">
            Experience the synergy of telemetry sensors, Pinecone RAG, and Gemini 3. Support for Wheat, Rice, Cotton, Groundnut, Tomato, and expanding.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="white" className="!text-emerald-950 font-extrabold shadow-card hover:!bg-emerald-50">
                Start Your Farm Free
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold">
                Explore Demo Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
