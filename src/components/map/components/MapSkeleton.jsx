/**
 * ProprHome Map Module - Loading Skeleton
 * Displays while map is loading
 */

import React from 'react';

const MapSkeleton = ({ height = 400 }) => {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className="map-skeleton"
      style={{ height: heightStyle }}
      data-testid="map-skeleton"
      role="progressbar"
      aria-label="Loading map"
    >
      <div className="skeleton-shimmer" />
      <div className="skeleton-content">
        <div className="skeleton-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 4C15.164 4 8 11.164 8 20c0 11.25 16 24 16 24s16-12.75 16-24c0-8.836-7.164-16-16-16z"
              fill="currentColor"
              opacity="0.3"
            />
            <circle cx="24" cy="20" r="6" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
        <span className="skeleton-text">Loading map...</span>
      </div>

      <style>{`
        .map-skeleton {
          position: relative;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          background-color: #F1F5F9;
        }

        .skeleton-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            #F1F5F9 25%,
            #E2E8F0 50%,
            #F1F5F9 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .skeleton-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          z-index: 1;
        }

        .skeleton-icon {
          color: #94A3B8;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .skeleton-text {
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          color: #64748B;
        }
      `}</style>
    </div>
  );
};

export default MapSkeleton;
