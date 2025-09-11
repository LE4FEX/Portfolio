const API = {
  key: 'YOUR_API_KEY', // ใส่คีย์ OpenWeather ของคุณ
  base: 'https://api.openweathermap.org/data/2.5/weather'
};

const q       = document.getElementById('q');
const unitSel = document.getElementById('unit');
const geoBtn  = document.getElementById('geoBtn');
const card    = document.getElementById('card');
const msg     = document.getElementById('msg');
const form    = document.getElementById('searchForm');
const historyEl = document.getElementById('history');

let timer = null;

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
  const city = q.value.trim();
  if (!city) return;
  fetchWeatherByCity(city, unitSel.value);
});

q.addEventListener('input', () => {
  clearTimeout(timer);
  const city = q.value.trim();
  if (!city) { clearUI(); return; }
  timer = setTimeout(() => fetchWeatherByCity(city, unitSel.value), 500);
});

unitSel.addEventListener('change', () => {
  const city = q.value.trim();
  if (city) fetchWeatherByCity(city, unitSel.value);
});

geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    msg.textContent = 'เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง';
    return;
  }
  msg.textContent = 'กำลังขอตำแหน่ง...';
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude:lat, longitude:lon } = pos.coords;
      fetchWeatherByCoords(lat, lon, unitSel.value);
    },
    err => {
      msg.textContent = 'ไม่สามารถอ่านตำแหน่งได้';
    },
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
  try {
    setLoading(true);
    msg.textContent = '';
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    render(data, units);
    const cityName = data.name || fallbackCity || '';
    // cache last
    localStorage.setItem('weather:last', JSON.stringify({ city: cityName, unit: units }));
    // update history
    addHistory(cityName, units);
  } catch (err) {
    clearUI();
    msg.textContent = 'ไม่พบเมือง หรือเกิดข้อผิดพลาดในการดึงข้อมูล';
  } finally {
    setLoading(false);
  }
}

// ======= history =======
function addHistory(city, unit){
  if (!city) return;
  // ลบ city เดิมถ้ามี แล้ว unshift
  const next = history.filter(h => h.city.toLowerCase() !== city.toLowerCase());
  next.unshift({ city, unit, ts: Date.now() });
  // จำกัด 5 รายการ
  while (next.length > 5) next.pop();
  // เขียนกลับ
  localStorage.setItem('weather:history', JSON.stringify(next));
  // อัปเดตตัวแปรในหน่วยความจำและวาดใหม่
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
      <span class="badge">ความกดอากาศ ${d.main?.pressure ?? '-'} hPa</span>
    </div>
  `;
  card.classList.remove('hidden');
}

// ======= helpers =======
function clearUI() {
  card.classList.add('hidden');
  card.innerHTML = '';
}
function setLoading(v) {
  card.classList.toggle('loading', v);
}
function round(x){ return x!=null ? Math.round(x) : '-'; }
function capitalize(s){ return s ? s[0].toUpperCase()+s.slice(1) : ''; }
function escapeHtml(str){ const d=document.createElement('div'); d.innerText=str; return d.innerHTML; }