import express from "express";
import PostController from "../app/controllers/PostController.js";

const router = express.Router();

router.get("/", PostController.show);
router.post("/", PostController.create);

export default router;
