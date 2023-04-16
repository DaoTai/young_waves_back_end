import verifyTokenMiddleware from "./VerifyTokenMiddleware.js";
import Post from "../models/Post.js";
const verifyTokenAndAuthor = async (req, res, next) => {
   const idPost = req.params.id;
   const post = (await Post.findById(idPost)) || (await Post.findOneDeleted({ _id: idPost }));
   verifyTokenMiddleware(req, res, () => {
      post?.author.toString() === req.user._id
         ? next()
         : res.status(403).json({ msg: "You don't have permission!" });
   });
};

export default verifyTokenAndAuthor;
