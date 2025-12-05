import Stripe from 'stripe';
import dotenv from 'dotenv';
import db from '../models/index.js';
import { Op } from 'sequelize';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

// Commission configuration
const COMMISSION_CONFIG = {
  percentageFee: 0.10, // 10%
  fixedFee: 0, // $0 fixed fee (can be changed)
};

/**
 * Calculate platform fee and owner payout
 */
const calculateCommission = (totalAmount) => {
  const percentageFee = totalAmount * COMMISSION_CONFIG.percentageFee;
  const fixedFee = COMMISSION_CONFIG.fixedFee;
  const platformFee = percentageFee + fixedFee;
  const ownerPayout = totalAmount - platformFee;

  return {
    platformFee: parseFloat(platformFee.toFixed(2)),
    ownerPayout: parseFloat(ownerPayout.toFixed(2)),
  };
};

/**
 * Create Stripe Express Account for car owner
 */
export const createExpressAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db.User.findByPk(userId, {
      include: [{ model: db.OwnerProfile, as: 'ownerProfile' }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'owner') {
      return res.status(403).json({ error: 'Only car owners can create Stripe accounts' });
    }

    // Check if owner profile exists, create if not
    let ownerProfile = user.ownerProfile;
    if (!ownerProfile) {
      ownerProfile = await db.OwnerProfile.create({
        userId: user.id,
      });
    }

    // Check if account already exists
    if (ownerProfile.stripeAccountId) {
      return res.json({
        accountId: ownerProfile.stripeAccountId,
        message: 'Stripe account already exists',
      });
    }

    // Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: user.id,
        userName: user.name,
      },
    });

    // Save account ID to database
    await ownerProfile.update({
      stripeAccountId: account.id,
    });

    console.log('Stripe Express account created:', account.id);

    res.json({
      accountId: account.id,
      message: 'Stripe account created successfully',
    });
  } catch (error) {
    console.error('Error creating Stripe Express account:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create account link for onboarding
 */
export const createAccountLink = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db.User.findByPk(userId, {
      include: [{ model: db.OwnerProfile, as: 'ownerProfile' }]
    });

    if (!user || !user.ownerProfile || !user.ownerProfile.stripeAccountId) {
      return res.status(404).json({ error: 'Stripe account not found. Please create an account first.' });
    }

    const accountId = user.ownerProfile.stripeAccountId;

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.CLIENT_URL}/dashboard/earnings?refresh=true`,
      return_url: `${process.env.CLIENT_URL}/dashboard/earnings?success=true`,
      type: 'account_onboarding',
    });

    res.json({
      url: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating account link:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Stripe account status
 */
export const getAccountStatus = async (req, res) => {
  try {
    const userId = req.params.ownerId || req.user.id;
    
    const user = await db.User.findByPk(userId, {
      include: [{ model: db.OwnerProfile, as: 'ownerProfile' }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If no owner profile exists, return default values
    if (!user.ownerProfile) {
      return res.json({
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      });
    }

    const ownerProfile = user.ownerProfile;

    if (!ownerProfile.stripeAccountId) {
      return res.json({
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      });
    }

    // Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(ownerProfile.stripeAccountId);

    // Update owner profile with latest status
    await ownerProfile.update({
      stripeChargesEnabled: account.charges_enabled,
      stripePayoutsEnabled: account.payouts_enabled,
      stripeDetailsSubmitted: account.details_submitted,
      stripeOnboardingComplete: account.details_submitted && account.charges_enabled,
    });

    res.json({
      hasAccount: true,
      accountId: ownerProfile.stripeAccountId,
      onboardingComplete: account.details_submitted && account.charges_enabled,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements,
    });
  } catch (error) {
    console.error('Error fetching account status:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get owner balance and earnings
 */
export const getOwnerBalance = async (req, res) => {
  try {
    const userId = req.params.ownerId || req.user.id;

    const user = await db.User.findByPk(userId, {
      include: [{ model: db.OwnerProfile, as: 'ownerProfile' }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If no owner profile exists, return default empty balance
    if (!user.ownerProfile) {
      return res.json({
        totalEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        totalWithdrawn: 0,
        currency: 'USD',
        recentPayments: [],
        recentWithdrawals: [],
      });
    }

    const ownerProfile = user.ownerProfile;

    // Get all payments for this owner
    const payments = await db.Payment.findAll({
      where: { ownerId: userId },
      include: [
        {
          model: db.Rental,
          as: 'rental',
          attributes: ['id', 'startDate', 'endDate', 'status'],
        },
      ],
    });

    console.log('💰 Owner Balance Debug:');
    console.log(`Owner ID: ${userId}`);
    console.log(`Total payments found: ${payments.length}`);
    if (payments.length > 0) {
      console.log('Sample payment:', {
        id: payments[0].id,
        totalAmount: payments[0].totalAmount,
        platformFee: payments[0].platformFee,
        ownerAmount: payments[0].ownerAmount,
        status: payments[0].paymentStatus
      });
    }

    // Calculate earnings
    const totalEarnings = payments
      .filter(p => p.paymentStatus === 'succeeded')
      .reduce((sum, p) => sum + parseFloat(p.ownerAmount || 0), 0);
    
    console.log(`Total Earnings: $${totalEarnings.toFixed(2)}`);

    const pendingEarnings = payments
      .filter(p => p.paymentStatus === 'processing' || p.paymentStatus === 'pending')
      .reduce((sum, p) => sum + parseFloat(p.ownerAmount), 0);

    // Get withdrawals
    const withdrawals = await db.Withdrawal.findAll({
      where: { 
        userId,
        type: 'owner',
      },
      order: [['createdAt', 'DESC']],
    });

    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + parseFloat(w.amount), 0);

    const availableBalance = totalEarnings - totalWithdrawn;

    // Update owner profile
    await ownerProfile.update({
      totalEarnings,
      availableBalance,
      pendingBalance: pendingEarnings,
      totalWithdrawn,
    });

    res.json({
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      availableBalance: parseFloat(availableBalance.toFixed(2)),
      pendingBalance: parseFloat(pendingEarnings.toFixed(2)),
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      currency: 'USD',
      recentPayments: payments.slice(0, 10).map(p => ({
        id: p.id,
        amount: parseFloat(p.ownerAmount),
        status: p.paymentStatus,
        date: p.createdAt,
        rentalId: p.rentalId,
      })),
      recentWithdrawals: withdrawals.slice(0, 10).map(w => ({
        id: w.id,
        amount: parseFloat(w.amount),
        status: w.status,
        date: w.createdAt,
        processedAt: w.processedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching owner balance:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get platform balance (admin only)
 */
export const getPlatformBalance = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all payments
    const payments = await db.Payment.findAll({
      where: { paymentStatus: 'succeeded' },
    });

    console.log('📊 Platform Balance Debug:');
    console.log(`Total payments found: ${payments.length}`);
    if (payments.length > 0) {
      console.log('Sample payment:', {
        id: payments[0].id,
        totalAmount: payments[0].totalAmount,
        platformFee: payments[0].platformFee,
        ownerAmount: payments[0].ownerAmount,
        status: payments[0].paymentStatus
      });
    }

    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.platformFee || 0), 0); // Platform revenue is commission only
    const totalCommission = payments.reduce((sum, p) => sum + parseFloat(p.platformFee || 0), 0);
    
    console.log(`Total Revenue (Commission): $${totalRevenue.toFixed(2)}`);

    // Get platform withdrawals
    const withdrawals = await db.Withdrawal.findAll({
      where: { 
        type: 'platform',
        status: 'completed',
      },
    });

    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
    const availableBalance = totalCommission - totalWithdrawn;

    // Get monthly stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyPayments = await db.Payment.findAll({
      where: {
        paymentStatus: 'succeeded',
        createdAt: { [Op.gte]: startOfMonth },
      },
    });

    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + parseFloat(p.platformFee), 0); // Platform revenue is commission only
    const monthlyCommission = monthlyPayments.reduce((sum, p) => sum + parseFloat(p.platformFee), 0);

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalCommission: parseFloat(totalCommission.toFixed(2)),
      availableBalance: parseFloat(availableBalance.toFixed(2)),
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      monthlyCommission: parseFloat(monthlyCommission.toFixed(2)),
      currency: 'USD',
      commissionRate: `${COMMISSION_CONFIG.percentageFee * 100}%`,
    });
  } catch (error) {
    console.error('Error fetching platform balance:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Withdraw owner earnings
 */
export const withdrawOwnerEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    const user = await db.User.findByPk(userId, {
      include: [{ model: db.OwnerProfile, as: 'ownerProfile' }]
    });

    if (!user || !user.ownerProfile) {
      return res.status(404).json({ error: 'Owner profile not found' });
    }

    const ownerProfile = user.ownerProfile;

    if (!ownerProfile.stripeAccountId) {
      return res.status(400).json({ error: 'Please complete Stripe onboarding first' });
    }

    if (!ownerProfile.stripePayoutsEnabled) {
      return res.status(400).json({ error: 'Payouts not enabled. Please complete verification.' });
    }

    // Check available balance
    const availableBalance = parseFloat(ownerProfile.availableBalance);
    if (amount > availableBalance) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        availableBalance,
      });
    }

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: ownerProfile.stripeAccountId,
      description: `Earnings withdrawal for ${user.name}`,
      metadata: {
        userId: user.id,
        type: 'owner_withdrawal',
      },
    });

    // Create withdrawal record
    const withdrawal = await db.Withdrawal.create({
      userId,
      amount,
      currency: 'usd',
      type: 'owner',
      status: 'completed',
      stripeTransferId: transfer.id,
      stripeAccountId: ownerProfile.stripeAccountId,
      description: 'Owner earnings withdrawal',
      processedAt: new Date(),
    });

    // Update owner balance
    await ownerProfile.update({
      availableBalance: availableBalance - amount,
      totalWithdrawn: parseFloat(ownerProfile.totalWithdrawn) + amount,
    });

    res.json({
      success: true,
      withdrawal: {
        id: withdrawal.id,
        amount: parseFloat(withdrawal.amount),
        status: withdrawal.status,
        transferId: transfer.id,
        processedAt: withdrawal.processedAt,
      },
      newBalance: parseFloat((availableBalance - amount).toFixed(2)),
    });
  } catch (error) {
    console.error('Error processing owner withdrawal:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Withdraw platform revenue (admin only)
 */
export const withdrawPlatformRevenue = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    // Get platform balance
    const payments = await db.Payment.findAll({
      where: { paymentStatus: 'succeeded' },
    });

    const totalCommission = payments.reduce((sum, p) => sum + parseFloat(p.platformFee), 0);

    const withdrawals = await db.Withdrawal.findAll({
      where: { 
        type: 'platform',
        status: 'completed',
      },
    });

    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
    const availableBalance = totalCommission - totalWithdrawn;

    if (amount > availableBalance) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        availableBalance,
      });
    }

    // Create payout to platform bank account
    const payout = await stripe.payouts.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      description: description || 'Platform revenue withdrawal',
      metadata: {
        userId: req.user.id,
        type: 'platform_withdrawal',
      },
    });

    // Create withdrawal record
    const withdrawal = await db.Withdrawal.create({
      userId: req.user.id,
      amount,
      currency: 'usd',
      type: 'platform',
      status: 'processing',
      stripePayoutId: payout.id,
      description: description || 'Platform revenue withdrawal',
      metadata: {
        adminId: req.user.id,
        adminName: req.user.name,
      },
    });

    res.json({
      success: true,
      withdrawal: {
        id: withdrawal.id,
        amount: parseFloat(withdrawal.amount),
        status: withdrawal.status,
        payoutId: payout.id,
        description: withdrawal.description,
      },
      newBalance: parseFloat((availableBalance - amount).toFixed(2)),
    });
  } catch (error) {
    console.error('Error processing platform withdrawal:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get withdrawal history
 */
export const getWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;

    const whereClause = {};

    // If admin, can view all or filter by type
    if (req.user.role === 'admin') {
      if (type) {
        whereClause.type = type;
      }
    } else {
      // Regular users only see their own withdrawals
      whereClause.userId = userId;
      whereClause.type = 'owner';
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: withdrawals } = await db.Withdrawal.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        amount: parseFloat(w.amount),
        currency: w.currency,
        type: w.type,
        status: w.status,
        description: w.description,
        transferId: w.stripeTransferId,
        payoutId: w.stripePayoutId,
        createdAt: w.createdAt,
        processedAt: w.processedAt,
        user: w.user ? {
          id: w.user.id,
          name: w.user.name,
        } : null,
      })),
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching withdrawal history:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Fix payment records with 0 platform fees (admin only)
 */
export const fixPaymentPlatformFees = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log('🔧 Starting payment platform fees fix...');

    // Find all payments with 0 platform fee
    const paymentsToFix = await db.Payment.findAll({
      where: {
        platformFee: 0.00,
      },
      include: [
        {
          model: db.Rental,
          as: 'rental',
          attributes: ['id', 'totalAmount', 'platformFee', 'ownerPayout'],
        },
      ],
    });

    console.log(`Found ${paymentsToFix.length} payment(s) with 0 platform fee`);

    if (paymentsToFix.length === 0) {
      return res.json({
        success: true,
        message: 'No payments need fixing',
        fixed: 0,
        errors: 0,
      });
    }

    let fixedCount = 0;
    let errorCount = 0;
    const fixedPayments = [];

    for (const payment of paymentsToFix) {
      try {
        const totalAmount = parseFloat(payment.totalAmount);
        
        // Calculate correct commission
        const { platformFee, ownerPayout } = calculateCommission(totalAmount);

        console.log(`Fixing payment ${payment.id}: $${totalAmount} -> Fee: $${platformFee}, Owner: $${ownerPayout}`);

        // Update payment record
        await payment.update({
          platformFee: platformFee,
          ownerAmount: ownerPayout,
        });

        // Update rental record if it exists and has 0 fees
        if (payment.rental && parseFloat(payment.rental.platformFee) === 0) {
          await db.Rental.update(
            {
              platformFee: platformFee,
              ownerPayout: ownerPayout,
            },
            {
              where: { id: payment.rentalId },
            }
          );
        }

        // Update owner profile balance
        const ownerProfile = await db.OwnerProfile.findOne({
          where: { userId: payment.ownerId },
        });

        if (ownerProfile) {
          // Add the owner payout to their balance
          const newTotalEarnings = parseFloat(ownerProfile.totalEarnings || 0) + parseFloat(ownerPayout);
          const newAvailableBalance = parseFloat(ownerProfile.availableBalance || 0) + parseFloat(ownerPayout);

          await ownerProfile.update({
            totalEarnings: newTotalEarnings,
            availableBalance: newAvailableBalance,
          });
        }

        fixedPayments.push({
          paymentId: payment.id,
          rentalId: payment.rentalId,
          totalAmount,
          platformFee,
          ownerPayout,
        });

        fixedCount++;
      } catch (error) {
        console.error(`Error fixing payment ${payment.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`✅ Fixed ${fixedCount} payments, ${errorCount} errors`);

    res.json({
      success: true,
      message: `Fixed ${fixedCount} payment(s)`,
      fixed: fixedCount,
      errors: errorCount,
      payments: fixedPayments,
    });
  } catch (error) {
    console.error('Error fixing payment platform fees:', error);
    res.status(500).json({ error: error.message });
  }
};

export { calculateCommission };
