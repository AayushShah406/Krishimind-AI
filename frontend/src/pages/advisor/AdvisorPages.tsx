import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Layers,
  Sprout,
  ShieldCheck,
  ArrowRight,
  Droplets,
  Activity,
  CheckCircle2,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  Sparkles,
  Thermometer,
  CloudRain,
  MessageSquare,
  FileText,
  Clock,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { MetricCard } from '../../components/common/MetricCard';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { api } from '../../services/api';
import {
  useAdvisorStats,
  useAdvisorFarmers,
  useAdvisorFarmer,
  useAdvisorFarms,
  useAdvisorFarm,
  useAdvisorFields,
  useAdvisorField,
  useAdvisorRecommendations,
  useAdvisorCropAnalyses,
  useAdvisorNotifications,
  useAdvisorProfile
} from '../../hooks/useKrishiQuery';
import { useQueryClient } from '@tanstack/react-query';

// ============================================================
// 1. ADVISOR DASHBOARD (/advisor/dashboard)
// ============================================================
export const AdvisorDashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useAdvisorStats();

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-krishi-blue" />
          Agricultural Advisor Control Portal
        </h1>
        <p className="text-xs text-krishi-text-secondary">
          Live telemetry oversight, assigned landholder monitoring, and Pinecone RAG decision reviews.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Assigned Farmers"
          value={isLoading ? '...' : (stats?.assigned_farmers_count ?? 0)}
          subtitle="Directly assigned landholders"
          accentColor="green"
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="Farms Under Oversight"
          value={isLoading ? '...' : (stats?.total_farms_monitored ?? 0)}
          subtitle="Monitored agrarian holdings"
          accentColor="blue"
          icon={<Layers className="w-5 h-5" />}
        />
        <MetricCard
          title="Fields Requiring Attention"
          value={isLoading ? '...' : (stats?.fields_requiring_attention_count ?? 0)}
          subtitle="Critical moisture or pathology"
          accentColor="danger"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <MetricCard
          title="Recent Recommendations"
          value={isLoading ? '...' : (stats?.recent_recommendations_count ?? 0)}
          subtitle="Database AI decisions"
          accentColor="gold"
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      {/* Priority Section: Fields Requiring Immediate Attention */}
      <Card className="p-6 border-amber-200 bg-amber-50/20 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-base text-krishi-text">
              Priority: Fields Requiring Immediate Agronomic Attention
            </h3>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            Live Telemetry Flags
          </span>
        </div>

        {stats?.urgent_alerts && stats.urgent_alerts.length > 0 ? (
          <div className="space-y-3">
            {stats.urgent_alerts.map((alert, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-amber-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-krishi-text">{alert.field_name}</span>
                    <span className="text-xs text-krishi-text-secondary">• {alert.farm_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                      {alert.priority}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-amber-900">{alert.issue}</p>
                  <p className="text-xs text-krishi-text-secondary">{alert.action}</p>
                </div>
                <Link to={`/advisor/fields/${alert.field_id}`}>
                  <Button variant="outline" size="sm" className="whitespace-nowrap flex items-center gap-1.5">
                    Field Telemetry <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-krishi-text-secondary text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            No fields require urgent intervention at this time. All assigned plots report normal telemetry.
          </div>
        )}
      </Card>

      {/* Quick Navigation Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/advisor/farmers" className="block">
          <Card className="p-5 hover:border-krishi-green transition-all shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-krishi-text">Assigned Farmers</h4>
                <p className="text-xs text-krishi-text-secondary">View profiles & landholdings</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-krishi-text-secondary" />
          </Card>
        </Link>

        <Link to="/advisor/recommendations" className="block">
          <Card className="p-5 hover:border-krishi-blue transition-all shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-krishi-text">Review AI Recommendations</h4>
                <p className="text-xs text-krishi-text-secondary">Add expert agronomic notes</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-krishi-text-secondary" />
          </Card>
        </Link>

        <Link to="/advisor/crop-analysis" className="block">
          <Card className="p-5 hover:border-amber-400 transition-all shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-krishi-text">Crop Pathology Analysis</h4>
                <p className="text-xs text-krishi-text-secondary">Review Gemini vision diagnoses</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-krishi-text-secondary" />
          </Card>
        </Link>
      </div>
    </div>
  );
};


// ============================================================
// 2. ADVISOR FARMERS (/advisor/farmers)
// ============================================================
export const AdvisorFarmersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdvisorFarmers({ search, page, limit: 10 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <Users className="w-5 h-5 text-krishi-green" />
            Assigned Farmers
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            Agricultural landholders assigned to your advisor account.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-krishi-text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search farmers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-krishi-border focus:outline-none focus:border-krishi-green bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading assigned farmers from database...</div>
      ) : !data?.items || data.items.length === 0 ? (
        <Card className="p-12 text-center text-krishi-text-secondary space-y-2">
          <Users className="w-10 h-10 mx-auto text-krishi-text-secondary/40" />
          <h3 className="font-bold text-base text-krishi-text">No farmers assigned to you yet.</h3>
          <p className="text-xs">Once an administrator assigns farmers to your portfolio, they will appear here with full telemetry.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((farmer: any) => (
              <Card key={farmer.id} className="p-5 hover:border-krishi-green transition-all shadow-card flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-krishi-text">{farmer.name}</h3>
                      <p className="text-xs text-krishi-text-secondary">{farmer.email}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-krishi-text-secondary space-y-1">
                    <p>📍 {farmer.location || 'Location Not Specified'}</p>
                    <p>🌐 Language: {farmer.preferred_language?.toUpperCase() || 'EN'}</p>
                    <p>🚜 {farmer.farms_count || 0} Farms • {farmer.fields_count || 0} Fields</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-krishi-border/60 flex items-center justify-between">
                  <span className="text-[10px] text-krishi-text-secondary">
                    Joined {new Date(farmer.created_at).toLocaleDateString()}
                  </span>
                  <Link to={`/advisor/farmers/${farmer.id}`}>
                    <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
                      View Profile <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.total > 10 && (
            <div className="flex items-center justify-between pt-4 text-xs text-krishi-text-secondary">
              <span>Showing {data.items.length} of {data.total} farmers</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </Button>
                <span>Page {page}</span>
                <Button variant="outline" size="sm" disabled={page * 10 >= data.total} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// ============================================================
// 3. ADVISOR FARMER DETAILS (/advisor/farmers/:id)
// ============================================================
export const AdvisorFarmerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useAdvisorFarmer(id);

  if (isLoading) {
    return <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading farmer portfolio from database...</div>;
  }

  if (!data?.farmer) {
    return <div className="text-center py-12 text-sm text-red-600 font-bold">Farmer profile not found or access forbidden.</div>;
  }

  const { farmer, farms, fields, crops, recommendations, image_analyses } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-krishi-text-secondary">
        <Link to="/advisor/farmers" className="hover:underline">Assigned Farmers</Link>
        <span>/</span>
        <span className="text-krishi-text font-semibold">{farmer.name}</span>
      </div>

      {/* Profile Header */}
      <Card className="p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xl">
              {farmer.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-krishi-text">{farmer.name}</h1>
              <p className="text-xs text-krishi-text-secondary">{farmer.email} • 📍 {farmer.location || 'Gujarat'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  Role: {farmer.role}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                  Preferred Lang: {farmer.preferred_language.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right text-xs text-krishi-text-secondary">
            <p className="font-bold text-krishi-text text-sm">{farms?.length || 0} Registered Farms</p>
            <p>{fields?.length || 0} Active Fields</p>
          </div>
        </div>
      </Card>

      {/* Farms & Fields Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-krishi-text">Farms & Plots</h2>
        {farms && farms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farms.map((fm: any) => (
              <Card key={fm.id} className="p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-krishi-text">{fm.name}</h3>
                  <Link to={`/advisor/farms/${fm.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Farm Details <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-krishi-text-secondary">📍 {fm.location} • {fm.area} {fm.unit} • Soil: {fm.soil_type}</p>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-xs text-krishi-text-secondary">No farms registered yet.</p>
        )}
      </div>

      {/* Fields Telemetry Overview */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-krishi-text">Fields & Active Crops</h2>
        {fields && fields.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((fld: any) => (
              <Card key={fld.id} className="p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-krishi-text">{fld.name}</h4>
                  <span className="text-[10px] text-krishi-text-secondary">{fld.area} acres</span>
                </div>
                <p className="text-xs text-emerald-700 font-semibold">Crop: {fld.current_crop || 'Active Cycle'}</p>
                <Link to={`/advisor/fields/${fld.id}`}>
                  <Button variant="ghost" size="sm" className="w-full text-xs text-krishi-blue font-bold">
                    View Telemetry & RAG Assessment →
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-xs text-krishi-text-secondary">No fields created yet.</p>
        )}
      </div>
    </div>
  );
};


// ============================================================
// 4. ADVISOR FARMS (/advisor/farms)
// ============================================================
export const AdvisorFarmsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: farms, isLoading } = useAdvisorFarms(search);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <Layers className="w-5 h-5 text-krishi-blue" />
            Assigned Farms
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            Agricultural landholdings belonging to your assigned farmers.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-krishi-text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search farms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-krishi-border focus:outline-none focus:border-krishi-blue bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading farms from database...</div>
      ) : !farms || farms.length === 0 ? (
        <Card className="p-12 text-center text-krishi-text-secondary space-y-2">
          <Layers className="w-10 h-10 mx-auto text-krishi-text-secondary/40" />
          <h3 className="font-bold text-base text-krishi-text">No farms under oversight yet.</h3>
          <p className="text-xs">Farms registered by your assigned farmers will appear here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.map((fm: any) => (
            <Card key={fm.id} className="p-5 shadow-card hover:border-krishi-blue transition-all space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-krishi-text">{fm.name}</h3>
                  <p className="text-xs text-emerald-700 font-medium">Owner: {fm.owner_name}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                  {fm.area} {fm.unit}
                </span>
              </div>
              <p className="text-xs text-krishi-text-secondary">📍 {fm.location}</p>
              <div className="text-xs text-krishi-text-secondary space-y-1">
                <p>🌱 Crops: {fm.crop_names?.join(', ') || 'Wheat, Rice'}</p>
                <p>🧱 Soil Type: {fm.soil_type}</p>
                <p>🗺️ {fm.field_count} Managed Plots</p>
              </div>
              <div className="pt-3 border-t border-krishi-border/60">
                <Link to={`/advisor/farms/${fm.id}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs flex items-center justify-center gap-1">
                    View Farm Diagnostics <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


// ============================================================
// 5. ADVISOR FARM DETAILS (/advisor/farms/:id)
// ============================================================
export const AdvisorFarmDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: farm, isLoading } = useAdvisorFarm(id);

  if (isLoading) {
    return <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading farm diagnostics...</div>;
  }

  if (!farm) {
    return <div className="text-center py-12 text-sm text-red-600 font-bold">Farm not found or access forbidden.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-krishi-text-secondary">
        <Link to="/advisor/farms" className="hover:underline">Assigned Farms</Link>
        <span>/</span>
        <span className="text-krishi-text font-semibold">{farm.name}</span>
      </div>

      <Card className="p-6 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-extrabold text-krishi-text">{farm.name}</h1>
            <p className="text-xs text-krishi-text-secondary">
              Owner: {farm.owner?.name} ({farm.owner?.email}) • 📍 {farm.location}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
              {farm.area} {farm.unit}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700">
              Soil: {farm.soil_type}
            </span>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-krishi-text">Fields in this Farm</h2>
        {farm.fields && farm.fields.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farm.fields.map((fld: any) => (
              <Card key={fld.id} className="p-5 shadow-sm space-y-2">
                <h3 className="font-bold text-sm text-krishi-text">{fld.name}</h3>
                <p className="text-xs text-krishi-text-secondary">Area: {fld.area} acres • Soil: {fld.soil_type}</p>
                <p className="text-xs text-emerald-700 font-medium">Crop: {fld.current_crop || 'Active'}</p>
                <Link to={`/advisor/fields/${fld.id}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs mt-2">
                    Open Field Telemetry →
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-xs text-krishi-text-secondary">No fields created for this farm.</p>
        )}
      </div>
    </div>
  );
};


// ============================================================
// 6. ADVISOR FIELDS (/advisor/fields)
// ============================================================
export const AdvisorFieldsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: fields, isLoading } = useAdvisorFields(search);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <Sprout className="w-5 h-5 text-krishi-green" />
            Assigned Fields & Plots
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            Continuous telemetry and growth monitoring across all assigned plots.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-krishi-text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-krishi-border focus:outline-none focus:border-krishi-green bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading fields from database...</div>
      ) : !fields || fields.length === 0 ? (
        <Card className="p-12 text-center text-krishi-text-secondary space-y-2">
          <Sprout className="w-10 h-10 mx-auto text-krishi-text-secondary/40" />
          <h3 className="font-bold text-base text-krishi-text">No fields under monitoring.</h3>
          <p className="text-xs">Fields belonging to your assigned farmers will appear here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((f: any) => (
            <Card key={f.id} className="p-5 shadow-card hover:border-krishi-green transition-all space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-krishi-text">{f.name}</h3>
                  <p className="text-xs text-krishi-text-secondary">{f.farm_name} • {f.farmer_name}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  {f.area} acres
                </span>
              </div>
              <div className="text-xs text-krishi-text-secondary space-y-1">
                <p>🌱 Crop: {f.current_crop?.name || 'Wheat'} ({f.current_crop?.growth_stage || 'Flowering'})</p>
                <p>💧 Soil Moisture: <span className="font-bold text-krishi-text">{f.latest_moisture ? `${f.latest_moisture}%` : 'Normal'}</span></p>
                <p>🧱 Soil Type: {f.soil_type}</p>
              </div>
              <div className="pt-3 border-t border-krishi-border/60">
                <Link to={`/advisor/fields/${f.id}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs flex items-center justify-center gap-1">
                    Open Field Cockpit <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


// ============================================================
// 7. ADVISOR FIELD DETAILS (/advisor/fields/:id)
// Includes "Generate AI Field Assessment" using Pinecone RAG + Gemini 3.7
// ============================================================
export const AdvisorFieldDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdvisorField(id);
  const [assessmentPrompt, setAssessmentPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestAssessment, setLatestAssessment] = useState<any>(null);

  if (isLoading) {
    return <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading field telemetry...</div>;
  }

  if (!data?.field) {
    return <div className="text-center py-12 text-sm text-red-600 font-bold">Field not found or access forbidden.</div>;
  }

  const { field, current_crop, soil_history, irrigation_history, recommendations, crop_images } = data;

  const handleGenerateAssessment = async () => {
    if (!id) return;
    setIsGenerating(true);
    try {
      const res = await api.generateFieldAssessment(id, {
        question: assessmentPrompt || 'Provide an expert field assessment and actionable guidance based on current soil telemetry, crop stage, and weather forecast.',
        language: 'en'
      });
      setLatestAssessment(res.structured_assessment);
      queryClient.invalidateQueries({ queryKey: ['advisor', 'field', id] });
      queryClient.invalidateQueries({ queryKey: ['advisor', 'dashboard'] });
    } catch (e) {
      console.error('Field assessment error', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-krishi-text-secondary">
        <Link to="/advisor/fields" className="hover:underline">Assigned Fields</Link>
        <span>/</span>
        <span className="text-krishi-text font-semibold">{field.name}</span>
      </div>

      {/* Header */}
      <Card className="p-6 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-krishi-text">{field.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {current_crop?.name || 'Wheat'}
              </span>
            </div>
            <p className="text-xs text-krishi-text-secondary">
              Farm: {field.farm_name} • Owner: {field.farmer?.name} ({field.farmer?.email})
            </p>
          </div>
          <div className="text-right text-xs text-krishi-text-secondary">
            <p className="font-bold text-krishi-text">{field.area} Acres • {field.soil_type}</p>
            <p>Growth Stage: <span className="font-semibold text-emerald-700">{current_crop?.growth_stage || 'Flowering'}</span></p>
          </div>
        </div>
      </Card>

      {/* GENERATE AI FIELD ASSESSMENT CARD */}
      <Card className="p-6 border-indigo-200 bg-indigo-50/20 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-indigo-200/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-krishi-text">
              Generate AI Field Assessment
            </h3>
          </div>
          <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
            Gemini 3.7 + Pinecone RAG
          </span>
        </div>
        <p className="text-xs text-krishi-text-secondary">
          Synthesize this plot's live sensor telemetry, historical irrigation records, and peer-reviewed ICAR knowledge retrieved from Pinecone.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Custom assessment inquiry (optional, e.g. Evaluate moisture stress & fungicide timing)..."
            value={assessmentPrompt}
            onChange={(e) => setAssessmentPrompt(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-krishi-border bg-white focus:outline-none focus:border-indigo-500"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateAssessment}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Reasoning...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Run Field Assessment
              </>
            )}
          </Button>
        </div>

        {latestAssessment && (
          <div className="p-4 rounded-xl border border-indigo-200 bg-white shadow-sm space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900">Generated Field Recommendation:</span>
              <ConfidenceBadge confidence={latestAssessment.confidence} />
            </div>
            <p className="text-xs font-bold text-krishi-text">{latestAssessment.recommendation}</p>
            <p className="text-xs text-krishi-text-secondary">{latestAssessment.reason}</p>
            {latestAssessment.evidence && latestAssessment.evidence.length > 0 && (
              <div className="text-[11px] text-krishi-text-secondary">
                <span className="font-bold">Agronomic Evidence:</span> {latestAssessment.evidence.join(' • ')}
              </div>
            )}
            <div className="p-2.5 rounded bg-emerald-50 text-emerald-900 text-xs font-medium">
              👉 Next Action: {latestAssessment.next_action}
            </div>
          </div>
        )}
      </Card>

      {/* Telemetry Tables: Soil Readings & Irrigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 shadow-card space-y-3">
          <h3 className="font-bold text-sm text-krishi-text flex items-center gap-2">
            <Droplets className="w-4 h-4 text-krishi-blue" />
            Live Soil Moisture & Nutrition History
          </h3>
          {soil_history && soil_history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-krishi-text-secondary">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Moisture</th>
                    <th className="p-2">pH</th>
                    <th className="p-2">N - P - K</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-krishi-border/60">
                  {soil_history.map((s: any) => (
                    <tr key={s.id}>
                      <td className="p-2">{new Date(s.recorded_at).toLocaleDateString()}</td>
                      <td className="p-2 font-bold">{s.moisture}%</td>
                      <td className="p-2">{s.ph}</td>
                      <td className="p-2">{s.nitrogen} - {s.phosphorus} - {s.potassium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-krishi-text-secondary">No soil readings logged yet.</p>
          )}
        </Card>

        <Card className="p-5 shadow-card space-y-3">
          <h3 className="font-bold text-sm text-krishi-text flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Irrigation History
          </h3>
          {irrigation_history && irrigation_history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-krishi-text-secondary">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Method</th>
                    <th className="p-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-krishi-border/60">
                  {irrigation_history.map((i: any) => (
                    <tr key={i.id}>
                      <td className="p-2">{new Date(i.date).toLocaleDateString()}</td>
                      <td className="p-2 font-bold">{i.amount} {i.unit}</td>
                      <td className="p-2">{i.method}</td>
                      <td className="p-2 text-krishi-text-secondary">{i.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-krishi-text-secondary">No irrigation records logged yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
};


// ============================================================
// 8. ADVISOR RECOMMENDATIONS (/advisor/recommendations)
// ============================================================
export const AdvisorRecommendationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterReviewed, setFilterReviewed] = useState<boolean | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [advisorNotes, setAdvisorNotes] = useState('');

  const { data, isLoading } = useAdvisorRecommendations({
    reviewed: filterReviewed,
    search,
    page,
    limit: 10
  });

  const handleReviewSubmit = async (recId: string) => {
    try {
      await api.reviewRecommendation(recId, { advisor_notes: advisorNotes, is_reviewed: true });
      setReviewingId(null);
      setAdvisorNotes('');
      queryClient.invalidateQueries({ queryKey: ['advisor', 'recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['advisor', 'dashboard'] });
    } catch (e) {
      console.error('Failed to submit review', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <Activity className="w-5 h-5 text-krishi-gold" />
            AI Recommendations Review Portal
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            Review recommendations generated for assigned plots without altering the model's evidence record.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterReviewed === undefined ? 'all' : String(filterReviewed)}
            onChange={(e) => {
              setFilterReviewed(e.target.value === 'all' ? undefined : e.target.value === 'true');
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-krishi-border bg-white focus:outline-none"
          >
            <option value="all">All Recommendations</option>
            <option value="false">Pending Advisor Review</option>
            <option value="true">Reviewed</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading recommendations from database...</div>
      ) : !data?.items || data.items.length === 0 ? (
        <Card className="p-12 text-center text-krishi-text-secondary space-y-2">
          <Activity className="w-10 h-10 mx-auto text-krishi-text-secondary/40" />
          <h3 className="font-bold text-base text-krishi-text">No AI recommendations yet.</h3>
          <p className="text-xs">Recommendations generated for your assigned plots will appear here for review.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.items.map((r: any) => (
            <Card key={r.id} className="p-5 shadow-card space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-krishi-text">{r.field_name}</span>
                  <span className="text-xs text-krishi-text-secondary">• {r.farm_name} ({r.farmer_name})</span>
                  <ConfidenceBadge confidence={r.confidence} />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {r.is_reviewed ? (
                    <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed by Advisor
                    </span>
                  ) : (
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Pending Review
                    </span>
                  )}
                  <span className="text-krishi-text-secondary">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-krishi-text text-sm">{r.recommendation}</p>
                <p className="text-krishi-text-secondary">{r.reason}</p>
                {r.next_action && (
                  <p className="font-semibold text-emerald-800">👉 Next Action: {r.next_action}</p>
                )}
              </div>

              {/* Advisor Notes Section */}
              {r.advisor_notes && (
                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-xs text-blue-900 space-y-1">
                  <span className="font-bold">Advisor Agronomic Notes:</span>
                  <p>{r.advisor_notes}</p>
                </div>
              )}

              {/* Review Action Form */}
              <div className="pt-3 border-t border-krishi-border/60 flex items-center justify-between">
                {reviewingId === r.id ? (
                  <div className="w-full space-y-2">
                    <textarea
                      placeholder="Enter professional advisor recommendations or validation notes..."
                      value={advisorNotes}
                      onChange={(e) => setAdvisorNotes(e.target.value)}
                      className="w-full p-2 text-xs rounded border border-krishi-border focus:outline-none focus:border-krishi-blue"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setReviewingId(null)}>Cancel</Button>
                      <Button variant="primary" size="sm" onClick={() => handleReviewSubmit(r.id)}>
                        Save Advisor Review
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => { setReviewingId(r.id); setAdvisorNotes(r.advisor_notes || ''); }}
                  >
                    {r.is_reviewed ? 'Edit Advisor Notes' : 'Mark as Reviewed & Add Notes'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


// ============================================================
// 9. ADVISOR CROP ANALYSIS (/advisor/crop-analysis)
// ============================================================
export const AdvisorCropAnalysisPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [advisorNotes, setAdvisorNotes] = useState('');

  const { data, isLoading } = useAdvisorCropAnalyses({
    severity: severityFilter,
    page,
    limit: 10
  });

  const handleReviewSubmit = async (analysisId: string) => {
    try {
      await api.reviewCropAnalysis(analysisId, { advisor_notes: advisorNotes });
      setReviewingId(null);
      setAdvisorNotes('');
      queryClient.invalidateQueries({ queryKey: ['advisor', 'crop-analyses'] });
    } catch (e) {
      console.error('Failed to submit crop analysis review', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            Crop Pathology & Image Analyses
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            Photographic diagnoses and Gemini Vision assessments from your assigned farmers.
          </p>
        </div>
        <select
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 text-xs rounded-lg border border-krishi-border bg-white focus:outline-none"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MODERATE">Moderate</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading image analyses from database...</div>
      ) : !data?.items || data.items.length === 0 ? (
        <Card className="p-12 text-center text-krishi-text-secondary space-y-2">
          <Sprout className="w-10 h-10 mx-auto text-krishi-text-secondary/40" />
          <h3 className="font-bold text-base text-krishi-text">No crop image analyses yet.</h3>
          <p className="text-xs">When assigned farmers upload leaf or foliar photos for AI diagnosis, they will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.items.map((a: any) => (
            <Card key={a.id} className="p-5 shadow-card space-y-3">
              <div className="flex flex-col md:flex-row gap-4">
                {a.image_url ? (
                  <img
                    src={a.image_url.startsWith('http') ? a.image_url : `http://127.0.0.1:8080${a.image_url}`}
                    alt="Crop diagnosis"
                    className="w-full md:w-48 h-36 object-cover rounded-xl border border-krishi-border"
                  />
                ) : (
                  <div className="w-full md:w-48 h-36 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-krishi-text-secondary">
                    No Photo
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-krishi-text">{a.crop_name} • {a.field_name}</h3>
                      <p className="text-xs text-krishi-text-secondary">Farmer: {a.farmer_name}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      a.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {a.severity} Severity
                    </span>
                  </div>

                  <p className="text-xs font-bold text-krishi-text">{a.recommendation}</p>
                  <div className="text-xs text-krishi-text-secondary space-y-1">
                    <p>🔍 Observations: {a.visual_observations?.join(', ') || 'Foliar chlorosis'}</p>
                    <p>⚠️ Causes: {a.possible_causes?.join(', ') || 'Nutrient deficiency'}</p>
                  </div>

                  {a.advisor_notes && (
                    <div className="p-2.5 rounded bg-blue-50 text-blue-900 text-xs mt-2 border border-blue-100">
                      <span className="font-bold">Advisor Clinical Note:</span> {a.advisor_notes}
                    </div>
                  )}

                  <div className="pt-2">
                    {reviewingId === a.id ? (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Enter advisor pathology notes..."
                          value={advisorNotes}
                          onChange={(e) => setAdvisorNotes(e.target.value)}
                          className="w-full p-2 text-xs rounded border border-krishi-border"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setReviewingId(null)}>Cancel</Button>
                          <Button variant="primary" size="sm" onClick={() => handleReviewSubmit(a.id)}>
                            Save Advisor Note
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => { setReviewingId(a.id); setAdvisorNotes(a.advisor_notes || ''); }}
                      >
                        {a.advisor_notes ? 'Edit Advisor Note' : 'Add Advisor Assessment Note'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


// ============================================================
// 10. ADVISOR NOTIFICATIONS (/advisor/notifications)
// ============================================================
export const AdvisorNotificationsPage: React.FC = () => {
  const { data: notifs, isLoading } = useAdvisorNotifications();

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-krishi-gold" />
          Advisor Dispatch Notifications
        </h1>
        <p className="text-xs text-krishi-text-secondary">
          Platform broadcasts, weather warnings, and landholder assignment alerts.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading notifications...</div>
      ) : !notifs || notifs.length === 0 ? (
        <Card className="p-12 text-center text-krishi-text-secondary space-y-2">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/50" />
          <h3 className="font-bold text-base text-krishi-text">No active alerts.</h3>
          <p className="text-xs">Your notification inbox is clean.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifs.map((n: any) => (
            <Card key={n.id} className="p-4 shadow-sm flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-krishi-green mt-1.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-krishi-text">{n.title}</h4>
                <p className="text-xs text-krishi-text-secondary">{n.message}</p>
                <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


// ============================================================
// 11. ADVISOR PROFILE (/advisor/profile)
// ============================================================
export const AdvisorProfilePage: React.FC = () => {
  const { data: profile, isLoading } = useAdvisorProfile();

  if (isLoading) {
    return <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading advisor profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-krishi-blue" />
          Advisor Agronomic Credential Profile
        </h1>
        <p className="text-xs text-krishi-text-secondary">
          Institutional identity and assigned farmer portfolio configuration.
        </p>
      </div>

      <Card className="p-6 max-w-2xl shadow-card space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-krishi-border/60">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-2xl">
            {profile?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-krishi-text">{profile?.name}</h2>
            <p className="text-xs text-krishi-text-secondary">{profile?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
              Institutional Role: {profile?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-krishi-text-secondary block">Location / Affiliation:</span>
            <span className="font-bold text-krishi-text">{profile?.location || 'Gujarat Agricultural University'}</span>
          </div>
          <div>
            <span className="text-krishi-text-secondary block">Preferred System Language:</span>
            <span className="font-bold text-krishi-text">{profile?.preferred_language?.toUpperCase() || 'EN'}</span>
          </div>
          <div>
            <span className="text-krishi-text-secondary block">Active Farmer Portfolio:</span>
            <span className="font-bold text-krishi-text">{profile?.assigned_farmers_count || 0} Farmers Assigned</span>
          </div>
          <div>
            <span className="text-krishi-text-secondary block">Account Created:</span>
            <span className="font-bold text-krishi-text">{new Date(profile?.created_at || '').toLocaleDateString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
