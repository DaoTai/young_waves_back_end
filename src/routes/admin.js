import express from "express";
import AdminController from "../app/controllers/AdminController.js";

const router = express.Router();
router.get("/users", AdminController.getAllUsers);
export default router;
