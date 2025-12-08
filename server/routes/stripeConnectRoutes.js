import express from "express";
import auth from "../middleware/auth.js";
import {
  createExpressAccount,
  createAccountLink,
  createOnboardingLink,
  getAccountStatus,
  getOwnerBalance,
  getPlatformBalance,
  withdrawOwnerEarnings,
  withdrawPlatformRevenue,
  getWithdrawalHistory,
  fixPaymentPlatformFees,
} from "../controllers/stripeConnectController.js";

const router = express.Router();

// Owner onboarding routes
router.post("/create-express-account", auth(), createExpressAccount);
router.post("/create-account-link", auth(), createAccountLink);
// Convenience endpoint: create account (if needed) and return onboarding link
router.post("/onboard", auth(), createOnboardingLink);
router.get("/account-status", auth(), getAccountStatus);
router.get("/account-status/:ownerId", auth(), getAccountStatus);

// Balance and earnings routes
router.get("/owner-balance", auth(), getOwnerBalance);
router.get("/owner-balance/:ownerId", auth(), getOwnerBalance);
router.get("/platform-balance", auth(), getPlatformBalance);

// Withdrawal routes
router.post("/withdraw-owner-earnings", auth(), withdrawOwnerEarnings);
router.post("/withdraw-platform-revenue", auth(), withdrawPlatformRevenue);
router.get("/withdrawal-history", auth(), getWithdrawalHistory);

// Admin utility routes
router.post("/fix-payment-fees", auth(), fixPaymentPlatformFees);

export default router;
