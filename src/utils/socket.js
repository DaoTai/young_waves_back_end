// Làm mới lại

import { Server } from "socket.io";

export class MySocket {
  // Người dùng online
  onlineUsers = [];
  // Mảng chứa {idSocket, idUser, idConversation} để lấy ra idSocket của user tại 1 conversation
  chatUsers = [];

  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
      },
    });
  }

  addOnlineUser(idUser, idSocket) {
    const isExist = this.onlineUsers.some((user) => user.idUser === idUser);
    if (!isExist) {
      this.onlineUsers.push({ idUser, idSocket });
    }
  }

  removeOnlineUser(idSocket) {
    this.onlineUsers = this.onlineUsers.filter((user) => user.idSocket !== idSocket);
  }

  getIdOnlineUserByIdSocket(idSocket) {
    const user = this.onlineUsers.find((user) => user.idSocket === idSocket);
    return user?.idUser || undefined;
  }

  getListIdOnlineUsers() {
    return this.onlineUsers.map((user) => user.idUser);
  }

  handleChat() {
    this.io.on("connection", (socket) => {
      // => Add user to online users and
      // => Send online users
      socket.on("joinOnlineUser", (idUser) => {
        this.addOnlineUser(idUser, socket.id);
        console.log("List online: ", this.onlineUsers);
        this.io.emit("onlineUsers", this.getListIdOnlineUsers());
      });

      // => Join conversation
      socket.on("joinConversation", (idConversation) => {
        socket.join(idConversation);
      });

      //  => Send message to friend
      socket.on("sendMessage", ({ id, idSender, idConversation, text, attachments }) => {
        socket.to(idConversation).emit("getMessage", {
          id,
          idSender,
          text,
          attachments,
        });
      });

      // => When user disconnect
      socket.on("disconnect", () => {
        // Remove user from online users
        this.io.emit("offlineUser", this.getIdOnlineUserByIdSocket(socket.id));
        this.removeOnlineUser(socket.id);
      });
    });
  }

  handleVideoCall() {
    this.io.on("connection", (socket) => {});
  }

  run() {
    this.handleChat();
    this.handleVideoCall();
  }
}

// Chatting socket
export const socketChat = (socketIo) => {
  let onlineUsers = [];
  let chatUsers = [];

  // Online users
  const addOnlineUsers = (idUser, idSocket, friends) => {
    !onlineUsers.some((user) => user.idUser === idUser) &&
      onlineUsers.push({ idUser, idSocket, friends });
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
    return chatUsers.find(
      (user) => user.idUser === idUser && user.idConversation === idConversation
    );
  };

  socketIo.on("connection", (socket) => {
    // Connected

    // ================================ONLINE USERS=========================================================
    // emit event to update client-side list of online users
    socket.on("addOnlineUser", (idUser, friends) => {
      addOnlineUsers(idUser, socket.id, friends);
      const user = getOnlineUser(idUser);
      const onlineFriendsIds = onlineUsers
        .filter((user) => friends.includes(user.idUser))
        .map((user) => user.idUser);
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
      socket.join(idConversation);
      addChatUser(idUser, idConversation, socket.id);
    });

    //send message
    socket.on("sendMessage", ({ idSender, idConversation, idReceiver, text, attachments }) => {
      // Get socket of receiver
      // const user = getChatUser(idReceiver, idConversation);

      // Chỉ gửi đi (những) người có trong room idConversation khi dùng socket thay vì ioSocket
      socket.to(idConversation).emit("getMessage", {
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
          const onlineFriends = onlineUsers.filter((onlineUser) =>
            newFriendsOfFriend.includes(onlineUser.idUser)
          );
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

// Video socket
export const socketVideo = (socketIo) => {
  const rooms = [];
  socketIo.on("connection", (socket) => {
    socket.on("getIdFriend", (idSocket) => {
      socketIo.to(idSocket).emit("receiveIdFriend", "123456");
    });

    socket.on("disconnect", () => {
      socket.broadcast.emit("callEnded");
    });
  });
};
