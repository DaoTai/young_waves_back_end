import mongoose from "mongoose";
import { Like, Post } from "../models/index.js";
const LikeController = {
   // [GET] likes/:id
   async show(req, res) {
      try {
         // Get list id of likes
         const idLikes = await Post.findById(req.params.id).distinct("likes");
         const likes = await Like.find({
            _id: { $in: idLikes },
         }).populate("author");
         // Get authors of likes
         const fullNameOfAuthors = likes.map((item) => item?.author);
         res.status(200).json(likes);
      } catch (err) {
         res.status(500).json(err);
      }
   },

   // [POST] likes/:id
   async like(req, res) {
      try {
         const post = await Post.findById(req.params.id).populate("likes");
         const isLiked = post.likes.some((like) => {
            return String(like.author) === req.user.id;
         });
         const like = await Like.findOne({
            _id: { $in: post.likes },
         });
         if (isLiked) {
            await Post.findByIdAndUpdate(req.params.id, {
               $pull: {
                  likes: like._id,
               },
            });
            const post = await Post.findById(req.params.id);
            console.log(post);
            await Like.deleteOne({
               author: req.user.id,
            });
            res.status(201).json(like);
         } else {
            const newLike = new Like({
               author: req.user.id,
               post: req.params.id,
               isLike: true,
            });
            await newLike.save();

            await Post.findByIdAndUpdate(req.params.id, {
               $push: {
                  likes: newLike,
               },
            });
            res.status(200).json(newLike);
         }
      } catch (err) {
         res.status(500).json(err);
      }
   },
};

export default LikeController;
