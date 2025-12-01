# ✅ Terms & Conditions Implementation - Complete Guide

## 🎯 **What's Been Implemented**

### **Backend (Complete ✅)**

1. **Database Migration**: `20250105-add-terms-acceptance-to-users.js`
   - Adds `termsAccepted` (BOOLEAN, default: false)
   - Adds `termsAcceptedAt` (DATE, nullable)

2. **User Model Updated**: `server/models/user.js`
   - New fields added to model definition

3. **API Controller**: `server/controllers/termsController.js`
   - `getTermsStatus()` - Check if user accepted terms
   - `acceptTerms()` - Mark terms as accepted
   - `declineTerms()` - Handle decline (logs out user)

4. **API Routes**: `server/routes/termsRoutes.js`
   - `GET /api/terms/status` - Get current user's status
   - `GET /api/terms/status/:userId` - Get specific user's status (admin)
   - `PUT /api/terms/accept` - Accept terms
   - `PUT /api/terms/accept/:userId` - Accept for specific user (admin)
   - `POST /api/terms/decline` - Decline terms

5. **Server Integration**: `server/server.js`
   - Terms routes added to Express app

---

## 📋 **Next Steps: Frontend Implementation**

### **Step 1: Run the Migration**

```bash
cd server
npx sequelize-cli db:migrate
```

This will add the new fields to your users table.

---

### **Step 2: Create Redux Slice**

Create `client/src/store/Terms/termsSlice.ts`:

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

interface TermsState {
  termsAccepted: boolean;
  termsAcceptedAt: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: TermsState = {
  termsAccepted: false,
  termsAcceptedAt: null,
  loading: false,
  error: null,
};

// Thunk: Check terms status
export const checkTermsStatus = createAsyncThunk(
  'terms/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/terms/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch terms status');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk: Accept terms
export const acceptTerms = createAsyncThunk(
  'terms/accept',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/terms/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept terms');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const termsSlice = createSlice({
  name: 'terms',
  initialState,
  reducers: {
    resetTermsState: (state) => {
      state.termsAccepted = false;
      state.termsAcceptedAt = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Check status
    builder.addCase(checkTermsStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(checkTermsStatus.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.termsAccepted = action.payload.termsAccepted;
      state.termsAcceptedAt = action.payload.termsAcceptedAt;
    });
    builder.addCase(checkTermsStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Accept terms
    builder.addCase(acceptTerms.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(acceptTerms.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.termsAccepted = true;
      state.termsAcceptedAt = action.payload.termsAcceptedAt;
    });
    builder.addCase(acceptTerms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetTermsState } = termsSlice.actions;
export default termsSlice.reducer;
```

---

### **Step 3: Add to Redux Store**

Update `client/src/store/store.ts`:

```typescript
import termsReducer from './Terms/termsSlice';

const appReducer = {
  // ... existing reducers
  terms: termsReducer,
};
```

---

### **Step 4: Create Terms & Conditions Modal**

Create `client/src/components/shared/TermsModal.tsx`:

```typescript
import React, { useState } from 'react';
import { X, FileText, AlertCircle, DollarSign } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { acceptTerms } from '../../store/Terms/termsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { logout } from '../../store/Auth/authSlice';
import toast from 'react-hot-toast';

interface TermsModalProps {
  isOpen: boolean;
  userRole: 'customer' | 'owner' | 'admin';
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, userRole }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.terms);
  const [hasScrolled, setHasScrolled] = useState(false);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (isAtBottom && !hasScrolled) {
      setHasScrolled(true);
    }
  };

  const handleAccept = async () => {
    try {
      await dispatch(acceptTerms()).unwrap();
      toast.success('Terms & Conditions accepted!');
    } catch (error) {
      toast.error('Failed to accept terms. Please try again.');
    }
  };

  const handleDecline = () => {
    toast.error('You must accept the Terms & Conditions to use the platform.');
    dispatch(logout());
    window.location.href = '/login';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Terms & Conditions
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please read and accept to continue
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-6"
          onScroll={handleScroll}
        >
          {/* Platform Terms */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Platform Terms & Conditions
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>Welcome to MiRide Car Rental Platform. By using our services, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide accurate and truthful information</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect other users and platform policies</li>
                <li>Not engage in fraudulent or harmful activities</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </div>
          </section>

          {/* Commission Rules (For Owners) */}
          {userRole === 'owner' && (
            <section className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <DollarSign className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    2. Commission Structure (Important for Car Owners)
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p className="font-medium">Platform Commission: 10% per booking</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>You receive 90% of each booking amount</li>
                      <li>Platform retains 10% as service fee</li>
                      <li>Commission is automatically deducted from payments</li>
                      <li>You can withdraw your earnings anytime</li>
                      <li>All transactions are processed securely via Stripe</li>
                    </ul>
                    <p className="text-sm italic mt-2">
                      Example: $500 booking = $450 to you, $50 platform fee
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Booking Rules */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {userRole === 'owner' ? '3' : '2'}. Booking & Rental Rules
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <h4 className="font-semibold">For Customers:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Valid driver's license required for all rentals</li>
                <li>Minimum age requirement: 21 years old</li>
                <li>Payment must be completed before pickup</li>
                <li>Late returns may incur additional charges</li>
                <li>Damage to vehicles must be reported immediately</li>
              </ul>

              {userRole === 'owner' && (
                <>
                  <h4 className="font-semibold mt-4">For Car Owners:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>All listed vehicles must have valid insurance</li>
                    <li>Vehicles must pass safety inspections</li>
                    <li>Accurate vehicle descriptions and photos required</li>
                    <li>Respond to booking requests within 24 hours</li>
                    <li>Maintain vehicles in good working condition</li>
                  </ul>
                </>
              )}
            </div>
          </section>

          {/* Cancellation Policy */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {userRole === 'owner' ? '4' : '3'}. Cancellation Policy
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Free cancellation up to 48 hours before pickup</li>
                <li>50% refund for cancellations 24-48 hours before pickup</li>
                <li>No refund for cancellations within 24 hours</li>
                <li>Platform reserves the right to cancel fraudulent bookings</li>
              </ul>
            </div>
          </section>

          {/* Liability */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {userRole === 'owner' ? '5' : '4'}. Liability & Insurance
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Renters are responsible for damages during rental period</li>
                <li>Optional insurance coverage available at booking</li>
                <li>Platform is not liable for accidents or damages</li>
                <li>Users must have valid personal insurance</li>
              </ul>
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {userRole === 'owner' ? '6' : '5'}. Privacy & Data Protection
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>We collect and store personal information securely</li>
                <li>Data is used only for platform operations</li>
                <li>We do not sell your information to third parties</li>
                <li>You can request data deletion at any time</li>
              </ul>
            </div>
          </section>

          {/* Scroll Indicator */}
          {!hasScrolled && (
            <div className="sticky bottom-0 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pt-8 pb-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-bounce">
                ↓ Scroll to read all terms ↓
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-start space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              By clicking "Accept", you confirm that you have read, understood, and agree to be bound by these Terms & Conditions.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleDecline}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Decline & Logout
            </button>
            <button
              onClick={handleAccept}
              disabled={loading || !hasScrolled}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : hasScrolled ? 'Accept & Continue' : 'Read All Terms First'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
```

---

### **Step 5: Integrate into Dashboards**

Update both `OwnerDashboard.tsx` and `CustomerDashboard.tsx` (similar pattern):

```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkTermsStatus } from '../../store/Terms/termsSlice';
import TermsModal from '../shared/TermsModal';

// Inside component:
const dispatch = useDispatch();
const { termsAccepted } = useSelector((state: RootState) => state.terms);
const { user } = useSelector((state: RootState) => state.auth);

useEffect(() => {
  // Check terms status on mount
  dispatch(checkTermsStatus());
}, [dispatch]);

// In JSX:
return (
  <>
    <TermsModal isOpen={!termsAccepted} userRole={user?.role || 'customer'} />
    {/* Rest of dashboard */}
  </>
);
```

---

## ✅ **Implementation Checklist**

- [x] Database migration created
- [x] User model updated
- [x] Backend API controller created
- [x] Backend routes created
- [x] Routes integrated into server
- [ ] Run migration: `npx sequelize-cli db:migrate`
- [ ] Create Redux termsSlice
- [ ] Add termsReducer to store
- [ ] Create TermsModal component
- [ ] Integrate modal into OwnerDashboard
- [ ] Integrate modal into CustomerDashboard (if exists)
- [ ] Test the flow

---

## 🎯 **Expected Behavior**

1. **First Login:**
   - User logs in
   - Dashboard checks terms status
   - Modal appears (blocks dashboard)
   - User must scroll through all terms
   - "Accept" button enabled after scrolling
   - User clicks "Accept"
   - Backend updates `termsAccepted = true`
   - Modal closes
   - Dashboard becomes accessible

2. **Subsequent Logins:**
   - Dashboard checks terms status
   - `termsAccepted = true` in database
   - Modal does NOT appear
   - User goes straight to dashboard

3. **If User Declines:**
   - User clicks "Decline"
   - User is logged out
   - Redirected to login page
   - Cannot access dashboard until they accept

---

## 🚀 **Quick Start Commands**

```bash
# 1. Run migration
cd server
npx sequelize-cli db:migrate

# 2. Restart server
npm run dev

# 3. Test in browser
# - Login as owner
# - Should see Terms modal
# - Accept terms
# - Modal should not appear on refresh
```

---

**Status:** Backend complete ✅ | Frontend ready to implement 📝
