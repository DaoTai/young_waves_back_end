import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
class AuthController {
   async register(req, res, next) {
      try {
         // Hash password
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(req.body.password, salt);
         // Create new user
         const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            fullName: req.body.fullName,
            region: req.body.region,
            address: req.body.address,
            gender: req.body.gender,
            email: req.body.email,
         });
         // Save to DB
         const user = await newUser.save();
         res.status(200).json(user);
      } catch (err) {
         res.status(500).json(err);
      }
   }
   async login(req, res) {}
}

export default new AuthController();
