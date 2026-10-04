import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  MessageSquare,
  Compass,
  ArrowRight,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  Globe,
  Video,
  PlayCircle,
  Image as ImageIcon,
  ExternalLink,
  ListOrdered
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { FarmContextSidebar } from '../../components/ai/FarmContextSidebar';
import { FarmSelector, FieldSelector } from '../../components/common/FarmSelector';
import { useFarm } from '../../context/FarmContext';
import { useLanguage } from '../../context/LanguageContext';
import { api, AIStructuredResponse, WeatherData } from '../../services/api';
import { useTranslation } from 'react-i18next';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  structured?: AIStructuredResponse;
  timestamp: string;
}

export const AIAdvisorPage: React.FC = () => {
  const { selectedFarm, selectedField, selectedCrop } = useFarm();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation('ai');

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationsHistory, setConversationsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load past conversations and field weather
  useEffect(() => {
    async function loadData() {
      try {
        const convs = await api.getConversations();
        setConversationsHistory(convs);

        // Populate chat with persistent database conversation records
        if (convs.length > 0) {
          const dbMsgs: ChatMessage[] = [];
          convs.slice(0, 15).reverse().forEach((c: any) => {
            dbMsgs.push({
              id: `u-${c.id}`,
              sender: 'user',
              text: c.question,
              timestamp: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
            dbMsgs.push({
              id: `a-${c.id}`,
              sender: 'assistant',
              text: c.answer,
              timestamp: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          });
          setMessages(dbMsgs);
        } else {
          setMessages([
            {
              id: 'welcome-msg',
              sender: 'assistant',
              text: language === 'gu'
                ? 'નમસ્તે! હું કૃષિમાઇન્ડ AI સલાહકાર છું. પાક સંભાળ, જમીન ભેજ, સિંચાઈ, ખાતર અથવા રોગ નિયંત્રણ વિશે મને કોઈ પણ પ્રશ્ન પૂછો.'
                : language === 'hi'
                ? 'नमस्ते! मैं कृषिमाइंड एआई सलाहकार हूँ। फसल स्वास्थ्य, सिंचाई, खाद या कृषि प्रबंधन संबंधी कोई भी प्रश्न पूछें।'
                : 'Welcome to KrishiMind AI. Ask any question about irrigation scheduling, crop nutrition, disease diagnosis, or general farming guidance.',
              timestamp: 'Just now',
            },
          ]);
        }

        if (selectedField) {
          const w = await api.getWeather(selectedField.id);
          setWeatherData(w);
        } else {
          setWeatherData(null);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [selectedField, language]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askAI({
        field_id: selectedField?.id,
        farm_id: selectedFarm?.id,
        question: query,
        language,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.recommendation,
        structured: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      // refresh conversations list
      api.getConversations().then(setConversationsHistory).catch(() => {});
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: language === 'gu'
            ? 'ભલામણ તૈયાર કરવામાં ક્ષતિ આવી. કૃપા કરીને ખાતરી કરો કે બેકએન્ડ સક્રિય છે.'
            : language === 'hi'
            ? 'सलाह तैयार करने में त्रुटि हुई। कृपया सुनिश्चित करें कि बैकएंड चालू है।'
            : 'Error generating recommendation. Please ensure backend connection is active.',
          timestamp: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const presetQueries = [
    language === 'gu' ? 'તારું નામ શું છે અને તું શું કરી શકે છે?' : language === 'hi' ? 'तुम्हारा नाम क्या है और तुम क्या कर सकते हो?' : 'What is your name and what can you do?',
    language === 'gu' ? 'શું મારે કાલે પિયત આપવું જોઈએ?' : language === 'hi' ? 'क्या मुझे कल खेत में पानी देना चाहिए?' : 'Should I irrigate my field tomorrow?',
    language === 'gu' ? 'પાંદડા કેમ પીળા પડી રહ્યા છે?' : language === 'hi' ? 'पत्तियां पीली क्यों पड़ रही हैं?' : 'Why are my leaves turning yellow?',
    language === 'gu' ? 'ખાતરનું સંતુલિત આયોજન કેવી રીતે કરવું?' : language === 'hi' ? 'संतुलित खाद प्रबंधन कैसे करें?' : 'How should I schedule crop fertilization?'
  ];

  return (
    <div className="space-y-4">
      {/* Workspace Header & Live Context Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-krishi-green animate-pulse" />
            {t('advisorTitle', 'Agricultural Decision Workspace')}
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            {t('advisorSubtitle', 'Synthesizes real-time field telemetry, weather forecasts, and ICAR agronomic research via Gemini 3 & Pinecone RAG.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FarmSelector />
          <FieldSelector />
        </div>
      </div>

      {/* 3-COLUMN WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Past Consultations (3 cols) */}
        <div className="hidden lg:block lg:col-span-3 space-y-3">
          <Card className="p-4 bg-surface h-[calc(100vh-220px)] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-krishi-border/60">
              <span className="text-xs font-bold text-krishi-text flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-krishi-text-secondary" />
                {t('conversations', 'Past Consultations')}
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-secondary text-krishi-muted">
                {conversationsHistory.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
              {conversationsHistory.length === 0 ? (
                <p className="text-xs text-krishi-muted py-8 text-center">No past inquiries yet.</p>
              ) : (
                conversationsHistory.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSend(c.question)}
                    className="w-full text-left p-2.5 rounded-lg border border-krishi-border/60 hover:bg-surface-secondary/80 hover:border-krishi-green transition-all text-xs"
                  >
                    <p className="font-semibold text-krishi-text line-clamp-1">{c.question}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-krishi-muted">
                      <span>{c.language?.toUpperCase() || 'EN'}</span>
                      <span>{c.confidence || 'HIGH'}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* CENTER COLUMN: Interactive Decision Stream (6 cols) */}
        <div className="lg:col-span-6 flex flex-col h-[calc(100vh-220px)]">
          <Card className="flex-1 flex flex-col p-4 bg-surface shadow-xs overflow-hidden">
            {/* Chat Messages Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {m.sender === 'user' ? (
                    <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-krishi-green text-white px-4 py-2.5 text-xs shadow-xs">
                      <p className="font-medium leading-relaxed">{m.text}</p>
                      <span className="text-[10px] text-emerald-200 mt-1 block text-right">
                        {m.timestamp}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full max-w-[95%] space-y-3">
                      {m.structured && (m.structured.reason || (m.structured.evidence && m.structured.evidence.length > 0)) ? (
                        <div className="rounded-xl border border-krishi-accent/30 bg-gradient-to-br from-surface to-emerald-50/20 p-4 shadow-subtle space-y-3">
                          {/* Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-krishi-border/60">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-krishi-green">
                              <Sparkles className="w-4 h-4" />
                              <span>KrishiMind AI Response</span>
                            </div>
                            <ConfidenceBadge confidence={m.structured.confidence || 'HIGH'} size="sm" />
                          </div>

                          {/* Recommendation */}
                          <div className="p-3 bg-white rounded-lg border border-krishi-border/80">
                            <p className="text-sm font-semibold text-krishi-text leading-relaxed whitespace-pre-line">
                              {m.structured.recommendation || m.text}
                            </p>
                            {m.structured.reason && (
                              <p className="mt-2 text-xs text-krishi-text-secondary leading-relaxed border-t border-krishi-border/40 pt-1.5">
                                <span className="font-bold text-krishi-text">Reason: </span>
                                {m.structured.reason}
                              </p>
                            )}
                          </div>

                          {/* Evidence list */}
                          {m.structured.evidence && m.structured.evidence.length > 0 && (
                            <div className="text-xs space-y-1 bg-surface-secondary/60 p-2.5 rounded-lg border border-krishi-border/40">
                              <span className="font-bold text-krishi-text text-[11px] block mb-1">
                                Observed Context & Evidence:
                              </span>
                              {m.structured.evidence.map((ev, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[11px] text-krishi-text-secondary">
                                  <CheckCircle2 className="w-3 h-3 text-krishi-green shrink-0" />
                                  <span>{ev}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Next Action */}
                          {m.structured.next_action && (
                            <div className="flex items-center gap-1.5 p-2 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs">
                              <ArrowRight className="w-3.5 h-3.5 text-krishi-green shrink-0" />
                              <div>
                                <span className="font-bold">Next Action: </span>
                                <span>{m.structured.next_action}</span>
                              </div>
                            </div>
                          )}

                          {/* Step-by-Step Practical Field Guide */}
                          {m.structured.detailed_guide && m.structured.detailed_guide.length > 0 && (
                            <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-200/60 space-y-2">
                              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                <ListOrdered className="w-3.5 h-3.5 text-krishi-green" />
                                <span>Detailed Operational Steps:</span>
                              </span>
                              <div className="space-y-1.5">
                                {m.structured.detailed_guide.map((step, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5 border border-emerald-200">
                                      {sIdx + 1}
                                    </span>
                                    <span className="flex-1">{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommended Videos & Visual Reference Media */}
                          {m.structured.media_resources && m.structured.media_resources.length > 0 && (
                            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/60 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                                  <Video className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Visual & Video Reference Guides:</span>
                                </span>
                                <span className="text-[10px] text-blue-600 font-medium">Educational</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {m.structured.media_resources.map((res, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="group rounded-lg overflow-hidden border border-blue-200/70 bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                                  >
                                    <div className="relative h-24 w-full bg-slate-900 overflow-hidden">
                                      {res.thumbnail_url || (res.type === 'image' && res.url) ? (
                                        <img
                                          src={res.thumbnail_url || res.url}
                                          alt={res.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                          {res.type === 'video' ? <Video className="w-6 h-6 text-blue-400" /> : <ImageIcon className="w-6 h-6 text-emerald-400" />}
                                        </div>
                                      )}
                                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur text-white text-[9px] font-bold flex items-center gap-1">
                                        {res.type === 'video' ? <PlayCircle className="w-2.5 h-2.5 text-rose-400" /> : <ImageIcon className="w-2.5 h-2.5 text-emerald-400" />}
                                        <span className="uppercase">{res.type}</span>
                                      </div>
                                      {res.type === 'video' && (
                                        <a
                                          href={res.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors"
                                          title="Watch video on YouTube"
                                        >
                                          <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                                            <PlayCircle className="w-4 h-4 fill-current" />
                                          </div>
                                        </a>
                                      )}
                                    </div>
                                    <div className="p-2 space-y-1">
                                      <p className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-snug">
                                        {res.title}
                                      </p>
                                      {res.description && (
                                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                                          {res.description}
                                        </p>
                                      )}
                                      <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 pt-1"
                                      >
                                        <span>{res.type === 'video' ? 'Watch Tutorial' : 'View Visual Guide'}</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sources */}
                          {m.structured.sources_used && m.structured.sources_used.length > 0 && (
                            <div className="pt-2 border-t border-krishi-border/50 text-[10px] text-krishi-muted flex items-center gap-1.5">
                              <BookOpen className="w-3 h-3 text-krishi-text-secondary" />
                              <span>Knowledge Source: <strong>{m.structured.sources_used[0].title}</strong></span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-2xl rounded-tl-xs bg-surface-secondary text-krishi-text px-4 py-3 text-xs border border-krishi-border/60 leading-relaxed shadow-xs">
                          <p className="whitespace-pre-line text-krishi-text leading-relaxed font-normal">{m.text}</p>
                          <span className="text-[10px] text-krishi-muted mt-1.5 block">
                            {m.timestamp}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-secondary/70 border border-krishi-border/60 text-xs text-krishi-text-secondary w-fit animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-krishi-green" />
                  <span>Synthesizing farm telemetry, Pinecone RAG, and Gemini 3 reasoning...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="mt-2 pt-2 border-t border-krishi-border/60 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {presetQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-surface-secondary hover:bg-emerald-50 hover:text-krishi-green hover:border-krishi-green border border-krishi-border text-[11px] font-medium text-krishi-text-secondary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar with Language Selector */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="mt-3 flex items-center gap-2 pt-2"
            >
              {/* In-chat Language Switcher */}
              <div className="relative shrink-0">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="px-2 py-2 rounded-lg border border-krishi-border bg-surface-secondary text-xs font-semibold text-krishi-text outline-none cursor-pointer hover:border-krishi-green"
                  title="AI Response Language"
                >
                  <option value="en">EN</option>
                  <option value="hi">हिन्दी</option>
                  <option value="gu">ગુજરાતી</option>
                </select>
              </div>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={t('askPlaceholder', 'Ask an agricultural question...')}
                className="flex-1 px-3 py-2 rounded-lg border border-krishi-border focus:border-krishi-green focus:ring-1 focus:ring-krishi-green outline-none text-xs"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                {t('send', 'Ask')}
              </Button>
            </form>
          </Card>
        </div>

        {/* RIGHT COLUMN: Live Farm & Field Context (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <FarmContextSidebar weatherData={weatherData} />
        </div>
      </div>
    </div>
  );
};
