import mongoose from "mongoose";
const conversationSchema = new mongoose.Schema(
   {
      members: [{ type: mongoose.Types.ObjectId, ref: "user" }],
   },
   {
      timestamps: true,
   }
);

const ConversationModel = mongoose.model("conversation", conversationSchema);
export default ConversationModel;
