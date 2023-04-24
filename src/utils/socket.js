// Chatting socket
export const chattingSocket = (socketIo) => {
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
         removeUser(socket.id);
      });
   });
};
