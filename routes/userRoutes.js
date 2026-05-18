import express from 'express';
import { userControllers } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/auth.js';
import { onlyAdmin,onlyJournalist,onlyJournalistAndAdmin,onlyJournalistAndReader } from '../middlewares/roles.js';
const router = express.Router();

// Public routes (no authentication required)
router.post('/register', userControllers.registerUser);//OK
router.post('/login', userControllers.loginUser);//OK
router.post('/request-password-reset', userControllers.requestPasswordReset);//OK
router.post('/reset-password', userControllers.resetPassword);//OK



router.post('/logout', userControllers.logoutUser);//OK

// Get all users (admin only)

router.get('/getAll', verifyToken, onlyAdmin, userControllers.getUsers);//OK

// Get one user by ID (authenticated users)
router.get('/:userId', verifyToken, userControllers.getOneUser);//OK

// Create user (admin only)
router.post('/createUser' ,verifyToken,onlyAdmin ,userControllers.createUser);//OK

// Update user (user themselves or admin)
router.put('/updateUserByAdmin/:userId', verifyToken, onlyAdmin, userControllers.updateUserByAdmin);//OK
router.put('/updateUserByJournalistOrReader/:userId', verifyToken,  onlyJournalistAndReader, userControllers.updateUserByJournalistOrReader);//OK

// Delete user (admin only)
router.delete('/delete/:userId', verifyToken, onlyAdmin, userControllers.deleteUser);//OK

export default router;
