import '../css/style.scss';
import { cards as dictionary} from './Dictionary';
import { placeMainHtmlFile, failureImg, successImg, timeMessageOnGameEnd , failureSound, successSound, correctSound, errorSound, timeOfSuccessSoundAndVoice } from './Constatnt';
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
    method: method,
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
  if (response['Error']) {
    resolveApiErrors(response['Error']);
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

  if (type === 'warning') {
    messageImageWrapper.classList.add('message__image-wrapper_warning');
    messageImage.setAttribute('src', './assets/img/notify.png');
  } else {
    messageImageWrapper.classList.add('message__image-wrapper_error');
    messageImage.setAttribute('src', './assets/img/error.png');
  }

  messageImageWrapper.append(messageImage);
  messageCloseWrapper.append(messageClose);
  messageWrapper.append(messageCloseWrapper, messageHead, messageText);
  messageBody.append(messageImageWrapper, messageWrapper);
  body.append(messageBody);
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

async function apiLoginInSystem(login, password) {
  const url = API.detectURL('login');
  const data = {
    'login': login,
    'password': password
  }
  const token = await sendRequest(url, 'POST', data);
  if (token !== 'Error') {
    sessionStorage.setItem('sessionToken', token['token']);
    sessionStorage.setItem('userId', token['userId']);
    sessionStorage.setItem('status', token['status']);
    sessionToken = token['token'];
    generateStartContent();
    generateSidebar();
    deleteModals();
  }
}

async function getCategories() {
  const url = API.detectURL('categories');
  return await sendRequest(url, 'GET');
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

    card.dataset.category = category['name_category'];

    card.setAttribute('href', '#');
    cardImage.setAttribute('src', category['picture_category']);

    card.classList.add('category-card', 'card', 'category');
    cardWrapper.classList.add('category-card__wrapper', 'category');
    cardImage.classList.add('category-card__image', 'category');
    cardText.classList.add('card__text', 'category');

    cardText.textContent = category['name_category'];

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
    sidebar.append(createSidebarElement('a', '#', 'sidebar__link', category['name_category']));
  });
}

async function determineCategoryId(categoryName) {
  const url = API.detectURL('determineCategoryId');
  const data = {
    categoryName: categoryName
  }
  const response = await sendRequest(url, 'POST', data);
  return response["categoryId"];
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
    const url = API.detectURL('words');
    const data = {
      categoryId: categoryId
    }
    const response = await sendRequest(url, 'POST', data);
    title.textContent = response['name_category'];
    words = response['words'];
    console.log('1');
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
      card.classList.add('word-card_play');
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
  playSound(turn[index].audioSrc);
}

function startGame(categoryId) {
  const turn = [];
  const categoryWords = dictionary[categoryId + 1];
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

function gameEnd(numberErrors) {
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
        playSound(wordTurn[numberQuestion + 1].audioSrc);
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

function createTableForStats(stats, statsContent) {
  difficultWords = [];
  dictionary.forEach((category, index) => {
    if (index) {
      const categoryNameRow = document.createElement('tr');
      const categoryBlockText = document.createElement('td');

      categoryBlockText.textContent = `Category ${categories[index]}`;

      categoryNameRow.append(categoryBlockText);
      statsContent.append(categoryNameRow);

      category.forEach((word) => {
        const categoryBlockRow = document.createElement('tr');
        categoryBlockRow.append(createTdElement(`${word.word} (${word.translation})`));
        Object.keys(stats).forEach((statsElement) => {
          if (stats[statsElement][word.word]) {
            categoryBlockRow.append(createTdElement(stats[statsElement][word.word]));
          } else {
            categoryBlockRow.append(createTdElement('0'));
          }
        })
        let percentWrongAttempts;
        if (stats.choosenRightWord && stats.choosenWrongWord) {
          percentWrongAttempts = 100 / (stats.choosenRightWord[word.word] / stats.choosenWrongWord[word.word]);
        }
        if (Number.isNaN(percentWrongAttempts)) {
          percentWrongAttempts = '-';
        } else {
          const objWord = word.word;
          const {translation} = word;
          const {image} = word;
          const {audioSrc} = word;
          difficultWords.push([percentWrongAttempts, {'word': objWord, translation, image, audioSrc}]);
        }
        categoryBlockRow.append(createTdElement(percentWrongAttempts));

        statsContent.append(categoryBlockRow);	
      })
    }
  });
  return statsContent;
}

function generateStatsPage() {
  const mainContent = document.querySelector('.main');
  const mainTitle = document.createElement('div');
  const mainPanel = document.createElement('div');

  mainTitle.classList.add('stats__title');
  mainPanel.classList.add('stats__panel');

  mainTitle.textContent = 'Stats';

  mainPanel.append(createPanelButtons('panel__delete', 'Reset'));

  if (localStorage.getItem('stats') !== '{}') {
    mainPanel.append(createPanelButtons('panel__difficult-words', 'Repeat difficult words'));
  }

  mainContent.append(mainTitle, mainPanel);

  const stats = JSON.parse(localStorage.getItem('stats'));
  
  const statsContent = document.createElement('table');
  statsContent.classList.add('stats__content');

  const statsTitle = document.createElement('tr');
  statsTitle.append(createTdElement(' '), createTdElement('Number of clicks on card'));
  statsTitle.append(createTdElement('Choosen right word'), createTdElement('Choosen wrong word'));
  statsTitle.append(createTdElement('% wrong attempts'));
  statsContent.append(statsTitle);

  mainContent.append(createTableForStats(stats, statsContent));
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

function generateLoginForm() {
  const modalCard = generateModal();
  const loginImage = document.createElement('object');
  const loginWrapper = document.createElement('div');
  const loginHeader = document.createElement('p');
  const loginForm = document.createElement('p');
  const loginRegister = document.createElement('a');
  
  loginImage.classList.add('auth__image');
  loginWrapper.classList.add('auth__form-wrapper');
  loginForm.classList.add('form');
  loginRegister.classList.add('auth__switch');

  loginImage.setAttribute('data', './assets/img/student-auth.svg');
  loginImage.setAttribute('type', 'image/svg+xml');
  loginForm.setAttribute('action', '#');
  loginForm.setAttribute('method', 'GET');
  loginRegister.setAttribute('href', '#');

  loginImage.textContent = 'Your browser does not support SVG';
  loginHeader.textContent = 'Авторизация на сайте';
  loginRegister.textContent = 'Нет аккаунта? Регистрация';

  loginForm.append(generateLabelForm('text', 'form__login', 'Login'));
  loginForm.append(generateLabelForm('password', 'form__password', 'Password'));
  loginForm.append(generateButtonForm('submit', 'Войти', 'button button__login'));
  loginWrapper.append(loginHeader, loginForm, loginRegister);
  modalCard.append(loginImage, loginWrapper);
}

deleteContent();

if (sessionToken) {
  generateStartContent();
  generateSidebar();
} else {
  generateLoginForm();
}

body.addEventListener('click', async (event) => {
  const { target, path, } = event;
  if (!target.classList.contains('form__head') && !target.classList.contains('switch') && !target.classList.contains('switch-input')) {
    event.preventDefault();
  }
  const textEvent = target.textContent;
  const playModeOn = document.querySelector('.button__repeat');
  let cardText;
  switch (true) {
    case target.classList.contains('stats-button'):
      deleteContent();
      generateStatsPage();
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
        words = dictionary[openCategoryId];
      } else {
        words = difficultWords;
      }
      for (let j = 0; j < words.length; j += 1) {
        const wordObject = words[j];
        if (wordObject.translation === cardText) {
          playSound(wordObject.audioSrc);
          break;
        } else if (wordObject[1]) {
          if (wordObject[1].translation === cardText) {
            playSound(wordObject[1].audioSrc);
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
          generateTrainMode(categories.indexOf(categoryName) + 1, switcher.checked);
        }	
      }
      break;
    case target.classList.contains('button__start'):
      startGame(categories.indexOf(document.querySelector('.main__title').textContent));
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
      deleteContent();
      generateStatsPage();
      break;
    case target.classList.contains('button__login'):
      const login = document.querySelector('.form__login').value;
      const password = document.querySelector('.form__password').value;
      apiLoginInSystem(login, password);
      break;
    case target.classList.contains('message__close'):
      deleteMessages();
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