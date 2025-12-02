/**
 * Authentication Context Provider
 * Manages user authentication state across the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Auth Context
const AuthContext = createContext(null);

// Token storage keys
const TOKEN_KEY = 'proprscout_token';
const REFRESH_TOKEN_KEY = 'proprscout_refresh_token';
const USER_KEY = 'proprscout_user';

/**
 * Get stored token
 */
function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Get stored refresh token
 */
function getStoredRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Get stored user
 */
function getStoredUser() {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

/**
 * Store auth data
 */
function storeAuthData(token, refreshToken, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('Failed to store auth data:', e);
  }
}

/**
 * Clear auth data
 */
function clearAuthData() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn('Failed to clear auth data:', e);
  }
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  /**
   * Fetch current user profile
   */
  const fetchProfile = useCallback(async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          return data.data.user;
        }
      }
      return null;
    } catch (e) {
      console.error('Failed to fetch profile:', e);
      return null;
    }
  }, []);

  /**
   * Refresh access token
   */
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.token) {
          setToken(data.data.token);
          localStorage.setItem(TOKEN_KEY, data.data.token);
          return data.data.token;
        }
      }
      return null;
    } catch (e) {
      console.error('Token refresh failed:', e);
      return null;
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();

      if (storedToken) {
        // Validate token by fetching profile
        const profile = await fetchProfile(storedToken);

        if (profile) {
          setUser(profile);
          setToken(storedToken);
        } else {
          // Token invalid, try refresh
          const newToken = await refreshAccessToken();
          if (newToken) {
            const profile = await fetchProfile(newToken);
            if (profile) {
              setUser(profile);
            } else {
              clearAuthData();
              setUser(null);
              setToken(null);
            }
          } else {
            clearAuthData();
            setUser(null);
            setToken(null);
          }
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [fetchProfile, refreshAccessToken]);

  /**
   * Register new user
   */
  const register = useCallback(async ({ email, password, name, inviteCode, company, location }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name, inviteCode, company, location })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors with details array
        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
          const errorMessages = data.details.map(d => d.msg).join('. ');
          throw new Error(errorMessages);
        }
        throw new Error(data.error || data.message || 'Registration failed');
      }

      if (data.success && data.data) {
        const { user: userData, token: authToken, refreshToken } = data.data;
        storeAuthData(authToken, refreshToken, userData);
        setUser(userData);
        setToken(authToken);
        return { success: true, user: userData };
      }

      throw new Error('Unexpected response format');
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with email/password
   */
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data) {
        const { user: userData, token: authToken, refreshToken } = data.data;
        storeAuthData(authToken, refreshToken, userData);
        setUser(userData);
        setToken(authToken);
        return { success: true, user: userData };
      }

      throw new Error('Unexpected response format');
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (e) {
      console.warn('Logout API call failed:', e);
    }

    clearAuthData();
    setUser(null);
    setToken(null);
    setError(null);
  }, [token]);

  /**
   * Handle SSO callback (parse tokens from URL)
   */
  const handleSSOCallback = useCallback(async (searchParams) => {
    const authToken = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(errorParam.replace(/_/g, ' '));
      return { success: false, error: errorParam };
    }

    if (authToken && refreshToken) {
      // Fetch user profile
      const profile = await fetchProfile(authToken);

      if (profile) {
        storeAuthData(authToken, refreshToken, profile);
        setUser(profile);
        setToken(authToken);
        return { success: true, user: profile };
      }
    }

    setError('SSO authentication failed');
    return { success: false, error: 'SSO authentication failed' };
  }, [fetchProfile]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates) => {
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      if (data.success && data.data?.user) {
        const updatedUser = { ...user, ...data.data.user };
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }

      throw new Error('Unexpected response format');
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [token, user]);

  /**
   * Change password
   */
  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [token]);

  /**
   * Get referral code
   */
  const getReferralCode = useCallback(async () => {
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/referral-code`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (e) {
      console.error('Failed to get referral code:', e);
      return null;
    }
  }, [token]);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    if (!token) return;

    const profile = await fetchProfile(token);
    if (profile) {
      setUser(profile);
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    }
  }, [token, fetchProfile]);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    handleSSOCallback,
    updateProfile,
    changePassword,
    getReferralCode,
    refreshUser,
    clearError,
    // SSO URLs
    googleAuthUrl: `${API_BASE_URL}/api/auth/google`,
    linkedInAuthUrl: `${API_BASE_URL}/api/auth/linkedin`
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
