/**
 * Results Sidebar Component - GeoSpy-inspired design
 * Right sidebar with coordinates, copy buttons, and action buttons
 */

import { useState } from 'react';
import {
  X,
  MapPin,
  Copy,
  Download,
  Target,
  FolderPlus,
  ChevronDown,
  Crop,
  Maximize2,
  Check,
  ExternalLink
} from 'lucide-react';

export default function ResultsSidebar({
  isOpen,
  onClose,
  result,
  imageUrl,
  filename,
  onSearchCity,
  onDownloadPDF,
  onStreetView
}) {
  const [copiedField, setCopiedField] = useState(null);
  const [expandedExplanation, setExpandedExplanation] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);

  if (!isOpen || !result) return null;

  const copyToClipboard = async (value, field) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const { coordinates, address, confidence, enrichment } = result;

  // Calculate confidence level
  const confidenceLevel = confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low';
  const confidenceColor = {
    high: 'text-[#00d185]',
    medium: 'text-yellow-500',
    low: 'text-red-500'
  }[confidenceLevel];

  return (
    <>
      {/* Sidebar */}
      <div className="absolute top-4 right-4 bottom-4 w-[340px] bg-[#1a1a1a]
                    rounded-xl border border-[#2a2a2a] overflow-hidden z-30
                    flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2 text-white">
            <MapPin size={18} className="text-[#00d185]" />
            <span className="font-medium">Results</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Filename */}
          <p className="text-gray-400 text-sm truncate">{filename}</p>

          {/* Image preview */}
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video group">
            <img
              src={imageUrl}
              alt="Analyzed"
              className="w-full h-full object-contain"
            />
            {/* Image controls */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="p-1.5 bg-black/50 rounded hover:bg-black/70 transition-colors"
                title="Crop"
              >
                <Crop size={14} className="text-white" />
              </button>
              <button
                onClick={() => setImageExpanded(true)}
                className="p-1.5 bg-black/50 rounded hover:bg-black/70 transition-colors"
                title="Expand"
              >
                <Maximize2 size={14} className="text-white" />
              </button>
            </div>
          </div>

          {/* Confidence indicator */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Confidence</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${confidenceColor}`}>
                {(confidence * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-gray-500 capitalize">
                ({confidenceLevel})
              </span>
            </div>
          </div>

          {/* Explanation */}
          <button
            onClick={() => setExpandedExplanation(!expandedExplanation)}
            className="flex items-center gap-2 text-gray-400 text-sm hover:text-white w-full transition-colors"
          >
            <Target size={14} />
            <span>Explanation: Worldwide location prediction</span>
            <ChevronDown
              size={14}
              className={`ml-auto transition-transform ${expandedExplanation ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedExplanation && (
            <div className="text-gray-500 text-xs bg-[#111] rounded-lg p-3">
              Our AI model analyzes visual features in the image to predict the geographic location.
              Confidence level indicates the certainty of the prediction.
            </div>
          )}

          {/* Coordinates grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Latitude */}
            <div className="space-y-1">
              <span className="text-gray-500 text-xs">Latitude</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm">
                  {coordinates?.lat?.toFixed(6) || '0.000000'}
                </span>
                <button
                  onClick={() => copyToClipboard(coordinates?.lat?.toFixed(6), 'lat')}
                  className="text-gray-500 hover:text-white transition-colors"
                  title="Copy latitude"
                >
                  {copiedField === 'lat' ? <Check size={14} className="text-[#00d185]" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* City */}
            <div className="space-y-1">
              <span className="text-gray-500 text-xs">City</span>
              <span className="text-white font-medium block truncate">
                {address?.city || 'Unknown'}
              </span>
            </div>

            {/* Longitude */}
            <div className="space-y-1">
              <span className="text-gray-500 text-xs">Longitude</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm">
                  {coordinates?.lon?.toFixed(6) || '0.000000'}
                </span>
                <button
                  onClick={() => copyToClipboard(coordinates?.lon?.toFixed(6), 'lon')}
                  className="text-gray-500 hover:text-white transition-colors"
                  title="Copy longitude"
                >
                  {copiedField === 'lon' ? <Check size={14} className="text-[#00d185]" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Country */}
            <div className="space-y-1">
              <span className="text-gray-500 text-xs">Country</span>
              <span className="text-white font-medium block truncate">
                {address?.country || 'Unknown'}
              </span>
            </div>
          </div>

          {/* District */}
          {address?.district && (
            <div className="space-y-1">
              <span className="text-gray-500 text-xs">District</span>
              <span className="text-white font-medium block">
                {address.district}
              </span>
            </div>
          )}

          {/* Full address */}
          {address?.formatted && (
            <div className="space-y-1">
              <span className="text-gray-500 text-xs">Full Address</span>
              <p className="text-white text-sm">
                {address.formatted}
              </p>
            </div>
          )}

          {/* Nearby amenities */}
          {enrichment && (
            <div className="border-t border-[#2a2a2a] pt-4">
              <h4 className="text-gray-400 text-sm mb-3">Nearby Amenities</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Schools</span>
                  <span className="text-white">{enrichment.schools || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transport</span>
                  <span className="text-white">{enrichment.transport || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Restaurants</span>
                  <span className="text-white">{enrichment.restaurants || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Markets</span>
                  <span className="text-white">{enrichment.supermarkets || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Confidence note */}
          <p className="text-gray-500 text-xs">
            Estimated region. Use street targeting for pinpoint location.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[#2a2a2a] space-y-2">
          <button
            onClick={onDownloadPDF}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                     bg-[#111] border border-[#2a2a2a] rounded-lg text-white
                     hover:bg-[#1e1e1e] transition-colors"
          >
            <Download size={16} />
            Download PDF Report
          </button>

          <button
            onClick={() => onSearchCity?.(address?.city)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                     bg-[#111] border border-[#2a2a2a] rounded-lg text-white
                     hover:bg-[#1e1e1e] transition-colors"
          >
            <Target size={16} />
            Search in {address?.city || 'this area'}
          </button>

          {onStreetView && (
            <button
              onClick={onStreetView}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                       bg-[#111] border border-[#2a2a2a] rounded-lg text-white
                       hover:bg-[#1e1e1e] transition-colors"
            >
              <ExternalLink size={16} />
              Compare with Street View
            </button>
          )}

          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                     bg-[#111] border border-[#2a2a2a] rounded-lg text-white
                     hover:bg-[#1e1e1e] transition-colors"
          >
            <FolderPlus size={16} />
            Add to case...
          </button>
        </div>
      </div>

      {/* Expanded image modal */}
      {imageExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setImageExpanded(false)}
        >
          <button
            onClick={() => setImageExpanded(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={imageUrl}
            alt="Analyzed - Full"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
