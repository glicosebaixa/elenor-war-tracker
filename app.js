const KEY="elenor-war-tracker-v1";
const seed=[
 {name:"Exemplo Soul 1",level:900,group:"soul",status:"hunting",last:"agora"},
 {name:"Exemplo Soul 2",level:760,group:"soul",status:"pz",last:"12 min"},
 {name:"Exemplo Soul 3",level:640,group:"soul",status:"offline",last:"1 h"},
 {name:"Hunted Exemplo",level:510,group:"hunted",status:"hunting",last:"agora"}
];
let chars=JSON.parse(localStorage.getItem(KEY)||"null")||seed;
const save=()=>localStorage.setItem(KEY,JSON.stringify(chars));
const statusLabel=s=>({hunting:"UPANDO",pz:"PZ",offline:"OFFLINE"}[s]);
const groupLabel=g=>g==="soul"?"SOUL TATICS":"HUNTED";
function statusHtml(s){return `<span class="status ${s}"><i class="dot"></i>${statusLabel(s)}</span>`}
function render(){
 const q=(document.getElementById("search").value||"").toLowerCase();
 const list=chars.filter(c=>c.name.toLowerCase().includes(q));
 document.getElementById("total").textContent=chars.length;
 document.getElementById("hunting").textContent=chars.filter(c=>c.status==="hunting").length;
 document.getElementById("pz").textContent=chars.filter(c=>c.status==="pz").length;
 document.getElementById("offline").textContent=chars.filter(c=>c.status==="offline").length;
 document.getElementById("updated").textContent="Atualizado "+new Date().toLocaleTimeString("pt-BR");
 document.getElementById("lastScan").textContent="Última leitura "+new Date().toLocaleTimeString("pt-BR");
 document.getElementById("tableBody").innerHTML=list.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${groupLabel(c.group)}</td><td>${c.level}</td><td>${statusHtml(c.status)}</td><td>${c.last||"agora"}</td></tr>`).join("");
 document.getElementById("soulGrid").innerHTML=chars.filter(c=>c.group==="soul").map(card).join("");
 document.getElementById("huntedGrid").innerHTML=chars.filter(c=>c.group==="hunted").map(card).join("")||empty("Nenhum hunted cadastrado.");
 document.getElementById("adminBody").innerHTML=chars.map((c,i)=>`<tr><td><b>${esc(c.name)}</b></td><td>${groupLabel(c.group)}</td><td>${c.level}</td><td>${statusHtml(c.status)}</td><td><button class="danger" onclick="removeChar(${i})">Excluir</button></td></tr>`).join("");
}
function card(c){return `<div class="char"><div class="char-top"><div class="char-name">${esc(c.name)}</div><div class="char-level">LV ${c.level}</div></div><div style="margin-top:14px">${statusHtml(c.status)}</div><div class="char-meta"><span>${groupLabel(c.group)}</span><span>Último: ${c.last||"agora"}</span></div></div>`}
function empty(t){return `<div class="char">${t}</div>`}
function esc(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function removeChar(i){chars.splice(i,1);save();render()}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));document.getElementById(b.dataset.page).classList.add("active-page");document.getElementById("pageTitle").textContent=b.textContent.replace(/[◈⚔☠⚙]/g,"").trim()});
document.getElementById("search").oninput=render;
document.getElementById("refresh").onclick=render;
document.getElementById("saveChar").onclick=()=>{let n=document.getElementById("charName").value.trim(),l=+document.getElementById("charLevel").value||0,g=document.getElementById("charGroup").value,s=document.getElementById("charStatus").value;if(!n)return alert("Informe o nome.");chars.push({name:n,level:l,group:g,status:s,last:"agora"});save();document.getElementById("charName").value="";document.getElementById("charLevel").value="";render()};
document.getElementById("addHunted").onclick=()=>{document.querySelector('[data-page="settings"]').click();document.getElementById("charGroup").value="hunted";document.getElementById("charName").focus()};
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");let f=b.dataset.filter;document.getElementById("soulGrid").innerHTML=chars.filter(c=>c.group==="soul"&&(f==="all"||c.status===f)).map(card).join("")});
setInterval(()=>{document.getElementById("clock").textContent=new Date().toLocaleTimeString("pt-BR")},1000);
render();
