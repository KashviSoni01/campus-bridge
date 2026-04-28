import express from 'express';
import { chatWithAI } from '../controllers/chatController.js';

const router = express.Router();

// Accept any HTTP method on /api/chat for debugging
router.all('/', (req, res, next) => {
  console.log(`Chat route hit: ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/', chatWithAI);

export default router;