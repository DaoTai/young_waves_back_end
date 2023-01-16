import User from "../models/User.js";

const UserController = {
   // [GET] admin/users
   async getAllUsers(req, res) {
      try {
         const users = await User.find();
         res.status(200).json(users);
      } catch (err) {
         console.log(err);
         res.status(500).json(err);
      }
   },
};

export default UserController;
