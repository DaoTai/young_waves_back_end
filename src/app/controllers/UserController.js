import User from "../models/User.js";
import Post from "../models/Post.js";
const UserController = {
   // [GET] /user/:id
   async getUser(req, res) {
      try {
         const user = await User.findById(req.params.id);
         res.status(200).json(user);
      } catch (err) {
         res.status(500).json(err);
      }
   },

   // [PATCH] /user/:id
   async editUser(req, res) {
      try {
         await User.findByIdAndUpdate(req.params.id, req.body);
         const user = await User.findById(req.params.id);
         res.status(201).json(user);
      } catch (err) {
         res.status(500).json("Edited failed");
      }
   },
};

export default UserController;
