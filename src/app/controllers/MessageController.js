import { Message } from "../models/index.js";

const MessageController = {
   // [POST] message/
   async createNewMessage(req, res) {
      try {
         const newMessage = new Message(req.body);
         const savedMessage = await newMessage.save();
         res.status(200).json(savedMessage);
      } catch (err) {
         res.status(500).json(err);
      }
   },
};

export default MessageController;
