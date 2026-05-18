import express from 'express';
import { commentControllers } from '../controllers/commentController.js';
import { onlyJournalistAndReader } from '../middlewares/roles.js';
import { verifyToken } from '../middlewares/auth.js';
const router = express.Router();

// Public routes (no authentication)
// Get all comments for a news post
router.get('/newsComments/:newsId', verifyToken, onlyJournalistAndReader, commentControllers.getComments);//OK

// Get one comment by ID (public)
router.get('/newsOneComment/:commentId', verifyToken, onlyJournalistAndReader, commentControllers.getOneComment);//OK

// Protected routes (authentication required)
// Middleware needed: verifyToken from auth.js

// Create comment (authenticated users: readers and journalists only)
router.post('/createNewsComment/:newsId', verifyToken, onlyJournalistAndReader, commentControllers.createComment);//OK

// Update comment (comment owner or admin only)
router.put('/updateNewsComment/:commentId', verifyToken, onlyJournalistAndReader, commentControllers.updateComment);//OK

// Delete comment (comment owner or admin only)
router.delete('/deleteNewsComment/:commentId', verifyToken, onlyJournalistAndReader, commentControllers.deleteComment);//OK

export default router;
