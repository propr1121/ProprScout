/**
 * Pricing Component
 * Subscription plans and pricing information
 */

import React, { useState, useEffect } from 'react';
import { Check, X, Star, Zap, Crown, ArrowRight } from 'lucide-react';

const Pricing = ({ className = '' }) => {
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const [plansRes, featuresRes, statusRes] = await Promise.all([
        fetch('http://localhost:6000/api/pricing/plans'),
        fetch('http://localhost:6000/api/pricing/features'),
        fetch('http://localhost:6000/api/pricing/user-status?user_id=anonymous')
      ]);

      const [plansData, featuresData, statusData] = await Promise.all([
        plansRes.json(),
        featuresRes.json(),
        statusRes.json()
      ]);

      if (plansData.success) setPlans(plansData.data.plans);
      if (featuresData.success) setFeatures(featuresData.data.features);
      if (statusData.success) setUserStatus(statusData.data);
    } catch (error) {
      console.error('Failed to fetch pricing data:', error);
      // Set mock data for development
      setPlans(getMockPlans());
      setFeatures(getMockFeatures());
      setUserStatus({ subscription: 'free', quota: { remaining: 3, limit: 3 } });
    } finally {
      setLoading(false);
    }
  };

  const getMockPlans = () => [
    {
      id: 'free',
      name: 'Free Plan',
      type: 'free',
      price: { monthly: 0, annual: 0 },
      features: {
        analyses_per_month: 3,
        basic_location_detection: true,
        address_lookup: true,
        map_view: true,
        analysis_history_limit: 10
      },
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      type: 'pro',
      price: { monthly: 29, annual: 290 },
      features: {
        analyses_per_month: 1000,
        basic_location_detection: true,
        address_lookup: true,
        map_view: true,
        analysis_history_limit: -1,
        advanced_features: true,
        property_type_detection: true,
        feature_detection: true,
        neighborhood_analysis: true,
        comparable_properties: true,
        export_pdf: true,
        api_access: true,
        priority_support: true,
        no_watermarks: true
      },
      popular: true
    },
    {
      id: 'annual',
      name: 'Annual Plan',
      type: 'annual',
      price: { monthly: 24, annual: 290 },
      features: {
        analyses_per_month: 1000,
        basic_location_detection: true,
        address_lookup: true,
        map_view: true,
        analysis_history_limit: -1,
        advanced_features: true,
        property_type_detection: true,
        feature_detection: true,
        neighborhood_analysis: true,
        comparable_properties: true,
        export_pdf: true,
        api_access: true,
        priority_support: true,
        no_watermarks: true
      },
      popular: false,
      savings: { percentage: 17, months_free: 2 }
    }
  ];

  const getMockFeatures = () => [
    { name: 'Monthly Analyses', free: '3', pro: 'Unlimited', annual: 'Unlimited' },
    { name: 'Location Detection', free: 'Basic', pro: 'Advanced', annual: 'Advanced' },
    { name: 'Address Lookup', free: '✓', pro: '✓', annual: '✓' },
    { name: 'Map View', free: '✓', pro: '✓', annual: '✓' },
    { name: 'Analysis History', free: 'Last 10', pro: 'Unlimited', annual: 'Unlimited' },
    { name: 'Property Type Detection', free: '✗', pro: '✓', annual: '✓' },
    { name: 'Feature Detection', free: '✗', pro: '✓', annual: '✓' },
    { name: 'Neighborhood Analysis', free: '✗', pro: '✓', annual: '✓' },
    { name: 'Comparable Properties', free: '✗', pro: '✓', annual: '✓' },
    { name: 'PDF Export', free: '✗', pro: '✓', annual: '✓' },
    { name: 'API Access', free: '✗', pro: '10/hour', annual: '10/hour' },
    { name: 'Priority Support', free: '✗', pro: '✓', annual: '✓' },
    { name: 'No Watermarks', free: '✗', pro: '✓', annual: '✓' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get unlimited property intelligence with our Pro plans. Start free, upgrade anytime.
        </p>
        
        {/* Current Status */}
        {userStatus && (
          <div className="mt-6 inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg">
            <Zap className="w-4 h-4" />
            <span className="font-medium">
              {userStatus.quota?.remaining || 3} of {userStatus.quota?.limit || 3} analyses remaining
            </span>
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl border-2 p-8 ${
              plan.popular 
                ? 'border-primary-500 shadow-xl scale-105' 
                : 'border-gray-200 shadow-lg'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Most Popular
                </div>
              </div>
            )}

            {plan.savings && (
              <div className="absolute -top-4 right-4">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Save {plan.savings.percentage}%
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                {plan.type === 'free' && <Zap className="w-8 h-8 text-gray-400" />}
                {plan.type === 'pro' && <Crown className="w-8 h-8 text-primary-500" />}
                {plan.type === 'annual' && <Star className="w-8 h-8 text-yellow-500" />}
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              </div>
              
              <div className="mb-4">
                <span className="text-5xl font-bold text-gray-900">€{plan.price.monthly}</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              
              {plan.price.annual > 0 && (
                <div className="text-sm text-gray-500">
                  or €{plan.price.annual}/year
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">
                  {plan.features.analyses_per_month === 1000 ? 'Unlimited' : plan.features.analyses_per_month} analyses per month
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Location detection</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Address lookup</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Map visualization</span>
              </div>

              {plan.features.advanced_features && (
                <>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Property type detection</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Feature detection</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Neighborhood analysis</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">PDF export</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">API access</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Priority support</span>
                  </div>
                </>
              )}
            </div>

            <button
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                plan.type === 'free'
                  ? 'bg-gray-100 text-gray-700 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-primary-500 hover:bg-primary-600 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
              disabled={plan.type === 'free'}
            >
              {plan.type === 'free' ? 'Current Plan' : 'Upgrade Now'}
              {plan.type !== 'free' && <ArrowRight className="w-4 h-4 inline ml-2" />}
            </button>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Feature Comparison</h2>
          <p className="text-gray-600 mt-2">Compare all features across our plans</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Feature</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Free</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Pro</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Annual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {features.map((feature, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {feature.name}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {feature.free}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {feature.pro}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {feature.annual}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How many analyses can I perform with the Free plan?
              </h3>
              <p className="text-gray-600">
                The Free plan includes 3 property analyses per month. Each analysis includes location detection, address lookup, and map visualization.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I exceed my monthly limit?
              </h3>
              <p className="text-gray-600">
                If you exceed your monthly limit, you'll need to wait until the next month or upgrade to a Pro or Annual plan for unlimited analyses.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription anytime. You'll continue to have access to Pro features until the end of your current billing period.
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) and PayPal through our secure Stripe payment processor.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial for Pro features?
              </h3>
              <p className="text-gray-600">
                Yes! New users get 3 free analyses to try our service. After that, you can upgrade to Pro for unlimited analyses and advanced features.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's the difference between Pro and Annual plans?
              </h3>
              <p className="text-gray-600">
                Both plans include the same features, but the Annual plan saves you 17% (€58 per year) and includes 2 months free compared to monthly Pro billing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
