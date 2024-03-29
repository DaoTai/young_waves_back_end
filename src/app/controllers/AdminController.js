import mongoose from "mongoose";
import { User, Post, Comment, Conversation, Message } from "../models/index.js";
import { deleteAttachments } from "../../utils/firebase.js";
const AdminController = {
   // [PATCH] admin/authorization/:id
   async authorize(req, res) {
      try {
         await User.findByIdAndUpdate(req.params.id, {
            isAdmin: !req.body.isAdmin,
         });
         res.status(200).json("Authorize user successfully");
      } catch (err) {
         res.status(500).json(err);
      }
   },

   // [GET] admin/users
   async getAllUsers(req, res) {
      try {
         const isAdmin = req.query.admin;
         const users = await User.find({ isAdmin: isAdmin, _id: { $ne: req.user._id } });
         res.status(200).json(users);
      } catch (err) {
         console.log(err);
         res.status(500).json(err);
      }
   },

   // [GET] admin/users/trash-users
   async getTrashUsers(req, res) {
      try {
         const isAdmin = req.query.admin;
         const users = await User.findDeleted({ isAdmin: isAdmin });
         res.status(200).json(users);
      } catch (err) {
         console.log(err);
         res.status(500).json(err);
      }
   },

   // [DELETE] admin/users/:id
   async deleteUser(req, res) {
      const userId = req.params.id;
      try {
         const comments = await Comment.find({ user: userId }).select("_id");
         const commentIds = comments.map((comment) => comment._id);
         await Promise.all([
            User.deleteById(userId),
            Post.updateMany(
               {},
               {
                  $pull: {
                     likes: userId,
                     comments: { $in: commentIds },
                  },
               }
            ),
            Post.delete({
               author: userId,
            }),
            Comment.delete({
               user: userId,
            }),
            Conversation.delete({ members: { $in: [userId] } }),
         ]);
         res.status(200).json("Deleted successfully!");
      } catch (err) {
         res.status(500).json("Deleted failed!");
      }
   },

   // [PATCH] admin/users/:id/restore
   async restoreUser(req, res) {
      const userId = req.params.id;
      try {
         const comments = await Comment.findDeleted({ user: userId });
         // Reupdate liked & commented posts
         comments.forEach(async (comment) => {
            await Post.updateMany(
               { _id: comment.post },
               {
                  $push: {
                     likes: userId,
                     comments: comment._id,
                  },
               }
            );
         });

         await User.restore({ _id: userId });
         await Post.restore({ author: userId });
         await Comment.restore({ user: userId });
         await Conversation.restore({ members: { $in: userId } });
         res.status(200).json("Restored successfully!");
      } catch (err) {
         res.status(500).json("Restore failed!");
      }
   },

   // [DELETE] admin/users/:id/force-delete
   async forceDeleteUser(req, res) {
      const userId = req.params.id;
      try {
         const comments = await Comment.findDeleted({ user: userId }).select("_id");
         const commentIds = comments.map((comment) => comment._id);
         const user = await User.findByIdAndDelete(userId);
         // Get attachments of post
         const attachmentsOfPost = await Post.findDeleted({
            author: mongoose.Types.ObjectId(userId),
         }).distinct("attachments");

         // Get id of conversations
         const deletedConversationsIds = await Conversation.findDeleted({
            members: { $in: [userId] },
         }).distinct("_id");
         // Get attachment of messages
         const attachmentsOfMessages = await Message.find({
            idConversation: { $in: deletedConversationsIds },
         }).distinct("attachments.url");

         const deletedAttachments = [...attachmentsOfPost, ...attachmentsOfMessages, user.avatar, user.coverPicture];
         await Promise.all([
            Post.updateManyWithDeleted(
               {},
               {
                  $pull: {
                     likes: { $in: [userId] },
                     comments: { $in: commentIds },
                  },
               }
            ),
            Post.deleteMany({ author: userId }),
            Comment.deleteMany({ user: userId }),
            Conversation.deleteMany({ members: { $in: [userId] } }),
            Message.deleteMany({ idConversation: { $in: deletedConversationsIds } }),
            deleteAttachments(deletedAttachments),
         ]);
         res.status(200).json({ deletedAttachments });
      } catch (err) {
         res.status(500).json("Force deletion failed");
      }
   },

   // [POST] admin/users/handle-all
   async handleAll(req, res) {
      const { action, memberIds, role } = req.body;

      switch (action) {
         case "delete":
            const comments = await Comment.find({
               user: {
                  $in: memberIds,
               },
            }).select("_id");
            const commentIds = comments.map((comment) => comment._id);
            try {
               await Promise.all([
                  User.delete({ _id: { $in: memberIds } }),
                  Post.updateMany(
                     {},
                     {
                        $pull: {
                           likes: { $in: memberIds },
                           comments: { $in: commentIds },
                        },
                     }
                  ),
                  Post.delete({
                     author: { $in: memberIds },
                  }),
                  Comment.delete({
                     user: { $in: memberIds },
                  }),
                  Conversation.delete({ members: { $in: memberIds } }),
               ]);
               return res.status(200).json("Deleted successfully!");
            } catch (err) {
               res.status(500).json("Deleted failed!");
            }
         case "authorize":
            try {
               for (let memberId of memberIds) {
                  await User.findByIdAndUpdate(memberId, {
                     isAdmin: !!(role === "user"),
                  });
               }
               return res.status(200).json("Authorize users successfully");
            } catch (err) {
               res.status(500).json(err);
            }
         case "restore":
            try {
               for (let memberId of memberIds) {
                  const formatId = mongoose.Types.ObjectId(memberId);
                  const comments = await Comment.findDeleted({ user: formatId });
                  // Reupdate like & comment
                  for (let comment of comments) {
                     await Post.updateMany(
                        { _id: comment.post },
                        {
                           $push: {
                              likes: formatId,
                              comments: comment._id,
                           },
                        }
                     );
                  }
               }
               await Promise.all([
                  User.restore({ _id: { $in: memberIds } }),
                  Post.restore({ author: { $in: memberIds } }),
                  Comment.restore({ user: { $in: memberIds } }),
                  Conversation.restore({ members: { $in: memberIds } }),
               ]);
               return res.status(200).json("Restored successfully!");
            } catch (err) {
               res.status(500).json("Restore failed!");
            }
            break;
         case "force-delete":
            try {
               let deletedAttachments = [];
               // Get idd of comment
               const deletedCommentsIds = await Comment.findDeleted({
                  user: {
                     $in: memberIds,
                  },
               }).distinct("_id");

               // Get images from user profile
               const images = await User.findDeleted(
                  { _id: { $in: memberIds } },
                  {
                     avatar: 1,
                     coverPicture: 1,
                     _id: 0,
                  }
               );
               // Get url from user profile
               images.forEach((img) => {
                  img.avatar && deletedAttachments.push(img.avatar);
                  img.coverPicture && deletedAttachments.push(img.coverPicture);
               });

               // Get attachments of posts
               const attachmentsOfPosts = await Post.findDeleted({
                  author: { $in: memberIds },
               }).distinct("attachments");
               // Get id of  conversation
               const deletedConversationsIds = await Conversation.findDeleted({
                  members: { $in: memberIds },
               }).distinct("_id");
               // Get attachment of messages
               const attachmentsOfMessages = await Message.find({
                  idConversation: { $in: deletedConversationsIds },
               }).distinct("attachments.url");

               // Update & delete
               deletedAttachments = deletedAttachments.concat(attachmentsOfPosts, attachmentsOfMessages);
               await Promise.all([
                  Post.updateManyWithDeleted(
                     {},
                     {
                        $pullAll: {
                           likes: memberIds,
                           comments: deletedCommentsIds,
                        },
                     }
                  ),
                  Message.deleteMany({ idConversation: { $in: deletedConversationsIds } }),
                  User.deleteMany({ _id: { $in: memberIds } }),
                  Post.deleteMany({ author: { $in: memberIds } }),
                  Comment.deleteMany({ user: { $in: memberIds } }),
                  Conversation.deleteMany({ members: { $in: memberIds } }),
                  deleteAttachments(deletedAttachments),
               ]);
               return res.status(200).json({ deletedAttachments });
            } catch (err) {
               console.error(err);
            }
         default:
            return res.status(404).json("Action is invalid");
      }
   },
};

export default AdminController;
