import User from "../models/User.js";
import Post from "../models/Post.js";
const PostController = {
   // [GET] post/
   async show(req, res, next) {
      try {
         const posts = await Post.find().populate("author");

         res.status(200).json(posts);
      } catch (err) {
         console.log(err);
         res.status(500).json({ err, msg: "Show post failed!" });
      }
   },
   // [POST] posts/
   async create(req, res, next) {
      try {
         const newPost = new Post({ ...req.body, author: req.user.id });
         await newPost.save();
         res.status(200).json(newPost);
      } catch (err) {
         res.status(500).json({ err, msg: "Create post failed!" });
      }
   },
};

export default PostController;
