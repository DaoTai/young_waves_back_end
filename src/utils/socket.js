// Chatting socket
export const socket = (socketIo) => {
   let onlineUsers = [];
   let chatUsers = [];

   // Online users
   const addOnlineUsers = (idUser, idSocket, friends) => {
      !onlineUsers.some((user) => user.idUser === idUser) && onlineUsers.push({ idUser, idSocket, friends });
   };

   const removeOnlineUser = (idSocket) => {
      onlineUsers = onlineUsers.filter((user) => user.idSocket !== idSocket);
   };

   const getOnlineUser = (idUser) => {
      return onlineUsers.find((user) => user.idUser === idUser);
   };

   // Chat
   const addChatUser = (idUser, idConversation, idSocket) => {
      !chatUsers.some((user) => user.idUser === idUser && user.idConversation === idConversation) &&
         chatUsers.push({ idUser, idConversation, idSocket });
   };

   const removeChatUser = (idSocket) => {
      chatUsers = chatUsers.filter((user) => user.idSocket !== idSocket);
   };

   const getChatUser = (idUser, idConversation) => {
      return chatUsers.find((user) => user.idUser === idUser && user.idConversation === idConversation);
   };

   socketIo.on("connection", (socket) => {
      // Connected

      // ================================ONLINE USERS=========================================================
      // emit event to update client-side list of online users
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
                  const onlineFiendsOfFriend = onlineUsers
                     .filter((user) => onlineUser.friends.includes(user.idUser))
                     .map((user) => user.idUser);
                  // Update online friends of friend
                  socketIo.to(onlineUser?.idSocket).emit("getOnlineFriends", onlineFiendsOfFriend);
               }
            });
         });
      });

      // ================================CHAT=========================================================
      // Add user to socket
      socket.on("addChatUser", (idUser, idConversation) => {
         addChatUser(idUser, idConversation, socket.id);
      });

      //send message
      socket.on("sendMessage", function ({ idSender, idConversation, idReceiver, text, attachments }) {
         const user = getChatUser(idReceiver, idConversation);
         socketIo.to(user?.idSocket).emit("getMessage", {
            idSender,
            text,
            attachments,
         });
      });

      // When disconnect
      socket.on("disconnect", () => {
         const disconnectedUser = onlineUsers.find((user) => user.idSocket === socket.id);

         // Update status offline to friends of offline user
         disconnectedUser?.friends?.forEach((idFriend) => {
            const friend = getOnlineUser(idFriend);
            // If friend is online
            if (friend) {
               // Remove disconnected user
               const newFriendsOfFriend = friend.friends.filter((id) => id !== disconnectedUser.idUser);
               // Get friends is online
               const onlineFriends = onlineUsers.filter((onlineUser) => newFriendsOfFriend.includes(onlineUser.idUser));
               // Get ids of friends
               const ids = onlineFriends.map((item) => item.idUser);
               // Emit to friend of disconnected user: new online friends  for friend
               socketIo.to(friend?.idSocket).emit("removeOnlineUser", ids);
            }
         });
         removeChatUser(socket.id);
         removeOnlineUser(socket.id);
      });
   });
};
