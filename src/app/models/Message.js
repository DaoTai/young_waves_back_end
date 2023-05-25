import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
   type: { type: String, default: "image", enum: ["image", "video"] },
   url: { type: String, required: true },
});

const messageSchema = new mongoose.Schema(
   {
      idConversation: { type: mongoose.Types.ObjectId, ref: "conversation" },
      sender: {
         type: mongoose.Types.ObjectId,
         ref: "user",
      },
      content: {
         type: String,
      },
      type: {
         type: String,
         default: "text",
         enum: ["text", "image", "video"],
      },
      attachments: [attachmentSchema],
   },
   {
      timestamps: true,
   }
);

const MessageModel = mongoose.model("message", messageSchema);
export default MessageModel;
