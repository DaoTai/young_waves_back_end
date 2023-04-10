import { Conversation, Message } from "../models/index.js";
const ConversationController = {
   // [GET] conversations/
   async getUserConversations(req, res) {
      try {
         const conversations = await Conversation.find({
            members: {
               $in: [req.user.id],
            },
         }).populate("members", {
            fullName: 1,
            avatar: 1,
         });
         res.status(200).send(conversations);
      } catch (err) {
         res.status(500).json(err);
      }
   },

   // [GET] conversations/:id
   async getDetailConversation(req, res) {
      try {
         const idConversation = req.params.id;
         const messages = await Message.find({
            idConversation: idConversation,
         });
         res.status(200).json(messages);
      } catch (err) {
         res.status(500).json(err);
      }
   },

   // [POST] conversations/
   async addConsevation(req, res) {
      try {
         const existed = await Conversation.findOne({
            members: {
               $all: [req.user.id, req.body.idFriend],
            },
         });
         if (!existed) {
            if (req.user.id && req.body.idFriend) {
               const newConversation = new Conversation({
                  members: [req.user.id, req.body.idFriend],
               });
               const savedNewConversation = await newConversation.save();
               res.status(200).json(savedNewConversation);
            } else {
               res.status(500).json("Add conservation failed");
            }
         } else {
            res.status(403).json("You had conversation");
         }
      } catch (err) {
         res.status(500).json(err);
      }
   },
};

export default ConversationController;
