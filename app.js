/* 1stMil Local Outreach v2: manual iPhone SMS and consent-only queue. */
'use strict';
const KEY='firstmil_local_agent_v1';
const SETTINGS='firstmil_local_agent_settings_v1';
const $=id=>document.getElementById(id);
let leads=readLocal(KEY,[]).map(x=>makeLead(x)), settings=readLocal(SETTINGS,{owner:'Krystian',phone:'',portfolio:''}), editing=null, lastResults=[];
const areas={szczecin:{bbox:'53.375,14.445,53.515,14.705',label:'Szczecin'},police:{bbox:'53.525,14.52,53.595,14.64',label:'Police'},stargard:{bbox:'53.305,14.965,53.365,15.105',label:'Stargard'},goleniow:{bbox:'53.525,14.78,53.595,14.90',label:'Goleniów'},gryfino:{bbox:'53.225,14.435,53.285,14.555',label:'Gryfino'},dobra:{bbox:'53.45,14.34,53.525,14.445',label:'Dobra i okolice'}};
const categories={mix:{key:null,regex:null,label:'Różne branże'},beauty:{key:'shop',regex:'^(beauty|hairdresser|cosmetics|massage)$',label:'Beauty / fryzjer'},food:{key:'amenity',regex:'^(cafe|restaurant|fast_food)$',label:'Gastronomia'},florist:{key:'shop',regex:'^(florist|garden_centre)$',label:'Kwiaty / ogród'},auto:{key:'shop',regex:'^(car_repair|car_parts|car|tyres)$',label:'Motoryzacja'},services:{key:'craft',regex:'^(electrician|plumber|painter|roofer|carpenter|photographer|landscaper)$',label:'Usługi lokalne'},retail:{key:'shop',regex:'^(clothes|shoes|gift|furniture|interior_decoration|pet|bakery)$',label:'Handel lokalny'}};
const googleKeywords={mix:'lokalne firmy',beauty:'salon fryzjerski kosmetyczny',food:'restauracja kawiarnia',florist:'kwiaciarnia ogrodnik',auto:'warsztat samochodowy',services:'usługi remontowe',retail:'sklep lokalny'};
const overpassServers=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://overpass.private.coffee/api/interpreter'];

function readLocal(k,f){try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch{return f}}
function save(){localStorage.setItem(KEY,JSON.stringify(leads));render();renderQueue()}
function escapeHtml(s=''){return String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function toast(s){const n=$('toast');n.textContent=s;n.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>n.classList.remove('show'),3400)}
function normalizePhone(s=''){let n=String(s).replace(/[^0-9+]/g,'');if(n.startsWith('00'))n='+'+n.substring(2);if(/^\d{9}$/.test(n))n='+48'+n;return /^\+48\d{9}$/.test(n)?n:''}
function consentOK(l){return !!(!l.optOut && l.consent && /^\d{4}-\d\d-\d\d$/.test(l.consentDate||'') && (l.consentSource||'').trim().length>=5 && new Date(l.consentDate+'T00:00:00').getTime()<=Date.now())}
function uid(){return (typeof crypto!=='undefined'&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2)}
function makeLead(x){return {id:x.id||uid(),name:String(x.name||'').trim(),category:x.category||'Usługi',phone:x.phone||'',website:x.website||'',address:x.address||'',notes:x.notes||'',consent:!!x.consent,consentDate:x.consentDate||'',consentSource:x.consentSource||'',sentAt:x.sentAt||'',optOut:!!x.optOut,message:x.message||'',source:x.source||'Ręcznie'}}
function websiteLabel(l){return l.website?'Podana w bazie':'Brak w bazie'}
function render(){let all=leads.length; $('statAll').textContent=all;$('statNew').textContent=leads.filter(x=>!x.sentAt).length;$('statConsent').textContent=leads.filter(consentOK).length;$('statSent').textContent=leads.filter(x=>x.sentAt).length;const term=$('search').value.toLowerCase(),filter=$('filter').value;let arr=leads.filter(l=>(l.name+' '+l.category+' '+l.notes).toLowerCase().includes(term));if(filter==='new')arr=arr.filter(l=>!l.sentAt);else if(filter==='consent')arr=arr.filter(consentOK);else if(filter==='sent')arr=arr.filter(l=>l.sentAt);else if(filter==='optout')arr=arr.filter(l=>l.optOut);let html='';for(const l of arr){let status=l.optOut?'<span class="pill amber">Nie kontaktować</span>':l.sentAt?'<span class="pill blue">Wysłane</span>':consentOK(l)?'<span class="pill green">Zgoda zapisana</span>':'<span class="pill amber">Szkic / bez zgody</span>';html+=`<div class="lead" data-id="${escapeHtml(l.id)}"><div><strong>${escapeHtml(l.name)}</strong><small>${escapeHtml(l.category)} · ${escapeHtml(l.address||'Szczecin')}</small></div><div class="website-cell"><small>${escapeHtml(websiteLabel(l))}</small></div><div>${status}</div><div class="arrow">›</div></div>`}$('leadList').innerHTML=html;$('emptyLeads').hidden=!!arr.length;document.querySelectorAll('.lead').forEach(el=>el.addEventListener('click',()=>openLead(el.dataset.id)))}
function switchTab(t){if(t==='iphone')renderQueue();document.querySelectorAll('.tab').forEach(el=>el.classList.toggle('active',el.id==='tab-'+t));document.querySelectorAll('.nav').forEach(el=>el.classList.toggle('active',el.dataset.tab===t));window.scrollTo({top:0,behavior:'smooth'})}
function generateDraft(l){
 const owner=(settings.owner||'Krystian').trim();
 const site=(settings.portfolio||'').trim();
 let msg=`Dzień dobry! Jestem ze Szczecina i piszę SMS-a, bo wiem, że mało kto lubi, gdy obcy ludzie zawracają głowę telefonami. 😄\n\nKrótko i na temat: szukam obecnie kilku dodatkowych zleceń na strony WWW oraz pomoc w tworzeniu materiałów do social mediów (rolki, zdjęcia, posty). Działam lokalnie, szybko, uczciwie i w rozsądnych cenach.\n\nJeśli przydałaby się Państwu taka pomoc, wystarczy odpisać lub zadzwonić.\n\nPS. Za tą wiadomością stoi prawdziwy człowiek, ${owner} ze Szczecina. 😉`;
 if(site) msg+=`\nPortfolio: ${site}`;
 return msg;
}
function getModalFields(){return {name:$('editName').value.trim(),category:$('editCategory').value.trim(),phone:$('editPhone').value.trim(),website:$('editWebsite').value.trim(),address:$('editAddress').value.trim(),notes:$('editNotes').value.trim(),consent:$('editConsent').checked,optOut:$('editOptOut').checked,consentDate:$('editConsentDate').value,consentSource:$('editConsentSource').value.trim(),message:$('message').value.trim()}}
function openLead(id=null,data=null){let l=id?leads.find(x=>x.id===id):makeLead(data||{});if(!l){toast('Nie znaleziono kontaktu');return}editing=id||null;let values={Name:l.name,Category:l.category,Phone:l.phone,Website:l.website,Address:l.address,Notes:l.notes,ConsentDate:l.consentDate,ConsentSource:l.consentSource};for(const [k,v] of Object.entries(values))$('edit'+k).value=v;$('editConsent').checked=l.consent;$('editOptOut').checked=!!l.optOut;$('message').value=l.message||generateDraft(l);$('modalTitle').textContent=id?'Kontakt: '+l.name:'Nowa firma';$('deleteLead').hidden=!id;$('markSent').hidden=!!l.sentAt;updateSendHint();$('modal').hidden=false;document.body.style.overflow='hidden'}
function updateSendHint(){let x=getModalFields(),can=consentOK(x),phone=normalizePhone(x.phone);$('sendSMS').disabled=!(can&&phone);$('copyAndOpen').disabled=!(can&&phone);$('markSent').disabled=!(can&&phone);$('sendHint').textContent=x.optOut?'Kontakt oznaczony jako: nie kontaktować.':!can?'Aby otworzyć SMS, zapisz prawdziwą, wcześniejszą zgodę na marketing SMS wraz z datą i źródłem.':!phone?'Podaj polski numer telefonu i zweryfikuj, czy obsługuje SMS-y.':'Możesz otworzyć aplikację SMS. Wiadomość nie zostanie wysłana automatycznie; przed wysyłką sprawdź jej treść.'}
function closeModal(){$('modal').hidden=true;document.body.style.overflow=''}
function persistEditing(){let x=getModalFields();if(!x.name){toast('Podaj nazwę firmy');return null}if(x.consent&&!x.optOut&&!consentOK(x)){toast('Uzupełnij datę i źródło faktycznej zgody');return null}let l;if(editing){let i=leads.findIndex(l=>l.id===editing);if(i<0)return null;l={...leads[i],...x};leads[i]=l}else{l=makeLead(x);leads.unshift(l);editing=l.id}save();return l}
function copyText(t){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(t);const n=document.createElement('textarea');n.value=t;n.style.position='fixed';n.style.opacity='0';document.body.appendChild(n);n.select();document.execCommand('copy');n.remove();return Promise.resolve()}
function csvParse(s){const out=[];let row=[],cell='',quote=false;for(let i=0;i<s.length;i++){let ch=s[i];if(ch==='"'){if(quote&&s[i+1]==='"'){cell+='"';i++}else quote=!quote}else if(!quote&&(ch===','||ch===';'||ch==='\n'||ch==='\r')){if(ch==='\r'&&s[i+1]==='\n')i++;if(ch==='\n'||ch==='\r'){row.push(cell);if(row.some(x=>x.trim()))out.push(row);row=[]}else row.push(cell);cell=''}else cell+=ch}row.push(cell);if(row.some(x=>x.trim()))out.push(row);return out}
function csvEscape(x){let s=String(x??'');return '"'+s.replace(/"/g,'""')+'"'}
function exportData(){const headers=['name','category','phone','website','address','notes','consent','consentDate','consentSource','sentAt','optOut','message','source'];const lines=[headers.map(csvEscape).join(',')];for(const l of leads)lines.push(headers.map(k=>csvEscape(l[k]??'')).join(','));download('1stmil-kontakty.csv','\uFEFF'+lines.join('\r\n'),'text/csv;charset=utf-8');toast('Pobrano bazę CSV — przechowuj ją prywatnie')}
function download(name,text,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const aliases={name:['name','firma','nazwa','nazwa firmy','company'],category:['category','branża','branza','kategoria'],phone:['phone','telefon','numer','tel','numer telefonu'],website:['website','www','strona','strona www','url'],address:['address','adres'],notes:['notes','notatki','uwagi'],consent:['consent','zgoda'],consentDate:['consentdate','data zgody'],consentSource:['consentsource','źródło zgody','zrodlo zgody'],sentAt:['sentat','wysłano'],optOut:['optout','sprzeciw'],message:['message','wiadomość'],source:['source','źródło']};
async function importCSV(file){if(!file)return;const raw=await file.text(),rows=csvParse(raw.replace(/^\uFEFF/,''));if(rows.length<2){toast('Brak danych w pliku CSV');return}let cols=rows.shift().map(x=>x.trim().toLowerCase()),n=0;for(const vals of rows){let d={};for(const [key,names] of Object.entries(aliases)){let i=cols.findIndex(c=>names.includes(c));if(i>=0)d[key]=vals[i]||''}if(!d.name)continue;if(leads.some(l=>l.name.toLowerCase()===d.name.trim().toLowerCase() && l.phone===(d.phone||'')))continue;d.consent=String(d.consent||'').toLowerCase()==='true' || String(d.consent||'').toLowerCase()==='tak';d.optOut=String(d.optOut||'').toLowerCase()==='true'||String(d.optOut||'').toLowerCase()==='tak';if(!d.consentDate||!d.consentSource)d.consent=false;leads.push(makeLead(d));n++}save();toast(`Zaimportowano ${n} firm. Zweryfikuj dane i zgody.`)}

function googleQuery(){
 const loc=areas[$('area').value]||areas.szczecin;
 return `${$('googleKeyword').value.trim()||'lokalne firmy'} ${loc.label}`;
}
function updateGoogleLinks(){
 const query=encodeURIComponent(googleQuery());
 $('googleMapsLink').href='https://www.google.com/maps/search/?api=1&query='+query;
 $('googleQuickButton').href=$('googleMapsLink').href;
 $('googleSearchLink').href='https://www.google.com/search?q='+query;
}
function formatHttpError(r){
 if(r.status===429)return 'Serwer przeciążony (429)';
 if(r.status===504)return 'Serwer przekroczył limit czasu (504)';
 return 'Błąd serwera HTTP '+r.status;
}
function overpassFilter(q,bbox,requirePhone){
 if(!requirePhone)return q+'('+bbox+');';
 return q+'["phone"]('+bbox+');'+q+'["contact:phone"]('+bbox+');'+q+'["mobile"]('+bbox+');'+q+'["contact:mobile"]('+bbox+');';
}
function buildOverpassQuery(key,area){
 const cat=categories[key];
 const base=key==='mix'?
  ['nwr["shop"~"^(hairdresser|beauty|florist|garden_centre|car_repair|car_parts|gift|furniture|interior_decoration|pet|bakery)$"]','nwr["amenity"~"^(cafe|restaurant|fast_food)$"]','nwr["craft"~"^(electrician|plumber|painter|roofer|carpenter|photographer|landscaper)$"]']:
  [`nwr["${cat.key}"~"${cat.regex}"]`];
 // Search only records with a phone tag, since the purpose is researching possible contacts.
 return `[out:json][timeout:20];(${base.map(q=>overpassFilter(q,area.bbox,true)).join('')});out center 450;`;
}
async function queryOverpass(endpoint,query,timeout){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),timeout);
 try{
  // GET avoids POST/CORS preflight in most iPhone browsers.
  const url=endpoint+'?'+new URLSearchParams({data:query}).toString();
  const r=await fetch(url,{method:'GET',mode:'cors',signal:controller.signal,cache:'no-store'});
  if(!r.ok)throw Error(formatHttpError(r));
  const data=await r.json();
  if(!Array.isArray(data.elements))throw Error('Nieoczekiwana odpowiedź API');
  return data;
 }finally{clearTimeout(timer)}
}
async function discover(){
 const key=$('category').value,cat=categories[key],area=areas[$('area').value]||areas.szczecin;
 const btn=$('discoverBtn'),stat=$('discoverStatus');
 btn.disabled=true;btn.textContent='⌛ Szukam w OSM…';
 stat.style.display='block';stat.classList.remove('error','success');
 stat.textContent='Łączę z OpenStreetMap. Jeśli serwer nie odpowie, spróbuję kolejnego. Google Maps działa niezależnie poniżej.';
 $('discoveryResults').innerHTML='';$('pickTen').disabled=true;lastResults=[];
 const query=buildOverpassQuery(key,area);
 let result,problems=[];
 try{
  for(const [index,endpoint] of overpassServers.entries()){
   stat.textContent=`Szukam firm w ${area.label} — serwer ${index+1}/${overpassServers.length} (limit ${index===0?11:10} s). Jeśli nie odpowie, spróbuję następnego…`;
   try{
    result=await queryOverpass(endpoint,query,index===0?11000:10000);
    break;
   }catch(e){
    problems.push((e.name==='AbortError'?'Brak odpowiedzi / limit czasu':e.message));
    console.warn('Wyszukiwanie OSM:',endpoint,e);
   }
  }
  if(!result)throw Error(problems.join('; '));
  const found=new Set();
  lastResults=(result.elements||[]).filter(e=>(e.tags||{}).name).map(e=>{
   const t=e.tags||{};
   const street=[t['addr:street'],t['addr:housenumber']].filter(Boolean).join(' ');
   const phone=t['contact:mobile']||t.mobile||t.phone||t['contact:phone']||'';
   return makeLead({id:'osm-'+e.type+'-'+e.id,name:t.name,category:cat.label,website:t.website||t['contact:website']||'',phone,address:street||t['addr:city']||area.label,notes:'Dane z OpenStreetMap. Zweryfikuj numer i stronę WWW: https://www.openstreetmap.org/'+e.type+'/'+e.id,source:'OpenStreetMap',consent:false});
  }).filter(x=>{let id=x.id;if(found.has(id))return false;found.add(id);return true}).sort((a,b)=>(Number(!!normalizePhone(b.phone))-Number(!!normalizePhone(a.phone)))||(Number(!!a.website)-Number(!!b.website))||a.name.localeCompare(b.name,'pl'));
  $('pickTen').disabled=!lastResults.some(x=>normalizePhone(x.phone));
  stat.classList.add('success');
  stat.textContent=lastResults.length?`Znaleziono ${lastResults.length} firm z numerem podanym w OSM. Zweryfikuj telefony i strony przed dodaniem.`:'Brak firm z podanym numerem dla tej kategorii w OSM. Spróbuj innej branży albo użyj Google Maps poniżej.';
  renderDiscovery();
 }catch(err){
  stat.classList.add('error');
  stat.textContent='Nie udało się połączyć z publicznym OpenStreetMap. To nie problem z SMS-ami. Spróbuj ponownie albo otwórz wyszukiwanie w Google Maps poniżej. Szczegóły: '+err.message;
  $('discoveryResults').innerHTML='<div class="empty">Serwery OpenStreetMap są niedostępne. Skorzystaj z wyszukiwarki Google Maps poniżej — działa niezależnie.</div>';
 }finally{
  btn.disabled=false;btn.textContent='⌕ Automatycznie z OSM';
 }
}
function renderDiscovery(){let html='';for(const r of lastResults){const existing=leads.some(l=>l.id===r.id||(l.name.toLowerCase()===r.name.toLowerCase()&&l.phone===r.phone));html+=`<div class="result"><strong>${escapeHtml(r.name)}</strong><p>${escapeHtml(r.address||'Szczecin')}<br>${escapeHtml(r.category)}</p><div class="details">${r.website?'🌐 WWW w OSM':'○ Brak adresu WWW w OSM'} · ${r.phone?'☎ Telefon podany':'Bez telefonu'}</div><a class="google-check" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(r.name+' '+r.address)}" target="_blank" rel="noopener noreferrer">Sprawdź w Google Maps ↗</a><button class="btn ${existing?'subtle':'primary'}" ${existing?'disabled':''} data-add="${escapeHtml(r.id)}">${existing?'Dodano':' + Dodaj do kontaktów'}</button></div>`}$('discoveryResults').innerHTML=html||'<div class="empty">W wybranej kategorii nie znaleziono wpisów.</div>';document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>{let l=lastResults.find(x=>x.id===b.dataset.add);if(!l)return;leads.unshift(l);save();renderDiscovery();toast('Dodano: '+l.name)}))}
// Simple lead selection: a deterministic heuristic, not professional website audit.
function pickTen(){
 const items=lastResults.filter(l=>normalizePhone(l.phone)&&!leads.some(x=>x.id===l.id||(x.name.toLowerCase()===l.name.toLowerCase()&&x.phone===l.phone))).sort((a,b)=>Number(!!a.website)-Number(!!b.website)||a.name.localeCompare(b.name,'pl')).slice(0,10);
 if(!items.length){toast('Brak nowych firm z numerem telefonu w wynikach');return}
 leads.unshift(...items);save();renderDiscovery();toast(`Dodano ${items.length} kandydatów do weryfikacji (bez zgody na SMS).`);switchTab('leads');
}
function isIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function smsURL(number,message,withBody=true){return 'sms:'+encodeURIComponent(number).replace('%2B','+')+(withBody?(isIOS()?'&body=':'?body=')+encodeURIComponent(message):'')}
function launchSMS(phone,msg,withBody=true){
 if(!isIOS()&&!/Android/i.test(navigator.userAgent)){toast('Otwórz panel na iPhonie. Na komputerze skopiuj tekst.');return false}
 const link=document.createElement('a');link.href=smsURL(phone,msg,withBody);link.style.display='none';document.body.appendChild(link);link.click();link.remove();
 toast('Sprawdź numer i treść w Wiadomościach. Naciśnij Wyślij samodzielnie.');return true;
}
function renderQueue(){
 const box=$('queueList');if(!box)return;
 let eligible=leads.filter(x=>consentOK(x)&&normalizePhone(x.phone)&&!x.sentAt);
 $('queueDescription').textContent=eligible.length?`${eligible.length} kontaktów z udokumentowaną zgodą i numerem. Wysyłaj pojedynczo, tylko po własnej weryfikacji.`:'Brak kontaktów gotowych do wysłania. W bazie firmy muszą mieć numer i rzeczywistą wcześniejszą zgodę.';
 box.innerHTML=eligible.map(l=>`<div class="queue-item"><div><strong>${escapeHtml(l.name)}</strong><small>${escapeHtml(normalizePhone(l.phone))} • ${escapeHtml(l.consentSource)}</small></div><button class="btn primary" data-queue="${escapeHtml(l.id)}">Przygotuj SMS</button></div>`).join('')||'<div class="queue-empty">Najpierw znajdź firmę albo dodaj kontakt, a następnie zapisz udzieloną zgodę. Publiczny numer nie jest zgodą.</div>';
 box.querySelectorAll('[data-queue]').forEach(el=>el.addEventListener('click',()=>openLead(el.dataset.queue)));
}
// Start UI
for(const b of document.querySelectorAll('.nav'))b.addEventListener('click',()=>switchTab(b.dataset.tab));
$('search').addEventListener('input',render);$('filter').addEventListener('change',render);
$('addBtn').addEventListener('click',()=>openLead());$('emptyDiscover').addEventListener('click',()=>switchTab('discover'));
$('discoverBtn').addEventListener('click',discover);$('pickTen').addEventListener('click',pickTen);
$('googleKeyword').addEventListener('input',updateGoogleLinks);$('area').addEventListener('change',updateGoogleLinks);$('category').addEventListener('change',()=>{$('googleKeyword').value=googleKeywords[$('category').value]||'lokalne firmy';updateGoogleLinks()});updateGoogleLinks();$('refreshQueue').addEventListener('click',renderQueue);$('exportBtn').addEventListener('click',exportData);
$('fileInput').addEventListener('change',async e=>{try{await importCSV(e.target.files[0])}catch(ex){toast('Błąd importu: '+ex.message)}e.target.value=''});
$('closeModal').addEventListener('click',closeModal);$('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal()});window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('modal').hidden)closeModal()});
for(const id of ['editPhone','editConsent','editConsentDate','editConsentSource','editOptOut'])$(id).addEventListener('input',updateSendHint);
$('regenerate').addEventListener('click',()=>{$('message').value=generateDraft(getModalFields());toast('Szkic odświeżony')});
$('copyMessage').addEventListener('click',async()=>{try{await copyText($('message').value);toast('Skopiowano wiadomość')}catch{toast('Nie udało się skopiować')}});
$('saveLead').addEventListener('click',()=>{if(persistEditing()){toast('Zapisano kontakt');closeModal()}});
$('deleteLead').addEventListener('click',()=>{if(editing&&confirm('Usunąć ten kontakt?')){leads=leads.filter(x=>x.id!==editing);save();closeModal();toast('Usunięto kontakt')}});
$('sendSMS').addEventListener('click',()=>{let l=persistEditing();if(!l||!consentOK(l)||!normalizePhone(l.phone)||!l.message)return;launchSMS(normalizePhone(l.phone),l.message,true)});
$('copyAndOpen').addEventListener('click',()=>{let l=persistEditing();if(!l||!consentOK(l)||!normalizePhone(l.phone)||!l.message)return;/* Copy on user gesture before opening app; fallback for iOS that ignores body */try{const promise=copyText(l.message);if(promise&&promise.catch)promise.catch(()=>{});}catch{}launchSMS(normalizePhone(l.phone),l.message,false)});
$('markSent').addEventListener('click',()=>{let l=persistEditing();if(!l||!consentOK(l)||!normalizePhone(l.phone))return;if(confirm('Potwierdzasz, że SMS został faktycznie wysłany?')){l.sentAt=new Date().toISOString();save();closeModal();toast('Zapisano status wysłania')}});
$('testSMS').addEventListener('click',()=>{let phone=normalizePhone($('myPhone').value);if(!phone){toast('W Ustawieniach wpisz własny polski numer telefonu');switchTab('settings');return}launchSMS(phone,'TEST 1stMil: Jeśli czytasz ten SMS, otwieranie Wiadomości działa. — Krystian',true)});
$('copyTest').addEventListener('click',()=>copyText('TEST 1stMil: Jeśli czytasz ten SMS, otwieranie Wiadomości działa. — Krystian').then(()=>toast('Skopiowano SMS testowy')));
$('owner').value=settings.owner;$('myPhone').value=settings.phone;$('portfolio').value=settings.portfolio;
$('saveSettings').addEventListener('click',()=>{settings={owner:$('owner').value.trim(),phone:$('myPhone').value.trim(),portfolio:$('portfolio').value.trim()};localStorage.setItem(SETTINGS,JSON.stringify(settings));toast('Zapisano ustawienia')});
$('clearBtn').addEventListener('click',()=>{if(confirm('Na pewno usunąć WSZYSTKIE kontakty zapisane w tej przeglądarce?')){leads=[];save();toast('Baza kontaktów wyczyszczona')}});
render();

renderQueue();
