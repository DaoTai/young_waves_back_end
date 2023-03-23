import authRouter from "./auth.js";
import adminRouter from "./admin.js";
import userRouter from "./user.js";
import postRouter from "./post.js";
import commentRouter from "./comment.js";
import likeRouter from "./like.js";
import conservationRouter from "./conservation.js";
import { VerifyTokenAndAdminMiddleware, VerifyTokenMiddleware } from "../app/middlewares/index.js";
const route = (app) => {
   app.use("/auth", authRouter);
   app.use("/admin", VerifyTokenAndAdminMiddleware, adminRouter);
   app.use("/user", VerifyTokenMiddleware, userRouter);
   app.use("/posts", VerifyTokenMiddleware, postRouter);
   app.use("/comments", VerifyTokenMiddleware, commentRouter);
   app.use("/likes", VerifyTokenMiddleware, likeRouter);
   app.use("/conversation", VerifyTokenMiddleware, conservationRouter);
};

export default route;
