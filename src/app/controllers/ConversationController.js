import Conversation from "../models/Conversation.js";

const ConversationController = {
   // [GET] conversation/
   async getAllConversation(req, res) {
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

   // [POST] conversation/
   async addConsevation(req, res) {
      try {
         if (req.user.id && req.body.idFriend) {
            const newConversation = new Conversation({
               members: [req.user.id, req.body.idFriend],
            });
            const savedNewConversation = await newConversation.save();
            res.status(200).json(savedNewConversation);
         } else {
            res.status(500).json("Add conservation failed");
         }
      } catch (err) {
         res.status(500).json(err);
      }
   },
};

export default ConversationController;
