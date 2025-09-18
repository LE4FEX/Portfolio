const API = {
  key: '2192b0dc1585a56243ae7c7328937bb5',
  base: 'https://api.openweathermap.org/data/2.5/weather'
};

const q = document.getElementById('q');
const unitSel = document.getElementById('unit');
const geoBtn = document.getElementById('geoBtn');
const card = document.getElementById('card');
const msg = document.getElementById('msg');
const form = document.getElementById('searchForm');
const historyEl = document.getElementById('history');
const themeToggle = document.getElementById('themeToggle');

let timer = null;
let aborter = null;

// ======= theme =======
const THEME_KEY = 'theme';
const root = document.documentElement;
function getPreferredTheme(){
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (_) {}
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
const themeMeta = document.querySelector('meta[name="theme-color"]');
function applyTheme(theme){
  const dark = theme === 'dark';
  root.classList.toggle('dark', dark);
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  if (themeToggle) {
    themeToggle.textContent = dark ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', dark ? 'โหมดสว่าง' : 'โหมดมืด');
    themeToggle.setAttribute('title', 'สลับธีม');
  }
  if (themeMeta) themeMeta.setAttribute('content', dark ? '#0f141a' : '#f7f7f7');
}
let theme = getPreferredTheme();
applyTheme(theme);
if (themeToggle){
  themeToggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, theme); }
    catch (_) {}
    applyTheme(theme);
  });
}

window.addEventListener('storage', (event) => {
  if (event.key === THEME_KEY) {
    theme = event.newValue === 'dark' ? 'dark' : 'light';
    applyTheme(theme);
  }
});

// ======= load saved =======
const saved = JSON.parse(localStorage.getItem('weather:last') || 'null');
const history = JSON.parse(localStorage.getItem('weather:history') || '[]'); // [{city,unit,ts}]
if (saved) {
  q.value = saved.city;
  unitSel.value = saved.unit || 'metric';
  fetchWeatherByCity(saved.city, saved.unit);
}
renderHistory();

// ======= events =======
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = normCity(q.value);
  if (!city) return;
  fetchWeatherByCity(city, unitSel.value);
});

q.addEventListener('input', () => {
  clearTimeout(timer);
  const city = normCity(q.value);
  if (!city) { clearUI(); return; }
  timer = setTimeout(() => fetchWeatherByCity(city, unitSel.value), 500);
});

unitSel.addEventListener('change', () => {
  const city = normCity(q.value);
  if (city) fetchWeatherByCity(city, unitSel.value);
});

geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) { msg.textContent = 'เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง'; return; }
  msg.textContent = 'กำลังขอตำแหน่ง...';
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude:lat, longitude:lon } = pos.coords;
      fetchWeatherByCoords(lat, lon, unitSel.value);
    },
    () => { msg.textContent = 'ไม่สามารถอ่านตำแหน่งได้'; },
    { enableHighAccuracy:true, timeout:10000, maximumAge:300000 }
  );
});

// ======= fetchers =======
async function fetchWeatherByCity(city, units='metric') {
  const url = `${API.base}?q=${encodeURIComponent(city)}&appid=${API.key}&units=${units}&lang=th`;
  return fetchAndRender(url, units, city);
}
async function fetchWeatherByCoords(lat, lon, units='metric') {
  const url = `${API.base}?lat=${lat}&lon=${lon}&appid=${API.key}&units=${units}&lang=th`;
  return fetchAndRender(url, units);
}

async function fetchAndRender(url, units, fallbackCity) {
  if (!navigator.onLine) {
    try {
      const cached = await caches.match(url);
      if (cached) {
        const data = await cached.json();
        render(data, units);
        msg.textContent = 'ออฟไลน์: แสดงข้อมูลจากแคช';
        return;
      }
    } catch (_) {}
    clearUI();
    msg.textContent = 'ออฟไลน์อยู่ ตรวจการเชื่อมต่อ';
    return;
  }

  // ยกเลิกคำขอเก่าเมื่อมีคำขอใหม่
  if (aborter) aborter.abort();
  aborter = new AbortController();

  try {
    setLoading(true);
    msg.textContent = '';
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: aborter.signal });
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const data = await res.json();
    render(data, units);
    const cityName = data.name || fallbackCity || '';
    localStorage.setItem('weather:last', JSON.stringify({ city: cityName, unit: units }));
    addHistory(cityName, units);
  } catch (err) {
    if (err.name === 'AbortError') return; // ถูกยกเลิก
    clearUI();
    msg.textContent = prettyError(err);
  } finally {
    setLoading(false);
  }
}

// ======= history =======
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
  if (!history.length){ historyEl.innerHTML=''; return; }
  historyEl.innerHTML = history.map(h => `
    <span class="chip">
      <button type="button" data-city="${escapeHtml(h.city)}" data-unit="${h.unit}">
        ${escapeHtml(h.city)} ${h.unit==='imperial'?'(°F)':'(°C)'}
      </button>
    </span>
  `).join('');
  historyEl.onclick = (e)=>{
    const b = e.target.closest('button[data-city]');
    if (!b) return;
    const city = b.getAttribute('data-city');
    const unit = b.getAttribute('data-unit') || 'metric';
    q.value = city;
    unitSel.value = unit;
    fetchWeatherByCity(city, unit);
  };
}

// ======= render UI =======
function render(d, units) {
  const u = units === 'imperial' ? '°F' : '°C';
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

// ======= helpers =======
function normCity(s){ return (s || '').trim().replace(/\s+/g,' '); }
function clearUI(){ card.classList.add('hidden'); card.innerHTML=''; }
function setLoading(v){ card.classList.toggle('loading', v); }
function round(x){ return x!=null ? Math.round(x) : '-'; }
function capitalize(s){ return s ? s[0].toUpperCase()+s.slice(1) : ''; }
function escapeHtml(str){ const d=document.createElement('div'); d.innerText=str; return d.innerHTML; }
function timeFromUnix(unix, tzOffsetSec){
  const ms = (unix + (tzOffsetSec||0)) * 1000;
  const d = new Date(ms);
  // แสดงเป็น HH:MM ตามโซนของเมืองนั้น
  const hh = String(d.getUTCHours()).padStart(2,'0');
  const mm = String(d.getUTCMinutes()).padStart(2,'0');
  return `${hh}:${mm}`;
}
function prettyError(err){
  const code = String(err.message || '').replace('Error:','').trim();
  if (code.startsWith('HTTP_401')) return 'คีย์ API ไม่ถูกต้องหรือยังไม่พร้อมใช้งาน';
  if (code.startsWith('HTTP_404')) return 'ไม่พบเมืองตามที่ค้นหา';
  if (code.startsWith('HTTP_429')) return 'เรียก API บ่อยเกินไป (rate limit)';
  return 'เกิดข้อผิดพลาดในการดึงข้อมูล';
}
