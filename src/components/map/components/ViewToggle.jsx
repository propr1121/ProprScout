/**
 * ProprHome Map Module - View Toggle
 * Toggle between Map and Street View
 */

import React from 'react';

const ViewToggle = ({
  currentView,
  onViewChange,
  streetViewAvailable = true,
  className = ''
}) => {
  return (
    <div className={`view-toggle ${className}`} role="tablist" aria-label="Map view options">
      <button
        className={`toggle-button ${currentView === 'map' ? 'active' : ''}`}
        onClick={() => onViewChange('map')}
        role="tab"
        aria-selected={currentView === 'map'}
        aria-label="Map view"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1 4l5-2 4 2 5-2v10l-5 2-4-2-5 2V4z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M6 2v10M10 4v10" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>Map</span>
      </button>

      <button
        className={`toggle-button ${currentView === 'streetview' ? 'active' : ''} ${!streetViewAvailable ? 'disabled' : ''}`}
        onClick={() => streetViewAvailable && onViewChange('streetview')}
        disabled={!streetViewAvailable}
        role="tab"
        aria-selected={currentView === 'streetview'}
        aria-label={streetViewAvailable ? 'Street View' : 'Street View unavailable'}
        aria-disabled={!streetViewAvailable}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="4" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path
            d="M8 7v6M4 16c0-2.21 1.79-4 4-4s4 1.79 4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span>Street View</span>
      </button>

      <style>{`
        .view-toggle {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          display: flex;
          gap: 4px;
          background: white;
          padding: 4px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .toggle-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-button:hover:not(.disabled) {
          background: #F1F5F9;
        }

        .toggle-button.active {
          background: #4ADE80;
          color: white;
        }

        .toggle-button.active:hover {
          background: #22C55E;
        }

        .toggle-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toggle-button:focus {
          outline: 2px solid #4ADE80;
          outline-offset: 2px;
        }

        .toggle-button svg {
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .view-toggle {
            top: 8px;
            left: 8px;
          }

          .toggle-button {
            padding: 6px 12px;
            font-size: 13px;
          }

          .toggle-button span {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewToggle;
