const io = require('socket.io')(3000);
const users = {};
const messages = [];

io.on('connection', socket => {
  socket.on('user', user => {
    const existedUser = Object.values(users).find(item => item.name === user.name);

    removeExistingUser(users, existedUser);

    users[socket.id] = !!existedUser ? existedUser : { name: user.name, photo: '' };
    users[socket.id].isActive = true;
  
    const usersArr = Object.values(users).filter(user => user.isActive);

    socket.broadcast.emit('user-connected', users[socket.id], usersArr);
    socket.emit('user-connected', {...users[socket.id], current: true }, usersArr);
    socket.emit('render-messages', messages);
  });

  socket.on('change-photo', photo => {
    users[socket.id].photo = photo;

    const messagesToSend = getMessagesWithPhotos(messages, users[socket.id], photo);

    socket.emit('current-user', { ...users[socket.id], current: true });
    io.emit('add-photo', messagesToSend);
  });

  socket.on('message', message => {
    message.photo = users[socket.id].photo;
    message.userName = users[socket.id].name;
    messages.push(message);

    io.emit('add-message', messages);
  });

  socket.on('disconnect', () => {
    if (!users[socket.id]) {
      return;
    }

    const usersArr = Object.values(users);
    const usersToSend = usersArr.filter(user => user.name !== users[socket.id].name);

    users[socket.id].isActive = false;
    
    socket.broadcast.emit('user-disconnected', usersToSend);
  });

  const getMessagesWithPhotos = (messages, currentUser, photo) => {
    return messages.map(message => {
      if (currentUser.name === message.userName) {
        message.photo = photo;
      }

      return message;
    });
  };

  const removeExistingUser = (users, existedUser) => {
    Object.keys(users).forEach(key => {
      if (users[key] === existedUser) {
        delete users[key];
      }
    });
  };
});
