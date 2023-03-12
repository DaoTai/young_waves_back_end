import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
const commentSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Types.ObjectId,
         ref: "user",
      },
      post: {
         type: mongoose.Types.ObjectId,
         ref: "post",
      },
      body: {
         type: String,
         maxLength: 10000,
         required: true,
      },
   },
   {
      timestamps: true,
   }
);

commentSchema.plugin(mongooseDelete, { overrideMethods: true, deletedAt: true });
const CommentModel = mongoose.model("comment", commentSchema);
export default CommentModel;
