import React from 'react';
import { X } from 'lucide-react';

/**
 * Badge component following design system specifications
 * @param {Object} props - Component props
 * @param {string} props.variant - Badge variant: 'solid' | 'outline' | 'subtle'
 * @param {string} props.color - Badge color: 'primary' | 'teal' | 'yellow' | 'turquoise' | 'shark' | 'success' | 'warning' | 'error' | 'info'
 * @param {string} props.size - Badge size: 'sm' | 'md' | 'lg'
 * @param {boolean} props.dismissible - Whether badge can be dismissed
 * @param {boolean} props.withDot - Whether to show leading dot
 * @param {Function} props.onDismiss - Callback when badge is dismissed
 * @param {React.ReactNode} props.children - Badge content
 */
export default function Badge({ 
  variant = 'solid', 
  color = 'primary', 
  size = 'md', 
  dismissible = false, 
  withDot = false, 
  onDismiss,
  children,
  className = ''
}) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const colorClasses = {
    primary: {
      solid: 'bg-primary-500 text-white',
      outline: 'bg-white text-primary-600 border border-primary-500',
      subtle: 'bg-primary-50 text-primary-600'
    },
    teal: {
      solid: 'bg-teal-500 text-white',
      outline: 'bg-white text-teal-600 border border-teal-500',
      subtle: 'bg-teal-50 text-teal-600'
    },
    yellow: {
      solid: 'bg-yellow-500 text-white',
      outline: 'bg-white text-yellow-600 border border-yellow-500',
      subtle: 'bg-yellow-50 text-yellow-600'
    },
    turquoise: {
      solid: 'bg-turquoise-500 text-white',
      outline: 'bg-white text-turquoise-600 border border-turquoise-500',
      subtle: 'bg-turquoise-50 text-turquoise-600'
    },
    shark: {
      solid: 'bg-shark-500 text-white',
      outline: 'bg-white text-shark-600 border border-shark-500',
      subtle: 'bg-shark-50 text-shark-600'
    },
    success: {
      solid: 'bg-primary-500 text-white',
      outline: 'bg-white text-primary-600 border border-primary-500',
      subtle: 'bg-primary-50 text-primary-600'
    },
    warning: {
      solid: 'bg-yellow-500 text-white',
      outline: 'bg-white text-yellow-600 border border-yellow-500',
      subtle: 'bg-yellow-50 text-yellow-600'
    },
    error: {
      solid: 'bg-red-500 text-white',
      outline: 'bg-white text-red-600 border border-red-500',
      subtle: 'bg-red-50 text-red-600'
    },
    info: {
      solid: 'bg-turquoise-500 text-white',
      outline: 'bg-white text-turquoise-600 border border-turquoise-500',
      subtle: 'bg-turquoise-50 text-turquoise-600'
    }
  };

  const dotColor = {
    primary: 'bg-primary-500',
    teal: 'bg-teal-500',
    yellow: 'bg-yellow-500',
    turquoise: 'bg-turquoise-500',
    shark: 'bg-shark-500',
    success: 'bg-primary-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-turquoise-500'
  };

  const baseClasses = 'inline-flex items-center gap-2 rounded-full font-medium transition-colors duration-200';
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color]?.[variant] || colorClasses.primary.solid;
  const dotClass = dotColor[color] || dotColor.primary;

  return (
    <span className={`${baseClasses} ${sizeClass} ${colorClass} ${className}`}>
      {withDot && (
        <div className={`w-2 h-2 rounded-full ${dotClass}`}></div>
      )}
      {children}
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-1 hover:opacity-70 transition-opacity duration-200"
          aria-label="Dismiss badge"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
