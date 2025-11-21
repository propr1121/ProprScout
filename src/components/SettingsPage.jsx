import React, { useState } from 'react';
import { ArrowLeft, Settings as SettingsIcon, Globe, Bell, Download, Eye, Moon, Sun, CheckCircle, AlertCircle } from 'lucide-react';

function SettingsPage({ onBack }) {
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'light',
    notifications: {
      email: true,
      inApp: true,
      analysisComplete: true,
      lowCredits: true,
      newFeatures: false
    },
    privacy: {
      showEmail: false,
      showAnalyses: true,
      allowDataExport: true
    }
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  const toggleNotification = (key) => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key]
      }
    });
  };

  const togglePrivacy = (key) => {
    setPreferences({
      ...preferences,
      privacy: {
        ...preferences.privacy,
        [key]: !preferences.privacy[key]
      }
    });
  };

  const handleExport = () => {
    // Simulate data export
    setMessage({ type: 'success', text: 'Data export initiated. You will receive an email when ready.' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-heading">Settings</h1>
              <p className="text-slate-600">Customize your app experience and preferences</p>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Language & Display */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 font-heading mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language & Display
            </h2>
            
            <div className="space-y-6">
              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Theme
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                    className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                      preferences.theme === 'light'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <Sun className={`w-6 h-6 mx-auto mb-2 ${
                      preferences.theme === 'light' ? 'text-primary-600' : 'text-slate-400'
                    }`} />
                    <div className={`text-sm font-medium ${
                      preferences.theme === 'light' ? 'text-primary-900' : 'text-slate-600'
                    }`}>
                      Light
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                    className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                      preferences.theme === 'dark'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <Moon className={`w-6 h-6 mx-auto mb-2 ${
                      preferences.theme === 'dark' ? 'text-primary-600' : 'text-slate-400'
                    }`} />
                    <div className={`text-sm font-medium ${
                      preferences.theme === 'dark' ? 'text-primary-900' : 'text-slate-600'
                    }`}>
                      Dark
                    </div>
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">Dark mode coming soon</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 font-heading mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Bell className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Email Notifications</div>
                    <div className="text-xs text-slate-500">Receive notifications via email</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('email')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.notifications.email ? 'bg-primary-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Bell className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">In-App Notifications</div>
                    <div className="text-xs text-slate-500">Show notifications in the app</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('inApp')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.notifications.inApp ? 'bg-primary-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.notifications.inApp ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Analysis Complete</div>
                    <div className="text-xs text-slate-500">Notify when analysis finishes</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('analysisComplete')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.notifications.analysisComplete ? 'bg-primary-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.notifications.analysisComplete ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Low Credits Warning</div>
                    <div className="text-xs text-slate-500">Alert when credits are running low</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('lowCredits')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.notifications.lowCredits ? 'bg-primary-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.notifications.lowCredits ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">New Features</div>
                    <div className="text-xs text-slate-500">Updates about new features</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('newFeatures')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.notifications.newFeatures ? 'bg-primary-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.notifications.newFeatures ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Data */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 font-heading mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Privacy & Data
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Eye className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Show Email Address</div>
                    <div className="text-xs text-slate-500">Display your email in your profile</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => togglePrivacy('showEmail')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.privacy.showEmail ? 'bg-primary-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.privacy.showEmail ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Eye className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Show Analyses</div>
                    <div className="text-xs text-slate-500">Make your analyses visible to others</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => togglePrivacy('showAnalyses')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.privacy.showAnalyses ? 'bg-primary-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.privacy.showAnalyses ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Data Export */}
            <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Download className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 mb-1">Export Your Data</div>
                    <div className="text-xs text-slate-600">
                      Download all your data in a portable format
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;

