import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  CreditCard,
  Check,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  initiateRazorpayPayment,
  getUserSubscription,
  createSubscription,
  getSubscriptionStatus,
  cancelSubscription
} from '../../lib/subscriptionService';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUS } from '../../lib/subscriptionConfig';

export function SubscriptionCard({ clinicId, clinicEmail, clinicName }) {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    loadSubscriptionInfo();
  }, [clinicId]);

  const loadSubscriptionInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const subscription = await getUserSubscription(clinicId);
      setCurrentSubscription(subscription);

      const status = await getSubscriptionStatus(clinicId);
      setSubscriptionStatus(status);
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      setIsProcessing(true);
      setError(null);

      // Initiate Razorpay payment
      const paymentResult = await initiateRazorpayPayment(
        planId,
        clinicId,
        clinicEmail,
        clinicName
      );

      if (paymentResult.success) {
        // Save subscription to database
        await createSubscription(clinicId, planId, paymentResult);
        
        // Reload subscription info
        await loadSubscriptionInfo();
        
        // Show success message
        alert('✅ Subscription successful! Your plan is now active.');
      }
    } catch (err) {
      console.error('Error processing subscription:', err);
      setError(err.error || err.message || 'Payment failed. Please try again.');
      alert(`❌ ${err.error || 'Payment failed'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }

    try {
      setIsProcessing(true);
      await cancelSubscription(clinicId);
      await loadSubscriptionInfo();
      setShowCancelConfirm(false);
      alert('✅ Subscription cancelled successfully.');
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel subscription');
      alert('❌ Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isActive = subscriptionStatus?.status === SUBSCRIPTION_STATUS.ACTIVE;
  const currentPlan = currentSubscription?.planId ? SUBSCRIPTION_PLANS.pro.id === currentSubscription.planId ? 'pro' : 'growth' : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Current Subscription Status */}
      {isActive && (
        <Card glass className="border-white/10 shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 z-0 transition-opacity opacity-0 group-hover:opacity-100 duration-500"></div>
          <CardHeader className="border-b border-white/5 bg-background/30 relative z-10">
            <CardTitle className="flex items-center text-lg font-black tracking-widest uppercase">
              <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div>
                  <h3 className="text-xl font-bold text-green-400">{currentSubscription.planName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    ₹{currentSubscription.amount}/month
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400">{subscriptionStatus.daysRemaining}</p>
                  <p className="text-xs text-muted-foreground">Days remaining</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Started</p>
                  <p className="text-sm font-medium">
                    {new Date(currentSubscription.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Expires</p>
                  <p className="text-sm font-medium">
                    {new Date(currentSubscription.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {currentSubscription.autoRenew && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-sm text-blue-400">Auto-renewal enabled</span>
                </div>
              )}

              {currentPlan === 'growth' && (
                <Button
                  onClick={() => handleSubscribe(SUBSCRIPTION_PLANS.pro.id)}
                  disabled={isProcessing}
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg transition-all"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Upgrade to Pro'}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(true)}
                disabled={isProcessing}
                className="w-full h-11 text-red-400 border-red-400/20 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Subscription
              </Button>

              {showCancelConfirm && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
                  <p className="text-sm text-red-400 font-semibold">
                    Are you sure you want to cancel? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 h-9"
                    >
                      Keep Subscription
                    </Button>
                    <Button
                      onClick={handleCancelSubscription}
                      disabled={isProcessing}
                      className="flex-1 h-9 bg-red-600 hover:bg-red-700"
                    >
                      {isProcessing ? 'Cancelling...' : 'Confirm Cancel'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Available Plans */}
      <Card glass className="border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-background/30">
          <CardTitle className="flex items-center text-lg font-black tracking-widest uppercase">
            <CreditCard className="w-5 h-5 mr-3 text-blue-400" />
            Subscription Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Growth Plan */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 bg-gradient-to-br from-background to-background/50 border border-white/10 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2">{SUBSCRIPTION_PLANS.growth.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{SUBSCRIPTION_PLANS.growth.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-primary">
                      ₹{SUBSCRIPTION_PLANS.growth.price}
                    </span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {SUBSCRIPTION_PLANS.growth.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isActive && currentPlan === 'growth' ? (
                  <Button disabled className="w-full h-11 bg-green-600/30 text-green-400 border border-green-500/20 rounded-lg font-bold">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(SUBSCRIPTION_PLANS.growth.id)}
                    disabled={isProcessing}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                  >
                    {isProcessing ? 'Processing...' : 'Subscribe Now'}
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 bg-gradient-to-br from-background to-background/50 border-2 border-purple-500/30 rounded-2xl relative overflow-hidden ring-1 ring-purple-500/20"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                POPULAR
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2">{SUBSCRIPTION_PLANS.pro.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{SUBSCRIPTION_PLANS.pro.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      ₹{SUBSCRIPTION_PLANS.pro.price}
                    </span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {SUBSCRIPTION_PLANS.pro.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-purple-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isActive && currentPlan === 'pro' ? (
                  <Button disabled className="w-full h-11 bg-purple-600/30 text-purple-400 border border-purple-500/20 rounded-lg font-bold">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(SUBSCRIPTION_PLANS.pro.id)}
                    disabled={isProcessing}
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all"
                  >
                    {isProcessing ? 'Processing...' : 'Subscribe Now'}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>

          {/* No Subscription Info */}
          {!isActive && (
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-400 mb-1">No Active Subscription</p>
                <p className="text-xs text-muted-foreground">
                  Choose a plan above to get started with MedipreCheck Premium.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
