/**
 * Admin Dashboard Component
 * User management, invite codes, and platform statistics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, Key, BarChart3, Plus, Search, Filter, RefreshCw,
  ChevronLeft, ChevronRight, Copy, Check, Trash2, Edit2,
  AlertCircle, Loader2, ArrowLeft, Shield, CreditCard,
  TrendingUp, UserPlus, Calendar, Download, Eye, EyeOff,
  Activity, Settings, LogOut
} from 'lucide-react';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function AdminDashboard({ onBack }) {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard stats
  const [stats, setStats] = useState(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPagination, setUsersPagination] = useState({});
  const [usersSearch, setUsersSearch] = useState('');
  const [usersFilter, setUsersFilter] = useState('all');

  // Invite codes state
  const [inviteCodes, setInviteCodes] = useState([]);
  const [codesPage, setCodesPage] = useState(1);
  const [codesPagination, setCodesPagination] = useState({});
  const [codesFilter, setCodesFilter] = useState('all');

  // Modals
  const [showCreateCode, setShowCreateCode] = useState(false);
  const [showAddCredits, setShowAddCredits] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // New code form
  const [newCode, setNewCode] = useState({
    name: '',
    customCode: '',
    maxUses: 1,
    bonusCredits: 5,
    type: 'beta',
    expiresAt: ''
  });

  // Credits form
  const [creditsAmount, setCreditsAmount] = useState(10);
  const [creditsReason, setCreditsReason] = useState('');

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [token]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: usersPage,
        limit: 10,
        search: usersSearch,
        status: usersFilter
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setUsersPagination(data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [token, usersPage, usersSearch, usersFilter]);

  // Fetch invite codes
  const fetchInviteCodes = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: codesPage,
        limit: 10,
        status: codesFilter
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/invite-codes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setInviteCodes(data.data.codes);
        setCodesPagination(data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch invite codes:', err);
    }
  }, [token, codesPage, codesFilter]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchInviteCodes()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchUsers, fetchInviteCodes]);

  // Create invite code
  const handleCreateCode = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/invite-codes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newCode.name || undefined,
          code: newCode.customCode || undefined,
          maxUses: newCode.maxUses,
          bonusCredits: newCode.bonusCredits,
          type: newCode.type,
          expiresAt: newCode.expiresAt || undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateCode(false);
        setNewCode({ name: '', customCode: '', maxUses: 1, bonusCredits: 5, type: 'beta', expiresAt: '' });
        fetchInviteCodes();
        fetchStats();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create invite code');
    }
  };

  // Add credits to user
  const handleAddCredits = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/credits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: creditsAmount,
          reason: creditsReason
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowAddCredits(null);
        setCreditsAmount(10);
        setCreditsReason('');
        fetchUsers();
        fetchStats();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to add credits');
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      setError('Failed to update user');
    }
  };

  // Delete invite code
  const deleteInviteCode = async (codeId) => {
    if (!confirm('Are you sure you want to delete this invite code?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/invite-codes/${codeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchInviteCodes();
        fetchStats();
      }
    } catch (err) {
      setError('Failed to delete invite code');
    }
  };

  // Copy code to clipboard
  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Manage users and invite codes</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'codes', label: 'Invite Codes', icon: Key }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              &times;
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-600">
                  +{stats.users.newThisWeek} this week
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">New Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.users.newToday}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {stats.users.newThisMonth} this month
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Key className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Invite Codes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inviteCodes.total}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {stats.inviteCodes.active} active
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Analyses</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.analyses.totalAnalyses}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {stats.analyses.monthlyAnalyses} this month
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Auth Providers */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Auth Providers</h3>
                <div className="space-y-4">
                  {Object.entries(stats.authProviders).map(([provider, count]) => (
                    <div key={provider} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">{provider}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${(count / stats.users.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-900 font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscriptions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscriptions</h3>
                <div className="space-y-4">
                  {Object.entries(stats.subscriptions).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">{type}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              type === 'pro' ? 'bg-purple-500' :
                              type === 'annual' ? 'bg-amber-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${(count / stats.users.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-900 font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Signups Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Signups (Last 7 Days)</h3>
              <div className="flex items-end gap-2 h-40">
                {stats.recentSignups.map((day, index) => (
                  <div key={day._id} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary-500 rounded-t-lg transition-all hover:bg-primary-600"
                      style={{ height: `${Math.max((day.count / Math.max(...stats.recentSignups.map(d => d.count), 1)) * 100, 5)}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-2">
                      {new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-xs font-medium text-gray-700">{day.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={usersSearch}
                  onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                />
              </div>
              <select
                value={usersFilter}
                onChange={(e) => { setUsersFilter(e.target.value); setUsersPage(1); }}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 outline-none"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                onClick={fetchUsers}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Auth</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Credits</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Subscription</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Joined</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.profilePicture ? (
                            <img src={u.profilePicture} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 capitalize">{u.authProvider}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{u.credits?.balance || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.subscription?.type === 'pro' ? 'bg-purple-100 text-purple-700' :
                          u.subscription?.type === 'annual' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {u.subscription?.type || 'free'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setShowAddCredits(u)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title="Add Credits"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(u.id, u.isActive)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {u.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {usersPagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Page {usersPagination.page} of {usersPagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                      disabled={!usersPagination.hasPrev}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setUsersPage(p => p + 1)}
                      disabled={!usersPagination.hasNext}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invite Codes Tab */}
        {activeTab === 'codes' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-4">
                <select
                  value={codesFilter}
                  onChange={(e) => { setCodesFilter(e.target.value); setCodesPage(1); }}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 outline-none"
                >
                  <option value="all">All Codes</option>
                  <option value="active">Active</option>
                  <option value="used">Fully Used</option>
                  <option value="expired">Expired</option>
                </select>
                <button
                  onClick={fetchInviteCodes}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <button
                onClick={() => setShowCreateCode(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Code
              </button>
            </div>

            {/* Codes Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Code</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Uses</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Bonus</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Created</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inviteCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {code.code}
                          </code>
                          <button
                            onClick={() => copyCode(code.code)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {copiedCode === code.code ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {code.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          code.type === 'founder' ? 'bg-amber-100 text-amber-700' :
                          code.type === 'partner' ? 'bg-purple-100 text-purple-700' :
                          code.type === 'promo' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {code.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-medium">{code.currentUses}</span>
                        <span className="text-gray-400"> / {code.maxUses}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        +{code.bonusCredits} credits
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          code.currentUses >= code.maxUses ? 'bg-gray-100 text-gray-500' :
                          code.expiresAt && new Date(code.expiresAt) < new Date() ? 'bg-red-100 text-red-700' :
                          code.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {code.currentUses >= code.maxUses ? 'Used' :
                           code.expiresAt && new Date(code.expiresAt) < new Date() ? 'Expired' :
                           code.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(code.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => deleteInviteCode(code.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {codesPagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Page {codesPagination.page} of {codesPagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCodesPage(p => Math.max(1, p - 1))}
                      disabled={codesPagination.page <= 1}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCodesPage(p => p + 1)}
                      disabled={codesPagination.page >= codesPagination.totalPages}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Create Code Modal */}
      {showCreateCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Create Invite Code</h3>
            <form onSubmit={handleCreateCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
                <input
                  type="text"
                  value={newCode.name}
                  onChange={(e) => setNewCode(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Partner Launch"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Code (optional)</label>
                <input
                  type="text"
                  value={newCode.customCode}
                  onChange={(e) => setNewCode(p => ({ ...p, customCode: e.target.value.toUpperCase() }))}
                  placeholder="Leave empty to auto-generate"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 outline-none font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                  <input
                    type="number"
                    min="1"
                    value={newCode.maxUses}
                    onChange={(e) => setNewCode(p => ({ ...p, maxUses: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Credits</label>
                  <input
                    type="number"
                    min="0"
                    value={newCode.bonusCredits}
                    onChange={(e) => setNewCode(p => ({ ...p, bonusCredits: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newCode.type}
                  onChange={(e) => setNewCode(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 outline-none"
                >
                  <option value="beta">Beta</option>
                  <option value="partner">Partner</option>
                  <option value="founder">Founder</option>
                  <option value="promo">Promo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={newCode.expiresAt}
                  onChange={(e) => setNewCode(p => ({ ...p, expiresAt: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateCode(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Credits Modal */}
      {showAddCredits && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Add Credits</h3>
            <p className="text-gray-500 mb-6">Add credits to {showAddCredits.name}'s account</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 outline-none"
                />
                <p className="text-sm text-gray-500 mt-1">Use negative numbers to remove credits</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={creditsReason}
                  onChange={(e) => setCreditsReason(e.target.value)}
                  placeholder="e.g., Promotional bonus"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCredits(null)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddCredits(showAddCredits.id)}
                  className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
                >
                  Add Credits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
