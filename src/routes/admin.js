import express from "express";
import AdminController from "../app/controllers/AdminController.js";
import UserController from "../app/controllers/UserController.js";

const router = express.Router();
router.get("/users", AdminController.getAllUsers);
router.get("/users/trash-users", AdminController.getTrashUsers);
router.get("/users/:id", UserController.getUser);
router.patch("/users/:id", UserController.editUser);
router.patch("/users/:id/restore", AdminController.restoreUser);
router.delete("/users/:id", AdminController.deleteUser);
router.delete("/users/:id/force-delete", AdminController.forceDeleteUser);
export default router;
