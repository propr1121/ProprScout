/**
 * Street View Comparison Component - GeoSpy-inspired design
 * Split screen with Street View on left and uploaded image on right
 */

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Crosshair, AlertCircle } from 'lucide-react';

export default function StreetViewComparison({
  coordinates,
  uploadedImage,
  onBack,
  isVisible
}) {
  const streetViewRef = useRef(null);
  const panorama = useRef(null);
  const [streetViewError, setStreetViewError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isVisible || !coordinates || !streetViewRef.current) return;

    // Check if Google Maps is loaded
    if (!window.google || !window.google.maps) {
      setStreetViewError('Google Maps not loaded. Please add your API key.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setStreetViewError(null);

    // Check Street View availability first
    const streetViewService = new window.google.maps.StreetViewService();

    streetViewService.getPanorama(
      {
        location: { lat: coordinates.lat, lng: coordinates.lon },
        radius: 100, // Search within 100 meters
        preference: window.google.maps.StreetViewPreference.NEAREST
      },
      (data, status) => {
        if (status === window.google.maps.StreetViewStatus.OK) {
          // Street View is available
          panorama.current = new window.google.maps.StreetViewPanorama(
            streetViewRef.current,
            {
              position: { lat: coordinates.lat, lng: coordinates.lon },
              pov: { heading: 0, pitch: 0 },
              zoom: 1,
              addressControl: false,
              showRoadLabels: true,
              motionTracking: false,
              motionTrackingControl: false
            }
          );
          setLoading(false);
        } else {
          setStreetViewError('Street View not available at this location');
          setLoading(false);
        }
      }
    );

    return () => {
      if (panorama.current) {
        // Clean up panorama
        panorama.current = null;
      }
    };
  }, [coordinates, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 flex bg-[#0a0a0a]">
      {/* Street View (left side) */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#00d185] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Loading Street View...</p>
            </div>
          </div>
        )}

        {streetViewError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
            <div className="text-center max-w-sm">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-white font-medium mb-2">Street View Unavailable</p>
              <p className="text-gray-400 text-sm">{streetViewError}</p>
              <button
                onClick={onBack}
                className="mt-4 px-4 py-2 bg-[#00d185] text-white rounded-lg hover:bg-[#00b574] transition-colors"
              >
                Return to Map
              </button>
            </div>
          </div>
        )}

        <div
          ref={streetViewRef}
          className="w-full h-full"
          style={{ display: streetViewError ? 'none' : 'block' }}
        />

        {/* Street View label */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-lg">
          Street View
        </div>
      </div>

      {/* Divider */}
      <div className="w-1 bg-[#2a2a2a]" />

      {/* Uploaded Image (right side) */}
      <div className="w-2/5 relative bg-[#1a1a1a]">
        <img
          src={uploadedImage}
          alt="Uploaded"
          className="w-full h-full object-contain"
        />

        {/* Crosshair overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Outer circle */}
            <div className="w-16 h-16 border-2 border-white/30 rounded-full" />
            {/* Vertical line */}
            <div className="absolute top-1/2 left-1/2 w-px h-12 bg-white/30 -translate-x-1/2 -translate-y-1/2" />
            {/* Horizontal line */}
            <div className="absolute top-1/2 left-1/2 w-12 h-px bg-white/30 -translate-x-1/2 -translate-y-1/2" />
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#00d185] rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Image label */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-lg">
          Uploaded Image
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2
                 bg-[#1a1a1a] text-white rounded-lg border border-[#2a2a2a]
                 hover:bg-[#2a2a2a] transition-colors z-10"
      >
        <ArrowLeft size={16} />
        Back to results
      </button>

      {/* Coordinates badge */}
      {coordinates && (
        <div className="absolute top-4 right-4 bg-[#1a1a1a] text-white text-sm px-4 py-2 rounded-lg border border-[#2a2a2a] z-10">
          <span className="text-gray-400">Coordinates: </span>
          <span className="font-mono">
            {coordinates.lat?.toFixed(4)}, {coordinates.lon?.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
