import React from 'react';
import { Check, X } from 'lucide-react';

/**
 * Status Steps component following design system specifications
 * @param {Object} props - Component props
 * @param {Array} props.steps - Array of step objects with { id, label, status, description }
 * @param {string} props.currentStep - Current active step ID
 * @param {string} props.variant - Steps variant: 'horizontal' | 'vertical'
 * @param {string} props.size - Steps size: 'sm' | 'md' | 'lg'
 * @param {string} props.className - Additional CSS classes
 */
export default function StatusSteps({ 
  steps = [], 
  currentStep, 
  variant = 'horizontal', 
  size = 'md',
  className = ''
}) {
  const sizeClasses = {
    sm: {
      step: 'w-8 h-8 text-xs',
      icon: 'w-4 h-4',
      text: 'text-xs',
      description: 'text-xs'
    },
    md: {
      step: 'w-10 h-10 text-sm',
      icon: 'w-5 h-5',
      text: 'text-sm',
      description: 'text-sm'
    },
    lg: {
      step: 'w-12 h-12 text-base',
      icon: 'w-6 h-6',
      text: 'text-base',
      description: 'text-base'
    }
  };

  const getStepStatus = (step, index) => {
    if (step.status === 'completed') return 'completed';
    if (step.status === 'error') return 'error';
    if (step.id === currentStep) return 'current';
    if (index < steps.findIndex(s => s.id === currentStep)) return 'completed';
    return 'pending';
  };

  const getStepClasses = (status) => {
    const baseClasses = 'flex items-center justify-center rounded-full font-semibold transition-all duration-200';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-primary-500 text-white`;
      case 'current':
        return `${baseClasses} bg-primary-100 text-primary-600 border-2 border-primary-500`;
      case 'error':
        return `${baseClasses} bg-red-500 text-white`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-500`;
    }
  };

  const getConnectorClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-primary-500';
      case 'current':
        return 'bg-primary-300';
      default:
        return 'bg-gray-200';
    }
  };

  const sizeClass = sizeClasses[size];

  if (variant === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex items-start gap-4">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div className={`${sizeClass.step} ${getStepClasses(status)}`}>
                  {status === 'completed' && <Check className={sizeClass.icon} />}
                  {status === 'error' && <X className={sizeClass.icon} />}
                  {status === 'current' && <span>{index + 1}</span>}
                  {status === 'pending' && <span>{index + 1}</span>}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-8 mt-2 ${getConnectorClasses(status)}`}></div>
                )}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 pb-4">
                <div className={`font-semibold text-gray-900 ${sizeClass.text}`}>
                  {step.label}
                </div>
                {step.description && (
                  <div className={`text-gray-600 mt-1 ${sizeClass.description}`}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => {
        const status = getStepStatus(step, index);
        const isLast = index === steps.length - 1;
        
        return (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div className={`${sizeClass.step} ${getStepClasses(status)}`}>
                {status === 'completed' && <Check className={sizeClass.icon} />}
                {status === 'error' && <X className={sizeClass.icon} />}
                {status === 'current' && <span>{index + 1}</span>}
                {status === 'pending' && <span>{index + 1}</span>}
              </div>
              <div className={`font-semibold text-gray-900 mt-2 ${sizeClass.text}`}>
                {step.label}
              </div>
              {step.description && (
                <div className={`text-gray-600 mt-1 text-center ${sizeClass.description}`}>
                  {step.description}
                </div>
              )}
            </div>
            
            {/* Connector Line */}
            {!isLast && (
              <div className="flex-1 flex items-center mx-4">
                <div className={`h-0.5 w-full ${getConnectorClasses(status)}`}></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
