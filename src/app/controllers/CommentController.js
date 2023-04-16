import { Post, Comment, User } from "../models/index.js";
const CommentController = {
   // [GET] comments/:id
   async show(req, res) {
      try {
         const post = await Post.findById(req.params.id).populate("comments");
         // const user = await Comment.find({
         //    _id: post.comments.map((comment) => comment._id),
         // }).populate("user", "fullName");
         res.status(200).json(post.comments);
      } catch (err) {
         res.status(500).json({ err, msg: "Show comment failed!" });
      }
   },

   // [POST] comments/:idPost
   async create(req, res) {
      try {
         const newComment = req.body.comment.trim();
         const idPost = req.params.idPost;
         if (!!newComment && idPost) {
            const comment = new Comment({
               body: newComment,
               user: req.user._id,
               post: idPost,
            });
            const savedComment = await comment.save();
            await comment.populate("user");
            await Post.findByIdAndUpdate(idPost, {
               $push: { comments: savedComment._id },
            });
            res.status(200).json(savedComment);
         } else {
            res.status(400).json("Invalid comment");
         }
      } catch (err) {
         res.status(500).json({ err, msg: "Saved comment failed!" });
      }
   },

   // [PUT] comments/:id/:idComment
   async edit(req, res) {
      try {
         const newComment = req.body.comment.trim();
         const idComment = req.params.idComment;
         const isAuthor = await Comment.findOne({
            user: req.user._id,
            _id: idComment,
         });
         if (isAuthor) {
            if (!!newComment) {
               await Comment.findByIdAndUpdate(idComment, {
                  $set: {
                     body: newComment,
                  },
               });
               res.status(200).json("Edited comment successfully!");
            } else {
               throw new Error("Invalid comment!");
            }
         } else {
            res.status(403).json("You don't have permission to edit this comment");
         }
      } catch (err) {
         res.status(500).json({ err, msg: "Edit failed!" });
      }
   },

   // [DELETE] comments:/:id/:idComment
   async delete(req, res) {
      try {
         const idComment = req.params.idComment;
         const idPost = req.params.id;
         const isAdmin = req.user.isAdmin;
         const author = await Comment.findOne({
            user: req.user._id,
            _id: idComment,
         });
         const authorOfPost = await Post.findOne({
            _id: idPost,
            author: req.user._id,
         });

         if (author || authorOfPost || isAdmin) {
            await Comment.findByIdAndDelete(idComment);
            await Post.findByIdAndUpdate(idPost, {
               $pull: {
                  comments: idComment,
               },
            });
            res.status(200).json({ msg: "Delete comment successfully!" });
         } else {
            res.status(403).json({ msg: "You don't have permission to delete this post" });
         }
      } catch (err) {
         res.status(500).json({ err, msg: "Delete failed!" });
      }
   },
};

export default CommentController;
