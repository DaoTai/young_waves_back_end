import { Post, Comment } from "../models/index.js";
const CommentController = {
   // [GET] comments/:id
   async show(req, res) {
      try {
         const post = await Post.findById(req.params.id).populate("comments");
         res.status(200).json(post.comments);
      } catch (err) {
         res.status(500).json({ err, msg: "Show comment failed!" });
      }
   },

   // [POST] comments/:id
   async create(req, res) {
      try {
         const newComment = req.body.comment.body.trim();
         const idPost = req.params.id;
         if (!!newComment) {
            const comment = new Comment({
               body: newComment,
               user: req.user.id,
               post: idPost,
            });
            await comment.save();
            await Post.findByIdAndUpdate(idPost, {
               $push: { comments: comment },
            });
            res.status(200).json({ msg: "Saved comment successfully!" });
         } else {
            res.status(400).json({ msg: "Invalid comment!" });
         }
      } catch (err) {
         res.status(500).json({ err, msg: "Saved comment failed!" });
      }
   },
};

export default CommentController;
