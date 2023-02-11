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
         res.status(200).json({
            total: idLikes.length,
            authors: fullNameOfAuthors,
         });
      } catch (err) {
         res.status(500).json(err);
      }
   },

   // [POST] likes/:id
   async edit(req, res) {
      try {
         const isLiked = await Like.findOne({
            author: req.user.id,
         });
         if (isLiked) {
            await Like.deleteOne({
               author: req.user.id,
            });
            await Post.findByIdAndUpdate(req.params.id, {
               $pull: {
                  likes: isLiked._id,
               },
            });
            res.status(200).json({ msg: "Unlike successfully" });
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
            res.status(200).json({ msg: "Liked this post successfully" });
         }
      } catch (err) {
         res.status(500).json(err);
      }
   },
};

export default LikeController;
