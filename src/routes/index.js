import authRouter from "./auth.js";
import adminRouter from "./admin.js";
import VerifyTokenAndAdminMiddleware from "../app/middlewares/VerifyTokenAndAdminMiddleware.js";
const route = (app) => {
   app.use("/auth", authRouter);
   app.use("/admin", VerifyTokenAndAdminMiddleware, adminRouter);
};

export default route;
