import { socketEvent } from '../share/socketEvent.js';
const onlineUsers = new Map();
export const handleSocket = (io) => {

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // when client connect , send online users 
        socket.on(socketEvent.ADD_USER, (userId) => {
            onlineUsers.set(userId, socket.id);
            io.emit(socketEvent.GET_ONLINE_USERS, Array.from(onlineUsers.keys()));

        });

        // send message
        socket.on(socketEvent.SEND_MESSAGE, ({ senderId, receiverId, text, image, video }) => {
            const receiveSocketId = onlineUsers.get(receiverId);
            if (receiveSocketId) {
                io.to(receiveSocketId).emit(socketEvent.RECEIVE_MESSAGE, {
                    senderId,
                    text,
                    image,
                    video,
                });
            }
        });

        // send friend request
        socket.on(socketEvent.SEND_FRIEND_REQUEST, ({ senderId, receiverId }) => {
            const receiveSocketId = onlineUsers.get(receiverId);
            if (receiveSocketId) {
                io.to(receiveSocketId).emit(socketEvent.NEW_FRIEND_REQUEST, {
                    senderId,
                });
            }
        });

        // accept friend request
        socket.on(socketEvent.ACCEPT_FRIEND_REQUEST, ({ senderId, receiverId }) => {
            const senderSocketId = onlineUsers.get(senderId);
            const receiverSocketId = onlineUsers.get(receiverId);

            if (senderSocketId) {
                io.to(senderSocketId).emit(socketEvent.FRIEND_REQUEST_ACCEPTED, { receiverId });
            }
            if (receiverSocketId) {
                io.to(receiverSocketId).emit(socketEvent.FRIEND_REQUEST_ACCEPTED, { senderId });
            }
        });

        // reject friend request
        socket.on(socketEvent.REJECT_FRIEND_REQUEST, ({ senderId, receiverId }) => {
            const sendedSocketId = onlineUsers.get(senderId)
            if (sendedSocketId) {
                io.to(sendedSocketId).emit(socketEvent.FRIEND_REQUEST_REJECTED, {
                    receiverId,
                });
            }
        });

        // remove friend
        socket.on(socketEvent.REMOVE_FRIEND, ({ userId, friendId }) => {
            const friendSocketId = onlineUsers.get(friendId);
            if (friendSocketId) {
                io.to(friendSocketId).emit(socketEvent.FRIEND_REMOVED, {
                    userId,
                });
            }
        });

        // when client disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
            io.emit(socketEvent.GET_ONLINE_USERS, Array.from(onlineUsers.keys()));
        })

    })
}