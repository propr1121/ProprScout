/**
 * Lazy-loaded MapView Component
 * Reduces initial bundle size by loading Mapbox SDK only when needed
 */

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the actual MapView component (which imports mapbox-gl)
const MapViewComponent = lazy(() => import('./MapView'));

// Loading placeholder
function MapLoadingFallback() {
  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#00d185] animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading map...</p>
      </div>
    </div>
  );
}

export default function LazyMapView(props) {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <MapViewComponent {...props} />
    </Suspense>
  );
}
