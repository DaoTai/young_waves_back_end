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
const socketIo = new Server(server, {
   cors: {
      origin: "*",
   },
});

let users = [];
const addUser = (idUser, idConversation, idSocket) => {
   !users.some((user) => user.idUser === idUser && user.idConversation === idConversation) &&
      users.push({ idUser, idConversation, idSocket });
};

const removeUser = (idSocket) => {
   users = users.filter((user) => user.idSocket !== idSocket);
};

const getUser = (idUser, idConversation) => {
   return users.find((user) => user.idUser === idUser && user.idConversation === idConversation);
};

socketIo.on("connection", (socket) => {
   // Connected
   console.log("user connected");

   // Add user to socket
   socket.on("addUser", (idUser, idConversation) => {
      addUser(idUser, idConversation, socket.id);
   });

   //send message
   socket.on("sendMessage", function ({ idSender, idConversation, idReceiver, text }) {
      const user = getUser(idReceiver, idConversation);
      socketIo.to(user?.idSocket).emit("getMessage", {
         idSender,
         text,
      });
   });

   // When disconnect
   socket.on("disconnect", () => {
      console.log("Client disconnected");
      removeUser(socket.id);
   });
});

// Routing for app
route(app);
server.listen(port, () => {
   console.log(`PORT ${port} connect successfully!`);
});
