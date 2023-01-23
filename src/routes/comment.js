import express from "express";
import CommentController from "../app/controllers/CommentController.js";
import { VerifyTokenMiddleware, VerifyTokenAndAuthorMiddleware } from "../app/middlewares/index.js";
const router = express.Router();

router.get("/:id", CommentController.show);
router.post("/:id", CommentController.create);
router.put("/:id/:idComment", CommentController.edit);
router.delete("/:id/:idComment", CommentController.delete);

export default router;
