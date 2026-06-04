import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getSubscriptionStatus } from '../lib/subscriptionService';
import { SUBSCRIPTION_STATUS } from '../lib/subscriptionConfig';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

const SubscriptionContext = createContext();

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Listen for real-time updates to subscription data
    const subscriptionRef = ref(db, `clinics/${currentUser.uid}/subscription`);
    const unsubscribe = onValue(subscriptionRef, async () => {
      // Re-fetch formatted status whenever the raw data changes
      try {
        const status = await getSubscriptionStatus(currentUser.uid);
        setSubscription(status);
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const isActive = subscription?.status === SUBSCRIPTION_STATUS.ACTIVE;
  const planId = subscription?.plan;
  const isPro = isActive && planId === 'plan_SxF4Y20hilLoGQ'; // Using Pro plan ID
  const isGrowth = isActive && planId === 'plan_SxF3VFyjVMLyg1'; // Using Growth plan ID

  const value = {
    subscription,
    loading,
    isActive,
    isPro,
    isGrowth,
    planId
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
