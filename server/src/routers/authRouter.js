import express from 'express';
import { register, login, updateProfile, checkAuth } from '../controllers/authController.js';
import { upload } from '../config/Clodinary/index.js';
import { verifyToken } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register',upload.single('imageFile'),register);
router.post('/login',login);
router.put('/update',upload.single('imageFile'),verifyToken,updateProfile);
router.get('/check',verifyToken,checkAuth);
export default router;