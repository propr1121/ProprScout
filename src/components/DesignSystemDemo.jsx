import React, { useState } from 'react';
import Badge from './Badge';
import ProgressBar from './ProgressBar';
import StatusSteps from './StatusSteps';
import Alert from './Alert';

/**
 * Design System Demo component to showcase all design system components
 */
export default function DesignSystemDemo() {
  const [dismissedBadges, setDismissedBadges] = useState(new Set());
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const handleBadgeDismiss = (badgeId) => {
    setDismissedBadges(prev => new Set([...prev, badgeId]));
  };

  const handleAlertDismiss = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const steps = [
    { id: '1', label: 'Property Found', status: 'completed', description: 'Successfully located property listing' },
    { id: '2', label: 'Data Extraction', status: 'completed', description: 'Extracted property details and images' },
    { id: '3', label: 'Analysis', status: 'current', description: 'Running AI-powered analysis' },
    { id: '4', label: 'Report', status: 'pending', description: 'Generating comprehensive report' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 font-heading mb-4">Design System Components</h1>
        <p className="text-xl text-gray-600">Complete component library following our design system specifications</p>
      </div>

      {/* Badges Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 font-heading mb-6">Badges</h2>
        <div className="space-y-6">
          {/* Solid Badges */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Solid Badges</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="solid" color="primary" size="sm">Primary</Badge>
              <Badge variant="solid" color="teal" size="md">Teal</Badge>
              <Badge variant="solid" color="yellow" size="lg">Yellow</Badge>
              <Badge variant="solid" color="turquoise">Turquoise</Badge>
              <Badge variant="solid" color="shark">Shark</Badge>
              <Badge variant="solid" color="success">Success</Badge>
              <Badge variant="solid" color="warning">Warning</Badge>
              <Badge variant="solid" color="error">Error</Badge>
              <Badge variant="solid" color="info">Info</Badge>
            </div>
          </div>

          {/* Outline Badges */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Outline Badges</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" color="primary">Primary</Badge>
              <Badge variant="outline" color="teal">Teal</Badge>
              <Badge variant="outline" color="yellow">Yellow</Badge>
              <Badge variant="outline" color="turquoise">Turquoise</Badge>
              <Badge variant="outline" color="shark">Shark</Badge>
            </div>
          </div>

          {/* Subtle Badges */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Subtle Badges</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="subtle" color="primary">Primary</Badge>
              <Badge variant="subtle" color="teal">Teal</Badge>
              <Badge variant="subtle" color="yellow">Yellow</Badge>
              <Badge variant="subtle" color="turquoise">Turquoise</Badge>
              <Badge variant="subtle" color="shark">Shark</Badge>
            </div>
          </div>

          {/* Badges with Dots */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Badges with Dots</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="solid" color="primary" withDot>With Dot</Badge>
              <Badge variant="outline" color="teal" withDot>With Dot</Badge>
              <Badge variant="subtle" color="yellow" withDot>With Dot</Badge>
            </div>
          </div>

          {/* Dismissible Badges */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Dismissible Badges</h3>
            <div className="flex flex-wrap gap-3">
              {!dismissedBadges.has('badge1') && (
                <Badge variant="solid" color="primary" dismissible onDismiss={() => handleBadgeDismiss('badge1')}>
                  Dismissible
                </Badge>
              )}
              {!dismissedBadges.has('badge2') && (
                <Badge variant="outline" color="teal" dismissible onDismiss={() => handleBadgeDismiss('badge2')}>
                  Dismissible
                </Badge>
              )}
              {!dismissedBadges.has('badge3') && (
                <Badge variant="subtle" color="yellow" dismissible onDismiss={() => handleBadgeDismiss('badge3')}>
                  Dismissible
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bars Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 font-heading mb-6">Progress Bars</h2>
        <div className="space-y-6">
          {/* Linear Progress Bars */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Linear Progress Bars</h3>
            <div className="space-y-4">
              <ProgressBar value={75} color="primary" size="sm" label="Small Progress" />
              <ProgressBar value={60} color="teal" size="md" label="Medium Progress" />
              <ProgressBar value={45} color="yellow" size="lg" label="Large Progress" />
              <ProgressBar value={90} color="turquoise" showLabel={false} />
            </div>
          </div>

          {/* Circular Progress Bars */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Circular Progress Bars</h3>
            <div className="flex gap-8">
              <ProgressBar variant="circular" value={75} color="primary" size="sm" />
              <ProgressBar variant="circular" value={60} color="teal" size="md" />
              <ProgressBar variant="circular" value={45} color="yellow" size="lg" />
              <ProgressBar variant="circular" value={90} color="turquoise" />
            </div>
          </div>
        </div>
      </section>

      {/* Status Steps Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 font-heading mb-6">Status Steps</h2>
        <div className="space-y-8">
          {/* Horizontal Steps */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Horizontal Steps</h3>
            <StatusSteps 
              steps={steps} 
              currentStep="3" 
              variant="horizontal" 
              size="md"
            />
          </div>

          {/* Vertical Steps */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Vertical Steps</h3>
            <StatusSteps 
              steps={steps} 
              currentStep="3" 
              variant="vertical" 
              size="md"
            />
          </div>
        </div>
      </section>

      {/* Alerts Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 font-heading mb-6">Alerts</h2>
        <div className="space-y-4">
          {!dismissedAlerts.has('alert1') && (
            <Alert 
              variant="success" 
              title="Analysis Complete" 
              dismissible 
              onDismiss={() => handleAlertDismiss('alert1')}
            >
              Your property analysis has been completed successfully. All data points have been processed.
            </Alert>
          )}
          
          {!dismissedAlerts.has('alert2') && (
            <Alert 
              variant="info" 
              title="Processing Property Data" 
              dismissible 
              onDismiss={() => handleAlertDismiss('alert2')}
            >
              We're currently analyzing the property data. This may take a few moments.
            </Alert>
          )}
          
          {!dismissedAlerts.has('alert3') && (
            <Alert 
              variant="warning" 
              title="Limited Data Available" 
              dismissible 
              onDismiss={() => handleAlertDismiss('alert3')}
            >
              Some property information could not be extracted. The analysis may be incomplete.
            </Alert>
          )}
          
          {!dismissedAlerts.has('alert4') && (
            <Alert 
              variant="error" 
              title="Analysis Failed" 
              dismissible 
              onDismiss={() => handleAlertDismiss('alert4')}
            >
              Unable to analyze this property. Please try a different URL or check your connection.
            </Alert>
          )}
        </div>
      </section>

      {/* Typography Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 font-heading mb-6">Typography</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-6xl font-bold text-gray-900 font-heading">Display XL</h1>
            <p className="text-sm text-gray-500">Montserrat Bold, 60px</p>
          </div>
          <div>
            <h2 className="text-5xl font-bold text-gray-900 font-heading">Display LG</h2>
            <p className="text-sm text-gray-500">Montserrat Bold, 48px</p>
          </div>
          <div>
            <h3 className="text-4xl font-semibold text-gray-900 font-heading">Heading 1</h3>
            <p className="text-sm text-gray-500">Montserrat Semibold, 36px</p>
          </div>
          <div>
            <h4 className="text-3xl font-semibold text-gray-900 font-heading">Heading 2</h4>
            <p className="text-sm text-gray-500">Montserrat Semibold, 30px</p>
          </div>
          <div>
            <h5 className="text-2xl font-medium text-gray-900 font-heading">Heading 3</h5>
            <p className="text-sm text-gray-500">Montserrat Medium, 24px</p>
          </div>
          <div>
            <h6 className="text-xl font-medium text-gray-900 font-heading">Heading 4</h6>
            <p className="text-sm text-gray-500">Montserrat Medium, 20px</p>
          </div>
          <div>
            <p className="text-lg text-gray-900">Body Large - Poppins Normal, 18px</p>
            <p className="text-base text-gray-900">Body Medium - Poppins Normal, 16px</p>
            <p className="text-sm text-gray-900">Body Small - Poppins Normal, 14px</p>
            <p className="text-xs font-medium text-gray-900">Caption - Poppins Medium, 12px</p>
            <p className="text-sm font-semibold text-gray-900">Button Text - Poppins Semibold, 14px</p>
          </div>
        </div>
      </section>
    </div>
  );
}
