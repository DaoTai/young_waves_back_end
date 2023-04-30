import { Conversation, Message } from "../models/index.js";
import mongoose from "mongoose";
const ConversationController = {
   // [GET] conversations/
   async getUserConversations(req, res) {
      try {
         const regex = new RegExp(req.query?.friendName, "i");
         const perPage = 6;
         const page = req.query.page || 1;
         const userId = mongoose.Types.ObjectId(req.user._id);
         // Main conditions to query
         const mainConditions = [
            {
               $match: {
                  members: {
                     $in: [userId],
                  },
               },
            },
            {
               $lookup: {
                  from: "users",
                  localField: "members",
                  foreignField: "_id",
                  as: "members",
               },
            },
            {
               $match: {
                  "members.fullName": {
                     $regex: regex,
                  },
               },
            },
         ];

         // Pagination
         const conversations = await Conversation.aggregate([
            ...mainConditions,
            {
               $skip: perPage * page - perPage,
            },
            {
               $limit: perPage,
            },
         ]);
         const totalConversations = (await Conversation.aggregate([...mainConditions])).length;
         return res.status(200).json({
            conversations,
            currentPage: +page,
            maxPage: Math.ceil(totalConversations / perPage),
         });
      } catch (err) {
         res.status(500).json(err);
      }
   },

   // [GET] conversations/:id
   async getDetailConversation(req, res) {
      try {
         const perPage = 15;
         const page = req.query.page || 1;
         const idConversation = req.params.id;
         const messages = await Message.find({
            idConversation: idConversation,
         })
            .sort({ createdAt: -1 })
            .skip(perPage * page - perPage)
            .limit(perPage);
         // Total
         const totalMsg = await Message.find({
            idConversation: idConversation,
         }).countDocuments();
         res.status(200).json({
            messages,
            currentPage: +page,
            maxPage: Math.ceil(totalMsg / perPage),
         });
      } catch (err) {
         res.status(500).json(err);
      }
   },

   // [POST] conversations/
   async addConsevation(req, res) {
      try {
         const existed = await Conversation.findOne({
            members: {
               $all: [req.user._id, req.body.idFriend],
            },
         });
         if (!existed) {
            if (req.user._id && req.body.idFriend) {
               const newConversation = new Conversation({
                  members: [req.user._id, req.body.idFriend],
               });
               const savedNewConversation = await newConversation.save();
               res.status(200).json(savedNewConversation);
            } else {
               res.status(500).json("Add conservation failed");
            }
         } else {
            res.status(403).json("You had this conversation");
         }
      } catch (err) {
         res.status(500).json(err);
      }
   },
};

export default ConversationController;
