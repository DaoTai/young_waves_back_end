import express from "express";
import MessageController from "../app/controllers/MessageController.js";
const router = express.Router();
router.post("/", MessageController.createNewMessage);

export default router;
