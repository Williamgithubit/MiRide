import express from 'express';
import auth from '../middleware/auth.js';
import { getTermsStatus, acceptTerms, declineTerms } from '../controllers/termsController.js';

const router = express.Router();

// Get terms acceptance status
router.get('/status', auth(), getTermsStatus);
router.get('/status/:userId', auth(), getTermsStatus);

// Accept terms
router.put('/accept', auth(), acceptTerms);
router.put('/accept/:userId', auth(), acceptTerms);

// Decline terms
router.post('/decline', auth(), declineTerms);

export default router;
