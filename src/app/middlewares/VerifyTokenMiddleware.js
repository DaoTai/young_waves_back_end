import jwt from "jsonwebtoken";
const verifyToken = (req, res, next) => {
   // get token in headers
   const token = req.headers.token;
   if (token) {
      // format token in headers: Bearer 1224a...
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN, (err, data) => {
         if (err) {
            return res.status(403).json({ msg: "Token is not valid" });
         }
         req.user = data;
         next();
      });
   } else {
      return res.status(401).json({ msg: "You're not authenticated" });
   }
};

export default verifyToken;
