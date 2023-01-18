import express from "express";
import CommentController from "../app/controllers/CommentController.js";
import { VerifyTokenMiddleware } from "../app/middlewares/index.js";
const router = express.Router();

router.get("/:id", VerifyTokenMiddleware, CommentController.show);
router.post("/:id", VerifyTokenMiddleware, CommentController.create);

export default router;
