const db=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function statusHtml(p,ups){
  const up=ups.some(x=>x.player_id===p.id&&Date.now()-Date.parse(x.gained_at)<=5*60*1000);
  if(up)return '<span class="status hunting"><i class="dot"></i>LEVEL UP</span>';
  return !p.last_seen?"<span class="status pending"><i class="dot"></i>AGUARDANDO</span>":p.status==="online"?'<span class="status pz"><i class="dot"></i>ONLINE</span>':'<span class="status offline"><i class="dot"></i>OFFLINE</span>';
}
async function load(){
  const [{data:g},{data}]=await Promise.all([
    db.from("tracker_groups").select("id,name,slug").eq("active",true).order("sort_order"),
    db.from("players").select("id,name,level,status,last_seen,group,group_id,vocation").order("level",{ascending:false})
  ]);
  const groups=g||[];
  const {data:ups}=await db.from("player_level_up_events").select("id,player_id,player_name,old_level,new_level,gained_at").order("gained_at",{ascending:false}).limit(100);
  const q=(document.getElementById("search").value||"").toLowerCase();
  document.getElementById("grid").innerHTML=(data||[]).filter(x=>x.name.toLowerCase().includes(q)).map(x=>{
    const gr=groups.find(g=>g.id===x.group_id);
    const u=(ups||[]).find(e=>e.player_id===x.id);
    const up=u&&Date.now()-Date.parse(u.gained_at)<=5*60*1000;
    return `<div class="char"><div class="char-top"><div class="char-name">${esc(x.name)}</div><div class="char-level">LV ${x.level}</div></div><div style="margin-top:14px">${statusHtml(x,ups||[])}</div><div class="char-meta"><span>${esc(gr?.name||x.group||"—")}</span><span>${up?`UP +${Number(u.new_level)-Number(u.old_level)} · ${new Date(u.gained_at).toLocaleTimeString("pt-BR")}`:esc(x.vocation||"")}</span></div></div>`
  }).join("")||'<div class="char">Nenhum personagem cadastrado.</div>';
}
document.getElementById("search").oninput=load;load();setInterval(load,60000);