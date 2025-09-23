// Weather app frontend logic: fetch via Netlify function, handle theming, history, and i18n.
const API = { base: '/.netlify/functions/weather' };

const I18N = {
  en: {
    appTitle: 'Weather',
    tagline: 'Realtime from OpenWeather API',
    backHome: 'Back to main',
    langName: 'Language',
    langSelectAria: 'Change language',
    placeholder: 'Type a city, e.g. Bangkok',
    geoBtn: 'Use my location',
    geoBtnTitle: 'Use current location',
    tabs: { now: 'Today', forecast: '5 Day' },
    tabListLabel: 'Weather views',
    historyLabel: 'Recent history',
    historyClear: 'Clear history',
    historyRemoveTitle: 'Remove',
    clearHistoryTitle: 'Clear history',
    messages: {
      requestingLocation: 'Requesting your location…',
      locationError: 'Unable to read location',
      geolocationUnsupported: 'Geolocation is not supported by this browser',
      offlineUpdating: 'Showing cached data • Updating…',
      offlineFromCache: 'Offline: showing cached data',
      offlineCheckConnection: 'You are offline. Check your connection.',
      offlineForecastFromCache: 'Offline: showing cached forecast',
      offlineForecastNoData: 'Offline. Check your connection.',
      storageCleared: 'History cleared',
      notifyEnabled: 'Weather notifications enabled',
      notifyDisabled: 'Weather notifications disabled',
      notifyDenied: 'Permission for notifications was not granted',
      notifyBlocked: 'Notifications are blocked in your browser settings',
      notifyUnsupported: 'Notifications are not supported in this browser'
    },
    cards: {
      feelsLike: 'Feels like {value}{unit} • {description}',
      humidity: 'Humidity {value}%',
      wind: 'Wind {value}',
      sunrise: 'Sunrise {value}',
      sunset: 'Sunset {value}',
      forecastRange: '{max}{unit} / {min}{unit}'
    },
    windUnits: { metric: ' m/s', imperial: ' mph' },
    errors: {
      HTTP_404: 'City not found',
      HTTP_401: 'API key is invalid',
      HTTP_429: 'Too many requests, please try again later',
      network: 'Network error, please try again',
      default: 'Sorry, something went wrong'
    },
    forecastDay: '{day} {date}',
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    chipsUnits: { metric: '(°C)', imperial: '(°F)' },
    theme: {
      toggleToDark: 'Switch to dark theme',
      toggleToLight: 'Switch to light theme'
    },
    notify: {
      enable: 'Enable notifications',
      disable: 'Disable notifications',
      toggleTitle: 'Toggle weather notifications',
      unsupported: 'Notifications are not supported in this browser',
      blocked: 'Notifications are blocked. Change your browser settings to enable them.',
      permissionTitle: 'Notifications enabled',
      permissionBody: 'You will receive updates when the weather changes.',
      weatherTitle: 'Weather in {city}',
      weatherBody: '{temp}{unit} • {description}',
      unknownCity: 'your area'
    }
  },
  th: {
    appTitle: 'สภาพอากาศ',
    tagline: 'ข้อมูลเรียลไทม์จาก OpenWeather API',
    backHome: 'กลับหน้าหลัก',
    langName: 'ภาษา',
    langSelectAria: 'เปลี่ยนภาษา',
    placeholder: 'พิมพ์ชื่อเมือง เช่น Bangkok',
    geoBtn: 'ใช้ตำแหน่งฉัน',
    geoBtnTitle: 'ใช้ตำแหน่งปัจจุบัน',
    tabs: { now: 'วันนี้', forecast: '5 วัน' },
    tabListLabel: 'ตัวเลือกการแสดงผล',
    historyLabel: 'ประวัติล่าสุด',
    historyClear: 'ล้างประวัติ',
    historyRemoveTitle: 'ลบ',
    clearHistoryTitle: 'ล้างประวัติ',
    messages: {
      requestingLocation: 'กำลังขอตำแหน่ง…',
      locationError: 'ไม่สามารถอ่านตำแหน่งได้',
      geolocationUnsupported: 'เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง',
      offlineUpdating: 'แสดงจากแคชโลคัล • กำลังอัปเดตข้อมูล',
      offlineFromCache: 'ออฟไลน์: แสดงจากแคช',
      offlineCheckConnection: 'ออฟไลน์อยู่ ตรวจการเชื่อมต่อ',
      offlineForecastFromCache: 'ออฟไลน์: แสดงพยากรณ์จากแคช',
      offlineForecastNoData: 'ออฟไลน์อยู่ ตรวจการเชื่อมต่อ',
      storageCleared: 'ล้างประวัติแล้ว',
      notifyEnabled: 'เปิดการแจ้งเตือนแล้ว',
      notifyDisabled: 'ปิดการแจ้งเตือนแล้ว',
      notifyDenied: 'ไม่ได้รับสิทธิแจ้งเตือน',
      notifyBlocked: 'การแจ้งเตือนถูกบล็อกในเบราว์เซอร์',
      notifyUnsupported: 'เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน'
    },
    cards: {
      feelsLike: 'รู้สึกเหมือน {value}{unit} • {description}',
      humidity: 'ความชื้น {value}%',
      wind: 'ลม {value}',
      sunrise: 'พระอาทิตย์ขึ้น {value}',
      sunset: 'ตก {value}',
      forecastRange: '{max}{unit} / {min}{unit}'
    },
    windUnits: { metric: ' เมตร/วินาที', imperial: ' ไมล์/ชั่วโมง' },
    errors: {
      HTTP_404: 'ไม่พบเมืองที่ค้นหา',
      HTTP_401: 'API key ไม่ถูกต้อง',
      HTTP_429: 'เรียกใช้งานบ่อยเกินไป ลองใหม่อีกครั้ง',
      network: 'เครือข่ายมีปัญหา ลองใหม่อีกครั้ง',
      default: 'เกิดข้อผิดพลาด กรุณาลองใหม่'
    },
    forecastDay: '{day} {date}',
    daysShort: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
    chipsUnits: { metric: '(°C)', imperial: '(°F)' },
    theme: {
      toggleToDark: 'สลับเป็นโหมดมืด',
      toggleToLight: 'สลับเป็นโหมดสว่าง'
    },
    notify: {
      enable: 'เปิดแจ้งเตือน',
      disable: 'ปิดแจ้งเตือน',
      toggleTitle: 'สลับการแจ้งเตือนสภาพอากาศ',
      unsupported: 'เบราว์เซอร์ไม่รองรับการแจ้งเตือน',
      blocked: 'การแจ้งเตือนถูกบล็อก กรุณาเปิดในตั้งค่าเบราว์เซอร์',
      permissionTitle: 'เปิดแจ้งเตือนแล้ว',
      permissionBody: 'คุณจะได้รับการแจ้งเตือนเมื่อข้อมูลอากาศอัปเดต',
      weatherTitle: 'สภาพอากาศ {city}',
      weatherBody: '{temp}{unit} • {description}',
      unknownCity: 'พื้นที่ของคุณ'
    }
  }
};

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
const tab5d = document.getElementById('tab5d');
const appTitleEl = document.getElementById('appTitle');
const appTaglineEl = document.getElementById('appTagline');
const backHomeEl = document.getElementById('backHome');
const langSelect = document.getElementById('langSelect');
const langLabelEl = document.getElementById('langLabel');
const tabsWrap = document.querySelector('.tabs');
let notifyBtn = document.getElementById('notifyBtn');

const kvKey = 'weather:kv';
const THEME_KEY = 'theme';
const LANG_KEY = 'weather:lang';
const NOTIFY_PREF_KEY = 'weather:notify';
const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window;
const NOTIFY_ICONS = {
  on: '🔔',
  off: '🔕',
  blocked: '🚫',
  unsupported: '🚫'
};

let notificationsOptIn = loadNotificationPreference();
let lastNotificationSignature = null;

ensureNotifyButton();

let timer = null;
let aborter = null;
let currentTab = 'now';
let theme = getPreferredTheme();
let lang = getPreferredLang();
let lastCurrent = null;
let lastForecast = null;

const history = JSON.parse(localStorage.getItem('weather:history') || '[]');
const saved = JSON.parse(localStorage.getItem('weather:last') || 'null');

applyTheme(theme);
applyLanguage(true);

if (saved){
  q.value = saved.city;
  unitSel.value = saved.unit || 'metric';
  fetchWeatherByCity(saved.city, saved.unit || 'metric');
} else {
  renderHistory();
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const city = normCity(q.value);
  if (!city) return;
  fetchWeatherByCity(city, unitSel.value);
});

q.addEventListener('input', ()=>{
  clearTimeout(timer);
  const city = normCity(q.value);
  if (!city){ clearUI(); setMsg(null); return; }
  timer = setTimeout(()=>fetchWeatherByCity(city, unitSel.value), 500);
});

unitSel.addEventListener('change', ()=>{
  const city = normCity(q.value);
  if (city) fetchWeatherByCity(city, unitSel.value);
});

geoBtn.addEventListener('click', ()=>{
  if (!navigator.geolocation){ setMsg('messages.geolocationUnsupported'); return; }
  setMsg('messages.requestingLocation');
  navigator.geolocation.getCurrentPosition(
    ({ coords })=>{
      fetchWeatherByCoords(coords.latitude, coords.longitude, unitSel.value);
    },
    ()=>{ setMsg('messages.locationError'); },
    { enableHighAccuracy:true, timeout:10000, maximumAge:300000 }
  );
});

tabNow?.addEventListener('click', ()=>setTab('now'));
tab5d?.addEventListener('click', ()=>setTab('5d'));

themeToggle?.addEventListener('click', ()=>{
  theme = theme === 'dark' ? 'light' : 'dark';
  try{ localStorage.setItem(THEME_KEY, theme); }catch(_){}
  applyTheme(theme);
});

langSelect?.addEventListener('change', (event)=>{
  setLanguage((event.target.value || '').toLowerCase());
});

window.addEventListener('storage', (event)=>{
  if (event.key === THEME_KEY){
    theme = event.newValue === 'dark' ? 'dark' : 'light';
    applyTheme(theme);
  }
  if (event.key === LANG_KEY){
    const next = (event.newValue || '').toLowerCase();
    if (I18N[next]){
      lang = next;
      applyLanguage(true);
    }
  }
  if (event.key === NOTIFY_PREF_KEY){
    notificationsOptIn = event.newValue === 'true';
    updateNotificationButton();
  }
});

function fetchWeatherByCity(city, units='metric'){
  if (currentTab === '5d') return fetchForecastByCity(city, units);
  const url = `${API.base}?q=${encodeURIComponent(city)}&units=${units}`;
  return fetchAndRender(url, units, city);
}

function fetchWeatherByCoords(lat, lon, units='metric'){
  if (currentTab === '5d') return fetchForecastByCoords(lat, lon, units);
  const url = `${API.base}?lat=${lat}&lon=${lon}&units=${units}`;
  return fetchAndRender(url, units);
}

function fetchForecastByCity(city, units='metric'){
  const url = `${API.base}?t=forecast&q=${encodeURIComponent(city)}&units=${units}`;
  return fetchAndRenderForecast(url, units, city);
}

function fetchForecastByCoords(lat, lon, units='metric'){
  const url = `${API.base}?t=forecast&lat=${lat}&lon=${lon}&units=${units}`;
  return fetchAndRenderForecast(url, units);
}

async function fetchAndRender(url, units, fallbackCity){
  if (!navigator.onLine){
    let hasRender = false;
    if (fallbackCity){
      const cachedLocal = kvGet(fallbackCity, units);
      if (cachedLocal){
        render(cachedLocal, units);
        setMsg('messages.offlineUpdating');
        hasRender = true;
      }
    }
    try{
      const cached = await caches.match(url);
      if (cached){
        const data = await cached.json();
        render(data, units);
        kvSet(data.name || fallbackCity || '', units, data);
        setMsg('messages.offlineFromCache');
        return;
      }
    }catch(_){/* ignore */}
    if (!hasRender) clearUI();
    setMsg('messages.offlineCheckConnection');
    return;
  }

  if (aborter) aborter.abort();
  aborter = new AbortController();
  try{
    setLoading(true);
    setMsg(null);
    showSkeleton();
    const res = await fetch(url, { headers:{ 'Accept':'application/json' }, signal: aborter.signal });
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const data = await res.json();
    render(data, units);
    const cityName = data.name || fallbackCity || '';
    try{ localStorage.setItem('weather:last', JSON.stringify({ city: cityName, unit: units })); }catch(_){ }
    addHistory(cityName, units);
    kvSet(cityName, units, data);
  }catch(err){
    if (err.name === 'AbortError') return;
    console.error('[weather]', err);
    clearUI();
    const key = prettyErrorKey(err);
    setMsg(key);
  }finally{
    setLoading(false);
  }
}

async function fetchAndRenderForecast(url, units, fallbackCity){
  if (!navigator.onLine){
    try{
      const cached = await caches.match(url);
      if (cached){
        const data = await cached.json();
        renderForecast(data, units);
        setMsg('messages.offlineForecastFromCache');
        setTab('5d');
        return;
      }
    }catch(_){/* ignore */}
    clearUI();
    forecastEl.innerHTML = '';
    setMsg('messages.offlineForecastNoData');
    return;
  }

  if (aborter) aborter.abort();
  aborter = new AbortController();
  try{
    setLoading(true);
    setMsg(null);
    showSkeleton();
    const res = await fetch(url, { headers:{ 'Accept':'application/json' }, signal: aborter.signal });
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const data = await res.json();
    renderForecast(data, units);
    const cityName = data.city?.name || fallbackCity || '';
    try{ localStorage.setItem('weather:last', JSON.stringify({ city: cityName, unit: units })); }catch(_){ }
    addHistory(cityName, units);
    setTab('5d');
  }catch(err){
    if (err.name === 'AbortError') return;
    console.error('[weather]', err);
    clearUI();
    forecastEl.innerHTML = '';
    const key = prettyErrorKey(err);
    setMsg(key);
  }finally{
    setLoading(false);
  }
}

function addHistory(city, unit){
  if (!city) return;
  const next = history.filter(h => h.city.toLowerCase() !== city.toLowerCase());
  next.unshift({ city, unit, ts: Date.now() });
  while (next.length > 5) next.pop();
  try{ localStorage.setItem('weather:history', JSON.stringify(next)); }catch(_){ }
  history.length = 0;
  next.forEach(item => history.push(item));
  renderHistory();
}

function renderHistory(){
  historyEl.setAttribute('aria-label', text('historyLabel'));
  if (!history.length){
    historyEl.innerHTML = '';
  } else {
    const items = history.map(h => {
      const unitLabel = escapeHtml(text(`chipsUnits.${h.unit === 'imperial' ? 'imperial' : 'metric'}`));
      const removeTitle = escapeHtml(text('historyRemoveTitle'));
      return `
      <span class="chip">
        <button type="button" data-city="${escapeHtml(h.city)}" data-unit="${h.unit}">
          ${escapeHtml(h.city)} ${unitLabel}
        </button>
        <button class="rm" type="button" data-rm="${escapeHtml(h.city)}" title="${removeTitle}">✕</button>
      </span>
    `;
    }).join('');
    const clearLabel = escapeHtml(text('historyClear'));
    const clearTitle = escapeHtml(text('clearHistoryTitle'));
    historyEl.innerHTML = `${items} <button id="clearHist" type="button" class="chip" title="${clearTitle}">${clearLabel}</button>`;
  }
  historyEl.onclick = (e)=>{
    const del = e.target.closest('button[data-rm]');
    if (del){
      const city = del.getAttribute('data-rm');
      const next = history.filter(h => h.city.toLowerCase() !== city.toLowerCase());
      try{ localStorage.setItem('weather:history', JSON.stringify(next)); }catch(_){ }
      history.length = 0;
      next.forEach(item => history.push(item));
      renderHistory();
      return;
    }
    if (e.target.id === 'clearHist'){
      localStorage.removeItem('weather:history');
      history.length = 0;
      renderHistory();
      setMsg('messages.storageCleared');
      return;
    }
    const button = e.target.closest('button[data-city]');
    if (!button) return;
    const city = button.getAttribute('data-city');
    const unit = button.getAttribute('data-unit') || 'metric';
    q.value = city;
    unitSel.value = unit;
    fetchWeatherByCity(city, unit);
  };
}

function render(data, units){
  lastCurrent = { data, units };
  lastForecast = null;
  card.innerHTML = composeCurrentMarkup(data, units);
  card.classList.remove('hidden');
  forecastEl.classList.add('hidden');
  maybeNotifyWeather(data, units);
}

function renderForecast(data, units){
  lastForecast = { data, units };
  const html = composeForecastMarkup(data, units);
  forecastEl.innerHTML = html;
  if (html){
    forecastEl.classList.remove('hidden');
    card.classList.add('hidden');
  } else {
    forecastEl.classList.add('hidden');
  }
}

function composeCurrentMarkup(d, units){
  if (!d) return '';
  const unitLabel = units === 'imperial' ? '°F' : '°C';
  const icon = d.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png` : '';
  const descRaw = d.weather?.[0]?.description || '-';
  const desc = capitalize(descRaw);
  const feels = round(d.main?.feels_like);
  const temp = round(d.main?.temp);
  const humid = d.main?.humidity ?? '-';
  const windSpeed = d.wind?.speed != null ? `${d.wind.speed}${text(`windUnits.${units === 'imperial' ? 'imperial' : 'metric'}`)}` : '-';
  const sunrise = d.sys?.sunrise ? timeFromUnix(d.sys.sunrise, d.timezone) : '-';
  const sunset  = d.sys?.sunset  ? timeFromUnix(d.sys.sunset , d.timezone) : '-';

  const feelsLine = escapeHtml(text('cards.feelsLike', { value: feels, unit: unitLabel, description: desc }));
  const humidityLine = escapeHtml(text('cards.humidity', { value: humid }));
  const windLine = escapeHtml(text('cards.wind', { value: windSpeed }));
  const sunriseLine = escapeHtml(text('cards.sunrise', { value: sunrise }));
  const sunsetLine = escapeHtml(text('cards.sunset', { value: sunset }));

  return `
    <h2 class="city">${escapeHtml(d.name || '')}${d.sys?.country ? `, ${escapeHtml(d.sys.country)}`:''}</h2>
    <div class="row">
      <div>
        <div class="temp">${temp}${unitLabel}</div>
        <div class="muted">${feelsLine}</div>
      </div>
      ${icon ? `<img src="${icon}" alt="${escapeHtml(descRaw)}" width="100" height="100" />` : ''}
    </div>
    <div class="row" style="margin-top:.5rem">
      <span class="badge">${humidityLine}</span>
      <span class="badge">${windLine}</span>
      <span class="badge">${sunriseLine}</span>
      <span class="badge">${sunsetLine}</span>
    </div>
  `;
}

function composeForecastMarkup(d, units){
  if (!Array.isArray(d?.list)) return '';
  const byDay = {};
  d.list.forEach(item => {
    const ts = (item.dt + (d.city?.timezone || 0));
    const dayKey = new Date(ts * 1000).toISOString().slice(0, 10);
    const temp = item.main?.temp;
    const icon = item.weather?.[0]?.icon;
    const desc = item.weather?.[0]?.description || '';
    if (!byDay[dayKey]) byDay[dayKey] = { min: temp, max: temp, icons:{}, descs:{} };
    if (temp != null){
      byDay[dayKey].min = Math.min(byDay[dayKey].min, temp);
      byDay[dayKey].max = Math.max(byDay[dayKey].max, temp);
    }
    if (icon) byDay[dayKey].icons[icon] = (byDay[dayKey].icons[icon] || 0) + 1;
    if (desc) byDay[dayKey].descs[desc] = (byDay[dayKey].descs[desc] || 0) + 1;
  });

  const days = Object.entries(byDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([date, info]) => {
      const topIcon = Object.entries(info.icons).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      const topDesc = Object.entries(info.descs).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      return {
        date,
        min: Math.round(info.min),
        max: Math.round(info.max),
        icon: topIcon,
        desc: capitalize(topDesc)
      };
    });

  const unitLabel = units === 'imperial' ? '°F' : '°C';
  return days.map(day => {
    const label = toDateLabel(day.date);
    const iconURL = day.icon ? `https://openweathermap.org/img/wn/${day.icon}.png` : '';
    const range = text('cards.forecastRange', { max: day.max, min: day.min, unit: unitLabel });
    return `
      <div class="day">
        <h4>${label}</h4>
        ${iconURL ? `<img src="${iconURL}" alt="${escapeHtml(day.desc)}" width="50" height="50">` : ''}
        <div>${escapeHtml(range)}</div>
        <div class="small">${escapeHtml(day.desc)}</div>
      </div>
    `;
  }).join('');
}

function setTab(tab){
  currentTab = tab;
  tabNow.classList.toggle('on', tab === 'now');
  tab5d.classList.toggle('on', tab === '5d');
  tabNow.setAttribute('aria-selected', String(tab === 'now'));
  tab5d.setAttribute('aria-selected', String(tab === '5d'));
  refreshViews();
}

function refreshViews(){
  if (currentTab === '5d'){
    if (lastForecast){
      forecastEl.innerHTML = composeForecastMarkup(lastForecast.data, lastForecast.units);
      forecastEl.classList.remove('hidden');
      card.classList.add('hidden');
    } else {
      forecastEl.innerHTML = '';
      forecastEl.classList.add('hidden');
      card.classList.add('hidden');
    }
  } else {
    if (lastCurrent){
      card.innerHTML = composeCurrentMarkup(lastCurrent.data, lastCurrent.units);
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
    forecastEl.classList.add('hidden');
  }
}

function applyTheme(mode){
  const dark = mode === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta){
    try{
      const styles = getComputedStyle(document.documentElement);
      const panel = styles.getPropertyValue('--panel').trim();
      themeMeta.setAttribute('content', panel || (dark ? '#08233a' : '#dff3ff'));
    }catch(_){ }
  }
  updateThemeToggleAppearance(dark);
}

function updateThemeToggleAppearance(isDark){
  if (!themeToggle) return;
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  const label = text(isDark ? 'theme.toggleToLight' : 'theme.toggleToDark');
  themeToggle.setAttribute('aria-label', label);
  themeToggle.title = label;
}

function applyLanguage(initial){
  if (langSelect) langSelect.value = lang;
  document.documentElement.lang = lang;
  document.title = text('appTitle');
  if (appTitleEl) appTitleEl.textContent = text('appTitle');
  if (appTaglineEl) appTaglineEl.textContent = text('tagline');
  if (backHomeEl){
    const label = text('backHome');
    backHomeEl.setAttribute('aria-label', label);
    backHomeEl.innerHTML = `← <span>${label}</span>`;
  }
  if (langLabelEl) langLabelEl.textContent = text('langName');
  if (langSelect) langSelect.setAttribute('aria-label', text('langSelectAria'));
  if (tabsWrap) tabsWrap.setAttribute('aria-label', text('tabListLabel'));
  if (q) q.placeholder = text('placeholder');
  if (geoBtn){
    geoBtn.textContent = text('geoBtn');
    geoBtn.title = text('geoBtnTitle');
  }
  updateNotificationButton();
  if (tabNow) tabNow.textContent = text('tabs.now');
  if (tab5d) tab5d.textContent = text('tabs.forecast');
  updateThemeToggleAppearance(theme === 'dark');
  renderHistory();
  refreshViews();
  refreshMessage();
  if (!initial){
    try{ localStorage.setItem(LANG_KEY, lang); }catch(_){ }
  }
}

function setLanguage(next){
  if (!I18N[next]) next = 'en';
  if (lang === next) return;
  lang = next;
  applyLanguage();
}

function refreshMessage(){
  const key = msg.dataset.msgKey;
  if (!key){ return; }
  const vars = msg.dataset.msgVars ? safeParse(msg.dataset.msgVars) : null;
  msg.textContent = text(key, vars) || '';
}

function setMsg(key, vars){
  if (!key){
    delete msg.dataset.msgKey;
    delete msg.dataset.msgVars;
    msg.textContent = '';
    return;
  }
  msg.dataset.msgKey = key;
  if (vars){ msg.dataset.msgVars = JSON.stringify(vars); }
  else delete msg.dataset.msgVars;
  msg.textContent = text(key, vars) || '';
}

function prettyErrorKey(err){
  if (!err) return 'errors.default';
  const msg = typeof err === 'string' ? err : err.message || '';
  if (msg.startsWith('HTTP_')) return `errors.${msg}`;
  if (err.name === 'TypeError') return 'errors.network';
  return 'errors.default';
}

function normCity(s){ return (s || '').trim().replace(/\s+/g, ' '); }
function clearUI(){ card.classList.add('hidden'); card.innerHTML = ''; }
function setLoading(v){ card.classList.toggle('loading', v); }
function round(x){ return x != null ? Math.round(x) : '-'; }
function capitalize(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function escapeHtml(str){ const div = document.createElement('div'); div.innerText = str; return div.innerHTML; }
function timeFromUnix(unix, tzOff){ const ms = (unix + (tzOff || 0)) * 1000; const d = new Date(ms); const hh = String(d.getUTCHours()).padStart(2, '0'); const mm = String(d.getUTCMinutes()).padStart(2, '0'); return `${hh}:${mm}`; }
function toDateLabel(ymd){
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const days = getValue(lang, 'daysShort');
  const dayName = Array.isArray(days) ? days[date.getUTCDay()] : getValue('en', 'daysShort')[date.getUTCDay()];
  return text('forecastDay', { day: dayName, date: `${d}/${m}` }) || `${dayName} ${d}/${m}`;
}
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

function kvSet(city, unit, data){
  const key = `${unit}:${(city || '').toLowerCase()}`;
  const kv = JSON.parse(localStorage.getItem(kvKey) || '{}');
  kv[key] = { data, ts: Date.now() };
  const entries = Object.entries(kv).sort((a, b)=> b[1].ts - a[1].ts).slice(0, 5);
  localStorage.setItem(kvKey, JSON.stringify(Object.fromEntries(entries)));
}

function kvGet(city, unit){
  const key = `${unit}:${(city || '').toLowerCase()}`;
  const kv = JSON.parse(localStorage.getItem(kvKey) || '{}');
  return kv[key]?.data || null;
}

function getPreferredTheme(){
  try{
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  }catch(_){ }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getPreferredLang(){
  try{
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && I18N[saved]) return saved;
  }catch(_){ }
  const nav = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
  if (I18N[nav]) return nav;
  return 'th';
}

function getValue(locale, path){
  const parts = path.split('.');
  let source = I18N[locale] || I18N.en;
  for (const part of parts){
    if (source && Object.prototype.hasOwnProperty.call(source, part)){
      source = source[part];
    } else {
      source = undefined;
      break;
    }
  }
  if (source !== undefined) return source;
  if (locale === 'en') return undefined;
  return getValue('en', path);
}

function text(path, vars){
  const raw = getValue(lang, path);
  let template;
  if (typeof raw === 'string') template = raw;
  else {
    const fallback = getValue('en', path);
    template = typeof fallback === 'string' ? fallback : '';
  }
  return template.replace(/\{(\w+)\}/g, (_, key)=> vars && vars[key] != null ? vars[key] : '');
}

function safeParse(json){
  try{ return JSON.parse(json); }
  catch(_){ return null; }
}

function loadNotificationPreference(){
  if (!notificationsSupported) return false;
  try{
    const stored = localStorage.getItem(NOTIFY_PREF_KEY);
    if (Notification.permission !== 'granted') return false;
    return stored === 'true';
  }catch(_){
    return false;
  }
}

function storeNotificationPreference(value){
  notificationsOptIn = value;
  try{
    localStorage.setItem(NOTIFY_PREF_KEY, value ? 'true' : 'false');
  }catch(_){ }
}

function ensureNotifyButton(){
  if (notifyBtn) return notifyBtn;
  const actions = document.querySelector('.actions');
  if (!actions) return null;
  const btn = document.createElement('button');
  btn.id = 'notifyBtn';
  btn.type = 'button';
  btn.className = 'icon-btn notify-btn';
  btn.setAttribute('aria-pressed', 'false');
  btn.setAttribute('aria-label', 'Notifications');
  btn.title = 'Notifications';
  btn.dataset.state = 'off';
  btn.textContent = NOTIFY_ICONS.off;
  actions.appendChild(btn);
  notifyBtn = btn;
  return notifyBtn;
}

function renderNotifyButton(iconKey){
  if (!notifyBtn) return;
  notifyBtn.textContent = NOTIFY_ICONS[iconKey] || NOTIFY_ICONS.off;
}

function updateNotificationButton(){
  notifyBtn = ensureNotifyButton();
  if (!notifyBtn) return;
  notifyBtn.classList.add('icon-btn', 'notify-btn');
  if (!notificationsSupported){
    const label = text('notify.unsupported');
    notifyBtn.disabled = true;
    notifyBtn.dataset.state = 'unsupported';
    notifyBtn.title = label;
    notifyBtn.setAttribute('aria-label', label);
    notifyBtn.setAttribute('aria-pressed', 'false');
    renderNotifyButton('unsupported');
    return;
  }
  const perm = Notification.permission;
  if (perm === 'denied'){
    const label = text('notify.blocked');
    notifyBtn.disabled = true;
    notifyBtn.dataset.state = 'blocked';
    notifyBtn.title = label;
    notifyBtn.setAttribute('aria-label', label);
    notifyBtn.setAttribute('aria-pressed', 'false');
    renderNotifyButton('blocked');
    return;
  }
  notifyBtn.disabled = false;
  notifyBtn.dataset.state = notificationsOptIn ? 'on' : 'off';
  const label = text(notificationsOptIn ? 'notify.disable' : 'notify.enable');
  notifyBtn.setAttribute('aria-label', label);
  notifyBtn.title = label;
  notifyBtn.setAttribute('aria-pressed', notificationsOptIn ? 'true' : 'false');
  renderNotifyButton(notificationsOptIn ? 'on' : 'off');
}

function showPermissionEnabledNotification(){
  if (!notificationsSupported || Notification.permission !== 'granted') return;
  try{
    new Notification(text('notify.permissionTitle'), {
      body: text('notify.permissionBody'),
      icon: './icons/icon-192.png'
    });
  }catch(_){ }
}

function getNotificationSignature(data, units){
  if (!data) return '';
  const name = data.name || '';
  const temp = round(data.main?.temp);
  const desc = data.weather?.[0]?.description || '';
  return `${name}|${temp}|${units}|${desc}`;
}

function showWeatherNotification(data, units){
  if (!data) return;
  const city = data.name || text('notify.unknownCity');
  const unitLabel = units === 'imperial' ? '°F' : '°C';
  const descRaw = data.weather?.[0]?.description || '';
  const description = descRaw ? capitalize(descRaw) : '-';
  const icon = data.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${data.weather[0].icon}.png` : './icons/icon-192.png';
  const title = text('notify.weatherTitle', { city });
  const body = text('notify.weatherBody', { temp: round(data.main?.temp), unit: unitLabel, description });
  try{
    new Notification(title, { body, icon });
  }catch(err){
    console.error('notification-error', err);
  }
}

function maybeNotifyWeather(data, units, force = false){
  if (!notificationsSupported) return;
  if (Notification.permission !== 'granted') return;
  if (!notificationsOptIn && !force) return;
  if (!data) return;
  const signature = getNotificationSignature(data, units);
  if (!force && signature && signature === lastNotificationSignature) return;
  lastNotificationSignature = signature;
  showWeatherNotification(data, units);
}

async function handleNotifyClick(){
  if (!notificationsSupported){
    setMsg('messages.notifyUnsupported');
    updateNotificationButton();
    return;
  }
  const perm = Notification.permission;
  if (perm === 'denied'){
    setMsg('messages.notifyBlocked');
    updateNotificationButton();
    return;
  }
  if (perm === 'granted'){
    storeNotificationPreference(!notificationsOptIn);
    updateNotificationButton();
    if (notificationsOptIn){
      setMsg('messages.notifyEnabled');
      if (lastCurrent?.data) maybeNotifyWeather(lastCurrent.data, lastCurrent.units, true);
    } else {
      setMsg('messages.notifyDisabled');
    }
    return;
  }
  const result = await Notification.requestPermission();
  if (result === 'granted'){
    storeNotificationPreference(true);
    setMsg('messages.notifyEnabled');
    updateNotificationButton();
    showPermissionEnabledNotification();
    if (lastCurrent?.data) maybeNotifyWeather(lastCurrent.data, lastCurrent.units, true);
  } else {
    setMsg(result === 'denied' ? 'messages.notifyDenied' : 'messages.notifyUnsupported');
    storeNotificationPreference(false);
    updateNotificationButton();
  }
}
notifyBtn = ensureNotifyButton();
notifyBtn?.addEventListener('click', handleNotifyClick);
window.addEventListener('focus', updateNotificationButton);
updateNotificationButton();
