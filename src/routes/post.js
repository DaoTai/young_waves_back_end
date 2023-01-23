import express from "express";
import PostController from "../app/controllers/PostController.js";
import { VerifyTokenAndAuthorMiddleware, VerifyTokenMiddleware } from "../app/middlewares/index.js";
const router = express.Router();

router.get("/", PostController.show);
router.post("/", PostController.create);
router.put("/:id", VerifyTokenAndAuthorMiddleware, PostController.edit);
router.delete("/:id", VerifyTokenAndAuthorMiddleware, PostController.delete);
router.patch("/:id", VerifyTokenAndAuthorMiddleware, PostController.restore);
router.delete("/:id/force-delete", VerifyTokenAndAuthorMiddleware, PostController.forceDelete);

export default router;
