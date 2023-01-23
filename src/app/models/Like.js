import mongoose from "mongoose";
const likeSchema = new mongoose.Schema(
   {
      author: {
         type: mongoose.Types.ObjectId,
         ref: "user",
         required: true,
      },
      post: {
         type: mongoose.Types.ObjectId,
         ref: "post",
         required: true,
      },
      isLike: {
         type: Boolean,
      },
   },
   {
      timestamps: true,
   }
);

const LikeModel = mongoose.model("like", likeSchema);
export default LikeModel;
