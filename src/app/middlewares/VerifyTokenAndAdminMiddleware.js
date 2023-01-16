import jwt from "jsonwebtoken";
import verifyTokenMiddleware from "./VerifyTokenMiddleware.js";
const verifyTokenAndAdmin = (req, res, next) => {
   verifyTokenMiddleware(req, res, () => {
      console.log("Req params: ", req.params);
      console.log("Req user: ", req.user);
      if (req.user.isAdmin) {
         next();
      } else {
         res.status(403).json({
            msg: "You're not admin",
         });
      }
   });
};

export default verifyTokenAndAdmin;
