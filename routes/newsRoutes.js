import express from 'express';
import { newsControllers } from '../controllers/newsController.js';
import { onlyJournalist } from '../middlewares/roles.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Public routes (no authentication)
// Get all news
router.get('/all', newsControllers.getNews);//OK

// Get one news by ID (public)
router.get('/getOneNews/:newsId', newsControllers.getOneNews); //OK

router.get('/getImportantNews', newsControllers.getLastFiveImportantNews); //OK

// Protected routes (authentication required)
// Middleware needed: verifyToken from auth.js

// Create news (journalist and admin only) 
// Middleware needed: onlyJournalistAndAdmin from roles.js
router.post('/createNews',verifyToken,onlyJournalist, newsControllers.createNews);//OK

// Update news (journalist/admin who owns it, or admin)
router.put('/updateNews/:newsId',verifyToken,onlyJournalist, newsControllers.updateNews);//OK

// Delete news (journalist/admin who owns it, or admin)
router.delete('/deleteNews/:newsId',verifyToken, onlyJournalist, newsControllers.deleteNews);

export default router;
