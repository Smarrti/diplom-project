import '../css/style.scss';
import { countWordsOnCategory, placeMainHtmlFile, failureImg, successImg, timeMessageOnGameEnd , failureSound, successSound, correctSound, errorSound, timeOfSuccessSoundAndVoice } from './Constatnt';
import * as API from './RouteAPI';

const burgerButton = document.querySelector('.hamburger-menu');
const sidebarWrapper = document.querySelector('.sidebar-wrapper');
const switcher = document.querySelector('.switch-input');
const body = document.querySelector('body');
let sessionToken = sessionStorage.getItem('sessionToken');
let wordTurn = [];
let openCategoryId;
let difficultWords = [];

async function sendRequest(url, method, data) {
  let response;
  await fetch(url, {
    method,
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then((res) => {
    if (res.status !== 200) {
      return Promise.reject(new Error(res.statusText));
    }
    return Promise.resolve(res)
  })
  .then((res) => res.json())
  .then(json => {response = json})
  .catch(() => {
    resolveApiErrors('Request error');
  })
  if (response.Error) {
    resolveApiErrors(response.Error);
    return 'Error'
  }
  return response;
}

function createMessage(type, headMessage, textMessage) {
  const messageBody = document.createElement('div');
  const messageImageWrapper = document.createElement('div');
  const messageImage = document.createElement('img');
  const messageWrapper = document.createElement('div');
  const messageCloseWrapper = document.createElement('div');
  const messageClose = document.createElement('img');
  const messageHead = document.createElement('p');
  const messageText = document.createElement('p');

  messageBody.classList.add('message');
  messageImageWrapper.classList.add('message__image-wrapper');
  messageImage.classList.add('message__image');
  messageWrapper.classList.add('message__wrapper');
  messageCloseWrapper.classList.add('message__close-wrapper');
  messageClose.classList.add('message__close');
  messageHead.classList.add('message__head');
  messageText.classList.add('message__text');

  messageClose.setAttribute('src', './assets/img/close.png');

  messageHead.textContent = headMessage;
  messageText.textContent = textMessage;

  switch (type) {
    case 'warning':
      messageImageWrapper.classList.add('message__image-wrapper_warning');
      messageImage.setAttribute('src', './assets/img/notify.png');
      break;
    case 'error':
      messageImageWrapper.classList.add('message__image-wrapper_error');
      messageImage.setAttribute('src', './assets/img/error.png');
      break;
    case 'complete':
      messageImageWrapper.classList.add('message__image-wrapper_complete');
      messageImage.setAttribute('src', './assets/img/complete.png')
    default:
      break;
  }

  messageImageWrapper.append(messageImage);
  messageCloseWrapper.append(messageClose);
  messageWrapper.append(messageCloseWrapper, messageHead, messageText);
  messageBody.append(messageImageWrapper, messageWrapper);
  body.append(messageBody);
}

function collectSimpleData() {
  return {
    token: sessionStorage.getItem('sessionToken'),
    userId: sessionStorage.getItem('userId')
  }
}

function deleteMessages() {
  const messages = document.querySelectorAll('.message');
  messages.forEach((e) => {
    body.removeChild(e);
  })
}

function resolveApiErrors(type) {
  switch (type) {
    case 'Request error':
    case 'Data base error':
      createMessage('error', 'Not connection', 'Not connection to server');
      break;
    case 'Not enough data':
      createMessage('warning', 'Not all data is filled', 'Please change request, and retry again');
      break;
    case 'Account not found':
      createMessage('warning', 'Error', 'Login or password are wrong');
      break;
    default:
      validError = false;
      break;
  }
}

async function getStats() {
  const url = API.detectURL('getStats');
  const data = collectSimpleData();
  const response = await sendRequest(url, 'POST', data);
  return response.stats;
}

async function sendStats(type) {
  const url = API.detectURL('setStats');
  let data = collectSimpleData();
  data.stats = localStorage.getItem('stats');
  if (type) {
    data.stats ='{}';
  }
  await sendRequest(url, 'POST', data);
}

async function apiLoginInSystem(login, password) {
  const url = API.detectURL('login');
  const data = {
    'login': login,
    'password': password
  }
  const token = await sendRequest(url, 'POST', data);
  if (token !== 'Error') {
    sessionStorage.setItem('sessionToken', token.token);
    sessionStorage.setItem('userId', token.userId);
    sessionStorage.setItem('status', token.status);
    sessionToken = token.token;
    generateStartContent();
    generateSidebar();
    deleteModals();
    localStorage.setItem('stats', await getStats(token.token, token.userId));
  }
}

async function apiRegisterInSystem(surname, name, birthday, login, password) {
  const data = {
    surname_user: surname,
    name_user: name,
    date_birthday: birthday,
    login,
    password
  }
  const url = API.detectURL('registration')
  const response = await sendRequest(url, 'POST', data);
  if (response.Success === 'Client registered') {
    await apiLoginInSystem(login, password);
  }
  createMessage('complete', 'Успешно', 'Вы зарегистрированы в системе')
}

async function getCategories() {
  const url = API.detectURL('categories');
  return await sendRequest(url, 'GET');
}

async function getWords(categoryId) {
  const url = API.detectURL('words');
  const data = {
    categoryId
  }
  return await sendRequest(url, 'POST', data);
}

async function getPoints() {
  const url = API.detectURL('getPoints');
  const data = collectSimpleData();
  return await sendRequest(url, 'POST', data);
}

async function addPoints(count, type) {
  const url = API.detectURL('setPoints');
  const points = await getPoints();
  let data = collectSimpleData();
  data.points = +points['points'] + count;
  if (type) {
    data.points = 0;
  }
  await sendRequest(url, 'POST', data);
}

function moveSidebar() {
  const hamburgerButton = document.querySelector('.hamburger');
  const sidebar = document.querySelector('.sidebar');
  hamburgerButton.classList.toggle('hamburger_active');
  sidebarWrapper.classList.toggle('sidebar-wrapper_active');
  sidebar.classList.toggle('sidebar_active');
}

function deleteContent() {
  wordTurn = [];
  document.querySelector('.main').innerHTML = '';
}

burgerButton.addEventListener('click', moveSidebar);
sidebarWrapper.addEventListener('click', () => {
  if (sidebarWrapper.classList.contains('sidebar-wrapper_active')) {
    moveSidebar();
  }
});

async function generateStartContent() {
  const mainContent = document.querySelector('.main');
  const categories = await getCategories();

  categories.forEach((category, index) => {
    const card = document.createElement('a');
    const cardWrapper = document.createElement('div');
    const cardImage = document.createElement('img');
    const cardText = document.createElement('p');

    card.dataset.category = category.name_category;

    card.setAttribute('href', '#');
    cardImage.setAttribute('src', category.picture_category);

    card.classList.add('category-card', 'card', 'category');
    cardWrapper.classList.add('category-card__wrapper', 'category');
    cardImage.classList.add('category-card__image', 'category');
    cardText.classList.add('card__text', 'category');

    cardText.textContent = category.name_category;

    cardWrapper.append(cardImage);
    card.append(cardWrapper);
    card.append(cardText);
    mainContent.append(card);
  })
}

function createSidebarElement(tag, href, className, nameLink) {
  const link = document.createElement(tag);
  link.setAttribute('href', href);
  link.className = className;
  link.textContent = nameLink;
  return link;
}

async function generateSidebar() {
  const categories = await getCategories();
  const sidebar = document.querySelector('.sidebar');
  sidebar.append(createSidebarElement('a', '#', 'sidebar__link sidebar__link_active', 'Main Page'));
  sidebar.append(createSidebarElement('a', '#', 'sidebar__link', 'Stats'));
  categories.forEach((category) => {
    sidebar.append(createSidebarElement('a', '#', 'sidebar__link', category.name_category));
  });
}

async function determineCategoryId(categoryName) {
  const url = API.detectURL('determineCategoryId');
  const data = {
    categoryName
  }
  const response = await sendRequest(url, 'POST', data);
  return response.categoryId;
}

async function generateTrainMode(categoryId, playMode) {
  const mainContent = document.querySelector('.main');

  openCategoryId = categoryId;

  const title = document.createElement('div');
  title.classList.add('main__title');
  title.textContent = 'Train words';
  mainContent.append(title);

  if (playMode) {
    const starsWrapper = document.createElement('div');
    starsWrapper.classList.add('stars-block');
    mainContent.append(starsWrapper);
  }

  let words = [];
  if (categoryId === 'trainDifficultWordsMode') {
    title.textContent = 'Difficult words';
    difficultWords = difficultWords.sort().reverse();
    for (let i = 0; i < 8 && i < difficultWords.length; i += 1) {
      words.push(difficultWords[i][1]);
    }
  } else {
    const response = await getWords(categoryId);
    title.textContent = response.name_category;
    words = response.words;
  }

  words.forEach((wordObject, index) => {
    const card = document.createElement('a');
    const cardFront = document.createElement('div');
    const cardWrapper = document.createElement('div');
    const cardImage = document.createElement('img');
    const cardTextEn = document.createElement('p');
    const cardRotate = document.createElement('div');

    card.setAttribute('href', '#');
    cardImage.setAttribute('src', wordObject.image);

    card.classList.add(`card${index}`, 'word-card', 'card', 'cardElement',);
    cardFront.classList.add(`card${index}`, 'word-card_front', 'cardElement');
    cardWrapper.classList.add(`card${index}`, 'word-card__wrapper', 'cardElement');
    cardImage.classList.add(`card${index}`, 'word-card__image', 'cardElement');
    cardTextEn.classList.add(`card${index}`, 'card__text', 'word-card__text', 'cardElement');
    cardRotate.classList.add(`card${index}`, 'word-card__rotate', 'cardElement');

    cardTextEn.textContent = wordObject.word;

    cardWrapper.append(cardImage);
    if (playMode) {
      card.append(cardWrapper);
      cardImage.classList.add('card_play');
      cardImage.dataset.word = wordObject.word;
    } else {
      cardFront.append(cardWrapper);
      cardFront.append(cardTextEn);

      const cardBack = document.createElement('div');
      cardBack.innerHTML = cardFront.innerHTML;
      cardBack.classList.remove('word-card_front');
      cardBack.classList.add('word-card_back');
      card.append(cardBack);
      cardBack.querySelector('.word-card__text').textContent = wordObject.translation;
      cardBack.querySelector('.word-card__text').classList.add('word-card__translation');

      cardFront.append(cardRotate);
      card.append(cardFront);
    }
    mainContent.append(card);
  });
  if (playMode) {
    const hiddenLine = document.createElement('hr');
    hiddenLine.classList.add('line-before-button');
    mainContent.append(hiddenLine);

    const gameButton = document.createElement('button');
    gameButton.classList.add('button', 'button__start');
    gameButton.textContent = 'Start game';
    mainContent.append(gameButton);
  }
} 

function rotateCard(card) {
  const cardFront = card.querySelector('.word-card_front');
  const cardBack = card.querySelector('.word-card_back');
  if (cardFront && cardBack) {
    cardFront.classList.toggle('rotated-front');
    cardBack.classList.toggle('rotated-back');
  } else if (document.querySelector('.rotated-back')) {
    document.querySelector('.rotated-back').classList.remove('rotated-back');
    document.querySelector('.rotated-front').classList.remove('rotated-front');
  }
}

function changeSidebarLinkActive(text) {
  const sidebarLinks = document.querySelectorAll('.sidebar__link');
  sidebarLinks.forEach((link) => {
    if (link.classList.contains('sidebar__link_active')) {
      link.classList.remove('sidebar__link_active');
    }
    if (link.textContent === text) {
      link.classList.add('sidebar__link_active');
    }
  });
}

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function playSound(src) {
  const audio = new Audio();
  audio.src = src;
  audio.play();
}

function soundWord(turn, index) {
  playSound(turn[index].audio_source);
}

async function startGame(categoryId) {
  const turn = [];
  let categoryWords = await getWords(openCategoryId);
  categoryWords = categoryWords.words;
  const categoryWordsLength = categoryWords.length;
  for (let i = 0; i < categoryWordsLength; i += 1) {
    let number = generateRandomNumber(categoryWordsLength, 0);
    while (turn.includes(number)) {
      number = generateRandomNumber(categoryWordsLength, 0);
    }
    turn.push(number);
  };
  turn.forEach((element) => {
    wordTurn.push(categoryWords[element]);
  });
  soundWord(wordTurn, 0);
  const buttonPlay = document.querySelector('.button__start');
  buttonPlay.classList.remove('button__start');
  buttonPlay.classList.add('button__repeat');
  buttonPlay.textContent = '';
}

function makeCardNonActive(card) {
  card.classList.remove('card_play', 'cardElement');
  card.classList.add('card_non-active');
}

function locationToMainPage() {
  document.location.href = placeMainHtmlFile;
}

async function gameEnd(numberErrors) {
  deleteContent();

  const mainContent = document.querySelector('.main');

  const gameEndWrapper = document.createElement('div');
  const gameEndImage = document.createElement('img');
  const gameEndText = document.createElement('p');

  gameEndWrapper.classList.add('game-end');
  gameEndImage.classList.add('game-end__img');
  gameEndText.classList.add('game-end__text');

  if (numberErrors) {
    gameEndImage.setAttribute('src', failureImg);
    gameEndText.textContent = `Game over! ${numberErrors} mistakes!`;
    playSound(failureSound);
  } else {
    gameEndImage.setAttribute('src', successImg);
    gameEndText.textContent = 'Success';
    playSound(successSound);
  }

  gameEndWrapper.append(gameEndImage, gameEndText);
  mainContent.append(gameEndWrapper);

  wordTurn = [];

  setTimeout(locationToMainPage, timeMessageOnGameEnd);
  await sendStats();
  await addPoints(countWordsOnCategory - numberErrors);
}

function calcStats(type, card) {
  let stats = JSON.parse(localStorage.getItem('stats'));
  if (stats === null) {
    stats = {};
  }
  if (stats[type] === undefined) {
    stats[type] = {};
    stats[type][card] = 1;
  } else if (stats[type][card] === undefined) {
      stats[type][card] = 1;
    } else {
      stats[type][card] += 1;
    }
  localStorage.setItem('stats', JSON.stringify(stats));
}

function checkOnClickedCard(word, card) {
  const starsWrapper = document.querySelector('.stars-block');
  const numberQuestion = document.querySelectorAll('.star_win').length;
  const star = document.createElement('div');
  if (wordTurn[numberQuestion].word === word) {
    star.classList.add('star', 'star_win');
    if (wordTurn.length <= numberQuestion + 1) {
      const numberErrors = document.querySelectorAll('.star').length - numberQuestion;
      gameEnd(numberErrors);
    } else {
      playSound(correctSound);
      setTimeout(() => {
        playSound(wordTurn[numberQuestion + 1].audio_source);
      }, timeOfSuccessSoundAndVoice);
      makeCardNonActive(card);
    }
    calcStats('choosenRightWord', word);
  } else {
    star.classList.add('star', 'star_lose');
    playSound(errorSound);
    calcStats('choosenWrongWord', word);
  }
  starsWrapper.innerHTML = star.outerHTML + starsWrapper.innerHTML;
}

function createTdElement(text) {
  const element = document.createElement('td');
  element.textContent = text;
  return element
}

function createPanelButtons(className, text) {
  const button = document.createElement('div');
  button.classList.add(className, 'panel__button');
  button.textContent = text;
  return button;
}

function collectDifficultWords(stats) {
  difficultWords = {
    maxMistakes: 0
  };
  if (stats.choosenWrongWord) {
    Object.keys(stats.choosenWrongWord).forEach(word => {
      const countMistakes = stats.choosenWrongWord[word];
      if (countMistakes > difficultWords.maxMistakes) {
        difficultWords.maxMistakes = countMistakes;
      }
      if (!difficultWords[`countMistakes${countMistakes}`]) {
        difficultWords[`countMistakes${countMistakes}`] = [];
      }
      difficultWords[`countMistakes${countMistakes}`].push(word);
    });
  }
  return difficultWords;
}

async function createTableForStats(stats, statsContent) {
  const categories = await getCategories();
  difficultWords = collectDifficultWords(stats);

  categories.forEach(async (category, index) => {
    const categoryId = await determineCategoryId(category.name_category);
    const words = await getWords(categoryId);
    let numberClicksOfCard = 0;
    let categoryChoosenRightWord = 0;
    let categoryChoosenWrongWord = 0;
    const categoryRow = document.createElement('tr');
    words.words.forEach((word) => {
      Object.keys(stats).forEach((statsElement) => {
        if (stats[statsElement][word.word]) {
          const number = stats[statsElement][word.word];
          switch (statsElement) {
            case 'clickOnCard':
              numberClicksOfCard += number;
              break;
            case 'choosenRightWord':
              categoryChoosenRightWord += number;
              break;
            case 'choosenWrongWord':
              categoryChoosenWrongWord += number;
              break;
            default:
              break;
          }
        }
      })
    })
    categoryRow.append(createTdElement(`Category ${categories[index].name_category}`));
    categoryRow.append(createTdElement(numberClicksOfCard));
    categoryRow.append(createTdElement(categoryChoosenRightWord));
    categoryRow.append(createTdElement(categoryChoosenWrongWord));
    statsContent.append(categoryRow);	
  });
  return statsContent;
}

async function generateStatsPage() {
  const mainContent = document.querySelector('.main');
  const mainTitle = document.createElement('div');
  const mainPanel = document.createElement('div');
  let stats = await getStats();

  mainTitle.classList.add('stats__title');
  mainPanel.classList.add('stats__panel');

  mainTitle.textContent = 'Stats';

  mainPanel.append(createPanelButtons('panel__delete', 'Reset'));

  if (stats !== '{}') {
    mainPanel.append(createPanelButtons('panel__difficult-words', 'Repeat difficult words'));
  }

  mainContent.append(mainTitle, mainPanel);

  stats = JSON.parse(stats);
  
  const statsContent = document.createElement('table');
  statsContent.classList.add('stats__content');

  const statsTitle = document.createElement('tr');
  statsTitle.append(createTdElement(' '), createTdElement('Number of clicks on card'));
  statsTitle.append(createTdElement('Choosen right word'), createTdElement('Choosen wrong word'));
  statsContent.append(statsTitle);

  mainContent.append(await createTableForStats(stats, statsContent));
}

function generateModal() {
  const modalWrapper = document.createElement('div');
  const modalCard = document.createElement('div');

  modalWrapper.classList.add('modal');
  modalCard.classList.add('modal__card');

  modalWrapper.append(modalCard);
  body.append(modalWrapper);
  return modalCard;
}

function deleteModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach((e) => {
    body.removeChild(e);
  });
}

function generateLabelForm(inputType, inputClass, text) {
  const label = document.createElement('label');
  const input = document.createElement('input');

  input.setAttribute('type', inputType);
  input.setAttribute('required', 'true');
  
  input.classList.add('form__input', inputClass);

  label.append(input);

  if (text) {
    const span = document.createElement('span');
    span.classList.add('form__head');
    span.textContent = text;
    label.append(span);
  }
  return label;
}

function generateButtonForm(type, text, classes) {
  const button = document.createElement('input');
  button.classList = classes;
  button.setAttribute('type', type);
  button.setAttribute('value', text);
  return button;
}

function generateAuthorizationForm(type) {
  const modalCard = generateModal();
  const formImage = document.createElement('object');
  const formWrapper = document.createElement('div');
  const formHeader = document.createElement('p');
  const formForm = document.createElement('form');
  const formSwitcher = document.createElement('a');
  
  formImage.classList.add('auth__image');
  formWrapper.classList.add('auth__form-wrapper');
  formForm.classList.add('form');
  formSwitcher.classList.add('auth__switch');

  formImage.setAttribute('type', 'image/svg+xml');
  formForm.setAttribute('action', '#');
  formForm.setAttribute('method', 'GET');
  formSwitcher.setAttribute('href', '#');

  formImage.textContent = 'Your browser does not support SVG';

  if (type === 'login') {
    formImage.setAttribute('data', './assets/img/student-auth.svg');
    formHeader.textContent = 'Авторизация на сайте';
    formForm.append(generateLabelForm('text', 'form__login', 'Login'));
    formForm.append(generateLabelForm('password', 'form__password', 'Password'));
    formForm.append(generateButtonForm('submit', 'Войти', 'button button__login'));
    formSwitcher.textContent = 'Нет аккаунта? Регистрация';
  } else {
    formImage.setAttribute('data', './assets/img/student-reg.svg');
    formHeader.textContent = 'Регистрация на сайте';
    formForm.append(generateLabelForm('text', 'form__surname', 'Фамилия'));
    formForm.append(generateLabelForm('text', 'form__name', 'Имя'));
    formForm.append(generateLabelForm('date', 'form__birthday', '.'));
    formForm.append(generateLabelForm('text', 'form__login', 'Логин'));
    formForm.append(generateLabelForm('password', 'form__password', 'Пароль'));
    formForm.append(generateLabelForm('password', 'form__password', 'Повторите пароль'));
    formForm.append(generateButtonForm('submit', 'Регистрация', 'button button__reg'));
    formSwitcher.textContent = 'Есть аккаунт? Авторизация';
  }

  formWrapper.append(formHeader, formForm, formSwitcher);
  modalCard.append(formImage, formWrapper);
}

deleteContent();

if (sessionToken) {
  generateStartContent();
  generateSidebar();
} else {
  generateAuthorizationForm('login');
}

body.addEventListener('click', async (event) => {
  const { target, path, } = event;
  if ((target.classList.contains('button__reg') && document.querySelector('.form').checkValidity()) && !target.classList.contains('form__head') && !target.classList.contains('switch') && !target.classList.contains('switch-input')) {
    event.preventDefault();
  }
  const textEvent = target.textContent;
  const playModeOn = document.querySelector('.button__repeat');
  let cardText;
  switch (true) {
    case target.classList.contains('stats-button'):
      deleteContent();
      await generateStatsPage();
      changeSidebarLinkActive('Stats');
      break;
    case target.classList.contains('card_play'):
      if (playModeOn) {
        checkOnClickedCard(target.dataset.word, target);	
      }
      break;
    case target.classList.contains('word-card__rotate'):
      rotateCard(path[2]);
      break;
    case target.classList.contains('category'):
      for (let i = 0; i < path.length - 2; i += 1) {
        const tag = path[i];
        if (tag.classList.contains('category-card')) {
          const categoryId = await determineCategoryId(tag.dataset.category);
          deleteContent();
          generateTrainMode(categoryId, switcher.checked);
          changeSidebarLinkActive(tag.dataset.category);
          break;
        }	
      }
      break;
    case target.classList.contains('sidebar__link'):
      deleteContent();
      if (textEvent === 'Main Page') {
        generateStartContent();
      } else if (textEvent === 'Stats') {
        generateStatsPage();
      } else  {
        generateTrainMode(categories.indexOf(textEvent) + 1, switcher.checked);
      }
      changeSidebarLinkActive(textEvent);
      break;
    case target.classList.contains('cardElement'): {
      for (let i = 0; i < path.length; i += 1) {
        const element = path[i];
        if (element.classList.contains('word-card')) {
          cardText = event.path[i].querySelector('.word-card__text').textContent;
          
          const word = element.querySelector('.word-card__text:not(.word-card__translation)');
          calcStats('clickOnCard', word.textContent);
          break;
        }
      }
      let words = [];
      if (openCategoryId !== 'trainDifficultWordsMode') {
        words = await getWords(openCategoryId);
        words = words.words;
      } else {
        words = difficultWords;
      }
      for (let j = 0; j < words.length; j += 1) {
        const wordObject = words[j];
        if (wordObject.translation === cardText) {
          playSound(wordObject.audio_source);
          break;
        } else if (wordObject[1]) {
          if (wordObject[1].translation === cardText) {
            playSound(wordObject[1].audio_source);
            break;
          }
        }
      }
      break;
    }
    case target.classList.contains('switch-input'):
      if (document.querySelector('.main__title') !== null) {
        if (document.querySelector('.main__title').textContent) {
          const categoryName = document.querySelector('.main__title').textContent;
          deleteContent();
          generateTrainMode(openCategoryId, switcher.checked);
        }	
      }
      break;
    case target.classList.contains('button__start'):
      startGame(openCategoryId);
      break;
    case target.classList.contains('button__repeat'):
      soundWord(wordTurn, document.querySelectorAll('.star_win').length);
      break;
    case target.classList.contains('panel__difficult-words'):
      deleteContent();
      generateTrainMode('trainDifficultWordsMode');
      break;
    case target.classList.contains('panel__delete'):
      localStorage.setItem('stats', '{}');
      await sendStats('clear');
      await addPoints(0, 'clear');
      deleteContent();
      generateStatsPage();
      break;
    case target.classList.contains('button__login'):
      const login = document.querySelector('.form__login').value;
      const password = document.querySelector('.form__password').value;
      apiLoginInSystem(login, password);
      break;
    case target.classList.contains('button__reg'): {
      const surname = document.querySelector('.form__surname').value;
      const name = document.querySelector('.form__name').value;
      const birthday = document.querySelector('.form__birthday').value;
      const loginUser = document.querySelector('.form__login').value;
      const passwordUser = document.querySelectorAll('.form__password');
      const form = document.querySelector('.form');
      if (passwordUser[0].value === passwordUser[1].value) {
        if (form.checkValidity()) {
          apiRegisterInSystem(surname, name, birthday, loginUser, passwordUser[0].value);
        }
      } else {
        createMessage('warning', 'Ошибка данных', 'Пароли не совпадают');
      }
      break;
    }
    case target.classList.contains('message__close'):
      deleteMessages();
      break;
    case target.classList.contains('auth__switch'):
      const textContentOfSwitcher = target.textContent;
      deleteModals();
      if (textContentOfSwitcher === 'Нет аккаунта? Регистрация') {
        generateAuthorizationForm('register');
      } else {
        generateAuthorizationForm('login');
      }
      break;
    default:
      break;
  }
});

body.addEventListener('mouseout', (event) => {
  const { target, toElement } = event;
  if (toElement) {
    const cardId = target.classList[0];
    if (target.classList.contains('cardElement') && !toElement.classList.contains(cardId)) {
      rotateCard(target);
    }
  }
})