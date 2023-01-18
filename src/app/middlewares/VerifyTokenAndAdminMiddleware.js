import verifyTokenMiddleware from "./VerifyTokenMiddleware.js";
const verifyTokenAndAdmin = (req, res, next) => {
   verifyTokenMiddleware(req, res, () => {
      req.user?.isAdmin
         ? next()
         : res.status(403).json({
              msg: "You're not admin",
           });
   });
};

export default verifyTokenAndAdmin;
