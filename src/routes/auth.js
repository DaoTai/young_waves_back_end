import express from "express";
import AuthController from "../app/controllers/AuthController.js";
const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/refresh", AuthController.refresh);
export default router;
