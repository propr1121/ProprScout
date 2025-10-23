import React from 'react';

/**
 * Progress Bar component following design system specifications
 * @param {Object} props - Component props
 * @param {number} props.value - Progress value (0-100)
 * @param {string} props.variant - Progress variant: 'linear' | 'circular'
 * @param {string} props.color - Progress color: 'primary' | 'teal' | 'yellow' | 'turquoise' | 'success' | 'warning' | 'error' | 'info'
 * @param {string} props.size - Progress size: 'sm' | 'md' | 'lg'
 * @param {boolean} props.showLabel - Whether to show percentage label
 * @param {string} props.label - Custom label text
 * @param {string} props.className - Additional CSS classes
 */
export default function ProgressBar({ 
  value = 0, 
  variant = 'linear', 
  color = 'primary', 
  size = 'md', 
  showLabel = true,
  label,
  className = ''
}) {
  const sizeClasses = {
    sm: variant === 'linear' ? 'h-2' : 'w-16 h-16',
    md: variant === 'linear' ? 'h-3' : 'w-20 h-20',
    lg: variant === 'linear' ? 'h-4' : 'w-24 h-24'
  };

  const colorClasses = {
    primary: 'bg-primary-500',
    teal: 'bg-teal-500',
    yellow: 'bg-yellow-500',
    turquoise: 'bg-turquoise-500',
    success: 'bg-primary-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-turquoise-500'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const clampedValue = Math.min(Math.max(value, 0), 100);
  const colorClass = colorClasses[color] || colorClasses.primary;
  const sizeClass = sizeClasses[size];
  const textSizeClass = textSizeClasses[size];

  if (variant === 'circular') {
    const radius = size === 'sm' ? 28 : size === 'md' ? 36 : 44;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg
          className={`${sizeClass} transform -rotate-90`}
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-semibold ${textSizeClass} text-gray-900`}>
              {label || `${Math.round(clampedValue)}%`}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className={`font-medium text-gray-700 ${textSizeClass}`}>
            {label || 'Progress'}
          </span>
          <span className={`font-semibold text-gray-900 ${textSizeClass}`}>
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClass}`}>
        <div
          className={`${colorClass} ${sizeClass} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${clampedValue}%` }}
        ></div>
      </div>
    </div>
  );
}
