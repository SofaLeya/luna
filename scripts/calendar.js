let calM = null;
let calFocus = null;
let calSel = null;
const MIN_CAL_YEAR = 1900;
const MAX_CAL_YEAR = 9999;

function shiftMonth(month, offset) {
  const [year, index] = month.split('-').map(Number);
  const target = new Date(year, index-1+offset, 1);
  return target.getFullYear()>=MIN_CAL_YEAR && target.getFullYear()<=MAX_CAL_YEAR
    ? key(target).slice(0,7) : month;
}

function periodProjection(k, now, cycle, active) {
  return k>=now && (predBleed(k) || (cycle&&active&&!active.closed&&diff(active.e.start,k)<cycle.len));
}

function calendarPill(k, now) {
  const pack = S.mode==='pill' ? packInfo(k) : null;
  if (!pack) return null;
  const taken = S.taken[k];
  if (!pack.active && P().type==='break') return {icon:'—',kind:'rest',label:'Перерыв в приёме'};
  if (!pack.active) return {icon:taken?'◉':'○',kind:'placebo',label:taken?'Плацебо принято':'Плацебо'};
  if (taken) return lateH(k)>=12
    ? {icon:'!',kind:'miss',label:'Таблетка принята с опозданием'}
    : {icon:'✓',kind:'ok',label:'Таблетка принята'};
  return k<now&&!(S.since&&k<S.since) ? {icon:'×',kind:'miss',label:'Таблетка не отмечена'} : null;
}

function calendarDetail(focus, now, startsList, cycle, active) {
  if (focus.slice(0,7)!==calM) return `<section class="calendar-detail no-selection" aria-live="polite">
    <div><b>Выберите день</b><small>Выбранная дата: ${fmt(focus)} ${parse(focus).getFullYear()}</small></div>
    <button class="linkbtn" id="calendar-selection">Вернуться к дате</button></section>`;
  const day = S.days[focus]||{};
  const cycleDayNumber = cycleDay(focus,startsList);
  const predicted = !day.flow && periodProjection(focus,now,cycle,active);
  const estimate = cycle && fertileWindow(focus,cycle);
  const fertile = estimate && focus>=estimate.start && focus<=estimate.end;
  const pill = calendarPill(focus,now);
  const plans = (S.plans||[]).filter(plan=>focus>=plan.from&&focus<=plan.to);
  const status = [
    day.flow ? `Кровотечение: ${FLOW[day.flow]||'отмечено'}` : predicted ? 'Прогноз месячных' : '',
    fertile && !day.flow ? 'Прогноз фертильных дней' : '', pill?.label,
    day.mood && `Настроение: ${esc(day.mood)}`,
    day.sym?.length && `Симптомы: ${esc(day.sym.join(', '))}`,
    day.meds?.length && `Препараты: ${esc(day.meds.map(m=>m.n).join(', '))}`,
    ...plans.map(plan=>esc(plan.name)),
  ].filter(Boolean);
  return `<section class="calendar-detail" aria-live="polite">
    ${icon(day.flow?'drop':'calendar','calendar-detail-symbol')}
    <div class="calendar-detail-text"><b>${fmt(focus)}</b><small>${cycleDayNumber?'День цикла '+cycleDayNumber:status.length?'События дня':'Запись дня'}</small></div>
    <button class="btn" id="calendar-edit">${icon('edit')} Редактировать</button>
    ${status.length||day.note?`<div class="calendar-record">${status.length?`<small>${status.join(' · ')}</small>`:''}${day.note?`<p>${esc(day.note)}</p>`:''}</div>`:''}
  </section>`;
}

function calView() {
  const now=today();
  calM??=now.slice(0,7);
  calFocus??=now;
  const [year,month]=calM.split('-').map(Number);
  const first=new Date(year,month-1,1);
  const offset=(first.getDay()+6)%7;
  const start=add(key(first),-offset);
  const count=Math.ceil((offset+new Date(year,month,0).getDate())/7)*7;
  const startsList=starts();
  const cycle=S.mode==='natural'?natural():null;
  const active=cycle&&curPeriod(now);
  const focusedInMonth=calFocus.slice(0,7)===calM;
  const title=MONN[month-1]+' '+year;
  const previousDisabled=shiftMonth(calM,-1)===calM?' disabled':'';
  const nextDisabled=shiftMonth(calM,1)===calM?' disabled':'';
  let html=`<section class="calendar-page" aria-label="Календарь месяца">
    <div class="cal-head">
      <button class="icon-btn" id="pm" aria-label="Предыдущий месяц"${previousDisabled}>${icon('previous')}</button>
      <button class="month-control" id="calendar-month" aria-label="Выбрать месяц и год, ${title}"><b>${title}</b>${icon('down')}</button>
      <button class="icon-btn" id="nm" aria-label="Следующий месяц"${nextDisabled}>${icon('chevron')}</button>
    </div>
    <div class="calendar-actions"><button class="btn small" id="calendar-today" aria-label="Перейти к сегодняшней дате">Сегодня</button>
      <button class="btn small" id="calendar-tools" aria-controls="period-actions" aria-expanded="${calSel?.mode==='menu'}">${icon('drop')} Месячные</button></div>`;
  if(calSel?.mode==='menu'){
    html+=`<div class="calendar-commands row" id="period-actions">
      <button class="btn small" data-rng="add">Отметить период</button>
      <button class="btn small" data-rng="del">Стереть отметки за период</button>
      ${focusedInMonth&&calFocus<=now?`<button class="btn small" id="calendar-period">${S.days[calFocus]?.flow?'Снять отметку за день':'Отметить выбранный день'}</button>`:''}</div>`;
  } else if(calSel){
    html+=`<div class="calendar-commands range-hint" id="period-actions" role="status"><span>${calSel.mode==='add'?'Отметить месячные.':'Стереть отметки.'}
      ${calSel.a?`Выберите конец периода с ${fmt(calSel.a)}.`:'Выберите первый день.'}</span>
      <button class="btn small" id="calendar-range-cancel">Отмена</button></div>`;
  } else html+='<div id="period-actions" hidden></div>';
  html+='<div id="calcard"><div class="grid">';
  html+=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(day=>`<div class="wd">${day}</div>`).join('');
  for(let i=0;i<count;i++){
    const k=add(start,i), date=parse(k), record=S.days[k]||{};
    const outside=date.getMonth()!==month-1;
    const unavailable=date.getFullYear()<MIN_CAL_YEAR||date.getFullYear()>MAX_CAL_YEAR;
    const selected=focusedInMonth&&k===calFocus;
    const predicted=!record.flow&&periodProjection(k,now,cycle,active);
    const estimate=cycle && fertileWindow(k,cycle);
    const fertile=estimate&&k>=estimate.start&&k<=estimate.end;
    const pill=calendarPill(k,now);
    const logged=record.note||record.sym?.length||record.mood||record.w||record.temp||record.pads||record.meds?.length||record.sx;
    const plan=(S.plans||[]).some(p=>k>=p.from&&k<=p.to);
    const classes=['d', outside&&'out', k===now&&'today', selected&&'selected', calSel?.a===k&&'sel',
      record.flow&&'f'+record.flow, predicted&&'pred', fertile&&'fertile', pill?.kind==='rest'&&'inact', plan&&'plan'].filter(Boolean);
    const description=[fmt(k)+' '+date.getFullYear(),record.flow?'месячные':predicted?'прогноз месячных':'',
      fertile&&'прогноз фертильных дней',pill?.label,logged&&'дневник заполнен',plan&&'важные даты'].filter(Boolean).join(', ');
    html+=`<button class="${classes.join(' ')}" data-cal-day="${k}" aria-label="${description}" aria-pressed="${selected}"${k===now?' aria-current="date"':''}${unavailable?' disabled':''}>
      <span class="dn">${date.getDate()}</span>
      ${fertile?icon('sprout','fertile-mark'):''}${logged?'<span class="sy" aria-hidden="true"></span>':''}
      ${pill?`<span class="mk ${pill.kind}" aria-hidden="true">${pill.icon}</span>`:''}</button>`;
  }
  html+=`</div></div>${calendarDetail(calFocus,now,startsList,cycle,active)}`;
  return html+disclosure('calendar-legend','Обозначения',`<div class="legend">
    <span><i class="period-key"></i>Месячные</span><span><i class="prediction-key"></i>Прогноз месячных</span>
    ${S.mode==='pill'?'<span><b class="legend-ok">✓</b> Приём отмечен</span><span><b class="legend-miss">×</b> Приём не отмечен</span><span><b class="legend-miss">!</b> Опоздание от 12 ч</span><span>◉ / ○ Плацебо</span><span>— Перерыв</span>':''}
    ${cycle?`<span>${icon('sprout','legend-fertile')} Прогноз фертильных дней</span>`:''}
    <span><i class="note-key"></i>Запись в дневнике</span><span><i class="plan-key"></i>Важные даты</span></div>${cycle?'<p class="empty-note legend-note">Фертильные дни приблизительны. Календарный прогноз не подходит для контрацепции.</p>':''}`)+ '</section>';
}

function renderCalendar(focusSelector) {
  render();
  if (focusSelector) $(focusSelector)?.focus({preventScroll:true});
}

function openMonthPicker() {
  const [year,month]=calM.split('-').map(Number);
  sheet(`<h2>Выбор месяца и года</h2>
    <form id="month-picker" class="month-picker">
      <label>Месяц<select name="month">${MONN.map((m,i)=>`<option value="${i+1}"${i+1===month?' selected':''}>${m}</option>`).join('')}</select></label>
      <label>Год<input name="year" type="number" inputmode="numeric" min="${MIN_CAL_YEAR}" max="${MAX_CAL_YEAR}" required value="${year}"></label>
      <button class="btn main" type="submit">Перейти</button>
    </form>`,(sh,close)=>{
    sh.querySelector('form').onsubmit=event=>{
      event.preventDefault();
      const {year,month}=event.currentTarget.elements;
      calM=year.valueAsNumber+'-'+pad(month.value);
      close();
    };
  });
}

function bindCalendar() {
  const move=(offset,button)=>{calM=shiftMonth(calM,offset);renderCalendar(button)};
  $('#pm').onclick=()=>move(-1,'#pm');
  $('#nm').onclick=()=>move(1,'#nm');
  $('#calendar-month').onclick=openMonthPicker;
  $('#calendar-today').onclick=()=>{
    calFocus=today();calM=calFocus.slice(0,7);calSel=null;renderCalendar('#calendar-today');
  };
  const returnButton=$('#calendar-selection');
  if(returnButton) returnButton.onclick=()=>{calM=calFocus.slice(0,7);renderCalendar(`[data-cal-day="${calFocus}"]`)};
  const edit=$('#calendar-edit');
  if(edit) edit.onclick=()=>openDay(calFocus);
  $('#calendar-tools').onclick=()=>{
    calSel=calSel?.mode==='menu'?null:{mode:'menu',a:null};
    renderCalendar('#calendar-tools');
  };
  const cancel=$('#calendar-range-cancel');
  if(cancel) cancel.onclick=()=>{calSel=null;renderCalendar('#calendar-tools')};
  const period=$('#calendar-period');
  if(period) period.onclick=()=>{calSel=null;toggleCalendarPeriod(calFocus);$('#calendar-tools').focus({preventScroll:true})};
  document.querySelectorAll('[data-rng]').forEach(b=>b.onclick=()=>{
    calSel={mode:b.dataset.rng,a:null};renderCalendar('#calendar-range-cancel');
  });
  const grid=$('#calcard');
  let startTouch=null;
  let lastSwipe=-Infinity;
  grid.addEventListener('touchstart',e=>{
    startTouch=e.touches.length===1?[e.touches[0].clientX,e.touches[0].clientY]:null;
  },{passive:true});
  grid.addEventListener('touchcancel',()=>{startTouch=null},{passive:true});
  grid.addEventListener('touchend',e=>{
    if(!startTouch)return;
    const [x,y]=startTouch;startTouch=null;
    const {clientX,clientY}=e.changedTouches[0];
    const dx=clientX-x,dy=clientY-y;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){
      lastSwipe=performance.now();
      move(dx<0?1:-1);
    }
  },{passive:true});
  grid.querySelectorAll('[data-cal-day]').forEach(button=>{
    button.onclick=()=>{
      if(performance.now()-lastSwipe<400)return;
      const day=button.dataset.calDay;
      if(calSel&&calSel.mode!=='menu'){rangeTap(day);return}
      calFocus=day;calM=day.slice(0,7);calSel=null;
      renderCalendar(`[data-cal-day="${day}"]`);
      const editButton=$('#calendar-edit');
      if(editButton && editButton.getBoundingClientRect().bottom>$('nav.tabs').getBoundingClientRect().top){
        editButton.scrollIntoView({block:'nearest'});
      }
    };
    button.oncontextmenu=e=>{
      e.preventDefault();
      if(calSel)return;
      button.click();
      $('#calendar-edit')?.click();
    };
  });
}
function toggleCalendarPeriod(k){
  if(k>today()){toast('Будущие дни пока нельзя отмечать');return}
  const previous=S.days[k]?S.days[k].flow||0:0;
  S.days[k]=S.days[k]||{sym:[],note:''};
  S.days[k].flow=previous?0:2;
  clean(k);save();render();
  toast(previous?'Месячные: отметка снята':'Месячные отмечены',()=>{
    S.days[k]=S.days[k]||{sym:[],note:''};
    S.days[k].flow=previous;clean(k);save();render();
  });
}

function rangeTap(k){
  if(calSel.mode==='add'&&k>today()){toast('Для месячных выберите прошедший день или сегодня');return}
  if(!calSel.a){calSel.a=k;renderCalendar(`[data-cal-day="${k}"]`);return}
  let a=calSel.a,b=k;if(b<a)[a,b]=[b,a];
  if(diff(a,b)>14){toast('Слишком длинно - максимум 15 дней');return}
  if(calSel.mode==='add'){
    for(let x=a,i=0;x<=b;x=add(x,1),i++){if(x>today())break;S.days[x]=S.days[x]||{sym:[],note:''};if(!S.days[x].flow)S.days[x].flow=i<2?3:2}
    const e=episodes().find(e=>e.start<=b&&e.end>=a);if(e&&b<today())S.ended[e.start]=true;
    toast(`Отмечено: ${fmt(a)}${a!==b?' - '+fmt(b):''}`);
  }else{
    for(let x=a;x<=b;x=add(x,1)){if(S.days[x]){S.days[x].flow=0;clean(x)}delete S.ended[x]}
    toast('Стёрто');
  }
  calSel=null;save();renderCalendar('#calendar-tools');
}
