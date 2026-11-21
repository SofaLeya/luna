/* ---------- данные ---------- */
const KEY='luna-v1';
const FLOW=['нет','мажется','слабо','средне','обильно'];
const MOOD=['😊 хорошее','😌 спокойное','😐 обычное','😴 вялое','😢 грустное','😠 злое','😰 тревожное'];
const SYM=['Боль внизу живота','Голова','Грудь','Вздутие','Тошнота','Раздражительность','Усталость','Акне','Отёки','Тяга к сладкому'];
const PRESETS=[
  {id:'21p7',name:'21 + 7 плацебо',active:21,inactive:7,type:'placebo',hint:'Ярина Плюс, Джес Плюс и др.'},
  {id:'21b7',name:'21 + 7 перерыв',active:21,inactive:7,type:'break',hint:'Ярина, Регулон и др. - 7 дней без таблеток'},
  {id:'24p4',name:'24 + 4 плацебо',active:24,inactive:4,type:'placebo',hint:'Джес, Модэлль Тренд и др.'},
  {id:'26p2',name:'26 + 2 плацебо',active:26,inactive:2,type:'placebo',hint:'Клайра и др.'},
  {id:'cont',name:'Без перерыва',active:28,inactive:0,type:'placebo',hint:'пью активные подряд'}
];
let S=load();
function def(){return{v:1,setup:false,since:null,mode:'pill',pill:{name:'Ярина Плюс',preset:'21p7',active:21,inactive:7,type:'placebo',time:'21:00',packs:[],stock:null,skip:{}},taken:{},days:{},ended:{},plans:[],brk:{},compact:true,visits:[],dism:{},pet:'kitty',notif:{pill:true,again:true,period:true,last:true},cyc:{len:28,auto:true,dur:5,after:2}}}
function load(){try{const r=localStorage.getItem(KEY);if(r){const o=JSON.parse(r);return Object.assign(def(),o,{pill:Object.assign(def().pill,o.pill||{}),cyc:Object.assign(def().cyc,o.cyc||{})})}}catch(e){}return def()}
function fixS(o){return Object.assign(def(),o,{pill:Object.assign(def().pill,o.pill||{}),cyc:Object.assign(def().cyc,o.cyc||{}),notif:Object.assign(def().notif,o.notif||{})})}
function saveLocal(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Не получилось сохранить в браузере - сделай копию в настройках')}if(typeof nativeSchedule==='function')nativeSchedule()}
function save(){saveLocal();if(typeof ydOn==='function'&&ydOn()){ydSet({chg:Date.now()});clearTimeout(YD.t);YD.t=setTimeout(ydSync,2500)}}

/* ---------- даты ---------- */
const pad=n=>String(n).padStart(2,'0');
const key=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
const add=(k,n)=>{const d=parse(k);d.setDate(d.getDate()+n);return key(d)};
const diff=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
const today=()=>key(new Date());
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONN=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const WD=['вс','пн','вт','ср','чт','пт','сб'];
const fmt=k=>{const d=parse(k);return d.getDate()+' '+MON[d.getMonth()]};
const fmtW=k=>fmt(k)+', '+WD[parse(k).getDay()];
const fmtShort=k=>{const d=parse(k);return d.getDate()+'.'+pad(d.getMonth()+1)};
function plural(n,a,b,c){n=Math.abs(n)%100;const m=n%10;if(n>10&&n<20)return c;if(m>1&&m<5)return b;if(m==1)return a;return c}

/* ---------- логика пачки ---------- */
const P=()=>S.pill;
const C=()=>S.cyc;
const L=()=>P().active+P().inactive;
function packLen(st){return (P().skip&&P().skip[st])?P().active:L()}
function packInfo(k){
  if(S.mode!=='pill'||!P().packs.length)return null;
  const ps=[...P().packs].sort();
  let st=null;for(const p of ps)if(p<=k)st=p;
  if(!st)return null;
  let s=st,virt=false;
  for(let g=0;g<600;g++){
    const len=packLen(s),nx=add(s,len);
    if(nx>k){const day=diff(s,k)+1;return{day,len,start:s,end:add(s,len-1),active:day<=P().active,inIdx:day-P().active,virtual:virt,skipped:len<L()}}
    s=nx;virt=true;
  }
  return null;
}
function schedAt(k){const[h,m]=P().time.split(':').map(Number);const d=parse(k);d.setHours(h,m,0,0);return d}
function lateH(k){const t=S.taken[k];if(!t)return null;return (new Date(t.at)-schedAt(k))/36e5}
function predBleed(k){
  if(S.mode==='pill'){
    if(P().inactive<1)return false;
    const pi=packInfo(k);if(!pi)return false;
    const first=P().packs.slice().sort()[0];
    const prev=packInfo(add(pi.start,-1));
    for(const q of [pi,prev]){
      if(!q||q.skipped)continue;const st=q.start;
      if(st<first)continue;
      const d=diff(add(st,P().active-1+C().after),k);
      if(d>=0&&d<C().dur)return true;
    }
    return false;
  }
  const n=natural();if(!n.next)return false;
  for(let i=0;i<15;i++){const d=diff(add(n.next,i*n.avg),k);if(d<0)break;if(d<n.len)return true}
  return false;
}
function nextPack(k){const pi=packInfo(k);return pi?add(pi.end,1):null}
function nextBleedStart(k){
  if(S.mode!=='pill')return natural().next;
  for(let i=0;i<70;i++){const x=add(k,i);if(predBleed(x)&&!predBleed(add(x,-1)))return x}
  return null;
}
function missedActive(){
  // пропущенные активные таблетки в текущей и прошлой пачке (до вчера), не раньше первой пачки
  const t=today(),out=[];
  for(let i=1;i<=35;i++){const k=add(t,-i);if(S.since&&k<S.since)break;const pi=packInfo(k);if(!pi)break;if(pi.active&&!S.taken[k])out.push(k)}
  return out.reverse();
}

/* ---------- эпизоды кровотечений ---------- */
function episodes(){
  const ks=Object.keys(S.days).filter(k=>(S.days[k].flow||0)>0).sort();
  const eps=[];let cur=null;
  for(const k of ks){
    if(cur&&diff(cur.end,k)<=1){cur.end=k;cur.max=Math.max(cur.max,S.days[k].flow);cur.n++}
    else{cur={start:k,end:k,max:S.days[k].flow,n:1};eps.push(cur)}
  }
  eps.forEach(e=>{
    if(S.mode==='pill'){const pi=packInfo(e.start);
      if(!pi)e.kind='';
      else if(!pi.active||pi.day<=5)e.kind='отмены';
      else e.kind='прорывное';
    }
  });
  return eps;
}
function natural(){
  const eps=episodes().filter(e=>e.max>=2);
  const st=eps.map(e=>e.start);
  const cyc=[];for(let i=1;i<st.length;i++){const c=diff(st[i-1],st[i]);if(c>=15&&c<=60)cyc.push(c)}
  const last=cyc.slice(-6);
  const hist=last.length?Math.round(last.reduce((a,b)=>a+b,0)/last.length):null;
  const avg=C().auto&&last.length>=2?hist:C().len;
  const lastStart=st[st.length-1]||null;
  return{avg,len:C().dur,next:lastStart?add(lastStart,avg):null,lastStart,count:cyc.length,hist};
}
function starts(){return episodes().filter(e=>e.max>=2).map(e=>e.start)}
let _st=null;
function cycleDay(k,st){st=st||starts();let s=null;for(const x of st){if(x<=k)s=x;else break}return s?diff(s,k)+1:null}
function curPeriod(t){
  const eps=episodes();const e=eps[eps.length-1];
  if(!e||S.ended[e.start])return e&&e.end===t?{e,today:true,day:diff(e.start,t)+1,closed:true}:null;
  if(e.end===t)return{e,today:true,day:diff(e.start,t)+1};
  if(e.end===add(t,-1)&&diff(e.start,t)<C().dur+4)return{e,today:false,day:diff(e.start,t)+1};
  return null;
}

function hero(t){
  const cp=curPeriod(t),D=(n)=>n+' '+plural(n,'день','дня','дней');
  const day=cycleDay(t);
  let h=`<div class="hero"><div class="hero-cycle">День цикла <b class="cycle-dial">${day||'—'}</b></div><div class="hk">Месячные</div>`;
  if(cp&&cp.today){
    const next=nextBleedStart(t);
    const left=C().dur-cp.day;
    h+=`<div class="hb">${cp.day}-й день</div><div class="hs">${cp.closed?'Сегодня последний день':next&&next>t?shortDate(next)+' · след. менст.':left>0?'по плану ещё ~'+D(left):'по плану уже должны заканчиваться'}</div>`;
    h+=cp.closed?`<div class="row hbtn"><button class="btn" data-reopen>Нет, ещё идут</button></div>`:`<div class="row hbtn"><button class="btn main" data-end>Конец месячных</button></div>`;
    h+=`<button class="linkbtn" data-cancel>Убрать отметки месячных</button>`;
  }else if(cp){
    h+=`<div class="hb">${cp.day}-й день?</div><div class="hs">Вчера были. Сегодня ещё идут?</div><div class="row hbtn"><button class="btn main sm2" data-cont>Да, идут</button><button class="btn" data-end>Нет, закончились</button></div><button class="linkbtn" data-cancel>Убрать отметки месячных</button>`;
  }else{
    const n=S.mode==='natural'?natural():null;
    const late=n&&n.next&&n.next<t?diff(n.next,t):0;
    const ns=nextBleedStart(t);
    if(late>0)h+=`<div class="hb">задержка ${D(late)}</div><div class="hs">ждали ${fmtW(n.next)}</div>`;
    else if(predBleed(t))h+=`<div class="hb">ждём сейчас</div><div class="hs">по прогнозу ожидаются в эти дни</div>`;
    else if(ns){const d=diff(t,ns);const pi=S.mode==='pill'?packInfo(t):null;h+=`<div class="hb">через ${D(d)}</div><div class="hs">~ ${fmtW(ns)}${pi&&pi.skipped?' · в этой пачке отменены':''}</div>`}
    else if(S.mode==='pill'&&P().inactive<1)h+=`<div class="hb">не ожидаются</div><div class="hs">пьёшь без перерыва</div>`;
    else h+=`<div class="hb">Нет прогноза</div><div class="hs">Отметьте начало, когда начнутся месячные</div>`;
    h+=`<div class="row hbtn"><button class="btn main sm2" data-start>Начались сегодня</button></div>`;
  }
  return h+'</div>';
}

/* ---------- рендер ---------- */
let tab='today';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function ringSVG(pi){
  const len=pi.len,R=104,cx=120,cy=120,gap=len>30?0.6:1.6;
  let s='';const per=360/len;
  for(let i=0;i<len;i++){
    const k=add(pi.start,i),d=i+1,act=d<=P().active;
    const a0=(i*per+gap/2-90)*Math.PI/180,a1=((i+1)*per-gap/2-90)*Math.PI/180;
    const x0=cx+R*Math.cos(a0),y0=cy+R*Math.sin(a0),x1=cx+R*Math.cos(a1),y1=cy+R*Math.sin(a1);
    let col;const t=today();
    if(!act)col=S.taken[k]?'#7a6575':'#3a2f3a';
    else if(S.taken[k])col='url(#g)';
    else if(k<t&&!(S.since&&k<S.since))col='#ff5a6a';
    else col='#4a2c44';
    const w=k===t?20:14;
    s+=`<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="butt"/>`;
    if(k===t)s+=`<circle cx="${(cx+(R+18)*Math.cos((a0+a1)/2)).toFixed(1)}" cy="${(cy+(R+18)*Math.sin((a0+a1)/2)).toFixed(1)}" r="3.5" fill="#fff"/>`;
  }
  return `<svg viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ff6fa8"/><stop offset="1" stop-color="#8e4fd6"/></linearGradient></defs>${s}</svg>`;
}

function todayView(){
  const t=today();let h='';
  // The dashboard starts with the cycle overview; alerts remain visible below.
  if(S.mode==='pill'){
    const pi=packInfo(t);
    if(!pi)return dashboard(t,`<div class="card pill-today"><div><strong>${esc(P().name)}</strong><small>Пачка ещё не начата</small></div><button class="btn" id="newpack">Начала пачку сегодня</button></div>`,apkNote()+softAlerts(t));
    const miss=missedActive();
    const riskLine=(k)=>{const q=packInfo(k);if(!q||!q.active)return '';const sx=[];for(let i=1;i<=7;i++){const x=add(k,-i);if((S.days[x]||{}).sx)sx.push(x)}
      if(q.day<=7&&sx.length)return `<div style="margin-top:6px;font-weight:600">⚠️ Пропуск на 1-й неделе пачки, а за 7 дней до него была близость без защиты (${sx.map(fmtShort).join(', ')}). По правилам КОК есть риск - лучше написать гинекологу.</div>`;
      return `<div style="margin-top:6px">Следующие 7 дней нужна доп. защита (презерватив).</div>`};
    if(miss.length)h+=`<div class="alert bad"><b>Не ${miss.length===1?'отмечена таблетка':'отмечены таблетки'}: ${miss.map(k=>'день '+packInfo(k).day+' ('+fmtShort(k)+')').join(', ')}</b>Если выпила и просто забыла отметить - отметь. Если правда пропустила - глянь, что делать.${riskLine(miss[0])}<div class="row"><button class="btn small" data-mark="${miss[miss.length-1]}">Выпила, отметить</button><button class="btn small" data-help="miss">Что делать при пропуске</button></div></div>`;
    const hrs=(new Date()-schedAt(t))/36e5;
    if(pi.active&&!S.taken[t]){
      if(hrs>=12)h+=`<div class="alert bad"><b>Опоздание больше 12 часов</b>Выпей сейчас и глянь правила пропуска.${riskLine(t)}<div class="row"><button class="btn small" data-help="miss">Что делать</button></div></div>`;
      else if(hrs>=0)h+=`<div class="alert warn"><b>Пора выпить таблетку 💊</b>Время приёма было в ${P().time}. До 12 часов опоздания - не страшно.</div>`;
    }
    if(P().stock!==null&&P().stock<=0&&diff(t,pi.end)<=7)h+=`<div class="alert info"><b>Запас пачек закончился</b>Новая пачка нужна ${fmt(add(pi.end,1))}. Пора докупить ${esc(P().name)}.</div>`;
    const breakChoice=pi.active&&!pi.skipped&&P().inactive>0&&pi.day>=P().active-1&&!(S.brk||{})[pi.start];
    if(breakChoice){
      const nxt=P().type==='placebo'?'плацебо':'перерыв';
      h+=`<div class="alert info"><b>${pi.day===P().active?'Сегодня':'Завтра'} последняя активная таблетка</b>Потом ${nxt} и месячные. Делаем перерыв или отменяем месячные?<div class="row"><button class="btn small" data-brk="${pi.start}">Делаю перерыв</button><button class="btn small" data-skip="${pi.start}">🚫 Отменить месячные</button></div></div>`;
    }
    return dashboard(t,pillToday(pi,t,breakChoice),h+apkNote()+softAlerts(t));
  }
  return dashboard(t,'',apkNote()+softAlerts(t));
}

function pillToday(pi,t,breakChoice){
  const taken=S.taken[t];
  const rest=!pi.active&&P().type==='break';
  const phase=pi.active?'Активная':rest?'Перерыв':'Плацебо';
  return `<section class="card pill-card" aria-label="Таблетка сегодня">
    <div class="pill-today"><div>${icon('pill')} <strong>${esc(P().name)}</strong>
      <small>${rest?'День схемы':'Таблетка'} ${pi.day} из ${pi.len} · ${phase}</small>
      <small>${rest?'Сегодня без таблетки':`По плану в ${P().time}`}${taken&&!rest?` · принято в ${new Date(taken.at).toTimeString().slice(0,5)}`:''}</small>
    </div>${rest?'':taken?`<button class="btn pill-undo" data-unmark="${t}">✓ Снять отметку</button>`:`<button class="btn main" data-mark="${t}">Выпила</button>`}</div>
    ${disclosure('pill-details','О пачке',`<div class="ring-box">
      <div class="ring">${ringSVG(pi)}<div class="c"><div class="big">${pi.day}</div><div class="of">день из ${pi.len}</div></div></div>
      <div class="minis">
        <div><span>Последняя активная</span><b>${fmtShort(add(pi.start,P().active-1))}</b></div>
        <div><span>Следующая пачка</span><b>${fmtShort(add(pi.end,1))}</b></div>
        ${P().stock!==null?`<div><span>В запасе</span><b>${P().stock}</b></div>`:''}
      </div>${breakChoice?'':skipBtn(pi,t)}</div>`, {open:S.compact===false,inline:true})}
  </section>`;
}

function cycStats(){
  const eps=episodes().filter(e=>e.max>=2);
  const rows=eps.map((e,i)=>({e,cyc:i+1<eps.length?diff(e.start,eps[i+1].start):null}));
  const last=rows.filter(r=>r.cyc&&r.cyc>=15&&r.cyc<=60).slice(-6);
  const done=rows.filter(r=>r.e.end<today()||S.ended[r.e.start]).slice(-6);
  return{rows,avgC:last.length?Math.round(last.reduce((a,r)=>a+r.cyc,0)/last.length):null,avgP:done.length?Math.round(done.reduce((a,r)=>a+r.e.n,0)/done.length):null,nC:last.length};
}
function statsView(){
  const cs=cycStats(), next=forecast(1).find(event=>event.t==='p');
  const duration=n=>n+' '+plural(n,'день','дня','дней');
  return `<section class="card cycle-summary"><h2>Мой цикл</h2>
    <div class="stat">
      <div><span>Средняя длина цикла</span><b>${cs.avgC?duration(cs.avgC):'Мало данных'}</b></div>
      <div><span>Средняя длительность месячных</span><b>${cs.avgP?duration(cs.avgP):'Мало данных'}</b></div>
    </div>
    <div class="forecast-summary"><span>Ближайший прогноз</span><strong>${next?`Месячные около ${fmt(next.k)}`:'Пока нет прогноза'}</strong></div>
  </section>`+forecastCard()+chronologyCard(cs.rows)+notesCard()+
    disclosure('stats-extra','Дополнительная аналитика',analysisDetails());
}
function chronologyCard(records){
  const rows=records.slice().reverse();
  const items=rows.map(({e,cyc})=>{
    const pads=padsOf(e);
    return `<div class="ep"><span><b>${fmt(e.start)} ${parse(e.start).getFullYear()}</b>
      ${e.kind==='прорывное'?'<span class="tag br">прорывное</span>':''}
      <small>${e.n} ${plural(e.n,'день','дня','дней')}${pads?' · '+pads+' шт.':''}</small></span>
      <span class="mut">${cyc?cyc+' д. цикл':e.end>=today()&&!S.ended[e.start]?'Текущий':''}</span></div>`;
  });
  return disclosure('stats-history','Хронология', items.length?previewList('history',items,3):'<p class="empty-note">Отметьте месячные, чтобы здесь появилась история циклов.</p>',{open:true});
}
function notesCard(){
  const notes=Object.entries(S.days).filter(([,d])=>d.note).sort().reverse();
  const items=notes.map(([k,d],i)=>`<button class="ep nt" data-i="${i}" data-q="${esc((d.note+' '+(d.sym||[]).join(' ')+' '+(d.mood||'')).toLowerCase())}" data-day="${k}"><b>${fmt(k)} ${parse(k).getFullYear()}</b><span>${esc(d.note)}</span></button>`);
  return disclosure('stats-notes','Заметки',items.length?`<label class="note-search">Поиск по заметкам<input id="nsearch" type="search" value="${esc(notesQuery)}" placeholder="Заметка, симптом или настроение"></label>
    ${items.length>3?`<button class="btn small" id="more-notes" aria-controls="note-results" aria-expanded="${notesExpanded}">${notesExpanded?'Свернуть список':'Все заметки ('+items.length+')'}</button>`:''}
    <div class="notes-list" id="note-results">${items.join('')}</div>
    <p id="nnone" class="empty-note" role="status" hidden>Заметок не найдено.</p>`
    :'<p class="empty-note">Добавьте заметку в записи дня.</p>',{open:true});
}
let notesQuery='';
let notesExpanded=false;

function analysisDetails(){
  let h='';
  if(S.mode==='pill'){
    const t=today();let exp=0,ok=0,late=0;
    const from=add(t,-L()*3);
    for(let k=from;k<t;k=add(k,1)){if(S.since&&k<S.since)continue;const pi=packInfo(k);if(!pi||!pi.active)continue;exp++;if(S.taken[k]){ok++;if(lateH(k)>=12)late++}}
    const br=episodes().filter(e=>e.kind==='прорывное'&&e.start>=add(t,-120));
    if(exp)h+=`<div class="card"><h3>Таблетки · последние 3 пачки</h3><div class="stat">
      <div><b>${Math.round(ok/exp*100)}%</b><span>активных выпито</span></div>
      <div><b>${exp-ok}</b><span>${plural(exp-ok,'пропуск','пропуска','пропусков')}</span></div>
      <div><b>${late}</b><span>опозданий больше 12 ч</span></div>
      <div><b>${br.length}</b><span>прорывных кровотечений за 4 мес</span></div></div></div>`;
  }
  h+=symMap()+medsCard();
  // вес
  const ws=Object.entries(S.days).filter(([k,d])=>d.w>0).sort();
  if(ws.length){const [lk,ld]=ws[ws.length-1];const prev=ws.length>1?ws[ws.length-2][1].w:null;
    h+=`<div class="card"><h3>Вес</h3><div class="row" style="justify-content:space-between"><div><b style="font-size:26px">${ld.w} кг</b><div class="mut sm">${fmt(lk)} ${parse(lk).getFullYear()}</div></div>${prev!==null?`<div class="mut">${ld.w-prev>0?'+':''}${(Math.round((ld.w-prev)*10)/10)} кг к прошлому</div>`:''}</div>${ws.length>2?spark(ws.slice(-20).map(x=>x[1].w)):''}</div>`}
  const cnt={};Object.values(S.days).forEach(d=>(d.sym||[]).forEach(s=>cnt[s]=(cnt[s]||0)+1));
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,6);
  if(top.length)h+=`<div class="card"><h3>Чаще всего</h3>${top.map(([s,c])=>`<div class="kv"><span class="k">${esc(s)}</span><span class="v">${c} ${plural(c,'раз','раза','раз')}</span></div>`).join('')}</div>`;
  if(!h)h='<p class="empty-note">Когда появятся записи о самочувствии или приёме таблеток, здесь будут дополнительные показатели.</p>';
  h+=`<button class="btn full" id="exp2">Сводка для врача за 6 месяцев</button>`;
  return h;
}
function softAlerts(t){
  let h='';const D=S.dism||{};
  // за 1-2 дня до месячных
  if(!curPeriod(t)){const ns=nextBleedStart(t);if(ns){const d=diff(t,ns);if(d>=1&&d<=2&&!D['pre'+ns])h+=`<div class="alert info"><b>${d===1?'Завтра':'Через 2 дня'} месячные 🩸</b>Проверь запас прокладок и обезболивающего.<div class="row"><button class="btn small" data-dism="pre${ns}">Ок</button></div></div>`}}
  // прорывные повторяются
  if(S.mode==='pill'){const from=add(t,-L()*3);const packs=new Set(episodes().filter(e=>e.kind==='прорывное'&&e.start>=from).map(e=>(packInfo(e.start)||{}).start));
    const kk='br'+t.slice(0,7);if(packs.size>=2&&!D[kk])h+=`<div class="alert warn"><b>Мажущие посреди пачки повторяются</b>Прорывные кровотечения были в ${packs.size} из 3 последних пачек. Это частая история на КОК, но стоит показать гинекологу - кнопка "Отправить врачу" в "Анализе".<div class="row"><button class="btn small" data-dism="${kk}">Понятно</button></div></div>`}
  // год без гинеколога
  const gv=(S.visits||[]).filter(v=>v.type==='Гинеколог').map(v=>v.date).sort().pop();
  const vk='vis'+t.slice(0,7);if(gv&&diff(gv,t)>=365&&!D[vk])h+=`<div class="alert info"><b>Год с последнего визита к гинекологу</b>Последний раз - ${fmt(gv)} ${parse(gv).getFullYear()}. Пора записаться 🩺 (по ДМС, если есть).<div class="row"><button class="btn small" data-dism="${vk}">Напомнить в следующем месяце</button></div></div>`;
  return h;
}
function symMap(){
  const st=starts();if(st.length<2)return '';
  const rows={},N=35;
  for(const [k,d] of Object.entries(S.days)){const cd=cycleDay(k,st);if(!cd||cd>N)continue;
    const items=[...(d.sym||[]),...((d.meds||[]).length?['💊 обезболивающее']:[]),...(d.mood&&/грус|зло|трев/.test(d.mood)?[d.mood]:[])];
    items.forEach(x=>{rows[x]=rows[x]||new Array(N).fill(0);rows[x][cd-1]++})}
  const list=Object.entries(rows).filter(([,a])=>a.reduce((x,y)=>x+y,0)>=2).sort((a,b)=>b[1].reduce((x,y)=>x+y,0)-a[1].reduce((x,y)=>x+y,0)).slice(0,8);
  if(!list.length)return `<div class="card"><h3>🗺️ Карта самочувствия по дням цикла</h3><div class="dim sm">Появится, когда симптомы будут отмечены хотя бы пару раз.</div></div>`;
  const mx=Math.max(...list.flatMap(([,a])=>a));
  let h=`<div class="card"><h3>🗺️ Карта самочувствия по дням цикла</h3><div class="hm">`;
  list.forEach(([n,a])=>{h+=`<div class="hml">${esc(n)}</div><div class="hmr">${a.map((v,i)=>`<i style="opacity:${v?0.25+0.75*v/mx:1};background:${v?'var(--rose)':'#ffffff0d'}" title="день ${i+1}: ${v}"></i>`).join('')}</div>`});
  h+=`<div></div><div class="hmx"><span>1</span><span>7</span><span>14</span><span>21</span><span>28</span><span>35</span></div></div><div class="dim sm" style="margin-top:6px">Чем ярче клетка, тем чаще это было в этот день цикла. День 1 - первый день месячных.</div></div>`;
  return h;
}
function medsCard(){
  const from=add(today(),-92),list=[];
  for(const [k,d] of Object.entries(S.days))if(k>=from)(d.meds||[]).forEach(m=>list.push({k,...m}));
  const pads=episodes().filter(e=>e.start>=add(today(),-200)).map(e=>{let tot=0,mx=0;for(let x=e.start;x<=e.end;x=add(x,1)){const p=(S.days[x]||{}).pads||0;tot+=p;mx=Math.max(mx,p)}return{e,tot,mx}}).filter(x=>x.tot);
  if(!list.length&&!pads.length)return '';
  let h=`<div class="card"><h3>💊 Обезболивающее и средства</h3>`;
  if(list.length){const c={};list.forEach(m=>c[m.n]=(c[m.n]||0)+1);h+=`<div class="kv"><span class="k">обезболивающее за 3 мес</span><span class="v">${list.length} ${plural(list.length,'раз','раза','раз')}</span></div>`+Object.entries(c).map(([n,v])=>`<div class="kv"><span class="k">· ${esc(n)}</span><span class="v">${v}</span></div>`).join('')}
  if(pads.length)h+=pads.slice(-4).reverse().map(x=>`<div class="kv"><span class="k">месячные с ${fmtShort(x.e.start)}</span><span class="v">${x.tot} шт., до ${x.mx} в день</span></div>`).join('');
  return h+`</div>`;
}
const VTYPES=['Гинеколог','УЗИ','Анализы','Маммолог','Другое'];
function visitsCard(){
  const vs=(S.visits||[]).map((v,i)=>({v,i})).sort((a,b)=>a.v.date<b.v.date?1:-1);
  let h=`<div class="card care-card"><h3>${icon('care')} Врачи и анализы</h3>`;
  if(!vs.length)h+=`<div class="dim sm">Добавь последний визит к гинекологу - через год Луна напомнит записаться.</div>`;
  h+=previewList('visits',vs.map(({v,i})=>`<div class="ep"><span><b>${fmtShort(v.date)}.${String(parse(v.date).getFullYear()).slice(2)}</b> ${esc(v.type)}${v.note?`<div class="mut sm">${esc(v.note)}</div>`:''}</span><button class="linkbtn" style="margin:0" data-vdel="${i}" aria-label="Удалить визит">✕</button></div>`),3);
  return h+`<button class="btn small full" data-vadd style="margin-top:10px">+ Добавить визит</button></div>`;
}
function openVisit(){
  sheet(`<h2>Визит или анализ</h2><div class="chips" id="vt">${VTYPES.map((x,i)=>`<button class="chip ${i?'':'on'}" data-vt="${x}">${x}</button>`).join('')}</div>
  <label class="f" for="vd">Дата визита</label><input id="vd" type="date" value="${today()}">
  <label class="f" for="vn">Заметка</label><textarea id="vn" placeholder="что сказали, назначения, результаты"></textarea>
  <button class="btn main" id="ok" style="margin-top:16px">Добавить</button>`,(sh,close)=>{
    let tp=VTYPES[0];sh.querySelectorAll('[data-vt]').forEach(b=>b.onclick=()=>{tp=b.dataset.vt;sh.querySelectorAll('[data-vt]').forEach(x=>x.classList.toggle('on',x===b))});
    sh.querySelector('#ok').onclick=()=>{const d=sh.querySelector('#vd').value;if(!d){toast('Выбери дату');return}S.visits=S.visits||[];S.visits.push({date:d,type:tp,note:sh.querySelector('#vn').value.trim()});save();close();toast('Добавлено')};
  });
}

function bleedOwner(k){
  if(S.mode!=='pill'||P().inactive<1)return null;
  const pi=packInfo(k);if(!pi)return null;
  for(const q of [pi,packInfo(add(pi.start,-1))]){if(!q||q.skipped)continue;const d=diff(add(q.start,P().active-1+C().after),k);if(d>=0&&d<C().dur)return q.start}
  return null;
}
function forecast(n){
  const out=[],t=today(),end=add(t,300);let prev=predBleed(add(t,-1)),cnt=0;
  for(let k=t;k<=end&&cnt<n;k=add(k,1)){
    const pb=predBleed(k);if(pb&&!prev){out.push({t:'p',k});cnt++}prev=pb;
    if(S.mode==='pill'&&k>t){const pi=packInfo(k);if(pi&&pi.day===1)out.push({t:'n',k,sk:pi.skipped})}
  }
  return out;
}
function forecastCard(){
  const events=forecast(6).map(event=>`<div class="ep"><b>${fmtW(event.k)}</b><span>${event.t==='p'
    ?`Месячные · около ${C().dur} д.`
    :`Начало пачки${event.sk?' без перерыва':''}`}</span></div>`);
  return disclosure('stats-forecast','Вперёд',events.length
    ?`<p class="empty-note">Расчётные даты по текущим записям и схеме.</p>`+previewList('forecast',events,3)
    :'<p class="empty-note">Пока мало данных для прогноза.</p>',{open:true});
}
function planHits(pl){const d=[];for(let k=pl.from;k<=pl.to;k=add(k,1))if(predBleed(k)||((S.days[k]||{}).flow>1))d.push(k);return d}
function planFix(pl){
  if(S.mode!=='pill'||P().inactive<1)return null;
  const saved=JSON.stringify(P().skip||{});P().skip=P().skip||{};const packs=[];let ok=true;
  for(let g=0;g<5;g++){
    let hit=null;for(let k=pl.from;k<=pl.to;k=add(k,1))if(predBleed(k)){hit=k;break}
    if(!hit)break;const o=bleedOwner(hit);
    if(!o||add(o,P().active-1)<today()){ok=false;break}
    P().skip[o]=true;packs.push(o);
  }
  if(planHits(pl).length)ok=false;
  P().skip=JSON.parse(saved);return{packs,ok};
}
function plansCard(){
  const pls=(S.plans||[]).map((p,i)=>({p,i})).filter(x=>x.p.to>=today()).sort((a,b)=>a.p.from<b.p.from?-1:1);
  let h=`<div class="card care-card"><h3>${icon('calendar')} Важные даты</h3>`;
  if(!pls.length)h+=`<div class="dim sm">Добавьте даты, чтобы сравнить их с прогнозом месячных.</div>`;
  pls.forEach(({p,i})=>{
    const hits=planHits(p);
    h+=`<div class="plan-it"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><div><b>${esc(p.name||'Важные даты')}</b><div class="mut sm">${fmt(p.from)}${p.to!==p.from?' - '+fmt(p.to):''}</div></div><button class="linkbtn" style="margin:0" data-plan-del="${i}">удалить</button></div>`;
    if(!hits.length)h+=`<div class="sm" style="color:var(--ok);margin-top:6px">По прогнозу пересечения нет</div>`;
    else{
      h+=`<div class="sm" style="color:var(--warn);margin-top:6px">Возможное пересечение с месячными: ${fmtShort(hits[0])}${hits.length>1?' - '+fmtShort(hits[hits.length-1]):''}</div>`;
      const f=planFix(p);
      if(f&&f.packs.length&&f.ok)h+=`<button class="btn small full" style="margin-top:8px" data-plan-fix="${i}">🚫 Отменить месячные в ${f.packs.length===1?'пачке с '+fmt(f.packs[0]):'пачках с '+f.packs.map(fmtShort).join(', ')}</button>${f.packs.length>1?'<div class="dim sm" style="margin-top:4px">Несколько пачек подряд без перерыва лучше согласовать с гинекологом.</div>':''}`;
      else if(S.mode==='pill')h+=`<div class="dim sm" style="margin-top:4px">Сдвинуть уже не получится: эти месячные идут от пачки, активные таблетки которой закончились.</div>`;
    }
    h+=`</div>`;
  });
  return h+`<button class="btn small full" data-plan-add style="margin-top:10px">+ Добавить даты</button></div>`;
}
function openPlan(){
  const t=today();
  sheet(`<h2>Новые важные даты</h2><label class="f" for="pln">Название события</label><input id="pln" placeholder="например: отпуск в Сочи">
  <div class="row" style="flex-wrap:nowrap"><div style="flex:1"><label class="f" for="plf">Начало</label><input id="plf" type="date" value="${t}"></div><div style="flex:1"><label class="f" for="plt">Конец</label><input id="plt" type="date" value="${add(t,6)}"></div></div>
  <button class="btn main" id="ok" style="margin-top:16px">Добавить</button>`,(sh,close)=>{
    sh.querySelector('#ok').onclick=()=>{let f=sh.querySelector('#plf').value,to=sh.querySelector('#plt').value||f;if(!f){toast('Выбери даты');return}if(to<f)[f,to]=[to,f];
      S.plans=S.plans||[];S.plans.push({name:sh.querySelector('#pln').value.trim(),from:f,to});save();close();toast('Добавлено')};
  });
}
function spark(v){const mn=Math.min(...v),mx=Math.max(...v),r=mx-mn||1,W=300,H=50;const pts=v.map((x,i)=>`${(i/(v.length-1)*W).toFixed(1)},${(H-4-(x-mn)/r*(H-8)).toFixed(1)}`).join(' ');return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:50px;margin-top:10px"><polyline points="${pts}" fill="none" stroke="#ff6fa8" stroke-width="2.5" stroke-linejoin="round"/></svg>`}

/* ---------- обработчики ---------- */
function bindView(){
  const actions = {
    'metric-calendar':()=>changeTab('cal'),
    'metric-care':()=>changeTab('care'),
    'care-pets':()=>openDesign('pets'),
    'care-appearance':()=>openDesign('appearance'),
  };
  for(const [id, action] of Object.entries(actions)){const b=document.getElementById(id);if(b)b.onclick=action;}
  document.querySelectorAll('[data-mark]').forEach(b=>b.onclick=()=>markPill(b.dataset.mark));
  document.querySelectorAll('[data-unmark]').forEach(b=>b.onclick=()=>{const k=b.dataset.unmark,old=S.taken[k];delete S.taken[k];save();render();toast('Отметка снята',()=>{S.taken[k]=old;save();render()})});
  document.querySelectorAll('[data-help]').forEach(b=>b.onclick=()=>openHelp(b.dataset.help));
  document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>openDay(b.dataset.day));
  document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{const t=today();S.days[t]=S.days[t]||{};S.days[t].flow=Math.max(S.days[t].flow||0,3);save();render();toast('Отмечено: месячные начались')});
  document.querySelectorAll('[data-cont]').forEach(b=>b.onclick=()=>{const t=today(),y=S.days[add(t,-1)];S.days[t]=S.days[t]||{};S.days[t].flow=y&&y.flow?y.flow:2;save();render()});
  document.querySelectorAll('[data-end]').forEach(b=>b.onclick=()=>{const cp=curPeriod(today());if(cp){S.ended[cp.e.start]=true;save();render();toast('Отмечено, что закончились',()=>{delete S.ended[cp.e.start];save();render()})}});
  document.querySelectorAll('[data-reopen]').forEach(b=>b.onclick=()=>{const cp=curPeriod(today());if(cp){delete S.ended[cp.e.start];save();render()}});
  document.querySelectorAll('[data-cancel]').forEach(b=>{let arm=false;b.onclick=()=>{
    const cp=curPeriod(today());if(!cp)return;
    if(!arm){arm=true;b.textContent='Убрать отметки за весь период? Нажмите ещё раз';setTimeout(()=>{arm=false;b.textContent='Убрать отметки месячных'},4000);return}
    const e=cp.e,saved={};
    for(let k=e.start;k<=e.end;k=add(k,1))if(S.days[k]){saved[k]=S.days[k].flow;S.days[k].flow=0;clean(k)}
    const wasEnded=S.ended[e.start];delete S.ended[e.start];save();render();
    toast('Отметки убраны',()=>{for(const k in saved){S.days[k]=S.days[k]||{sym:[],note:''};S.days[k].flow=saved[k]}if(wasEnded)S.ended[e.start]=true;save();render()});
  }});
  document.querySelectorAll('[data-skip]').forEach(b=>armed(b,()=>{P().skip=P().skip||{};P().skip[b.dataset.skip]=true;save();render();toast('Месячные в этой пачке отменены',()=>{delete P().skip[b.dataset.skip];save();render()})}));
  document.querySelectorAll('[data-unskip]').forEach(b=>b.onclick=()=>{delete P().skip[b.dataset.unskip];save();render();toast('Перерыв вернулся')});
  document.querySelectorAll('[data-skipnow]').forEach(b=>armed(b,()=>{const t=today(),old=[...P().packs],st=P().stock;startPack(t);toast('Новая пачка с сегодня',()=>{P().packs=old;P().stock=st;save();render()})}));
  const pb=$('#petb');if(pb)pb.onclick=()=>openDesign('pets');apkBind();
  document.querySelectorAll('[data-brk]').forEach(b=>b.onclick=()=>{S.brk=S.brk||{};S.brk[b.dataset.brk]=true;save();render();toast('Хорошо, перерыв как обычно')});
  document.querySelectorAll('[data-dism]').forEach(b=>b.onclick=()=>{S.dism=S.dism||{};S.dism[b.dataset.dism]=1;save();render()});
  document.querySelectorAll('[data-vadd]').forEach(b=>b.onclick=openVisit);
  document.querySelectorAll('[data-vdel]').forEach(b=>armed(b,()=>{S.visits.splice(+b.dataset.vdel,1);save();render()}));
  document.querySelectorAll('[data-plan-add]').forEach(b=>b.onclick=()=>openPlan());
  document.querySelectorAll('[data-plan-del]').forEach(b=>armed(b,()=>{S.plans.splice(+b.dataset.planDel,1);save();render()}));
  document.querySelectorAll('[data-plan-fix]').forEach(b=>armed(b,()=>{const pl=S.plans[+b.dataset.planFix],f=planFix(pl);if(f&&f.packs.length){P().skip=P().skip||{};f.packs.forEach(x=>P().skip[x]=true);save();render();toast('Месячные отменены в '+f.packs.length+' '+plural(f.packs.length,'пачке','пачках','пачках'))}}));
  const np=$('#newpack');if(np)np.onclick=()=>startPack(today());
  const search=$('#nsearch');
  if(search){
    const more=$('#more-notes'), entries=[...document.querySelectorAll('.notes-list .nt')];
    const update=()=>{
      const query=notesQuery.trim().toLowerCase();
      for(const entry of entries){
        const show=query?entry.dataset.q.includes(query):notesExpanded||+entry.dataset.i<3;
        entry.hidden=!show;
        entry.classList.toggle('hide',!show);
      }
      $('#nnone').hidden=entries.some(entry=>!entry.hidden);
      if(more){
        more.hidden=!!query;
        more.textContent=notesExpanded?'Свернуть список':`Все заметки (${entries.length})`;
        more.setAttribute('aria-expanded',String(notesExpanded));
      }
    };
    search.oninput=()=>{notesQuery=search.value;update()};
    if(more)more.onclick=()=>{notesExpanded=!notesExpanded;update()};
    update();
  }
  const e2=$('#exp2');if(e2)e2.onclick=doctorSummary;
}
function armed(b,fn){let arm=false;const txt=b.innerHTML;b.onclick=()=>{if(!arm){arm=true;b.textContent='Точно? Нажми ещё раз';setTimeout(()=>{arm=false;b.innerHTML=txt},4000);return}fn()}}
function padsOf(e){let t=0;for(let x=e.start;x<=e.end;x=add(x,1))t+=(S.days[x]||{}).pads||0;return t}
function medNames(){const c={};Object.values(S.days).forEach(d=>(d.meds||[]).forEach(m=>c[m.n]=(c[m.n]||0)+1));return Object.keys(c).sort((a,b)=>c[b]-c[a]).slice(0,8)}
function symList(){return Array.isArray(S.symList)?S.symList:SYM}
const DAY_FIELDS=new Set(['flow','sym','note','mood','w','temp','pads','meds','sx']);
function clean(k){
  const d=S.days[k];if(!d)return;
  if(d.meds&&!d.meds.length)delete d.meds;
  if(!d.pads)delete d.pads;
  if(!d.sx)delete d.sx;
  if(!d.flow&&!d.sym?.length&&!d.note&&!d.mood&&!d.w&&!d.temp&&!d.meds&&!d.pads&&!d.sx&&Object.keys(d).every(name=>DAY_FIELDS.has(name)))delete S.days[k];
}
function markPill(k){
  S.taken[k]={at:new Date().toISOString()};save();
  const lh=lateH(k);render();
  if(packInfo(k)&&packInfo(k).active&&lh>=12)openHelp('miss');
  else toast('Отмечено ✓',()=>{delete S.taken[k];save();render()});
}
function startPack(k){
  P().packs=P().packs.filter(p=>p!==k);P().packs.push(k);P().packs.sort();
  if(P().stock!==null&&P().stock>0)P().stock--;
  save();render();toast('Новая пачка с '+fmt(k));
}

/* ---------- окна ---------- */
function sheet(html,onBind,{onClose,swipe=true}={}){
  const bg=document.createElement('div');bg.className='sheet-bg';
  const origin=document.activeElement;
  const originId=origin?.id;
  bg.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" tabindex="-1"><div class="grab" aria-hidden="true"></div>
    <button class="sheet-close icon-btn" aria-label="Закрыть окно">${icon('close')}</button>${html}</div>`;
  document.body.appendChild(bg);
  const sh=bg.firstChild, title=sh.querySelector('h1,h2');
  if(title){title.id||='sheet-title-'+document.querySelectorAll('.sheet-bg').length;sh.setAttribute('aria-labelledby',title.id)}
  const close=()=>{
    if(!bg.isConnected)return;
    bg.remove();onClose?.();render();
    const focusTarget=origin?.isConnected?origin:originId&&document.getElementById(originId);
    focusTarget?.focus?.({preventScroll:true});
  };
  sh.querySelector('.sheet-close').onclick=close;
  bg.addEventListener('click',e=>{if(e.target===bg)close()});
  // Focus stays in the topmost window, including when a second window covers settings.
  sh.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();close();return}
    if(event.key!=='Tab')return;
    const items=[...sh.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, a[href]')]
      .filter(item=>item.getClientRects().length&&!item.hidden&&item.tabIndex!==-1);
    if(!items.length){event.preventDefault();return}
    const index=items.indexOf(document.activeElement);
    if(event.shiftKey&&index<=0||!event.shiftKey&&(index<0||index===items.length-1)){
      event.preventDefault();items[event.shiftKey?items.length-1:0].focus();
    }
  });
  const grab=sh.querySelector('.grab');
  let y0=null,dy=0;
  grab.addEventListener('touchstart',e=>{if(swipe)y0=e.touches[0].clientY},{passive:true});
  grab.addEventListener('touchmove',e=>{if(y0===null)return;dy=e.touches[0].clientY-y0;if(dy>0)sh.style.transform=`translateY(${dy}px)`},{passive:true});
  const reset=()=>{sh.style.transform='';y0=null;dy=0};
  grab.addEventListener('touchend',()=>{if(dy>90)close();else reset()},{passive:true});
  grab.addEventListener('touchcancel',reset,{passive:true});
  sh.focus({preventScroll:true});
  onBind?.(sh,close);
  return close;
}

function openDay(k){
  const previous=S.days[k]||{};
  const dd=Object.assign({flow:0,sym:[],note:'',mood:'',pads:0,meds:[],w:0,temp:0,sx:false},previous);
  dd.sym=[...(dd.sym||[])];
  dd.meds=[...(dd.meds||[])];
  const pi=S.mode==='pill'?packInfo(k):null,cd=cycleDay(k);
  const rest=pi&&!pi.active&&P().type==='break';
  let taken=S.taken[k], pillChanged=false;
  const pill=pi?`<div id="day-pill" class="day-pill"></div>`:'';
  const html=`<h2>Запись · ${fmt(k)} ${parse(k).getFullYear()}</h2>
  ${cd?`<p class="mut sm day-cycle">День цикла ${cd}</p>`:''}${pill}
  <h4>Кровотечение</h4><div class="chips" id="fl">${FLOW.map((f,i)=>`<button class="chip flow-${i} ${dd.flow===i?'on':''}" aria-pressed="${dd.flow===i}" data-f="${i}">${f}</button>`).join('')}</div>
  <h4>Настроение</h4><div class="chips">${MOOD.map(m=>`<button class="chip ${dd.mood===m?'on':''}" aria-pressed="${dd.mood===m}" data-mo="${m}">${m}</button>`).join('')}</div>
  <h4>Симптомы</h4><div class="chips" id="sy">${[...symList(),...dd.sym.filter(x=>!symList().includes(x))].map(s=>`<button class="chip ${dd.sym.includes(s)?'on':''}" aria-pressed="${dd.sym.includes(s)}" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>
  <label class="f" for="nt">Заметка</label><textarea id="nt" placeholder="Что важно запомнить об этом дне?">${esc(dd.note||'')}</textarea>
  ${disclosure('day-extra','Дополнительные сведения',`
  <h4>Средства гигиены за день</h4><div class="row"><div class="step" id="padst"><button type="button" data-pd="-1" aria-label="Убрать одно средство">−</button><b id="padv">${dd.pads||0}</b><span class="mut">шт.</span><button type="button" data-pd="1" aria-label="Добавить одно средство">+</button></div><span class="dim sm">прокладки, тампоны, смены чаши</span></div>
  <h4>Обезболивающее</h4><div id="medl"></div>
  <div class="med-fields"><label>Название<input id="mdn" list="mdl" placeholder="Например, нурофен"></label><label>Время<input id="mdt" type="time"></label><button class="btn small" id="mda">Добавить препарат</button></div>
  <datalist id="mdl">${medNames().map(n=>`<option value="${esc(n)}">`).join('')}</datalist>
  <div class="day-measurements"><label>Вес, кг<input id="wt" type="number" step="0.1" min="20" max="250" inputmode="decimal" value="${esc(dd.w||'')}"></label>
  <label>Температура, °C<input id="tp" type="number" step="0.1" min="34" max="42" inputmode="decimal" value="${esc(dd.temp||'')}"></label></div>
  <label class="row day-intimacy"><input type="checkbox" id="sx" ${dd.sx?'checked':''}> Была близость без презерватива</label>
  <div class="dim sm">Учитывается в подсказках при пропуске таблетки.</div>
  ${S.mode==='pill'?`<button class="btn small day-new-pack" id="np">С этого дня начала новую пачку</button>`:''}
  `,{inline:true})}
  <div class="sheet-footer"><button class="btn main" id="ok">Сохранить запись</button></div>`;
  sheet(html,(sh,close)=>{
    const field=selector=>sh.querySelector(selector);
    const updatePressed=(button,active)=>{
      button.classList.toggle('on',active);button.setAttribute('aria-pressed',active);
    };
    const select=(selector,active)=>sh.querySelectorAll(selector).forEach(b=>updatePressed(b,active(b)));
    sh.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{dd.flow=+b.dataset.f;select('[data-f]',x=>x===b)});
    sh.querySelectorAll('[data-pd]').forEach(b=>b.onclick=()=>{dd.pads=Math.max(0,Math.min(30,(dd.pads||0)+ +b.dataset.pd));field('#padv').textContent=dd.pads});
    const medList=field('#medl');
    const drawMeds=()=>{
      medList.innerHTML=dd.meds.map((m,i)=>`<div class="kv"><span>${esc(m.n)}</span><span class="v">${esc(m.t||'')} <button data-mdx="${i}" aria-label="Удалить ${esc(m.n)}">✕</button></span></div>`).join('');
      medList.querySelectorAll('[data-mdx]').forEach(b=>b.onclick=()=>{dd.meds.splice(+b.dataset.mdx,1);drawMeds()});
    };
    drawMeds();field('#mdt').value=k===today()?new Date().toTimeString().slice(0,5):'';
    field('#mda').onclick=()=>{
      const name=field('#mdn').value.trim();if(!name){field('#mdn').focus();return}
      dd.meds.push({n:name,t:field('#mdt').value});field('#mdn').value='';drawMeds();
    };
    sh.querySelectorAll('[data-mo]').forEach(b=>b.onclick=()=>{
      dd.mood=dd.mood===b.dataset.mo?'':b.dataset.mo;select('[data-mo]',x=>x.dataset.mo===dd.mood);
    });
    sh.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{
      const symptom=b.dataset.s,index=dd.sym.indexOf(symptom);
      if(index<0)dd.sym.push(symptom);else dd.sym.splice(index,1);
      updatePressed(b,index<0);
    });
    const drawPill=()=>{
      const container=field('#day-pill');
      container.innerHTML=`<strong>${esc(P().name)}</strong><small>${rest?'День схемы':'Таблетка'} ${pi.day} из ${pi.len} · ${pi.active?'Активная':rest?'Перерыв':'Плацебо'}</small>
      ${rest?'':`<div class="row"><button class="btn small" id="pt" aria-pressed="${!!taken}">${taken?'✓ Снять отметку':'Выпила'}</button>
      ${taken?`<label class="day-pill-time">Время приёма<input type="time" id="ptm" value="${new Date(taken.at).toTimeString().slice(0,5)}"></label>`:`<small>По плану в ${P().time}</small>`}</div>`}`;
      const button=field('#pt');
      if(button)button.onclick=()=>{
        taken=taken?undefined:{at:(k===today()?new Date():schedAt(k)).toISOString()};
        pillChanged=true;drawPill();field('#pt').focus({preventScroll:true});
      };
      const time=field('#ptm');
      if(time)time.onchange=()=>{
        if(!time.value){time.value=new Date(taken.at).toTimeString().slice(0,5);return}
        const[h,m]=time.value.split(':').map(Number);
        const old=new Date(taken.at), changed=parse(k);
        changed.setHours(h,m,0,0);
        if(old.getDate()!==changed.getDate()&&old>changed&&h<12)changed.setDate(changed.getDate()+1);
        taken={...taken,at:changed.toISOString()};pillChanged=true;
      };
    };
    if(pi)drawPill();
    const store=()=>{
      dd.note=field('#nt').value.trim();
      const weight=parseFloat(field('#wt').value), temp=parseFloat(field('#tp').value);
      dd.w=weight>0?Math.round(weight*10)/10:0;
      dd.temp=temp>0?temp:0;
      dd.sx=field('#sx').checked;
      const record={...S.days[k]};
      const defaults={flow:0,sym:[],note:'',mood:'',w:0,temp:0,pads:0,meds:[],sx:false};
      for(const [name,defValue] of Object.entries(defaults)){
        if(!m3eq(dd[name],previous[name]??defValue))record[name]=dd[name];
      }
      if(Object.keys(record).length){S.days[k]=record;clean(k)}
      if(pillChanged){
        if(taken)S.taken[k]=taken;
        else delete S.taken[k];
      }
    };
    const start=field('#np');
    if(start)start.onclick=()=>{store();startPack(k);close()};
    field('#ok').onclick=()=>{store();save();close();toast('Запись сохранена')};
    sh.classList.add('day-editor');
    bindDisclosures(sh);
  });
}

function openHelp(which){
  const miss=`<h2>Если пропустила таблетку</h2><div class="help">
  <p><b>Главное - открой инструкцию именно к своей пачке</b>: правила у разных КОК немного отличаются. Ниже - общая схема для большинства комбинированных таблеток.</p>
  <p><b>Опоздание меньше 12 часов</b> - выпей, как только вспомнила, следующую - в обычное время. Защита сохраняется.</p>
  <p><b>Опоздание больше 12 часов</b> - выпей последнюю пропущенную сразу, даже если это 2 таблетки в один день. Дальше - как обычно. Следующие 7 дней нужна дополнительная защита (презерватив). Что ещё делать, зависит от недели:</p>
  <ul><li><b>1-я неделя</b> (дни 1-7): если в предыдущие 7 дней был секс без презерватива - есть риск беременности, лучше написать гинекологу.</li>
  <li><b>2-я неделя</b> (дни 8-14): если до этого 7 дней пила без пропусков, обычно доп. защита не нужна.</li>
  <li><b>3-я неделя</b> (дни 15-21): часто советуют не делать перерыв / не пить плацебо, а сразу начать новую пачку. Сверься с инструкцией.</li></ul>
  <p><b>Пропустила плацебо</b> - не страшно, просто выбрось пропущенную и продолжай.</p>
  <p><b>Рвота или сильный понос в первые 3-4 часа после таблетки</b> - считается, как будто таблетку не выпила.</p>
  <p class="dim">Это не замена врачу. Если сомневаешься - звони/пиши гинекологу.</p></div>`;
  const gen=`<h2>Как пользоваться</h2><div class="help">
  <p>💊 <b>Каждый вечер</b> жми "Выпила" на главной. Кольцо показывает всю пачку: розовым - выпитые, красным - пропуски, серым - ${P().type==='break'?'перерыв':'плацебо'}.</p>
  <p>🩸 <b>Месячные</b>: жми "Начались сегодня", потом каждый день приложение спросит, идут ли ещё. Прошлые дни можно отметить в календаре. Длину цикла и месячных меняй в настройках ⚙︎.</p>
  <p>🚫 <b>Отменить месячные</b>: на карточке таблеток нажми "Отменить месячные в этой пачке" - после последней активной сразу начнётся новая пачка, без плацебо.</p>
  <p>📦 <b>Новая пачка</b> начинается сама после последней таблетки. Если начала раньше или позже - открой этот день в календаре и нажми "С этого дня начала новую пачку".</p>
  <p>⏰ <b>Напоминание.</b> ${APP?'Уведомления о таблетке и месячных включаются в настройках ⚙︎ → "Уведомления".':'В браузере Луна не умеет будить телефон, поэтому поставь обычный будильник на '+P().time+'. В приложении для Android (apk) будут настоящие уведомления.'}</p>
  <p>🔒 <b>Данные</b> хранятся на устройстве. Подключите Яндекс Диск в настройках, если нужна синхронизация.</p>
  <p>Почему нет "овуляции" и "фертильных дней": на КОК овуляции нет, и такие прогнозы только путают.</p>
  <button class="btn full" id="tomiss" style="margin-top:8px">Что делать при пропуске</button></div>`;
  sheet(which==='miss'?miss:gen,(sh,close)=>{const b=sh.querySelector('#tomiss');if(b)b.onclick=()=>{close();openHelp('miss')}});
}

function skipBtn(pi,t){
  if(P().inactive<1)return '';
  if(pi.skipped)return `<div class="skipnote">🚫 Месячные отменены: после ${pi.len}-й таблетки сразу новая пачка <button class="linkbtn" style="display:inline;margin:0 0 0 4px" data-unskip="${pi.start}">вернуть перерыв</button></div>`;
  if(pi.active)return `<button class="btn full" data-skip="${pi.start}">🚫 Отменить месячные в этой пачке</button><div class="dim sm" style="text-align:center;margin-top:-6px">пропустить ${P().type==='placebo'?'плацебо':'перерыв'} и начать новую пачку ${fmt(add(pi.start,P().active))}</div>`;
  return `<button class="btn full" data-skipnow>🚫 Отменить месячные - начать новую пачку сегодня</button>`;
}
function stepper(id,v,min,max,unit){return `<div class="step" data-id="${id}" data-min="${min}" data-max="${max}"><button type="button" data-d="-1">−</button><b>${v}</b><span class="mut">${unit}</span><button type="button" data-d="1">+</button></div>`}
function bindSteppers(root,obj,units){root.querySelectorAll('.step').forEach(st=>st.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const id=st.dataset.id;obj[id]=Math.min(+st.dataset.max,Math.max(+st.dataset.min,obj[id]+ +b.dataset.d));st.querySelector('b').textContent=obj[id];if(units[id])st.querySelector('span').textContent=units[id](obj[id])}))}
const U={len:n=>plural(n,'день','дня','дней'),dur:n=>plural(n,'день','дня','дней'),after:n=>plural(n,'день','дня','дней')};
function cycBlock(mode,c){
  let h=`<h4>Цикл и месячные</h4>`;
  h+=`<div class="${mode==='natural'?'':'hide'}" data-for="natural"><label class="f">Длина цикла (от начала одних месячных до начала следующих)</label>${stepper('len',c.len,18,45,U.len(c.len))}
  <label class="row" style="margin-top:10px;gap:10px;font-size:14px"><input type="checkbox" id="cauto" ${c.auto?'checked':''} style="width:20px;height:20px"> Подстраивать по моей истории, когда наберётся 2+ цикла${natural().hist?' (сейчас в среднем '+natural().hist+')':''}</label></div>`;
  h+=`<div class="${mode==='pill'?'':'hide'} dim sm" data-for="pill" style="margin-top:6px">На КОК цикл = одна пачка (${L()} дней), поэтому длину цикла задаёт схема ниже.</div>`;
  h+=`<label class="f">Месячные длятся</label>${stepper('dur',c.dur,1,10,U.dur(c.dur))}`;
  h+=`<div class="${mode==='pill'?'':'hide'}" data-for="pill"><label class="f">Начинаются через ... после последней активной таблетки</label>${stepper('after',c.after,1,6,U.after(c.after))}</div>`;
  return h;
}
function openSettings(){
  const p=P();const pi=packInfo(today());const c=Object.assign({},C());
  const html=`<h2>Настройки</h2>
  <div class="settings-links"><button class="btn" id="open-pets">${icon('heart')} Питомец ${icon('chevron')}</button><button class="btn" id="open-appearance">${icon('moon')} Оформление ${icon('chevron')}</button></div>
  <div class="seg" id="mode"><button data-m="pill" class="${S.mode==='pill'?'on':''}">Пью КОК</button><button data-m="natural" class="${S.mode==='natural'?'on':''}">Без таблеток</button></div>
  ${cycBlock(S.mode,c)}
  <div id="pillset" class="${S.mode==='pill'?'':'hide'}">
    <h4>Таблетки</h4>
    <label class="f" for="pn">Название препарата</label><input id="pn" value="${esc(p.name)}">
    <label class="f" for="ps">Схема приёма</label><select id="ps">${PRESETS.map(x=>`<option value="${x.id}" ${p.preset===x.id?'selected':''}>${x.name} - ${x.hint}</option>`).join('')}<option value="custom" ${p.preset==='custom'?'selected':''}>Своя</option></select>
    <div id="cust" class="row ${p.preset==='custom'?'':'hide'}" style="margin-top:8px"><input id="ca" type="number" min="1" max="120" value="${p.active}" style="width:90px"> <span class="mut">активных +</span> <input id="ci" type="number" min="0" max="14" value="${p.inactive}" style="width:80px"> <select id="ct" style="width:auto"><option value="placebo" ${p.type==='placebo'?'selected':''}>плацебо</option><option value="break" ${p.type==='break'?'selected':''}>перерыв</option></select></div>
    <label class="f" for="pt">Время приёма</label><input id="pt" type="time" value="${p.time}">
    <label class="f" for="pd">Номер сегодняшней таблетки в пачке</label><input id="pd" type="number" min="1" max="${L()}" value="${pi?pi.day:1}">
    <div class="dim sm" style="margin-top:4px">Если сбилось - поправь число, пачка пересчитается.</div>
    <label class="f" for="pk">Пачек в запасе (необязательно)</label><input id="pk" type="number" min="0" max="50" value="${p.stock===null?'':p.stock}">
  </div>
  <h4>Синхронизация</h4><div id="ydbox">${ydBox()}</div>
  ${notifBox()}
  <h4>Мой список самочувствия</h4>
  <div class="chips" id="syl"></div>
  <div class="row" style="margin-top:8px;flex-wrap:nowrap"><input id="sya" aria-label="Название симптома" placeholder="Например, спина"><button class="btn small" id="syb">Добавить</button></div>
  <h4>Код-пароль</h4><div id="pinbox"></div>
  <h4>Перенос из "Мой календарь"</h4>
  <div class="dim sm">Там: Настройки → Резервная копия и восстановление → сохранить копию на телефон. Потом выбери этот файл тут. Перенесутся месячные, заметки, вес и температура. То, что уже есть в Луне, не сотрётся.</div>
  <div class="row" style="margin-top:8px"><button class="btn small" id="pcb">📥 Выбрать файл копии</button><input type="file" id="pcf" class="hide"></div>
  <h4>Копия данных</h4>
  <div class="row"><button class="btn small" id="ex">Скачать копию</button><button class="btn small" id="exc">Скопировать копию</button><button class="btn small" id="im">Загрузить копию</button><input type="file" id="imf" accept=".json,application/json,text/plain" class="hide"></div>
  <details style="margin-top:8px"><summary class="dim sm">Вставить копию текстом</summary><textarea id="imt" placeholder="вставь сюда скопированную копию"></textarea><button class="btn small" id="imtb" style="margin-top:6px">Загрузить из текста</button></details>
  <button class="linkbtn" id="settings-help">Подсказки по приложению</button>
  <h4>&nbsp;</h4><button class="btn small danger" id="rs">Стереть всё</button>
  <button class="btn main" id="ok" style="margin-top:18px">Сохранить</button>`;
  sheet(html,(sh,close)=>{
    let mode=S.mode;
    bindSteppers(sh,c,U);
    sh.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mode=b.dataset.m;sh.querySelectorAll('[data-m]').forEach(x=>x.classList.toggle('on',x===b));sh.querySelector('#pillset').classList.toggle('hide',mode!=='pill');sh.querySelectorAll('[data-for]').forEach(x=>x.classList.toggle('hide',x.dataset.for!==mode))});
    sh.querySelector('#ps').onchange=e=>sh.querySelector('#cust').classList.toggle('hide',e.target.value!=='custom');
    sh.querySelector('#ex').onclick=exportData;
    bindYdBox(sh);
    const sl=[...symList()];
    const drawSy=()=>{sh.querySelector('#syl').innerHTML=sl.map((x,i)=>`<span class="chip">${esc(x)} <button data-sx="${i}" aria-label="Удалить симптом ${esc(x)}" style="color:var(--mut);margin-left:4px">✕</button></span>`).join('')||'<span class="dim sm">пусто</span>';
      sh.querySelectorAll('[data-sx]').forEach(b=>b.onclick=()=>{sl.splice(+b.dataset.sx,1);S.symList=[...sl];saveLocal();save();drawSy()})};
    drawSy();
    const addSy=()=>{const v=sh.querySelector('#sya').value.trim();if(!v)return;if(!sl.includes(v))sl.push(v);S.symList=[...sl];save();sh.querySelector('#sya').value='';drawSy()};
    sh.querySelector('#syb').onclick=addSy;sh.querySelector('#sya').onkeydown=e=>{if(e.key==='Enter')addSy()};
    drawPinBox(sh);bindNotif(sh);
    sh.querySelector('#settings-help').onclick=()=>{close();openHelp()};
    sh.querySelector('#open-pets').onclick=()=>openDesign('pets',sh);
    sh.querySelector('#open-appearance').onclick=()=>openDesign('appearance',sh);
    sh.querySelector('#pcb').onclick=()=>sh.querySelector('#pcf').click();
    sh.querySelector('#pcf').onchange=e=>importPC(e.target.files[0],close);
    sh.querySelector('#exc').onclick=()=>{const t=JSON.stringify(S);try{navigator.clipboard.writeText(t).then(()=>toast('Копия в буфере - вставь её себе в Избранное в телеграме'),()=>toast('Не получилось скопировать'))}catch(e){toast('Не получилось скопировать')}};
    sh.querySelector('#im').onclick=()=>sh.querySelector('#imf').click();
    sh.querySelector('#imf').onchange=e=>importData(e.target.files[0],close);
    sh.querySelector('#imtb').onclick=()=>loadText(sh.querySelector('#imt').value,close);
    let rsArm=false;sh.querySelector('#rs').onclick=e=>{if(!rsArm){rsArm=true;e.target.textContent='Точно стереть всё? Нажми ещё раз';setTimeout(()=>{rsArm=false;e.target.textContent='Стереть всё'},4000);return}S=def();save();close()};
    sh.querySelector('#ok').onclick=()=>{
      S.mode=mode;c.auto=sh.querySelector('#cauto').checked;S.cyc=c;
      if(mode==='pill'){
        p.name=sh.querySelector('#pn').value.trim()||'КОК';
        const pr=sh.querySelector('#ps').value;p.preset=pr;
        if(pr==='custom'){p.active=Math.max(1,+sh.querySelector('#ca').value||21);p.inactive=Math.max(0,+sh.querySelector('#ci').value||0);p.type=sh.querySelector('#ct').value}
        else{const x=PRESETS.find(z=>z.id===pr);p.active=x.active;p.inactive=x.inactive;p.type=x.type}
        p.time=sh.querySelector('#pt').value||'21:00';
        const day=Math.min(L(),Math.max(1,+sh.querySelector('#pd').value||1));
        const cur=packInfo(today());
        if(!cur||cur.day!==day){const st=add(today(),-(day-1));p.packs=p.packs.filter(x=>x<st);p.packs.push(st)}
        const sv=sh.querySelector('#pk').value;p.stock=sv===''?null:Math.max(0,+sv);
      }
      save();close();toast('Сохранено');
    };
  });
}

function setupView(){
  return `<header><h1><span>☾</span> Луна</h1></header>
  <div class="card"><h2 style="margin:0 0 6px">Привет!</h2><p class="mut" style="margin:0 0 14px">Пара вопросов - и можно пользоваться. Всё хранится только на этом телефоне.</p>
  <div class="seg" id="mode"><button data-m="pill" class="on">Пью КОК</button><button data-m="natural">Без таблеток</button></div>
  <div id="sp">
    <label class="f">Какие таблетки?</label><input id="pn" value="Ярина Плюс">
    <label class="f" for="ps">Схема приёма</label><select id="ps">${PRESETS.map(x=>`<option value="${x.id}">${x.name} - ${x.hint}</option>`).join('')}</select>
    <label class="f">Во сколько пьёшь?</label><input id="pt" type="time" value="21:00">
    <label class="f">Какую по счёту таблетку пьёшь сегодня?</label><input id="pd" type="number" min="1" max="28" value="1">
    <div class="dim sm" style="margin-top:4px">Посмотри на пачку: номер сегодняшней (даже если ещё не выпила)</div>
    <label class="row" style="margin-top:12px;gap:10px;font-size:15px"><input type="checkbox" id="prev" checked style="width:20px;height:20px"> Предыдущие таблетки этой пачки выпиты</label>
  </div>
  <div id="sn" class="hide">
    <label class="f">Когда начались последние месячные?</label><input id="ls" type="date" value="${today()}">
  </div>
  ${cycBlock('pill',S.cyc)}
  <button class="btn main" id="go" style="margin-top:18px">Начать</button></div>
  ${YD.cid?`<div class="card" style="text-align:center"><div class="mut sm">Уже пользуешься Луной на другом устройстве?</div>${ydOn()?`<div class="sm" style="margin-top:6px">${YD.st==='err'?esc(YD.msg):'Загружаю данные из Яндекс Диска…'}</div>`:'<button class="btn small" id="ydin" style="margin-top:8px">Войти через Яндекс</button>'}</div>`:''}`;
}
function bindSetup(){
  let mode='pill';const c=S.cyc;bindSteppers($('#app'),c,U);const yi=$('#ydin');if(yi)yi.onclick=ydLogin;
  document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mode=b.dataset.m;document.querySelectorAll('[data-m]').forEach(x=>x.classList.toggle('on',x===b));$('#sp').classList.toggle('hide',mode!=='pill');$('#sn').classList.toggle('hide',mode==='pill');document.querySelectorAll('[data-for]').forEach(x=>x.classList.toggle('hide',x.dataset.for!==mode))});
  $('#go').onclick=()=>{
    S.mode=mode;c.auto=$('#cauto').checked;
    if(mode==='pill'){const p=P();p.name=$('#pn').value.trim()||'КОК';const x=PRESETS.find(z=>z.id===$('#ps').value);Object.assign(p,{preset:x.id,active:x.active,inactive:x.inactive,type:x.type});p.time=$('#pt').value||'21:00';
      const day=Math.min(L(),Math.max(1,+$('#pd').value||1));p.packs=[add(today(),-(day-1))];if($('#prev').checked)for(let i=1;i<day;i++){const k=add(today(),-i);if(packInfo(k).active||P().type==='placebo')S.taken[k]={at:schedAt(k).toISOString()}}}
    else{const ls=$('#ls').value,ll=c.dur;if(ls)for(let i=0;i<ll;i++){const k=add(ls,i);if(k<=today())S.days[k]={flow:i<2?3:2,sym:[],note:''}}}
    S.setup=true;S.since=today();save();render();
  };
}

function hash(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)}
function pickBy(arr,seed){return arr[hash(seed)%arr.length]}
function petSay(t){
  const now=new Date(),h=now.getHours(),pi=S.mode==='pill'?packInfo(t):null,cp=curPeriod(t),seed=t+h;
  if(h<7)return{m:'sleep',s:'Zzz… спокойной ночи 🌙'};
  if(cp&&cp.today)return{m:'cozy',s:pickBy(['Грелку уже нагрела 🫖',`${cp.day}-й день. Я рядом 💗`,'Сегодня можно помедленнее','Плед, чай и сериал?','Обнимаю вместе с грелкой'],seed)};
  if(pi&&pi.active&&!S.taken[t]){const late=(now-schedAt(t))/36e5;if(late>=0)return{m:'idle',s:`Таблетка ждёт 💊 (было в ${P().time})`};if(late>-3)return{m:'idle',s:`Таблетка сегодня в ${P().time} 💊`}}
  if(pi&&S.taken[t])return{m:'happy',s:pickBy(['Таблетка выпита ✨','Галочка на месте!','Отмечено, молодец 💊','Всё по плану ✨'],seed)};
  const ns=nextBleedStart(t);if(ns){const d=diff(t,ns);if(d>=1&&d<=3)return{m:'idle',s:`Через ${d} ${plural(d,'день','дня','дней')} месячные. Запасы на месте?`}}
  if(h>=23)return{m:'sleep',s:'Пора баиньки 🌙'};
  const cd=cycleDay(t);
  return{m:'idle',s:pickBy([cd?`День цикла ${cd}. Всё спокойно 🌙`:'Привет! 🌙','Я тут 🐾','Как ты сегодня?',h<12?'Доброе утро ☀️':'Хорошего вечера ✨'],seed)};
}
/* ---------- приложение для Android (apk): уведомления и цвет полосок ---------- */
const APP=!!(window.AndroidApp&&window.AndroidApp.setSchedule);
function nativeSchedule(){
  if(!APP||!S.setup)return;
  const N=Object.assign({pill:true,again:true,period:true,last:true},S.notif||{}),out=[],t=today(),now=Date.now();
  for(let i=0;i<30;i++){
    const k=add(t,i);
    if(S.mode==='pill'){
      const pi=packInfo(k);
      if(pi&&pi.active&&!S.taken[k]){
        const at=schedAt(k).getTime();
        if(N.pill&&at>now)out.push({id:'p'+k,at,title:'Таблетка 💊',text:P().name+' - пора выпить. Нажми, чтобы отметить'});
        if(N.pill&&N.again&&at+2*36e5>now)out.push({id:'p2'+k,at:at+2*36e5,title:'Таблетка ещё ждёт 💊',text:'Если уже выпила - отметь в Луне. До 12 часов опоздания - не страшно'});
      }
      if(N.last&&pi&&pi.active&&!pi.skipped&&P().inactive>0&&pi.day===P().active&&!(S.brk||{})[pi.start]){const d=parse(k);d.setHours(12,0,0,0);if(+d>now)out.push({id:'l'+k,at:+d,title:'Сегодня последняя активная таблетка',text:'Делаем перерыв или отменяем месячные?'})}
    }
    if(N.period&&predBleed(add(k,1))&&!predBleed(k)&&!(S.days[k]||{}).flow){const d=parse(k);d.setHours(10,0,0,0);if(+d>now)out.push({id:'b'+k,at:+d,title:'Завтра месячные 🩸',text:'Проверь запас прокладок и обезболивающего'})}
  }
  try{AndroidApp.setSchedule(JSON.stringify(out))}catch(e){}
}
function notifBox(){
  if(!APP)return '';
  const N=Object.assign({pill:true,again:true,period:true,last:true},S.notif||{});
  let ok=true;try{ok=AndroidApp.notificationsAllowed()}catch(e){}
  const cb=(k,txt)=>`<label class="row" style="gap:10px;margin-top:8px;font-size:15px;flex-wrap:nowrap"><input type="checkbox" data-nf="${k}" ${N[k]?'checked':''} style="width:20px;height:20px;flex:none"> ${txt}</label>`;
  return `<h4>📱 Приложение</h4><div class="sm">Версия ${apkCur()||'?'}${apkLatest()>apkCur()?` · есть новая ${apkLatest()}`:''}</div><div class="row" style="margin-top:6px"><button class="btn small" id="apkchk">Проверить обновление</button>${apkLatest()>apkCur()?`<a class="btn small" href="${APKURL}" style="text-decoration:none">Скачать</a>`:''}</div>
  <h4>🔔 Уведомления</h4>${ok?'':'<div class="sm" style="color:var(--warn)">Android пока не разрешил Луне уведомления. <button class="btn small" id="nfask" style="margin-top:6px">Разрешить</button></div>'}
  ${S.mode==='pill'?cb('pill','Таблетка - в '+P().time+' (время меняется выше)')+cb('again','Повторить через 2 часа, если не отмечена')+cb('last','Последняя активная: перерыв или отменить месячные?'):''}
  ${cb('period','За день до месячных')}
  <div class="dim sm" style="margin-top:6px">На заблокированном экране видно только "Луна", без подробностей.</div>`;
}
function bindNotif(sh){
  const c=sh.querySelector('#apkchk');if(c)c.onclick=()=>apkCheck(true);
  sh.querySelectorAll('[data-nf]').forEach(c=>c.onchange=()=>{S.notif=Object.assign({},S.notif||{},{[c.dataset.nf]:c.checked});save()});
  const a=sh.querySelector('#nfask');if(a)a.onclick=()=>{try{AndroidApp.askNotifications()}catch(e){}toast('Подтверди в окне Android')};
}
if(APP){try{AndroidApp.setBars('#211631')}catch(e){}}
/* новая версия apk: раз в день (после 10:00) смотрим номер сборки в Releases и сравниваем со своим */
const APKURL='https://github.com/sofaleya/luna/releases/latest/download/luna.apk';
function apkCur(){try{return +AndroidApp.versionCode()||0}catch(e){return 0}}
function apkLatest(){try{return +localStorage.getItem('luna-apklast')||0}catch(e){return 0}}
function apkCheck(force){
  if(!APP)return;
  try{const ts=+localStorage.getItem('luna-apkchk')||0,n=new Date();let mk=new Date(n.getFullYear(),n.getMonth(),n.getDate(),10).getTime();if(+n<mk)mk-=864e5;if(ts>=mk&&!force)return;localStorage.setItem('luna-apkchk',String(Date.now()))}catch(e){return}
  fetch('https://api.github.com/repos/sofaleya/luna/releases/tags/apk').then(r=>r.ok?r.json():null).then(j=>{
    const m=j&&String(j.body||'').match(/№(\d+)/);if(!m)return;
    try{localStorage.setItem('luna-apklast',m[1])}catch(e){}
    if(+m[1]>apkCur()){if(!document.querySelector('.sheet-bg'))render();if(force)toast('Есть новая версия!')}else if(force)toast('У тебя последняя версия ✓')
  }).catch(()=>{if(force)toast('Не получилось проверить - нет связи')});
}
function apkNote(){
  if(!APP)return '';const lt=apkLatest();let skip=0;try{skip=+localStorage.getItem('luna-apkskip')||0}catch(e){}
  if(!lt||lt<=apkCur()||skip>=lt)return '';
  const synced=ydOn()&&YD.st==='ok';
  const step1=synced?'<div class="sm">1. Данные уже в Яндекс Диске ✓</div>':`<div class="sm">1. На всякий случай сохрани копию данных:</div><div class="row" style="margin-top:6px"><button class="btn small" id="apkbk">Сохранить копию</button></div>`;
  return `<div class="alert info"><b>Есть новая версия Луны</b>${step1}<div class="sm" style="margin-top:8px">2. Скачай и открой файл, нажми "Установить". Удалять старую не нужно: встанет поверх, данные останутся.</div><div class="row"><a class="btn small" href="${APKURL}" style="text-decoration:none;color:var(--rose)">Скачать новую версию</a><button class="btn small" id="apklater">Позже</button></div></div>`;
}
function apkBind(){
  const b=document.getElementById('apkbk');if(b)b.onclick=exportData;
  const l=document.getElementById('apklater');if(l)l.onclick=()=>{try{localStorage.setItem('luna-apkskip',String(apkLatest()))}catch(e){}render()};
}

/* ---------- синхронизация через Яндекс Диск ----------
   Данные лежат у самой хозяйки: "Приложения/Луна" на её Диске. Приложение видит только эту папку.
   Один файл luna.json + копии по дням в папке "Копии" (последние 14). */
const YD={cid:'d7394ecf458b4e3da60b81e8220107bb',redir:'https://sofaleya.github.io/luna/',api:'https://cloud-api.yandex.net/v1/disk/resources',file:'app:/luna.json',dir:'app:/Копии',key:'luna-yd',bkey:'luna-yd-base',busy:false,again:false,t:null,st:'',msg:''};
function ydGet(){try{return JSON.parse(localStorage.getItem(YD.key)||'{}')||{}}catch(e){return{}}}
function ydSet(p){const m=ydGet();for(const k in p){if(p[k]===undefined)delete m[k];else m[k]=p[k]}try{localStorage.setItem(YD.key,JSON.stringify(m))}catch(e){}return m}
function ydOn(){return !!(YD.cid&&ydGet().tok)}
function ydBase(){try{const t=localStorage.getItem(YD.bkey);return t?JSON.parse(t):undefined}catch(e){return undefined}}
function ydBaseSet(d){try{localStorage.setItem(YD.bkey,JSON.stringify(d))}catch(e){}}
(function(){const h=location.hash||'';if(h.indexOf('access_token=')<0&&h.indexOf('error=')<0)return;
  const q=new URLSearchParams(h.slice(1));try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
  if(q.get('access_token')){ydSet({tok:q.get('access_token'),exp:Date.now()+(+q.get('expires_in')||31536000)*1000,mod:undefined,sent:undefined});YD.justIn=true}
  else YD.msg='Яндекс не дал доступ'+(q.get('error')==='access_denied'?': вход отменён':'')})();
function ydLogin(){location.href='https://oauth.yandex.ru/authorize?response_type=token&client_id='+YD.cid+'&redirect_uri='+encodeURIComponent(YD.redir)+'&force_confirm=yes'}
function ydOff(){try{localStorage.removeItem(YD.key);localStorage.removeItem(YD.bkey)}catch(e){}YD.st='';render()}
function ydReq(method,url){return fetch(url,{method,headers:{Authorization:'OAuth '+ydGet().tok}}).then(r=>{if(r.status===401){ydSet({tok:undefined,mod:undefined});YD.msg='Вход в Яндекс устарел, войди заново';throw{code:401}}return r})}
function ydOk(r){if(!r.ok)throw{code:r.status};return r}
function ydMeta(){return ydReq('GET',YD.api+'?fields=modified&path='+encodeURIComponent(YD.file)).then(r=>r.status===404?null:ydOk(r).json())}
function ydDownload(){return ydReq('GET',YD.api+'/download?path='+encodeURIComponent(YD.file)).then(r=>ydOk(r).json()).then(j=>fetch(j.href,{credentials:'omit',referrerPolicy:'no-referrer'})).then(r=>ydOk(r).text()).then(t=>{try{return JSON.parse(t)}catch(e){throw{code:'bad'}}})}
function ydUpload(path,text){return ydReq('GET',YD.api+'/upload?overwrite=true&path='+encodeURIComponent(path)).then(r=>ydOk(r).json()).then(j=>fetch(j.href,{method:'PUT',body:new Blob([text],{type:'application/json'})})).then(ydOk)}
async function ydDaily(day){
  await ydReq('PUT',YD.api+'?path='+encodeURIComponent(YD.dir)).then(r=>{if(r.status!==409)ydOk(r)});
  await ydReq('POST',YD.api+'/copy?overwrite=true&from='+encodeURIComponent(YD.file)+'&path='+encodeURIComponent(YD.dir+'/luna-'+day+'.json')).then(ydOk);
  const r=await ydReq('GET',YD.api+'?limit=200&sort=name&fields=_embedded.items.name,_embedded.items.path&path='+encodeURIComponent(YD.dir)).then(r=>ydOk(r).json());
  const it=((r._embedded&&r._embedded.items)||[]).filter(x=>/^luna-\d{4}-\d\d-\d\d\.json$/.test(x.name));
  for(let i=0;i<it.length-14;i++){try{await ydReq('DELETE',YD.api+'?permanently=true&path='+encodeURIComponent(it[i].path))}catch(e){}}
}
/* склейка: b - что было в Диске при прошлой синхронизации, l - этот телефон, r - Диск сейчас */
const m3eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const m3obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const m3prims=a=>Array.isArray(a)&&a.every(x=>x===null||typeof x!=='object');
function merge3(b,l,r){
  if(m3eq(l,r))return l;if(m3eq(b,l))return r;if(m3eq(b,r))return l;
  if(l===undefined)return r;if(r===undefined)return l;
  if(m3obj(l)&&m3obj(r)){const bo=m3obj(b)?b:{},o={};for(const k of new Set([...Object.keys(r),...Object.keys(l)])){const v=merge3(bo[k],l[k],r[k]);if(v!==undefined)o[k]=v}return o}
  if(m3prims(l)&&m3prims(r)){const bs=m3prims(b)?b.map(String):[],ls=l.map(String),rs=r.map(String),res=[],had={};
    for(const x of [...l,...r]){const k=String(x);if(had[k])continue;had[k]=1;if(bs.includes(k)&&(!ls.includes(k)||!rs.includes(k)))continue;res.push(x)}return res}
  return l;
}
async function ydPush(){
  const chg=ydGet().chg||0;
  await ydUpload(YD.file,JSON.stringify({v:1,app:'luna',savedAt:Date.now(),data:S}));
  const meta=await ydMeta();ydSet({mod:meta&&meta.modified,sent:chg});ydBaseSet(S);
  const day=today();if(ydGet().daily!==day){try{await ydDaily(day);ydSet({daily:day})}catch(e){}}
}
async function ydSync(loud){
  if(!ydOn())return;if(YD.busy){YD.again=true;return}
  YD.busy=true;YD.st='wait';ydBadge();
  try{
    const m=ydGet(),meta=await ydMeta();
    if(meta&&meta.modified!==m.mod){
      const r=await ydDownload();if(!r||!r.data||!r.data.pill||!r.data.days)throw{code:'bad'};
      const mine=JSON.parse(JSON.stringify(S));
      const merged=!S.setup?r.data:merge3(m.mod?ydBase():undefined,mine,r.data);
      if(!m3eq(merged,mine)){S=fixS(merged);saveLocal();if(!document.querySelector('.sheet-bg'))render()}else if(!S.setup)render()
      ydSet({mod:meta.modified});ydBaseSet(r.data);
      if(!m3eq(merged,r.data))await ydPush();
    }else if(!meta||(m.chg||0)>(m.sent||0))await ydPush();
    ydSet({last:Date.now()});YD.st='ok';YD.msg='';if(loud)toast('Синхронизировано ✓');
  }catch(e){YD.st='err';if(!YD.msg)YD.msg=e&&e.code?('ошибка '+e.code):'нет связи с Яндексом';if(loud)toast('Не получилось: '+YD.msg)}
  YD.busy=false;ydBadge();if(YD.again){YD.again=false;ydSync()}
}
function ydIcon(){if(!ydOn())return '<span style="opacity:.45">☁︎</span>';const c=YD.st==='err'?'var(--bad)':YD.st==='wait'?'var(--warn)':'var(--ok)';return `<span style="color:${c}">☁︎</span>`}
function ydWhen(){const l=ydGet().last;if(!l)return 'ещё не было';const d=new Date(l);return (key(d)===today()?'сегодня':fmt(key(d)))+' в '+d.toTimeString().slice(0,5)}
function ydBox(){
  if(!YD.cid)return `<div class="dim sm">Скоро: ждём подключения приложения к Яндексу.</div>`;
  if(!ydOn())return `<div class="dim sm">Данные будут храниться в твоём Яндекс Диске, в папке "Приложения/Луна". Видишь их только ты, и они будут одинаковые на всех устройствах.</div>${YD.msg?`<div class="sm" style="color:var(--bad);margin-top:6px">${esc(YD.msg)}</div>`:''}<button class="btn small" id="ydin" style="margin-top:8px">Войти через Яндекс</button>`;
  return `<div class="sm">Яндекс Диск подключён ${ydIcon()}<br><span class="mut">последняя синхронизация: ${ydWhen()}</span>${YD.st==='err'?`<br><span style="color:var(--bad)">${esc(YD.msg)}</span>`:''}</div><div class="row" style="margin-top:8px"><button class="btn small" id="ydnow">Синхронизировать сейчас</button><button class="btn small" id="ydout">Отключить</button></div>`;
}
function bindYdBox(sh){const a=sh.querySelector('#ydin'),b=sh.querySelector('#ydnow'),c=sh.querySelector('#ydout');
  if(a)a.onclick=ydLogin;if(b)b.onclick=()=>ydSync(true);if(c)armed(c,()=>{ydOff();const bx=sh.querySelector('#ydbox');if(bx){bx.innerHTML=ydBox();bindYdBox(sh)}toast('Яндекс Диск отключён. Данные на телефоне остались.')})}
function ydBadge(){const b=document.getElementById('ydb');if(b)b.innerHTML=ydIcon();const bx=document.getElementById('ydbox');if(bx){bx.innerHTML=ydBox();bindYdBox(bx.closest('.sheet'))}}

/* ---------- код-пароль: хранится только на этом устройстве (хэш) ---------- */
const PINK='luna-pin';let unlocked=false,hiddenAt=0;
function pinHash(){try{return localStorage.getItem(PINK)}catch(e){return null}}
async function sha(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('luna:'+t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function keypad(title,sub,onDone,extra){
  const bg=document.createElement('div');bg.className='lock';let v='';
  bg.innerHTML=`<div class="lk"><div style="font-size:40px">☾</div><div class="lt">${title}</div><div class="ls mut sm">${sub||''}</div><div class="dots">${'<i></i>'.repeat(4)}</div><div class="pad">${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(x=>x===''?'<span></span>':`<button data-k="${x}">${x}</button>`).join('')}</div>${extra||''}</div>`;
  document.body.appendChild(bg);
  const dots=()=>bg.querySelectorAll('.dots i').forEach((d,i)=>d.classList.toggle('on',i<v.length));
  const api={close:()=>bg.remove(),fail:(msg)=>{v='';dots();bg.querySelector('.ls').textContent=msg;bg.querySelector('.dots').classList.add('shake');setTimeout(()=>bg.querySelector('.dots').classList.remove('shake'),400)},el:bg,sub:(t)=>{bg.querySelector('.ls').textContent=t},title:(t)=>{bg.querySelector('.lt').textContent=t}};
  bg.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==='⌫')v=v.slice(0,-1);else if(v.length<4)v+=k;dots();if(v.length===4){const x=v;setTimeout(()=>{v='';dots();onDone(x,api)},120)}});
  return api;
}
function lockNow(){
  if(!pinHash()||document.querySelector('.lock'))return;unlocked=false;
  keypad('Луна','введи код',async(x,api)=>{if(await sha(x)===pinHash()){unlocked=true;api.close();if(typeof ACT!=='undefined'&&ACT&&!window._actDone){window._actDone=1;runAct()}}else api.fail('неверный код')},
    `<button class="linkbtn" id="pinforgot">Забыла код</button>`);
  const f=document.getElementById('pinforgot');if(f)armed(f,()=>{
    const synced=ydOn();
    try{localStorage.removeItem(PINK);if(!synced)localStorage.removeItem(KEY);else{localStorage.removeItem(KEY);localStorage.removeItem(YD.bkey);ydSet({mod:undefined,sent:undefined})}}catch(e){}
    location.reload()});
}
function drawPinBox(sh){
  const box=sh.querySelector('#pinbox');if(!box)return;
  box.innerHTML=pinHash()?`<div class="sm">Код включён 🔒. Луна спросит его при открытии.</div><div class="row" style="margin-top:8px"><button class="btn small" id="pinch">Сменить код</button><button class="btn small" id="pinoff">Выключить</button></div>`
   :`<div class="dim sm">4 цифры при каждом открытии. Код хранится только на этом устройстве. Если забудешь - придётся стереть данные тут${YD.cid?' (с Яндекс Диском они вернутся)':''}.</div><button class="btn small" id="pinon" style="margin-top:8px">Поставить код</button>`;
  const setNew=()=>{let first=null;keypad('Новый код','придумай 4 цифры',async(x,api)=>{if(!first){first=x;api.title('Ещё раз');api.sub('повтори код')}else if(x===first){try{localStorage.setItem(PINK,await sha(x))}catch(e){}unlocked=true;api.close();drawPinBox(sh);toast('Код поставлен 🔒')}else{first=null;api.title('Новый код');api.fail('не совпало, давай сначала')}},'<button class="linkbtn" id="pincancel">Отмена</button>');document.getElementById('pincancel').onclick=()=>document.querySelector('.lock').remove()};
  const check=(then)=>{keypad('Текущий код','',async(x,api)=>{if(await sha(x)===pinHash()){api.close();then()}else api.fail('неверный код')},'<button class="linkbtn" id="pincancel">Отмена</button>');document.getElementById('pincancel').onclick=()=>document.querySelector('.lock').remove()};
  const on=box.querySelector('#pinon'),ch=box.querySelector('#pinch'),off=box.querySelector('#pinoff');
  if(on)on.onclick=setNew;if(ch)ch.onclick=()=>check(setNew);
  if(off)off.onclick=()=>check(()=>{try{localStorage.removeItem(PINK)}catch(e){}drawPinBox(sh);toast('Код выключен')});
}

/* ---------- импорт из "Мой календарь" ---------- */
async function pcFiles(buf){
  let u=new Uint8Array(buf);
  if(u[0]===0xAC&&u[1]===0xED){const parts=[];let i=4;
    while(i<u.length){const t=u[i];if(t===0x7A){const n=((u[i+1]<<24)|(u[i+2]<<16)|(u[i+3]<<8)|u[i+4])>>>0;parts.push(u.subarray(i+5,i+5+n));i+=5+n}else if(t===0x77){const n=u[i+1];parts.push(u.subarray(i+2,i+2+n));i+=2+n}else break}
    const o=new Uint8Array(parts.reduce((a,p)=>a+p.length,0));let q=0;parts.forEach(x=>{o.set(x,q);q+=x.length});u=o}
  let z=-1;for(let i=0;i<u.length-3;i++)if(u[i]===0x50&&u[i+1]===0x4b&&u[i+2]===3&&u[i+3]===4){z=i;break}
  if(z<0)throw new Error('nozip');u=u.slice(z);
  const dv=new DataView(u.buffer);let e=-1;
  for(let i=u.length-22;i>=0;i--)if(dv.getUint32(i,true)===0x06054b50){e=i;break}
  if(e<0)throw new Error('noeocd');
  const cnt=dv.getUint16(e+10,true);let cd=dv.getUint32(e+16,true);const files={};
  for(let n=0;n<cnt;n++){
    const meth=dv.getUint16(cd+10,true),csz=dv.getUint32(cd+20,true),nl=dv.getUint16(cd+28,true),el=dv.getUint16(cd+30,true),cl=dv.getUint16(cd+32,true),off=dv.getUint32(cd+42,true);
    const name=new TextDecoder().decode(u.subarray(cd+46,cd+46+nl));
    const ds=off+30+dv.getUint16(off+26,true)+dv.getUint16(off+28,true);
    files[name]={meth,data:u.slice(ds,ds+csz)};cd+=46+nl+el+cl;
  }
  return files;
}
async function pcRead(f){
  let b=f.data;
  if(f.meth===8)b=new Uint8Array(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  const s=new TextDecoder().decode(b),K='Period';let o='';
  for(let i=0;i<s.length;i++)o+=i%2?s[i]:String.fromCharCode(s.charCodeAt(i)^K.charCodeAt((i>>1)%K.length));
  try{return JSON.parse(o)}catch(e){try{return JSON.parse(o.slice(0,-1)+']')}catch(e2){return null}}
}
async function importPC(file,close){
  if(!file)return;
  try{
    const fs=await pcFiles(await file.arrayBuffer());
    const per=fs['1.period']?await pcRead(fs['1.period']):null;
    const notes=fs['1.note']?await pcRead(fs['1.note']):[];
    if(!per)throw new Error('noperiod');
    let np=0,nn=0,nw=0;const t=today();
    for(const p of per){
      const st=p.date_str;if(!/^\d{4}-\d\d-\d\d$/.test(st))continue;
      const len=Math.min(15,Math.max(1,Math.abs(+p.period||4)+1));np++;
      for(let i=0;i<len;i++){const k=add(st,i);if(k>t)break;S.days[k]=S.days[k]||{sym:[],note:''};if(!S.days[k].flow)S.days[k].flow=i<2?3:2}
      if(add(st,len-1)<t)S.ended[st]=true;
    }
    for(const n of (notes||[])){
      const k=n.date_str;if(!/^\d{4}-\d\d-\d\d$/.test(k))continue;
      const d=S.days[k]=S.days[k]||{sym:[],note:''};
      if(n.note&&n.note.trim()){const tx=n.note.trim();if(!(d.note||'').includes(tx)){d.note=d.note?d.note+'\n'+tx:tx;nn++}}
      if(n.weight>0&&!d.w){d.w=Math.round(n.weight*0.45359237*10)/10;nw++}
      if(n.temperature>0&&!d.temp){const tc=n.temperature>50?(n.temperature-32)*5/9:n.temperature;d.temp=Math.round(tc*10)/10}
      if(n.symptom&&typeof n.symptom==='string'&&n.symptom.trim()){d.note=d.note?d.note+'\n'+n.symptom.trim():n.symptom.trim()}
      clean(k);
    }
    save();close();toast(`Перенесено: ${np} ${plural(np,'месячные','месячных','месячных')}, ${nn} ${plural(nn,'заметка','заметки','заметок')}${nw?', вес':''}`);
  }catch(e){toast('Не получилось прочитать файл. Это точно копия из "Мой календарь"?')}
}

/* ---------- копии и сводка ---------- */
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function exportData(){download('luna-'+today()+'.json',JSON.stringify(S,null,1),'application/json');toast('Копия скачана')}
function loadText(txt,close){try{const o=JSON.parse(txt);if(!o||!o.pill||!o.days)throw 0;S=fixS(o);save();close();toast('Копия загружена')}catch(e){toast('Это не похоже на копию Луны')}}
function importData(f,close){if(!f)return;const r=new FileReader();r.onload=()=>loadText(r.result,close);r.readAsText(f)}
function doctorSummary(){
  const from=add(today(),-183);const eps=episodes().filter(e=>e.end>=from);
  let t='Сводка за 6 месяцев ('+fmt(from)+' - '+fmt(today())+')\n';
  if(S.mode==='pill'){let exp=0,ok=0,late=0;for(let k=from;k<today();k=add(k,1)){if(S.since&&k<S.since)continue;const pi=packInfo(k);if(!pi||!pi.active)continue;exp++;if(S.taken[k]){ok++;if(lateH(k)>=12)late++}}
    t+='Препарат: '+P().name+', схема '+P().active+'+'+P().inactive+(P().inactive?(P().type==='placebo'?' плацебо':' перерыв'):'')+', приём в '+P().time+'\n';
    if(exp)t+='Активных таблеток выпито: '+ok+' из '+exp+', пропусков: '+(exp-ok)+', опозданий >12 ч: '+late+'\n';}
  t+='\nКровотечения:\n';
  eps.forEach(e=>{let mx=0;for(let x=e.start;x<=e.end;x=add(x,1))mx=Math.max(mx,(S.days[x]||{}).pads||0);const pt=padsOf(e);t+='- '+fmtShort(e.start)+(e.end!==e.start?'-'+fmtShort(e.end):'')+': '+e.n+' дн., максимум "'+FLOW[e.max]+'"'+(pt?', средств гигиены: '+pt+' (до '+mx+' в день)':'')+(e.kind?' ('+e.kind+')':'')+'\n'});
  const md=[];Object.entries(S.days).forEach(([k,d])=>{if(k>=from)(d.meds||[]).forEach(m=>md.push(fmtShort(k)+' '+m.n))});
  if(md.length)t+='\nОбезболивающее ('+md.length+' раз): '+md.sort().join('; ')+'\n';
  const vs=(S.visits||[]).filter(v=>v.date>=add(today(),-365)).sort((a,b)=>a.date<b.date?-1:1);
  if(vs.length)t+='\nВизиты и анализы за год:\n'+vs.map(v=>'- '+fmtShort(v.date)+'.'+parse(v.date).getFullYear()+' '+v.type+(v.note?': '+v.note:'')).join('\n')+'\n';
  if(!eps.length)t+='не отмечено\n';
  const cnt={};Object.entries(S.days).forEach(([k,d])=>{if(k>=from)(d.sym||[]).forEach(s=>cnt[s]=(cnt[s]||0)+1)});
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]);
  if(top.length)t+='\nСимптомы: '+top.map(([s,c])=>s.toLowerCase()+' - '+c).join(', ')+'\n';
  const notes=Object.entries(S.days).filter(([k,d])=>k>=from&&d.note).sort();
  if(notes.length)t+='\nЗаметки:\n'+notes.map(([k,d])=>'- '+fmtShort(k)+': '+d.note).join('\n')+'\n';
  const done=()=>toast('Сводка скопирована - вставь в сообщение врачу');
  if(navigator.share){navigator.share({title:'Сводка для врача',text:t}).catch(e=>{if(e&&e.name!=='AbortError')navigator.clipboard.writeText(t).then(done)});return}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,()=>download('luna-svodka.txt',t,'text/plain'));
  else download('luna-svodka.txt',t,'text/plain');
}

/* ---------- мелочи ---------- */
let toastT;
function toast(msg,undo){document.querySelectorAll('.toast').forEach(x=>x.remove());const d=document.createElement('div');d.className='toast';d.setAttribute('role','status');d.innerHTML=`<span>${esc(msg)}</span>${undo?'<button>Вернуть</button>':''}`;document.body.appendChild(d);if(undo)d.querySelector('button').onclick=()=>{d.remove();undo()};clearTimeout(toastT);toastT=setTimeout(()=>d.remove(),4000)}
const tabScroll = {};
function changeTab(next) {
  if (next===tab) { scrollTo(0,0); return; }
  tabScroll[tab]=scrollY;
  tab=next;
  render();
  scrollTo(0,tabScroll[tab]||0);
}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>changeTab(b.dataset.tab));
$('#quick-entry').onclick=()=>openDay(today());
let renderedDay=today();
function refreshDailyView() {
  if ($('.sheet-bg') || $('.lock')) return;
  const day=today();
  if (tab!=='today' && renderedDay===day) return;
  if (document.activeElement?.matches('#app :focus-visible, #app input, #app textarea')) return;
  renderedDay=day;
  render();
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDailyView()});
setInterval(refreshDailyView,60000);
const ACT=(()=>{const a=new URLSearchParams(location.search).get('a');if(a){try{history.replaceState(null,'',location.pathname)}catch(e){}}return a})();
function runAct(){if(!ACT||!S.setup)return;const t=today();
  if(ACT==='pill'){const pi=packInfo(t);if(!pi){toast('Пачка не начата');return}if(!pi.active&&P().type==='break'){toast('Сегодня перерыв, таблетку не пьём');return}if(S.taken[t]){toast('Сегодня уже отмечено ✓');return}S.taken[t]={at:new Date().toISOString()};save();render();toast('Отмечено: выпила 💊')}
  if(ACT==='start'){S.days[t]=S.days[t]||{sym:[],note:''};S.days[t].flow=Math.max(S.days[t].flow||0,3);save();render();toast('Отмечено: месячные начались')}}
render();
if(YD.justIn){YD.justIn=false;toast('Яндекс Диск подключён');}
ydSync();setInterval(()=>ydSync(),5*60000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=Date.now();else{nativeSchedule();if(pinHash()&&hiddenAt&&Date.now()-hiddenAt>60000)lockNow();ydSync()}});
lockNow();if(!pinHash())runAct();nativeSchedule();apkCheck();if(APP&&S.setup){try{if(!AndroidApp.notificationsAllowed()&&!S.nfAsked){S.nfAsked=1;saveLocal();AndroidApp.askNotifications()}}catch(e){}}
// Same visible update prompt as Schitalochka; no user data is deleted.
async function lunaCheckUpdates(){
  const current=document.querySelector('meta[name="luna-build"]')?.content;
  if(current==='development'||document.getElementById('luna-update-bar')||!navigator.onLine)return;
  try{
    const res=await fetch('version.txt?t='+Date.now(),{cache:'no-store'});
    if(!res.ok)return;
    const remote=(await res.text()).trim();
    if(!/^[0-9a-f]{7,40}$/.test(remote))return;
    if(current===remote || localStorage.getItem('luna-ui-version')===remote)return;
    const bar=document.createElement('div');
    bar.id='luna-update-bar';
    bar.style.cssText='position:fixed;bottom:76px;left:12px;right:12px;max-width:500px;margin:auto;z-index:9999;background:#38233a;color:#fff;border:1px solid #ff6fa8;border-radius:14px;padding:12px 14px;box-shadow:0 6px 28px #0008;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:14px';
    bar.innerHTML='✨ Есть обновление <button type="button" style="background:#ff6fa8;color:#1d121d;border-radius:10px;padding:9px 14px;font-weight:700">Обновить</button>';
    bar.querySelector('button').onclick=async()=>{
      bar.querySelector('button').disabled=true;
      bar.querySelector('button').textContent='Обновляю…';
      try{
        if('serviceWorker' in navigator){
          const reg=await navigator.serviceWorker.getRegistration();
          if(reg)await reg.update();
        }
        if('caches' in window){
          const keys=await caches.keys();
          await Promise.all(keys.filter(k=>k.startsWith('luna-')).map(k=>caches.delete(k)));
        }
        localStorage.setItem('luna-ui-version',remote);
        const u=new URL(location.href);
        u.searchParams.set('luna_refresh',remote.slice(0,12));
        location.replace(u.href);
      }catch(e){bar.querySelector('button').disabled=false;bar.querySelector('button').textContent='Повторить'}
    };
    document.body.appendChild(bar);
  }catch(e){}
}
setTimeout(lunaCheckUpdates,4000);
setInterval(lunaCheckUpdates,20*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)lunaCheckUpdates()});
if('serviceWorker' in navigator&&window.isSecureContext){
  window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{}));
}
