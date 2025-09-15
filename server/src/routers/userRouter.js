import express from 'express';
import { acceptFriendRequest, getFriendId, getFriendRequests, getFriends, getUser, rejectFriendRequest, removeFriend, searchUsers, sendFriendRequest, suggestFriends } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/user',verifyToken,getUser);
router.post('/sendFriendRequest',verifyToken,sendFriendRequest);
router.put('/acceptFriendRequest/:requestId',verifyToken,acceptFriendRequest);
router.get('/getFriendRequests',verifyToken,getFriendRequests);
router.put('/rejectFriendRequest/:requestId',verifyToken,rejectFriendRequest);
router.get('/getFriend',verifyToken,getFriends);
router.delete('/deleteFriend/:friendId',verifyToken,removeFriend);
router.get('/searchUser',verifyToken,searchUsers);
router.get('/getFriendId/:friendId',verifyToken,getFriendId);
router.get('/suggestFriends',verifyToken,suggestFriends)
export default router;