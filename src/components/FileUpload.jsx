/**
 * File upload component with React Dropzone
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, AlertCircle, CheckCircle } from 'lucide-react';

const FileUpload = ({ 
  onUpload, 
  onRemove, 
  maxFiles = 5, 
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = ''
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
      } else {
        setError('File upload failed. Please try again.');
      }
      return;
    }

    // Add new files
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles, maxSize, acceptedTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {}),
    disabled: uploading
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (fileObj) => {
        const formData = new FormData();
        formData.append('image', fileObj.file);

        const response = await fetch('/api/geolocation/upload-and-predict', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        return { ...fileObj, result, status: 'success' };
      });

      const results = await Promise.all(uploadPromises);
      
      if (onUpload) {
        onUpload(results);
      }

      setFiles([]);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (fileId) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      if (onRemove) {
        onRemove(updated);
      }
      return updated;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <Upload className="w-12 h-12 mx-auto text-gray-400" />
          <div className="text-lg font-medium text-gray-900">
            {isDragActive ? 'Drop images here' : 'Upload property images'}
          </div>
          <div className="text-sm text-gray-500">
            Drag and drop or click to select
          </div>
          <div className="text-xs text-gray-400">
            Max {maxFiles} files, {Math.round(maxSize / 1024 / 1024)}MB each
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Selected Files</h3>
            <span className="text-sm text-gray-500">{files.length} of {maxFiles}</span>
          </div>
          
          <div className="space-y-2">
            {files.map((fileObj) => (
              <div
                key={fileObj.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <img
                    src={fileObj.preview}
                    alt={fileObj.file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {fileObj.file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(fileObj.file.size)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {fileObj.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  
                  <button
                    onClick={() => handleRemove(fileObj.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </div>
            ) : (
              'Upload & Analyze'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
