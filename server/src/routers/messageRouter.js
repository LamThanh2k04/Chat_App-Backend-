import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { upload } from '../config/Clodinary/index.js';

const router = express.Router();

router.get('/:id',verifyToken,getMessages);
router.post('/send/:id',verifyToken,upload.fields([
    {name : 'imageURL', maxCount: 1},
    {name : 'videoURL', maxCount: 1},
]),sendMessage)

export default router;