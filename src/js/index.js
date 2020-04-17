import '../css/style.scss';
import { cards } from './Dictionary';

const dictionary = cards;
const burgerButton = document.querySelector('.hamburger-menu');
const sidebarWrapper = document.querySelector('.sidebar-wrapper');

function moveSidebar() {
	const hamburgerButton = document.querySelector('.hamburger');
	const sidebar = document.querySelector('.sidebar');
	hamburgerButton.classList.toggle('hamburger_active');
	sidebarWrapper.classList.toggle('sidebar-wrapper_active');
	sidebar.classList.toggle('sidebar_active');
}

function deleteContent() {
	document.querySelector('.main').innerHTML = '';
}

burgerButton.addEventListener('click', moveSidebar);
sidebarWrapper.addEventListener('click', moveSidebar);

function generateStartContent() {
	const mainContent = document.querySelector('.main');
	dictionary[0].forEach((category, index) => {
		const card = document.createElement('a');
		const cardWrapper = document.createElement('div');
		const cardImage = document.createElement('img');
		const cardText = document.createElement('p');

		card.dataset.category = category;

		card.setAttribute('href', '#');
		cardImage.setAttribute('src', dictionary[index + 1][0].image);

		card.classList.add('category-card', 'card');
		cardWrapper.classList.add('category-card__wrapper');
		cardImage.classList.add('category-card__image');
		cardText.classList.add('card__text');

		cardText.innerHTML = category;

		cardWrapper.append(cardImage);
		card.append(cardWrapper);
		card.append(cardText);
		mainContent.append(card);
	})
}

function generateSidebar() {
	const sidebar = document.querySelector('.sidebar');
	dictionary[0].forEach((category) => {
		const link = document.createElement('a');
		link.setAttribute('href', '#');
		link.classList.add('sidebar__link');
		link.innerHTML = category;
		sidebar.append(link);
	});
}

function generateTrainMode(categoryId) {
	const mainContent = document.querySelector('.main');
	dictionary[categoryId].forEach((wordObject) => {
		const card = document.createElement('a');
		const cardFront = document.createElement('div');
		const cardWrapper = document.createElement('div');
		const cardImage = document.createElement('img');
		const cardTextRu = document.createElement('p');
		const cardTextEn = document.createElement('p');
		const cardRotate = document.createElement('div');

		card.setAttribute('href', '#');
		cardImage.setAttribute('src', wordObject.image);

		card.classList.add('word-card', 'card');
		cardFront.classList.add('word-card_front');
		cardWrapper.classList.add('word-card__wrapper');
		cardImage.classList.add('word-card__image');
		cardTextRu.classList.add('card__text', 'word-card__text');
		cardTextEn.classList.add('card__text', 'word-card__text');
		cardRotate.classList.add('word-card__rotate');

		cardTextEn.innerHTML = wordObject.word;
		cardTextRu.innerHTML = wordObject.translation;

		cardWrapper.append(cardImage);
		cardFront.append(cardWrapper);
		cardFront.append(cardTextEn);

		const cardBack = document.createElement('div');
		cardBack.innerHTML = cardFront.innerHTML;
		cardBack.classList.remove('word-card_front');
		cardBack.classList.add('word-card_back');
		card.append(cardBack);

		cardFront.append(cardRotate);
		card.append(cardFront);

		mainContent.append(card);
	});
}

function rotateCard(card) {
	const cardFront = card.querySelector('.word-card_front');
	const cardBack = card.querySelector('.word-card_back');
	cardFront.classList.toggle('rotated-front');
	cardBack.classList.toggle('rotated-back');
}

deleteContent();
generateStartContent();
generateSidebar();

document.querySelector('body').addEventListener('click', (event) => {
	event.preventDefault();
	const { target } = event;
	if (target.classList.contains('word-card__rotate')) {
		rotateCard(event.path[2]);
	} else { 
		for (let i = 0; i < event.path.length - 2; i += 1) {
			const tag = event.path[i];
			if (tag.classList.contains('category-card')) {
				deleteContent();
				generateTrainMode(dictionary[0].indexOf(tag.dataset.category));
			}	
		}
	}
})

document.querySelector('body').addEventListener('mouseout', (e) => {
	const { target } = e;
	if (target.classList.contains('word-card')) {
		rotateCard(e.target);
	}
})