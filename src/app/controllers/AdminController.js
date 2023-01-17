import User from "../models/User.js";

const AdminController = {
   // [GET] admin/users
   async getAllUsers(req, res) {
      try {
         const perPage = 5;
         const page = req.query.page || 1;
         const isAdmin = req.query.hasOwnProperty("admin");
         const users = await User.find({ isAdmin: isAdmin })
            .skip(perPage * page - perPage)
            .limit(perPage);
         const totalUsers = await User.find({ isAdmin: isAdmin }).countDocuments();
         res.status(200).json({
            users,
            currentPage: +page,
            maxPage: Math.ceil(totalUsers / perPage),
         });
      } catch (err) {
         console.log(err);
         res.status(500).json(err);
      }
   },

   // [GET] admin/trash-users
   async getTrashUsers(req, res) {
      try {
         const perPage = 5;
         const page = req.query.page || 1;
         const isAdmin = req.query.hasOwnProperty("admin");
         const users = await User.findDeleted({ isAdmin: isAdmin })
            .skip(perPage * page - perPage)
            .limit(perPage);
         const totalUsers = await User.findDeleted({ isAdmin: isAdmin }).countDocuments();
         res.status(200).json({
            users,
            currentPage: +page,
            maxPage: Math.ceil(totalUsers / perPage),
         });
      } catch (err) {
         console.log(err);
         res.status(500).json(err);
      }
   },

   // [DELETE] admin/users/:id
   async deleteUser(req, res) {
      try {
         const result = await User.deleteById(req.params.id);
         res.status(200).json({ msg: "Deleted successfully!" });
      } catch (err) {
         res.status(500).json({
            msg: "Deleted failed!",
            err,
         });
      }
   },

   // [PATCH] admin/users/:id/restore
   async restoreUser(req, res) {
      try {
         await User.restore({ _id: req.params.id });
         res.status(200).json({ msg: "Restored successfully!" });
      } catch (err) {
         res.status(500).json({ msg: "Restore failed!" });
      }
   },

   // [DELETE] admin/users/:id/force-delete
   async forceDeleteUser(req, res) {
      try {
         await User.findByIdAndDelete(req.params.id);
         res.status(200).json({
            msg: "Force delete successfully!",
         });
      } catch (err) {
         res.status(500).json({
            msg: "Force deletion failed",
            err,
         });
      }
   },
};

export default AdminController;
