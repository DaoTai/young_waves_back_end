import authRouter from "./auth.js";

const route = (app) => {
   app.use("/auth", authRouter);
};

export default route;
