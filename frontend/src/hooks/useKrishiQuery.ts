import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Farm, Field, Crop, SoilReading, IrrigationRecord, WeatherData, AIRecommendation } from '../services/api';

// ==========================================
// FARMER & TELEMETRY QUERY HOOKS
// ==========================================

export function useFarms() {
  return useQuery({
    queryKey: ['farms'],
    queryFn: () => api.getFarms(),
  });
}

export function useFarm(id?: string) {
  return useQuery({
    queryKey: ['farm', id],
    queryFn: () => (id ? api.getFarm(id) : Promise.reject('No farm ID')),
    enabled: !!id,
  });
}

export function useFields(farmId?: string) {
  return useQuery({
    queryKey: ['fields', farmId],
    queryFn: () => api.getFields(farmId),
  });
}

export function useField(id?: string) {
  return useQuery({
    queryKey: ['field', id],
    queryFn: () => (id ? api.getField(id) : Promise.reject('No field ID')),
    enabled: !!id,
  });
}

export function useCrops(fieldId?: string) {
  return useQuery({
    queryKey: ['crops', fieldId],
    queryFn: () => api.getCrops(fieldId),
  });
}

export function useSoilReadings(fieldId?: string) {
  return useQuery({
    queryKey: ['soil', fieldId],
    queryFn: () => (fieldId ? api.getSoilReadings(fieldId) : Promise.resolve([])),
    enabled: !!fieldId,
  });
}

export function useIrrigation(fieldId?: string) {
  return useQuery({
    queryKey: ['irrigation', fieldId],
    queryFn: () => (fieldId ? api.getIrrigationRecords(fieldId) : Promise.resolve([])),
    enabled: !!fieldId,
  });
}

export function useWeather(fieldId?: string) {
  return useQuery({
    queryKey: ['weather', fieldId],
    queryFn: () => (fieldId ? api.getWeather(fieldId) : Promise.reject('No field ID')),
    enabled: !!fieldId,
  });
}

export function useRecommendations(fieldId?: string) {
  return useQuery({
    queryKey: ['recommendations', fieldId],
    queryFn: () => api.getRecommendations(fieldId),
  });
}

// ==========================================
// ADVISOR WORKSPACE QUERY HOOKS
// ==========================================

export function useAdvisorStats() {
  return useQuery({
    queryKey: ['advisor', 'dashboard'],
    queryFn: () => api.getAdvisorStats(),
  });
}

export function useAdvisorFarmers(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['advisor', 'farmers', params],
    queryFn: () => api.getAdvisorFarmers(params),
  });
}

export function useAdvisorFarmer(id?: string) {
  return useQuery({
    queryKey: ['advisor', 'farmer', id],
    queryFn: () => (id ? api.getAdvisorFarmer(id) : Promise.reject('No farmer ID')),
    enabled: !!id,
  });
}

export function useAdvisorFarms(search?: string) {
  return useQuery({
    queryKey: ['advisor', 'farms', search],
    queryFn: () => api.getAdvisorFarms(search),
  });
}

export function useAdvisorFarm(id?: string) {
  return useQuery({
    queryKey: ['advisor', 'farm', id],
    queryFn: () => (id ? api.getAdvisorFarm(id) : Promise.reject('No farm ID')),
    enabled: !!id,
  });
}

export function useAdvisorFields(search?: string) {
  return useQuery({
    queryKey: ['advisor', 'fields', search],
    queryFn: () => api.getAdvisorFields(search),
  });
}

export function useAdvisorField(id?: string) {
  return useQuery({
    queryKey: ['advisor', 'field', id],
    queryFn: () => (id ? api.getAdvisorField(id) : Promise.reject('No field ID')),
    enabled: !!id,
  });
}

export function useAdvisorRecommendations(params?: { reviewed?: boolean; confidence?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['advisor', 'recommendations', params],
    queryFn: () => api.getAdvisorRecommendations(params),
  });
}

export function useAdvisorCropAnalyses(params?: { severity?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['advisor', 'crop-analyses', params],
    queryFn: () => api.getAdvisorCropAnalyses(params),
  });
}

export function useAdvisorNotifications() {
  return useQuery({
    queryKey: ['advisor', 'notifications'],
    queryFn: () => api.getAdvisorNotifications(),
  });
}

export function useAdvisorProfile() {
  return useQuery({
    queryKey: ['advisor', 'profile'],
    queryFn: () => api.getAdvisorProfile(),
  });
}

// ==========================================
// ADMIN WORKSPACE QUERY HOOKS
// ==========================================

export function useAdminStatistics() {
  return useQuery({
    queryKey: ['admin', 'statistics'],
    queryFn: () => api.getAdminStats(),
  });
}

export function useAdminUsers(params?: { search?: string; role?: string; is_active?: boolean; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => api.getAdminUsers(params),
  });
}

export function useAdminUser(id?: string) {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => (id ? api.getAdminUser(id) : Promise.reject('No user ID')),
    enabled: !!id,
  });
}

export function useAdminAdvisors() {
  return useQuery({
    queryKey: ['admin', 'advisors'],
    queryFn: () => api.getAdminAdvisors(),
  });
}

export function useAdminFarms(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'farms', params],
    queryFn: () => api.getAdminFarms(params),
  });
}

export function useAdminFields(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'fields', params],
    queryFn: () => api.getAdminFields(params),
  });
}

export function useAdminCrops() {
  return useQuery({
    queryKey: ['admin', 'crops'],
    queryFn: () => api.getAdminCrops(),
  });
}

export function useKnowledgeDocuments(crop?: string) {
  return useQuery({
    queryKey: ['knowledge', crop],
    queryFn: () => api.getKnowledgeDocuments(crop),
  });
}

export function useAdminKnowledge(params?: { search?: string; crop?: string }) {
  return useQuery({
    queryKey: ['admin', 'knowledge', params],
    queryFn: () => api.getAdminKnowledge(params),
  });
}

export function useRagStatistics() {
  return useQuery({
    queryKey: ['admin', 'rag'],
    queryFn: () => api.getRagStats(),
  });
}

export function useAiMonitoring() {
  return useQuery({
    queryKey: ['admin', 'ai-monitoring'],
    queryFn: () => api.getAiMonitoring(),
  });
}

export function useAdminLanguages() {
  return useQuery({
    queryKey: ['admin', 'languages'],
    queryFn: () => api.getAdminLanguages(),
  });
}

export function useAdminNotifications() {
  return useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: () => api.getAdminNotifications(),
  });
}

export function useAdminAuditLogs(params?: { action?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => api.getAdminAuditLogs(params),
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => api.getAdminSettings(),
  });
}
