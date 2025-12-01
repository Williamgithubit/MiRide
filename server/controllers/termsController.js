import db from '../models/index.js';

/**
 * Get terms acceptance status for a user
 */
export const getTermsStatus = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const user = await db.User.findByPk(userId, {
      attributes: ['id', 'termsAccepted', 'termsAcceptedAt'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      termsAccepted: user.termsAccepted,
      termsAcceptedAt: user.termsAcceptedAt,
    });
  } catch (error) {
    console.error('Error fetching terms status:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Accept terms and conditions
 */
export const acceptTerms = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update terms acceptance
    await user.update({
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Terms and conditions accepted',
      termsAccepted: true,
      termsAcceptedAt: user.termsAcceptedAt,
    });
  } catch (error) {
    console.error('Error accepting terms:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Decline terms (optional - logs out user)
 */
export const declineTerms = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Terms declined. Please log out.',
      requiresLogout: true,
    });
  } catch (error) {
    console.error('Error declining terms:', error);
    res.status(500).json({ error: error.message });
  }
};
