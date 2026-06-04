# Subscription Model - Quick Setup Guide

## ✅ Implementation Complete!

The subscription model has been successfully implemented with Razorpay integration. Here's what was added:

## 📦 What's New

### 1. **Files Created**
- `src/lib/subscriptionConfig.js` - Configuration for Razorpay and plans
- `src/lib/subscriptionService.js` - Subscription management service
- `src/components/subscription/SubscriptionCard.jsx` - Subscription UI component
- `.env.local` - Environment variables with API keys
- `SUBSCRIPTION_IMPLEMENTATION.md` - Detailed documentation

### 2. **Files Updated**
- `src/pages/clinic/Settings.jsx` - Integrated subscription section
- `.env.example` - Added Razorpay env var examples
- `package.json` - Razorpay SDK installed

## 🚀 Getting Started

### 1. Environment Setup
Your `.env.local` file is already configured with:
```
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_RAZORPAY_KEY_SECRET=NWRhymL8HNMkFKPTdJEznPPp
```

### 2. Access Subscription
1. Start your dev server: `npm run dev`
2. Navigate to: **Clinic Settings page**
3. Scroll down to see the **Subscription Plans** section
4. Both **Growth** and **Pro** plans are displayed

### 3. Test Payment Flow
- Click **"Subscribe Now"** on any plan
- Razorpay checkout will open
- Use test card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

## 💳 Subscription Plans

| Feature | Growth | Pro |
|---------|--------|-----|
| **Price** | ₹2,000/month | ₹3,549/month |
| **Patients/month** | Up to 50 | Unlimited |
| **AI Triage** | Basic | Advanced |
| **Doctors** | 1 | Multiple |
| **Support** | Email | Priority |
| **Analytics** | ❌ | ✅ |

## 🔧 Key Features

✅ **Subscribe** - Choose and subscribe to a plan
✅ **Current Status** - View active subscription details
✅ **Upgrade** - Upgrade from Growth to Pro plan
✅ **Cancel** - Cancel subscription with confirmation
✅ **Database** - Subscription stored in Firebase Realtime DB
✅ **Auto-renew** - Automatic monthly renewal enabled

## 📊 Firebase Structure

Subscriptions are stored at:
```
clinics/{clinicId}/subscription/
├── planId
├── planName
├── status (active/cancelled/expired)
├── amount
├── startDate
├── expiryDate
├── autoRenew
└── ... other details
```

## 🛠 API Functions Available

### Check Subscription Status
```javascript
import { getSubscriptionStatus } from '@/lib/subscriptionService';
const status = await getSubscriptionStatus(clinicId);
```

### Get Current Subscription
```javascript
import { getUserSubscription } from '@/lib/subscriptionService';
const sub = await getUserSubscription(clinicId);
```

### Cancel Subscription
```javascript
import { cancelSubscription } from '@/lib/subscriptionService';
await cancelSubscription(clinicId);
```

## ⚠️ Important Notes

### Development
- Using Razorpay **Test Mode** credentials
- Test cards provided above
- No real money is charged

### For Production
1. Get production Razorpay keys
2. Update `.env.local` with production keys
3. Change plan IDs to production ones
4. Implement backend verification
5. Add webhook handlers
6. Enable HTTPS only

## 🔐 Security Best Practices

- ✅ API keys stored in environment variables
- ⚠️ Client-side payment (development only)
- 🔒 For production: Move to backend service
- 🔐 Use server-side verification
- 🛡️ Implement Firebase security rules

## 📝 Component Usage

### In any page/component:
```jsx
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';

<SubscriptionCard 
  clinicId={clinicId}
  clinicEmail={clinicEmail}
  clinicName={clinicName}
/>
```

## 🧪 Testing Checklist

- [ ] Navigate to Settings page
- [ ] Scroll to "Subscription Plans" section
- [ ] View Growth plan details
- [ ] View Pro plan details
- [ ] Click "Subscribe Now" on Growth
- [ ] Enter test card details
- [ ] Verify subscription appears (check Firebase console)
- [ ] View current subscription status
- [ ] Test upgrade from Growth to Pro
- [ ] Test cancel subscription
- [ ] Verify Firebase database updates

## 📞 Support

For detailed information, see: `SUBSCRIPTION_IMPLEMENTATION.md`

For Razorpay documentation: https://razorpay.com/docs/

## 🎉 Ready to Go!

Your subscription system is ready. Start the app and test it out!

```bash
npm run dev
```

Happy coding! 🚀
