import express from "express";
import ConversationController from "../app/controllers/ConversationController.js";
const router = express.Router();

router.post("/", ConversationController.addConsevation);
router.get("/:id", ConversationController.getDetailConversation);
router.get("/", ConversationController.getUserConversations);

export default router;
