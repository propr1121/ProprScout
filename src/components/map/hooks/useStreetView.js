/**
 * ProprHome Map Module - Street View Hook
 * Handles Google Street View availability checking and initialization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MAP_DEFAULTS } from '../utils/constants';

/**
 * Check if Street View is available at given coordinates
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {google.maps.StreetViewService} service - Street View service instance
 * @param {number} radius - Search radius in meters
 * @returns {Promise<{ available: boolean, location?: google.maps.StreetViewLocation, distance?: number }>}
 */
export async function checkStreetViewAvailability(lat, lng, service, radius = MAP_DEFAULTS.streetViewRadius) {
  return new Promise((resolve) => {
    service.getPanorama(
      {
        location: { lat, lng },
        radius,
        preference: google.maps.StreetViewPreference.NEAREST,
        source: google.maps.StreetViewSource.OUTDOOR
      },
      (data, status) => {
        if (status === google.maps.StreetViewStatus.OK && data?.location) {
          // Calculate distance from requested location to actual panorama
          let distance = 0;
          if (data.location.latLng && window.google?.maps?.geometry) {
            distance = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(lat, lng),
              data.location.latLng
            );
          }

          resolve({
            available: true,
            location: data.location,
            distance,
            panoId: data.location.pano
          });
        } else {
          resolve({
            available: false,
            location: null,
            distance: null,
            panoId: null
          });
        }
      }
    );
  });
}

/**
 * Hook to manage Street View availability and state
 *
 * @param {Object} options
 * @param {typeof google} options.google - Google Maps API
 * @param {Object} options.coordinates - { lat, lng }
 * @param {boolean} options.enabled - Whether to check availability
 * @returns {{ available: boolean|null, checking: boolean, location: Object|null, initialize: Function }}
 */
export function useStreetView({ google, coordinates, enabled = true }) {
  const [state, setState] = useState({
    available: null,
    checking: false,
    location: null,
    distance: null,
    error: null
  });

  const serviceRef = useRef(null);
  const panoramaRef = useRef(null);

  // Initialize Street View service
  useEffect(() => {
    if (google?.maps?.StreetViewService && !serviceRef.current) {
      serviceRef.current = new google.maps.StreetViewService();
    }
  }, [google]);

  // Check availability when coordinates change
  useEffect(() => {
    if (!enabled || !serviceRef.current || !coordinates) {
      return;
    }

    const { lat, lng } = coordinates;

    setState(prev => ({ ...prev, checking: true, error: null }));

    checkStreetViewAvailability(lat, lng, serviceRef.current)
      .then((result) => {
        setState({
          available: result.available,
          checking: false,
          location: result.location,
          distance: result.distance,
          error: null
        });
      })
      .catch((error) => {
        setState({
          available: false,
          checking: false,
          location: null,
          distance: null,
          error
        });
      });
  }, [coordinates?.lat, coordinates?.lng, enabled, google]);

  /**
   * Initialize Street View panorama on a container
   *
   * @param {HTMLElement} container - DOM element to render Street View
   * @param {Object} options - Additional panorama options
   * @returns {google.maps.StreetViewPanorama|null}
   */
  const initialize = useCallback((container, options = {}) => {
    if (!google?.maps || !container || !state.location) {
      return null;
    }

    // Clean up existing panorama
    if (panoramaRef.current) {
      panoramaRef.current.setVisible(false);
    }

    const panoramaOptions = {
      position: state.location.latLng || coordinates,
      pov: {
        heading: 0,
        pitch: 0
      },
      zoom: 1,
      addressControl: true,
      addressControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_CENTER
      },
      panControl: true,
      panControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
      },
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
      },
      enableCloseButton: false,
      fullscreenControl: false,
      motionTracking: false,
      motionTrackingControl: false,
      ...options
    };

    panoramaRef.current = new google.maps.StreetViewPanorama(container, panoramaOptions);

    return panoramaRef.current;
  }, [google, state.location, coordinates]);

  /**
   * Update panorama position
   */
  const updatePosition = useCallback((lat, lng) => {
    if (panoramaRef.current && serviceRef.current) {
      checkStreetViewAvailability(lat, lng, serviceRef.current)
        .then((result) => {
          if (result.available && result.location?.latLng) {
            panoramaRef.current.setPosition(result.location.latLng);
          }
        });
    }
  }, []);

  /**
   * Clean up panorama
   */
  const destroy = useCallback(() => {
    if (panoramaRef.current) {
      panoramaRef.current.setVisible(false);
      panoramaRef.current = null;
    }
  }, []);

  return {
    available: state.available,
    checking: state.checking,
    location: state.location,
    distance: state.distance,
    error: state.error,
    initialize,
    updatePosition,
    destroy,
    panorama: panoramaRef.current
  };
}

export default useStreetView;
