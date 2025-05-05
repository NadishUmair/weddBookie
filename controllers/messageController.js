const Message = require("../models/Message");

// Fetch conversation between two users
const getConversation = async (req, res) => {
  const { user1, user2 } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages", details: err });
  }
};

// Send message through API (for testing without socket)
const sendMessage = async (req, res) => {
  const { sender, senderModel, receiver, receiverModel, message } = req.body;

  try {
    const newMsg = await Message.create({ sender, senderModel, receiver, receiverModel, message });
    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message", details: err });
  }
};

module.exports = {
  getConversation,
  sendMessage,
};
