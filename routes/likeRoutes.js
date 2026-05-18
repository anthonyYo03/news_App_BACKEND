import express from 'express';
import { likeControllers } from '../controllers/likeController.js';
import { onlyJournalistAndReader } from '../middlewares/roles.js';
import { verifyToken } from '../middlewares/auth.js';
const router = express.Router();

// Public routes (no authentication)
// Get likes count and list for a news post
router.get('/news/:newsId',verifyToken, onlyJournalistAndReader, likeControllers.getLikes);//OK

// Protected routes (authentication required)
// Middleware needed: verifyToken from auth.js

// Add like (authenticated users only)
router.post('/addLike/:newsId', verifyToken, onlyJournalistAndReader, likeControllers.addLike);//OK

// Remove like (authenticated users only) 
router.delete('/removeLike/:newsId', verifyToken, onlyJournalistAndReader, likeControllers.removeLike);//OK

export default router;
