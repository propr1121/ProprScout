/**
 * ProprHome Map Module - Map Controls
 * Fullscreen, zoom, and style controls
 */

import React, { useState } from 'react';

const MapControls = ({
  onFullscreen,
  onZoomIn,
  onZoomOut,
  onStyleChange,
  currentStyle = 'satellite',
  showStyleToggle = false,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    onFullscreen?.(newState);
  };

  return (
    <div className={`map-controls ${className}`}>
      {/* Fullscreen Button */}
      <button
        className="control-button"
        onClick={handleFullscreen}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        type="button"
      >
        {isFullscreen ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 12h2v2H4v-2zM14 12h2v2h-2v-2zM4 6h2v2H4V6zM14 6h2v2h-2V6z"
              fill="currentColor"
            />
            <path
              d="M8 4v4H4M12 4v4h4M8 16v-4H4M12 16v-4h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 7V3h4M13 3h4v4M3 13v4h4M13 17h4v-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Zoom Controls */}
      {(onZoomIn || onZoomOut) && (
        <div className="zoom-controls">
          {onZoomIn && (
            <button
              className="control-button"
              onClick={onZoomIn}
              aria-label="Zoom in"
              title="Zoom in"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 6v8M6 10h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
          {onZoomOut && (
            <button
              className="control-button"
              onClick={onZoomOut}
              aria-label="Zoom out"
              title="Zoom out"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 10h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Style Toggle */}
      {showStyleToggle && onStyleChange && (
        <button
          className="control-button style-toggle"
          onClick={() => onStyleChange(currentStyle === 'satellite' ? 'streets' : 'satellite')}
          aria-label={`Switch to ${currentStyle === 'satellite' ? 'street' : 'satellite'} view`}
          title={`Switch to ${currentStyle === 'satellite' ? 'street' : 'satellite'} view`}
          type="button"
        >
          {currentStyle === 'satellite' ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M3 10h14M10 3v14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M3 10h14M10 3c-2.5 2.5-2.5 11.5 0 14M10 3c2.5 2.5 2.5 11.5 0 14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </button>
      )}

      <style>{`
        .map-controls {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .control-button {
          width: 40px;
          height: 40px;
          border: none;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          transition: all 0.2s ease;
        }

        .control-button:hover {
          background: #F8FAFC;
          color: #334155;
          transform: scale(1.05);
        }

        .control-button:focus {
          outline: 2px solid #4ADE80;
          outline-offset: 2px;
        }

        .control-button:active {
          transform: scale(0.95);
        }

        .zoom-controls {
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .zoom-controls .control-button {
          box-shadow: none;
          border-radius: 0;
        }

        .zoom-controls .control-button:first-child {
          border-radius: 8px 8px 0 0;
        }

        .zoom-controls .control-button:last-child {
          border-radius: 0 0 8px 8px;
        }

        .zoom-controls .control-button + .control-button {
          border-top: 1px solid #E2E8F0;
        }

        @media (max-width: 640px) {
          .map-controls {
            top: 8px;
            right: 8px;
          }

          .control-button {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </div>
  );
};

export default MapControls;
