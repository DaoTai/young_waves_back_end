import mongoose from "mongoose";
import { User, Post, Comment, Conversation } from "../models/index.js";
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
      const comments = await Comment.find({ user: userId }).select("_id");
      const commentIds = comments.map((comment) => comment._id);
      try {
         await User.deleteById(userId);
         await Post.updateMany(
            {},
            {
               $pull: {
                  likes: userId,
                  comments: { $in: commentIds },
               },
            }
         );
         await Post.delete({
            author: userId,
         });
         await Comment.delete({
            user: userId,
         });
         await Conversation.delete({ members: { $in: [userId] } });
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
         const deletedAttachments = [...attachmentsOfPost, user.avatar, user.coverPicture];
         await Post.deleteMany({ author: userId });
         await Post.updateManyWithDeleted(
            {},
            {
               $pull: {
                  likes: { $in: [userId] },
                  comments: { $in: commentIds },
               },
            }
         );
         await Comment.deleteMany({ user: userId });
         await Conversation.deleteMany({ members: { $in: [userId] } });
         res.status(200).json({ deletedAttachments });
      } catch (err) {
         res.status(500).json("Force deletion failed");
      }
   },
};

export default AdminController;
