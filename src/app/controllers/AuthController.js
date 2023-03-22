import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const AuthController = {
   refreshTokens: [],
   // Create access token
   createAccessToken(user) {
      return jwt.sign(
         {
            id: user._id,
            isAdmin: user.isAdmin,
         },
         process.env.JWT_ACCESS_TOKEN,
         {
            expiresIn: "1d",
         }
      );
   },
   // Create refresh token
   createRefreshToken(user) {
      return jwt.sign(
         {
            id: user._id,
            isAdmin: user.isAdmin,
         },
         process.env.JWT_REFRESH_TOKEN,
         {
            expiresIn: "14d",
         }
      );
   },
   // [POST] auth/register
   async register(req, res) {
      console.log("body: ", req.body);
      try {
         const {
            username,
            fullName,
            region,
            address,
            gender,
            email,
            dob,
            password,
            city,
            isAdmin,
         } = req.body;
         // Validate
         if (username.length < 6) {
            return res.status(401).json("User name is least 6 characters");
         }
         if (password.length < 6) {
            return res.status(401).json("Password is least 6 characters");
         }
         const isExistedUser = await User.findOne({
            username: username,
         });
         if (isExistedUser) {
            return res.status(401).json("Existed username");
         }
         // Hash password
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);
         // Create new user
         const newUser = new User({
            username,
            password: hashedPassword,
            fullName,
            region,
            address,
            gender,
            email,
            dob,
            city,
            isAdmin,
         });
         // Save to DB
         const user = await newUser.save();
         res.status(200).json(user);
      } catch (err) {
         console.log(err);
         res.status(500).json(err);
      }
   },
   // [POST] auth/login
   async login(req, res) {
      try {
         const user = await User.findOne({ username: req.body.username });
         if (!user) return res.status(404).json("Wrong username");
         const validPassword = await bcrypt.compare(req.body.password, user.password);
         if (!validPassword) return res.status(404).json("Wrong password");
         if (user && validPassword) {
            const accessToken = AuthController.createAccessToken(user);
            const refreshToken = AuthController.createRefreshToken(user);
            AuthController.refreshTokens.push(refreshToken);
            const { password, ...payload } = user._doc;
            res.cookie("refreshToken", refreshToken, {
               httpOnly: true,
               secure: false,
               path: "/",
               sameSite: "strict",
            });
            return res.status(200).json({
               user: payload,
               accessToken,
            });
         }
      } catch (err) {
         res.status(500).json(err);
      }
   },
   // [POST] auth/refresh
   async refresh(req, res) {
      try {
         // Get refresh token from user
         const refreshToken = req.cookies.refreshToken;
         if (!refreshToken) return res.status(401).json("You're not authenticated");
         // Check this refresh token existed
         if (!AuthController.refreshTokens.includes(refreshToken))
            return res.status(401).json("Refresh token is invalid");
         const decodeToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
         // Remove this old refresh token
         AuthController.refreshTokens = AuthController.refreshTokens.filter(
            (token) => token !== refreshToken
         );
         // Create new access token & refresh token
         const newAccessToken = AuthController.createAccessToken(decodeToken);
         const newRefreshToken = AuthController.createRefreshToken(decodeToken);
         AuthController.refreshTokens.push(newRefreshToken);
         res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict",
         });
         return res.status(200).json({ accessToken: newAccessToken });
      } catch (err) {
         console.log(err);
         res.status(500).json(err);
      }
   },

   // [POST] auth/logout
   async logout(req, res) {
      try {
         res.clearCookie("refreshToken");
         res.status(200).json("Log out successfully");
      } catch (err) {
         console.log(err);
      }
   },
};

export default AuthController;
