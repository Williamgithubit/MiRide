import express from 'express';
import auth from './middleware/auth.js';

const app = express();
app.use(express.json());

// Simple auth test endpoint
app.get('/test-auth', auth(), (req, res) => {
  console.log('Auth test - User from middleware:', req.user);
  res.json({
    success: true,
    user: req.user,
    userId: req.user?.id,
    userIdType: typeof req.user?.id,
    message: 'Authentication working correctly'
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Auth debug server running on port ${PORT}`);
  console.log('Test with: curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/test-auth');
});

export default app;
