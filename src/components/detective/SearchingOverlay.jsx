/**
 * Searching Overlay Component
 * Full-screen "Searching Locations..." state with animated globe
 */

import { useEffect, useState } from 'react';
import { Globe, Target } from 'lucide-react';

export default function SearchingOverlay({ imagePreview, isVisible }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
      {/* Center card */}
      <div className="bg-[#1a1a1a]/95 backdrop-blur-sm rounded-xl px-8 py-6
                    border border-[#2a2a2a] text-center min-w-[320px] shadow-2xl">
        {/* Animated icon */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 animate-spin-slow">
            <Globe className="w-16 h-16 text-[#00d185]" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="w-6 h-6 text-[#00d185]" />
          </div>
        </div>

        <h3 className="text-white text-xl font-semibold mb-2">
          Searching Locations{dots}
        </h3>
        <p className="text-gray-400 text-sm">
          Using AI to predict<br />property location
        </p>
      </div>

      {/* Image thumbnail (bottom right) */}
      {imagePreview && (
        <div className="absolute bottom-6 right-6 w-32 h-24 rounded-lg overflow-hidden
                      border-2 border-white/20 shadow-2xl pointer-events-auto">
          <img
            src={imagePreview}
            alt="Analyzing"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
