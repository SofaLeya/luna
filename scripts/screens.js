const PETS = {
  kitty: {n: 'Котик', snd: 'Мур!'},
  bunny: {n: 'Зайка', snd: 'Хрум-хрум!'},
  fox: {n: 'Лисичка', snd: 'Фыр!'},
  panda: {n: 'Панда', snd: 'Бамбук?'},
  penguin: {n: 'Пингвин', snd: 'Топ-топ!'},
  koala: {n: 'Коала', snd: 'Обнимашки!'},
  owl: {n: 'Совёнок', snd: 'Ух-ух!'},
  llama: {n: 'Лама', snd: 'Пфф!'},
  hedgehog: {n: 'Ёжик', snd: 'Фыр-фыр!'},
  corgi: {n: 'Корги', snd: 'Гав!'},
  unicorn: {n: 'Единорог', snd: 'Иго-го ✨'},
  dragon: {n: 'Дракончик', snd: 'Пуф! ✨'},
  deer: {n: 'Оленёнок', snd: 'Привет!'},
  dino: {n: 'Динозаврик', snd: 'Р-р-р!'},
  capybara: {n: 'Капибара', snd: 'Чиллим!'},
  raccoon: {n: 'Енотик', snd: 'Обнимемся?'},
  whale: {n: 'Китёнок', snd: 'Буль-буль!'},
  axolotl: {n: 'Аксолотль', snd: 'Буль!'},
};

const ICONS = {
  home: '<path d="m2 11 10-8 10 8M5 10v11h5v-6h4v6h5V10"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-13 4h1m3 0h1m3 0h1m-9 3h1m3 0h1"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  care: '<circle cx="12" cy="12" r="9"/><path d="M12 16c-11-7-2-9 0-5 2-4 11-2 0 5Z"/>',
  chart: '<rect x="3" y="12" width="4" height="9" rx="1.3"/><rect x="10" y="4" width="4" height="17" rx="1.3"/><rect x="17" y="9" width="4" height="12" rx="1.3"/>',
  settings: '<path d="m10 2 4 0 .6 3 2 .9 2.6-1.6 2.6 2.7-1.5 2.6.8 2.4 2.9.7v3.6l-3 .6-.9 2.1 1.3 2.2-2.6 2.4-2.4-1.4-2.2.8-.6 2.6h-3.6l-.6-2.8-2.2-.8-2.5 1.3-2.6-2.6 1.5-2.4-.9-2.2-2.5-.6v-3.5l2.7-.6.8-2.1-1.5-2.6 2.6-2.5 2.5 1.4 2.1-.8Z" transform="translate(1 0) scale(.85)"/><circle cx="11.5" cy="11.7" r="3.2"/>',
  bell: '<path d="M5 10a7 7 0 0 1 14 0c0 7 2 6 2 8H3c0-2 2-1 2-8m5 11h4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 .4-1 1-1 2m0 3h.01"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  previous: '<path d="m15 5-7 7 7 7"/>',
  history: '<path d="M3 4h18M3 10h7m-7 6h5"/><circle cx="16.5" cy="14.5" r="5.5"/><path d="M16.5 11v4l2 1"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  back: '<path d="M20 12H4m0 0 7-7m-7 7 7 7"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  moon: '<path d="M20 15a8.8 8.8 0 0 1-11-11A9 9 0 1 0 20 15Z"/>',
  drop: '<path d="M12 2c-3 5-8 9-8 13a8 8 0 1 0 16 0c0-4-5-8-8-13Z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.3"/><path d="m3 17 5-5 4 4 4-6 5 6"/>',
  heart: '<path d="M12 21 3.7 12.4a5 5 0 0 1 7-7.1L12 6.6l1.3-1.3a5 5 0 0 1 7.1 7.1Z"/>',
  sprout: '<path d="M12 21V11M12 14C5 14 2 9 2 5c6 0 10 3 10 9Zm0 0c0-7 4-10 10-11 0 6-3 11-10 11Z"/>',
  edit: '<path d="m4 16-1 5 5-1L21 7l-4-4L4 16Zm10-10 4 4"/>',
  pill: '<rect x="7" y="2" width="10" height="20" rx="5" transform="rotate(45 12 12)"/><path d="m9 9 6 6"/>',
  sparkle: '<path d="M12 2c0 7 3 10 10 10-7 0-10 3-10 10 0-7-3-10-10-10 7 0 10-3 10-10Z"/>',
};
function icon(name, cls='') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

const SHORT_MONTHS = ['янв.', 'февр.', 'мар.', 'апр.', 'май', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
function shortDate(k) {
  const d = parse(k);
  return d.getDate()+' '+SHORT_MONTHS[d.getMonth()];
}
function toolButton(id, glyph, label, extra='') {
  return `<button class="icon-btn screen-tool" id="${id}" aria-label="${label}">${icon(glyph)}${extra}</button>`;
}
function petImage(id) {
  return `<img class="pet-art" src="assets/pets/${id}.webp" alt="" width="256" height="256" draggable="false">`;
}

function render() {
  applyAppearance();
  const app = $('#app');
  const nav = $('nav.tabs');
  nav.classList.toggle('hide', !S.setup);
  app.dataset.screen = S.setup ? tab : 'setup';
  nav.querySelectorAll('[data-tab]').forEach(button => {
    const active = button.dataset.tab === tab;
    button.classList.toggle('on', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  if (!S.setup) {
    app.innerHTML = setupView();
    bindSetup();
    return;
  }

  const title = {today:'Сегодня', cal:'Календарь', care:'Уход', stats:'Анализ'}[tab];
  const header = `<header class="screen-header">
    ${toolButton('set','settings','Настройки')}<h1>${title}</h1>
    ${APP?toolButton('notifications','bell','Уведомления',Object.values(S.notif||{}).some(Boolean)?'<i class="bell-mark" aria-hidden="true"></i>':''):'<span class="screen-header-spacer"></span>'}
  </header>`;
  app.innerHTML = header + {today:todayView, cal:calView, care:careView, stats:statsView}[tab]();
  $('#set').onclick = openSettings;
  const notifications = $('#notifications');
  if (notifications) notifications.onclick = () => sheet(`<h2>Напоминания</h2>${notifBox()}`, bindNotif);
  bindView();
  bindDisclosures(app);
  if (tab==='cal') bindCalendar();
}

const NAV_ICONS = {today:'home', cal:'calendar', care:'care', stats:'chart'};
document.querySelectorAll('[data-tab]').forEach(button => {
  button.insertAdjacentHTML('afterbegin', `<span class="nav-icon">${icon(NAV_ICONS[button.dataset.tab])}</span>`);
});
document.getElementById('quick-entry').insertAdjacentHTML('afterbegin',icon('plus'));

function fertileWindow(k, cycle = natural()) {
  if (S.mode !== 'natural' || !cycle.next) return null;
  const interval = Math.floor(diff(cycle.lastStart, k)/cycle.avg);
  const end = add(cycle.next, interval*cycle.avg-14);
  return {start: add(end,-5), end};
}

function dashboard(t,pill='',alerts='') {
  const cycle=S.mode==='natural'?natural():null;
  const estimate=cycle&&fertileWindow(t,cycle);
  const fertile=estimate&&(t<=estimate.end?estimate.start:add(estimate.start,cycle.avg));
  const pet=PETS[S.pet];
  const resting=S.pet==='unicorn'&&curPeriod(t)?.today;
  return `<section class="dashboard" aria-label="Записи за сегодня">
    <div class="sky-hero">
      ${hero(t)}
      ${pet?`<button class="mascot pet${resting?' is-resting':''}" id="petb" aria-label="Погладить питомца ${pet.n}">${petImage(resting?'unicorn-rest':S.pet)}</button>
        <div class="mascot-message" id="petbub" role="status">${esc(petSay(t).s)}</div>`:''}
    </div>
    ${pill}${alerts}
    <div class="dashboard-metrics">
      <button class="metric" id="metric-calendar"><span>${fertile?'Прогноз фертильных дней':'Календарь цикла'}</span>
        <small>${fertile?'Около '+shortDate(fertile):'Все отметки по дням'}</small>${icon(fertile?'sprout':'calendar','metric-symbol')}</button>
      <button class="metric" id="metric-care"><span>Забота о себе</span><small>Визиты и важные даты</small>${icon('heart','metric-symbol metric-heart')}</button>
    </div>
    <button class="feeling-card" data-day="${t}"><span><b>Самочувствие за сегодня</b><small>Симптомы, настроение и заметка</small></span>${icon('chevron')}</button>
  </section>`;
}
function careView() {
  return `${visitsCard()}${plansCard()}
    <div class="settings-links"><button class="btn" id="care-pets">${icon('heart')} Питомец</button><button class="btn" id="care-appearance">${icon('moon')} Оформление</button></div>`;
}

const BACKGROUNDS = [
  ['dream','Лавандовые облака'], ['moon','Лунный свет'], ['pink','Розовые облака'],
  ['stars','Звёздное небо'], ['dusk','Лиловые сумерки'],
];
const ACCENTS = [
  ['orchid','Орхидея','#d58dce'], ['violet','Фиолетовый','#a46ac8'], ['berry','Ягодный','#d166b6'],
  ['mauve','Мальва','#d48abf'], ['rose','Розовый','#ee8fb8'], ['lavender','Лаванда','#ad89dc'],
];
function appearance() {
  const prefs = S.appearance || {};
  return {
    accent: ACCENTS.find(([id])=>id===prefs.accent) || ACCENTS[0],
    background: BACKGROUNDS.find(([id])=>id===prefs.background) || BACKGROUNDS[0],
  };
}
function applyAppearance() {
  const {accent, background} = appearance();
  document.documentElement.style.setProperty('--rose',accent[2]);
  document.documentElement.dataset.wallpaper = background[0];
  document.documentElement.style.setProperty('--wallpaper',`url("../assets/sky/${background[0]}.webp")`);
}

const SHOWCASE = ['kitty','bunny','fox','panda','corgi','unicorn','dragon','deer'];
const NEW_PETS = ['unicorn','dragon','deer','dino','capybara','raccoon','whale','axolotl'];
const PET_COPY = {
  unicorn: 'Милый и волшебный спутник вашего цикла',
  kitty: 'Ласковый друг для тихих вечеров',
  bunny: 'Мягкий и чуткий лунный спутник',
  dragon: 'Крошечный хранитель тёплых снов',
};
function petScreen(filter) {
  const pet = PETS[S.pet];
  const ids = (filter==='all'?SHOWCASE:Object.keys(PETS)).filter(id => filter==='all' || NEW_PETS.includes(id)===(filter==='new'));
  const grid = pets => `<div class="pet-gallery">${pets.map(id=>`<button class="pet-tile" aria-pressed="${S.pet===id}" data-pet="${id}">
      ${petImage(id)}<span>${PETS[id].n}</span>${S.pet===id?`<i>${icon('check')}</i>`:''}
    </button>`).join('')}</div>`;
  return `<section class="pet-feature">
    ${pet ? petImage(S.pet) : icon('heart','empty-pet')}
    <div><h2>${pet?.n || 'Без питомца'}</h2><p>${pet ? PET_COPY[S.pet] || 'Ваш спутник в лунном дневнике' : 'Выберите спутника ниже'}</p>
      ${pet ? `<span class="feature-status">${icon('check')} Выбран</span>` : ''}</div>
    </section>
    <div class="pet-filters" aria-label="Категории питомцев">
      ${[['all','Все'],['classic','Классические'],['new','Новые']].map(([id,label])=>`<button data-filter="${id}" aria-pressed="${id===filter}">${label}${id==='new'?icon('sparkle'):''}</button>`).join('')}
    </div>
    ${grid(ids)}
    ${filter==='all'?`<details class="extended-pets"><summary class="btn small">Ещё питомцы</summary>${grid(Object.keys(PETS).filter(id=>!SHOWCASE.includes(id)))}</details>`:''}
    <button class="btn small no-pet" data-pet="none" aria-pressed="${S.pet==='none'}">Без питомца ${S.pet==='none'?icon('check'):''}</button>`;
}
function appearanceScreen() {
  const {accent, background} = appearance();
  return `<section class="appearance-panel">
    <h2>${icon('moon')} Тема</h2><div class="theme-choice">Тёмная (всегда) ${icon('check')}</div>
  </section>
  <section class="appearance-panel">
    <h2>${icon('drop')} Акцентный цвет</h2>
    <div class="accent-list">${ACCENTS.map(([id,label,color])=>`<button type="button" aria-label="${label}" aria-pressed="${accent[0]===id}" data-accent="${id}" style="--swatch:${color}">${accent[0]===id?icon('check'):''}</button>`).join('')}</div>
  </section>
  <section class="appearance-panel backgrounds">
    <h2>${icon('image')} Фон</h2>
    <div class="background-list">${BACKGROUNDS.map(([id,label])=>`<button type="button" aria-label="${label}" aria-pressed="${background[0]===id}" data-background="${id}"><img src="assets/sky/${id}.webp" alt="">${background[0]===id?`<i>${icon('check')}</i>`:''}</button>`).join('')}</div>
  </section>`;
}
function openDesign(screen, parent) {
  const isPets = screen === 'pets';
  let filter = 'all';
  let allExpanded = false;
  parent?.classList.add('hide');
  const previous = document.activeElement;
  let close;
  const exit = () => close();
  const draw = (sh, selector) => {
    sh.querySelector('.design-content').innerHTML = isPets ? petScreen(filter) : appearanceScreen();
    const extra = sh.querySelector('.extended-pets');
    if (extra) {
      extra.open = allExpanded;
      extra.ontoggle = () => { if (extra.isConnected) allExpanded = extra.open; };
    }
    sh.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{
      filter=b.dataset.filter;
      draw(sh,`[data-filter="${filter}"]`);
    });
    sh.querySelectorAll('[data-pet]').forEach(b=>b.onclick=()=>{
      S.pet=b.dataset.pet;
      save();
      draw(sh,`[data-pet="${S.pet}"]`);
    });
    sh.querySelectorAll('[data-accent],[data-background]').forEach(b=>b.onclick=()=>{
      const [key,value]=Object.entries(b.dataset)[0];
      S.appearance={...S.appearance,[key]:value};
      applyAppearance();
      save();
      draw(sh,`[data-${key}="${value}"]`);
    });
    if (selector) sh.querySelector(selector)?.focus({preventScroll:true});
  };
  close = sheet(`<header class="design-header">${toolButton('design-back','back','Назад')}<h1 id="design-title">${isPets?'Питомец':'Оформление'}</h1></header><div class="design-content"></div>`,
    sh => {
      sh.parentElement.classList.add('design-overlay');
      sh.classList.add('design-screen',screen);
      sh.setAttribute('role','dialog');
      sh.setAttribute('aria-modal','true');
      sh.setAttribute('aria-labelledby','design-title');
      sh.querySelector('#design-back').onclick = exit;
      draw(sh);
      sh.querySelector('#design-back').focus({preventScroll:true});
    }, {onClose:()=>{
      parent?.classList.remove('hide');
      previous?.focus({preventScroll:true});
    }, swipe:false});
}


const DISCLOSURE_KEY='luna-ui-disclosures-v1';
let disclosures={};
try { disclosures=JSON.parse(localStorage.getItem(DISCLOSURE_KEY))||{}; } catch {}
function disclosure(id,title,content,{open=false,inline=false}={}){
  return `<details class="disclosure ${inline?'disclosure-inline':'card'}" data-disclosure="${id}"${(disclosures[id]??open)?' open':''}>
    <summary>${title} ${icon('down','disclosure-caret')}</summary>
    <div class="disclosure-content">${content}</div>
  </details>`;
}
function previewList(id,items,limit){
  return items.slice(0,limit).join('')+(items.length>limit
    ?disclosure(id+'-more',`Показать всё (${items.length})`,items.slice(limit).join(''),{inline:true}):'');
}
function bindDisclosures(root){
  root.querySelectorAll('[data-disclosure]').forEach(node=>{
    let wasOpen=node.open;
    node.addEventListener('toggle',()=>{
      if(!node.isConnected||wasOpen===node.open)return;
      wasOpen=node.open;
      disclosures[node.dataset.disclosure]=node.open;
      try { localStorage.setItem(DISCLOSURE_KEY,JSON.stringify(disclosures)); } catch {}
    });
  });
}
