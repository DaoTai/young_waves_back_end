import express from "express";
import * as dotenv from "dotenv";
import multer from "multer";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import connectToDB from "./config/db/index.js";
import route from "./routes/index.js";
import { socketChat, socketVideo } from "./utils/socket.js";
// Using env
dotenv.config();
const app = express();

const port = process.env.PORT || 8000;
const server = http.createServer(app);
const upload = multer({
   storage: multer.memoryStorage(),
});
// Connect to DB
connectToDB();

// Using middlewares
app.use(cookieParser());
app.use(
   cors({
      credentials: true,
      origin: "http://localhost:5173",
   })
);
app.use(express.json({ limit: process.env.CAPACITY_JSON_DATA }));
app.use(upload.any());

// Middleware for data in the body request (POST, PUT, PATCH)
app.use(
   express.urlencoded({
      extended: true,
      limit: "50mb",
   })
);

// ===================================
// Socket
const socketIo = new Server(server, {
   cors: {
      origin: "*",
   },
});
socketChat(socketIo);
socketVideo(socketIo);

// Routing for app
route(app);
server.listen(port, () => {
   console.log(`PORT ${port} connect successfully!`);
});
