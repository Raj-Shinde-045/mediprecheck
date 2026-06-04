# Subscription Model Implementation Guide

## Overview
This document describes the Razorpay subscription implementation for MedipreCheck application.

## Architecture

### Components

1. **Subscription Configuration** (`src/lib/subscriptionConfig.js`)
   - Stores API keys and plan details
   - Defines subscription statuses
   - Manages plan information (Growth and Pro)

2. **Subscription Service** (`src/lib/subscriptionService.js`)
   - Handles Razorpay payment initiation
   - Manages subscription creation and updates
   - Stores subscription data in Firebase Realtime Database
   - Provides subscription status checking

3. **Subscription Card Component** (`src/components/subscription/SubscriptionCard.jsx`)
   - Displays available plans
   - Shows current subscription status
   - Handles subscribe/upgrade/cancel actions
   - User-friendly UI with plan comparison

4. **Settings Page Integration** (`src/pages/clinic/Settings.jsx`)
   - Integrates subscription card into settings
   - Displays subscription management interface

## Subscription Plans

### Growth Plan
- **Plan ID**: `plan_SxF3VFyjVMLyg1`
- **Price**: ₹2,000/month
- **Features**:
  - Up to 50 patients/month
  - Basic AI Triage
  - Single doctor support
  - Email support

### Pro Plan
- **Plan ID**: `plan_SxF4Y20hilLoGQ`
- **Price**: ₹3,549/month
- **Features**:
  - Unlimited patients
  - Advanced AI Triage
  - Multiple doctors support
  - Priority support
  - Analytics dashboard

## Database Structure

Subscriptions are stored in Firebase Realtime Database:

```
clinics/{clinicId}/
├── subscription/
│   ├── planId: string
│   ├── planName: string
│   ├── status: string (active|pending|cancelled|expired|paused)
│   ├── amount: number
│   ├── currency: string (INR)
│   ├── paymentId: string
│   ├── orderId: string
│   ├── signature: string
│   ├── startDate: ISO string
│   ├── expiryDate: ISO string
│   ├── autoRenew: boolean
│   ├── createdAt: ISO string
│   └── updatedAt: ISO string
```

## Configuration

### Environment Variables

Set the following in `.env.local`:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_RAZORPAY_KEY_SECRET=NWRhymL8HNMkFKPTdJEznPPp
```

### Production

For production deployment:
1. Get production Razorpay keys from Razorpay dashboard
2. Update environment variables
3. Update plan IDs if different from test environment
4. Ensure HTTPS is enabled

## API Functions

### getUserSubscription(clinicId)
Retrieves current subscription for a clinic.

```javascript
const subscription = await getUserSubscription(clinicId);
```

### getSubscriptionStatus(clinicId)
Gets subscription status with calculated days remaining.

```javascript
const status = await getSubscriptionStatus(clinicId);
// Returns: { status, plan, daysRemaining, message }
```

### initiateRazorpayPayment(planId, clinicId, clinicEmail, clinicName)
Initiates Razorpay payment flow.

```javascript
const result = await initiateRazorpayPayment(
  'plan_SxF3VFyjVMLyg1',
  clinicId,
  'clinic@example.com',
  'Clinic Name'
);
```

### createSubscription(clinicId, planId, paymentData)
Creates subscription record after successful payment.

```javascript
await createSubscription(clinicId, planId, paymentData);
```

### cancelSubscription(clinicId)
Cancels active subscription.

```javascript
await cancelSubscription(clinicId);
```

### upgradeSubscription(clinicId, newPlanId, paymentData)
Upgrades from one plan to another.

```javascript
await upgradeSubscription(clinicId, newPlanId, paymentData);
```

## User Flow

### Subscribe to New Plan
1. User navigates to Settings page
2. Views available subscription plans
3. Clicks "Subscribe Now" on desired plan
4. Razorpay checkout opens
5. Enters payment details
6. Payment processed
7. Subscription stored in Firebase
8. UI updates with active subscription

### Upgrade Plan
1. User with Growth plan views Pro plan
2. Clicks "Upgrade to Pro"
3. Razorpay checkout opens for price difference
4. Payment processed
5. Plan upgraded in Firebase
6. UI updates with new plan

### Cancel Subscription
1. User clicks "Cancel Subscription"
2. Confirmation dialog appears
3. Subscription marked as cancelled in Firebase
4. UI reverts to plan selection view

## Security Considerations

⚠️ **Important**: 
- API keys should NEVER be exposed in client-side code in production
- Consider implementing a backend service to handle Razorpay operations
- Use server-side verification of payments
- Store sensitive information in secure environment variables

For production:
1. Create a backend service (Node.js, Firebase Functions, etc.)
2. Move Razorpay operations to backend
3. Use Firebase custom claims for subscription verification
4. Implement webhook handlers for subscription events

## Testing

### Test Razorpay Cards
- Success: 4111111111111111
- Failure: 4000000000000002
- CVV: Any 3 digits
- Expiry: Any future date

### Test Workflow
1. Start dev server: `npm run dev`
2. Navigate to Settings page
3. Select a plan and click Subscribe
4. Use test card details above
5. Verify subscription appears in Firebase console

## Troubleshooting

### Issue: Razorpay script not loading
- Ensure internet connection is active
- Check browser console for network errors
- Verify firebaseconfig.com is not blocked

### Issue: Payment fails
- Check Razorpay API keys in environment
- Verify plan IDs are correct
- Check browser developer tools for errors
- Ensure Firebase write permissions for clinic

### Issue: Subscription not saving
- Verify Firebase Realtime Database rules allow writes
- Check Firebase console for errors
- Verify clinic UID is correct
- Check network tab for failed requests

## Future Enhancements

- [ ] Implement webhook for payment confirmations
- [ ] Add subscription history tracking
- [ ] Implement automatic renewal handling
- [ ] Add payment retry logic
- [ ] Create admin dashboard for subscription analytics
- [ ] Implement coupon/discount codes
- [ ] Add monthly/annual billing toggle
- [ ] Create billing invoice generation
- [ ] Add subscription modification (change card, update details)

## References

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Subscription Plans](https://razorpay.com/docs/subscriptions/api/)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
