import authRouter from "./auth.js";
import adminRouter from "./admin.js";
import userRouter from "./user.js";
import postRouter from "./post.js";
import { VerifyTokenAndAdminMiddleware, VerifyTokenMiddleware } from "../app/middlewares/index.js";
const route = (app) => {
   app.use("/auth", authRouter);
   app.use("/admin", VerifyTokenAndAdminMiddleware, adminRouter);
   app.use("/user", VerifyTokenMiddleware, userRouter);
   app.use("/post", VerifyTokenMiddleware, postRouter);
};

export default route;
