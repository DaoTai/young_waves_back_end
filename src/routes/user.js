import express from "express";
import UserController from "../app/controllers/UserController.js";

const router = express.Router();

router.get("/all", UserController.getAllUsers);
router.get("/:id", UserController.getUser);
router.patch("/:id", UserController.editUser);
router.patch("/:id/new-password", UserController.changePasswordUser);

export default router;
