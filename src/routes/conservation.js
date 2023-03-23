import express from "express";
import ConversationController from "../app/controllers/ConversationController.js";
const router = express.Router();

router.get("/", ConversationController.getAllConversation);
router.post("/", ConversationController.addConsevation);

export default router;
