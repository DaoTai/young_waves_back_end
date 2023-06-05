// Chatting socket
export const socket = (socketIo) => {
   let onlineUsers = [];
   let users = [];

   //Online users
   const addOnlineUsers = (idUser, idSocket, friends) => {
      !onlineUsers.some((user) => user.idUser === idUser) && onlineUsers.push({ idUser, idSocket, friends });
   };

   const removeOnlineUsers = (idSocket) => {
      onlineUsers = onlineUsers.filter((user) => user.idSocket !== idSocket);
   };

   const getOnlineUser = (idUser) => {
      return onlineUsers.find((user) => user.idUser === idUser);
   };

   // Chat
   const addUser = (idUser, idConversation, idSocket) => {
      !users.some((user) => user.idUser === idUser && user.idConversation === idConversation) && users.push({ idUser, idConversation, idSocket });
   };

   const removeUser = (idSocket) => {
      users = users.filter((user) => user.idSocket !== idSocket);
   };

   const getUser = (idUser, idConversation) => {
      return users.find((user) => user.idUser === idUser && user.idConversation === idConversation);
   };

   socketIo.on("connection", (socket) => {
      // Connected
      socket.on("addOnlineUser", (idUser, friends) => {
         addOnlineUsers(idUser, socket.id, friends);
         const user = getOnlineUser(idUser);
         const onlineFriendsIds = onlineUsers.filter((user) => friends.includes(user.idUser)).map((user) => user.idUser);
         // Send list id of online users
         socketIo.to(user?.idSocket).emit("getOnlineFriends", onlineFriendsIds);

         // Update new list id online users for friends of user
         onlineUsers.forEach((onlineUser) => {
            // Each online friends of user will show user who is active
            onlineFriendsIds.forEach((onlineId) => {
               // If id of online user matches with id of online friend
               if (onlineUser.idUser === onlineId) {
                  // Get list id of online friends of friend
                  const onlineFiendsOfFriend = onlineUsers.filter((user) => onlineUser.friends.includes(user.idUser)).map((user) => user.idUser);
                  // Update online friends of friend
                  socketIo.to(onlineUser?.idSocket).emit("getOnlineFriends", onlineFiendsOfFriend);
               }
            });
         });
      });
      // emit event to update client-side list of online users
      socketIo.to(socket.id).emit("getOnlineUsers", users);
      // Add user to socket
      socket.on("addUser", (idUser, idConversation) => {
         addUser(idUser, idConversation, socket.id);
      });

      //send message
      socket.on("sendMessage", function ({ idSender, idConversation, idReceiver, text, attachments }) {
         const user = getUser(idReceiver, idConversation);
         socketIo.to(user?.idSocket).emit("getMessage", {
            idSender,
            text,
            attachments,
         });
      });

      // When disconnect
      socket.on("disconnect", () => {
         const disconnectedUser = onlineUsers.find((user) => user.idSocket === socket.id);
         removeOnlineUsers(socket.id);
         disconnectedUser?.friends?.forEach((idFriend) => {
            const friend = getOnlineUser(idFriend);
            if (friend) {
               const onlineFriendsOfFriend = onlineUsers.map((user) => friend.friends.includes(user.idUser));
               socketIo.to(friend?.idSocket).emit("removeOnlineUser", onlineFriendsOfFriend);
            }
         });

         removeUser(socket.id);
      });
   });
};
