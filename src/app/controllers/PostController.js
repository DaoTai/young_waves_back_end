import { Post, Comment } from "../models/index.js";
const PostController = {
   // [GET] posts/
   async show(req, res) {
      try {
         const posts = await Post.find().populate("author");
         res.status(200).json(posts);
      } catch (err) {
         console.log(err);
         res.status(500).json({ err, msg: "Show post failed!" });
      }
   },

   // [POST] posts/
   async create(req, res) {
      try {
         const newPost = new Post({ ...req.body, author: req.user.id });
         await newPost.save();
         res.status(200).json(newPost);
      } catch (err) {
         res.status(500).json({ err, msg: "Create post failed!" });
      }
   },

   // [PUT] posts/:id
   async edit(req, res) {
      try {
         const newBody = req.body.body.trim();
         if (!!newBody) {
            await Post.findByIdAndUpdate(req.params.id, { ...req.body, body: newBody });
            res.status(200).json({ msg: "Edited successfully!" });
         } else {
            throw new Error({ msg: "Invalid content!" });
         }
      } catch (err) {
         res.status(500).json({ err, msg: "Edit post failed!" });
      }
   },

   // [DELETE] posts/:id
   async delete(req, res) {
      try {
         await Post.delete({ _id: req.params.id });
         res.status(200).json({ msg: "Delete post successfully!" });
      } catch (err) {
         res.status(500).json({ err, msg: "Delete post failed!" });
      }
   },

   // [PATCH] posts/:id
   async restore(req, res) {
      try {
         await Post.restore({ _id: req.params.id });
         res.status(200).json({ msg: "Restore post successfully!" });
      } catch (err) {
         res.status(500).json({ err, msg: "Restore post failed!" });
      }
   },

   // [DELETE] posts/:id/force-delete
   async forceDelete(req, res) {
      try {
         await Post.findByIdAndDelete(req.params.id);
         res.status(200).json({ msg: "Delete post successfully!" });
      } catch (err) {
         res.status(500).json({ err, msg: "Delete post failed!" });
      }
   },
};

export default PostController;
