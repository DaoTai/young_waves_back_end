import jwt from "jsonwebtoken";

// Create access token
export const createAccessToken = (user) => {
   return jwt.sign(
      {
         _id: user._id,
         isAdmin: user.isAdmin,
      },
      process.env.JWT_ACCESS_TOKEN,
      {
         expiresIn: "1d",
      }
   );
};
// Create refresh token
export const createRefreshToken = (user) => {
   return jwt.sign(
      {
         _id: user._id,
         isAdmin: user.isAdmin,
      },
      process.env.JWT_REFRESH_TOKEN,
      {
         expiresIn: "30d",
      }
   );
};
