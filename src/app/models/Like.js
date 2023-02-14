import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";
const AutoIncrement = mongooseSequence(mongoose);
const likeSchema = new mongoose.Schema(
   {
      _id: { type: Number },
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
   },
   {
      timestamps: true,
   }
);
likeSchema.plugin(AutoIncrement);
const LikeModel = mongoose.model("like", likeSchema);
export default LikeModel;
