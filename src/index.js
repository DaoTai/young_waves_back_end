import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToDB from "./config/db/index.js";
import route from "./routes/index.js";
// Using env
dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
// Connect to DB
connectToDB();

// Using middlewares
app.use(cors());
app.use(express.json());
// Middleware for data in the body request (POST, PUT)
app.use(
   express.urlencoded({
      extended: true,
   })
);

// Routing for app
route(app);
app.listen(port, () => {
   console.log(`PORT ${port} connect successfully!`);
});