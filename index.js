// todo почистить верстку, убрать иконки картинок, когда нет фото

const socket = io('http://localhost:3000');
const image = document.querySelector('#image');
const inputPhoto = document.querySelector('#input-photo');
const messagesWrap = document.querySelector('#messages-wrap');
const usersList = document.querySelector('#users-list');
const formAuth = document.querySelector('#form-auth');
const formMessage = document.querySelector('#form-message');
const userInfo = document.querySelector('#user-info');
const buttonPhoto = document.querySelector('#button-load-photo');
const formLoadPhoto = document.querySelector('#form-load-photo');
const popupLoadPhoto = document.querySelector('#popup-load-photo');
const popupAuth = document.querySelector('#popup-auth');
const buttonFormLoadPhotoClose = document.querySelector('#button-form-load-cancel');
const participantsTitle = document.querySelector('#participants-title');

const fileReader = new FileReader();

socket.on('render-messages', messages => {
  renderMessages(messages);
});

socket.on('current-user', user => {
  renderUserInfo(userInfo, user);
});

socket.on('add-message', messages => {
  renderMessages(messages);
});

socket.on('add-photo', messages => {
  renderMessages(messages);
});

socket.on('user-connected', (currentUser, users) => {
  renderParticipantsNumber(participantsTitle, users.length);
  renderUsers(users);
  renderUserInfo(userInfo, currentUser);
});

socket.on('user-disconnected', users => {
  renderParticipantsNumber(participantsTitle, users.length);
  renderUsers(users);
});

const renderParticipantsNumber = (element, number) => {
  element.innerHTML = `Участники (${number})`;
};

const renderUserInfo = (element, user) => {
  if (!user.current) {
    return;
  }

  const photo = element.querySelector('.image-photo');
  const name = element.querySelector('.user-info__welcome');

  photo.src = user.photo;
  name.innerHTML = user.name;
};

const renderUsers = (users) => {
  usersList.innerHTML = '';

  users.forEach(user => {
    const template = `<li class="users__list-item">${user.name}</li>`

    usersList.innerHTML += template;
  });
};

const renderMessages = (messages) => {
  messagesWrap.innerHTML = '';

  messages.forEach(message => {
    const template = 
      `<div class="message">
        <div class="message__photo image-photo-wrap">
          <div class="message__photo-text">No photo</div>
          <img src="${message.photo}" class="image-photo"></img>
        </div>
        <div class="message__content">
          <div class="message__header">
            <div class="message__name">${message.userName}</div>
            <div class="message__date">${message.date}</div>
          </div>
          <div class="message__text">${message.text}</div>
        </div>
      </div>`;

    messagesWrap.innerHTML += template;
  });
};

const onFormAuthSubmit = (event) => {
  event.preventDefault();
  popupAuth.classList.add('hidden');
  messagesWrap.classList.remove('hidden');
  formMessage.button.removeAttribute('disabled');
  socket.emit('user', {name: formAuth.fullname.value, nick: formAuth.nickname.value});
};

const onFormMessageSubmit = (event) => {
  event.preventDefault();
  
  const message = {
    date: (new Date()).toLocaleTimeString('en-GB'),
    text: formMessage.message.value
  };

  formMessage.message.value = '';

  socket.emit('message', message);
};

const onPhotoClick = (event) => {
  event.preventDefault();

  if (!popupAuth.classList.contains('hidden')) {
    return;
  }

  popupLoadPhoto.classList.remove('hidden');
  formMessage.button.setAttribute('disabled', true);
};

const onFormLoadPhotoSubmit = (event) => {
  event.preventDefault();
  popupLoadPhoto.classList.add('hidden');
  formMessage.button.removeAttribute('disabled');

  socket.emit('change-photo', image.src);
};

const onFormLoadPhotoCancelClick = () => {
  popupLoadPhoto.classList.add('hidden');
};

const onFileReaderLoad = () => {
  image.src = fileReader.result;
};

const onInputPhotoChange = (event) => {
  const [file] = event.target.files;

  if (!file) return;

  if (file.type !== 'image/jpeg') {
    alert('Формат файла должен быть JPEG');
  } else if (file.size > 512 * 1024) {
    alert('Файл слишком большой!');
  } else {
    fileReader.readAsDataURL(file);
  }
};


formAuth.addEventListener('submit', onFormAuthSubmit);
formMessage.addEventListener('submit', onFormMessageSubmit);
buttonPhoto.addEventListener('click', onPhotoClick);
formLoadPhoto.addEventListener('submit', onFormLoadPhotoSubmit);
formLoadPhoto.cancel.addEventListener('click', onFormLoadPhotoCancelClick);
fileReader.addEventListener('load', onFileReaderLoad);
inputPhoto.addEventListener('change', onInputPhotoChange);
