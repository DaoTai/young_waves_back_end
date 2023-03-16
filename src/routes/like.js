import express from "express";
import LikeController from "../app/controllers/LikeController.js";
const router = express.Router();

router.get("/:idPost", LikeController.show);

export default router;
