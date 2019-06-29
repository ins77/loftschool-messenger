const io = require('socket.io')(3000);

const users = {};
const messages = [];

io.on('connection', socket => {
  socket.on('user', user => {
    const existedUser = Object.values(users).find(item => item.name === user.name);

    removeExistingUser(users, existedUser);

    users[socket.id] = !!existedUser ? existedUser : { name: user.name, photo: '' };
  
    const usersArr = Object.values(users);

    socket.broadcast.emit('user-connected', users[socket.id], usersArr);
    socket.emit('user-connected', {...users[socket.id], current: true }, usersArr);
  });

  socket.on('change-photo', photo => {
    users[socket.id].photo = photo;

    const messagesToSend = messages.map(message => {
      if (users[socket.id].name === message.userName) {
        message.photo = photo;
      }

      return message;
    });

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
    const usersArr = Object.values(users);
    const usersToSend = usersArr.filter(user => user.name !== users[socket.id].name);

    socket.broadcast.emit('user-disconnected', usersToSend);
  });

  const removeExistingUser = (users, existedUser) => {
    Object.keys(users).forEach(key => {
      if (users[key] === existedUser) {
        delete users[key];
      }
    });
  };
});
