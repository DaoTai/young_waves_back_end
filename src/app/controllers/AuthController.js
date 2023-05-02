import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createTransport } from "nodemailer";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { createAccessToken, createRefreshToken } from "../../utils/token.js";
const AuthController = {
   // Store refresh token
   refreshTokens: [],
   // [POST] auth/register
   async register(req, res) {
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
            const accessToken = createAccessToken(user);
            const refreshToken = createRefreshToken(user);
            AuthController.refreshTokens.push(refreshToken);
            const totalPosts = await Post.find({ author: user._id }).countDocuments();
            const { password, ...payload } = user._doc;
            res.cookie("refreshToken", refreshToken, {
               httpOnly: true,
               secure: false,
               path: "/",
               sameSite: "strict",
            });
            return res.status(200).json({
               user: { ...payload, totalPosts },
               accessToken,
            });
         }
      } catch (err) {
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
   // Chức năng của refresh token: như 1 phiếu chứng nhận rằng tôi có quyền được cấp 1 access token mới lần nữa
   // Refresh token tạo ra không có mục đích làm access token mới
   // Thời gian tồn tại của refresh token lâu hơn access token ==> (đảm bảo hiệu lực)

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
         const newAccessToken = createAccessToken(decodeToken);
         const newRefreshToken = createRefreshToken(decodeToken);
         AuthController.refreshTokens.push(newRefreshToken);
         res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict",
         });
         return res.status(200).json({ accessToken: newAccessToken });
      } catch (err) {
         // Example: refresh token is expired
         res.status(500).json(err);
      }
   },

   // [POST] auth/forgot-password
   async forgotPassword(req, res) {
      const user = await User.findOne({
         username: req.body.username,
      });
      if (!user) return res.status(404).json("Wrong username");
      if (user.email !== req.body.email) return res.status(404).json("Wrong email");
      const newPassword = String(Math.floor(100000000 + Math.random() * 900000000));
      const transporter = createTransport({
         service: "gmail",
         auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
         },
      });

      const mailOptions = {
         from: process.env.GMAIL_USER,
         to: user.email,
         subject: "Yong Waves #New password", // Subject line
         html: `
         <h3>Hi, ${user.fullName} </h3>
         <p>
            New password: <b> ${newPassword} </b>
         </p>
         <i> You need to change your password when login with this password </i>
         `,
      };
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      transporter.sendMail(mailOptions, async (err, data) => {
         if (err) {
            res.status(401).json("Send new password failed");
            throw new Error(err);
         } else {
            // Update password
            await User.findByIdAndUpdate(user._id, {
               password: hashedPassword,
            });
            res.status(200).json("Send new password successfully");
         }
      });
   },
};

export default AuthController;
