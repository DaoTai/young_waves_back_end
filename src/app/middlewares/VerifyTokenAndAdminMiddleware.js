import verifyTokenMiddleware from "./VerifyTokenMiddleware.js";
const verifyTokenAndAdmin = (req, res, next) => {
   verifyTokenMiddleware(req, res, () => {
      if (req.user?.isAdmin) {
         next();
      } else {
         res.status(403).json({
            msg: "You're not admin",
         });
      }
   });
};

export default verifyTokenAndAdmin;
