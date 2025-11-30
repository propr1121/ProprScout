import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, TrendingUp, Clock, Calendar, CreditCard, History } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

function CreditsPage({ onBack }) {
  const [credits, setCredits] = useState({
    balance: 15,
    totalEarned: 15,
    totalSpent: 0,
    nextRechargeDate: null,
    lastRechargeDate: null
  });
  const [loading, setLoading] = useState(true);
  const [usageHistory, setUsageHistory] = useState([]);

  useEffect(() => {
    fetchCredits();
    fetchUsageHistory();
  }, []);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/credits?user_id=anonymous`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCredits({
            balance: result.data.balance || 15,
            totalEarned: result.data.totalEarned || 15,
            totalSpent: result.data.totalSpent || 0,
            nextRechargeDate: result.data.nextRechargeDate ? new Date(result.data.nextRechargeDate) : null,
            lastRechargeDate: result.data.lastRechargeDate ? new Date(result.data.lastRechargeDate) : null
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/detective/history?user_id=anonymous&limit=20`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Transform history to show point usage
          const history = result.data.analyses?.map((analysis, index) => ({
            id: analysis._id || `usage-${index}`,
            type: 'Photo Location Search',
            pointsUsed: 5,
            date: new Date(analysis.created_at),
            address: analysis.address?.formatted || 'Unknown location'
          })) || [];
          setUsageHistory(history);
        }
      }
    } catch (error) {
      console.error('Failed to fetch usage history:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <img src="/coin-prp.svg" alt="Propr Points" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-heading">Propr Points</h1>
              <p className="text-slate-600">Manage your points and view usage history</p>
            </div>
          </div>
        </div>

        {/* Points Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 font-heading mb-6">Points Overview</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-slate-500">Loading points...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Balance */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-6 border border-primary-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary-500 rounded-lg">
                    <img src="/coin-prp.svg" alt="" className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-medium text-slate-600">Available Points</div>
                </div>
                <div className="text-4xl font-bold text-slate-900 font-heading mb-2">{credits.balance}</div>
                <div className="text-sm text-slate-600">
                  {Math.floor(credits.balance / 5)} analyses remaining
                </div>
              </div>

              {/* Total Earned */}
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm font-medium text-slate-600">Total Earned</div>
                </div>
                <div className="text-4xl font-bold text-slate-900 font-heading mb-2">{credits.totalEarned}</div>
                <div className="text-sm text-slate-600">All time points</div>
              </div>

              {/* Total Spent */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-slate-600 rounded-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm font-medium text-slate-600">Total Used</div>
                </div>
                <div className="text-4xl font-bold text-slate-900 font-heading mb-2">{credits.totalSpent}</div>
                <div className="text-sm text-slate-600">Points spent</div>
              </div>
            </div>
          )}
        </div>

        {/* Recharge Information */}
        {credits.nextRechargeDate && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 font-heading mb-6">Recharge Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-600 mb-1">Next Recharge</div>
                  <div className="text-lg font-bold text-slate-900">
                    {credits.nextRechargeDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {Math.ceil((credits.nextRechargeDate - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                  </div>
                </div>
              </div>

              {credits.lastRechargeDate && (
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-600 mb-1">Last Recharge</div>
                    <div className="text-lg font-bold text-slate-900">
                      {credits.lastRechargeDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      +15 points added
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Usage History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 font-heading">Usage History</h2>
            <div className="text-sm text-slate-600">
              {usageHistory.length} {usageHistory.length === 1 ? 'analysis' : 'analyses'}
            </div>
          </div>

          {usageHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">No usage history yet</p>
              <p className="text-slate-400 text-xs mt-2">Start analyzing properties to see your usage history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {usageHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
                      <img src="/coin-prp.svg" alt="" className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900">{item.type}</div>
                      <div className="text-xs text-slate-500 truncate">{item.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-sm font-bold text-slate-900">-{item.pointsUsed}</div>
                      <div className="text-xs text-slate-500">points</div>
                    </div>
                    <div className="text-xs text-slate-500 min-w-[100px]">
                      {item.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade CTA */}
        {credits.balance < 20 && (
          <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-heading mb-2">Running Low on Points?</h3>
                <p className="text-primary-100 mb-4">
                  Upgrade to Premium for unlimited analyses and advanced features
                </p>
                <button
                  onClick={() => {
                    // Navigate to billing page
                    window.location.hash = 'payment';
                  }}
                  className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  Upgrade Plan
                </button>
              </div>
              <CreditCard className="w-16 h-16 text-primary-200 opacity-50" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreditsPage;
