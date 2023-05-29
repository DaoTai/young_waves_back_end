import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
   type: { type: String, default: "image", enum: ["image"] },
   url: { type: String, required: true },
});

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
      attachments: [attachmentSchema],
   },
   {
      timestamps: true,
   }
);

const MessageModel = mongoose.model("message", messageSchema);
export default MessageModel;
