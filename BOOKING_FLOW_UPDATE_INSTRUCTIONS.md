# 🚀 Booking Flow Update - Stripe Connect Commission

## ✅ **Status: Payment API Updated**

The payment API has been updated with new Stripe Connect endpoints:
- ✅ `useCreateConnectPaymentIntentMutation` - Creates payment with commission
- ✅ `useConfirmPaymentMutation` - Confirms payment and creates booking

## 📝 **What's Already Done:**

1. **Backend** (`stripePaymentController.js`):
   - ✅ `createPaymentIntent` - Calculates commission, creates PaymentIntent with transfer
   - ✅ `confirmPayment` - Confirms payment, creates rental, updates balances

2. **Frontend API** (`paymentApi.ts`):
   - ✅ New TypeScript interfaces added
   - ✅ New mutations exported
   - ✅ Ready to use in components

3. **BookingModal.tsx**:
   - ✅ New mutations imported
   - ⚠️ **Still using old checkout session flow**

---

## 🔄 **Current Flow (OLD - No Commission)**

```typescript
// In BookingModal.tsx handlePaymentSubmit():
const result = await createCheckoutSession({
  carId, startDate, endDate, totalPrice, ...
}).unwrap();

// Redirects to Stripe Checkout
window.location.href = result.url;
```

**Problem:** This uses the old checkout session which doesn't split payments!

---

## ✨ **New Flow (WITH Commission)**

### **Option 1: Simple Update (Recommended)**

Replace the `handlePaymentSubmit` function with this:

```typescript
const handlePaymentSubmit = async () => {
  if (!validateStep2()) return;
  
  setIsSubmitting(true);
  
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    // Show loading toast
    const loadingToast = toast.loading('Processing payment...');

    try {
      // Step 1: Create PaymentIntent with commission
      const paymentResult = await createConnectPaymentIntent({
        carId: bookingData.carId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        totalDays: bookingData.totalDays,
        totalPrice: bookingData.totalPrice,
        insurance: bookingData.insurance,
        gps: bookingData.gps,
        childSeat: bookingData.childSeat,
        additionalDriver: bookingData.additionalDriver,
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        specialRequests: bookingData.specialRequests,
      }).unwrap();

      const { clientSecret, paymentIntentId, platformFee, ownerPayout } = paymentResult;

      // Show commission breakdown
      toast.dismiss(loadingToast);
      toast.success(
        `Payment: $${bookingData.totalPrice.toFixed(2)} | Owner gets: $${ownerPayout.toFixed(2)} | Platform fee: $${platformFee.toFixed(2)}`,
        { duration: 5000 }
      );

      // Step 2: Confirm payment using Stripe Elements
      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: bookingData.cardholderName,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Step 3: Confirm booking in backend
      const confirmResult = await confirmPayment({
        paymentIntentId,
        carId: bookingData.carId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        totalDays: bookingData.totalDays,
        totalPrice: bookingData.totalPrice,
        insurance: bookingData.insurance,
        gps: bookingData.gps,
        childSeat: bookingData.childSeat,
        additionalDriver: bookingData.additionalDriver,
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        specialRequests: bookingData.specialRequests,
      }).unwrap();

      // Success!
      toast.success('Booking confirmed! Commission split automatically.');
      setCurrentStep(3);
      
    } catch (sessionError) {
      toast.dismiss(loadingToast);
      throw sessionError;
    }
  } catch (error) {
    console.error('Payment error:', error);
    toast.error(error instanceof Error ? error.message : 'Payment failed');
  } finally {
    setIsSubmitting(false);
  }
};
```

### **Option 2: Keep Checkout Session (Easier, But Less Control)**

Keep using the checkout session but update the backend to use Connect:

**Backend Change Needed:**
```javascript
// In paymentRoutes.js - Update create-checkout-session endpoint
// Add commission logic to the checkout session creation
```

This is simpler but gives less control over the payment flow.

---

## 🎯 **Recommended Approach**

**Use the NEW Stripe Connect flow** because:
1. ✅ Automatic commission splitting
2. ✅ Real-time balance updates
3. ✅ Owner can withdraw immediately
4. ✅ Platform gets commission automatically
5. ✅ Better user experience
6. ✅ More control over payment flow

---

## 📊 **What Happens With New Flow**

### **Customer Books Car for $500:**

```
1. Customer enters payment details
   ↓
2. createConnectPaymentIntent called
   - Backend calculates: Platform $50, Owner $450
   - Creates PaymentIntent with transfer_data
   ↓
3. Customer confirms payment
   - Stripe processes $500
   - Automatically transfers $450 to owner
   - Keeps $50 as platform commission
   ↓
4. confirmPayment called
   - Creates rental record
   - Creates payment record
   - Updates owner balance: +$450
   - Updates platform balance: +$50
   ↓
5. Success!
   - Owner sees $450 in dashboard
   - Admin sees $50 commission
   - Both can withdraw immediately
```

---

## 🔧 **Quick Implementation**

Since the BookingModal is complex, here's the **minimal change** needed:

**Find this line (around line 231):**
```typescript
const result = await createCheckoutSession({
```

**Replace the entire try block with:**
```typescript
// Create PaymentIntent with commission
const paymentResult = await createConnectPaymentIntent({
  carId: bookingData.carId,
  startDate: bookingData.startDate,
  endDate: bookingData.endDate,
  totalDays: bookingData.totalDays,
  totalPrice: bookingData.totalPrice,
  insurance: bookingData.insurance,
  gps: bookingData.gps,
  childSeat: bookingData.childSeat,
  additionalDriver: bookingData.additionalDriver,
  pickupLocation: bookingData.pickupLocation,
  dropoffLocation: bookingData.dropoffLocation,
  specialRequests: bookingData.specialRequests,
}).unwrap();

// For now, redirect to a success page or show confirmation
toast.success('Payment intent created! Commission will be split automatically.');
setCurrentStep(3); // Move to confirmation step
```

**Note:** This is a simplified version. For full card payment, you need to integrate Stripe Elements (CardElement).

---

## 💡 **Alternative: Hybrid Approach**

Keep the checkout session for now, but update the webhook to handle commission:

1. Customer uses checkout session (current flow)
2. Webhook receives payment
3. Webhook calculates commission
4. Webhook updates balances manually

**This works but is less elegant than the PaymentIntent approach.**

---

## ✅ **Next Steps**

1. **Decision:** Choose between:
   - Full Stripe Elements integration (best, more work)
   - Hybrid checkout session (easier, less control)

2. **Implementation:** Update BookingModal based on choice

3. **Testing:** Test with real booking to verify commission split

---

**Current Status:** Payment API is ready. Just need to update the BookingModal to use it!
