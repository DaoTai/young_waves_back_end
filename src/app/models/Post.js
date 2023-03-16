import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
const postSchema = new mongoose.Schema(
   {
      author: {
         type: mongoose.Types.ObjectId,
         ref: "user",
      },
      status: {
         type: String,
      },
      body: {
         type: String,
         maxLength: 10000,
         required: true,
      },
      likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
      comments: [{ type: mongoose.Types.ObjectId, ref: "comment" }],
      attachments: [{ type: String }],
   },
   {
      timestamps: true,
   }
);

postSchema.plugin(mongooseDelete, { overrideMethods: true, deletedAt: true });
const PostModel = mongoose.model("post", postSchema);
export default PostModel;
