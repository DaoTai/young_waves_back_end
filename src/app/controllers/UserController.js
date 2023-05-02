import mongoose from "mongoose";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Conversation from "../models/Conversation.js";
import bcrypt from "bcrypt";

const UserController = {
   // [GET] user/all
   async getAllUsers(req, res) {
      try {
         const perPage = 12;
         const page = req.query.page || 1;
         const regex = new RegExp(req.query?.name, "i");
         const conditionFind = [
            { _id: { $ne: req.user._id }, fullName: { $regex: regex } },
            {
               password: 0,
            },
         ];
         const users = await User.find(...conditionFind)
            .skip(perPage * page - perPage)
            .limit(perPage);
         const totalUsers = await User.find(...conditionFind).countDocuments();
         res.status(200).json({
            users,
            currentPage: +page,
            maxPage: Math.ceil(totalUsers / perPage),
         });
      } catch (err) {
         res.status(500).json(err);
      }
   },

   // [GET] /user/:id
   async getUser(req, res) {
      try {
         const user = await User.findById(req.params.id, { password: 0 });
         const totalPosts = await Post.find({ author: req.params.id }).countDocuments();
         const result = { ...user._doc, totalPosts };
         res.status(200).json(result);
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

   // [GET] /user/friends/:id
   async getFriends(req, res) {
      try {
         const perPage = 6;
         const page = req.query.page || 1;
         const searchValue = new RegExp(req.query.searchValue, "i");
         const displayedData = {
            _id: 1,
            avatar: 1,
            fullName: 1,
         };
         // Get user's list id friends
         const user = await User.findById(req.params.id, { friends: 1 });
         const conditionFind = [
            {
               _id: {
                  $in: user.friends,
               },
               fullName: { $regex: searchValue },
            },
         ];
         const friends = await User.find(...conditionFind, displayedData)
            .skip(perPage * page - perPage)
            .limit(perPage);
         const count = await User.find(...conditionFind).countDocuments();
         const maxPage = Math.ceil(count / perPage);

         res.status(200).json({ friends, maxPage });
      } catch (err) {
         res.status(500).json("Get friends failed");
      }
   },

   // [PATCH] /user/add-friend/:id
   async addFriend(req, res) {
      try {
         const currentUser = await User.findById(req.user._id);
         const user = await User.findById(req.params.id);
         if (!currentUser.friends.includes(user._id)) {
            // Add your friend
            await currentUser.updateOne({
               $push: {
                  friends: req.params.id,
               },
            });
            // Add their friend
            await user.updateOne({
               $push: {
                  friends: req.user._id,
               },
            });
            // Check existed conversation
            const existedConversation = await Conversation.findOne({
               members: {
                  $all: [req.user._id, req.params.id],
               },
            });
            res.status(200).json({ user, existedConversation: !!existedConversation });
         } else {
            res.status(403).json("You added this user");
         }
      } catch (err) {
         res.status(500).json("Add friend failed");
      }
   },
   // [PATCH] /user/cancel-friend/:id
   async cancelFriend(req, res) {
      try {
         const currentUser = await User.findById(req.user._id);
         const user = await User.findById(req.params.id);
         if (currentUser.friends.includes(user._id)) {
            // Cancel your friend
            await currentUser.updateOne({
               $pull: {
                  friends: req.params.id,
               },
            });
            // Add their friend
            await user.updateOne({
               $pull: {
                  friends: req.user._id,
               },
            });
            res.status(200).json(user);
         } else {
            res.status(403).json("You canceled this user");
         }
      } catch (err) {
         res.status(500).json(err);
      }
   },
};

export default UserController;
