const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://127.0.0.1:8080/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'FARMER' | 'ADVISOR' | 'ADMIN';
  preferred_language: 'en' | 'hi' | 'gu';
  location?: string;
  is_active: boolean;
  created_at: string;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  location: string;
  area: number;
  unit: string;
  soil_type: string;
  latitude?: number;
  longitude?: number;
  state?: string;
  district?: string;
  city?: string;
  description?: string;
  created_at: string;
  field_count?: number;
  crop_names?: string[];
  latest_recommendation?: string;
}

export interface Field {
  id: string;
  farm_id: string;
  name: string;
  area: number;
  soil_type: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  created_at: string;
  current_crop?: {
    id: string;
    name: string;
    variety: string;
    growth_stage: string;
    planting_date: string;
  };
  latest_soil?: {
    moisture?: number;
    ph?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    soil_temperature?: number;
    soil_type?: string;
  };
  latest_weather?: {
    temperature?: number;
    humidity?: number;
    rainfall?: number;
    rain_probability?: number;
  };
}

export interface Crop {
  id: string;
  field_id: string;
  name: string;
  variety: string;
  planting_date: string;
  expected_harvest_date?: string;
  growth_stage: string;
  irrigation_method?: string;
  notes?: string;
  status: string;
  created_at: string;
  field_name?: string;
}

export interface SoilReading {
  id: string;
  field_id: string;
  moisture?: number;
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  soil_temperature?: number;
  electrical_conductivity?: number;
  organic_carbon?: number;
  soil_type?: string;
  notes?: string;
  source?: 'manual' | 'soil_report' | 'sensor' | 'external_estimate';
  recorded_at: string;
}

export interface SoilReportExtraction {
  filename: string;
  extracted: {
    ph?: number | null;
    nitrogen?: number | null;
    phosphorus?: number | null;
    potassium?: number | null;
    electrical_conductivity?: number | null;
    organic_carbon?: number | null;
    moisture?: number | null;
    soil_temperature?: number | null;
    soil_type?: string | null;
    lab_name?: string | null;
    notes?: string | null;
  };
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  raw_summary: string;
  verification_notice: string;
}

export interface IrrigationRecord {
  id: string;
  field_id: string;
  date: string;
  amount: number;
  unit: string;
  method: string;
  notes?: string;
  created_at: string;
}

export interface WeatherData {
  field_id?: string;
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  rain_probability: number;
  wind_speed: number;
  weather_condition: string;
  forecast_24h: Array<{ time: string; temperature: number; rain_probability: number }>;
  forecast_7d: Array<{ date: string; max_temp: number; min_temp: number; rainfall_sum: number; rain_probability: number }>;
  agricultural_interpretation: string;
}

export interface AIMediaResource {
  type: 'video' | 'image';
  title: string;
  url: string;
  thumbnail_url?: string;
  description?: string;
}

export interface AIStructuredResponse {
  recommendation: string;
  reason: string;
  evidence: string[];
  data_used: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  next_action: string;
  warnings: string[];
  language: string;
  sources_used?: Array<{ title: string; source: string; language: string }>;
  detailed_guide?: string[];
  media_resources?: AIMediaResource[];
}

export interface AIRecommendation {
  id: string;
  field_id: string;
  type: string;
  recommendation: string;
  reason: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence?: string[];
  data_used?: string[];
  next_action?: string;
  warnings?: string[];
  language?: string;
  created_at: string;
  field_name?: string;
  crop_name?: string;
}

export interface ImageAnalysis {
  id: string;
  image_id: string;
  image_url: string;
  crop_detected?: string;
  visual_observations: string[];
  possible_causes: string[];
  possible_disease?: string;
  possible_pest_damage?: string;
  possible_nutrient_deficiency?: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  recommendation: string;
  recommended_next_steps?: string[];
  prevention_measures?: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  is_confirmed_diagnosis?: boolean;
  diagnosis_disclaimer?: string;
  retrieved_knowledge?: Array<{ title?: string; content?: string; source?: string; score?: number }>;
  conversation_history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  evidence?: string[];
  additional_information_needed?: string[];
  language: string;
  created_at: string;
  crop_name?: string;
  field_name?: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  description?: string;
  source: string;
  document_type: string;
  crop?: string;
  region?: string;
  language: string;
  status: string;
  chunk_count: number;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_farmers: number;
  total_advisors: number;
  active_farms: number;
  total_fields: number;
  total_crops: number;
  ai_recommendations_count: number;
  image_analyses_count: number;
  knowledge_documents_count: number;
  rag_chunks_indexed: number;
  system_health: string;
}

export interface AdvisorStats {
  assigned_farmers_count: number;
  total_farms_monitored: number;
  fields_requiring_attention_count: number;
  recent_recommendations_count: number;
  urgent_alerts: Array<{
    field_id: string;
    field_name: string;
    farm_name: string;
    issue: string;
    priority: string;
    action: string;
  }>;
}

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('krishi_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Login failed');
    return res.json();
  },

  async register(data: { name: string; email: string; password: string; role?: string; preferred_language?: string; location?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Registration failed');
    return res.json();
  },

  async getMe(authToken?: string): Promise<User> {
    const token = authToken || localStorage.getItem('krishi_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers,
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async updateLanguage(language: string) {
    const res = await fetch(`${API_BASE}/users/preferences/language`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ language }),
    });
    return res.json();
  },

  // Farms
  async getFarms(): Promise<Farm[]> {
    const res = await fetch(`${API_BASE}/farms`, { headers: getHeaders() });
    return res.json();
  },

  async getFarm(id: string): Promise<Farm> {
    const res = await fetch(`${API_BASE}/farms/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async createFarm(data: { name: string; location: string; area: number; unit?: string; soil_type: string }): Promise<Farm> {
    const res = await fetch(`${API_BASE}/farms`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateFarm(id: string, data: Partial<Farm>): Promise<Farm> {
    const res = await fetch(`${API_BASE}/farms/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteFarm(id: string) {
    return fetch(`${API_BASE}/farms/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  // Fields
  async getFields(farmId?: string): Promise<Field[]> {
    const url = farmId ? `${API_BASE}/fields?farm_id=${farmId}` : `${API_BASE}/fields`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  async getField(id: string): Promise<Field> {
    const res = await fetch(`${API_BASE}/fields/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async createField(data: { farm_id: string; name: string; area: number; soil_type: string; location?: string }): Promise<Field> {
    const res = await fetch(`${API_BASE}/fields`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateField(id: string, data: Partial<Field>): Promise<Field> {
    const res = await fetch(`${API_BASE}/fields/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteField(id: string) {
    return fetch(`${API_BASE}/fields/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  // Crops
  async getCrops(fieldId?: string): Promise<Crop[]> {
    const url = fieldId ? `${API_BASE}/crops?field_id=${fieldId}` : `${API_BASE}/crops`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  async getCrop(id: string): Promise<Crop> {
    const res = await fetch(`${API_BASE}/crops/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async createCrop(data: {
    field_id: string;
    name: string;
    variety: string;
    planting_date: string;
    expected_harvest_date?: string;
    growth_stage: string;
    irrigation_method?: string;
    notes?: string;
  }): Promise<Crop> {
    const res = await fetch(`${API_BASE}/crops`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateCrop(id: string, data: Partial<Crop>): Promise<Crop> {
    const res = await fetch(`${API_BASE}/crops/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteCrop(id: string) {
    return fetch(`${API_BASE}/crops/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  // Soil
  async getSoilReadings(fieldId: string): Promise<SoilReading[]> {
    const res = await fetch(`${API_BASE}/soil/${fieldId}`, { headers: getHeaders() });
    return res.json();
  },

  async createSoilReading(data: {
    field_id: string;
    moisture?: number;
    ph?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    soil_temperature?: number;
    electrical_conductivity?: number;
    organic_carbon?: number;
    soil_type?: string;
    notes?: string;
    source?: 'manual' | 'soil_report' | 'sensor' | 'external_estimate';
    recorded_at?: string;
  }): Promise<SoilReading> {
    const res = await fetch(`${API_BASE}/soil`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async extractSoilReport(formData: FormData): Promise<SoilReportExtraction> {
    const token = localStorage.getItem('krishi_token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/soil/extract-report`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Failed to extract soil report');
    }
    return res.json();
  },

  async deleteSoilReading(id: string) {
    return fetch(`${API_BASE}/soil/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  async sendIotSensorReading(data: {
    field_id: string;
    device_id?: string;
    moisture?: number;
    soil_temperature?: number;
    ph?: number;
    electrical_conductivity?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
  }): Promise<SoilReading> {
    const res = await fetch(`${API_BASE}/soil/iot/reading`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Irrigation
  async getIrrigationRecords(fieldId: string): Promise<IrrigationRecord[]> {
    const res = await fetch(`${API_BASE}/irrigation/${fieldId}`, { headers: getHeaders() });
    return res.json();
  },

  async createIrrigationRecord(data: { field_id: string; amount: number; method: string; unit?: string; notes?: string }): Promise<IrrigationRecord> {
    const res = await fetch(`${API_BASE}/irrigation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Weather
  async getWeather(fieldId: string): Promise<WeatherData> {
    const res = await fetch(`${API_BASE}/weather/${fieldId}`, { headers: getHeaders() });
    if (!res.ok) {
      throw new Error(`Weather fetch failed: ${res.status}`);
    }
    return res.json();
  },

  // AI Decision Engine
  async askAI(data: { field_id?: string; farm_id?: string; question: string; language?: string }): Promise<AIStructuredResponse> {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getConversations() {
    const res = await fetch(`${API_BASE}/ai/conversations`, { headers: getHeaders() });
    return res.json();
  },

  async getRecommendations(fieldId?: string): Promise<AIRecommendation[]> {
    const url = fieldId ? `${API_BASE}/ai/recommendations?field_id=${fieldId}` : `${API_BASE}/ai/recommendations`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  async getRecommendationDetails(id: string): Promise<AIRecommendation> {
    const res = await fetch(`${API_BASE}/ai/recommendations/${id}`, { headers: getHeaders() });
    return res.json();
  },

  // Image Analysis
  async uploadImage(formData: FormData) {
    const token = localStorage.getItem('krishi_token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/images/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  async analyzeImage(imageId: string, language: string = 'en'): Promise<ImageAnalysis> {
    const res = await fetch(`${API_BASE}/images/${imageId}/analyze?language=${language}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async askImageFollowUp(imageId: string, question: string, language: string = 'en'): Promise<{
    answer: string;
    language: string;
    sources_used: any[];
    conversation_history: Array<{ role: 'user' | 'assistant'; content: string }>;
  }> {
    const res = await fetch(`${API_BASE}/images/${imageId}/conversation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question, language }),
    });
    return res.json();
  },

  async getAllAnalyses(): Promise<ImageAnalysis[]> {
    const res = await fetch(`${API_BASE}/images`, { headers: getHeaders() });
    return res.json();
  },

  // Knowledge & RAG
  async getKnowledgeDocuments(crop?: string): Promise<KnowledgeDocument[]> {
    const url = crop ? `${API_BASE}/knowledge?crop=${crop}` : `${API_BASE}/knowledge`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  async uploadKnowledgeDocument(formData: FormData): Promise<KnowledgeDocument> {
    const token = localStorage.getItem('krishi_token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/knowledge/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/dashboard`, { headers: getHeaders() });
    return res.json();
  },

  async getAdminUsers(params?: { search?: string; role?: string; is_active?: boolean; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role) query.append('role', params.role);
    if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/admin/users?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async getAdminUser(id: string) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async toggleUserStatus(id: string) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  async changeUserRole(id: string, role: string) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  async getAdminAdvisors() {
    const res = await fetch(`${API_BASE}/admin/advisors`, { headers: getHeaders() });
    return res.json();
  },

  async assignAdvisor(data: { advisor_id: string; farmer_id: string; farm_id?: string; field_id?: string; notes?: string }) {
    const res = await fetch(`${API_BASE}/admin/advisors/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async removeAdvisorAssignment(id: string) {
    const res = await fetch(`${API_BASE}/admin/advisors/assign/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAdminFarms(params?: { search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/admin/farms?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async getAdminFields(params?: { search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/admin/fields?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async getAdminCrops() {
    const res = await fetch(`${API_BASE}/admin/crops`, { headers: getHeaders() });
    return res.json();
  },

  async createAdminCrop(data: any) {
    const res = await fetch(`${API_BASE}/admin/crops`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateAdminCrop(id: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/crops/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAdminKnowledge(params?: { search?: string; crop?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.crop) query.append('crop', params.crop);
    const res = await fetch(`${API_BASE}/admin/knowledge?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async reindexKnowledgeDocument(id: string) {
    const res = await fetch(`${API_BASE}/knowledge/${id}/reindex`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async deleteKnowledgeDocument(id: string) {
    const res = await fetch(`${API_BASE}/knowledge/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getRagStats() {
    const res = await fetch(`${API_BASE}/admin/rag`, { headers: getHeaders() });
    return res.json();
  },

  async getAiMonitoring() {
    const res = await fetch(`${API_BASE}/admin/ai-monitoring`, { headers: getHeaders() });
    return res.json();
  },

  async getAdminLanguages() {
    const res = await fetch(`${API_BASE}/admin/languages`, { headers: getHeaders() });
    return res.json();
  },

  async getAdminNotifications() {
    const res = await fetch(`${API_BASE}/admin/notifications`, { headers: getHeaders() });
    return res.json();
  },

  async createAdminNotification(data: { title: string; message: string; type?: string; user_id?: string; language?: string }) {
    const res = await fetch(`${API_BASE}/admin/notifications`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAdminAuditLogs(params?: { action?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.action) query.append('action', params.action);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/admin/audit-logs?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async getAdminSettings() {
    const res = await fetch(`${API_BASE}/admin/settings`, { headers: getHeaders() });
    return res.json();
  },

  // Advisor Workspace
  async getAdvisorStats(): Promise<AdvisorStats> {
    const res = await fetch(`${API_BASE}/advisor/dashboard`, { headers: getHeaders() });
    return res.json();
  },

  async getAdvisorFarmers(params?: { search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/advisor/farmers?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async getAdvisorFarmer(id: string) {
    const res = await fetch(`${API_BASE}/advisor/farmers/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async getAdvisorFarms(search?: string) {
    const url = search ? `${API_BASE}/advisor/farms?search=${encodeURIComponent(search)}` : `${API_BASE}/advisor/farms`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  async getAdvisorFarm(id: string) {
    const res = await fetch(`${API_BASE}/advisor/farms/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async getAdvisorFields(search?: string) {
    const url = search ? `${API_BASE}/advisor/fields?search=${encodeURIComponent(search)}` : `${API_BASE}/advisor/fields`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  async getAdvisorField(id: string) {
    const res = await fetch(`${API_BASE}/advisor/fields/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async generateFieldAssessment(id: string, data?: { question?: string; language?: string }) {
    const res = await fetch(`${API_BASE}/advisor/fields/${id}/assessment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data || {}),
    });
    return res.json();
  },

  async getAdvisorRecommendations(params?: { reviewed?: boolean; confidence?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.reviewed !== undefined) query.append('reviewed', String(params.reviewed));
    if (params?.confidence) query.append('confidence', params.confidence);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/advisor/recommendations?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async reviewRecommendation(id: string, data: { advisor_notes: string; is_reviewed?: boolean }) {
    const res = await fetch(`${API_BASE}/advisor/recommendations/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAdvisorCropAnalyses(params?: { severity?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/advisor/crop-analysis?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async reviewCropAnalysis(id: string, data: { advisor_notes: string }) {
    const res = await fetch(`${API_BASE}/advisor/crop-analysis/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAdvisorNotifications() {
    const res = await fetch(`${API_BASE}/advisor/notifications`, { headers: getHeaders() });
    return res.json();
  },

  async getAdvisorProfile() {
    const res = await fetch(`${API_BASE}/advisor/profile`, { headers: getHeaders() });
    return res.json();
  },
};

