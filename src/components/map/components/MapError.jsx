/**
 * ProprHome Map Module - Error Display
 * Shows error state with helpful message
 */

import React from 'react';

const MapError = ({
  title = 'Unable to load map',
  message = 'Please try again later.',
  height = 400,
  onRetry
}) => {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className="map-error"
      style={{ height: heightStyle }}
      role="alert"
      aria-live="polite"
    >
      <div className="error-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 4C15.164 4 8 11.164 8 20c0 11.25 16 24 16 24s16-12.75 16-24c0-8.836-7.164-16-16-16z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="24" cy="20" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="6" y1="6" x2="42" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="error-title">{title}</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="error-retry" onClick={onRetry} type="button">
          Try Again
        </button>
      )}

      <style>{`
        .map-error {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #F8FAFC;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
        }

        .error-icon {
          color: #94A3B8;
          margin-bottom: 16px;
        }

        .error-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #334155;
          margin: 0 0 8px 0;
        }

        .error-message {
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          color: #64748B;
          margin: 0;
          max-width: 280px;
        }

        .error-retry {
          margin-top: 16px;
          padding: 8px 20px;
          background: #4ADE80;
          color: white;
          border: none;
          border-radius: 6px;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .error-retry:hover {
          background: #22C55E;
        }

        .error-retry:focus {
          outline: 2px solid #4ADE80;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default MapError;
