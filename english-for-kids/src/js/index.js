import '../css/style.scss';
import { cards } from './Dictionary';

const dictionary = cards;
const burgerButton = document.querySelector('.hamburger-menu');
const sidebarWrapper = document.querySelector('.sidebar-wrapper');
const switcher = document.querySelector('.switch-input');

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

function generateStartContent() {
	const controlPanel = document.querySelector('.control-panel');
	const buttonToStatsPage = document.createElement('div');
	const buttonToStatsPageImage = document.createElement('img');
	const buttonToStatsPageText = document.createElement('p');

	controlPanel.classList.add('control-panel', 'stats-button');
	buttonToStatsPage.classList.add('control-panel__item', 'stats-button');
	buttonToStatsPageImage.classList.add('control-panel__image', 'stats-button');
	buttonToStatsPageText.classList.add('stats-button');

	buttonToStatsPageImage.setAttribute('src', '../assets/img/stats.png');

	buttonToStatsPageText.innerText = 'Stats';

	buttonToStatsPage.append(buttonToStatsPageImage, buttonToStatsPageText);
	controlPanel.append(buttonToStatsPage);

	const mainContent = document.querySelector('.main');
	dictionary[0].forEach((category, index) => {
		const card = document.createElement('a');
		const cardWrapper = document.createElement('div');
		const cardImage = document.createElement('img');
		const cardText = document.createElement('p');

		card.dataset.category = category;

		card.setAttribute('href', '#');
		cardImage.setAttribute('src', dictionary[index + 1][0].image);

		card.classList.add('category-card', 'card', 'category');
		cardWrapper.classList.add('category-card__wrapper', 'category');
		cardImage.classList.add('category-card__image', 'category');
		cardText.classList.add('card__text', 'category');

		cardText.innerHTML = category;

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
	link.innerHTML = nameLink;
	return link;
}

function generateSidebar() {
	const sidebar = document.querySelector('.sidebar');
	sidebar.append(createSidebarElement('a', '#', 'sidebar__link sidebar__link_active', 'Main Page'))
	dictionary[0].forEach((category) => {
		sidebar.append(createSidebarElement('a', '#', 'sidebar__link', category));
	});
}

let openCategoryId;

function generateTrainMode(categoryId, playMode) {
	const mainContent = document.querySelector('.main');

	openCategoryId = categoryId;

	const title = document.createElement('div');
	title.classList.add('main__title');
	title.innerText = dictionary[0][categoryId - 1];
	mainContent.append(title);

	if (playMode) {
		const starsWrapper = document.createElement('div');
		starsWrapper.classList.add('stars-block');
		mainContent.append(starsWrapper);
	}

	dictionary[categoryId].forEach((wordObject, index) => {
		const card = document.createElement('a');
		const cardFront = document.createElement('div');
		const cardWrapper = document.createElement('div');
		const cardImage = document.createElement('img');
		const cardTextRu = document.createElement('p');
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

		cardTextEn.innerHTML = wordObject.word;

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
			cardBack.querySelector('.word-card__text').innerHTML = wordObject.translation;
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
		gameButton.innerText = 'Start game';
		mainContent.append(gameButton);
	}
} 

function rotateCard(card) {
	const cardFront = card.querySelector('.word-card_front');
	const cardBack = card.querySelector('.word-card_back');
	if (cardFront !== null && cardBack !== null) {
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
		if (link.innerText === text) {
			link.classList.add('sidebar__link_active');
		}
	});
}

let wordTurn = [];

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
	const categoryWordsLength = categoryWords.length
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
	buttonPlay.innerHTML = '';
}

function makeCardNonActive(card) {
	card.classList.remove('card_play', 'cardElement');
	card.classList.add('card_non-active');
}

function locationToMainPage() {
	document.location.href = './index.html';
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

	if (numberErrors !== 0) {
		gameEndImage.setAttribute('src', '../assets/img/failure.jpg');
		gameEndText.innerText = `Game over! ${numberErrors} mistakes!`;
	} else {
		gameEndImage.setAttribute('src', '../assets/img/success.jpg');
		gameEndText.innerText = 'Success';
	}

	gameEndWrapper.append(gameEndImage, gameEndText);
	mainContent.append(gameEndWrapper);

	wordTurn = [];
	setTimeout(locationToMainPage, 5000);
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
			playSound(wordTurn[numberQuestion + 1].audioSrc);
			makeCardNonActive(card);
		}
	} else {
		star.classList.add('star', 'star_lose');
		playSound("../assets/audio/error.mp3");
	}
	starsWrapper.innerHTML = star.outerHTML + starsWrapper.innerHTML;
}

function calcStats(type, card) {
	let stats = JSON.parse(localStorage.getItem('stats'));
	if (stats === null) {
		stats = {};
	}
	switch (type) {
		case 'clickOnCard':
			if (stats.clickOnCard === undefined) {
				stats.clickOnCard = {};
				stats.clickOnCard[card] = 1;
			} else {
				if (stats.clickOnCard[card] === undefined) {
					stats.clickOnCard[card] = 1;
				} else {
					stats.clickOnCard[card] += 1;
				}
			}
			break;
	
		default:
			break;
	}	
	localStorage.setItem('stats', JSON.stringify(stats));
}

function generateStatsPage() {
	const mainContent = document.querySelector('.main');

	const mainContentTitle = document.createElement('div');
	mainContentTitle.classList.add('stats__title');
	mainContentTitle.innerText = 'Stats';
	mainContent.append(mainContentTitle);

	const stats = JSON.parse(localStorage.getItem('stats'));

	const statsContent = document.createElement('table');
	statsContent.classList.add('stats__content');
	dictionary.forEach((category, index) => {
		if (index !== 0) {
			const categoryNameRow = document.createElement('tr');
			const categoryBlockText = document.createElement('td');

			categoryBlockText.innerText = `Category ${dictionary[0][index]}`;

			categoryNameRow.append(categoryBlockText);
			statsContent.append(categoryNameRow);

			category.forEach((word) => {
				const categoryBlockRow = document.createElement('tr');
				const categoryBlockName = document.createElement('td');
				categoryBlockName.innerText = `${word.word} (${word.translation})`;
				categoryBlockRow.append(categoryBlockName);
				statsContent.append(categoryBlockRow);	
			})
		}
	});
	mainContent.append(statsContent);
}

deleteContent();
generateStartContent();
generateSidebar();

document.querySelector('body').addEventListener('click', (event) => {
	const { target, path, } = event;
	if (!target.classList.contains('switch') && !target.classList.contains('switch-input')) {
		event.preventDefault();
	}
	const textEvent = target.innerText;
	const playModeOn = document.querySelector('.button__repeat');
	let cardText;
	switch (true) {
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
					deleteContent();
					generateTrainMode(dictionary[0].indexOf(tag.dataset.category) + 1, switcher.checked);
					changeSidebarLinkActive(tag.dataset.category);
					break;
				}	
			}
			break;
		case target.classList.contains('sidebar__link'):
			deleteContent();
			if (textEvent === 'Main Page') {
				generateStartContent();
			} else {
				generateTrainMode(dictionary[0].indexOf(textEvent) + 1, switcher.checked);
			}
			changeSidebarLinkActive(textEvent);
			break;
		case target.classList.contains('cardElement'):
			for (let i = 0; i < path.length; i += 1) {
				const element = path[i];
				if (element.classList.contains('word-card')) {
					cardText = event.path[i].querySelector('.word-card__text').innerText;
					
					const word = element.querySelector('.word-card__text:not(.word-card__translation)');
					calcStats('clickOnCard', word.innerText);
					break;
				}
			}
			dictionary[openCategoryId].forEach((element) => {
				if (element.translation === cardText) {
					playSound(element.audioSrc);
				}
			})
			break;
		case target.classList.contains('switch-input'):
			if (document.querySelector('.main__title') !== null) {
				if (document.querySelector('.main__title').innerText) {
					const categoryName = document.querySelector('.main__title').innerText;
					deleteContent();
					generateTrainMode(dictionary[0].indexOf(categoryName) + 1, switcher.checked);
				}	
			}
			break;
		case target.classList.contains('button__start'):
			startGame(dictionary[0].indexOf(document.querySelector('.main__title').innerText));
			break;
		case target.classList.contains('button__repeat'):
			soundWord(wordTurn, document.querySelectorAll('.star_win').length);
			break;
		case target.classList.contains('stats-button'):
			deleteContent();
			generateStatsPage();
			break;
		default:
			break;
	}
});

document.querySelector('body').addEventListener('mouseout', (event) => {
	const { target, toElement } = event;
	if (toElement !== null) {
		const cardId = target.classList[0];
		if (target.classList.contains('cardElement') && !toElement.classList.contains(cardId)) {
			rotateCard(target);
		}
	}
})