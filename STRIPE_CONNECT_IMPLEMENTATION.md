# Stripe Connect Implementation Guide

## Overview
This document describes the complete Stripe Connect integration with Express accounts, including payouts and withdrawal features for both car owners and platform administrators.

## Features Implemented

### ✅ 1. Stripe Connect Express Accounts
- **Owner Onboarding**: Complete Stripe Express account setup flow
- **KYC Verification**: Automatic verification status tracking
- **Account Status**: Real-time account status monitoring
- **Payout Enablement**: Automatic payout capability detection

### ✅ 2. Commission-Based Payment Flow
- **Automatic Commission Calculation**: 10% platform fee (configurable)
- **Split Payments**: Automatic transfer to owner's connected account
- **Platform Fee Collection**: Application fee retained by platform
- **Payment Tracking**: Complete payment history with commission breakdown

### ✅ 3. Owner Withdrawal System
- **Balance Tracking**: Real-time available, pending, and withdrawn balances
- **Instant Withdrawals**: Transfer funds from platform to owner's bank account
- **Withdrawal History**: Complete transaction log
- **Eligibility Validation**: Automatic balance and account status checks

### ✅ 4. Admin Revenue Management
- **Platform Balance**: Total commission and available balance tracking
- **Revenue Withdrawals**: Admin-initiated payouts to platform bank account
- **Monthly Reports**: Revenue breakdown by period
- **Withdrawal Logs**: Complete audit trail of platform withdrawals

### ✅ 5. Enhanced Dashboards
- **Owner Dashboard**: 
  - Earnings overview with charts
  - Available balance display
  - Withdrawal interface
  - Transaction history
  - Stripe onboarding status
  
- **Admin Dashboard**:
  - Total platform revenue
  - Commission breakdown
  - Monthly/yearly analytics
  - Withdrawal management
  - Complete transaction logs

## Database Schema

### New Tables

#### 1. `payments`
```sql
- id (UUID, primary key)
- rental_id (INTEGER, foreign key)
- owner_id (UUID, foreign key)
- customer_id (UUID, foreign key)
- stripe_payment_intent_id (STRING, unique)
- stripe_account_id (STRING)
- total_amount (DECIMAL)
- platform_fee (DECIMAL)
- owner_amount (DECIMAL)
- currency (STRING)
- payment_status (ENUM: pending, processing, succeeded, failed, refunded)
- payout_status (ENUM: pending, paid, failed)
- stripe_transfer_id (STRING)
- metadata (JSON)
- created_at, updated_at (TIMESTAMP)
```

#### 2. `withdrawals`
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- amount (DECIMAL)
- currency (STRING)
- type (ENUM: owner, platform)
- status (ENUM: pending, processing, completed, failed, cancelled)
- stripe_transfer_id (STRING)
- stripe_payout_id (STRING)
- stripe_account_id (STRING)
- description (TEXT)
- failure_reason (TEXT)
- metadata (JSON)
- processed_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

#### 3. `owner_profiles` (Enhanced)
```sql
Added fields:
- stripe_account_id (STRING, unique)
- stripe_onboarding_complete (BOOLEAN)
- stripe_charges_enabled (BOOLEAN)
- stripe_payouts_enabled (BOOLEAN)
- stripe_details_submitted (BOOLEAN)
- total_earnings (DECIMAL)
- available_balance (DECIMAL)
- pending_balance (DECIMAL)
- total_withdrawn (DECIMAL)
```

#### 4. `rentals` (Enhanced)
```sql
Added fields:
- platform_fee (DECIMAL)
- owner_payout (DECIMAL)
- stripe_transfer_id (STRING)
- payout_status (ENUM: pending, paid, failed)
```

## API Endpoints

### Stripe Connect Endpoints (`/api/stripe`)

#### Owner Onboarding
- `POST /create-express-account` - Create Stripe Express account
- `POST /create-account-link` - Generate onboarding link
- `GET /account-status/:ownerId?` - Get account verification status

#### Balance & Earnings
- `GET /owner-balance/:ownerId?` - Get owner earnings and balance
- `GET /platform-balance` - Get platform revenue (admin only)

#### Withdrawals
- `POST /withdraw-owner-earnings` - Owner withdrawal request
- `POST /withdraw-platform-revenue` - Admin withdrawal request (admin only)
- `GET /withdrawal-history` - Get withdrawal transaction history

### Enhanced Payment Endpoints (`/api/payments`)

#### Payment Processing
- `POST /create-payment-intent` - Create PaymentIntent with commission
- `POST /confirm-payment` - Confirm payment and create booking
- `POST /webhook` - Enhanced webhook for Stripe Connect events

#### Legacy Endpoints (Maintained for Backward Compatibility)
- `POST /create-checkout-session` - Original checkout flow
- `POST /create-booking-fallback` - Manual booking creation

## Frontend Components

### Owner Dashboard
**Location**: `client/src/components/dashboards/dashboard-components/owner-components/`

#### EnhancedEarningsSection.tsx
- Balance cards (Available, Total, Pending, Withdrawn)
- Stripe onboarding prompt
- Withdrawal modal
- Recent payments list
- Recent withdrawals list
- Account status indicators

### Admin Dashboard
**Location**: `client/src/components/dashboards/dashboard-components/admin-components/RevenuePayments/`

#### EnhancedRevenueSection.tsx
- Platform revenue overview
- Commission breakdown
- Monthly/yearly stats
- Withdrawal interface
- Transaction history
- Audit logs

### Redux Store
**Location**: `client/src/store/StripeConnect/`

#### stripeConnectApi.ts
- RTK Query API for all Stripe Connect operations
- Automatic cache invalidation
- Type-safe endpoints
- Error handling

## Commission Configuration

**Location**: `server/controllers/stripeConnectController.js`

```javascript
const COMMISSION_CONFIG = {
  percentageFee: 0.10, // 10%
  fixedFee: 0,         // $0 (can be changed)
};
```

### Formula
```
platformFee = (totalAmount × percentageFee) + fixedFee
ownerPayout = totalAmount - platformFee
```

## Webhook Events Handled

The enhanced webhook handler processes:
- `payment_intent.succeeded` - Update payment and rental status
- `payment_intent.payment_failed` - Mark payment as failed
- `account.updated` - Sync owner account status
- `payout.paid` - Mark withdrawal as completed
- `payout.failed` - Mark withdrawal as failed
- `charge.succeeded` - Log successful charge
- `transfer.created` - Log transfer to connected account
- `checkout.session.completed` - Legacy checkout flow

## Setup Instructions

### 1. Run Database Migrations
```bash
cd server
npm run migrate
```

### 2. Configure Environment Variables
Add to `server/.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5173
```

### 3. Configure Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `payout.paid`
   - `payout.failed`
   - `charge.succeeded`
   - `transfer.created`

### 4. Test the Integration

#### Owner Flow:
1. Login as car owner
2. Navigate to Earnings section
3. Click "Complete Setup" to start Stripe onboarding
4. Complete verification process
5. Once approved, view balance and withdraw earnings

#### Admin Flow:
1. Login as admin
2. Navigate to Revenue section
3. View platform balance and commission
4. Initiate platform withdrawal
5. View withdrawal history

## Security Considerations

### ✅ Implemented
- JWT authentication for all endpoints
- Role-based access control (owner/admin)
- Balance validation before withdrawals
- Stripe account verification checks
- Webhook signature verification
- SQL injection prevention (Sequelize ORM)
- XSS protection (React escaping)

### ⚠️ Production Checklist
- [ ] Enable HTTPS for all endpoints
- [ ] Set up proper CORS configuration
- [ ] Configure rate limiting
- [ ] Enable Stripe webhook signature verification
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Enable audit logging
- [ ] Set up fraud detection rules

## Testing

### Test Stripe Accounts
Use Stripe test mode with test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Auth: `4000 0025 0000 3155`

### Test Onboarding
1. Use test mode Express accounts
2. Fill with test data
3. Skip verification in test mode

### Test Withdrawals
1. Create test payments
2. Verify balance updates
3. Test withdrawal flow
4. Check Stripe dashboard for transfers

## Troubleshooting

### Common Issues

#### 1. Onboarding Link Expired
**Solution**: Generate new account link via API

#### 2. Payout Failed
**Causes**:
- Insufficient platform balance
- Invalid bank account
- Account not verified

**Solution**: Check Stripe dashboard for details

#### 3. Webhook Not Receiving Events
**Solution**:
- Verify webhook URL is accessible
- Check webhook secret is correct
- Review Stripe webhook logs

#### 4. Balance Mismatch
**Solution**:
- Recalculate from payment records
- Check for failed transactions
- Verify commission calculations

## Future Enhancements

### Optional Features (Not Yet Implemented)
- [ ] Automatic payout scheduling (daily/weekly/monthly)
- [ ] Email notifications for withdrawals
- [ ] Transaction receipts (PDF generation)
- [ ] Deposit-hold system for damage fees
- [ ] Multi-currency support
- [ ] Refund handling
- [ ] Dispute management
- [ ] Advanced analytics dashboard
- [ ] Export reports to CSV/Excel
- [ ] Mobile app integration

## Support

For issues or questions:
1. Check Stripe documentation: https://stripe.com/docs/connect
2. Review server logs for errors
3. Check Stripe dashboard for transaction details
4. Verify database records match Stripe data

## License

This implementation is part of the MiRide car rental platform.
