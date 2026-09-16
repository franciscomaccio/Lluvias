(function () {
  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function parseLocal(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  function formatShort(dateStr) {
    const d = parseLocal(dateStr);
    return d.getDate() + ' ' + MONTHS[d.getMonth()].toLowerCase() + ' ' + d.getFullYear();
  }
  function fmtMm(n) {
    return (Math.round(n * 10) / 10).toLocaleString('es-AR', { minimumFractionDigits: n % 1 === 0 ? 0 : 1, maximumFractionDigits: 1 });
  }
  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  const el = {
    banner: document.getElementById('banner'),
    statMonth: document.getElementById('stat-month'),
    statMonthSub: document.getElementById('stat-month-sub'),
    statYear: document.getElementById('stat-year'),
    statYearSub: document.getElementById('stat-year-sub'),
    statLast: document.getElementById('stat-last'),
    statLastSub: document.getElementById('stat-last-sub'),
    authStatus: document.getElementById('auth-status'),
    authEmail: document.getElementById('auth-email'),
    logoutBtn: document.getElementById('logout-btn'),
    loginView: document.getElementById('login-view'),
    loginForm: document.getElementById('login-form'),
    lEmail: document.getElementById('l-email'),
    lPassword: document.getElementById('l-password'),
    loginError: document.getElementById('login-error'),
    entryView: document.getElementById('entry-view'),
    form: document.getElementById('entry-form'),
    formTitle: document.getElementById('form-title'),
    fDate: document.getElementById('f-date'),
    fMm: document.getElementById('f-mm'),
    fNote: document.getElementById('f-note'),
    submitBtn: document.getElementById('submit-btn'),
    editingNote: document.getElementById('editing-note'),
    editingNoteText: document.getElementById('editing-note-text'),
    cancelEdit: document.getElementById('cancel-edit'),
    yearPrev: document.getElementById('year-prev'),
    yearNext: document.getElementById('year-next'),
    yearLabel: document.getElementById('year-label'),
    chartSub: document.getElementById('chart-sub'),
    chartWrap: document.getElementById('chart-wrap'),
    historyBody: document.getElementById('history-body'),
    emptyHistory: document.getElementById('empty-history'),
  };

  el.fDate.value = todayStr();

  let entries = [];
  let loaded = false;
  let editingDate = null;
  let chartYear = new Date().getFullYear();

  if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined' || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    el.banner.textContent = 'Falta configurar config.js con la URL y la clave anónima de tu proyecto de Supabase. Mirá el README.';
    el.banner.classList.add('show');
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function dataYears() {
    const ys = new Set(entries.map(e => parseLocal(e.date).getFullYear()));
    ys.add(new Date().getFullYear());
    return Array.from(ys);
  }

  function render() {
    renderStats();
    renderChart();
    renderHistory();
    renderYearNav();
  }

  function renderStats() {
    const now = new Date();
    const curMonthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const curYear = now.getFullYear();

    if (!loaded) {
      el.statMonth.innerHTML = '… <span class="unit">mm</span>';
      el.statYear.innerHTML = '… <span class="unit">mm</span>';
      el.statLast.textContent = '…';
      return;
    }

    const monthEntries = entries.filter(e => e.date.startsWith(curMonthKey));
    const monthTotal = monthEntries.reduce((s, e) => s + e.mm, 0);
    el.statMonth.innerHTML = fmtMm(monthTotal) + ' <span class="unit">mm</span>';
    el.statMonthSub.textContent = monthEntries.length + (monthEntries.length === 1 ? ' registro' : ' registros');

    const yearEntries = entries.filter(e => parseLocal(e.date).getFullYear() === curYear);
    const yearTotal = yearEntries.reduce((s, e) => s + e.mm, 0);
    el.statYear.innerHTML = fmtMm(yearTotal) + ' <span class="unit">mm</span>';
    el.statYearSub.textContent = yearEntries.length + (yearEntries.length === 1 ? ' registro' : ' registros');

    if (entries.length === 0) {
      el.statLast.textContent = 'Sin datos';
      el.statLastSub.textContent = 'Cargá la primera lectura';
    } else {
      const last = entries[0];
      el.statLast.textContent = fmtMm(last.mm) + ' mm';
      el.statLastSub.textContent = formatShort(last.date);
    }
  }

  function renderYearNav() {
    const years = dataYears();
    const minYear = Math.min(...years);
    el.yearLabel.textContent = chartYear;
    el.yearPrev.disabled = chartYear <= minYear;
    el.yearNext.disabled = chartYear >= new Date().getFullYear();
  }

  function renderChart() {
    if (!loaded) {
      el.chartWrap.innerHTML = '<div class="chart-empty">Cargando…</div>';
      el.chartSub.textContent = 'Total del año: — mm';
      return;
    }
    const yearEntries = entries.filter(e => parseLocal(e.date).getFullYear() === chartYear);
    if (yearEntries.length === 0) {
      el.chartWrap.innerHTML = '<div class="chart-empty">Sin registros para ' + chartYear + '.</div>';
      el.chartSub.textContent = 'Total del año: 0 mm';
      return;
    }
    const totals = new Array(12).fill(0);
    yearEntries.forEach(e => { totals[parseLocal(e.date).getMonth()] += e.mm; });
    const yearTotal = totals.reduce((a, b) => a + b, 0);
    el.chartSub.textContent = 'Total del año: ' + fmtMm(yearTotal) + ' mm';

    const max = Math.max(...totals, 1);
    const W = 640, H = 210, padL = 4, padR = 4, padB = 24, padT = 20;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const gap = 8;
    const barW = (plotW - gap * 11) / 12;
    const curMonth = (chartYear === new Date().getFullYear()) ? new Date().getMonth() : -1;

    let bars = '';
    let labels = '';
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
    const svg = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Lluvia mensual ' + chartYear + '">' +
      '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '" stroke="var(--line)" stroke-width="1"></line>' +
      bars + labels + '</svg>';
    el.chartWrap.innerHTML = svg;
  }

  function renderHistory() {
    if (!loaded) {
      el.historyBody.innerHTML = '';
      el.emptyHistory.style.display = 'block';
      el.emptyHistory.textContent = 'Cargando…';
      return;
    }
    if (entries.length === 0) {
      el.historyBody.innerHTML = '';
      el.emptyHistory.style.display = 'block';
      el.emptyHistory.textContent = 'Todavía no hay registros.';
      return;
    }
    el.emptyHistory.style.display = 'none';
    const canEdit = !!currentSession;
    el.historyBody.innerHTML = entries.map(e => {
      const note = e.note ? escapeHtml(e.note) : '';
      const actions = canEdit
        ? '<button type="button" class="icon-btn" data-edit="' + e.date + '">Editar</button>' +
          '<button type="button" class="icon-btn danger" data-del="' + e.date + '">Eliminar</button>'
        : '';
      return '<tr>' +
        '<td>' + formatShort(e.date) + '</td>' +
        '<td class="num">' + fmtMm(e.mm) + '</td>' +
        '<td class="note">' + note + '</td>' +
        '<td class="actions">' + actions + '</td>' +
      '</tr>';
    }).join('');
  }

  function startEdit(date) {
    const entry = entries.find(e => e.date === date);
    if (!entry) return;
    editingDate = date;
    el.fDate.value = date;
    el.fDate.readOnly = true;
    el.fMm.value = entry.mm;
    el.fNote.value = entry.note || '';
    el.formTitle.textContent = 'Editar lectura';
    el.submitBtn.textContent = 'Actualizar registro';
    el.editingNoteText.textContent = 'Editando el registro del ' + formatShort(date);
    el.editingNote.classList.add('show');
    el.fMm.focus();
  }

  function cancelEdit() {
    editingDate = null;
    el.fDate.readOnly = false;
    el.fDate.value = todayStr();
    el.fMm.value = '';
    el.fNote.value = '';
    el.formTitle.textContent = 'Cargar lectura';
    el.submitBtn.textContent = 'Guardar registro';
    el.editingNote.classList.remove('show');
  }

  el.cancelEdit.addEventListener('click', cancelEdit);

  el.historyBody.addEventListener('click', async (ev) => {
    const editDate = ev.target.getAttribute('data-edit');
    const delDate = ev.target.getAttribute('data-del');
    if (editDate) startEdit(editDate);
    if (delDate) {
      if (confirm('¿Eliminar el registro del ' + formatShort(delDate) + '?')) {
        const { error } = await client.from('rain_entries').delete().eq('date', delDate);
        if (error) {
          el.banner.textContent = 'No se pudo eliminar el registro.';
          el.banner.classList.add('show');
        }
        if (editingDate === delDate) cancelEdit();
      }
    }
  });

  el.yearPrev.addEventListener('click', () => { chartYear--; renderChart(); renderYearNav(); });
  el.yearNext.addEventListener('click', () => { chartYear++; renderChart(); renderYearNav(); });

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
    cancelEdit();
  });

  // --- Auth ---
  let currentSession = null;

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
  });

  el.logoutBtn.addEventListener('click', async () => {
    await client.auth.signOut();
  });

  function applyAuthState(session) {
    currentSession = session;
    if (session) {
      el.authStatus.classList.add('show');
      el.authEmail.textContent = session.user.email;
      el.loginView.style.display = 'none';
      el.entryView.style.display = 'block';
    } else {
      el.authStatus.classList.remove('show');
      el.loginView.style.display = 'block';
      el.entryView.style.display = 'none';
      cancelEdit();
    }
    renderHistory();
  }

  client.auth.getSession().then(({ data }) => applyAuthState(data.session));
  client.auth.onAuthStateChange((_event, session) => applyAuthState(session));

  // --- Data ---
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
    loaded = true;
    render();
  }

  client
    .channel('rain_entries_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rain_entries' }, fetchEntries)
    .subscribe();

  render();
  fetchEntries();
})();
