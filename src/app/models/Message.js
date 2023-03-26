import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
   {
      idConversation: { type: mongoose.Types.ObjectId, ref: "conversation" },
      sender: {
         type: mongoose.Types.ObjectId,
         ref: "user",
      },
      text: {
         type: String,
      },
   },
   {
      timestamps: true,
   }
);

const MessageModel = mongoose.model("message", messageSchema);
export default MessageModel;
