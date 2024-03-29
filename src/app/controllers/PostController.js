import { Post, Comment, User } from "../models/index.js";
import { storageAttachments, deleteAttachments } from "../../utils/firebase.js";
const PostController = {
   // [GET] posts/
   async show(req, res) {
      try {
         const perPage = 5;
         const page = req.query.page || 1;
         const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(perPage * page - perPage)
            .limit(perPage)
            .populate("author");
         const total = await Post.find().countDocuments();
         res.status(200).json({
            posts,
            currentPage: +page,
            maxPage: Math.ceil(total / perPage),
         });
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
         const perPage = 5;
         const page = req.query.pageComment || 1;
         const post = await Post.findById(req.params.id).populate("author").populate("likes");
         const comments = await Comment.find({
            _id: { $in: post.comments },
         })
            .skip(page * perPage - perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })
            .populate("user", {
               fullName: 1,
               avatar: 1,
               isAdmin: 1,
            });

         const totalComments = await Comment.find({
            _id: { $in: post.comments },
         }).countDocuments();
         res.status(200).json({
            post,
            comments: {
               data: comments,
               currentPage: +page,
               maxPage: Math.ceil(totalComments / perPage),
            },
         });
      } catch (err) {
         console.log(err);
         res.status(500).json({ err, msg: "Get detail post failed!" });
      }
   },

   // [GET] posts/owner/:id
   async ownerPosts(req, res, next) {
      try {
         const perPage = 5;
         const page = req.query.page || 1;
         const posts = await Post.find({
            author: req.params.id,
         })
            .sort({ createdAt: -1 })
            .skip(perPage * page - perPage)
            .limit(perPage)
            .populate("author");
         // Total
         const total = await Post.find({
            author: req.params.id,
         }).countDocuments();
         res.status(200).json({
            posts,
            currentPage: +page,
            maxPage: Math.ceil(total / perPage),
         });
      } catch (err) {
         res.status(500).json("Get owner posts failed");
      }
   },

   // [GET] posts/:id/likes
   async getLikes(req, res) {
      const idPost = req.params.id;
      try {
         const post = await Post.findById(idPost, {
            likes: 1,
         }).populate("likes", {
            _id: 1,
            fullName: 1,
            avatar: 1,
         });
         res.status(200).json(post.likes);
      } catch (err) {
         console.log(err);
      }
   },

   // [POST] posts/
   async create(req, res) {
      try {
         const downloadURLs = await storageAttachments(req.files);
         const data = {
            ...req.body,
            author: req.user._id,
            attachments: downloadURLs,
         };
         const newPost = new Post(data);
         await newPost.save();
         await newPost.populate("author", {
            _id: 1,
            fullName: 1,
            avatar: 1,
         });
         console.log("New post: ", newPost);
         res.status(200).json(newPost);
      } catch (err) {
         console.log("Error: ", err);
         res.status(500).json({ err, msg: "Create post failed!" });
      }
   },

   // [POST] posts/trash
   async getTrash(req, res) {
      try {
         const perPage = 10;
         const page = req.query.page || 1;
         const posts = await Post.findDeleted({
            author: req.user._id,
         })
            .sort({ createdAt: -1 })
            .populate("author")
            .populate("likes")
            .skip(perPage * page - perPage)
            .limit(perPage);
         const totalTrash = await Post.countDocumentsDeleted({
            author: req.user._id,
         });
         res.status(200).json({
            posts,
            page,
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

   // [POST] posts/:id/like
   async like(req, res) {
      try {
         const idPost = req.params.id;
         //   check exist like
         const isExistedLike = await Post.findOne({
            _id: idPost,
            likes: {
               $in: [req.user._id],
            },
         });
         if (isExistedLike) {
            return res.status(400).json("Like existed");
         } else {
            await Post.updateOne(
               {
                  _id: idPost,
               },
               {
                  $push: {
                     likes: req.user._id,
                  },
               }
            );
            return res.status(200).json(req.user._id);
         }
      } catch (err) {
         res.status(500).json("Like failed");
      }
   },

   // [POST] posts/:id/unlike
   async unlike(req, res, next) {
      try {
         const idPost = req.params.id;
         //   check exist like
         const isExistedLike = await Post.findOne({
            _id: idPost,
            likes: {
               $in: [req.user._id],
            },
         });
         if (isExistedLike) {
            await Post.updateOne(
               {
                  _id: idPost,
               },
               {
                  $pull: {
                     likes: req.user._id,
                  },
               }
            );
            res.status(200).json("Unlike successfully");
         } else {
            res.status(401).json("Ever like");
         }
      } catch (err) {
         res.status(500).json("Unlike failed");
      }
   },
   // [PUT] posts/:id
   async edit(req, res) {
      try {
         const { status, body, deletedAttachments } = req.body;
         const idPost = req.params.id;
         if (body.trim()) {
            const downloadURLs = await storageAttachments(req.files);
            const updatedPost = await Promise.all([
               Post.findByIdAndUpdate(idPost, {
                  body,
                  status,
                  $push: {
                     attachments: { $each: downloadURLs },
                  },
               }),
               Post.findByIdAndUpdate(
                  idPost,
                  {
                     $pullAll: {
                        attachments: deletedAttachments,
                     },
                  },
                  { new: true }
               ).populate("author", {
                  _id: 1,
                  fullName: 1,
                  avatar: 1,
               }),
            ]);
            deletedAttachments && (await deleteAttachments(deletedAttachments));
            const finalPost = updatedPost[updatedPost.length - 1];
            res.status(200).json(finalPost);
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
         const post = await Post.findByIdAndDelete(req.params.id);
         post.attachments && (await deleteAttachments(post.attachments));
         res.status(200).json(post);
      } catch (err) {
         res.status(500).json({ err, msg: "Delete post failed!" });
      }
   },
};

export default PostController;
