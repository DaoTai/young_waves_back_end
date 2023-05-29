import { Message, Conversation } from "../models/index.js";
const MessageController = {
   // [POST] message/
   async createNewMessage(req, res) {
      try {
         const { idConversation, sender, text, attachments } = req.body;
         const listAttachment = attachments.map((attach) => ({
            url: attach,
         }));
         if (!idConversation || !sender) {
            return res.sendStatus(404);
         }
         const newMessage = new Message({
            idConversation,
            sender,
            text,
            attachments: listAttachment,
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

   // [DELETE] message/
   async deleteMessage(req, res) {
      try {
         const message = await Message.findByIdAndDelete(req.params.id);
         res.status(200).json(message);
      } catch (err) {
         res.status(500).json(err);
      }
   },
};

export default MessageController;
