import User from "../models/User.js";
import Post from "../models/Post.js";
const UserController = {
   // [GET] /user/:id
   async getUser(req, res) {
      try {
         const user = await User.findById(req.params.id);
         res.status(200).json(user);
      } catch (err) {
         console.log(err);
         res.status(500).json(err);
      }
   },

   // [PATCH] /user/:id
   async editUser(req, res) {
      try {
         await User.findByIdAndUpdate(req.params.id, req.body);
         res.status(200).json({ msg: "Edited successfully!" });
      } catch (err) {
         res.status(500).json({
            err,
            msg: "Edited failed!",
         });
      }
   },
};

export default UserController;
