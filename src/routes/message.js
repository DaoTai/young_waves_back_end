import express from "express";
import MessageController from "../app/controllers/MessageController.js";
const router = express.Router();
router.post("/", MessageController.createNewMessage);
router.delete("/:id", MessageController.deleteMessage);
export default router;
