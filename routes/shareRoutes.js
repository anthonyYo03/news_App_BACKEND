import express from 'express';
import { shareControllers } from '../controllers/shareController.js';
import { verifyToken } from '../middlewares/auth.js';
import { onlyJournalistAndReader } from '../middlewares/roles.js';
const router = express.Router();

// Public routes (no authentication)
// Get share count for a news post
router.get('/count/:newsId',verifyToken,onlyJournalistAndReader ,shareControllers.getShareCount);//OK

// Get all shares for a news post
router.get('/news/:newsId', verifyToken, onlyJournalistAndReader, shareControllers.getShares); 

// Get one share by ID (public)
router.get('/getOneShare/:shareId', verifyToken, onlyJournalistAndReader, shareControllers.getOneShare);

// Protected routes (authentication required)
// Middleware needed: verifyToken from auth.js

// Create share (authenticated users only)
router.post('/createShareForNews/:newsId', verifyToken, onlyJournalistAndReader, shareControllers.createShare);


export default router;
