# Stripe Connect Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Run Database Migrations
```bash
cd server
npm run migrate
```

This will create:
- `payments` table
- `withdrawals` table
- Enhanced `owner_profiles` with Stripe fields
- Enhanced `rentals` with commission fields

### Step 2: Verify Environment Variables
Check `server/.env` has:
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
CLIENT_URL=http://localhost:5173
```

### Step 3: Start the Server
```bash
cd server
npm run dev
```

### Step 4: Start the Client
```bash
cd client
npm run dev
```

### Step 5: Test the Features

#### 🏎️ As a Car Owner:
1. Login with owner credentials
2. Go to **Dashboard → Earnings**
3. Click **"Complete Setup"** button
4. Complete Stripe onboarding (use test data in test mode)
5. Once verified, you'll see your balance
6. Click **"Withdraw Earnings"** to test withdrawal

#### 👨‍💼 As an Admin:
1. Login with admin credentials
2. Go to **Dashboard → Revenue**
3. View platform balance and commission
4. Click **"Withdraw Revenue"** to test admin withdrawal
5. View withdrawal history

## 📋 Quick Test Checklist

### Owner Features
- [ ] Stripe account creation
- [ ] Onboarding link generation
- [ ] Account status display
- [ ] Balance tracking (available, pending, withdrawn)
- [ ] Withdrawal modal
- [ ] Withdrawal processing
- [ ] Transaction history

### Admin Features
- [ ] Platform balance display
- [ ] Commission tracking
- [ ] Monthly revenue stats
- [ ] Admin withdrawal interface
- [ ] Withdrawal history
- [ ] Revenue breakdown

### Payment Flow
- [ ] Create booking with commission
- [ ] Payment splits correctly
- [ ] Owner receives payout
- [ ] Platform receives commission
- [ ] Balances update correctly

## 🧪 Test Data

### Test Credit Cards (Stripe Test Mode)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

### Test Onboarding Data
Use any test data for Stripe Express onboarding:
- **Business Name**: Test Business
- **Email**: test@example.com
- **Phone**: +1 234 567 8900
- **Address**: 123 Test St, Test City, CA 12345

## 🔧 API Endpoints Reference

### Stripe Connect
```
POST   /api/stripe/create-express-account
POST   /api/stripe/create-account-link
GET    /api/stripe/account-status/:ownerId?
GET    /api/stripe/owner-balance/:ownerId?
GET    /api/stripe/platform-balance
POST   /api/stripe/withdraw-owner-earnings
POST   /api/stripe/withdraw-platform-revenue
GET    /api/stripe/withdrawal-history
```

### Enhanced Payments
```
POST   /api/payments/create-payment-intent
POST   /api/payments/confirm-payment
POST   /api/payments/webhook
```

## 🎯 Commission Configuration

Default: **10% platform fee**

To change, edit `server/controllers/stripeConnectController.js`:
```javascript
const COMMISSION_CONFIG = {
  percentageFee: 0.10, // 10%
  fixedFee: 0,         // $0
};
```

## 📊 Database Queries for Testing

### Check Owner Balance
```sql
SELECT * FROM owner_profiles WHERE user_id = 'owner-uuid';
```

### View All Payments
```sql
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;
```

### View All Withdrawals
```sql
SELECT * FROM withdrawals ORDER BY created_at DESC LIMIT 10;
```

### Check Platform Revenue
```sql
SELECT 
  SUM(platform_fee) as total_commission,
  SUM(total_amount) as total_revenue
FROM payments 
WHERE payment_status = 'succeeded';
```

## 🐛 Common Issues & Solutions

### Issue: "Stripe account not found"
**Solution**: Owner needs to complete onboarding first

### Issue: "Insufficient balance"
**Solution**: Ensure there are completed rentals with payments

### Issue: "Payouts not enabled"
**Solution**: Complete Stripe verification process

### Issue: Webhook not working
**Solution**: 
1. Check webhook secret in .env
2. Verify webhook URL in Stripe dashboard
3. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```

## 📱 Using Components in Your App

### Owner Dashboard
```tsx
import EnhancedEarningsSection from './components/dashboards/dashboard-components/owner-components/EnhancedEarningsSection';

function OwnerDashboard() {
  return (
    <div>
      <EnhancedEarningsSection />
    </div>
  );
}
```

### Admin Dashboard
```tsx
import EnhancedRevenueSection from './components/dashboards/dashboard-components/admin-components/RevenuePayments/EnhancedRevenueSection';

function AdminDashboard() {
  return (
    <div>
      <EnhancedRevenueSection />
    </div>
  );
}
```

## 🔐 Security Notes

### Development
- Use Stripe test mode
- Test webhook signature verification
- Validate all inputs

### Production
- Enable HTTPS
- Use production Stripe keys
- Configure proper CORS
- Enable rate limiting
- Set up monitoring

## 📈 Next Steps

1. **Test thoroughly** in development
2. **Configure webhooks** in Stripe dashboard
3. **Set up monitoring** for failed payments
4. **Enable notifications** for withdrawals
5. **Add analytics** for revenue tracking
6. **Deploy to production** when ready

## 🆘 Need Help?

- **Stripe Docs**: https://stripe.com/docs/connect
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Test Mode**: Use test API keys for development
- **Logs**: Check `server/logs` for errors

## ✅ Production Deployment Checklist

Before going live:
- [ ] Switch to production Stripe keys
- [ ] Configure production webhook endpoint
- [ ] Test with real bank accounts (small amounts)
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure backup strategy
- [ ] Enable audit logging
- [ ] Test withdrawal flow end-to-end
- [ ] Verify commission calculations
- [ ] Set up customer support process
- [ ] Create admin documentation

---

**Happy coding! 🎉**
