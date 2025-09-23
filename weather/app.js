// ใช้ Netlify Function แทนเรียก OpenWeather ตรงๆ
const API = { base: '/.netlify/functions/weather' };

// DOM
const q = document.getElementById('q');
const unitSel = document.getElementById('unit');
const geoBtn = document.getElementById('geoBtn');
const card = document.getElementById('card');
const forecastEl = document.getElementById('forecast');
const msg = document.getElementById('msg');
const form = document.getElementById('searchForm');
const historyEl = document.getElementById('history');
const themeToggle = document.getElementById('themeToggle');
const tabNow = document.getElementById('tabNow');
const tab5d  = document.getElementById('tab5d');

const kvKey = 'weather:kv';
let timer = null, aborter = null;
let currentTab = 'now'; // 'now' | '5d'

// ======= Theme (persist + meta theme-color) =======
const THEME_KEY = 'theme';
const root = document.documentElement;
const themeMeta = document.querySelector('meta[name="theme-color"]');
function getPreferredTheme(){
  try{const saved = localStorage.getItem(THEME_KEY); if (saved==='dark'||saved==='light') return saved;}catch(_){}
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(theme){
  const dark = theme==='dark';
  root.classList.toggle('dark', dark);
  root.setAttribute('data-theme', dark?'dark':'light');
  if (themeToggle){ themeToggle.textContent = dark ? '☀️' : '🌙'; }
  if (themeMeta){
    const styles = getComputedStyle(root);
    const panel = styles.getPropertyValue('--panel').trim();
    themeMeta.setAttribute('content', panel || (dark ? '#08233a' : '#dff3ff'));
  }
}
let theme = getPreferredTheme(); applyTheme(theme);
themeToggle?.addEventListener('click', ()=>{ theme = theme==='dark'?'light':'dark'; try{localStorage.setItem(THEME_KEY,theme);}catch(_){}
  applyTheme(theme);
});
window.addEventListener('storage',(e)=>{ if(e.key===THEME_KEY){ theme=e.newValue==='dark'?'dark':'light'; applyTheme(theme); }});

// ======= Tabs =======
function setTab(tab){
  currentTab = tab;
  tabNow.classList.toggle('on', tab==='now');
  tab5d.classList.toggle('on',  tab==='5d');
  card.classList.toggle('hidden', tab==='5d');
  forecastEl.classList.toggle('hidden', tab!=='5d');
}
tabNow?.addEventListener('click', ()=>setTab('now'));
tab5d ?.addEventListener('click', ()=>setTab('5d'));

// ======= Saved & History =======
const saved = JSON.parse(localStorage.getItem('weather:last') || 'null');
const history = JSON.parse(localStorage.getItem('weather:history') || '[]');
if (saved){ q.value = saved.city; unitSel.value = saved.unit || 'metric'; fetchWeatherByCity(saved.city, saved.unit); }
renderHistory();

// ======= Events =======
form.addEventListener('submit',(e)=>{ e.preventDefault(); const city=normCity(q.value); if(!city)return; fetchWeatherByCity(city,unitSel.value); });
q.addEventListener('input',()=>{ clearTimeout(timer); const city=normCity(q.value); if(!city){clearUI();return;} timer=setTimeout(()=>fetchWeatherByCity(city,unitSel.value),500); });
unitSel.addEventListener('change',()=>{ const city=normCity(q.value); if(city) fetchWeatherByCity(city,unitSel.value); });
geoBtn.addEventListener('click',()=>{
  if(!navigator.geolocation){ msg.textContent='เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง'; return; }
  msg.textContent='กำลังขอตำแหน่ง...';
  navigator.geolocation.getCurrentPosition(
    pos=>{ const {latitude:lat,longitude:lon}=pos.coords; fetchWeatherByCoords(lat,lon,unitSel.value); },
    ()=>{ msg.textContent='ไม่สามารถอ่านตำแหน่งได้'; },
    { enableHighAccuracy:true, timeout:10000, maximumAge:300000 }
  );
});

// ======= Fetchers (current / forecast) =======
async function fetchWeatherByCity(city, units='metric'){
  if (currentTab==='5d') return fetchForecastByCity(city, units);
  const url = `${API.base}?q=${encodeURIComponent(city)}&units=${units}`;
  return fetchAndRender(url, units, city);
}
async function fetchWeatherByCoords(lat, lon, units='metric'){
  if (currentTab==='5d') return fetchForecastByCoords(lat, lon, units);
  const url = `${API.base}?lat=${lat}&lon=${lon}&units=${units}`;
  return fetchAndRender(url, units);
}
async function fetchForecastByCity(city, units='metric'){
  const url = `${API.base}?t=forecast&q=${encodeURIComponent(city)}&units=${units}`;
  return fetchAndRenderForecast(url, units, city);
}
async function fetchForecastByCoords(lat, lon, units='metric'){
  const url = `${API.base}?t=forecast&lat=${lat}&lon=${lon}&units=${units}`;
  return fetchAndRenderForecast(url, units);
}

// ======= Current weather flow =======
async function fetchAndRender(url, units, fallbackCity){
  if (!navigator.onLine) {
    const cachedLocal = fallbackCity ? kvGet(fallbackCity, units) : null;
    if (cachedLocal){ render(cachedLocal, units); msg.textContent='แสดงจากแคชโลคัล • กำลังอัปเดตข้อมูล'; }
    try{ const cached = await caches.match(url); if(cached){ const data=await cached.json(); render(data,units); kvSet(data.name||fallbackCity||'',units,data); msg.textContent='ออฟไลน์: แสดงจากแคช'; return; } }catch(_){}
    clearUI(); msg.textContent='ออฟไลน์อยู่ ตรวจการเชื่อมต่อ'; return;
  }
  if (aborter) aborter.abort();
  aborter = new AbortController();
  try{
    setLoading(true); msg.textContent=''; showSkeleton();
    const res = await fetch(url,{headers:{'Accept':'application/json'},signal:aborter.signal});
    if(!res.ok) throw new Error(`HTTP_${res.status}`);
    const data = await res.json();
    render(data, units);
    const cityName = data.name || fallbackCity || '';
    localStorage.setItem('weather:last', JSON.stringify({ city: cityName, unit: units }));
    addHistory(cityName, units);
    kvSet(cityName, units, data);
  }catch(err){
    if (err.name==='AbortError') return;
    clearUI(); msg.textContent = prettyError(err);
  }finally{ setLoading(false); }
}

// ======= Forecast flow =======
async function fetchAndRenderForecast(url, units, fallbackCity){
  if (!navigator.onLine) {
    try{ const cached = await caches.match(url); if(cached){ const data=await cached.json(); renderForecast(data, units); msg.textContent='ออฟไลน์: แสดงจากแคช'; setTab('5d'); return; } }catch(_){}
    clearUI(); forecastEl.innerHTML=''; msg.textContent='ออฟไลน์อยู่ ตรวจการเชื่อมต่อ'; return;
  }
  if (aborter) aborter.abort();
  aborter = new AbortController();
  try{
    setLoading(true); msg.textContent=''; showSkeleton();
    const res = await fetch(url,{headers:{'Accept':'application/json'},signal:aborter.signal});
    if(!res.ok) throw new Error(`HTTP_${res.status}`);
    const data = await res.json();
    renderForecast(data, units);
    const cityName = data.city?.name || fallbackCity || '';
    localStorage.setItem('weather:last', JSON.stringify({ city: cityName, unit: units }));
    addHistory(cityName, units);
    setTab('5d');
  }catch(err){
    if (err.name==='AbortError') return;
    clearUI(); forecastEl.innerHTML=''; msg.textContent = prettyError(err);
  }finally{ setLoading(false); }
}

// ======= History =======
function addHistory(city, unit){
  if (!city) return;
  const next = history.filter(h => h.city.toLowerCase() !== city.toLowerCase());
  next.unshift({ city, unit, ts: Date.now() });
  while (next.length > 5) next.pop();
  localStorage.setItem('weather:history', JSON.stringify(next));
  history.length = 0; next.forEach(x => history.push(x));
  renderHistory();
}
function renderHistory(){
  if (!history.length){ historyEl.innerHTML=''; }
  else {
    historyEl.innerHTML = history.map(h => `
      <span class="chip">
        <button type="button" data-city="${escapeHtml(h.city)}" data-unit="${h.unit}">
          ${escapeHtml(h.city)} ${h.unit==='imperial'?'(°F)':'(°C)'}
        </button>
        <button class="rm" type="button" data-rm="${escapeHtml(h.city)}" title="ลบ">✕</button>
      </span>
    `).join('') + ` <button id="clearHist" type="button" class="chip">ล้างประวัติ</button>`;
  }
  historyEl.onclick = (e)=>{
    const del = e.target.closest('button[data-rm]');
    if (del){
      const city = del.getAttribute('data-rm');
      const next = history.filter(h => h.city.toLowerCase() !== city.toLowerCase());
      localStorage.setItem('weather:history', JSON.stringify(next));
      history.length = 0; next.forEach(x=>history.push(x));
      renderHistory(); return;
    }
    if (e.target.id === 'clearHist'){ localStorage.removeItem('weather:history'); history.length = 0; renderHistory(); return; }
    const b = e.target.closest('button[data-city]'); if (!b) return;
    const city = b.getAttribute('data-city'); const unit = b.getAttribute('data-unit') || 'metric';
    q.value = city; unitSel.value = unit; fetchWeatherByCity(city, unit);
  };
}

// ======= Renderers =======
function render(d, units){
  const u = units==='imperial'?'°F':'°C';
  const icon = d.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png` : '';
  const desc = d.weather?.[0]?.description || '-';
  const feels = round(d.main?.feels_like);
  const temp = round(d.main?.temp);
  const humid = d.main?.humidity ?? '-';
  const wind = d.wind?.speed != null ? `${d.wind.speed}${units==='imperial'?' mph':' m/s'}` : '-';
  const sunrise = d.sys?.sunrise ? timeFromUnix(d.sys.sunrise, d.timezone) : '-';
  const sunset  = d.sys?.sunset  ? timeFromUnix(d.sys.sunset , d.timezone) : '-';

  card.innerHTML = `
    <h2 class="city">${d.name || ''}${d.sys?.country ? `, ${d.sys.country}`:''}</h2>
    <div class="row">
      <div>
        <div class="temp">${temp}${u}</div>
        <div class="muted">รู้สึกเหมือน ${feels}${u} • ${capitalize(desc)}</div>
      </div>
      ${icon ? `<img src="${icon}" alt="${desc}" width="100" height="100" />` : ''}
    </div>
    <div class="row" style="margin-top:.5rem">
      <span class="badge">ความชื้น ${humid}%</span>
      <span class="badge">ลม ${wind}</span>
      <span class="badge">พระอาทิตย์ขึ้น ${sunrise}</span>
      <span class="badge">ตก ${sunset}</span>
    </div>
  `;
  card.classList.remove('hidden');
}

function renderForecast(d, units){
  if (!Array.isArray(d.list)){ forecastEl.innerHTML=''; return; }
  const byDay = {};
  d.list.forEach(item=>{
    const ts = (item.dt + (d.city?.timezone||0));
    const dayKey = new Date(ts*1000).toISOString().slice(0,10);
    const t = item.main?.temp;
    const icon = item.weather?.[0]?.icon;
    const desc = item.weather?.[0]?.description || '';
    if (!byDay[dayKey]) byDay[dayKey] = { min:t, max:t, icons:{}, descs:{} };
    byDay[dayKey].min = Math.min(byDay[dayKey].min, t);
    byDay[dayKey].max = Math.max(byDay[dayKey].max, t);
    if (icon) byDay[dayKey].icons[icon] = (byDay[dayKey].icons[icon]||0)+1;
    if (desc) byDay[dayKey].descs[desc] = (byDay[dayKey].descs[desc]||0)+1;
  });
  const days = Object.entries(byDay)
    .sort((a,b)=>a[0].localeCompare(b[0]))
    .slice(0,5)
    .map(([date,info])=>{
      const topIcon = Object.entries(info.icons).sort((a,b)=>b[1]-a[1])[0]?.[0] || '';
      const topDesc = Object.entries(info.descs).sort((a,b)=>b[1]-a[1])[0]?.[0] || '';
      return { date, min:Math.round(info.min), max:Math.round(info.max), icon:topIcon, desc:topDesc };
    });

  const u = units==='imperial'?'°F':'°C';
  forecastEl.innerHTML = days.map(dy=>{
    const label = toThaiDateLabel(dy.date, d.city?.timezone || 0);
    const iconURL = dy.icon ? `https://openweathermap.org/img/wn/${dy.icon}.png` : '';
    return `
      <div class="day">
        <h4>${label}</h4>
        ${iconURL ? `<img src="${iconURL}" alt="${escapeHtml(dy.desc)}" width="50" height="50">` : ''}
        <div><strong>${dy.max}${u}</strong> / <span class="small">${dy.min}${u}</span></div>
        <div class="small">${capitalize(dy.desc)}</div>
      </div>`;
  }).join('');
}

// ======= Helpers =======
function normCity(s){ return (s||'').trim().replace(/\s+/g,' '); }
function clearUI(){ card.classList.add('hidden'); card.innerHTML=''; }
function setLoading(v){ card.classList.toggle('loading', v); }
function round(x){ return x!=null ? Math.round(x) : '-'; }
function capitalize(s){ return s ? s[0].toUpperCase()+s.slice(1) : ''; }
function escapeHtml(str){ const d=document.createElement('div'); d.innerText=str; return d.innerHTML; }
function timeFromUnix(unix, tzOff){ const ms=(unix+(tzOff||0))*1000; const d=new Date(ms); const hh=String(d.getUTCHours()).padStart(2,'0'); const mm=String(d.getUTCMinutes()).padStart(2,'0'); return `${hh}:${mm}`; }
function toThaiDateLabel(ymd){ const [y,m,d]=ymd.split('-').map(Number); const dt=new Date(Date.UTC(y,m-1,d)); const days=['อา','จ','อ','พ','พฤ','ศ','ส']; return `${days[dt.getUTCDay()]} ${d}/${m}`; }

// Skeleton
function showSkeleton(){
  card.innerHTML = `
    <div class="skel">
      <div class="bar" style="width:40%"></div>
      <div class="bar" style="height:2.2rem;width:30%"></div>
      <div class="bar" style="width:60%"></div>
      <div class="bar" style="width:80%"></div>
    </div>`;
  card.classList.remove('hidden');
}

// Local key-value cache
function kvSet(city, unit, data){
  const k = `${unit}:${(city||'').toLowerCase()}`;
  const kv = JSON.parse(localStorage.getItem(kvKey) || '{}');
  kv[k] = { data, ts: Date.now() };
  const entries = Object.entries(kv).sort((a,b)=>b[1].ts - a[1].ts).slice(0,5);
  localStorage.setItem(kvKey, JSON.stringify(Object.fromEntries(entries)));
}
function kvGet(city, unit){
  const k = `${unit}:${(city||'').toLowerCase()}`;
  const kv = JSON.parse(localStorage.getItem(kvKey) || '{}');
  return kv[k]?.data || null;
}