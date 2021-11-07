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
        const { name, link, date, date_title, img, alt, desc } = list[i];
        returnTemplate += `
            <li class="card">
                <div role="group" aria-labelledby="card-event-title-${i}" aria-describedby="card-event-subtitle-${i}">
                    <img class="card__image" src="${img}" alt="${alt}">
                    <h3 class="card__title" id="card-event-title-${i}">${name}</h3>
                    <span class="card__subtitle" id="card-event-subtitle-${i}">Выставка до ${date_title}</span>
                    <span class="card__desc">${desc}</span>
                </div>
                <a href="https://alexeykuzma.github.io/a11y-museum${link}"
                   class="button button_small card__button"
                   id="card-event-link-${i}"
                   aria-labelledby="card-event-link-${i} card-event-title-${i}">
                    Купить билет<span class="sr-only"> на выставку</span>
                </a>
            </li>
        `;
    }
    document.querySelector('.js-events-list').innerHTML = returnTemplate;
    setAlertLink(document.querySelector('.js-events-list'));
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

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.js-events-list')) {
        getEvents(eventsList);
        const tabsEvents = new Tabs();
        tabsEvents.init('events', loadEvents);
        const tabsMuseums = new Tabs();
        tabsMuseums.init('museums', changeMuseumsTab);
    }
    new Swiper('.carousel', {
        navigation: {
            nextEl: '.carousel__button_next',
            prevEl: '.carousel__button_prev',
        },
        a11y: {
            enabled: false,
        },
        watchSlidesProgress: true,
        on: {
            init() {
                const slides = Array.from(this.slides);
                for (let i = 0; i < slides.length; i += 1) {
                    const slide = slides[i].querySelector('.slide');
                    if (!slides[i].classList.contains('swiper-slide-visible')) {
                        slide.style.display = 'none';
                    }
                }
            },
            setTranslate() {
                debounce(() => {
                    const slides = Array.from(this.slides);
                    for (let i = 0; i < slides.length; i += 1) {
                        if (slides[i].classList.contains('swiper-slide-visible')) {
                            slides[i].querySelector('.slide').style.display = '';
                        }
                    }
                }, 50);
            },
            transitionEnd() {
                const slides = Array.from(this.slides);
                for (let i = 0; i < slides.length; i += 1) {
                    if (!slides[i].classList.contains('swiper-slide-visible')) {
                        slides[i].querySelector('.slide').style.display = 'none';
                    }
                }
            },
            slideChangeTransitionStart() {
                if (this.isEnd || this.isBeginning) {
                    document.querySelector('.carousel__button:not(:disabled)').focus();
                }
            },
        },
    });
});
