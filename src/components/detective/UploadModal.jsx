/**
 * Upload Modal Component - GeoSpy-inspired design
 * Dark modal with image preview and editable filename
 */

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, ArrowRight } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [filename, setFilename] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreview(null);
      setFilename('');
    }
  }, [isOpen]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      // Revoke previous preview if exists
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setFile(selectedFile);
      setFilename(selectedFile.name);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleSubmit = () => {
    if (file) {
      onSubmit({ file, filename });
    }
  };

  const handleClear = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setFilename('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] rounded-xl p-6 w-full max-w-lg mx-4 border border-[#2a2a2a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Upload Image</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dropzone or Preview */}
        {!preview ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-all duration-200 min-h-[200px] flex flex-col items-center justify-center
              ${isDragActive
                ? 'border-[#00d185] bg-[#00d185]/10'
                : 'border-[#2a2a2a] hover:border-[#00d185]/50 hover:bg-[#1e1e1e]'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mb-4 text-gray-400" size={48} />
            <p className="text-white font-medium mb-2">
              {isDragActive ? 'Drop image here' : 'Drop image here or click to upload'}
            </p>
            <p className="text-gray-500 text-sm">
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image preview */}
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              {/* Clear button */}
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Filename input */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Image name
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-3
                         text-white focus:outline-none focus:border-[#00d185] transition-colors"
                placeholder="Enter image name..."
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-black
                     rounded-lg font-medium hover:bg-gray-100 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
