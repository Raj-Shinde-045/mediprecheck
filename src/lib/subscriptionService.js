import { db } from './firebase';
import { ref, get, set, update } from 'firebase/database';
import { RAZORPAY_CONFIG, SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUS } from './subscriptionConfig';

// Load Razorpay Script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Get user's current subscription
export const getUserSubscription = async (clinicId) => {
  try {
    const subscriptionRef = ref(db, `clinics/${clinicId}/subscription`);
    const snapshot = await get(subscriptionRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
};

// Save subscription details to Firebase
export const saveSubscriptionToDatabase = async (clinicId, subscriptionData) => {
  try {
    const subscriptionRef = ref(db, `clinics/${clinicId}/subscription`);
    await set(subscriptionRef, {
      ...subscriptionData,
      updatedAt: new Date().toISOString(),
      createdAt: subscriptionData.createdAt || new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving subscription:', error);
    throw error;
  }
};

// Handle Razorpay Payment for Subscription
export const initiateRazorpayPayment = async (planId, clinicId, clinicEmail, clinicName) => {
  try {
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan selected');
    }

    // Load Razorpay script
    const isRazorpayLoaded = await loadRazorpayScript();
    if (!isRazorpayLoaded) {
      throw new Error('Failed to load Razorpay. Please try again.');
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: RAZORPAY_CONFIG.KEY_ID,
        amount: plan.price * 100, // Amount in paise
        currency: plan.currency,
        name: 'MedipreCheck',
        description: `${plan.name} - Monthly Subscription`,
        image: '/logo.png', // Add your logo if available
        receipt: `receipt_${clinicId}_${Date.now()}`,
        notes: {
          clinicId: clinicId,
          planId: planId,
          planName: plan.name
        },
        handler: function (response) {
          // Payment successful
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id || null,
            orderId: response.razorpay_order_id || null,
            signature: response.razorpay_signature || null
          });
        },
        modal: {
          ondismiss: () => {
            resolve({
              success: false,
              error: 'Payment cancelled by user'
            });
          }
        },
        prefill: {
          email: clinicEmail,
          name: clinicName
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response) => {
        reject({
          success: false,
          error: response.error.description,
          code: response.error.code
        });
      });

      rzp.open();
    });
  } catch (error) {
    console.error('Error initiating Razorpay payment:', error);
    throw error;
  }
};

// Get subscription status
export const getSubscriptionStatus = async (clinicId) => {
  try {
    const subscription = await getUserSubscription(clinicId);
    
    if (!subscription) {
      return {
        status: 'no_subscription',
        message: 'No active subscription'
      };
    }

    const expiryDate = new Date(subscription.expiryDate);
    const currentDate = new Date();

    if (expiryDate < currentDate) {
      return {
        status: SUBSCRIPTION_STATUS.EXPIRED,
        plan: subscription.planId,
        message: `Your ${subscription.planName} expired on ${expiryDate.toLocaleDateString()}`
      };
    }

    if (subscription.status === SUBSCRIPTION_STATUS.CANCELLED) {
      return {
        status: SUBSCRIPTION_STATUS.CANCELLED,
        plan: subscription.planId,
        message: `Your ${subscription.planName} has been cancelled`
      };
    }

    return {
      status: SUBSCRIPTION_STATUS.ACTIVE,
      plan: subscription.planId,
      planName: subscription.planName,
      expiryDate: subscription.expiryDate,
      daysRemaining: Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24)),
      message: `Your ${subscription.planName} is active`
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error;
  }
};

// Create or update subscription after successful payment
export const createSubscription = async (clinicId, planId, paymentData) => {
  try {
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan');
    }

    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const subscriptionData = {
      planId: planId,
      planName: plan.name,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      amount: plan.price,
      currency: plan.currency,
      paymentId: paymentData.paymentId,
      orderId: paymentData.orderId,
      signature: paymentData.signature,
      startDate: startDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      autoRenew: true
    };

    await saveSubscriptionToDatabase(clinicId, subscriptionData);
    return subscriptionData;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (clinicId) => {
  try {
    const subscriptionRef = ref(db, `clinics/${clinicId}/subscription`);
    await update(subscriptionRef, {
      status: SUBSCRIPTION_STATUS.CANCELLED,
      cancelledAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

// Upgrade subscription plan
export const upgradeSubscription = async (clinicId, newPlanId, currentPaymentData) => {
  try {
    // First cancel current subscription (optional - store it in history)
    // Then create new subscription
    await createSubscription(clinicId, newPlanId, currentPaymentData);
    return true;
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    throw error;
  }
};
