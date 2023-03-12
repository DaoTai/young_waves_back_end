import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import connectToDB from "./config/db/index.js";
import route from "./routes/index.js";
// Using env
dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);
// Connect to DB
connectToDB();

// Using middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
// Middleware for data in the body request (POST, PUT, PATCH)
app.use(
   express.urlencoded({
      extended: true,
      limit: "50mb",
   })
);

// ===================================
// Socket
let users = [];
const addUser = (userId, socketId) => {
   !users.some((user) => user.userId === userId) && users.push({ userId, socketId });
};

const removeUser = (socketId) => {
   users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
   return users.find((user) => user.userId === userId);
};
const socketIo = new Server(server, {
   cors: {
      origin: "*",
   },
});

socketIo.on("connection", (socket) => {
   socket.emit("getId", socket.id);
   //
   socket.on("sendDataClient", function (data) {
      socketIo.emit("sendDataServer", { data });
   });

   // When disconnect
   socket.on("disconnect", () => {
      console.log("Client disconnected");
   });
});

// Routing for app
route(app);
server.listen(port, () => {
   console.log(`PORT ${port} connect successfully!`);
});
