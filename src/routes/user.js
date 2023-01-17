import express from "express";
import UserController from "../app/controllers/UserController.js";

const router = express.Router();

router.get("/:id", UserController.getUser);
router.patch("/:id", UserController.editUser);

export default router;
