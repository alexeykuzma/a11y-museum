let lastCallTimer;
let lastCall;
const debounce = (func, delay) => {
  const funcName = () => {
    let previousCall = lastCall;
    lastCall = Date.now();
    if (previousCall && ((lastCall - previousCall) <= delay)) {
      clearTimeout(lastCallTimer);
    }
    lastCallTimer = setTimeout(() => {
      func();
    }, delay);
  };
  return funcName();
};

const eventsList = [
    {
        name: 'Святослав Рихтер в кругу друзей. Москва — Коктебель',
        link: '/event',
        date: '2021-11-20',
        date_title: '20 ноября',
        img: './images/events/event-1.png',
        desc: 'Текст о музее текст Текст о музее текст Текст о музее текст Текст о музее текст',
    },
    {
        name: 'Тату',
        link: '/event',
        date: '2021-09-27',
        date_title: '27 сентября',
        img: './images/events/event-2.png',
        desc: 'Текст о музее текст Текст о музее текст Текст о музее текст Текст о музее текст',
    },
    {
        name: 'От Дюрера до Матисса. Избранные рисунки из собрания ГМИИ им. А.С. Пушкина',
        link: '/event',
        date: '2021-11-01',
        date_title: '1 ноября',
        img: './images/events/event-3.png',
        desc: 'Текст о музее текст Текст о музее текст Текст о музее текст Текст о музее текст',
    },
];

function main() {
    if (document.querySelector('.js-events-list')) {
        getEvents(eventsList);
        const tabsEvents = new Tabs();
        tabsEvents.init('events', loadEvents);
        const tabsMuseums = new Tabs();
        tabsMuseums.init('museums', changeMuseumsTab);
    }
    setAlertLink();
    filledInput();
}

function loadEvents(index) {
    const params = [ 'all', 'today', 'tomorrow' ];
    let returnArray = eventsList;
    if (params[index] === 'today') returnArray = [eventsList[1]];
    else if (params[index] === 'tomorrow') returnArray = [eventsList[2]];
    getEvents(returnArray);
}

function changeMuseumsTab(index) {
    const params = [ 'list', 'history' ];
    let revertParam = 'history';
    if (index === 1) revertParam = 'list';
    document.getElementById(`museums-${params[index]}`).classList.remove('is-hidden');
    document.getElementById(`museums-${revertParam}`).classList.add('is-hidden');
}

function getEvents(list) {
    let returnTemplate = '';
    for (let i = 0; i < list.length; i += 1) {
        const { name, link, date, date_title, img, desc } = list[i];
        returnTemplate += `
            <li class="card">
                <a class="card__href js-alert-link"
                   href="https://alexeykuzma.github.io/a11y-museum/${link}"
                   aria-labelledby="card-event-link-${i} card-event-title-${i}"
                   aria-describedby="card-event-subtitle-${i}">
                    <img class="card__image" src="${img}" alt="Изображение выставки или события">
                    <h3 class="card__title" id="card-event-title-${i}">${name}</h3>
                    <span class="card__subtitle" id="card-event-subtitle-${i}">Выставка до ${date_title}</span>
                    <span class="card__desc">${desc}</span>
                    <span class="card__link" id="card-event-link-${i}" aria-label="Купить билет на выставку">Купить билет</span>
                </a>
            </li>
        `;
    }
    document.querySelector('.js-events-list').innerHTML = returnTemplate;
    setAlertLink();
}

function filledInput() {
    const inputEl = document.querySelector('.footer-form__input');
    inputEl.addEventListener('focus', onInputFocus);
    inputEl.addEventListener('blur', onInputBlur);

    function onInputFocus(event) {
        event.target.parentNode.classList.add('is-filled');
    }

    function onInputBlur(event) {
        if ( event.target.value.trim() === '' ) {
            event.target.parentNode.classList.remove('is-filled');
        }
    }
}

function Search() {
    this.input = '.js-search-input';
    this.results = '.js-search-results';
    this.dataList = [];
    this.links = [];
}

Search.prototype.init = function init() {
    const that = this;
    const inputElement = document.querySelector(that.input);
    const resultsList = document.querySelector('.js-search-results');
    const isPage = window.location.pathname === '/search';

    inputElement.addEventListener('keydown', (event) => {
        const results = document.querySelector(that.results);
        const list = results.querySelectorAll('.js-header-search-result');
        switch(event.keyCode) {
            case 9:
            case 27:
                results.classList.add('is-hidden');
                resultsList.removeAttribute('aria-activedescendant');
                break;
            case 27:
                inputElement.value = '';
                break;
            case 35:
                event.preventDefault();
                applySuggestion(list, list.length - 1);
                break;
            case 36:
                event.preventDefault();
                applySuggestion(list, 0);
                break;
            case 38:
                event.preventDefault();
                highlightPrevOption(list);
                break;
            case 40:
                event.preventDefault();
                highlightNextOption(list);
                break;
            default:
                debounce(() => {
                    that.getResultsList(event.target.value, isPage);
                    const resultsLinks = document.querySelectorAll('.js-header-search-result');
                    for (let i = 0; i < resultsLinks.length; i += 1) {
                        resultsLinks[i].onclick = (event) => {
                            applySuggestion(resultsLinks, i);
                            window.location = `https://alexeykuzma.github.io/a11y-museum/search?search=${inputElement.value}`;
                        };
                    }
                }, 500);
                break;
        };
    });

    document.querySelector('.js-search-button').onclick = (event) => {
        event.preventDefault();
        if (inputElement.value !== '') window.location = `https://alexeykuzma.github.io/a11y-museum/search?search=${inputElement.value}`;
    };

    const highlightNextOption = (list) => {
      const index = Array.from(list).findIndex(item => item === document.querySelector('.is-selected'));
      let returnIndex = index + 1;
      if (returnIndex === list.length) returnIndex = 0;
      applySuggestion(list, returnIndex);
    };
    const highlightPrevOption = (list) => {
      const index = Array.from(list).findIndex(item => item === document.querySelector('.is-selected'));
      let returnIndex = list.length - 1;
      if (index > 0) returnIndex = index - 1;
      applySuggestion(list, returnIndex);
    };

    const resetSuggestions = (list) => {
        for (let i = 0; i < list.length; i += 1) {
            const link = list[i];
            link.removeAttribute('aria-selected');
            link.classList.remove('is-selected');
        }
    };

    const applySuggestion = (list, index) => {
        resetSuggestions(list);
        const currentLink = list[index];
        inputElement.value = currentLink.innerText;
        resultsList.setAttribute('aria-activedescendant', `header-search-result-${index}`);
        const result = document.getElementById(`header-search-result-${index}`);
        result.setAttribute('aria-selected', 'true');
        result.classList.add('is-selected');
    };

    const headerSearch = document.querySelector('.js-header-search');
    headerSearch.addEventListener('focusout', (event) => {
        if (!headerSearch.contains(event.relatedTarget)) {
            document.querySelector(that.results).classList.add('is-hidden');
            resultsList.removeAttribute('aria-activedescendant');
        }
    });

    if (isPage) {
        const queries = window.location.search.replace('?', '').split('&');
        let returnValue = '';
        for (let i = 0; i < queries.length; i += 1) {
            const [type, value] = queries[i].split('=');
            if (type === 'search') returnValue = decodeURI(value);
        }
        that.getResultsList(returnValue, isPage, true);
    }
}

Search.prototype.getResultsList = (value, isPage, renderOnPage) => {
    let museumsList = [];
    if (isPage) {
        museumsList = [
            {
                name: 'МЕМОРИАЛЬНАЯ КВАРТИРА С.Т. РИХТЕРА',
                link: '/museums/1',
            },
            {
                name: 'ЦЭВ «МУСЕЙОН»',
                link: '/museums/2',
            },
            {
                name: 'УСАДЬБА ЛОПУХИНЫХ',
                link: '/museums/3',
            },
            {
                name: 'УЧЕБНЫЙ МУЗЕЙ',
                link: '/museums/4',
            },
            {
                name: 'ОТДЕЛ ЛИЧНЫХ КОЛЛЕКЦИЙ',
                link: '/museums/5',
            },
            {
                name: 'ГАЛЕРЕЯ',
                link: '/museums/6',
            },
        ];
    } else {
        const museumsCards = document.querySelectorAll(`.js-museums-list .card`);
        for (let j = 0; j < museumsCards.length; j += 1) {
            const card = museumsCards[j];
            const name = card.querySelector('.card__title').innerText;
            const link = card.querySelector('.card__link').getAttribute('href');
            museumsList.push({ name, link });
        }
    }

    const list = eventsList.concat(museumsList);
    let prefix = '';
    if (renderOnPage) prefix = '-page';
    const results = document.querySelector(`.js${prefix}-search-results`);
    const status = document.querySelector(`.js${prefix}-search-status`);
    const searchData = value.toLowerCase();
    let count = 0;

    let returnTemplate = '';
    if (searchData !== '') {
        for (let i = 0; i < list.length; i += 1) {
            const { name, link } = list[i];
            const currentTitle = name.toLowerCase();
            if (currentTitle.includes(searchData)) {
                count += 1;
                if (prefix) {
                    returnTemplate += `
                        <li class="${prefix}-search__result js-${prefix}-search-result">
                            <a href="https://alexeykuzma.github.io/a11y-museum/${window.I18nPrefix}${link}">${name}</a>
                        </li>
                    `;
                } else {
                    returnTemplate += `
                        <li class="header-search__result js-header-search-result"
                            role="option"
                            id="header-search-result-${count - 1}">${name}</li>
                    `;
                }
            }
        }
    }

    if (count > 0) {
        if (!renderOnPage) results.classList.remove('is-hidden');
        status.innerText = `Найдено – ${count}`;
        results.innerHTML = returnTemplate;
    } else {
        if (!renderOnPage) results.classList.add('is-hidden');
        if (searchData === '') status.innerText = '';
        else status.innerText = 'Результатов нет';
        results.innerHTML = '';
    }
    return true;
}

const search = new Search();

function Dialog() {
    this.button = '';
    this.previousFocus = this.button;
    this.dialog = '';
    this.title = '';
    this.close = '';
}

Dialog.prototype.init = function init(type) {
    const that = this;
    that.button = `.js-popup-button-${type}`;
    that.dialog = `.js-popup-dialog-${type}`;
    that.title = `.js-popup-title-${type}`;
    that.close = `.js-popup-close-${type}`;
    that.previousFocus = that.button;

    document.querySelector(that.button).onclick = () => {
        document.querySelector(that.dialog).classList.remove('is-hidden');
        setTimeout(() => {
            document.querySelector(that.dialog).querySelector('a, input, button').focus();
        }, 100);
        document.querySelector(that.dialog).addEventListener('keydown', (event) => {
            that.navigationTrap(event);
        });
        document.querySelector(that.close).onclick = () => {
            that.closePopup();
        };
    };
    return that;
}

Dialog.prototype.navigationTrap = function navigationTrap(event) {
    const that = this;
    switch (event.keyCode) {
        case 9: {
            const links = document.querySelector(that.dialog).querySelectorAll('a, input, button');
            if (!event.shiftKey && links[links.length - 1] === document.activeElement) {
                event.preventDefault();
                links[0].focus();
            } else if (event.shiftKey && links[0] === document.activeElement) {
                event.preventDefault();
                links[links.length - 1].focus();
            }
            break;
        }
        case 27:
          that.closePopup(that);
          break;
        default:
          break;
    }
}

Dialog.prototype.closePopup = function closePopup() {
    const that = this;
    document.querySelector(that.dialog).classList.add('is-hidden');
    document.querySelector(that.previousFocus).focus();
    const from = document.querySelector(that.dialog).querySelector('.js-form-login');
    if (from) from.reset();
}

const dialog = new Dialog();

function FormSubmit() {
    this.form = '';
    this.button = '';
}

FormSubmit.prototype.init = function init(type, actionType, popupScope) {
    const that = this;
    that.form = `.js-form-${type}`;
    that.button = `.js-form-submit-${type}`;

    document.querySelector(that.form).addEventListener('submit', (event) => {
        event.preventDefault();
        const fields = event.target.querySelectorAll('input, select');
        const objectData = {};
        for (let i = 0; i < fields.length; i += 1) {
            const fieldName = fields[i].getAttribute('name');
            let fieldValue = fields[i].value;
            if (fields[i].getAttribute('type') === 'checkbox') {
                fieldValue = fields[i].checked;
            }
            objectData[fieldName] = fieldValue;
        }
        that.validate(objectData, actionType, popupScope);
    });
}

FormSubmit.prototype.validate = function validate(data, actionType, popupScope) {
    const that = this;
    let status = true;

    const fieldsList = Object.entries(data);

    for (let i = 0; i < fieldsList.length; i += 1) {
        const [field, value] = fieldsList[i];
        const findedField = document.getElementsByName(field)[0];
        const errorTag = document.getElementById(findedField.getAttribute('aria-describedby'));
        if (!value || value === '') {
            status = false;
            findedField.classList.add('is-error');
            findedField.setAttribute('aria-invalid', 'true');
            errorTag.classList.remove('is-hidden');
        } else {
            findedField.classList.remove('is-error');
            findedField.removeAttribute('aria-invalid');
            errorTag.classList.add('is-hidden');
        }
    }

    if (status) {
        const buttonelement = document.querySelector(that.button);
        const previousValue = buttonelement.innerHTML;
        buttonelement.setAttribute('disabled', 'true');
        buttonelement.innerText = 'Подождите';
        const span = document.createElement('span');
        span.innerText = ', отправляем данные';
        span.classList.add('js-form-request');
        span.classList.add('sr-only');
        buttonelement.append(span);
        setTimeout(() => {
            buttonelement.removeAttribute('disabled');
            buttonelement.innerHTML = previousValue;
            if (actionType === 'popup') {
                document.querySelector(popupScope.button).classList.add('is-hidden');
                popupScope.previousFocus = '.js-popup-button-logout';
                document.querySelector(popupScope.previousFocus).classList.remove('is-hidden');
                popupScope.closePopup();
                document.querySelector('.js-popup-button-logout').onclick = () => {
                    document.querySelector('.js-popup-button-login').classList.remove('is-hidden');
                    document.querySelector('.js-popup-button-login').focus();
                    document.querySelector('.js-popup-button-logout').classList.add('is-hidden');
                };
            } else if (actionType === 'news') {
                const alertElement = document.querySelector('.js-alert-news');
                alertElement.classList.remove('is-hidden');
                document.querySelector('.js-form-news').reset();
                document.querySelector('.footer-form__group').classList.remove('is-filled');
                setTimeout(() => {
                    alertElement.classList.add('is-hidden');
                }, 6000);
            }
        }, 1000);
    } else {
        document.querySelector(that.form).querySelector('.is-error').focus();
    }
}

function Tabs() {
    this.tabsWrapper = '';
}

Tabs.prototype.init = function init(type, callback) {
    const that = this;
    that.tabsWrapper = `.js-${type}-tabs`;
    const wrapper = document.querySelector(that.tabsWrapper);
    const list = wrapper.querySelectorAll('.tab__item');
    
    that.generateClick(list, callback);
    wrapper.addEventListener('keydown', (event) => {
        that.navigation(event, that, list, callback);
    });
}

Tabs.prototype.changeTab = function changeTab(index, list, callback) {
    const tab = list[index]
    if (!tab.classList.contains('is-active')) {
        for (let j = 0; j < list.length; j += 1) {
            list[j].classList.remove('is-active');
            list[j].setAttribute('aria-selected', 'false');
            list[j].setAttribute('tabindex', '-1');
        }
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        tab.removeAttribute('tabindex');
        tab.focus();
        callback(index);
    }
}

Tabs.prototype.generateClick = function generateClick(list, callback) {
    const that = this;
    for (let i = 0; i < list.length; i += 1) {
        const tab = list[i];
        tab.onclick = () => that.changeTab(i, list, callback);
    }
}

Tabs.prototype.navigation = function navigation(event, scope, list, callback) {
    const that = scope;
    const index = Array.from(list).findIndex(item => item === document.activeElement);
    switch (event.keyCode) {
        case 37: {
            if ((index - 1) >= 0) {
                that.changeTab(index - 1, list, callback);
            } else {
                that.changeTab(list.length - 1, list, callback);
            }
            break;
        }
        case 39: {
            if ((index + 1) < list.length) {
                that.changeTab(index + 1, list, callback);
            } else {
                that.changeTab(0, list, callback);
            }
            break;
        }
        case 35:
            event.preventDefault();
            that.changeTab(list.length - 1, list, callback);
            break;
        case 36:
            event.preventDefault();
            that.changeTab(0, list, callback);
            break;
        default:
          break;
    }
}

function ChangeLocale() {
    this.htmlLocale = document.documentElement.getAttribute('lang');
    this.button = '.js-change-language';
    this.content = {
        ru: {
            title: document.title,
            logo: 'На главную',
            headers: {
                main: 'Главная страница',
                visitors: 'Посетителям',
                events: 'Выставки и события',
                museums: 'Музей',
                video: 'Онлайн-трансляции',
                lectures: 'Экскурсии и лекции в прямом эфире',
                socials: 'Соц. сети',
                subscription: 'Подписка на новости',
            },
            labels: {
                header: 'Навигация',
                'js-header-search': 'Поиск по сайту',
                'js-search-input': 'Запрос',
                'js-search-results': 'Результаты',
                'main-navigation': 'Основная',
            },
            buttons: {
                'skip-button': 'Перейти к основному контенту',
                'js-search-button .sr-only': 'Найти',
                'js-popup-button-login .sr-only': 'Войти',
                'js-popup-button-logout': 'Выйти',
            },
        },
        en: {
            title: 'Aleksey Kuzma - The Pushkin Museum',
            logo: 'To the main page',
            headers: {
                main: 'Main page',
                visitors: 'For visitors',
                events: 'Exhibitions and events',
                museums: 'Museums',
                video: 'Online broadcasts',
                lectures: 'Media',
                socials: 'The Museum in',
                subscription: 'Subscription',
            },
            labels: {
                header: 'Navigation',
                'js-header-search': 'Search by site',
                'js-search-input': 'Query',
                'js-search-results': 'Results',
                'main-navigation': 'Main',
            },
            buttons: {
                'skip-button': 'Skip to main content',
                'js-search-button .sr-only': 'Find',
                'js-popup-button-login .sr-only': 'Log In',
                'js-popup-button-logout': 'Log Out',
            },
        },
    };
}

ChangeLocale.prototype.init = function init() {
    const that = this;
    if (that.htmlLocale === 'en') {
        that.updateContent('en');
        document.querySelector('.js-change-language-ru').removeAttribute('disabled');
        document.querySelector('.js-change-language-en').setAttribute('disabled', 'true');
    }
    const buttons = document.querySelectorAll(that.button);
    for (let i = 0; i < buttons.length; i += 1) {
        const currentButton = buttons[i];
        const newLocation = currentButton.getAttribute('lang');
        currentButton.onclick = () => {
            that.updateContent(newLocation);
            const previousButton = document.querySelector(`${that.button}:disabled`);
            previousButton.removeAttribute('disabled');
            currentButton.setAttribute('disabled', 'true');
            document.documentElement.setAttribute('lang', newLocation);
            document.querySelector('h1').focus();
        };
    }
}

ChangeLocale.prototype.updateContent = function updateContent(lang) {
    const that = this;
    document.title = that.content[lang].title;
    window.history.pushState({ lang }, that.content[lang].title, `?lang=${lang}`)
    document.querySelector('.header__logo').setAttribute('title', that.content[lang].logo);
    const headers = Object.entries(that.content[lang].headers);
    for (let a = 0; a < headers.length; a += 1) {
        const [key, value] = headers[a];
        document.getElementById(`${key}-title`).innerText = value;
        const link = document.querySelector(`[href="#${key}-title"]`);
        if (link) link.innerText = value;
    }
    const labels = Object.entries(that.content[lang].labels);
    for (let b = 0; b < labels.length; b += 1) {
        const [key, value] = labels[b];
        document.querySelector(`.${key}`).setAttribute('aria-label', value);
    }
    const buttons = Object.entries(that.content[lang].buttons);
    for (let c = 0; c < buttons.length; c += 1) {
        const [key, value] = buttons[c];
        document.querySelector(`.${key}`).innerHTML = value;
    }
}

new ChangeLocale().init();

document.addEventListener('DOMContentLoaded', () => {
    main();
    search.init();
    const formLogin = new FormSubmit();
    const formNews = new FormSubmit();
    const dialogLogin = dialog.init('login');
    formLogin.init('login', 'popup', dialogLogin);
    formNews.init('news', 'news');
});
