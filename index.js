const socket = new WebSocket("ws://localhost:3000");

const image = document.querySelector('#image');
const inputPhoto = document.querySelector('#input-photo');
const messagesWrap = document.querySelector('#messages-wrap');
const usersList = document.querySelector('#users-list');
const formAuth = document.querySelector('#form-auth');
const formMessage = document.querySelector('#form-message');
const nameWelcome = document.querySelector('#name-welcome');
const buttonPhoto = document.querySelector('#button-load-photo');
const formLoadPhoto = document.querySelector('#form-load-photo');
const popupLoadPhoto = document.querySelector('#popup-load-photo');
const buttonFormLoadPhotoClose = document.querySelector('#button-form-load-cancel');

const fileReader = new FileReader();
const currentUser = {name: '', nick: '', photo: '', type: 'user'};
const currentPhoto = {type: 'photoUrl', photoUrl: ''};
const users = new Set();

socket.addEventListener('close', (event) => {
  console.log('event', event);
});

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  console.log('data', data);

  if (data.type === 'message') {
    addMessage(data);
  }

  if (data.type === 'user') {
    users.add(data);
    renderUsers(users);
  }

  if (data.type === 'userPhoto') {
    setPhotos(data);
  }

  if (data.type === 'disconnect') {
    console.log('disconnect');
    const filteredUsers = removeUser(users, userToDelete);
    console.log(filteredUsers);
    renderUsers(filteredUsers);
  }
});

// todo функция должна быть чистая
const removeUser = (users, userToDelete) => {
  users.forEach(user => {
    if (user.id === userToDelete.userId) {
      users.delete(user);
    }
  });

  return users;
};

const renderUsers = (users) => {
  usersList.innerHTML = '';

  users.forEach(user => {
    const template = `<li class="users__list-item">${user.name}</li>`

    usersList.innerHTML += template;
    nameWelcome.innerHTML = user.name;
  });
};

const setPhotos = ({ photoUrl }) => {
  const photoContainers = [...document.querySelectorAll('.image-photo-wrap')];

  setCurrentPhoto(photoUrl);

  for (let photoContainer of photoContainers) {
    const photo = photoContainer.querySelector('.image-photo');

    photo.classList.remove('hidden');
    photo.src = photoUrl;
  }
};

const setCurrentUser = (name, nick, photo = '') => {
  currentUser.name = name;
  currentUser.nick = nick;
  currentUser.photo = photo;
};

const setCurrentPhoto = (photoUrl) => {
  currentPhoto.photoUrl = photoUrl;
};

const addMessage = (message) => {
  if (currentPhoto.photoUrl) {
    
  }

  const template = 
    `<div class="message">
      <div class="message__photo image-photo-wrap">
        <div class="message__photo-text">No photo</div>
        <img src="${currentPhoto.photoUrl}" class="image-photo hidden">
      </div>
      <div class="message__content">
        <div class="message__header">
          <div class="message__name">${message.name}</div>
          <div class="message__date">${message.date}</div>
        </div>
        <div class="message__text">${message.text}</div>
      </div>
    </div>`;

  messagesWrap.innerHTML += template;
};

// todo вынести слушатель
formAuth.addEventListener('submit', (event) => {
  event.preventDefault();
  formAuth.closest('.popup').classList.add('hidden');
  messagesWrap.classList.remove('hidden');
  formMessage.button.removeAttribute('disabled');
  setCurrentUser(formAuth.fullname.value, formAuth.nickname.value);
  socket.send(JSON.stringify(currentUser));
});

formMessage.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = {
    photo: currentUser.photo,
    name: currentUser.name,
    date: '2019.06.26',
    text: formMessage.message.value,
    type: 'message'
  };

  formMessage.message.value = '';

  socket.send(JSON.stringify(message));
});

buttonPhoto.addEventListener('click', (event) => {
  event.preventDefault();
  popupLoadPhoto.classList.remove('hidden');
  formMessage.button.setAttribute('disabled', true);
});

formLoadPhoto.addEventListener('submit', (event) => {
  event.preventDefault();
  popupLoadPhoto.classList.add('hidden');
  formMessage.button.removeAttribute('disabled');
  socket.send(JSON.stringify({type: 'userPhoto', photoUrl: image.src}));
});

formLoadPhoto.cancel.addEventListener('click', () => {
  popupLoadPhoto.classList.add('hidden');
});

fileReader.addEventListener('load', () => {
  image.src = fileReader.result;
});

inputPhoto.addEventListener('change', (event) => {
  const [file] = event.target.files;

  if (!file) return;

  if (file.size > 512 * 1024) {
    alert('Файл слишком большой!');
  } else if (file.type !== 'image/jpeg') {
    alert('Формат файла должен быть JPEG');
  } else {
    fileReader.readAsDataURL(file);
  }
});
