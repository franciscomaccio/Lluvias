(function () {
  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const MONTHS_LONG = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const WEEKDAY_MON0 = d => (d.getDay() + 6) % 7;

  const WEATHER_LAT = -31.46737;
  const WEATHER_LON = -64.35903;
  const WEATHER_TZ = 'America/Argentina/Cordoba';

  const YEAR_COLORS = ['#2f6f9e', '#c2703d', '#4f8f5b', '#8a4f9e', '#a4453a', '#3d8f95'];
  const DAM_ORDER = ['San Roque', 'La Viña', 'Cruz del Eje', 'Los Molinos', 'Emb. Río III', 'La Quebrada', 'Pichanas', 'Dique El Cajón'];
  const MONTH_STARTS = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

  const QUOTES = [
    'La lluvia también cuenta historias.',
    'Cada lectura es un capítulo del año.',
    'Lo que no se mide, se olvida; lo que se anota, se recuerda.',
    'El pluviómetro no miente ni exagera.',
    'Un milímetro por vez, así se arma un clima.',
  ];

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function parseLocal(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  function ymd(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function formatShort(dateStr) {
    const d = parseLocal(dateStr);
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function formatDM(dateStr) {
    const d = parseLocal(dateStr);
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
  }
  function fmtMm(n) {
    return (Math.round(n * 10) / 10).toLocaleString('es-AR', { minimumFractionDigits: n % 1 === 0 ? 0 : 1, maximumFractionDigits: 1 });
  }
  function fmtNum2(n) {
    return Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  function dayOfYear(dateStr) {
    const d = parseLocal(dateStr);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    return Math.round((d - jan1) / 86400000) + 1;
  }
  function isLeap(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }
  function niceStep(raw) {
    if (raw <= 0) return 1;
    const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
    const residual = raw / magnitude;
    let n;
    if (residual <= 1) n = 1; else if (residual <= 2) n = 2; else if (residual <= 5) n = 5; else n = 10;
    return n * magnitude;
  }

  // --- Weather icons (WMO codes) ---
  const ICONS = {
    sun: '<circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><line x1="12" y1="1.6" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22.4"/><line x1="1.6" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22.4" y2="12"/><line x1="4.6" y1="4.6" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.4" y2="19.4"/><line x1="4.6" y1="19.4" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.4" y2="4.6"/></g>',
    cloud: '<path fill="currentColor" d="M6.5 19a4.5 4.5 0 0 1-.4-8.98A5.5 5.5 0 0 1 16.9 8.02 4.5 4.5 0 0 1 17 19H6.5z"/>',
    cloudSun: '<circle cx="8" cy="7.5" r="3" fill="currentColor"/><g stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><line x1="8" y1="1.7" x2="8" y2="3.2"/><line x1="2.7" y1="7.5" x2="4.2" y2="7.5"/><line x1="3.9" y1="3.4" x2="5" y2="4.5"/></g><path fill="currentColor" d="M9 19a4.5 4.5 0 0 1-.4-8.97A5.5 5.5 0 0 1 19.4 9.5 4.5 4.5 0 0 1 19.5 19H9z" transform="translate(0.5 1)"/>',
    fog: '<path fill="currentColor" d="M6.5 15a4.2 4.2 0 0 1-.3-8.4A5.3 5.3 0 0 1 16.3 6a4.2 4.2 0 0 1 .2 8h-10z"/><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="4" y1="18.2" x2="20" y2="18.2"/><line x1="6" y1="21" x2="18" y2="21"/></g>',
    drizzle: '<path fill="currentColor" d="M6.5 13.5a4 4 0 0 1-.3-7.98A5 5 0 0 1 15.8 5a4 4 0 0 1 .2 7.5H6.5z"/><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="8" y1="17" x2="7" y2="19.4"/><line x1="12" y1="17" x2="11" y2="19.4"/><line x1="16" y1="17" x2="15" y2="19.4"/></g>',
    rain: '<path fill="currentColor" d="M6.5 12.5a4 4 0 0 1-.3-7.98A5 5 0 0 1 15.8 4a4 4 0 0 1 .2 7.5H6.5z"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="7.5" y1="16" x2="6" y2="20.4"/><line x1="12" y1="16" x2="10.5" y2="20.4"/><line x1="16.5" y1="16" x2="15" y2="20.4"/></g>',
    snow: '<path fill="currentColor" d="M6.5 12.5a4 4 0 0 1-.3-7.98A5 5 0 0 1 15.8 4a4 4 0 0 1 .2 7.5H6.5z"/><g fill="currentColor"><circle cx="7.5" cy="18" r="1.1"/><circle cx="12" cy="19.5" r="1.1"/><circle cx="16.5" cy="18" r="1.1"/></g>',
    storm: '<path fill="currentColor" d="M6.5 12a4 4 0 0 1-.3-7.98A5 5 0 0 1 15.8 3.5a4 4 0 0 1 .2 7.5H6.5z"/><path fill="currentColor" d="m13 12.5-3.6 5h2.4l-1.4 4.5 4.4-5.6h-2.4z"/>',
  };
  const WEATHER_MAP = {
    0: ['Despejado', 'sun'], 1: ['Mayormente despejado', 'cloudSun'], 2: ['Parcialmente nublado', 'cloudSun'], 3: ['Nublado', 'cloud'],
    45: ['Niebla', 'fog'], 48: ['Niebla', 'fog'],
    51: ['Llovizna leve', 'drizzle'], 53: ['Llovizna', 'drizzle'], 55: ['Llovizna intensa', 'drizzle'],
    56: ['Llovizna helada', 'drizzle'], 57: ['Llovizna helada', 'drizzle'],
    61: ['Lluvia leve', 'rain'], 63: ['Lluvia', 'rain'], 65: ['Lluvia intensa', 'rain'],
    66: ['Lluvia helada', 'rain'], 67: ['Lluvia helada', 'rain'],
    71: ['Nevada leve', 'snow'], 73: ['Nevada', 'snow'], 75: ['Nevada intensa', 'snow'], 77: ['Granizo fino', 'snow'],
    80: ['Chubascos leves', 'rain'], 81: ['Chubascos', 'rain'], 82: ['Chubascos intensos', 'rain'],
    85: ['Chubascos de nieve', 'snow'], 86: ['Chubascos de nieve', 'snow'],
    95: ['Tormenta', 'storm'], 96: ['Tormenta con granizo', 'storm'], 99: ['Tormenta con granizo', 'storm'],
  };
  function weatherInfo(code) {
    return WEATHER_MAP[code] || ['—', 'cloud'];
  }
  function svgIcon(key, viewBox) {
    return '<svg viewBox="' + (viewBox || '0 0 24 24') + '">' + ICONS[key] + '</svg>';
  }
  function compass(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return dirs[Math.round(deg / 45) % 8];
  }

  const el = {
    topbarDate: document.getElementById('topbar-date'),
    topbarGlyph: document.getElementById('topbar-weather-glyph'),
    banner: document.getElementById('banner'),

    weatherIcon: document.getElementById('weather-icon'),
    weatherTemp: document.getElementById('weather-temp'),
    weatherCond: document.getElementById('weather-cond'),
    weatherHum: document.getElementById('weather-hum'),
    weatherWind: document.getElementById('weather-wind'),
    weatherPressure: document.getElementById('weather-pressure'),

    statToday: document.getElementById('stat-today'),
    statTodaySub: document.getElementById('stat-today-sub'),
    statMonth: document.getElementById('stat-month'),
    statMonthSub: document.getElementById('stat-month-sub'),
    statYear: document.getElementById('stat-year'),
    statYearSub: document.getElementById('stat-year-sub'),

    avatarBtn: document.getElementById('avatar-btn'),
    popover: document.getElementById('avatar-popover'),
    popoverLogin: document.getElementById('popover-login'),
    popoverAccount: document.getElementById('popover-account'),
    popoverEmail: document.getElementById('popover-email'),
    loginForm: document.getElementById('login-form'),
    lEmail: document.getElementById('l-email'),
    lPassword: document.getElementById('l-password'),
    loginError: document.getElementById('login-error'),
    logoutBtn: document.getElementById('logout-btn'),

    openRegisterBtn: document.getElementById('open-register-btn'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    modalTitle: document.getElementById('modal-title'),
    modalClose: document.getElementById('modal-close'),
    form: document.getElementById('entry-form'),
    fDate: document.getElementById('f-date'),
    fMm: document.getElementById('f-mm'),
    fNote: document.getElementById('f-note'),
    submitBtn: document.getElementById('submit-btn'),

    periodToggle: document.getElementById('period-toggle'),
    recentChartWrap: document.getElementById('recent-chart-wrap'),
    recentYearNav: document.getElementById('recent-year-nav'),
    recentYearPrev: document.getElementById('recent-year-prev'),
    recentYearNext: document.getElementById('recent-year-next'),
    recentYearLabel: document.getElementById('recent-year-label'),

    calTitle: document.getElementById('calendar-title'),
    calPrev: document.getElementById('cal-prev'),
    calNext: document.getElementById('cal-next'),
    calGrid: document.getElementById('cal-grid'),

    historyYear: document.getElementById('history-year'),
    historyBody: document.getElementById('history-body'),
    emptyHistory: document.getElementById('empty-history'),

    damsUpdated: document.getElementById('dams-updated'),
    damTanksGrid: document.getElementById('dam-tanks-grid'),

    damSelect: document.getElementById('dam-select'),
    damHistoryYear: document.getElementById('dam-history-year'),
    damPeriodToggle: document.getElementById('dam-period-toggle'),
    damHistoryChartWrap: document.getElementById('dam-history-chart-wrap'),

    totalsBody: document.getElementById('totals-body'),
    cumulativeLegend: document.getElementById('cumulative-legend'),
    cumulativeChartWrap: document.getElementById('cumulative-chart-wrap'),

    quoteText: document.getElementById('quote-text'),
    summaryDays: document.getElementById('summary-days'),
    summaryMax: document.getElementById('summary-max'),
    summaryAvg: document.getElementById('summary-avg'),
  };

  let entries = [];
  let entriesByDate = {};
  let loaded = false;
  let editingDate = null;
  let recentPeriod = '7';
  let chartYear = new Date().getFullYear();
  let calYear = new Date().getFullYear();
  let calMonth = new Date().getMonth();
  let historyYearFilter = 'todos';
  let currentSession = null;
  let openRowMenu = null;

  el.quoteText.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const now = new Date();
  const dateLabel = now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  el.topbarDate.textContent = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined' || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    el.banner.textContent = 'Falta configurar config.js con la URL y la clave anónima de tu proyecto de Supabase.';
    el.banner.classList.add('show');
    return;
  }
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ---------- Weather ----------
  const RAIN_FORECAST_MM_THRESHOLD = 1;
  const WEEKDAYS_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  async function fetchWeather() {
    try {
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + WEATHER_LAT + '&longitude=' + WEATHER_LON +
        '&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code' +
        '&daily=precipitation_probability_max,precipitation_sum&forecast_days=10' +
        '&timezone=' + encodeURIComponent(WEATHER_TZ);
      const res = await fetch(url);
      if (!res.ok) throw new Error('http ' + res.status);
      const data = await res.json();
      renderWeather(data.current);
      renderNextRain(data.daily);
    } catch (e) {
      el.weatherCond.textContent = 'No se pudo cargar el clima';
      document.getElementById('weather-next-rain-text').textContent = 'No se pudo cargar el pronóstico.';
    }
  }
  function renderWeather(c) {
    const [label, iconKey] = weatherInfo(c.weather_code);
    el.weatherIcon.innerHTML = svgIcon(iconKey);
    el.topbarGlyph.innerHTML = svgIcon(iconKey);
    el.topbarGlyph.title = label;
    el.weatherTemp.textContent = Math.round(c.temperature_2m) + '°C';
    el.weatherCond.textContent = label;
    el.weatherHum.textContent = Math.round(c.relative_humidity_2m) + '%';
    el.weatherWind.textContent = Math.round(c.wind_speed_10m) + ' km/h (' + compass(c.wind_direction_10m) + ')';
    el.weatherPressure.textContent = Math.round(c.surface_pressure) + ' hPa';
  }
  function forecastDayLabel(dateStr) {
    const today = todayStr();
    const tomorrow = ymd(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1));
    if (dateStr === today) return 'Hoy';
    if (dateStr === tomorrow) return 'Mañana';
    const d = parseLocal(dateStr);
    const weekday = WEEKDAYS_LONG[d.getDay()];
    return weekday.charAt(0).toUpperCase() + weekday.slice(1) + ' ' + formatDM(dateStr);
  }
  function renderNextRain(daily) {
    const textEl = document.getElementById('weather-next-rain-text');
    if (!daily || !daily.time) { textEl.textContent = 'Pronóstico no disponible.'; return; }
    let idx = -1;
    for (let i = 0; i < daily.time.length; i++) {
      if (daily.precipitation_sum[i] >= RAIN_FORECAST_MM_THRESHOLD) { idx = i; break; }
    }
    if (idx === -1) {
      textEl.innerHTML = 'Sin lluvia a la vista en los próximos ' + daily.time.length + ' días.';
      return;
    }
    const label = forecastDayLabel(daily.time[idx]);
    const mm = fmtMm(daily.precipitation_sum[idx]);
    const prob = daily.precipitation_probability_max[idx];
    textEl.innerHTML = 'Próxima lluvia: <b>' + label + '</b> — ' + mm + ' mm (' + prob + '% prob.)';
  }
  fetchWeather();
  setInterval(fetchWeather, 15 * 60 * 1000);

  // ---------- Rendering ----------
  function render() {
    renderStats();
    renderRecentYearNav();
    renderRecentChart();
    renderCalendar();
    renderHistoryYearOptions();
    renderHistory();
    renderSummary();
    renderYearlyTable();
    renderCumulativeChart();
  }

  function computeYearlyStats() {
    const byYear = {};
    entries.forEach(e => {
      const y = e.date.slice(0, 4);
      if (!byYear[y]) byYear[y] = { year: y, total: 0, rainyDays: 0, maxMm: 0, maxDate: null };
      const s = byYear[y];
      s.total += e.mm;
      if (e.mm > 0) s.rainyDays++;
      if (e.mm > s.maxMm) { s.maxMm = e.mm; s.maxDate = e.date; }
    });
    return Object.values(byYear).sort((a, b) => b.year.localeCompare(a.year));
  }

  function renderYearlyTable() {
    if (!loaded) { el.totalsBody.innerHTML = '<tr><td colspan="4">Cargando…</td></tr>'; return; }
    const stats = computeYearlyStats();
    if (stats.length === 0) { el.totalsBody.innerHTML = '<tr><td colspan="4">Sin datos.</td></tr>'; return; }
    el.totalsBody.innerHTML = stats.map(s =>
      '<tr><td>' + s.year + '</td><td class="num">' + fmtMm(s.total) + '</td><td class="num">' + s.rainyDays + '</td><td class="num">' +
      (s.maxDate ? fmtMm(s.maxMm) + ' (' + formatDM(s.maxDate) + ')' : '—') + '</td></tr>'
    ).join('');
  }

  function renderCumulativeChart() {
    if (!loaded) {
      el.cumulativeChartWrap.innerHTML = '<div class="chart-empty">Cargando…</div>';
      el.cumulativeLegend.innerHTML = '';
      return;
    }
    const years = Array.from(new Set(entries.map(e => e.date.slice(0, 4)))).sort();
    if (years.length === 0) {
      el.cumulativeChartWrap.innerHTML = '<div class="chart-empty">Sin datos todavía.</div>';
      el.cumulativeLegend.innerHTML = '';
      return;
    }
    const curYear = new Date().getFullYear();
    const curDoy = dayOfYear(todayStr());

    const series = years.map((y, i) => {
      const yearEntries = entries.filter(e => e.date.startsWith(y + '-')).sort((a, b) => a.date < b.date ? -1 : 1);
      const points = [{ doy: 1, cum: 0 }];
      let cum = 0;
      yearEntries.forEach(e => {
        const doy = dayOfYear(e.date);
        points.push({ doy, cum });
        cum += e.mm;
        points.push({ doy, cum });
      });
      const endDoy = Number(y) === curYear ? curDoy : (isLeap(Number(y)) ? 366 : 365);
      points.push({ doy: endDoy, cum });
      return { year: y, color: YEAR_COLORS[i % YEAR_COLORS.length], points, total: cum };
    });

    const rawMax = Math.max(...series.map(s => s.total), 1);
    const step = niceStep(rawMax / 5);
    const maxVal = Math.ceil(rawMax / step) * step;
    const gridCount = Math.round(maxVal / step);
    const W = 640, H = 260, padL = 42, padR = 10, padT = 14, padB = 26;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const xForDoy = doy => padL + (doy - 1) / 365 * plotW;
    const yForVal = v => padT + plotH - (v / maxVal) * plotH;

    let grid = '';
    for (let i = 0; i <= gridCount; i++) {
      const v = step * i;
      const y = yForVal(v);
      grid += '<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y.toFixed(1) + '" stroke="var(--line)" stroke-width="1"></line>';
      grid += '<text x="' + (padL - 8) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end" font-size="9" font-family="var(--font-mono)" fill="var(--ink-soft)">' + Math.round(v) + '</text>';
    }
    let xLabels = '';
    MONTH_STARTS.filter((_, i) => i % 2 === 0).forEach(doy => {
      const x = xForDoy(doy);
      const label = '1/' + MONTHS[MONTH_STARTS.indexOf(doy)];
      xLabels += '<text x="' + x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="9" font-family="var(--font-body)" fill="var(--ink-soft)">' + label + '</text>';
    });

    let lines = '';
    series.forEach(s => {
      const d = s.points.map((p, i) => (i === 0 ? 'M' : 'L') + xForDoy(p.doy).toFixed(1) + ' ' + yForVal(p.cum).toFixed(1)).join(' ');
      lines += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2" stroke-linejoin="round"></path>';
      const last = s.points[s.points.length - 1];
      lines += '<circle cx="' + xForDoy(last.doy).toFixed(1) + '" cy="' + yForVal(last.cum).toFixed(1) + '" r="3" fill="' + s.color + '"></circle>';
    });

    el.cumulativeChartWrap.innerHTML = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Acumulado de lluvia por año">' +
      grid + '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '" stroke="var(--line)" stroke-width="1"></line>' +
      lines + xLabels + '</svg>';

    el.cumulativeLegend.innerHTML = series.map(s =>
      '<span><i style="background:' + s.color + '"></i>' + s.year + ' · ' + fmtMm(s.total) + ' mm</span>'
    ).join('');
  }

  function renderStats() {
    if (!loaded) {
      el.statToday.innerHTML = '… <span class="unit">mm</span>';
      el.statMonth.innerHTML = '… <span class="unit">mm</span>';
      el.statYear.innerHTML = '… <span class="unit">mm</span>';
      return;
    }
    const nowD = new Date();
    const today = todayStr();
    const todayEntry = entriesByDate[today];
    el.statToday.innerHTML = fmtMm(todayEntry ? todayEntry.mm : 0) + ' <span class="unit">mm</span>';
    el.statTodaySub.textContent = todayEntry
      ? (todayEntry.note || 'Registrado hoy')
      : 'Sin precipitaciones';

    // Month: current month-to-date vs same day-range of previous month
    const y = nowD.getFullYear(), m = nowD.getMonth(), dom = nowD.getDate();
    const curMonthKey = y + '-' + String(m + 1).padStart(2, '0');
    const monthTotal = entries.filter(e => e.date.startsWith(curMonthKey)).reduce((s, e) => s + e.mm, 0);
    let prevY = y, prevM = m - 1;
    if (prevM < 0) { prevM = 11; prevY -= 1; }
    const prevMonthKey = prevY + '-' + String(prevM + 1).padStart(2, '0');
    const prevDays = Math.min(dom, daysInMonth(prevY, prevM));
    const prevMonthTotal = entries
      .filter(e => e.date.startsWith(prevMonthKey) && Number(e.date.slice(8, 10)) <= prevDays)
      .reduce((s, e) => s + e.mm, 0);
    el.statMonth.innerHTML = fmtMm(monthTotal) + ' <span class="unit">mm</span>';
    el.statMonthSub.innerHTML = deltaHtml(monthTotal, prevMonthTotal, 'vs mes anterior');

    // Year: Jan1-to-today vs same period last year
    const cutoff = String(m + 1).padStart(2, '0') + '-' + String(dom).padStart(2, '0');
    const yearTotal = entries.filter(e => e.date.startsWith(String(y) + '-')).reduce((s, e) => s + e.mm, 0);
    const prevYear = y - 1;
    const prevYearTotal = entries
      .filter(e => e.date.startsWith(String(prevYear) + '-') && e.date.slice(5) <= cutoff)
      .reduce((s, e) => s + e.mm, 0);
    el.statYear.innerHTML = fmtMm(yearTotal) + ' <span class="unit">mm</span>';
    el.statYearSub.innerHTML = deltaHtml(yearTotal, prevYearTotal, 'vs año anterior');
  }

  function deltaHtml(current, previous, label) {
    if (previous <= 0) {
      return current > 0 ? 'Sin datos del período anterior' : 'Sin datos aún';
    }
    const pct = Math.round(((current - previous) / previous) * 100);
    const up = pct >= 0;
    return '<span class="delta ' + (up ? 'up' : 'down') + '">' + (up ? '↑' : '↓') + Math.abs(pct) + '%</span> ' + label;
  }

  function renderRecentChart() {
    if (!loaded) {
      el.recentChartWrap.innerHTML = '<div class="chart-empty">Cargando…</div>';
      return;
    }
    if (recentPeriod === 'year') {
      renderYearChart();
      return;
    }
    const n = recentPeriod === '30' ? 30 : 7;
    const days = [];
    const base = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
      const key = ymd(d);
      days.push({ date: key, mm: entriesByDate[key] ? entriesByDate[key].mm : 0, d });
    }
    const max = Math.max(...days.map(x => x.mm), 1);
    const W = 640, H = 210, padL = 4, padR = 4, padB = 26, padT = 16;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const gap = n === 30 ? 3 : 8;
    const barW = (plotW - gap * (n - 1)) / n;
    const labelEvery = n === 30 ? 5 : 1;

    let bars = '', labels = '';
    days.forEach((day, i) => {
      const h = day.mm / max * plotH;
      const x = padL + i * (barW + gap);
      const y = padT + plotH - h;
      const isToday = day.date === todayStr();
      bars += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + Math.max(h, 0).toFixed(1) + '" rx="2.5" fill="' + (isToday ? 'var(--accent)' : 'var(--accent-2)') + '"></rect>';
      if (i % labelEvery === 0 || i === days.length - 1) {
        labels += '<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (H - 8).toFixed(1) + '" text-anchor="middle" font-size="9" font-family="var(--font-body)" fill="var(--ink-soft)">' + formatDM(day.date) + '</text>';
      }
    });
    el.recentChartWrap.innerHTML = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Lluvia de los últimos ' + n + ' días">' +
      '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '" stroke="var(--line)" stroke-width="1"></line>' +
      bars + labels + '</svg>';
  }

  function renderYearChart() {
    const year = chartYear;
    const yearEntries = entries.filter(e => e.date.startsWith(String(year) + '-'));
    if (yearEntries.length === 0) {
      el.recentChartWrap.innerHTML = '<div class="chart-empty">Sin registros para ' + year + '.</div>';
      return;
    }
    const totals = new Array(12).fill(0);
    yearEntries.forEach(e => { totals[Number(e.date.slice(5, 7)) - 1] += e.mm; });
    const max = Math.max(...totals, 1);
    const W = 640, H = 210, padL = 4, padR = 4, padB = 24, padT = 20;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const gap = 8;
    const barW = (plotW - gap * 11) / 12;
    const curMonth = (year === new Date().getFullYear()) ? new Date().getMonth() : -1;

    let bars = '', labels = '';
    for (let i = 0; i < 12; i++) {
      const h = totals[i] / max * plotH;
      const x = padL + i * (barW + gap);
      const y = padT + plotH - h;
      const isCur = i === curMonth;
      bars += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + Math.max(h, totals[i] > 0 ? 2 : 0).toFixed(1) + '" rx="3" fill="' + (isCur ? 'var(--accent)' : 'var(--accent-2)') + '"></rect>';
      if (totals[i] > 0) {
        bars += '<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--ink-soft)">' + fmtMm(totals[i]) + '</text>';
      }
      labels += '<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (H - 6).toFixed(1) + '" text-anchor="middle" font-size="10" font-family="var(--font-body)" fill="' + (isCur ? 'var(--accent)' : 'var(--ink-soft)') + '" font-weight="' + (isCur ? '700' : '400') + '">' + MONTHS[i] + '</text>';
    }
    el.recentChartWrap.innerHTML = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Lluvia mensual ' + year + '">' +
      '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '" stroke="var(--line)" stroke-width="1"></line>' +
      bars + labels + '</svg>';
  }

  el.periodToggle.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-period]');
    if (!btn) return;
    recentPeriod = btn.getAttribute('data-period');
    [...el.periodToggle.querySelectorAll('button')].forEach(b => b.classList.toggle('active', b === btn));
    el.recentYearNav.hidden = recentPeriod !== 'year';
    renderRecentYearNav();
    renderRecentChart();
  });

  function dataYears() {
    const ys = new Set(entries.map(e => Number(e.date.slice(0, 4))));
    ys.add(new Date().getFullYear());
    return Array.from(ys);
  }
  function renderRecentYearNav() {
    const years = dataYears();
    const minYear = Math.min(...years);
    el.recentYearLabel.textContent = chartYear;
    el.recentYearPrev.disabled = chartYear <= minYear;
    el.recentYearNext.disabled = chartYear >= new Date().getFullYear();
  }
  el.recentYearPrev.addEventListener('click', () => {
    chartYear--;
    renderRecentYearNav();
    renderYearChart();
  });
  el.recentYearNext.addEventListener('click', () => {
    chartYear++;
    renderRecentYearNav();
    renderYearChart();
  });

  function renderCalendar() {
    el.calTitle.textContent = MONTHS_LONG[calMonth] + ' ' + calYear;
    const offset = WEEKDAY_MON0(new Date(calYear, calMonth, 1));
    const total = daysInMonth(calYear, calMonth);
    const today = todayStr();
    let html = '';
    for (let i = 0; i < offset; i++) html += '<div class="cal-day empty"></div>';
    for (let day = 1; day <= total; day++) {
      const key = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      const entry = entriesByDate[key];
      const mm = entry ? entry.mm : 0;
      let tier = 0;
      if (mm >= 30) tier = 3; else if (mm >= 10) tier = 2; else if (mm > 0) tier = 1;
      const isToday = key === today;
      const titleParts = [formatShort(key) + ': ' + fmtMm(mm) + ' mm'];
      if (entry && entry.note) titleParts.push(entry.note);
      html += '<div class="cal-day tier-' + tier + (isToday ? ' is-today' : '') + '" title="' + escapeHtml(titleParts.join(' — ')) + '">' + day + '</div>';
    }
    el.calGrid.innerHTML = html;
  }
  el.calPrev.addEventListener('click', () => {
    calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  el.calNext.addEventListener('click', () => {
    calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  function renderHistoryYearOptions() {
    const years = Array.from(new Set(entries.map(e => e.date.slice(0, 4)))).sort((a, b) => b.localeCompare(a));
    const prevValue = el.historyYear.value || historyYearFilter;
    el.historyYear.innerHTML = '<option value="todos">Todos los años</option>' +
      years.map(y => '<option value="' + y + '">' + y + '</option>').join('');
    if (years.includes(prevValue) || prevValue === 'todos') {
      el.historyYear.value = prevValue;
      historyYearFilter = prevValue;
    } else {
      el.historyYear.value = 'todos';
      historyYearFilter = 'todos';
    }
  }
  el.historyYear.addEventListener('change', () => {
    historyYearFilter = el.historyYear.value;
    renderHistory();
  });

  function renderHistory() {
    if (!loaded) {
      el.historyBody.innerHTML = '';
      el.emptyHistory.style.display = 'block';
      el.emptyHistory.textContent = 'Cargando…';
      return;
    }
    const filtered = historyYearFilter === 'todos' ? entries : entries.filter(e => e.date.startsWith(historyYearFilter));
    if (filtered.length === 0) {
      el.historyBody.innerHTML = '';
      el.emptyHistory.style.display = 'block';
      el.emptyHistory.textContent = 'No hay registros para este filtro.';
      return;
    }
    el.emptyHistory.style.display = 'none';
    const canEdit = !!currentSession;
    el.historyBody.innerHTML = filtered.map(e => {
      const note = e.note ? escapeHtml(e.note) : '';
      const actions = canEdit
        ? '<button type="button" class="kebab-btn" data-menu="' + e.date + '" aria-label="Acciones"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="19" r="1.6" fill="currentColor"/></svg></button>' +
          (openRowMenu === e.date
            ? '<div class="row-menu"><button type="button" data-edit="' + e.date + '">Editar</button><button type="button" class="danger" data-del="' + e.date + '">Eliminar</button></div>'
            : '')
        : '';
      return '<tr>' +
        '<td>' + formatShort(e.date) + '</td>' +
        '<td class="num">' + fmtMm(e.mm) + '</td>' +
        '<td class="note">' + note + '</td>' +
        '<td class="actions">' + actions + '</td>' +
      '</tr>';
    }).join('');
  }

  el.historyBody.addEventListener('click', async (ev) => {
    const menuBtn = ev.target.closest('[data-menu]');
    const editBtn = ev.target.closest('[data-edit]');
    const delBtn = ev.target.closest('[data-del]');
    if (menuBtn) {
      const date = menuBtn.getAttribute('data-menu');
      openRowMenu = openRowMenu === date ? null : date;
      renderHistory();
      return;
    }
    if (editBtn) {
      openRowMenu = null;
      openEntryModal(editBtn.getAttribute('data-edit'));
      return;
    }
    if (delBtn) {
      const date = delBtn.getAttribute('data-del');
      openRowMenu = null;
      renderHistory();
      if (confirm('¿Eliminar el registro del ' + formatShort(date) + '?')) {
        const { error } = await client.from('rain_entries').delete().eq('date', date);
        if (error) {
          el.banner.textContent = 'No se pudo eliminar el registro.';
          el.banner.classList.add('show');
        }
      }
    }
  });
  document.addEventListener('click', (ev) => {
    if (openRowMenu && !ev.target.closest('.actions')) {
      openRowMenu = null;
      renderHistory();
    }
  });

  function renderSummary() {
    if (!loaded) return;
    const nowD = new Date();
    const y = nowD.getFullYear(), m = nowD.getMonth(), dom = nowD.getDate();
    const curMonthKey = y + '-' + String(m + 1).padStart(2, '0');
    const monthEntries = entries.filter(e => e.date.startsWith(curMonthKey));
    const rainyDays = monthEntries.filter(e => e.mm > 0).length;
    el.summaryDays.textContent = rainyDays + (rainyDays === 1 ? ' día' : ' días');
    if (monthEntries.length === 0) {
      el.summaryMax.textContent = '—';
      el.summaryAvg.textContent = '0 mm';
      return;
    }
    const maxEntry = monthEntries.reduce((a, b) => (b.mm > a.mm ? b : a));
    el.summaryMax.textContent = fmtMm(maxEntry.mm) + ' mm (' + formatDM(maxEntry.date) + ')';
    const monthTotal = monthEntries.reduce((s, e) => s + e.mm, 0);
    el.summaryAvg.textContent = fmtMm(monthTotal / dom) + ' mm';
  }

  // ---------- Avatar popover ----------
  function openPopover() {
    el.popover.hidden = false;
    if (currentSession) {
      el.popoverLogin.hidden = true;
      el.popoverAccount.hidden = false;
      el.popoverEmail.textContent = currentSession.user.email;
    } else {
      el.popoverLogin.hidden = false;
      el.popoverAccount.hidden = true;
      el.lEmail.focus();
    }
  }
  function closePopover() { el.popover.hidden = true; }
  el.avatarBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    el.popover.hidden ? openPopover() : closePopover();
  });
  document.addEventListener('click', (ev) => {
    if (!el.popover.hidden && !ev.target.closest('.avatar-wrap')) closePopover();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { closePopover(); closeModal(); }
  });

  el.loginForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    el.loginError.classList.remove('show');
    const { error } = await client.auth.signInWithPassword({
      email: el.lEmail.value.trim(),
      password: el.lPassword.value,
    });
    if (error) {
      el.loginError.textContent = 'Email o contraseña incorrectos.';
      el.loginError.classList.add('show');
      return;
    }
    el.lPassword.value = '';
    closePopover();
  });
  el.logoutBtn.addEventListener('click', async () => {
    await client.auth.signOut();
    closePopover();
  });

  function applyAuthState(session) {
    currentSession = session;
    el.openRegisterBtn.style.display = session ? 'inline-flex' : 'none';
    renderHistory();
  }
  client.auth.getSession().then(({ data }) => applyAuthState(data.session));
  client.auth.onAuthStateChange((_event, session) => applyAuthState(session));

  // ---------- Entry modal ----------
  function openEntryModal(dateToEdit) {
    if (!currentSession) {
      openPopover();
      return;
    }
    if (dateToEdit) {
      const entry = entriesByDate[dateToEdit];
      if (!entry) return;
      editingDate = dateToEdit;
      el.modalTitle.textContent = 'Editar lectura';
      el.fDate.value = dateToEdit;
      el.fDate.readOnly = true;
      el.fMm.value = entry.mm;
      el.fNote.value = entry.note || '';
      el.submitBtn.textContent = 'Actualizar registro';
    } else {
      editingDate = null;
      el.modalTitle.textContent = 'Registrar lluvia de hoy';
      el.fDate.value = todayStr();
      el.fDate.readOnly = false;
      el.fMm.value = '';
      el.fNote.value = '';
      el.submitBtn.textContent = 'Guardar registro';
    }
    el.modalBackdrop.hidden = false;
    el.fMm.focus();
  }
  function closeModal() {
    el.modalBackdrop.hidden = true;
    editingDate = null;
  }
  el.openRegisterBtn.addEventListener('click', (ev) => { ev.stopPropagation(); openEntryModal(null); });
  el.modalClose.addEventListener('click', closeModal);
  el.modalBackdrop.addEventListener('click', (ev) => { if (ev.target === el.modalBackdrop) closeModal(); });

  el.form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const date = el.fDate.value;
    const mm = parseFloat(el.fMm.value);
    const note = el.fNote.value.trim();
    if (!date || isNaN(mm) || mm < 0) return;

    el.submitBtn.disabled = true;
    const { error } = await client.from('rain_entries').upsert({
      date, mm, note: note || null, updated_at: new Date().toISOString(),
    });
    el.submitBtn.disabled = false;
    if (error) {
      alert('No se pudo guardar el registro. Probá de nuevo.');
      return;
    }
    closeModal();
  });

  // ---------- Data ----------
  async function fetchEntries() {
    const { data, error } = await client
      .from('rain_entries')
      .select('date, mm, note')
      .order('date', { ascending: false })
      .limit(2000);
    if (error) {
      el.banner.textContent = 'No se pudieron cargar los datos. Revisá la configuración de Supabase.';
      el.banner.classList.add('show');
      return;
    }
    el.banner.classList.remove('show');
    entries = data;
    entriesByDate = {};
    entries.forEach(e => { entriesByDate[e.date] = e; });
    loaded = true;
    render();
  }

  client
    .channel('rain_entries_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rain_entries' }, fetchEntries)
    .subscribe();

  // ---------- Dam levels ----------
  function damTankSvg(pct, uid) {
    // Cross-section de una cuenca (valle) reteniendo agua: borde superior
    // ancho = cota vertedero, base angosta y redondeada = fondo del embalse.
    const W = 64, H = 128;
    const top = 4, innerBottom = 118, innerH = innerBottom - top;
    const clamped = Math.max(0, Math.min(100, pct));
    const fillY = innerBottom - (clamped / 100) * innerH;
    const gradId = 'tankGrad' + uid;
    const clipId = 'tankClip' + uid;
    const basin = 'M5,' + top + ' L59,' + top + ' L46,112 Q32,124 18,112 L5,' + top + ' Z';
    const amp = 2.6;
    const wave = 'M0,' + fillY.toFixed(1) +
      ' C16,' + (fillY - amp).toFixed(1) + ' 16,' + (fillY + amp).toFixed(1) + ' 32,' + fillY.toFixed(1) +
      ' C48,' + (fillY - amp).toFixed(1) + ' 48,' + (fillY + amp).toFixed(1) + ' 64,' + fillY.toFixed(1) +
      ' L64,' + H + ' L0,' + H + ' Z';
    const textY = Math.min(Math.max(fillY + 16, 42), 108);
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="tank-svg" role="img" aria-label="Nivel al ' + Math.round(clamped) + '%">' +
      '<defs><linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="var(--accent-2)"/><stop offset="55%" stop-color="var(--accent)"/><stop offset="100%" stop-color="var(--accent-deep)"/>' +
      '</linearGradient><clipPath id="' + clipId + '"><path d="' + basin + '"/></clipPath></defs>' +
      '<path d="' + basin + '" fill="var(--surface-2)" stroke="var(--line)" stroke-width="1.5"></path>' +
      '<g clip-path="url(#' + clipId + ')"><path d="' + wave + '" fill="url(#' + gradId + ')"></path></g>' +
      '<path d="' + basin + '" fill="none" stroke="var(--line)" stroke-width="1.5"></path>' +
      '<text x="' + (W / 2) + '" y="' + textY.toFixed(1) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#ffffff" font-family="var(--font-mono)">' + Math.round(clamped) + '%</text>' +
      '</svg>';
  }

  function renderDamTanks(rows) {
    el.damTanksGrid.innerHTML = rows.map((r, i) => {
      const pct = r.spillway_level > 0 ? (r.current_level / r.spillway_level * 100) : 0;
      const diffClass = r.diff >= 0 ? 'diff-up' : 'diff-down';
      const sign = r.diff > 0 ? '+' : '';
      return '<div class="dam-tank">' +
        '<div class="dam-tank-name">' + escapeHtml(r.dam_name) + '</div>' +
        '<div class="dam-tank-max">▾ ' + fmtNum2(r.spillway_level) + ' m</div>' +
        damTankSvg(pct, i) +
        '<div class="dam-tank-diff ' + diffClass + '">' + sign + fmtNum2(r.diff) + ' m</div>' +
        '<div class="dam-tank-diff-label">Diferencia</div>' +
        '</div>';
    }).join('');
  }

  async function fetchDamLevels() {
    const { data, error } = await client
      .from('dam_levels')
      .select('date, dam_name, spillway_level, current_level, diff')
      .order('date', { ascending: false })
      .limit(64);
    if (error || !data || data.length === 0) {
      el.damTanksGrid.innerHTML = '';
      el.damsUpdated.textContent = '';
      return;
    }
    const latestDate = data[0].date;
    const rows = data.filter(r => r.date === latestDate);
    rows.sort((a, b) => {
      const ia = DAM_ORDER.indexOf(a.dam_name), ib = DAM_ORDER.indexOf(b.dam_name);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });
    el.damsUpdated.textContent = 'Actualizado: ' + formatShort(latestDate);
    renderDamTanks(rows);
  }

  // ---------- Dam level history (evolución de niveles) ----------
  let damHistoryData = [];
  let damHistorySelectedDam = DAM_ORDER[0];
  let damHistorySelectedYear = null;
  let damHistoryPeriod = 'day';

  function populateDamHistoryFilters() {
    if (!el.damSelect.options.length) {
      el.damSelect.innerHTML = DAM_ORDER.map(d => '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + '</option>').join('');
      damHistorySelectedDam = DAM_ORDER[0];
    }
    const years = Array.from(new Set(damHistoryData.map(r => r.date.slice(0, 4)))).sort((a, b) => b.localeCompare(a));
    const prevYear = damHistorySelectedYear;
    el.damHistoryYear.innerHTML = years.map(y => '<option value="' + y + '">' + y + '</option>').join('');
    if (prevYear && years.includes(prevYear)) {
      damHistorySelectedYear = prevYear;
    } else {
      damHistorySelectedYear = years[0] || String(new Date().getFullYear());
    }
    el.damHistoryYear.value = damHistorySelectedYear;
  }

  function renderDamHistoryChart() {
    const dam = damHistorySelectedDam;
    const year = damHistorySelectedYear;
    const rows = damHistoryData.filter(r => r.dam_name === dam && r.date.startsWith(year + '-') && r.diff !== null);
    if (rows.length === 0) {
      el.damHistoryChartWrap.innerHTML = '<div class="chart-empty">Sin datos de ' + escapeHtml(dam) + ' en ' + year + '.</div>';
      return;
    }

    let points;
    if (damHistoryPeriod === 'day') {
      points = rows.map(r => ({ x: dayOfYear(r.date), v: r.diff })).sort((a, b) => a.x - b.x);
    } else {
      const byMonth = {};
      rows.forEach(r => {
        const m = Number(r.date.slice(5, 7)) - 1;
        (byMonth[m] = byMonth[m] || []).push(r.diff);
      });
      points = Object.keys(byMonth).map(m => {
        const vals = byMonth[m];
        return { x: Number(m), v: vals.reduce((a, b) => a + b, 0) / vals.length };
      }).sort((a, b) => a.x - b.x);
    }

    const vals = points.map(p => p.v);
    const dataMin = Math.min(...vals, 0);
    const dataMax = Math.max(...vals, 0);
    const step = niceStep(Math.max(dataMax - dataMin, 1) / 4);
    const axisMin = Math.floor(dataMin / step) * step;
    const axisMax = Math.ceil(dataMax / step) * step;

    const W = 640, H = 240, padL = 42, padR = 10, padT = 14, padB = 26;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const yForVal = v => padT + (axisMax - v) / (axisMax - axisMin) * plotH;
    const xForPoint = damHistoryPeriod === 'day'
      ? (x => padL + (x - 1) / 365 * plotW)
      : (x => padL + (x + 0.5) / 12 * plotW);

    let grid = '';
    const gridCount = Math.round((axisMax - axisMin) / step);
    for (let i = 0; i <= gridCount; i++) {
      const v = axisMin + step * i;
      const y = yForVal(v);
      const isZero = Math.abs(v) < 1e-9;
      grid += '<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y.toFixed(1) + '" stroke="' + (isZero ? 'var(--accent)' : 'var(--line)') + '" stroke-width="' + (isZero ? 1.6 : 1) + '"></line>';
      grid += '<text x="' + (padL - 8) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end" font-size="9" font-family="var(--font-mono)" fill="var(--ink-soft)">' + fmtMm(v) + '</text>';
    }

    let xLabels = '';
    if (damHistoryPeriod === 'day') {
      MONTH_STARTS.filter((_, i) => i % 2 === 0).forEach(doy => {
        const x = xForPoint(doy);
        const idx = MONTH_STARTS.indexOf(doy);
        xLabels += '<text x="' + x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="9" font-family="var(--font-body)" fill="var(--ink-soft)">' + MONTHS[idx] + '</text>';
      });
    } else {
      MONTHS.forEach((m, i) => {
        const x = xForPoint(i);
        xLabels += '<text x="' + x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="9" font-family="var(--font-body)" fill="var(--ink-soft)">' + m + '</text>';
      });
    }

    const linePath = points.map((p, i) => (i === 0 ? 'M' : 'L') + xForPoint(p.x).toFixed(1) + ' ' + yForVal(p.v).toFixed(1)).join(' ');
    const dots = points.map(p =>
      '<circle cx="' + xForPoint(p.x).toFixed(1) + '" cy="' + yForVal(p.v).toFixed(1) + '" r="3" fill="var(--accent)"><title>' + fmtMm(p.v) + ' m</title></circle>'
    ).join('');

    el.damHistoryChartWrap.innerHTML = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Evolución de nivel de ' + escapeHtml(dam) + '">' +
      grid + '<path d="' + linePath + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"></path>' + dots + xLabels + '</svg>';
  }

  async function fetchDamHistory() {
    const { data, error } = await client
      .from('dam_levels')
      .select('date, dam_name, diff')
      .order('date', { ascending: true })
      .limit(4000);
    if (error || !data) {
      el.damHistoryChartWrap.innerHTML = '<div class="chart-empty">No se pudo cargar el historial.</div>';
      return;
    }
    damHistoryData = data;
    populateDamHistoryFilters();
    renderDamHistoryChart();
  }

  el.damSelect.addEventListener('change', () => {
    damHistorySelectedDam = el.damSelect.value;
    renderDamHistoryChart();
  });
  el.damHistoryYear.addEventListener('change', () => {
    damHistorySelectedYear = el.damHistoryYear.value;
    renderDamHistoryChart();
  });
  el.damPeriodToggle.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-period]');
    if (!btn) return;
    damHistoryPeriod = btn.getAttribute('data-period');
    [...el.damPeriodToggle.querySelectorAll('button')].forEach(b => b.classList.toggle('active', b === btn));
    renderDamHistoryChart();
  });

  client
    .channel('dam_levels_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'dam_levels' }, () => {
      fetchDamLevels();
      fetchDamHistory();
    })
    .subscribe();

  render();
  fetchEntries();
  fetchDamLevels();
  fetchDamHistory();
})();
