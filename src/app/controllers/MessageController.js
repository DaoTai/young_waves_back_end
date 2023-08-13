import ogs from "open-graph-scraper";

import { Message, Conversation } from "../models/index.js";
import { storageAttachments, deleteAttachments } from "../../utils/firebase.js";
const MessageController = {
  // [POST] message/
  async createNewMessage(req, res) {
    try {
      // Regex check: req.body.text is an url
      const regex =
        /(?:(?:https?|ftp):\/\/|\b(?:[a-z\d]+\.))(?:(?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))?\))+(?:\((?:[^\s()<>]+|(?:\(?:[^\s()<>]+\)))?\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))?/;
      const attachments = await storageAttachments(req.files);
      const { idConversation, sender, text } = req.body;
      const listAttachment = attachments.map((attach) => ({
        url: attach,
      }));

      const data = {
        idConversation,
        sender,
        text,
        attachments: listAttachment,
      };

      if (regex.test(text)) {
        try {
          const response = await ogs({
            url: text,
            timeout: 5,
          });
          const { result, error } = response;
          data.isUrl = true;
          data.previewImage = result.ogImage[0];
        } catch (err) {
          console.error("error: ", err);
          data.isUrl = true;
        }
      }

      if (!idConversation || !sender) {
        return res.sendStatus(404);
      }

      const newMessage = new Message(data);
      const savedMessage = await newMessage.save();
      await Conversation.findByIdAndUpdate(idConversation, {
        lastestMessage: savedMessage,
      });
      res.status(200).json(savedMessage);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // [DELETE] message/
  async deleteMessage(req, res) {
    try {
      const message = await Message.findByIdAndDelete(req.params.id);
      await deleteAttachments(message.attachments.map((attach) => attach.url));
      res.status(200).json(message);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

export default MessageController;
