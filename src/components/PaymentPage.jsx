import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { ArrowLeft, CheckCircle, Sparkles, CreditCard, Shield, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Initialize Stripe - Only if key is provided (prevents errors)
// Memoize the promise to avoid re-initialization
let stripePromiseInstance = null;

const getStripePromise = () => {
  if (stripePromiseInstance !== null) {
    return stripePromiseInstance;
  }
  
  try {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (key && typeof key === 'string' && key.startsWith('pk_') && key.length > 10) {
      stripePromiseInstance = loadStripe(key);
      return stripePromiseInstance;
    }
  } catch (error) {
    console.warn('Stripe not configured:', error);
  }
  
  stripePromiseInstance = null;
  return null;
};

function PaymentForm({ selectedPlan, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setProcessing(false);
      return;
    }

    // Confirm payment
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-slate-200 rounded-lg p-4 bg-white min-h-[300px]">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Complete Payment
          </>
        )}
      </button>
    </form>
  );
}

function PaymentFormWrapper({ selectedPlan, onBack }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Check Stripe configuration first - before attempting to create payment intent
  const stripePromise = getStripePromise();
  
  useEffect(() => {
    // Don't attempt to create payment intent if Stripe is not configured
    if (!stripePromise) {
      setLoading(false);
      setError('Stripe publishable key is not configured');
      return;
    }

    let isMounted = true;
    let timeoutId;
    let abortController;
    
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create abort controller for timeout
        abortController = new AbortController();
        timeoutId = setTimeout(() => abortController.abort(), 25000); // 25 second timeout
        
        const response = await fetch(`${API_URL}/api/payments/create-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan: selectedPlan, // 'annual' or 'monthly'
          }),
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);
        
        if (!isMounted) return;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Server error' }));
          setError(errorData.error || errorData.message || `Server error (${response.status})`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || data.message || 'Failed to initialize payment');
        }
      } catch (err) {
        if (!isMounted) return;
        
        if (err.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else if (err.message) {
          setError(err.message);
        } else {
          setError('Failed to connect to payment server. Please check your connection and ensure the backend is running.');
        }
        console.error('Payment intent creation error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    createPaymentIntent();
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (abortController) abortController.abort();
    };
  }, [selectedPlan, stripePromise, retryCount]);

  // Check Stripe configuration first
  if (!stripePromise) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex-1 flex flex-col justify-center">
        <p className="font-semibold mb-1">Stripe Configuration Required</p>
        <p className="text-sm">Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env.local file</p>
        <p className="text-xs mt-2">See STRIPE_SETUP.md for instructions</p>
        <p className="text-xs mt-2 text-slate-600">Note: The payment form requires a valid Stripe publishable key to load.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
        <p className="font-semibold mb-2">Payment Setup Error</p>
        <p className="text-sm mb-3">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            setClientSecret(null);
            // Increment retryCount to trigger useEffect
            setRetryCount(prev => prev + 1);
          }}
          className="text-xs underline hover:no-underline text-red-800 font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-slate-600 text-sm">Initializing payment form...</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#10b981', // Primary green color
            colorBackground: '#ffffff',
            colorText: '#1e293b',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
        // Remove paymentMethodTypes - let Payment Element handle it automatically
        // based on the Payment Intent configuration
      }}
    >
      <PaymentForm selectedPlan={selectedPlan} onBack={onBack} />
    </Elements>
  );
}

export default function PaymentPage({ onBack }) {
  const [selectedPlan, setSelectedPlan] = useState('annual'); // Default to annual

  const plans = {
    annual: {
      name: 'Annual Plan',
      price: 290,
      pricePerMonth: 24,
      interval: 'year',
      savings: '17%',
      description: '€290 payable today',
    },
    monthly: {
      name: 'Monthly Plan',
      price: 29,
      pricePerMonth: 29,
      interval: 'month',
      savings: null,
      description: '€29 payable today',
    },
  };

  const currentPlan = plans[selectedPlan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 font-heading mb-3">
              Upgrade to Premium
            </h1>
            <p className="text-lg text-slate-600">
              Unlock unlimited analyses and premium features
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* Plan Selection */}
          <div className="md:col-span-1 flex">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-8 w-full flex flex-col min-h-[500px]">
              <h2 className="text-xl font-bold text-slate-900 font-heading mb-4">
                Select Plan
              </h2>
              
              <div className="space-y-3 mb-6">
                {/* Annual Plan */}
                <button
                  onClick={() => setSelectedPlan('annual')}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedPlan === 'annual'
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">Annual</span>
                    {selectedPlan === 'annual' && (
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-2">€{plans.annual.pricePerMonth} / Month</div>
                  <div className="text-xs text-slate-600 mb-1">€{plans.annual.price} payable today</div>
                  <div className="text-xs text-primary-600 font-semibold">
                    (Annual Billing Saves {plans.annual.savings})
                  </div>
                </button>

                {/* Monthly Plan */}
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">Monthly</span>
                    {selectedPlan === 'monthly' && (
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-2">€{plans.monthly.pricePerMonth} / Month</div>
                  <div className="text-xs text-slate-600 mb-1">€{plans.monthly.price} payable today</div>
                  <div className="text-xs text-slate-600">
                    (Monthly Billing)
                  </div>
                </button>
              </div>

              {/* Plan Summary */}
              <div className="border-t border-slate-200 pt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-primary-600" />
                    <span>Unlimited Analyses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-primary-600" />
                    <span>Advanced Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-primary-600" />
                    <span>API Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-primary-600" />
                    <span>24/7 Priority Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-2 flex">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 w-full flex flex-col min-h-[500px]">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 font-heading mb-2">
                  Payment Details
                </h2>
                <p className="text-slate-600">
                  Your payment is secured and encrypted with Stripe
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-600">{currentPlan.name}</span>
                  <span className="text-sm font-semibold text-slate-900">€{currentPlan.pricePerMonth} / Month</span>
                </div>
                <div className="text-xs text-slate-500 mb-3">{currentPlan.description}</div>
                {currentPlan.savings && (
                  <div className="text-xs text-primary-600 font-semibold mb-2">
                    Save {currentPlan.savings} with annual billing
                  </div>
                )}
                <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Payable Today</span>
                  <span className="text-xl font-bold text-slate-900">€{currentPlan.price}</span>
                </div>
              </div>

              {/* Stripe Payment Element */}
              <div className="flex-1 flex flex-col">
                <PaymentFormWrapper selectedPlan={selectedPlan} onBack={onBack} />
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary-600" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-600" />
                  <span>14-day guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary-600" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
