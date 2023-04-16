import { User, Post, Comment } from "../models/index.js";
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
      try {
         await User.deleteById(req.params.id);
         await Post.delete({
            author: req.params.id,
         });
         await Comment.delete({
            user: req.params.id,
         });
         res.status(200).json("Deleted successfully!");
      } catch (err) {
         res.status(500).json("Deleted failed!");
      }
   },

   // [PATCH] admin/users/:id/restore
   async restoreUser(req, res) {
      try {
         await User.restore({ _id: req.params.id });
         await Post.restore({ author: req.params.id });
         await Comment.restore({ user: req.params.id });
         res.status(200).json("Restored successfully!");
      } catch (err) {
         res.status(500).json("Restore failed!");
      }
   },

   // [DELETE] admin/users/:id/force-delete
   async forceDeleteUser(req, res) {
      try {
         await User.findByIdAndDelete(req.params.id);
         await Post.deleteMany({ author: req.params.id });
         await Comment.deleteMany({ user: req.params.id });
         res.status(200).json("Force delete successfully!");
      } catch (err) {
         res.status(500).json("Force deletion failed");
      }
   },
};

export default AdminController;
