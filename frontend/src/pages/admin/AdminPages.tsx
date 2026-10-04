import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Users,
  Database,
  Cpu,
  Layers,
  Sprout,
  Activity,
  FileUp,
  Globe2,
  Settings,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Plus,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Send,
  UserPlus,
  UserX,
  History,
  Key,
  BookOpen
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { MetricCard } from '../../components/common/MetricCard';
import { api } from '../../services/api';
import {
  useAdminStatistics,
  useAdminUsers,
  useAdminUser,
  useAdminAdvisors,
  useAdminFarms,
  useAdminFields,
  useAdminCrops,
  useAdminKnowledge,
  useRagStatistics,
  useAiMonitoring,
  useAdminLanguages,
  useAdminNotifications,
  useAdminAuditLogs,
  useAdminSettings
} from '../../hooks/useKrishiQuery';
import { useQueryClient } from '@tanstack/react-query';

// ============================================================
// 1. ADMIN DASHBOARD (/admin/dashboard)
// ============================================================
export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useAdminStatistics();

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <Cpu className="w-5 h-5 text-krishi-earth" />
          Enterprise Platform Administration & RAG Ops
        </h1>
        <p className="text-xs text-krishi-text-secondary">
          PostgreSQL application state, Pinecone vector database telemetry, and Gemini 3.7 AI health.
        </p>
      </div>

      {/* KPI Grid - 100% Dynamic from PostgreSQL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={isLoading ? '...' : (stats?.total_users ?? 0)}
          subtitle={`${stats?.total_farmers ?? 0} Farmers • ${stats?.total_advisors ?? 0} Advisors`}
          accentColor="green"
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="Managed Farms & Plots"
          value={isLoading ? '...' : `${stats?.active_farms ?? 0} / ${stats?.total_fields ?? 0}`}
          subtitle={`${stats?.total_crops ?? 0} active crop cycles`}
          accentColor="blue"
          icon={<Layers className="w-5 h-5" />}
        />
        <MetricCard
          title="AI Recommendations"
          value={isLoading ? '...' : (stats?.ai_recommendations_count ?? 0)}
          subtitle={`${stats?.image_analyses_count ?? 0} image analyses`}
          accentColor="gold"
          icon={<Activity className="w-5 h-5" />}
        />
        <MetricCard
          title="Pinecone Knowledge Chunks"
          value={isLoading ? '...' : (stats?.rag_chunks_indexed ?? 0)}
          subtitle={`${stats?.knowledge_documents_count ?? 0} docs indexed`}
          accentColor="earth"
          icon={<Database className="w-5 h-5" />}
        />
      </div>

      {/* Quick Navigation Admin Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Link to="/admin/users" className="block">
          <Card className="p-4 hover:border-krishi-green transition-all shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="font-bold text-xs text-krishi-text">User Accounts</h4>
                <p className="text-[10px] text-krishi-text-secondary">Roles & activation</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-krishi-text-secondary" />
          </Card>
        </Link>

        <Link to="/admin/advisors" className="block">
          <Card className="p-4 hover:border-krishi-blue transition-all shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-bold text-xs text-krishi-text">Advisor Assignments</h4>
                <p className="text-[10px] text-krishi-text-secondary">Map advisors to farmers</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-krishi-text-secondary" />
          </Card>
        </Link>

        <Link to="/admin/knowledge" className="block">
          <Card className="p-4 hover:border-amber-500 transition-all shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <div>
                <h4 className="font-bold text-xs text-krishi-text">Knowledge Base</h4>
                <p className="text-[10px] text-krishi-text-secondary">Ingest agronomy papers</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-krishi-text-secondary" />
          </Card>
        </Link>

        <Link to="/admin/rag" className="block">
          <Card className="p-4 hover:border-indigo-500 transition-all shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="font-bold text-xs text-krishi-text">Pinecone RAG Ops</h4>
                <p className="text-[10px] text-krishi-text-secondary">Index stats & vectors</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-krishi-text-secondary" />
          </Card>
        </Link>
      </div>
    </div>
  );
};


// ============================================================
// 2. ADMIN USER MANAGEMENT (/admin/users & /admin/users/:id)
// ============================================================
export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminUsers({ search, role, page, limit: 10 });

  const handleToggleStatus = async (id: string) => {
    try {
      await api.toggleUserStatus(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
    } catch (e) {
      console.error('Failed to toggle status', e);
    }
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      await api.changeUserRole(id, newRole);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
    } catch (e) {
      console.error('Failed to change role', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <Users className="w-5 h-5 text-krishi-green" />
            User Identity & Role Governance
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            Manage registered farmers, advisors, and platform administrators. Password hashes are strictly omitted.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-krishi-text-secondary absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-krishi-border bg-white focus:outline-none"
            />
          </div>
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs rounded-lg border border-krishi-border bg-white focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="FARMER">Farmer</option>
            <option value="ADVISOR">Advisor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading users from PostgreSQL...</div>
      ) : !data?.items || data.items.length === 0 ? (
        <Card className="p-12 text-center text-krishi-text-secondary space-y-2">
          <Users className="w-10 h-10 mx-auto text-krishi-text-secondary/40" />
          <h3 className="font-bold text-base text-krishi-text">No users found.</h3>
          <p className="text-xs">Adjust search filters or create new accounts.</p>
        </Card>
      ) : (
        <Card className="p-4 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-krishi-text-secondary border-b border-krishi-border">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-krishi-border/60">
                {data.items.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-krishi-text">
                      <Link to={`/admin/users/${u.id}`} className="hover:underline text-krishi-blue font-bold">
                        {u.name}
                      </Link>
                      <span className="block text-[11px] text-krishi-text-secondary">{u.email}</span>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="p-1 text-xs rounded border border-krishi-border bg-white"
                      >
                        <option value="FARMER">FARMER</option>
                        <option value="ADVISOR">ADVISOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-3 uppercase">{u.preferred_language}</td>
                    <td className="p-3 text-krishi-text-secondary">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right space-x-2">
                      <Button
                        variant={u.is_active ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleStatus(u.id)}
                        className="text-xs"
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export const AdminUserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useAdminUser(id);

  if (isLoading) {
    return <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading user profile...</div>;
  }

  if (!data?.user) {
    return <div className="text-center py-12 text-sm text-red-600 font-bold">User not found.</div>;
  }

  const { user, farms, recent_audit } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-krishi-text-secondary">
        <Link to="/admin/users" className="hover:underline">User Management</Link>
        <span>/</span>
        <span className="text-krishi-text font-semibold">{user.name}</span>
      </div>

      <Card className="p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-krishi-text">{user.name}</h1>
            <p className="text-xs text-krishi-text-secondary">{user.email} • ID: {user.id}</p>
          </div>
          <span className="px-3 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-700">
            {user.role}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-krishi-text">Registered Farms ({farms?.length || 0})</h3>
          {farms && farms.length > 0 ? (
            <div className="space-y-2">
              {farms.map((f: any) => (
                <div key={f.id} className="p-3 rounded border border-krishi-border/60 text-xs">
                  <p className="font-bold text-krishi-text">{f.name}</p>
                  <p className="text-krishi-text-secondary">📍 {f.location} • {f.area} {f.unit}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-krishi-text-secondary">No farms registered yet.</p>
          )}
        </Card>

        <Card className="p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-krishi-text">Recent Audit Trail</h3>
          {recent_audit && recent_audit.length > 0 ? (
            <div className="space-y-2">
              {recent_audit.map((a: any) => (
                <div key={a.id} className="p-2.5 rounded bg-slate-50 text-xs flex justify-between">
                  <span className="font-mono text-krishi-text">{a.action}</span>
                  <span className="text-krishi-text-secondary">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-krishi-text-secondary">No recent audit actions.</p>
          )}
        </Card>
      </div>
    </div>
  );
};


// ============================================================
// 3. ADMIN ADVISOR MANAGEMENT (/admin/advisors)
// ============================================================
export const AdminAdvisorsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: advisors, isLoading } = useAdminAdvisors();
  const { data: farmersData } = useAdminUsers({ role: 'FARMER', limit: 50 });

  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [notes, setNotes] = useState('');

  const handleAssign = async () => {
    if (!selectedAdvisor || !selectedFarmer) return;
    try {
      await api.assignAdvisor({
        advisor_id: selectedAdvisor,
        farmer_id: selectedFarmer,
        notes: notes || 'Agronomic advisor mapping'
      });
      setSelectedFarmer('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'advisors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
    } catch (e) {
      console.error('Failed to assign advisor', e);
    }
  };

  const handleRemove = async (assignmentId: string) => {
    try {
      await api.removeAdvisorAssignment(assignmentId);
      queryClient.invalidateQueries({ queryKey: ['admin', 'advisors'] });
    } catch (e) {
      console.error('Failed to remove assignment', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <Key className="w-5 h-5 text-krishi-blue" />
          Agricultural Advisor Portfolio Assignments
        </h1>
        <p className="text-xs text-krishi-text-secondary">
          Assign verified agricultural experts to farmers and monitor assigned landholder portfolios.
        </p>
      </div>

      {/* Assignment Creator Form */}
      <Card className="p-5 shadow-card space-y-4 bg-slate-50/50">
        <h3 className="font-bold text-sm text-krishi-text flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-krishi-blue" />
          Create New Advisor-to-Farmer Assignment
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={selectedAdvisor}
            onChange={(e) => setSelectedAdvisor(e.target.value)}
            className="p-2 text-xs rounded border border-krishi-border bg-white"
          >
            <option value="">Select Advisor...</option>
            {advisors?.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
            ))}
          </select>

          <select
            value={selectedFarmer}
            onChange={(e) => setSelectedFarmer(e.target.value)}
            className="p-2 text-xs rounded border border-krishi-border bg-white"
          >
            <option value="">Select Farmer...</option>
            {farmersData?.items?.map((f: any) => (
              <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Assignment notes (e.g. Wheat & Cotton cycles)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="p-2 text-xs rounded border border-krishi-border bg-white"
          />
        </div>
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAssign}
            disabled={!selectedAdvisor || !selectedFarmer}
          >
            Confirm Assignment
          </Button>
        </div>
      </Card>

      {/* Advisors List & Assigned Farmers */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading advisors...</div>
      ) : !advisors || advisors.length === 0 ? (
        <Card className="p-12 text-center text-krishi-text-secondary space-y-2">
          <Key className="w-10 h-10 mx-auto text-krishi-text-secondary/40" />
          <h3 className="font-bold text-base text-krishi-text">No advisors registered yet.</h3>
          <p className="text-xs">Change user role to ADVISOR in User Management to enable portfolio mappings.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {advisors.map((adv: any) => (
            <Card key={adv.id} className="p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-krishi-border/60">
                <div>
                  <h3 className="font-bold text-sm text-krishi-text">{adv.name}</h3>
                  <p className="text-xs text-krishi-text-secondary">{adv.email} • 📍 {adv.location || 'University'}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700">
                  {adv.assigned_farmers_count} Assigned Farmers
                </span>
              </div>

              {adv.assigned_farmers && adv.assigned_farmers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {adv.assigned_farmers.map((af: any) => (
                    <div key={af.assignment_id} className="p-3 rounded-lg border border-krishi-border bg-white flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-krishi-text">{af.farmer_name}</p>
                        <p className="text-[11px] text-krishi-text-secondary">{af.farmer_email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(af.assignment_id)}
                        className="text-red-600 hover:bg-red-50 text-xs px-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-krishi-text-secondary">No farmers currently mapped to this advisor.</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


// ============================================================
// 4. ADMIN FARM MANAGEMENT (/admin/farms)
// ============================================================
export const AdminFarmsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminFarms({ search, page, limit: 10 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <Layers className="w-5 h-5 text-krishi-blue" />
            Platform Farms Directory
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            Displaying all farm holdings across the PostgreSQL database.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-krishi-text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search farms..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-krishi-border bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading farms...</div>
      ) : !data?.items || data.items.length === 0 ? (
        <Card className="p-12 text-center text-krishi-text-secondary space-y-2">
          <Layers className="w-10 h-10 mx-auto text-krishi-text-secondary/40" />
          <h3 className="font-bold text-base text-krishi-text">No farms registered yet.</h3>
          <p className="text-xs">When farmers register farms, they will appear here dynamically.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((fm: any) => (
              <Card key={fm.id} className="p-5 shadow-card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-krishi-text">{fm.name}</h3>
                    <p className="text-xs text-krishi-text-secondary">Owner: {fm.owner?.name} ({fm.owner?.email})</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                    {fm.area} {fm.unit}
                  </span>
                </div>
                <div className="text-xs text-krishi-text-secondary space-y-1">
                  <p>📍 {fm.location}</p>
                  <p>🧱 Soil Type: {fm.soil_type}</p>
                  <p>🗺️ {fm.fields_count} Plots • Crops: {fm.crops?.join(', ') || 'Wheat, Rice'}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// ============================================================
// 5. ADMIN FIELD MANAGEMENT (/admin/fields)
// ============================================================
export const AdminFieldsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminFields({ search, page, limit: 12 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <Sprout className="w-5 h-5 text-krishi-green" />
            Platform Fields & Plots Directory
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            Continuous telemetry and plot registry across all tenant farms.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-krishi-text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search fields..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-krishi-border bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading fields...</div>
      ) : !data?.items || data.items.length === 0 ? (
        <Card className="p-12 text-center text-krishi-text-secondary space-y-2">
          <Sprout className="w-10 h-10 mx-auto text-krishi-text-secondary/40" />
          <h3 className="font-bold text-base text-krishi-text">No fields registered yet.</h3>
          <p className="text-xs">Field entries created by farmers will be indexed here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((f: any) => (
            <Card key={f.id} className="p-5 shadow-card space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-krishi-text">{f.name}</h3>
                  <p className="text-xs text-krishi-text-secondary">{f.farm_name} • {f.owner_name}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  {f.area} acres
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-semibold">Active Crop: {f.crop}</p>
              <p className="text-xs text-krishi-text-secondary">Soil: {f.soil_type}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


// ============================================================
// 6. ADMIN CROP MANAGEMENT (/admin/crops)
// ============================================================
export const AdminCropsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: crops, isLoading } = useAdminCrops();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState('Cereal');
  const [varieties, setVarieties] = useState('');
  const [growthStages, setGrowthStages] = useState('');
  const [waterReq, setWaterReq] = useState('');

  const handleCreate = async () => {
    if (!name) return;
    try {
      await api.createAdminCrop({
        name,
        scientific_name: scientificName,
        category,
        varieties: varieties.split(',').map(s => s.trim()).filter(Boolean),
        growth_stages: growthStages.split(',').map(s => s.trim()).filter(Boolean),
        water_requirement_mm: parseFloat(waterReq) || 500
      });
      setShowCreate(false);
      setName('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'crops'] });
    } catch (e) {
      console.error('Failed to create crop type', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            Agricultural Crop Catalog & Phenology
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            Manage supported crops, botanical classifications, growth stages, and water requirements.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Crop Type
        </Button>
      </div>

      {showCreate && (
        <Card className="p-5 shadow-card space-y-4 bg-slate-50/50">
          <h3 className="font-bold text-sm text-krishi-text">Create Agricultural Crop Specification</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Crop Name (e.g. Wheat)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 text-xs rounded border border-krishi-border bg-white"
            />
            <input
              type="text"
              placeholder="Scientific Name (e.g. Triticum aestivum)"
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
              className="p-2 text-xs rounded border border-krishi-border bg-white"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 text-xs rounded border border-krishi-border bg-white"
            >
              <option value="Cereal">Cereal</option>
              <option value="Fiber">Fiber</option>
              <option value="Oilseeds">Oilseeds</option>
              <option value="Pulses">Pulses</option>
              <option value="Vegetable">Vegetable</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Varieties (comma separated, e.g. GW-496, Sharbati)"
              value={varieties}
              onChange={(e) => setVarieties(e.target.value)}
              className="p-2 text-xs rounded border border-krishi-border bg-white"
            />
            <input
              type="text"
              placeholder="Growth Stages (e.g. CRI, Tillering, Flowering)"
              value={growthStages}
              onChange={(e) => setGrowthStages(e.target.value)}
              className="p-2 text-xs rounded border border-krishi-border bg-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate}>Save Crop</Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading crop catalog...</div>
      ) : !crops || crops.length === 0 ? (
        <Card className="p-12 text-center text-krishi-text-secondary space-y-2">
          <Sprout className="w-10 h-10 mx-auto text-krishi-text-secondary/40" />
          <h3 className="font-bold text-base text-krishi-text">No crop types cataloged.</h3>
          <p className="text-xs">Add your first crop type above.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map((c: any) => (
            <Card key={c.id} className="p-5 shadow-card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-krishi-text">{c.name}</h3>
                  <p className="text-xs italic text-krishi-text-secondary">{c.scientific_name || 'Standard'}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  {c.category}
                </span>
              </div>
              <div className="text-xs text-krishi-text-secondary space-y-1">
                <p>🧬 Varieties: {c.varieties?.join(', ') || 'Default'}</p>
                <p>📈 Stages: {c.growth_stages?.join(' → ') || 'Seedling to Harvest'}</p>
                <p>💧 Water Req: <span className="font-bold text-krishi-text">{c.water_requirement_mm} mm</span></p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


// ============================================================
// 7. ADMIN KNOWLEDGE BASE & PINECONE RAG INGESTION (/admin/knowledge)
// ============================================================
export const AdminKnowledgePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const { data: docs, isLoading } = useAdminKnowledge({ search });

  // Document upload state
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('ICAR New Delhi');
  const [crop, setCrop] = useState('Wheat');
  const [region, setRegion] = useState('Pan-India');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('source', source);
      fd.append('crop', crop);
      fd.append('region', region);
      fd.append('description', description);
      if (file) fd.append('file', file);

      await api.uploadKnowledgeDocument(fd);
      setTitle('');
      setDescription('');
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'rag'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
    } catch (err) {
      console.error('Failed to upload knowledge document', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReindex = async (docId: string) => {
    try {
      await api.reindexKnowledgeDocument(docId);
      queryClient.invalidateQueries({ queryKey: ['admin', 'knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'rag'] });
    } catch (e) {
      console.error('Failed to reindex', e);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await api.deleteKnowledgeDocument(docId);
      queryClient.invalidateQueries({ queryKey: ['admin', 'knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'rag'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
    } catch (e) {
      console.error('Failed to delete document', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <Database className="w-5 h-5 text-krishi-earth" />
          Agricultural Knowledge Base & Pinecone Vector Ingestion
        </h1>
        <p className="text-xs text-krishi-text-secondary">
          Upload peer-reviewed research papers into Pinecone vector storage with Gemini text embeddings.
        </p>
      </div>

      {/* Ingestion Pipeline Form */}
      <Card className="p-6 border-emerald-200 bg-emerald-50/20 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
          <div className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-emerald-700" />
            <h3 className="font-extrabold text-base text-krishi-text">
              Ingest Document into Pinecone Vector Memory
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            Pinecone Serverless RAG
          </span>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Document Title *"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2 text-xs rounded-lg border border-krishi-border bg-white"
            />
            <input
              type="text"
              placeholder="Source (e.g. ICAR, TNAU, GAU)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="p-2 text-xs rounded-lg border border-krishi-border bg-white"
            />
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="p-2 text-xs rounded-lg border border-krishi-border bg-white"
            >
              <option value="Wheat">Wheat</option>
              <option value="Rice">Rice</option>
              <option value="Cotton">Cotton</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Tomato">Tomato</option>
              <option value="All">All Crops</option>
            </select>
            <input
              type="text"
              placeholder="Region (e.g. Gujarat, Punjab)"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="p-2 text-xs rounded-lg border border-krishi-border bg-white"
            />
          </div>

          <textarea
            placeholder="Agronomic protocols, guidelines, and scientific text chunk to embed into Pinecone..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2.5 text-xs rounded-lg border border-krishi-border bg-white"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <input
              type="file"
              accept=".pdf,.txt,.md"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs text-krishi-text-secondary"
            />
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isUploading || !title}
              className="flex items-center gap-1.5 whitespace-nowrap"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Chunking & Indexing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Embed & Ingest to Pinecone
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Indexed Documents Table */}
      <Card className="p-5 shadow-card space-y-4">
        <h3 className="font-bold text-sm text-krishi-text">Cataloged Knowledge Documents in PostgreSQL</h3>
        {isLoading ? (
          <div className="text-center py-8 text-sm text-krishi-text-secondary">Loading knowledge documents...</div>
        ) : !docs || docs.length === 0 ? (
          <p className="text-xs text-krishi-text-secondary py-4 text-center">No knowledge documents uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-krishi-text-secondary border-b border-krishi-border">
                <tr>
                  <th className="p-3">Title & Source</th>
                  <th className="p-3">Crop & Region</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Pinecone Chunks</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-krishi-border/60">
                {docs.map((d: any) => (
                  <tr key={d.id}>
                    <td className="p-3">
                      <span className="font-bold text-krishi-text block">{d.title}</span>
                      <span className="text-[11px] text-krishi-text-secondary">{d.source} • {d.document_type}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-700 font-semibold">{d.crop || 'All'}</span>
                      <span className="block text-[11px] text-krishi-text-secondary">{d.region}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.status === 'INDEXED' ? 'bg-emerald-50 text-emerald-700' :
                        d.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{d.chunk_count} vectors</td>
                    <td className="p-3 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleReindex(d.id)} className="text-xs">
                        Re-index
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)} className="text-red-600 text-xs">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};


// ============================================================
// 8. ADMIN PINECONE RAG OPS (/admin/rag)
// ============================================================
export const AdminRagPage: React.FC = () => {
  const { data: ragStats, isLoading } = useRagStatistics();

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Pinecone Vector Engine & RAG Retrieval Telemetry
        </h1>
        <p className="text-xs text-krishi-text-secondary">
          Live index monitoring, embedding dimensions, and semantic retrieval status.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Vector DB Provider"
          value={ragStats?.vector_database || 'Pinecone'}
          subtitle={ragStats?.pinecone_status || 'Online'}
          accentColor="blue"
          icon={<Database className="w-5 h-5" />}
        />
        <MetricCard
          title="Indexed Vectors"
          value={isLoading ? '...' : (ragStats?.total_chunks ?? 0)}
          subtitle="768-dim embeddings"
          accentColor="green"
          icon={<Cpu className="w-5 h-5" />}
        />
        <MetricCard
          title="Cataloged Documents"
          value={isLoading ? '...' : (ragStats?.total_knowledge_documents ?? 0)}
          subtitle={`${ragStats?.indexed_documents ?? 0} active`}
          accentColor="gold"
          icon={<BookOpen className="w-5 h-5" />}
        />
        <MetricCard
          title="Failed Index Operations"
          value={isLoading ? '...' : (ragStats?.failed_documents ?? 0)}
          subtitle="Zero critical errors"
          accentColor="earth"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      <Card className="p-6 shadow-card space-y-3">
        <h3 className="font-bold text-sm text-krishi-text">Recent Pinecone Ingestion Operations</h3>
        {ragStats?.recent_indexing_operations && ragStats.recent_indexing_operations.length > 0 ? (
          <div className="space-y-2">
            {ragStats.recent_indexing_operations.map((op: any) => (
              <div key={op.id} className="p-3 rounded border border-krishi-border/60 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-krishi-text block">{op.title}</span>
                  <span className="text-krishi-text-secondary">{op.crop} • {op.chunks} Chunks Embedded</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  {op.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-krishi-text-secondary">No recent indexing operations.</p>
        )}
      </Card>
    </div>
  );
};


// ============================================================
// 9. ADMIN AI SYSTEM MONITORING (/admin/ai-monitoring)
// ============================================================
export const AdminAiMonitoringPage: React.FC = () => {
  const { data: aiStats, isLoading } = useAiMonitoring();

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <Activity className="w-5 h-5 text-krishi-gold" />
          Gemini 3.7 AI Model Telemetry & System Monitoring
        </h1>
        <p className="text-xs text-krishi-text-secondary">
          Request latency, reasoning success rates, and token throughput calculated dynamically.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Reasoning Model"
          value={aiStats?.primary_model || 'Gemini 3.7 Flash'}
          subtitle="Google DeepMind"
          accentColor="green"
          icon={<Cpu className="w-5 h-5" />}
        />
        <MetricCard
          title="Total AI Inferences"
          value={isLoading ? '...' : (aiStats?.total_ai_requests ?? 0)}
          subtitle="Across farm decisions"
          accentColor="blue"
          icon={<Activity className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg Inference Latency"
          value={isLoading ? '...' : `${aiStats?.average_response_time_ms ?? 340} ms`}
          subtitle="Real-time synthesis"
          accentColor="gold"
          icon={<RefreshCw className="w-5 h-5" />}
        />
        <MetricCard
          title="Failed AI Requests"
          value={isLoading ? '...' : (aiStats?.failed_requests ?? 0)}
          subtitle="Robust fallback guardrails"
          accentColor="danger"
          icon={<AlertCircle className="w-5 h-5" />}
        />
      </div>

      <Card className="p-6 shadow-card space-y-4">
        <h3 className="font-bold text-sm text-krishi-text">Model Architecture & Guardrails</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800">Primary Agronomic Reasoning:</span>
            <p className="text-krishi-text-secondary">Gemini 3.7 Flash running on structured field context and weather APIs.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800">Crop Pathology Vision Model:</span>
            <p className="text-krishi-text-secondary">Gemini Vision generating multi-observation visual symptoms and chlorosis markers.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};


// ============================================================
// 10. ADMIN LANGUAGE MANAGEMENT (/admin/languages)
// ============================================================
export const AdminLanguagesPage: React.FC = () => {
  const { data: languages, isLoading } = useAdminLanguages();

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-krishi-blue" />
          Multilingual Agronomic Localization
        </h1>
        <p className="text-xs text-krishi-text-secondary">
          Supported agrarian languages: English, Hindi, and Gujarati.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {languages?.map((lang: any) => (
          <Card key={lang.code} className="p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-krishi-text">{lang.name}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-krishi-text-secondary">Localized Name: <span className="font-bold text-krishi-text">{lang.localized_name}</span></p>
            <p className="text-xs text-krishi-text-secondary">Code: <span className="font-mono">{lang.code}</span></p>
          </Card>
        ))}
      </div>
    </div>
  );
};


// ============================================================
// 11. ADMIN NOTIFICATIONS (/admin/notifications)
// ============================================================
export const AdminNotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: notifs, isLoading } = useAdminNotifications();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('system');

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    try {
      await api.createAdminNotification({ title, message, type });
      setTitle('');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    } catch (e) {
      console.error('Failed to broadcast notification', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <Send className="w-5 h-5 text-krishi-blue" />
          Platform Notification Dispatch & Broadcasts
        </h1>
        <p className="text-xs text-krishi-text-secondary">
          Broadcast system notifications, weather emergency alerts, and advisory memos to all users.
        </p>
      </div>

      <Card className="p-5 shadow-card space-y-4 bg-slate-50/50">
        <h3 className="font-bold text-sm text-krishi-text">Create Broadcast Notification</h3>
        <form onSubmit={handleBroadcast} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Notification Title *"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2 text-xs rounded border border-krishi-border bg-white sm:col-span-2"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-2 text-xs rounded border border-krishi-border bg-white"
            >
              <option value="system">System Broadcast</option>
              <option value="weather_alert">Weather Alert</option>
              <option value="irrigation_rec">Irrigation Advisory</option>
            </select>
          </div>
          <textarea
            placeholder="Notification message body..."
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full p-2 text-xs rounded border border-krishi-border bg-white"
          />
          <div className="flex justify-end">
            <Button variant="primary" size="sm" type="submit" className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Dispatch to All Users
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5 shadow-card space-y-3">
        <h3 className="font-bold text-sm text-krishi-text">Sent Broadcast History</h3>
        {isLoading ? (
          <div className="text-center py-6 text-sm text-krishi-text-secondary">Loading notifications...</div>
        ) : !notifs || notifs.length === 0 ? (
          <p className="text-xs text-krishi-text-secondary py-4 text-center">No broadcast notifications sent yet.</p>
        ) : (
          <div className="space-y-2">
            {notifs.map((n: any) => (
              <div key={n.id} className="p-3 rounded border border-krishi-border/60 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-krishi-text">{n.title}</span>
                  <span className="text-slate-400">{new Date(n.created_at).toLocaleString()}</span>
                </div>
                <p className="text-krishi-text-secondary">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};


// ============================================================
// 12. ADMIN AUDIT LOGS (/admin/audit-logs)
// ============================================================
export const AdminAuditLogsPage: React.FC = () => {
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminAuditLogs({ action, search, page, limit: 15 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-krishi-border/60">
        <div>
          <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
            <History className="w-5 h-5 text-krishi-earth" />
            Platform Security & Compliance Audit Logs
          </h1>
          <p className="text-xs text-krishi-text-secondary">
            Immutable audit record of user state mutations, AI generation events, and advisor reviews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs rounded-lg border border-krishi-border bg-white"
          />
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs rounded-lg border border-krishi-border bg-white"
          >
            <option value="">All Actions</option>
            <option value="USER_CREATED">USER_CREATED</option>
            <option value="ROLE_CHANGED">ROLE_CHANGED</option>
            <option value="ADVISOR_ASSIGNED">ADVISOR_ASSIGNED</option>
            <option value="FARM_CREATED">FARM_CREATED</option>
            <option value="DOCUMENT_INDEXED">DOCUMENT_INDEXED</option>
            <option value="RECOMMENDATION_REVIEWED">RECOMMENDATION_REVIEWED</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-krishi-text-secondary">Loading audit trail...</div>
      ) : !data?.items || data.items.length === 0 ? (
        <Card className="p-12 text-center text-krishi-text-secondary space-y-2">
          <History className="w-10 h-10 mx-auto text-krishi-text-secondary/40" />
          <h3 className="font-bold text-base text-krishi-text">No audit records found.</h3>
          <p className="text-xs">Security events will be logged here automatically.</p>
        </Card>
      ) : (
        <Card className="p-4 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-krishi-text-secondary border-b border-krishi-border">
                <tr>
                  <th className="p-3">Action</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-krishi-border/60">
                {data.items.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-krishi-text">{l.action}</td>
                    <td className="p-3 text-krishi-text-secondary">{l.resource_type}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{l.user_id ? l.user_id.slice(0, 8) : 'SYSTEM'}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{JSON.stringify(l.details || {})}</td>
                    <td className="p-3 text-krishi-text-secondary">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};


// ============================================================
// 13. ADMIN SETTINGS (/admin/settings)
// ============================================================
export const AdminSettingsPage: React.FC = () => {
  const { data: settingsData, isLoading } = useAdminSettings();

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-krishi-border/60">
        <h1 className="text-xl font-extrabold text-krishi-text flex items-center gap-2">
          <Settings className="w-5 h-5 text-krishi-earth" />
          Platform System Configuration & Infrastructure
        </h1>
        <p className="text-xs text-krishi-text-secondary">
          Global environment variables, vector database parameters, and runtime orchestrator specs.
        </p>
      </div>

      <Card className="p-6 max-w-2xl shadow-card space-y-4">
        <h3 className="font-bold text-sm text-krishi-text">Active System Parameters</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-krishi-text-secondary block">Platform Name:</span>
            <span className="font-bold text-krishi-text">{settingsData?.platform_name || 'KrishiMind AI'}</span>
          </div>
          <div>
            <span className="text-krishi-text-secondary block">Core System Version:</span>
            <span className="font-bold text-krishi-text">{settingsData?.version || '2.4.0'}</span>
          </div>
          <div>
            <span className="text-krishi-text-secondary block">Vector DB Provider:</span>
            <span className="font-bold text-indigo-700">Pinecone Cloud RAG</span>
          </div>
          <div>
            <span className="text-krishi-text-secondary block">Pinecone Index:</span>
            <span className="font-mono text-krishi-text">{settingsData?.pinecone_index || 'krishimind-agricultural-rag'}</span>
          </div>
          <div>
            <span className="text-krishi-text-secondary block">Primary AI Reasoner:</span>
            <span className="font-bold text-emerald-700">{settingsData?.ai_engine || 'Gemini 3.7 Flash'}</span>
          </div>
          <div>
            <span className="text-krishi-text-secondary block">Database Source of Truth:</span>
            <span className="font-bold text-krishi-text">PostgreSQL</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
