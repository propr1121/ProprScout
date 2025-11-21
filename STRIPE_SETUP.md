# Stripe Payment Integration Setup

## Overview
The payment page uses Stripe Payment Element which supports:
- Credit/Debit Cards
- PayPal
- Apple Pay
- Google Pay

## Setup Instructions

### 1. Get Stripe API Keys

1. Sign up for a Stripe account at https://stripe.com
2. Go to Developers > API Keys
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)

### 2. Configure Environment Variables

#### Frontend (.env.local in root directory)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

#### Backend (.env in backend/backend directory)
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here  # Optional for webhooks
```

### 3. Test the Integration

1. Start all servers:
   ```bash
   # Frontend (port 3000)
   npm run dev
   
   # Express Backend (port 3001)
   cd backend/backend && npm run dev
   
   # Flask Backend (port 5000)
   cd backend && python3 app.py
   ```

2. Navigate to the dashboard and click "Upgrade to Premium"
3. Select a plan (Annual is default)
4. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

### 4. Payment Flow

1. User clicks "Upgrade to Premium" → Navigates to payment page
2. User selects plan (Annual/Monthly) → Creates new payment intent
3. Stripe Payment Element loads → Shows all available payment methods
4. User completes payment → Redirects to success page
5. Webhook receives payment confirmation → Updates user subscription

### 5. Webhook Setup (Optional)

For production, set up webhooks to handle payment events:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Pricing

- **Annual Plan**: €290/year (€24/month) - Save 17%
- **Monthly Plan**: €29/month

Prices are in cents in the backend:
- Annual: 29,000 cents (€290)
- Monthly: 2,900 cents (€29)

## Files

- Frontend: `src/components/PaymentPage.jsx`
- Backend: `backend/backend/routes/payments.js`
- Payment Intent API: `POST /api/payments/create-intent`
- Webhook Handler: `POST /api/payments/webhook`

## Testing

Use Stripe's test mode for development. Test cards are available at:
https://stripe.com/docs/testing

Common test cards:
- Visa: `4242 4242 4242 4242`
- Visa (debit): `4000 0566 5566 5556`
- Mastercard: `5555 5555 5555 4444`
- 3D Secure: `4000 0025 0000 3155`

