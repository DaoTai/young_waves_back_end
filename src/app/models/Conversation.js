import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
const conversationSchema = new mongoose.Schema(
   {
      members: [{ type: mongoose.Types.ObjectId, ref: "user" }],
      lastestMessage: {
         type: mongoose.Types.ObjectId,
         ref: "message",
      },
   },
   {
      timestamps: true,
   }
);
conversationSchema.plugin(mongooseDelete, { overrideMethods: true, deletedAt: true });
const ConversationModel = mongoose.model("conversation", conversationSchema);
export default ConversationModel;
