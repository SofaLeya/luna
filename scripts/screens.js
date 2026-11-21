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

  if (tab === 'cal') {
    app.innerHTML = calView();
    $('#hlp').onclick = () => openHelp('cal');
  } else {
    const title = {today: 'Луна', care: 'Уход', stats: 'Анализ'}[tab];
    app.innerHTML = `<header class="screen-header">
      ${toolButton('set','settings','Настройки')}<h1 class="${tab==='today'?'visually-hidden':''}">${title}</h1>
      ${toolButton('notifications','bell','Уведомления', APP && Object.values(S.notif||{}).some(Boolean) ? '<i class="bell-mark"></i>' : '')}
    </header>` + {today: todayView, care: careView, stats: statsView}[tab]();
    $('#set').onclick = openSettings;
    $('#notifications').onclick = () => sheet(`<h2>Уведомления</h2>${notifBox() || '<p class="mut">Напоминания доступны в приложении «Луна» для Android.</p>'}`, bindNotif);
  }
  bindView();
}

const NAV_ICONS = {today:'home', cal:'calendar', care:'care', stats:'chart'};
document.querySelectorAll('[data-tab]').forEach(button => {
  button.insertAdjacentHTML('afterbegin', `<span class="nav-icon">${icon(NAV_ICONS[button.dataset.tab])}</span>`);
});
document.getElementById('quick-entry').innerHTML = icon('plus');

function fertileWindow(k, cycle = natural()) {
  if (S.mode !== 'natural' || !cycle.next) return null;
  const interval = Math.floor(diff(cycle.lastStart, k)/cycle.avg);
  const end = add(cycle.next, interval*cycle.avg-14);
  return {start: add(end,-5), end};
}

function dashboard(t) {
  const day = cycleDay(t);
  const pi = S.mode === 'pill' ? packInfo(t) : null;
  const cycle = S.mode === 'natural' ? natural() : null;
  const estimate = cycle && fertileWindow(t,cycle);
  const fertile = estimate && (t <= estimate.end ? estimate.start : add(estimate.start,cycle.avg));
  const pet = PETS[S.pet];
  const resting = S.pet==='unicorn' && curPeriod(t)?.today;
  return `<section class="dashboard" aria-label="Сегодня">
    <div class="sky-hero">
      ${hero(t)}
      ${pet ? `<button class="mascot pet${resting?' is-resting':''}" id="petb" aria-label="Погладить питомца ${pet.n}">${petImage(resting?'unicorn-rest':S.pet)}</button>
        <div class="mascot-message" id="petbub" role="status">${esc(petSay(t).s)}</div>` : ''}
    </div>
    <div class="dashboard-metrics">
      <button class="metric" id="metric-calendar"><span>День цикла</span><strong class="cycle-dial" style="--progress:${Math.min(day||0,C().len)/C().len*100}%">${day||'—'}</strong></button>
      <button class="metric" id="metric-forecast">
        <span>${pi ? 'Таблетка '+pi.day+' из '+pi.len : fertile ? shortDate(fertile) : 'Прогноз'}</span>
        <small>${pi ? esc(P().name) : fertile ? 'Фертильные дни' : 'Календарь цикла'}</small>
        ${icon(pi?'pill':'sprout','metric-symbol')}
      </button>
      <button class="metric" id="metric-care"><span>Забота<br>о себе</span>${icon('heart','metric-symbol metric-heart')}</button>
    </div>
    <button class="feeling-card" data-day="${t}"><span><b>Как вы себя чувствуете сегодня?</b><small>Отметьте симптомы, настроение и заметки</small></span>${icon('chevron')}</button>
  </section>`;
}
function careView() {
  const t = today();
  return `<button class="feeling-card" data-day="${t}"><span><b>Самочувствие и заметки</b><small>Запись на ${fmt(t)}</small></span>${icon('chevron')}</button>
    ${softAlerts(t)}${visitsCard()}${plansCard()}
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
  const onEscape = event => { if (event.key === 'Escape') exit(); };
  const exit = () => {
    document.removeEventListener('keydown',onEscape);
    close();
    parent?.classList.remove('hide');
    previous?.focus();
  };
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
      document.removeEventListener('keydown',onEscape);
      parent?.classList.remove('hide');
    }, swipe:false});
  document.addEventListener('keydown',onEscape);
}

let calFocus = null;
function selectedCalendarDay() {
  const t = today();
  if (calFocus?.slice(0,7) === calM) return calFocus;
  return calM === t.slice(0,7) ? t : calM+'-01';
}
function calView(){
  const t=today();if(!calM)calM=t.slice(0,7);
  const[y,m]=calM.split('-').map(Number);
  const first=new Date(y,m-1,1);const off=(first.getDay()+6)%7;
  const start=add(key(first),-off);
  const focus=selectedCalendarDay(), focusRecord=S.days[focus]||{};
  const fullMonth=MONN[m-1]+' '+y;
  const monthLabel=SHORT_MONTHS[m-1];
  const cycle=S.mode==='natural'?natural():null;
  const active=cycle&&curPeriod(t);
  let h=`<section class="calendar-page">
    <header class="cal-head screen-header">${toolButton('hlp','help','Подсказки по календарю')}
      <label class="month-control"><b class="visually-hidden">${fullMonth}</b><span aria-hidden="true">${monthLabel} ${icon('down')}</span><input id="calendar-month" type="month" value="${calM}" aria-label="Выбрать месяц"></label>
      ${toolButton('calendar-tools','history','Действия календаря')}</header>`;
  if(calSel)h+=`<div class="alert ${calSel.mode==='add'?'info':'warn'}">${calSel.mode==='add'?'🩸':'🧽'} ${calSel.a?`Первый день - ${fmt(calSel.a)}. Теперь нажми <b style="display:inline">последний</b> день (или тот же ещё раз)`:'Нажми <b style="display:inline">первый</b> день'}${calSel.mode==='del'?' - отметки месячных в этих днях сотрутся':''} <button class="linkbtn" style="display:inline;margin:0 0 0 6px" data-rng="${calSel.mode}">отмена</button></div>`;
  h+='<div id="calcard"><div class="grid">';
  h+=['пн','вт','ср','чт','пт','сб','вс'].map(w=>`<div class="wd">${w}</div>`).join('');
  const stl=starts();
  for(let i=0;i<42;i++){
    const k=add(start,i),d=parse(k),dd=S.days[k]||{};
    if(i>0&&i%7===0&&d.getMonth()!==m-1)break;
    const cd=cycleDay(k,stl);
    let cls='d';if(d.getMonth()!==m-1)cls+=' out';if(calSel&&calSel.a===k)cls+=' sel';if((S.plans||[]).some(p=>k>=p.from&&k<=p.to))cls+=' plan';if(k===t)cls+=' today';if(k===focus)cls+=' selected';
    const predicted = k>=t && (predBleed(k) || (active&&!active.closed&&diff(active.e.start,k)<cycle.len));
    if(dd.flow)cls+=' f'+dd.flow;else if(predicted)cls+=' pred';
    let mk='';
    if(S.mode==='pill'){const pi=packInfo(k);
      if(pi){if(!pi.active){cls+=dd.flow?'':' inact';mk=P().type==='placebo'?(S.taken[k]?'<span class="mk pl">●</span>':'<span class="mk pl">○</span>'):''}
        else if(S.taken[k])mk=lateH(k)>=12?'<span class="mk miss">!</span>':'<span class="mk ok">●</span>';
        else if(k<t&&!(S.since&&k<S.since))mk='<span class="mk miss">✕</span>';
        else mk='';
        if(pi.day===1)mk+='';
      }
    }
    const estimate=cycle ? fertileWindow(k,cycle) : null;
    if(estimate&&k>=estimate.start&&k<=estimate.end) {
      cls+=' fertile';
      mk+=icon('sprout','fertile-mark');
    }
    const sy=(dd.sym&&dd.sym.length)||dd.note||dd.mood||dd.w?'<span class="sy"></span>':'';
    h+=`<button class="${cls}" data-day="${k}" aria-label="${fmt(k)}${dd.flow?', месячные':predicted?', прогноз месячных':''}${cls.includes(' fertile')?', прогноз фертильных дней':''}" aria-pressed="${k===focus}">${cd?`<span class="cdn">${cd}</span>`:''}<span class="dn">${d.getDate()}</span>${mk}${sy}</button>`;
  }
  h+=`</div></div>
    <section class="calendar-detail">
      ${icon(focusRecord.flow?'drop':'calendar','calendar-detail-symbol')}
      <div><b>${shortDate(focus)}</b><small>${cycleDay(focus,stl)?'День цикла '+cycleDay(focus,stl):focusRecord.flow?'Месячные':'Запись дня'}</small></div>
      <button class="btn" id="calendar-edit">${icon('edit')} <span>Редактировать</span></button>
    </section>
    <div class="calendar-commands" id="calendar-commands" hidden>
      <div class="row month-arrows"><button class="btn small" id="pm" aria-label="Предыдущий месяц">‹</button><button class="btn small" id="nm" aria-label="Следующий месяц">›</button></div>
      <div class="row"><button class="btn small" data-rng="add">Отметить месячные</button><button class="btn small" data-rng="del">Стереть диапазон</button>${focus<=t?`<button class="btn small" id="calendar-period">${focusRecord.flow?'Снять отметку за день':'Отметить выбранный день'}</button>`:''}</div>
      <div class="legend">`;
  if(S.mode==='pill')h+=`<span><b style="color:var(--ok)">●</b> выпила</span><span><b style="color:var(--bad)">✕</b> пропуск</span><span><b style="color:var(--bad)">!</b> опоздание 12ч+</span><span><i style="background:#1a161c;border:1px solid var(--line)"></i>${P().type==='placebo'?'плацебо':'перерыв'}</span>`;
  h+=`<span><i class="period-key"></i>месячные</span><span><i class="prediction-key"></i>прогноз месячных</span>
    <span><i class="note-key"></i>заметка</span>${cycle?`<span>${icon('sprout','legend-fertile')} прогноз фертильных дней</span>`:''}
    ${(S.plans||[]).length?'<span><i style="box-shadow:inset 0 -3px 0 #a77bff"></i>важные даты</span>':''}
    </div></div>
  </section>`;
  return h;
}
