const db=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=n=>n==null?'—':Number(n).toLocaleString('pt-BR');
function ago(iso){if(!iso)return '—';const s=Math.max(0,Math.floor((Date.now()-Date.parse(iso))/1000));if(s<60)return s+'s';const m=Math.floor(s/60);if(m<60)return m+'m '+s%60+'s';return Math.floor(m/60)+'h '+m%60+'m'}
function characterUrl(name){return `https://futureot.com.br/characters?name=${encodeURIComponent(name)}`}
function vocationLabel(p){return p?.vocation?`<span class="player-vocation">(${esc(p.vocation)})</span>`:''}
function exiva(name){navigator.clipboard?.writeText(`exiva "${name}"`).catch(()=>{})}
function recentLevelUp(p){return state.levelUps.some(x=>x.player_id===p.id && Date.now()-Date.parse(x.gained_at)<=5*60*1000)}
let state={groups:[],players:[],deaths:[],frags:[],levelUps:[],topConfig:null,search:'',filter:'all',firstLoad:true,known:new Set()};
let lastAlertSignature='';

function notifyLevelUps(items){
  if(!items.length)return;
  const newest=items.slice().sort((a,b)=>Date.parse(b.gained_at)-Date.parse(a.gained_at))[0];
  const sig=items.map(x=>x.id).sort().join(',');
  if(sig===lastAlertSignature)return;
  lastAlertSignature=sig;
  const box=document.querySelector('#levelUpNotice');
  const text=items.slice(0,5).map(x=>`🚀 ${esc(x.player_name)} UPOU PARA ${fmt(x.new_level)}!`).join('<br>');
  box.innerHTML=`<div class="levelup-banner">${text}</div>`;
  setTimeout(()=>{if(box)box.innerHTML=''},12000);
  if(!state.firstLoad && newest){
    try{
      if('Notification' in window && Notification.permission==='granted') new Notification('FutureOT — LEVEL UP!',{body:`${newest.player_name} upou para ${newest.new_level}.`});
    }catch{}
  }
}

function renderTopFrags(){
  const el=document.querySelector('#topFrags'); if(!el)return;
  const cfg=state.topConfig;
  if(!cfg?.guild_id){el.innerHTML='';return}
  const guildPlayers=state.players.filter(p=>p.group_id===cfg.guild_id);
  const names=new Map(guildPlayers.map(p=>[p.name.toLowerCase(),p]));
  const shifted=new Date(Date.now()-3*60*60*1000);
  const y=shifted.getUTCFullYear(),m=shifted.getUTCMonth(),d=shifted.getUTCDate();
  const start=new Date(Date.UTC(y,m,d,10+3,0,0)).getTime();
  const counts={},seen=new Set();
  for(const f of state.frags||[]){
    const ts=Date.parse(f.died_at); if(!Number.isFinite(ts)||ts<start)continue;
    const p=names.get(String(f.killer_name||'').toLowerCase()); if(!p)continue;
    const key=String(f.source_key||`${f.killer_name}|${f.died_at}`); if(seen.has(key))continue;
    seen.add(key); if(!counts[p.name.toLowerCase()])counts[p.name.toLowerCase()]={player:p,kills:0}; counts[p.name.toLowerCase()].kills++;
  }
  const top=Object.values(counts).sort((a,b)=>b.kills-a.kills||a.player.name.localeCompare(b.player.name)).slice(0,10);
  const body=top.map((x,i)=>{const p=x.player;const outfit=p.outfit_url?`<img class="frag-outfit" src="${esc(p.outfit_url)}" alt="" loading="lazy" onerror="this.style.display='none'">`:'';return `<div class="frag-row"><span class="frag-rank">${i+1}</span><div class="frag-player">${outfit}<div class="frag-info"><a href="${characterUrl(p.name)}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a>${vocationLabel(p)}</div></div><span class="frag-kills">${x.kills}<small>${x.kills===1?'KILL':'KILLS'}</small></span></div>`}).join('');
  el.innerHTML=`<section class="group top-frags-group"><div class="group-head"><span class="group-title">⚔ TOP FRAGS</span><span class="group-count">${esc(state.groups.find(g=>g.id===cfg.guild_id)?.name||'GUILD')} · RESET 10:00</span></div><div class="top-frags-body">${body||'<div class="empty">Nenhuma kill registrada desde as 10:00.</div>'}</div></section>`;
}

function render(){
  const {groups,players,deaths,frags,levelUps}=state;
  const q=state.search.trim().toLowerCase();
  renderTopFrags();
  let online=0,off=0,pending=0,ups=0;
  const html=groups.filter(g=>g.active).map(g=>{
    let list=players.filter(p=>(p.group_id===g.id||(!p.group_id&&p.group===g.slug))&&(!q||p.name.toLowerCase().includes(q))).filter(p=>{
      const s=recentLevelUp(p)?'levelup':(!p.last_seen?'pending':(p.status==='online'?'online':'offline'));
      return state.filter==='all'||state.filter===s;
    }).sort((a,b)=>{
      const sa=recentLevelUp(a)?'levelup':(!a.last_seen?'pending':(a.status==='online'?'online':'offline'));
      const sb=recentLevelUp(b)?'levelup':(!b.last_seen?'pending':(b.status==='online'?'online':'offline'));
      const rank={levelup:0,online:1,pending:2,offline:3};
      return rank[sa]-rank[sb]||(Number(b.level)||0)-(Number(a.level)||0)||a.name.localeCompare(b.name);
    });
    if(!list.length)return '';
    const body=list.map(p=>{
      const isUp=recentLevelUp(p), isPending=!p.last_seen&&!isUp, isOnline=p.status==='online'&&!isPending;
      if(isUp)ups++; else if(isPending)pending++; else if(isOnline)online++; else off++;
      const cls=isUp?'s-up':isPending?'s-pending':isOnline?'s-online':'s-off';
      const label=isUp?'LEVEL UP':isPending?'AGUARDANDO':'OFFLINE';
      const url=characterUrl(p.name);
      const outfit=p.outfit_url?`<img class="player-outfit" src="${esc(p.outfit_url)}" alt="" loading="lazy" onerror="this.style.display='none'">`:'';
      const event=levelUps.find(x=>x.player_id===p.id);
      const upInfo=event?`<small class="levelup-mini">+ ${Number(event.new_level)-Number(event.old_level)} lvl · ${ago(event.gained_at)}</small>`:'';
      return `<tr><td><div class="player">${outfit}<div class="player-info"><a class="player-link" href="${url}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a><div class="player-meta">${vocationLabel(p)}<button class="copy-exiva" title="Copiar exiva" onclick='exiva(${JSON.stringify(p.name)})'>⧉ exiva</button></div></div></div></td><td>${fmt(p.level)}</td><td><span class="status ${cls}"><i class="dot"></i>${label}</span>${upInfo}</td></tr>`;
    }).join('');
    return `<section class="group"><div class="group-head"><span class="group-title">${esc(g.name)}</span><span class="group-count">${list.length} jogadores</span></div><div class="table-scroll"><table><thead><tr><th>JOGADOR</th><th>LEVEL</th><th>STATUS</th></tr></thead><tbody>${body}</tbody></table></div></section>`;
  }).join('');
  document.querySelector('#groups').innerHTML=html||'<div class="group empty">Nenhum jogador encontrado.</div>';

  const tracked=new Set(players.map(p=>p.name.toLowerCase()));
  const deathList=deaths.filter(d=>tracked.has(String(d.player_name||'').toLowerCase())).sort((a,b)=>Date.parse(b.died_at)-Date.parse(a.died_at)).slice(0,100);
  const dbody=deathList.map(d=>`<tr><td>${d.died_at?new Date(d.died_at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—'}</td><td><b>${esc(d.player_name)}</b> <span class="death-level">lvl ${fmt(d.level)}</span></td><td>${esc(d.reason||'Morte registrada')}</td></tr>`).join('');
  document.querySelector('#deaths').innerHTML=`<section class="group death-group"><div class="group-head"><span class="group-title">☠ DEATH LIST</span><span class="group-count">${deathList.length} mortes</span></div><div class="table-scroll"><table class="death-table"><thead><tr><th>HORÁRIO</th><th>JOGADOR</th><th>MORREU PARA</th></tr></thead><tbody>${dbody||'<tr><td colspan="3" class="empty">Nenhuma morte registrada.</td></tr>'}</tbody></table></div></section>`;

  const today=new Date().toLocaleDateString('sv-SE',{timeZone:'America/Sao_Paulo'});
  const daily=levelUps.filter(x=>new Date(x.gained_at).toLocaleDateString('sv-SE',{timeZone:'America/Sao_Paulo'})===today).length;
  document.querySelector('#up').textContent=ups;
  document.querySelector('#online').textContent=online;
  document.querySelector('#off').textContent=off;
  document.querySelector('#pending').textContent=pending;
  document.querySelector('#playerTotal').textContent=players.length;
  document.querySelector('#dailyLevels').textContent=daily;
  document.querySelector('#updated').textContent=new Date().toLocaleTimeString('pt-BR');
  document.querySelector('#sync').textContent='● ROSTER IMPORTADO · '+new Date().toLocaleTimeString('pt-BR');
}

async function load(){
  document.querySelector('#sync').textContent='● Sincronizando...';
  const [g,p,d,l,cfg,f]=await Promise.all([
    db.from('tracker_groups').select('id,name,slug,kind,active,sort_order').eq('active',true).order('sort_order'),
    db.from('players').select('id,name,level,status,last_seen,group,group_id,outfit_url,vocation').order('name'),
    db.from('player_deaths').select('player_id,player_name,level,reason,died_at').order('died_at',{ascending:false}).limit(1000),
    db.from('player_level_up_events').select('id,player_id,player_name,old_level,new_level,gained_at').order('gained_at',{ascending:false}).limit(100),
    db.from('top_frags_config').select('guild_id,reset_hour').eq('id',1).maybeSingle(),
    db.from('player_kill_events').select('killer_name,victim_name,died_at,source_key').order('died_at',{ascending:false}).limit(2000)
  ]);
  const fatal=g.error||p.error||l.error||d.error||cfg.error||f.error;
  if(fatal){document.querySelector('#groups').innerHTML='<div class="group empty">Erro ao carregar dados: '+esc(fatal.message)+'</div>';document.querySelector('#sync').textContent='● Erro de sincronização';return}
  const next=(l.data||[]);
  if(!state.firstLoad){
    const fresh=next.filter(x=>!state.known.has(x.id)&&Date.now()-Date.parse(x.gained_at)<=10*60*1000);
    if(fresh.length)notifyLevelUps(fresh);
  }
  state.known=new Set(next.map(x=>x.id));
  state={...state,groups:g.data||[],players:p.data||[],deaths:d.data||[],levelUps:next,topConfig:cfg.error?null:cfg.data,frags:f.error?[]:(f.data||[])};
  render();
  state.firstLoad=false;
}

function enableAlerts(){
  if(!('Notification' in window)){alert('Seu navegador não oferece notificações. O aviso visual do site continuará funcionando.');return}
  Notification.requestPermission().then(p=>{
    document.querySelector('#alerts').textContent=p==='granted'?'🔔 Alertas ativos':'🔕 Alertas bloqueados';
  });
}
function clock(){
  document.querySelector('#clock').textContent=new Date().toLocaleTimeString('pt-BR');
  const now=Date.now(),next=Math.ceil(now/60000)*60000,sec=Math.max(0,Math.ceil((next-now)/1000));
  const el=document.querySelector('#nextRefresh'); if(el)el.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
}

let reloadTimer=null;
function scheduleReload(){clearTimeout(reloadTimer);reloadTimer=setTimeout(load,500)}
load();
setInterval(clock,1000);
setInterval(load,60000);
document.querySelector('#refresh')?.addEventListener('click',load);
document.querySelector('#alerts')?.addEventListener('click',enableAlerts);
document.querySelector('#search')?.addEventListener('input',e=>{state.search=e.target.value;render()});
document.querySelector('#statusFilter')?.addEventListener('change',e=>{state.filter=e.target.value;render()});
clock();