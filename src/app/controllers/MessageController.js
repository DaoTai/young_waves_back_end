import { Message, Conversation } from "../models/index.js";
const MessageController = {
   // [POST] message/
   async createNewMessage(req, res) {
      try {
         const { idConversation, sender, content, attachments } = req.body;
         if (!idConversation || !sender) {
            return res.sendStatus(404);
         }
         const newMessage = new Message({
            idConversation,
            sender,
            content,
            attachments,
         });

         const savedMessage = await newMessage.save();
         await Conversation.findByIdAndUpdate(idConversation, {
            lastestMessage: savedMessage,
         });
         res.status(200).json(savedMessage);
      } catch (err) {
         res.status(500).json(err);
      }
   },
};

export default MessageController;
