import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { FarmProvider } from './context/FarmContext';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/public/ForgotPasswordPage';
import { AboutPage, ContactPage, PrivacyPage, TermsPage } from './pages/public/StaticPages';

// Farmer Pages
import { DashboardPage } from './pages/farmer/DashboardPage';
import { FarmsPage, FarmDetailsPage } from './pages/farmer/FarmsPage';
import { CreateEditFarmPage } from './pages/farmer/CreateEditFarmPage';
import { FieldsPage } from './pages/farmer/FieldsPage';
import { FieldDetailsPage } from './pages/farmer/FieldDetailsPage';
import { CreateEditFieldPage } from './pages/farmer/CreateEditFieldPage';
import { CropsPage, CropDetailsPage } from './pages/farmer/CropsPage';
import { CreateEditCropPage } from './pages/farmer/CreateEditCropPage';
import { SoilPage, SoilHistoryPage } from './pages/farmer/SoilPage';
import { WeatherPage } from './pages/farmer/WeatherPage';
import { IrrigationPage, IrrigationHistoryPage } from './pages/farmer/IrrigationPage';
import { AIAdvisorPage } from './pages/farmer/AIAdvisorPage';
import { RecommendationHistoryPage, AIRecommendationDetailsPage } from './pages/farmer/RecommendationPages';
import { CropImageAnalysisPage } from './pages/farmer/CropImageAnalysisPage';
import { ImageAnalysisHistoryPage } from './pages/farmer/ImageAnalysisHistoryPage';
import { NotificationsPage, ProfilePage, SettingsPage } from './pages/farmer/NotificationsProfileSettings';

// Advisor Pages
import {
  AdvisorDashboardPage,
  AdvisorFarmersPage,
  AdvisorFarmerDetailsPage,
  AdvisorFarmsPage,
  AdvisorFarmDetailsPage,
  AdvisorFieldsPage,
  AdvisorFieldDetailsPage,
  AdvisorRecommendationsPage,
  AdvisorCropAnalysisPage,
  AdvisorNotificationsPage,
  AdvisorProfilePage
} from './pages/advisor/AdvisorPages';

// Admin Pages
import {
  AdminDashboardPage,
  AdminUsersPage,
  AdminUserDetailsPage,
  AdminAdvisorsPage,
  AdminFarmsPage,
  AdminFieldsPage,
  AdminCropsPage,
  AdminKnowledgePage,
  AdminRagPage,
  AdminAiMonitoringPage,
  AdminLanguagesPage,
  AdminNotificationsPage,
  AdminAuditLogsPage,
  AdminSettingsPage
} from './pages/admin/AdminPages';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <FarmProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Farmer & Core Application Routes (Protected via Layout) */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Farms */}
                <Route path="/farms" element={<FarmsPage />} />
                <Route path="/farms/create" element={<CreateEditFarmPage />} />
                <Route path="/farms/:id" element={<FarmDetailsPage />} />
                <Route path="/farms/:id/edit" element={<CreateEditFarmPage />} />

                {/* Fields */}
                <Route path="/fields" element={<FieldsPage />} />
                <Route path="/fields/create" element={<CreateEditFieldPage />} />
                <Route path="/fields/:id" element={<FieldDetailsPage />} />
                <Route path="/fields/:id/edit" element={<CreateEditFieldPage />} />

                {/* Crops */}
                <Route path="/crops" element={<CropsPage />} />
                <Route path="/crops/create" element={<CreateEditCropPage />} />
                <Route path="/crops/:id" element={<CropDetailsPage />} />
                <Route path="/crops/:id/edit" element={<CreateEditCropPage />} />

                {/* Soil & Weather & Irrigation */}
                <Route path="/soil" element={<SoilPage />} />
                <Route path="/soil/history" element={<SoilHistoryPage />} />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/irrigation" element={<IrrigationPage />} />
                <Route path="/irrigation/history" element={<IrrigationHistoryPage />} />

                {/* AI & Image Analysis */}
                <Route path="/ai-advisor" element={<AIAdvisorPage />} />
                <Route path="/recommendations" element={<RecommendationHistoryPage />} />
                <Route path="/recommendations/:id" element={<AIRecommendationDetailsPage />} />
                <Route path="/crop-image-analysis" element={<CropImageAnalysisPage />} />
                <Route path="/image-analysis-history" element={<ImageAnalysisHistoryPage />} />

                {/* Account & Profile */}
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Advisor Workspace Routes */}
                <Route path="/advisor/dashboard" element={<AdvisorDashboardPage />} />
                <Route path="/advisor/farmers" element={<AdvisorFarmersPage />} />
                <Route path="/advisor/farmers/:id" element={<AdvisorFarmerDetailsPage />} />
                <Route path="/advisor/farms" element={<AdvisorFarmsPage />} />
                <Route path="/advisor/farms/:id" element={<AdvisorFarmDetailsPage />} />
                <Route path="/advisor/fields" element={<AdvisorFieldsPage />} />
                <Route path="/advisor/fields/:id" element={<AdvisorFieldDetailsPage />} />
                <Route path="/advisor/recommendations" element={<AdvisorRecommendationsPage />} />
                <Route path="/advisor/crop-analysis" element={<AdvisorCropAnalysisPage />} />
                <Route path="/advisor/notifications" element={<AdvisorNotificationsPage />} />
                <Route path="/advisor/profile" element={<AdvisorProfilePage />} />

                {/* Admin Workspace Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/users/:id" element={<AdminUserDetailsPage />} />
                <Route path="/admin/advisors" element={<AdminAdvisorsPage />} />
                <Route path="/admin/farms" element={<AdminFarmsPage />} />
                <Route path="/admin/fields" element={<AdminFieldsPage />} />
                <Route path="/admin/crops" element={<AdminCropsPage />} />
                <Route path="/admin/knowledge" element={<AdminKnowledgePage />} />
                <Route path="/admin/rag" element={<AdminRagPage />} />
                <Route path="/admin/ai-monitoring" element={<AdminAiMonitoringPage />} />
                <Route path="/admin/languages" element={<AdminLanguagesPage />} />
                <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />

              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </FarmProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
