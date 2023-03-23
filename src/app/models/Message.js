import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
   {
      idConservation: { type: mongoose.Types.ObjectId, ref: "conversation" },
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

const MessageModel = mongoose.model("conversation", messageSchema);
export default MessageModel;
