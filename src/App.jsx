import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, Sparkles, TrendingUp, Menu, X, CheckCircle, Camera, Download, Settings, CreditCard, History, Plus, BarChart3, MapPin, User, Bell, Search, Image, Zap, Shield, Globe, Users, Key, FileText, Filter, Calendar, Target, Award, Activity, PieChart, TrendingDown, Clock, Star, AlertCircle, CheckCircle2, ScanSearch, Navigation2, ChevronDown, ChevronUp, Home, Building2, LogOut, Crown } from 'lucide-react'
import PropertyInput from './components/PropertyInput'
import PropertyResults from './components/PropertyResults'
import PropertyDetective from './components/PropertyDetective'
import LandingPage from './components/LandingPage'
import PaymentPage from './components/PaymentPage'
import CreditsPage from './components/CreditsPage'
import AccountPage from './components/AccountPage'
import SettingsPage from './components/SettingsPage'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import AuthCallback from './components/AuthCallback'
import InviteCodePage from './components/InviteCodePage'
import PrivateBetaPage from './components/PrivateBetaPage'
import InviteRequiredPage from './components/InviteRequiredPage'
import ForgotPasswordPage from './components/ForgotPasswordPage'
import ResetPasswordPage from './components/ResetPasswordPage'
import AdminDashboard from './components/AdminDashboard'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'
import TermsConditionsPage from './components/TermsConditionsPage'
import AcceptableUsePage from './components/AcceptableUsePage'
import { usePropertyAnalysis } from './hooks/usePropertyAnalysis'
import { useAuth } from './context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Helper function to format time ago
function formatTimeAgo(date) {
  if (!date) return 'N/A';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
}

// Route wrapper components
function LandingPageRoute() {
  const navigate = useNavigate();
  return (
    <LandingPage
      onEnterApp={() => navigate('/invite')}
      onLogin={() => navigate('/login')}
      onSignup={() => navigate('/invite')}
    />
  );
}

function LoginPageRoute() {
  const navigate = useNavigate();
  return (
    <LoginPage
      onBack={() => navigate('/')}
      onSwitchToSignup={() => navigate('/invite')}
      onSuccess={() => navigate('/dashboard')}
      onForgotPassword={() => navigate('/forgot-password')}
    />
  );
}

function SignupPageRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const ref = new URLSearchParams(location.search).get('ref');
  const [hasInviteCode, setHasInviteCode] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user has a valid invite code in session
  useEffect(() => {
    const code = sessionStorage.getItem('validInviteCode');
    if (!code) {
      navigate('/invite');
    } else {
      setHasInviteCode(true);
    }
    setIsChecking(false);
  }, [navigate]);

  // Show nothing while checking
  if (isChecking || !hasInviteCode) {
    return null;
  }

  return (
    <SignupPage
      onBack={() => navigate('/invite')}
      onSwitchToLogin={() => navigate('/login')}
      onSuccess={() => navigate('/dashboard')}
    />
  );
}

function AuthCallbackRoute() {
  const navigate = useNavigate();
  return (
    <AuthCallback
      onSuccess={() => navigate('/dashboard')}
      onError={() => navigate('/login')}
    />
  );
}

function PaymentPageRoute() {
  const navigate = useNavigate();
  return (
    <PaymentPage 
      onBack={() => navigate('/dashboard')} 
    />
  );
}

function CreditsPageRoute() {
  const navigate = useNavigate();
  return (
    <CreditsPage 
      onBack={() => navigate('/dashboard')} 
    />
  );
}

function AccountPageRoute() {
  const navigate = useNavigate();
  return (
    <AccountPage 
      onBack={() => navigate('/dashboard')} 
    />
  );
}

function SettingsPageRoute() {
  const navigate = useNavigate();
  return (
    <SettingsPage
      onBack={() => navigate('/dashboard')}
    />
  );
}

function InviteCodePageRoute() {
  const navigate = useNavigate();
  return (
    <InviteCodePage
      onValidCode={(code, codeData) => {
        // Store code for signup
        sessionStorage.setItem('validInviteCode', code);
        if (codeData) {
          sessionStorage.setItem('inviteCodeData', JSON.stringify(codeData));
        }
        navigate('/signup');
      }}
      onBack={() => navigate('/')}
      onLearnMore={() => navigate('/beta')}
    />
  );
}

function PrivateBetaPageRoute() {
  const navigate = useNavigate();
  return (
    <PrivateBetaPage
      onBack={() => navigate('/')}
      onHaveCode={() => navigate('/invite')}
    />
  );
}

function InviteRequiredPageRoute() {
  const navigate = useNavigate();
  return (
    <InviteRequiredPage
      onBack={() => navigate('/login')}
      onHaveCode={() => navigate('/invite')}
      onLearnMore={() => navigate('/beta')}
    />
  );
}

function ForgotPasswordPageRoute() {
  const navigate = useNavigate();
  return (
    <ForgotPasswordPage
      onBack={() => navigate('/')}
      onBackToLogin={() => navigate('/login')}
    />
  );
}

function ResetPasswordPageRoute() {
  const navigate = useNavigate();
  return (
    <ResetPasswordPage
      onBack={() => navigate('/')}
      onBackToLogin={() => navigate('/login')}
    />
  );
}

function PrivacyPolicyPageRoute() {
  const navigate = useNavigate();
  return (
    <PrivacyPolicyPage
      onBack={() => navigate('/')}
    />
  );
}

function TermsConditionsPageRoute() {
  const navigate = useNavigate();
  return (
    <TermsConditionsPage
      onBack={() => navigate('/')}
    />
  );
}

function AcceptableUsePageRoute() {
  const navigate = useNavigate();
  return (
    <AcceptableUsePage
      onBack={() => navigate('/')}
    />
  );
}

function AdminDashboardRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is admin
  if (!user?.isAdmin) {
    navigate('/dashboard');
    return null;
  }

  return (
    <AdminDashboard
      onBack={() => navigate('/dashboard')}
    />
  );
}

// Protected Route wrapper - redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return children;
}

function ListingAnalysisRoute() {
  const navigate = useNavigate();
  const { analyze, loading, error, result, reset } = usePropertyAnalysis();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>
        </div>
        <PropertyInput 
          onAnalyze={analyze}
          loading={loading}
          error={error}
          result={result}
          reset={reset}
        />
        {result && <PropertyResults result={result} />}
      </div>
    </div>
  );
}

function PhotoLocationSearchRoute() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </button>
        </div>
        <PropertyDetective />
      </div>
    </div>
  );
}

// Dashboard Component - extracted from App
function Dashboard() {
  const navigate = useNavigate();
  const { analyze, loading, error, result, reset } = usePropertyAnalysis();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('url'); // 'url' or 'detective'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState(null); // Track which analysis is expanded
  const [fabMenuOpen, setFabMenuOpen] = useState(false); // Track floating action button menu state
  const [notificationsOpen, setNotificationsOpen] = useState(false); // Track notifications menu state
  const [creditsModalOpen, setCreditsModalOpen] = useState(false); // Track credits info modal state
  const [profileMenuOpen, setProfileMenuOpen] = useState(false); // Track profile menu state
  
  // Real data for dashboard - fetched from API
  const [userCredits, setUserCredits] = useState(15);
  const [nextRechargeDate, setNextRechargeDate] = useState(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [monthlyAnalyses, setMonthlyAnalyses] = useState(0);
  const [monthlyChange, setMonthlyChange] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [successRateChange, setSuccessRateChange] = useState(0);
  const [totalValueAnalyzed, setTotalValueAnalyzed] = useState('0.0');
  const [chartData, setChartData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
  const [recentActivity] = useState([
    { id: 1, action: 'Analysis completed', property: '123 Main St', time: '2 minutes ago', type: 'success' },
    { id: 2, action: 'Credit purchased', amount: '50 credits', time: '1 hour ago', type: 'purchase' },
    { id: 3, action: 'Export generated', file: 'property_report.pdf', time: '3 hours ago', type: 'export' },
    { id: 4, action: 'Template used', template: 'Residential Analysis', time: '1 day ago', type: 'template' },
  ]);
  
  // Notifications data - fetched from API
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  
  // Fetch real dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoadingStats(true);
        const response = await fetch(`${API_URL}/api/dashboard/stats?user_id=anonymous`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setTotalAnalyses(result.data.totalAnalyses || 0);
            setMonthlyAnalyses(result.data.monthlyAnalyses || 0);
            setMonthlyChange(result.data.monthlyChange || 0);
            setSuccessRate(result.data.successRate || 0);
            setSuccessRateChange(result.data.successRateChange || 0);
            setTotalValueAnalyzed(result.data.totalValueAnalyzed || '0.0');
          }
        } else {
          // Handle rate limiting or server errors gracefully
          console.warn('Dashboard stats API returned:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Keep default values on error
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchChartData = async () => {
      try {
        setLoadingChart(true);
        const response = await fetch(`${API_URL}/api/dashboard/activity?user_id=anonymous&days=7`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setChartData(result.data.days || []);
          }
        } else {
          // Handle rate limiting or server errors gracefully
          console.warn('Dashboard activity API returned:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        // Keep empty chart on error
        setChartData([]);
      } finally {
        setLoadingChart(false);
      }
    };

    const fetchAnalysisHistory = async () => {
      try {
        setLoadingHistory(true);
        const response = await fetch(`${API_URL}/api/detective/history?user_id=anonymous&limit=10`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.analyses) {
            // Transform the API data to match the expected format
            const transformedAnalyses = result.data.analyses.map((analysis, index) => {
              // Determine priority based on confidence
              let priority = 'low';
              if (analysis.confidence >= 0.7) priority = 'high';
              else if (analysis.confidence >= 0.4) priority = 'medium';
              
              // Format date
              const date = new Date(analysis.created_at);
              const formattedDate = date.toISOString().split('T')[0];
              const createdAt = date; // Keep original date for time calculations
              
              // Format coordinates
              const coordinates = analysis.coordinates 
                ? `${analysis.coordinates.lat.toFixed(6)}, ${analysis.coordinates.lon.toFixed(6)}`
                : 'N/A';
              
              // Get postal address
              const postalAddress = analysis.address?.formatted || analysis.address?.postcode || 'Address not available';
              
              return {
                id: analysis._id || `analysis-${index}`,
                type: 'Photo Location Search',
                property: postalAddress,
                date: formattedDate,
                createdAt: createdAt, // Store original date for time calculations
                status: 'completed',
                credits: 5, // Always 5 credits
                coordinates: coordinates,
                postalAddress: postalAddress,
                confidence: analysis.confidence,
                priority: priority,
                details: {
                  coordinates: coordinates,
                  postalAddress: postalAddress,
                  confidence: (analysis.confidence * 100).toFixed(1) + '%',
                  enrichment: analysis.enrichment || {},
                  imageUrl: analysis.image_url
                }
              };
            });
            setAnalysisHistory(transformedAnalyses);
            
            // Set last analysis time from the most recent analysis
            if (transformedAnalyses.length > 0) {
              const mostRecent = transformedAnalyses[0];
              if (mostRecent.createdAt) {
                setLastAnalysisTime(mostRecent.createdAt);
              } else if (mostRecent.date) {
                // Fallback: parse the date string
                const date = new Date(mostRecent.date + 'T00:00:00');
                setLastAnalysisTime(date);
              }
            } else {
              setLastAnalysisTime(null);
            }
          }
        } else {
          // Handle rate limiting or server errors gracefully
          console.warn('Detective history API returned:', response.status, response.statusText);
          setAnalysisHistory([]);
          setLastAnalysisTime(null);
        }
      } catch (error) {
        console.error('Failed to fetch analysis history:', error);
        setAnalysisHistory([]);
        setLastAnalysisTime(null);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchDashboardStats();
    fetchChartData();
    fetchAnalysisHistory();

    // Refresh every 30 seconds
    const statsInterval = setInterval(fetchDashboardStats, 30000);
    const chartInterval = setInterval(fetchChartData, 30000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(chartInterval);
    };
  }, []);

  // Fetch credits from API
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setLoadingCredits(true);
        const response = await fetch(`${API_URL}/api/credits?user_id=anonymous`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setUserCredits(result.data.balance || 15);
            setNextRechargeDate(result.data.nextRechargeDate ? new Date(result.data.nextRechargeDate) : null);
          }
        } else {
          console.warn('Credits API returned:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      } finally {
        setLoadingCredits(false);
      }
    };
    
    fetchCredits();
    // Refresh credits every 30 seconds
    const creditsInterval = setInterval(fetchCredits, 30000);
    return () => clearInterval(creditsInterval);
  }, []);
  
  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const response = await fetch(`${API_URL}/api/notifications?user_id=anonymous&limit=20`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setNotifications(result.data.notifications || []);
          }
        } else {
          console.warn('Notifications API returned:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoadingNotifications(false);
      }
    };
    
    fetchNotifications();
    // Refresh notifications every 10 seconds
    const notificationsInterval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(notificationsInterval);
  }, []);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read?user_id=anonymous`, {
        method: 'PUT'
      });
      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Optimistically update UI
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    }
  };
  
  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/read-all?user_id=anonymous`, {
        method: 'PUT'
      });
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Optimistically update UI
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };
  
  // Handle notification click - navigate based on action type
  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Close notifications menu
    setNotificationsOpen(false);
    
    // Navigate based on notification action
    switch (notification.action) {
      case 'view-analysis':
        // Get analysis ID from action_data or notification
        const analysisId = notification.action_data?.analysisId || notification.analysisId;
        if (analysisId) {
          setExpandedAnalysis(analysisId);
          // Scroll to recent analyses section
          setTimeout(() => {
            document.getElementById('recent-analyses')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
        break;
      case 'view-upgrade':
        // Navigate to payment/upgrade page
        navigate('/dashboard/payment');
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'view-exports':
        // For now, just show a message - can be extended to navigate to exports page
        document.getElementById('recent-analyses')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      case 'view-features':
        // Scroll to upgrade section to show new features
        const featuresSection = document.querySelector('.bg-gradient-to-br.from-primary-50');
        if (featuresSection) {
          featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        break;
      case 'view-reports':
        // Scroll to dashboard overview or analytics section
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      default:
        // Just mark as read and close
        break;
    }
  };

  // Main Dashboard
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-slate-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Premium Dashboard Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 w-12 h-12 flex items-center justify-center shadow-md" style={{ padding: '0px' }}>
                <svg 
                  width="48" 
                  height="48" 
                  viewBox="0 0 1200 750" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ 
                    display: 'block',
                    width: '48px',
                    height: '48px',
                    transform: 'scale(3)'
                  }}
                >
                  <g fill="#FFFFFF" stroke="none">
                    <path d="M669.6,407.4c0,2.6-2.1,4.8-4.8,4.8H600h-69.6v-67.6c0-1.3,0.5-2.5,1.4-3.4l64.8-64.8c1.9-1.9,4.9-1.9,6.8,0l64.8,64.8c0.9,0.9,1.4,2.1,1.4,3.4V407.4z" fill="#FFFFFF"/>
                    <path d="M600,342.6l-69.6,69.6l61.4,61.4c3,3,8.2,0.9,8.2-3.4V342.6z" fill="#FFFFFF"/>
                    <path d="M600,412.2h-69.6v-67.6c0-1.3,0.5-2.5,1.4-3.4l64.5-64.5c1.4-1.4,3.7-0.4,3.7,1.5V412.2z" fill="#FFFFFF"/>
                  </g>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-heading">ProprScout</h1>
                <p className="text-xs text-gray-600">Real Estate Intelligence</p>
              </div>
            </button>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              {/* Propr Points Display */}
              <button
                onClick={() => {
                  setCreditsModalOpen(true);
                  // Also scroll to upgrade section to show comparison
                  setTimeout(() => {
                    const upgradeSection = document.querySelector('.bg-gradient-to-br.from-primary-50');
                    if (upgradeSection) {
                      upgradeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
                className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-100 hover:border-primary-300 transition-all cursor-pointer group"
              >
                <img src="/coin-prp.svg" alt="Propr Points" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-slate-700 group-hover:text-primary-600 transition-colors">{userCredits} Points</span>
                <div className="w-2 h-2 bg-primary-500 rounded-full group-hover:bg-primary-600 transition-colors"></div>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationsOpen(!notificationsOpen);
                  }}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors group"
                >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
              </button>
                
                {/* Notifications Dropdown Menu */}
                {notificationsOpen && (
                  <>
                    {/* Backdrop to close on outside click */}
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setNotificationsOpen(false)}
                    ></div>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Header */}
                      <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-primary-50/50 to-white flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 font-heading">Notifications</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              markAllAsRead();
                              // Keep menu open so user can still see notifications
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-5 py-12 text-center">
                            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm">No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className={`px-5 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors cursor-pointer group ${
                                !notification.read ? 'bg-primary-50/30' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Icon based on type */}
                                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                                  notification.type === 'success' 
                                    ? 'bg-green-100 text-green-600' 
                                    : notification.type === 'warning'
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-primary-100 text-primary-600'
                                }`}>
                                  {notification.type === 'success' ? (
                                    <CheckCircle className="w-5 h-5" />
                                  ) : notification.type === 'warning' ? (
                                    <AlertCircle className="w-5 h-5" />
                                  ) : (
                                    <Bell className="w-5 h-5" />
                                  )}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                                      {notification.title}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5"></div>
                                      )}
                                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-slate-600 mb-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">
                          <button 
                            onClick={() => {
                              setNotificationsOpen(false);
                              // Navigate to all notifications page
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium w-full text-center"
                          >
                            View All Notifications
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* User Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileMenuOpen(!profileMenuOpen);
                    setNotificationsOpen(false); // Close notifications if open
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors group"
                >
                  <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:ring-2 group-hover:ring-primary-300 transition-all">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </div>
                </button>
                
                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setProfileMenuOpen(false)}
                    ></div>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Profile Header */}
                      <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-primary-50/50 to-white">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-md">
                            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 font-heading truncate">{user?.name || 'User'}</div>
                            <div className="text-xs text-slate-600 font-medium">{user?.tier ? `${user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} Plan` : 'Free Plan'}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/dashboard/credits');
                          }}
                          className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors group"
                        >
                          <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-primary-100 transition-colors">
                            <img src="/coin-prp.svg" alt="Propr Points" className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900">Propr Points</div>
                            <div className="text-xs text-slate-500">{userCredits} points available</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/dashboard/payment');
                          }}
                          className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors group"
                        >
                          <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-primary-100 transition-colors">
                            <CreditCard className="w-4 h-4 text-slate-600 group-hover:text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900">Billing & Plans</div>
                            <div className="text-xs text-slate-500">Manage subscription</div>
                          </div>
                        </button>
                        
                        <div className="border-t border-slate-200 my-2"></div>
                        
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/dashboard/account');
                          }}
                          className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors group"
                        >
                          <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-primary-100 transition-colors">
                            <User className="w-4 h-4 text-slate-600 group-hover:text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900">Account</div>
                            <div className="text-xs text-slate-500">Profile, password & security</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/dashboard/settings');
                          }}
                          className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors group"
                        >
                          <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-primary-100 transition-colors">
                            <Settings className="w-4 h-4 text-slate-600 group-hover:text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900">Settings</div>
                            <div className="text-xs text-slate-500">Language, notifications & preferences</div>
                          </div>
                        </button>
                        
                        <div className="border-t border-slate-200 my-2"></div>
                        
                        <button
                          onClick={async () => {
                            setProfileMenuOpen(false);
                            await logout();
                            navigate('/');
                          }}
                          className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-red-50 transition-colors group"
                        >
                          <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-red-100 transition-colors">
                            <LogOut className="w-4 h-4 text-slate-600 group-hover:text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 group-hover:text-red-600">Logout</div>
                            <div className="text-xs text-slate-500">Sign out of your account</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 font-heading mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h2>
          <p className="text-slate-600">Here's your analysis overview and recent activity.</p>
        </div>

        {/* Key Metrics & Activity Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Analyses */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="p-2.5 bg-primary-100 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Analyses</div>
                  <div className="text-3xl font-bold text-slate-900 font-heading">{loadingStats ? '...' : totalAnalyses}</div>
                </div>
              </div>
              <div className={`text-sm font-medium ${monthlyChange >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                {monthlyChange >= 0 ? '+' : ''}{monthlyChange} this month
              </div>
            </div>

            {/* Success Rate */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="p-2.5 bg-primary-100 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Success Rate</div>
                  <div className="text-3xl font-bold text-slate-900 font-heading">{loadingStats ? '...' : (successRate || 0).toFixed(1)}%</div>
                </div>
              </div>
              <div className={`text-sm font-medium ${successRateChange >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                {successRateChange >= 0 ? '↑' : '↓'} {Math.abs(successRateChange).toFixed(1)}% from last month
              </div>
            </div>

            {/* This Month's Activity */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="p-2.5 bg-primary-100 rounded-xl">
                  <Activity className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">This Month</div>
                  <div className="text-3xl font-bold text-slate-900 font-heading">{loadingStats ? '...' : monthlyAnalyses}</div>
                </div>
              </div>
              <div className="text-sm text-slate-600">analyses completed</div>
            </div>

            {/* Total Value Analyzed - 4th Metric */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="p-2.5 bg-primary-100 rounded-xl">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Value Analyzed</div>
                  <div className="text-3xl font-bold text-slate-900 font-heading">€{loadingStats ? '...' : totalValueAnalyzed}M</div>
                </div>
              </div>
              <div className="text-sm text-slate-600">cumulative property value</div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="border-t border-slate-200 pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 font-heading mb-1">7-Day Activity</h3>
                <p className="text-sm text-slate-500">Daily analysis activity</p>
              </div>
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            {/* Chart with real data */}
            {chartData.length > 0 && chartData.some(day => day.count > 0) ? (
              <div className="relative h-48 flex items-end justify-between gap-2">
                {/* Chart bars with real data */}
                {chartData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-20">
                      <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl whitespace-nowrap">
                        <div className="font-semibold">{day.count} {day.count === 1 ? 'analysis' : 'analyses'}</div>
                        <div className="text-slate-300 text-xs mt-0.5">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900"></div>
                      </div>
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full bg-gradient-to-t from-primary-500 via-primary-500 to-primary-400 rounded-t-lg transition-all duration-500 cursor-pointer group-hover:shadow-lg relative overflow-hidden"
                      style={{ 
                        height: `${Math.max(day.percentage, 5)}%`,
                        minHeight: '8px'
                      }}
                      title={`${day.count} analyses on ${day.dayName}`}
                  >
                      {/* Hover gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-600 to-primary-500 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  </div>
                    {/* Day label */}
                  <span className="text-xs text-slate-500 mt-3 group-hover:text-slate-700 transition-colors font-medium">
                      {day.dayName}
                    </span>
                    {/* Value label (shown on hover) */}
                    <span className="absolute -top-6 text-xs font-semibold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {day.count}
                  </span>
                </div>
              ))}
            </div>
            ) : (
              /* Premium Empty State */
              <div className="relative h-56 overflow-hidden rounded-xl bg-gradient-to-br from-primary-50/50 via-white to-primary-50/30 border-2 border-dashed border-primary-200/50 flex items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-transparent to-primary-200/10"></div>
                <div className="relative z-10 text-center px-8 py-6">
                  <div className="relative inline-flex mb-6">
                    <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-primary-100 to-primary-200 p-5 rounded-2xl shadow-lg">
                      <Activity className="w-10 h-10 text-primary-600" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 font-heading mb-2">
                    No Activity Yet
                  </h4>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Start analyzing properties to see your activity chart here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Premium Upgrade Section - Only show for free tier users */}
        {(!user?.subscription?.type || user.subscription.type === 'free') ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-50/40 via-white to-primary-50/20 rounded-2xl shadow-lg border border-primary-100/50 p-6 mb-8">
          {/* Subtle decorative background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between gap-6">
            {/* Left: Title and Benefits */}
            <div className="flex-1 w-full">
              {/* Free Tier Status Banner - Aligned with Best Value card top */}
              <div className="mb-6 -mt-0.5">
                <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 w-full">
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mr-2">Current Plan</div>
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 rounded-lg p-1.5">
                      <img src="/coin-prp.svg" alt="Propr Points" className="w-4 h-4" />
                </div>
                <div>
                      <div className="text-xs font-bold text-slate-900">Free Tier: 15 Points</div>
                      <div className="text-xs text-slate-600">3 Analyses • Refreshed Monthly</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-10 mt-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-primary-200 rounded-lg blur-sm opacity-40"></div>
                  <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg shadow-md">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">
                    Unlock Premium Features
                  </h3>
                  <p className="text-sm text-slate-600 leading-normal font-medium">
                    Upgrade for unlimited access and premium features.
                  </p>
                </div>
              </div>

              {/* Key benefits in a single horizontal row */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-5 mb-6">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-200 rounded-lg blur-xs opacity-30"></div>
                    <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-1.5 rounded-lg shadow-sm">
                      <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 whitespace-nowrap">Unlimited Analyses</div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">No credit limits</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-200 rounded-lg blur-xs opacity-30"></div>
                    <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-1.5 rounded-lg shadow-sm">
                      <Users className="w-4 h-4 text-white" />
                  </div>
                </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 whitespace-nowrap">Team Collaboration</div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">Share with your team</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-200 rounded-lg blur-xs opacity-30"></div>
                    <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-1.5 rounded-lg shadow-sm">
                      <Key className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 whitespace-nowrap">API Access</div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">Integrate with your tools</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-200 rounded-lg blur-xs opacity-30"></div>
                    <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-1.5 rounded-lg shadow-sm">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 whitespace-nowrap">Advanced Analytics</div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">Deep insights & reporting</div>
                </div>
              </div>
            </div>

              {/* Trust indicators - compact horizontal */}
              <div className="flex items-center gap-4 pt-5 border-t border-primary-100/50">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary-600" />
                  <span className="text-xs font-semibold text-slate-700">24/7 Priority Support</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary-600" />
                  <span className="text-xs font-semibold text-slate-700">Enterprise Security</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary-600" />
                  <span className="text-xs font-semibold text-slate-700">Custom Integrations</span>
                </div>
              </div>
            </div>

            {/* Right: Premium CTA */}
            <div className="lg:w-80 w-full flex-shrink-0">
              <div className="relative bg-gradient-to-br from-white to-primary-50/50 rounded-xl p-5 border border-primary-200/50 shadow-md">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-600/5 rounded-xl pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full text-xs font-bold mb-3">
                      <Sparkles className="w-3 h-3" />
                      Best Value
                    </div>
                    <h4 className="text-base font-bold text-slate-900 font-heading mb-1.5">
                  Ready to upgrade?
                </h4>
                    <p className="text-sm text-slate-600 mb-4 leading-normal">
                      Unlock unlimited analyses and premium features today
                    </p>
                  </div>

                  {/* Pricing highlight */}
                  <div className="bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-lg p-3 mb-4 border border-primary-200/50">
                    <div className="flex items-baseline justify-center gap-1.5 mb-1">
                      <span className="text-3xl font-bold text-slate-900">€24</span>
                      <span className="text-lg text-slate-600">/ Month</span>
                    </div>
                    <p className="text-center text-xs text-primary-600 font-semibold">(Save 17% Annually)</p>
                  </div>

                  {/* Premium CTA Button */}
                  <button 
                    onClick={() => {
                      navigate('/dashboard/payment');
                    }}
                    className="group relative w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2 overflow-hidden mb-2.5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative flex items-center gap-2">
                      <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  Upgrade to Premium
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                </button>
                
                  {/* Guarantee */}
                  <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 leading-tight">
                    <Shield className="w-3 h-3 text-primary-500 flex-shrink-0" />
                    <span>14-day guarantee • Cancel anytime</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
        /* Premium User Status Section */
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-50/40 via-white to-primary-50/20 rounded-2xl shadow-lg border border-primary-100/50 p-6 mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary-200 rounded-xl blur-sm opacity-40"></div>
                <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shadow-md">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900 font-heading">
                    {user?.subscription?.type === 'annual' ? 'Annual Premium' : 'Premium'} Plan
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Unlimited analyses and all premium features unlocked
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard/payment')}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Manage Subscription
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Premium Analysis History */}
        <div id="recent-analyses" className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 font-heading">Recent Analyses</h3>
                <p className="text-sm text-slate-500 mt-1">Your latest property intelligence reports</p>
              </div>
              <button className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                View All
              </button>
            </div>
          </div>
          
          <div>
            {loadingHistory ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading analyses...</p>
              </div>
            ) : analysisHistory.length === 0 ? (
              <div className="p-16 text-center">
                <div className="relative inline-flex items-center justify-center mb-6">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-primary-600/10 to-primary-500/20 rounded-full blur-2xl animate-pulse"></div>
                  {/* Icon container */}
                  <div className="relative bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl p-6 border border-primary-200/50 shadow-lg">
                    <ScanSearch className="w-16 h-16 text-primary-600" />
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <h3 className="text-xl font-bold text-slate-900 font-heading">No analyses yet</h3>
                  <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                    Start analyzing properties to see your intelligence reports here
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => {
                      navigate('/dashboard/listing-analysis');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group relative bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center gap-2 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative flex items-center gap-2">
                      <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Analyze Property URL
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      navigate('/dashboard/photo-location-search');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group relative bg-white border-2 border-primary-200 hover:border-primary-300 text-primary-700 hover:text-primary-800 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Photo Location Search
                  </button>
                </div>
                
                {/* Feature hints */}
                <div className="mt-10 pt-8 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">What you can do</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    <div className="flex items-start gap-3 p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Search className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 mb-1">URL Analysis</div>
                        <div className="text-xs text-slate-600 leading-relaxed">Analyze property listings with AI intelligence</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Camera className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 mb-1">Photo Search</div>
                        <div className="text-xs text-slate-600 leading-relaxed">Upload photos to detect location with AI</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 mb-1">Intelligence</div>
                        <div className="text-xs text-slate-600 leading-relaxed">Get comprehensive property insights</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              analysisHistory.map((analysis, index) => (
              <div 
                key={analysis.id} 
                className={`border-b border-slate-100 last:border-b-0 transition-all duration-200 ${
                  expandedAnalysis === analysis.id ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                }`}
              >
                <div 
                  onClick={() => setExpandedAnalysis(expandedAnalysis === analysis.id ? null : analysis.id)}
                  className="p-6 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Status Indicator */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          analysis.status === 'completed' ? 'bg-primary-500' : 'bg-amber-500'
                        }`} />
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">{analysis.property}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            analysis.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-200' :
                            analysis.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {analysis.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                          <span className="text-sm text-slate-600 font-medium">{analysis.type}</span>
                          <span className="text-sm text-slate-400">•</span>
                          <span className="text-sm text-slate-600">{analysis.date}</span>
                          {analysis.type === 'Photo Location Search' ? (
                            <>
                              <span className="text-sm text-slate-400">•</span>
                              <span className="text-sm text-slate-700 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-primary-600" />
                                {analysis.coordinates || 'N/A'}
                              </span>
                              {analysis.postalAddress && (
                                <>
                                  <span className="text-sm text-slate-400">•</span>
                                  <span className="text-sm text-slate-600">{analysis.postalAddress}</span>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-sm text-slate-400">•</span>
                              <span className="text-sm font-semibold text-slate-900">{analysis.value}</span>
                              <span className="text-sm font-semibold text-primary-600">{analysis.roi}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-slate-700">{analysis.credits} points</div>
                        <div className="text-xs text-slate-500">Used</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle download
                          }}
                          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle settings
                          }}
                          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <div className="p-1 text-slate-400 group-hover:text-slate-600 transition-colors">
                          {expandedAnalysis === analysis.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedAnalysis === analysis.id && analysis.details && (
                  <div className="px-6 pb-6 pt-0 border-t border-slate-200 mt-2">
                    {analysis.type === 'Photo Location Search' ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Navigation2 className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">Coordinates</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900 break-all">{analysis.details.coordinates || 'N/A'}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">Postal Address</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900">{analysis.details.postalAddress || 'N/A'}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">Confidence</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{analysis.details.confidence || 'N/A'}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Home className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">Bedrooms</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{analysis.details.bedrooms}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">Bathrooms</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{analysis.details.bathrooms}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">Square Feet</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{analysis.details.sqft?.toLocaleString() || 'N/A'}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">Year Built</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{analysis.details.yearBuilt || 'N/A'}</div>
                        </div>
                      </div>
                    )}
                    {analysis.type === 'Listing Analysis' && analysis.details.neighborhood && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">Neighborhood</span>
                          </div>
                          <div className="text-lg font-bold text-slate-900">{analysis.details.neighborhood}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">Market Trend</span>
                          </div>
                          <div className="text-lg font-bold text-slate-900">{analysis.details.marketTrend}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              ))
            )}
          </div>
        </div>

        {/* Propr Points Info Modal */}
        {creditsModalOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setCreditsModalOpen(false)}
            ></div>

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-50 to-white px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg shadow-md">
                      <img src="/coin-prp.svg" alt="Propr Points" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 font-heading">Propr Points</h3>
                      <p className="text-xs text-slate-600">Understand your points system</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCreditsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Current Status */}
                  <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-4 border border-primary-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-slate-600 mb-1">Current Balance</div>
                        <div className="text-3xl font-bold text-slate-900 font-heading flex items-center gap-2">
                          <img src="/coin-prp.svg" alt="" className="w-7 h-7" />
                          {userCredits} Points
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-600 mb-1">Remaining Actions</div>
                        <div className="text-xl font-bold text-primary-600">{Math.floor(userCredits / 5)} analyses</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      Each analysis costs 5 points • Free tier: 15 points/month (3 analyses)
                      {nextRechargeDate && (
                        <div className="mt-1 text-xs text-slate-400">
                          Next recharge: {nextRechargeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Free vs Premium Comparison */}
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-heading mb-3">Free vs Premium</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {/* Free Tier */}
                      <div className="border-2 border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-slate-100 rounded-lg p-1.5">
                            <img src="/coin-prp.svg" alt="" className="w-3.5 h-3.5" />
                          </div>
                          <h5 className="font-bold text-sm text-slate-900">Free Tier</h5>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                            <span className="text-xs text-slate-700">15 points/month</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                            <span className="text-xs text-slate-700">3 analyses/month</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                            <span className="text-xs text-slate-700">Resets monthly</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                            <span className="text-xs text-slate-700">Basic features</span>
                          </div>
                        </div>
                      </div>

                      {/* Premium Tier */}
                      <div className="border-2 border-primary-400 bg-gradient-to-br from-primary-50/50 to-white rounded-xl p-4 relative overflow-hidden">
                        <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          Premium
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-1.5">
                            <Star className="w-3.5 h-3.5 text-white" />
                          </div>
                          <h5 className="font-bold text-sm text-slate-900">Premium Plan</h5>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-slate-900">Unlimited analyses</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-slate-900">No credit limits</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-slate-900">Advanced analytics</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-slate-900">Team & API access</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-slate-900">Priority support</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Point Costs */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h4 className="text-base font-bold text-slate-900 font-heading mb-3">Point Costs</h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                        <span className="text-xs text-slate-700">Property Listing Analysis</span>
                        <span className="text-xs font-semibold text-slate-900">5 points</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                        <span className="text-xs text-slate-700">Photo Location Search</span>
                        <span className="text-xs font-semibold text-slate-900">5 points</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-xs text-slate-700">Export Report</span>
                        <span className="text-xs font-semibold text-slate-900">2 points</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setCreditsModalOpen(false);
                        navigate('/dashboard/payment');
                      }}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Upgrade to Premium
                    </button>
                    <button
                      onClick={() => setCreditsModalOpen(false)}
                      className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Floating Action Button */}
        <div className="fixed top-1/2 -translate-y-1/2 right-6 z-40">
          <div className="flex flex-col gap-3 items-center">
            {/* Sub-menu buttons - appear when main button is clicked */}
            {fabMenuOpen && (
              <div className="flex flex-col gap-2 mb-3 items-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="relative group">
                <button 
                  onClick={() => {
                    navigate('/dashboard/listing-analysis');
                    setFabMenuOpen(false);
                  }}
                    className="w-12 h-12 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-primary-400 hover:border-primary-500 backdrop-blur-sm"
                >
                  <ScanSearch className="w-5 h-5" />
                </button>
                  {/* Tooltip */}
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                      Analyze Property Listing
                      <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900"></div>
                    </div>
                  </div>
                </div>
                <div className="relative group">
                <button 
                  onClick={() => {
                    navigate('/dashboard/photo-location-search');
                    setFabMenuOpen(false);
                  }}
                    className="w-12 h-12 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-primary-400 hover:border-primary-500 backdrop-blur-sm"
                >
                  <Navigation2 className="w-5 h-5" />
                </button>
                  {/* Tooltip */}
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                      Search Location from Photo
                      <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900"></div>
                    </div>
                  </div>
                </div>
                <div className="relative group">
                <button 
                  onClick={() => {
                    // Scroll to recent analyses
                    document.getElementById('recent-analyses')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setFabMenuOpen(false);
                  }}
                    className="w-12 h-12 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-primary-400 hover:border-primary-500 backdrop-blur-sm"
                >
                  <FileText className="w-5 h-5" />
                </button>
                  {/* Tooltip */}
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                      View Recent Analyses
                      <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Main FAB button */}
            <button 
              onClick={() => setFabMenuOpen(!fabMenuOpen)}
              className={`w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group border-2 border-primary-600 ${
                fabMenuOpen ? 'rotate-45' : ''
              }`}
              title={fabMenuOpen ? 'Close menu' : 'Quick actions'}
            >
              <Plus className={`w-6 h-6 transition-transform duration-300 ${fabMenuOpen ? 'rotate-0' : 'group-hover:rotate-90'}`} />
            </button>
          </div>
        </div>

        {/* Premium Status Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-primary-50/80 via-primary-50 to-primary-50/80 border-t border-primary-100/50 py-2.5 z-30 shadow-md backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-400 rounded-full blur-sm opacity-40 animate-pulse"></div>
                  <div className="relative w-2 h-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {loadingStats ? 'Loading...' : totalAnalyses > 0 ? 'Ready to Analyze' : 'Ready to Analyze'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-200 rounded-full blur-sm opacity-30"></div>
                  <CheckCircle className="relative w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {loadingStats ? '...' : `${successRate.toFixed(1)}%`} Success Rate
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-200 rounded-full blur-sm opacity-30"></div>
                  <Activity className="relative w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {loadingStats ? '...' : monthlyAnalyses} analyses this month
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastAnalysisTime ? (
                <>
                  <span className="text-sm text-slate-600">
                    Last analysis: {formatTimeAgo(lastAnalysisTime)}
                  </span>
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-400 rounded-full blur-sm opacity-40 animate-pulse"></div>
                    <div className="relative w-2 h-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full"></div>
                  </div>
                </>
              ) : (
                <span className="text-sm text-slate-500">No analyses yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App component with Routes
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPageRoute />} />
      <Route path="/invite" element={<InviteCodePageRoute />} />
      <Route path="/beta" element={<PrivateBetaPageRoute />} />
      <Route path="/invite-required" element={<InviteRequiredPageRoute />} />
      <Route path="/login" element={<LoginPageRoute />} />
      <Route path="/forgot-password" element={<ForgotPasswordPageRoute />} />
      <Route path="/reset-password" element={<ResetPasswordPageRoute />} />
      <Route path="/privacy" element={<PrivacyPolicyPageRoute />} />
      <Route path="/terms" element={<TermsConditionsPageRoute />} />
      <Route path="/acceptable-use" element={<AcceptableUsePageRoute />} />
      <Route path="/signup" element={<SignupPageRoute />} />
      <Route path="/auth/callback" element={<AuthCallbackRoute />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/payment" element={<ProtectedRoute><PaymentPageRoute /></ProtectedRoute>} />
      <Route path="/dashboard/credits" element={<ProtectedRoute><CreditsPageRoute /></ProtectedRoute>} />
      <Route path="/dashboard/account" element={<ProtectedRoute><AccountPageRoute /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPageRoute /></ProtectedRoute>} />
      <Route path="/dashboard/listing-analysis" element={<ProtectedRoute><ListingAnalysisRoute /></ProtectedRoute>} />
      <Route path="/dashboard/photo-location-search" element={<ProtectedRoute><PhotoLocationSearchRoute /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboardRoute /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;