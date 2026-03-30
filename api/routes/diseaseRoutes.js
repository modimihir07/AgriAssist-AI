import express from 'express';
import { detectDisease, getHistory, chat, testKey } from '../controllers/diseaseController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/test-gemini', testKey);
router.post('/detect', verifyToken, detectDisease);
router.get('/history', verifyToken, getHistory);
router.post('/chat', verifyToken, chat);

export default router;
