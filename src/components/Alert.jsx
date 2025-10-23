import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Alert component following design system specifications
 * @param {Object} props - Component props
 * @param {string} props.variant - Alert variant: 'info' | 'success' | 'warning' | 'error'
 * @param {string} props.size - Alert size: 'sm' | 'md' | 'lg'
 * @param {boolean} props.dismissible - Whether alert can be dismissed
 * @param {Function} props.onDismiss - Callback when alert is dismissed
 * @param {string} props.title - Alert title
 * @param {React.ReactNode} props.children - Alert content
 * @param {string} props.className - Additional CSS classes
 */
export default function Alert({ 
  variant = 'info', 
  size = 'md', 
  dismissible = false, 
  onDismiss,
  title,
  children,
  className = ''
}) {
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const variantClasses = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-900',
      content: 'text-blue-800'
    },
    success: {
      container: 'bg-primary-50 border-primary-200',
      icon: 'text-primary-500',
      title: 'text-primary-900',
      content: 'text-primary-800'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-900',
      content: 'text-yellow-800'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      title: 'text-red-900',
      content: 'text-red-800'
    }
  };

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle
  };

  const Icon = icons[variant];
  const sizeClass = sizeClasses[size];
  const iconSizeClass = iconSizeClasses[size];
  const variantClass = variantClasses[variant];
  const baseClasses = 'rounded-lg border flex items-start gap-3 transition-all duration-200';

  return (
    <div className={`${baseClasses} ${sizeClass} ${variantClass.container} ${className}`}>
      <Icon className={`${iconSizeClass} ${variantClass.icon} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        {title && (
          <h3 className={`font-semibold ${variantClass.title} mb-1`}>
            {title}
          </h3>
        )}
        <div className={`${variantClass.content}`}>
          {children}
        </div>
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className={`${variantClass.icon} hover:opacity-70 transition-opacity duration-200 flex-shrink-0`}
          aria-label="Dismiss alert"
        >
          <X className={iconSizeClass} />
        </button>
      )}
    </div>
  );
}
