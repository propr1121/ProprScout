/**
 * SSO Auth Callback Handler
 * Handles OAuth redirects from Google/LinkedIn
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback({ onSuccess, onError }) {
  const { handleSSOCallback } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);

      // Check for error first
      const errorParam = urlParams.get('error');
      if (errorParam) {
        setStatus('error');
        setMessage(errorParam.replace(/_/g, ' '));
        setTimeout(() => onError?.(errorParam), 2000);
        return;
      }

      // Process tokens
      const result = await handleSSOCallback(urlParams);

      if (result.success) {
        setStatus('success');
        setMessage('Successfully signed in!');

        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);

        setTimeout(() => onSuccess?.(result.user), 1500);
      } else {
        setStatus('error');
        setMessage(result.error || 'Authentication failed');
        setTimeout(() => onError?.(result.error), 2000);
      }
    };

    processCallback();
  }, [handleSSOCallback, onSuccess, onError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-12 shadow-2xl text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Completing Sign In</h2>
            <p className="text-gray-400">Please wait while we verify your credentials...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
