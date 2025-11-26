/**
 * ProprHome Map Module - Fallback Banner
 * Shows when using Mapbox fallback instead of Google Maps
 */

import React, { useState } from 'react';

const MapFallbackBanner = ({
  message = 'Using alternative map view. Some features may be limited.',
  dismissible = true,
  className = ''
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className={`fallback-banner ${className}`} role="alert">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="banner-icon"
      >
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path
          d="M8 5v3M8 10v1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="banner-text">{message}</span>
      {dismissible && (
        <button
          className="banner-dismiss"
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss message"
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 3l8 8M11 3l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      <style>{`
        .fallback-banner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 8px 16px;
          background: #FEF3C7;
          border-bottom: 1px solid #FCD34D;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          color: #92400E;
        }

        .banner-icon {
          flex-shrink: 0;
          color: #D97706;
        }

        .banner-text {
          flex: 1;
        }

        .banner-dismiss {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          padding: 0;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #92400E;
          transition: all 0.2s ease;
        }

        .banner-dismiss:hover {
          background: rgba(217, 119, 6, 0.1);
        }

        .banner-dismiss:focus {
          outline: 2px solid #D97706;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default MapFallbackBanner;
