import express from "express";
import PostController from "../app/controllers/PostController.js";
import { VerifyTokenAndAuthorMiddleware, VerifyTokenMiddleware } from "../app/middlewares/index.js";
const router = express.Router();

router.get("/search", PostController.search);
router.get("/trash", PostController.getTrash);
router.get("/:id", PostController.detail);
router.get("/owner/:id", PostController.ownerPosts);
router.get("/trash/:id", PostController.getTrashDetail);
router.post("/", PostController.create);
router.put("/:id", VerifyTokenAndAuthorMiddleware, PostController.edit);
router.delete("/:id", VerifyTokenAndAuthorMiddleware, PostController.delete);
router.patch("/:id", VerifyTokenAndAuthorMiddleware, PostController.restore);
router.delete("/:id/force-delete", VerifyTokenAndAuthorMiddleware, PostController.forceDelete);
router.get("/", PostController.show);

export default router;
