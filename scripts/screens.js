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
  pixel_kitty: {n: 'Пиксельный котик'},
  pixel_bunny: {n: 'Пиксельная зайка'},
  pixel_fox: {n: 'Пиксельная лисичка'},
  pixel_ghost: {n: 'Пиксельный призрак'},
  pixel_mooncat: {n: 'Лунный котик'},
  pixel_hedgehog: {n: 'Пиксельный ёжик'},
  pixel_owl: {n: 'Пиксельная совушка'},
  pixel_dragon: {n: 'Пиксельный дракончик'},
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
const PIXEL_PETS = {
  pixel_kitty:{name:'Котик',fur:'#e9a15f',light:'#fff0d2',shade:'#b66b54',eye:'#533650',blush:'#ee91ad',type:'cat'},
  pixel_bunny:{name:'Зайка',fur:'#f9e9fa',light:'#fffaff',shade:'#c6a6d9',eye:'#5d466c',blush:'#f1a9c9',type:'bunny'},
  pixel_fox:{name:'Лисичка',fur:'#e99051',light:'#fff0ce',shade:'#aa5b50',eye:'#57364c',blush:'#ef9aab',type:'fox'},
  pixel_ghost:{name:'Призрак',fur:'#d7b9f2',light:'#f5eaff',shade:'#a37bcf',eye:'#57436c',blush:'#ee9dc8',type:'ghost'},
  pixel_mooncat:{name:'Лунный котик',fur:'#8170a7',light:'#c9b9e6',shade:'#594878',eye:'#f7d784',blush:'#e9a2c8',type:'mooncat'},
  pixel_hedgehog:{name:'Ёжик',fur:'#edc69f',light:'#fff1d6',shade:'#9a6b79',eye:'#5b415a',blush:'#ef9ab1',type:'hedgehog'},
  pixel_owl:{name:'Совушка',fur:'#b69bda',light:'#fff2e5',shade:'#8270b2',eye:'#654a76',blush:'#eaa1c6',type:'owl'},
  pixel_dragon:{name:'Дракончик',fur:'#ad8ad8',light:'#f4d6e9',shade:'#775aa6',eye:'#594673',blush:'#ef9dc7',type:'dragon'}
};
function pixelPetArt(id){
  const p=PIXEL_PETS[id];if(!p)return '';
  const r=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  const path=(d,c)=>`<path d="${d}" fill="${c}"/>`;
  const {fur:f,light:l,shade:d,eye:e,blush:b,type:t}=p;
  const star=(x,y)=>r(x+2,y,2,8,'#f8d786')+r(x,y+3,6,2,'#f8d786')+r(x+2,y+2,2,4,'#fff4ca');
  let out='';
  if(t==='ghost'){
    out+=path('M11 15H15V11H20V8H32V10H39V14H43V18H46V37H43V41H38V44H31V42H25V44H18V41H12V37H9V20H11Z',d);
    out+=path('M13 17H17V12H23V10H31V12H38V16H41V20H44V36H40V39H34V41H28V39H22V41H16V38H12V20H13Z',f);
    out+=path('M17 18H21V15H34V17H38V24H40V34H36V37H21V35H16V23H17Z',l);
    out+=r(21,24,4,6,e)+r(32,24,4,6,e)+r(22,24,1,2,'#fff')+r(33,24,1,2,'#fff')+r(27,32,4,3,b);
    out+=path('M13 14H18V10H26V6H37V9H42V13H47V17H12Z',d)+path('M23 9H28V5H36V9H40V12H23Z',f);
    out+=star(29,10)+star(43,30);
  }else{
    if(t==='hedgehog'){
      out+=path('M8 22L5 17L11 16L9 10L17 13L18 7L24 11L29 6L33 12L40 10L39 17L46 18L43 24L47 29L43 35L38 42H18L11 37L8 29Z',d);
      for(let i=0;i<8;i++)out+=r(11+i*4,14+(i%2)*2,3,4,i%2?'#b18a94':'#876277');
    }
    if(t==='dragon'){
      out+=path('M39 30H46V26H50V30H47V36H43V41H36Z',d);
      out+=path('M12 26L4 18L17 22L18 12L28 22L39 13L42 24L46 31L38 36L22 34Z',d);
      out+=path('M13 27L7 21L20 25L20 17L29 26L39 18L41 26L40 34L20 33Z',f);
    }
    if(t==='owl'){
      out+=path('M12 14L10 6L20 11H34L44 6L42 14L46 23V37L40 44H15L9 37V23Z',d);
      out+=path('M14 15L13 10L21 14H33L41 10L40 15L43 23V37L38 41H17L12 36V23Z',f);
    }else{
      // Tail, feet and rounded sitting body.
      if(t==='fox')out+=path('M38 31H45V25H49V30H52V40H48V44H35Z',d)+path('M40 32H46V29H49V38H44V41H38Z',f)+r(46,38,4,4,l);
      if(t==='cat'||t==='mooncat')out+=path('M12 36H8V29H5V36H7V42H15Z',d)+path('M11 36H9V31H7V38H12Z',f);
      out+=path('M17 30H37V33H42V40H39V45H15V42H12V36H15Z',d);
      out+=path('M18 31H36V34H39V40H36V43H17V40H15V35H18Z',f);
      out+=r(19,38,5,5,l)+r(31,38,5,5,l);
      if(t==='hedgehog')out+=path('M18 32H37V40H32V43H20V40H16V35Z',l);
      if(t==='bunny')out+=path('M14 5H21V17H25V3H32V17H37V21H13Z',d)+path('M16 6H20V19H26V5H30V20H17Z',f)+r(18,8,2,9,b)+r(28,7,2,10,b);
      else if(t==='fox')out+=path('M11 20L12 5L22 13H32L43 5L44 20Z',d)+path('M14 18L15 9L23 15H32L40 9L41 19Z',f)+r(17,12,3,5,l)+r(37,12,3,5,l);
      else if(t==='cat'||t==='mooncat')out+=path('M12 20V6L22 13H32L43 6V20Z',d)+path('M15 18V10L23 16H31L40 10V19Z',f)+r(17,12,3,5,b)+r(36,12,3,5,b);
      else if(t==='dragon')out+=path('M14 19L12 7L21 13H33L42 7L43 21Z',d)+path('M16 18L15 11L23 16H31L39 11L40 20Z',f)+r(17,12,3,4,l)+r(36,12,3,4,l);
      if(t!=='hedgehog')out+=path('M12 21H15V17H20V15H36V17H41V21H44V31H41V35H37V38H18V35H14V32H11V24H12Z',d)+path('M15 21H18V18H37V21H40V24H42V31H39V34H35V36H19V34H16V31H13V24H15Z',f);
      else out+=path('M14 24H17V19H24V16H34V19H39V24H42V34H38V38H20V36H15Z',l);
    }
    if(t==='owl'){
      out+=path('M18 21H37V24H41V34H38V39H18V35H15V25H18Z',l);
      out+=r(21,26,5,5,e)+r(32,26,5,5,e)+r(22,26,2,2,'#fff')+r(33,26,2,2,'#fff');
      out+=path('M27 32H32L30 36H28Z','#f4b66b');
      out+=r(18,39,5,4,'#efbc7d')+r(34,39,5,4,'#efbc7d');
    }else{
      if(t==='mooncat'){out+=r(19,23,5,7,e)+r(34,23,5,7,e)+r(21,24,2,3,'#fff8dc')+r(36,24,2,3,'#fff8dc');}
      else{out+=r(20,24,5,5,e)+r(34,24,5,5,e)+r(21,24,2,2,'#fff')+r(35,24,2,2,'#fff');}
      out+=r(16,30,5,3,b)+r(38,30,5,3,b);
      out+=r(28,29,4,3,b)+r(29,32,2,2,e)+r(25,34,4,1,e)+r(31,34,4,1,e);
      if(t==='fox')out+=r(19,34,6,4,l)+r(34,34,6,4,l);
      if(t==='dragon')out+=path('M24 35H36V40H33V43H27V40H24Z',l);
    }
  }
  // Accessories tie each companion to the dreamy moonlit aesthetic.
  if(t==='bunny')out+=r(38,35,7,5,'#a982d5')+r(34,33,5,5,'#b59be3')+r(45,33,5,5,'#b59be3')+r(40,36,3,3,'#f4d7ff');
  if(t==='fox')out+=path('M17 37H39V40H34V43H23V40H17Z','#8b668d')+r(26,40,5,4,'#c8a1cb');
  if(t==='mooncat')out+=path('M26 17H33V19H30V23H27V21H25V19H26Z','#ffe09d')+star(38,38);
  if(t==='hedgehog')out+=star(38,11)+r(26,39,5,4,'#b49ce4');
  if(t==='owl')out+=path('M7 44H49V46H7Z','#8d7392')+r(12,43,7,2,'#ad9297');
  if(t==='dragon')out+=path('M8 40H13V34H16V29H19V34H22V40H26V44H8Z','#f4d7a0')+star(11,34);
  if(t==='cat')out+=star(43,15);
  return `<svg class="pet-art pixel-pet-art" viewBox="0 0 56 52" role="img" aria-label="${PETS[id].n}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
}

function petImage(id) {
  if(PIXEL_PETS[id])return pixelPetArt(id);
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
      ${pet?`<button class="mascot pet${resting?' is-resting':''}" id="petb" aria-label="Выбрать питомца. Сейчас ${pet.n}">${petImage(resting?'unicorn-rest':S.pet)}</button>
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
const PIXEL_PET_IDS = Object.keys(PIXEL_PETS);
const NEW_PETS = ['unicorn','dragon','deer','dino','capybara','raccoon','whale','axolotl'];
const PET_COPY = {
  unicorn: 'Милый и волшебный спутник вашего цикла',
  kitty: 'Ласковый друг для тихих вечеров',
  bunny: 'Мягкий и чуткий лунный спутник',
  dragon: 'Крошечный хранитель тёплых снов',
};
function petScreen(filter) {
  const pet = PETS[S.pet];
  const ids = filter==='pixel'?PIXEL_PET_IDS:(filter==='all'?SHOWCASE:Object.keys(PETS).filter(id=>!PIXEL_PETS[id])).filter(id => filter==='all' || NEW_PETS.includes(id)===(filter==='new'));
  const grid = pets => `<div class="pet-gallery">${pets.map(id=>`<button class="pet-tile" aria-pressed="${S.pet===id}" data-pet="${id}">
      ${petImage(id)}<span>${PETS[id].n}</span>${S.pet===id?`<i>${icon('check')}</i>`:''}
    </button>`).join('')}</div>`;
  return `<section class="pet-feature">
    ${pet ? petImage(S.pet) : icon('heart','empty-pet')}
    <div><h2>${pet?.n || 'Без питомца'}</h2><p>${pet ? PET_COPY[S.pet] || 'Ваш спутник в лунном дневнике' : 'Выберите спутника ниже'}</p>
      ${pet ? `<span class="feature-status">${icon('check')} Выбран</span>` : ''}</div>
    </section>
    <div class="pet-filters" aria-label="Категории питомцев">
      ${[['all','Все'],['classic','Классические'],['new','Новые'],['pixel','Пиксельные']].map(([id,label])=>`<button data-filter="${id}" aria-pressed="${id===filter}">${label}${id==='new'?icon('sparkle'):''}</button>`).join('')}
    </div>
    ${grid(ids)}
    ${filter==='all'?`<div class="pixel-pets-promo"><span>✦ Пиксельные друзья</span><button type="button" data-filter="pixel">Посмотреть ${icon('chevron')}</button></div><details class="extended-pets"><summary class="btn small">Ещё питомцы</summary>${grid(Object.keys(PETS).filter(id=>!SHOWCASE.includes(id)&&!PIXEL_PETS[id]))}</details>`:''}
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
