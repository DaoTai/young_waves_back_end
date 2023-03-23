import mongoose from "mongoose";
const conversationSchame = new mongoose.Schema(
   {
      members: [{ type: mongoose.Types.ObjectId, ref: "user" }],
   },
   {
      timestamps: true,
   }
);

const ConversationModel = mongoose.model("conversation", conversationSchame);
export default ConversationModel;
