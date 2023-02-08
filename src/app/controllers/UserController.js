import User from "../models/User.js";
import Post from "../models/Post.js";
import bcrypt from "bcrypt";
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
         res.status(200).json(user);
      } catch (err) {
         res.status(500).json("Edited failed");
      }
   },
   // [PATCH] /user/:id/new-password
   async changePasswordUser(req, res) {
      try {
         const { currentPassword, newPassword } = req.body;
         const user = await User.findById(req.params.id);
         if (!user) {
            return res.status(404).json("Not exist user");
         }
         const validPassword = await bcrypt.compare(currentPassword, user.password);
         if (validPassword) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            await User.findByIdAndUpdate(req.params.id, {
               $set: {
                  password: hashedPassword,
               },
            });
            return res.status(200).json(user);
         } else {
            res.status(404).json("Current password is wrong");
         }
      } catch (err) {
         res.status(500).json("Change password failed");
      }
   },
};

export default UserController;
