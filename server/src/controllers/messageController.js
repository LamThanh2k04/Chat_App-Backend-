import Messages from "../models/messageModel.js";


export const getMessages = async (req, res) => {
    const userId = req.user._id;
    const {id : userToChatId} = req.params;

    try {
        const messages = await Messages.find({
            $or: [
                { sender: userId, receiver: userToChatId },
                { sender: userToChatId, receiver: userId }
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error });
    }
}

export const sendMessage = async (req, res) => {
    const {text} = req.body;
    const userId = req.user._id;
    const {id : userToChatId} = req.params;

    const imageURL = req.files?.imageURL?.[0]?.path || null;
    const videoURL = req.files?.videoURL?.[0]?.path || null;

    try {
        const newMessage = new Messages({
            sender: userId,
            receiver: userToChatId,
            text,
            image: imageURL,
            video: videoURL
        })
        await newMessage.save()
          res.status(201).json({ message: 'Message sent successfully', newMessage });
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}