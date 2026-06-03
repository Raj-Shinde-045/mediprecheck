// Razorpay Subscription Configuration
export const RAZORPAY_CONFIG = {
  // Razorpay API Keys - Should be moved to environment variables in production
  KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SxF3VFyjVMLyg1',
  KEY_SECRET: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'NWRhymL8HNMkFKPTdJEznPPp',
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  growth: {
    id: 'plan_SxF3VFyjVMLyg1',
    name: 'Growth Plan',
    price: 2000,
    currency: 'INR',
    interval: 1,
    period: 'monthly',
    description: 'Perfect for small clinics',
    features: [
      'Up to 50 patients/month',
      'Basic AI Triage',
      'Single doctor support',
      'Email support'
    ]
  },
  pro: {
    id: 'plan_SxF4Y20hilLoGQ',
    name: 'Pro Plan',
    price: 3549,
    currency: 'INR',
    interval: 1,
    period: 'monthly',
    description: 'For established clinics',
    features: [
      'Unlimited patients',
      'Advanced AI Triage',
      'Multiple doctors support',
      'Priority support',
      'Analytics dashboard'
    ]
  }
};

// Subscription statuses
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PAUSED: 'paused'
};
