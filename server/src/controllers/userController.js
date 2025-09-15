import FriendRequest from "../models/friendRequestModel.js";
import Users from "../models/userModel.js";

export const getUser = async (req, res) => {
    const userId = req.user._id;
    try {
        const user = await Users.findById(userId)
            .select('-password')
            .populate({ path: 'friends', select: '-password' });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error in getUser:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const sendFriendRequest = async (req, res) => {
    const sendId = req.user._id;
    const { receiveId } = req.body;
    if (sendId.toString() === receiveId) {
        return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }
    try {
        const existingRequest = await FriendRequest.findOne({
            sender: sendId,
            receiver: receiveId,
        });
        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already sent' });
        }

        const newRequest = new FriendRequest({
            sender: sendId,
            receiver: receiveId,
            status: 'pending', 
        });
        await newRequest.save();
        res.status(200).json({ message: 'Friend request sent successfully' });
    } catch (error) {
        console.error('Error in sendFriendRequest:', error);
        res.status(500).json({ message: 'Server error' });
    }
}


export const acceptFriendRequest = async (req, res) => {
    const { requestId } = req.params;
    const receiveId = req.user._id;
    try {
        const request = await FriendRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Friend request not found' });
        }
        if (request.receiver.toString() !== receiveId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to accept this request' });
        }
        request.status = 'accepted';
        await request.save();

        await Users.findByIdAndUpdate(request.sender, {
            $addToSet: { friends: request.receiver },
        });

        await Users.findByIdAndUpdate(request.receiver, {
            $addToSet: { friends: request.sender },
        });
        await FriendRequest.findByIdAndDelete(requestId);
        res.status(200).json({ message: 'Friend request accepted' });
    } catch (error) {
        console.error('Error in acceptFriendRequest:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const rejectFriendRequest = async (req, res) => {
    const { requestId } = req.params;
    const receiveId = req.user._id;
    try {
        const request = await FriendRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Friend request not found' });
        }
        if (request.receiver.toString() !== receiveId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to reject this request' });
        }
        request.status = 'rejected';
        await request.save();
        res.status(200).json({ message: 'Friend request rejected' });
    } catch (error) {
        console.error('Error in rejectFriendRequest:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const getFriendRequests = async (req, res) => {
    const userId = req.user._id;
    try {
        const requests = await FriendRequest.find({
            receiver: userId,
            status: 'pending',
        }).populate('sender', 'firstName lastName imageURL');
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error in getFriendRequests:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const getFriends = async (req, res) => {
    const userId = req.user._id;
    try {
        const user = await Users.findById(userId)
            .select('friends')
            .populate('friends', 'firstName lastName fullName imageURL');
        res.status(200).json(user.friends);
    } catch (error) {
        console.error('Error in getFriends:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const removeFriend = async (req, res) => {
    const { friendId } = req.params;
    const userId = req.user._id;
    try {
        await Users.findByIdAndUpdate(userId, {
            $pull: { friends: friendId },
        });

        await Users.findByIdAndUpdate(friendId, {
            $pull: { friends: userId },
        });
        await FriendRequest.deleteMany({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId },
            ],
        });
        res.status(200).json({ message: 'Friend removed successfully' });
    } catch (error) {
        console.error('Error in removeFriend:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const searchUsers = async (req, res) => {
    const { query } = req.query;
    const userId = req.user._id;
    try {
        const users = await Users.find({
            $or: [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } },
            ],
            _id: { $ne: userId },
        }).select('firstName lastName imageURL');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error in searchUsers:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const getFriendId = async (req, res) => {
    const { friendId } = req.params;
    const userId = req.user._id;
    try {
        const currentUser = await Users.findById(userId)
        if (!currentUser.friends.includes(friendId)) {
            return res.status(403).json({ message: 'You are not friends with this user' });
        }
        const friend = await Users.findById(friendId)
            .select('firstName lastName imageURL')
            .populate({ path: 'friends', select: '-password' });
        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(friend);
    } catch (error) {
        console.error('Error in getFriendId:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const suggestFriends = async (req, res) => {
    const userId = req.user._id;
    try {
        const user = await Users.findById(userId).populate('friends');
        const friends = user.friends.map(friend => friend._id.toString());
        const suggestions = await Users.find({
            _id: { $ne: userId, $nin: friends },
        }).select('firstName lastName fullName imageURL').limit(5);
        res.status(200).json(suggestions);
    } catch (error) {
        console.error('Error in suggestFriends:', error);
        res.status(500).json({ message: 'Server error' });
    }
}