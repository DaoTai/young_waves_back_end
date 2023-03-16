import { Post, Comment, User } from "../models/index.js";
const PostController = {
   // [GET] posts/
   async show(req, res) {
      try {
         const posts = await Post.find({}).sort({ createdAt: -1 }).populate("author");
         res.status(200).json(posts);
      } catch (err) {
         console.log(err);
         res.status(500).json({ err, msg: "Show posts failed!" });
      }
   },

   // [GET] posts/search
   async search(req, res) {
      try {
         const regex = new RegExp(req.query?.q, "i");
         const posts = await Post.find({ body: { $regex: regex } })
            .sort({ createdAt: -1 })
            .populate("author")
            .populate("likes");
         res.status(200).json(posts);
      } catch (err) {
         console.log(err);
         res.status(500).json({ err, msg: "Show posts failed!" });
      }
   },

   // [GET] posts/:id
   async detail(req, res) {
      try {
         const post = await Post.findById(req.params.id).populate("author").populate("likes");
         const comments = await Comment.find({
            _id: { $in: post.comments },
         })
            .sort({ createdAt: -1 })
            .populate("user", {
               fullName: 1,
               avatar: 1,
            });
         res.status(200).json({ post, comments });
      } catch (err) {
         console.log(err);
         res.status(500).json({ err, msg: "Get detail post failed!" });
      }
   },

   // [GET] posts/owner/:id
   async ownerPosts(req, res, next) {
      try {
         const posts = await Post.find({
            author: req.params.id,
         })
            .sort({ createdAt: -1 })
            .populate("author");
         res.status(200).json(posts);
      } catch (err) {
         console.log(err);
         res.status(500).json({ err, msg: "Get owner posts failed!" });
      }
   },

   // [POST] posts/
   async create(req, res) {
      try {
         const newPost = new Post({ ...req.body, author: req.user.id });
         await newPost.save();
         await newPost.populate("author", {
            _id: 1,
            fullName: 1,
            avatar: 1,
         });
         res.status(200).json(newPost);
      } catch (err) {
         res.status(500).json({ err, msg: "Create post failed!" });
      }
   },

   // [POST] posts/trash
   async getTrash(req, res) {
      try {
         const perPage = 5;
         const page = req.query.page || 1;

         const posts = await Post.findDeleted({
            author: req.user.id,
         })
            .sort({ createdAt: -1 })
            .populate("author")
            .populate("likes")
            .skip(perPage * page - perPage)
            .limit(perPage);
         const totalTrash = await Post.countDocumentsDeleted({
            author: req.user.id,
         });
         res.status(200).json({
            posts,
            perPage: perPage,
            maxPage: Math.ceil(totalTrash / perPage),
         });
      } catch (err) {
         console.log(err);
         res.status(500).json({ err, msg: "Show trash post failed!" });
      }
   },

   // [POST] posts/trash/:id
   async getTrashDetail(req, res) {
      try {
         const post = await Post.findOneDeleted({
            _id: req.params.id,
         })
            .populate("author")
            .populate("likes");
         const comments = await Comment.find({
            _id: { $in: post.comments },
         })
            .sort({ createdAt: -1 })
            .populate("user", {
               fullName: 1,
               avatar: 1,
            });
         res.status(200).json({ post, comments });
      } catch (err) {
         console.log(err);
         res.status(500).json({ err, msg: "Get detail post failed!" });
      }
   },

   // [POST] posts/likes/:id
   async like(req, res) {
      try {
         const idPost = req.params.id;
         //   check exist like
         const isExistedLike = await Post.findOne({
            _id: idPost,
            likes: {
               $in: [req.user.id],
            },
         });
         if (isExistedLike) {
            await Post.updateOne(
               {
                  _id: idPost,
               },
               {
                  $pull: {
                     likes: req.user.id,
                  },
               }
            );
            res.status(204).json("Delete like successfully");
         } else {
            await Post.updateOne(
               {
                  _id: idPost,
               },
               {
                  $push: {
                     likes: req.user.id,
                  },
               }
            );
            res.status(201).json("Create new like successfully");
         }
      } catch (err) {
         res.status(500).json({ err, msg: "Handle like post failed" });
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
         const post = await Post.findById(req.params.id);
         res.status(200).json(post);
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
