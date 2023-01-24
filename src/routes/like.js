import express from "express";
import LikeController from "../app/controllers/LikeController.js";
const router = express.Router();

router.get("/:id", LikeController.show);
router.post("/:id", LikeController.edit);

export default router;
