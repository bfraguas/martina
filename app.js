// --- ESTADO ---
let state = {
  logs: {}, shop: {}, reminders: [], vacDone: {}, checkDone: {}, mileDone: {}
};
let currentTab = "hoy";
let histDate = todayKey();
let modalItem = null;
let modalDate = null;
let currentMood = null;
let openGameIdx = null;
let openMileIdx = null;
let openCheckIdx = null;
let fromFirebase = false;
let synced = false;
let saveTimer = null;

const ageMonths = getAgeMonths();
const ROUTINE = getRoutine(ageMonths);

// --- FIREBASE SYNC ---
subscribeData(data => {
  fromFirebase = true;
  state = {
    logs: data.logs || {},
    shop: data.shop || {},
    reminders: data.reminders || [],
    vacDone: data.vacDone || {},
    checkDone: data.checkDone || {},
    mileDone: data.mileDone || {}
  };
  synced = true;
  renderAll();
});

// Mark synced after 3s even if Firebase has no data yet
setTimeout(() => { synced = true; }, 3000);

function scheduleSave() {
  if (fromFirebase) { fromFirebase = false; return; }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveData(state), 500);
}

// --- UTILIDADES ---
function progress(date) {
  const done = ROUTINE.filter(r => state.logs[`${date}_${r.time}`]).length;
  return Math.round(done / ROUTINE.length * 100);
}

function last7() {
  return Array.from({length:7}, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return {
      key: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("es-ES", {weekday:"short", day:"numeric"})
    };
  });
}

// --- RENDER HEADER ---
function renderHeader() {
  document.getElementById("age-label").textContent = `${getAgeLabel()} · Plan a partir de los ${ageMonths} meses`;
  const pct = progress(todayKey());
  const badge = document.getElementById("pct-badge");
  badge.textContent = `${pct}%`;
  badge.style.background = pct === 100 ? "#edf7f1" : "#fdf0ec";
  badge.style.color = pct === 100 ? "#5db87a" : "#e8856a";
  badge.style.border = `1px solid ${pct === 100 ? "rgba(93,184,122,0.27)" : "rgba(232,133,106,0.27)"}`;
  document.getElementById("progress-fill").style.width = `${pct}%`;

  // Alertas
  const alerts = [];
  const nextVac = VACCINES.find(v => v.month > ageMonths && !state.vacDone[v.month] && !v.fixed);
  const nextCheck = CHECKUPS.find(c => c.month > ageMonths && !state.checkDone[c.month] && !c.fixed);
  if (nextVac && nextVac.month <= ageMonths + 1) alerts.push(`💉 Proximas vacunas: ${nextVac.label}`);
  if (nextCheck && nextCheck.month <= ageMonths + 1) alerts.push(`🩺 Revision ${nextCheck.label} proximamente`);
  const today = todayKey();
  state.reminders.filter(r => !r.done && r.date === today).forEach(r => alerts.push(`🔔 Hoy: ${r.title}`));
  const ac = document.getElementById("alerts-container");
  ac.innerHTML = alerts.map(a => `<div class="alert-item">${a}</div>`).join("");
}

// --- TAB SWITCHING ---
function setTab(tab) {
  currentTab = tab;
  ["hoy","juegos","desarrollo","salud","compra"].forEach(t => {
    document.getElementById(`content-${t}`).classList.toggle("hidden", t !== tab);
    document.getElementById(`tab-${t}`).classList.toggle("active", t === tab);
  });
  renderTab(tab);
}

function renderAll() {
  renderHeader();
  renderTab(currentTab);
}

function renderTab(tab) {
  if (tab === "hoy") renderHoy();
  else if (tab === "juegos") renderJuegos();
  else if (tab === "desarrollo") renderDesarrollo();
  else if (tab === "salud") renderSalud();
  else if (tab === "compra") renderCompra();
}

// --- TAB HOY ---
function renderHoy() {
  const container = document.getElementById("content-hoy");
  const today = todayKey();
  let html = `<div class="date-label">${fmtDate(today)}</div>`;
  html += `<div class="tomas-banner">🍼 <strong>Tomas:</strong> 06:30 · 11:30 · 14:30 pure · 17:30 · 18:30 pure · 21:00</div>`;

  // Selector días
  html += `<div class="days-row">`;
  last7().forEach(day => {
    const p = progress(day.key);
    const isToday = day.key === today;
    html += `<button class="day-btn${isToday?" today":""}" onclick="setHistDate('${day.key}')">
      <div>${day.label}</div>
      <div class="day-pct" style="color:${p>0?"#5db87a":"#b0bcc8"}">${p>0?p+"%":"·"}</div>
    </button>`;
  });
  html += `</div>`;

  if (histDate !== today) {
    html += `<div class="hist-banner">📅 Viendo ${fmtDate(histDate)} <button class="hist-link" onclick="setHistDate('${today}')">Volver a hoy</button></div>`;
  }

  ROUTINE.forEach(item => {
    const log = state.logs[`${histDate}_${item.time}`];
    const tc = TYPES[item.type];
    const bg = log ? tc.bg : "#fff";
    const border = log ? `${tc.dot}44` : "#f0e8df";

    html += `<div class="routine-item" style="background:${bg};border-color:${border}">
      <div class="routine-main" onclick="${log ? `removeLog('${histDate}','${item.time}')` : `openModal('${histDate}','${item.time}')`}">
        <div class="routine-emoji">${item.icon}</div>
        <div class="routine-info">
          <div class="routine-meta">
            <span class="routine-time">${item.time}</span>
            <span class="routine-type-badge" style="background:${tc.bg};color:${tc.text};border:1px solid ${tc.dot}22">${tc.label}</span>
            ${log ? `<span class="routine-check-time">✓ ${log.at}</span>` : ""}
          </div>
          <div class="routine-label" style="color:${log?"#2d3a4a":"#8a9aaa"};font-weight:${log?"bold":"normal"}">${item.label}</div>
          <div class="routine-note">${item.note}</div>
        </div>
        <div class="routine-check" style="border:2px solid ${log?tc.dot:"#f0e8df"};background:${log?tc.dot:"transparent"}">${log?"✓":""}</div>
      </div>`;

    if (log) {
      html += `<div class="routine-obs">`;
      if (log.mood) html += `<span style="font-size:18px;margin-right:8px">${log.mood}</span>`;
      if (log.note) {
        html += `<div class="obs-note" style="border-left-color:${tc.dot}" onclick="openModal('${histDate}','${item.time}')">📝 ${log.note}</div>`;
      } else {
        html += `<div class="obs-add" onclick="openModal('${histDate}','${item.time}')">+ Añadir observacion...</div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
  });

  container.innerHTML = html;
}

function setHistDate(date) {
  histDate = date;
  renderHoy();
}

function removeLog(date, time) {
  delete state.logs[`${date}_${time}`];
  scheduleSave();
  renderAll();
}

// --- MODAL ---
function openModal(date, time) {
  modalDate = date;
  modalItem = ROUTINE.find(r => r.time === time);
  if (!modalItem) return;
  const log = state.logs[`${date}_${time}`];
  currentMood = log?.mood || null;

  document.getElementById("modal-icon").textContent = modalItem.icon;
  document.getElementById("modal-title").textContent = modalItem.label;
  document.getElementById("modal-sub").textContent = `${modalItem.time} · ${fmtDate(date)}`;
  document.getElementById("modal-note").value = log?.note || "";
  document.getElementById("modal-note").placeholder = modalItem.placeholder || "Anota algo...";

  document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.classList.toggle("selected", btn.textContent === currentMood);
  });

  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  modalItem = null; modalDate = null; currentMood = null;
}

function closeModalOverlay(e) {
  if (e.target === document.getElementById("modal")) closeModal();
}

function toggleMood(m) {
  currentMood = currentMood === m ? null : m;
  document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.classList.toggle("selected", btn.textContent === currentMood);
  });
}

function confirmLog() {
  if (!modalItem || !modalDate) return;
  const key = `${modalDate}_${modalItem.time}`;
  state.logs[key] = {
    label: modalItem.label, type: modalItem.type,
    note: document.getElementById("modal-note").value,
    mood: currentMood,
    at: new Date().toLocaleTimeString("es-ES", {hour:"2-digit", minute:"2-digit"}),
    date: modalDate
  };
  scheduleSave();
  closeModal();
  renderAll();
}

// --- TAB JUEGOS ---
function renderJuegos() {
  const container = document.getElementById("content-juegos");
  const games = GAMES_BY_MONTH[ageMonths] || GAMES_BY_MONTH[7];

  let html = `<div class="info-banner" style="background:linear-gradient(135deg,#f0fdf4,#e8f7ff);border:1px solid rgba(93,184,122,0.2)">
    <div style="font-size:13px;font-weight:bold;color:#5db87a;margin-bottom:4px">🎮 Juegos para ${ageMonths} meses</div>
    <div style="font-size:12px;color:#8a9aaa;line-height:1.6">Adaptados a la etapa actual de Martina. El juego es su trabajo.</div>
  </div>`;

  games.forEach((g, i) => {
    html += `<div class="card">
      <button class="card-header" onclick="toggleGame(${i})">
        <div class="card-icon" style="background:#edf7f1">${g.icon}</div>
        <div style="flex:1">
          <div class="card-title">${g.title}</div>
          <div class="card-sub" style="color:#5db87a">${g.freq}</div>
        </div>
        <span class="card-arrow">${openGameIdx===i?"▲":"▼"}</span>
      </button>
      ${openGameIdx===i?`<div class="card-body">${g.desc}</div>`:""}
    </div>`;
  });

  // Meses anteriores
  const prevMonths = Object.keys(GAMES_BY_MONTH).map(Number).filter(m => m < ageMonths);
  if (prevMonths.length > 0) {
    html += `<div class="prev-games">
      <div class="prev-games-title">Juegos de etapas anteriores (siguen siendo validos)</div>`;
    prevMonths.reverse().forEach(m => {
      const gs = GAMES_BY_MONTH[m];
      html += `<div class="prev-game-group">
        <div class="prev-game-month">${m} meses</div>
        <div class="prev-game-tags">${gs.map(g=>`<span class="prev-game-tag">${g.icon} ${g.title}</span>`).join("")}</div>
      </div>`;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
}

function toggleGame(i) {
  openGameIdx = openGameIdx === i ? null : i;
  renderJuegos();
}

// --- TAB DESARROLLO ---
function renderDesarrollo() {
  const container = document.getElementById("content-desarrollo");
  let html = `<div class="info-banner" style="background:linear-gradient(135deg,#fef9ec,#fff5f0);border:1px solid rgba(232,168,74,0.2)">
    <div style="font-size:13px;font-weight:bold;color:#e8a84a;margin-bottom:4px">🌱 Hitos del desarrollo</div>
    <div style="font-size:12px;color:#8a9aaa;line-height:1.6">Marca los que ya ha conseguido. Rango normal amplio — consulta al pediatra si te preocupa algo.</div>
  </div>`;

  MILESTONES.forEach((m, i) => {
    const isPast = m.month <= ageMonths;
    const isCurrent = m.month === ageMonths || m.month === ageMonths + 1;
    const done = state.mileDone[i];
    const opacity = m.month > ageMonths + 2 ? 0.5 : 1;
    let cls = "milestone-item";
    if (done) cls += " done";
    else if (isCurrent) cls += " current";

    const iconBg = done ? "#edf7f1" : isCurrent ? "#fef7ec" : "#f5eff9";
    const badgeBg = done ? "#edf7f1" : isCurrent ? "#fef7ec" : "#f5eff9";
    const badgeColor = done ? "#5db87a" : isCurrent ? "#e8a84a" : "#b0bcc8";

    html += `<div class="${cls}" style="opacity:${opacity}">
      <div class="milestone-row" ${isPast||isCurrent?`onclick="toggleMilestone(${i})"`:""}">
        <div class="milestone-icon" style="background:${iconBg}">${m.icon}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;flex-wrap:wrap">
            <span class="meses-badge" style="background:${badgeBg};color:${badgeColor}">${m.month} meses</span>
            ${isCurrent&&!done?`<span class="ahora-badge">● Ahora</span>`:""}
            ${done?`<span class="conseguido-badge">✓ Conseguido</span>`:""}
          </div>
          <div style="font-size:14px;font-weight:bold;color:#2d3a4a">${m.label}</div>
          <button class="more-btn" onclick="event.stopPropagation();toggleMileInfo(${i})">${openMileIdx===i?"▲ menos":"▼ mas info"}</button>
          ${openMileIdx===i?`<div class="milestone-desc">${m.desc}</div>`:""}
        </div>
      </div>
    </div>`;
  });

  container.innerHTML = html;
}

function toggleMilestone(i) {
  state.mileDone[i] = !state.mileDone[i];
  scheduleSave();
  renderDesarrollo();
}

function toggleMileInfo(i) {
  openMileIdx = openMileIdx === i ? null : i;
  renderDesarrollo();
}

// --- TAB SALUD ---
function renderSalud() {
  const container = document.getElementById("content-salud");
  let html = `<div class="section-title">💉 Calendario de vacunas</div>`;

  VACCINES.forEach((v, i) => {
    const done = state.vacDone[v.month] || v.fixed;
    const isCurrent = v.month === ageMonths || (v.month <= ageMonths + 1 && v.month >= ageMonths);
    const opacity = v.month > ageMonths + 2 ? 0.45 : 1;
    let cls = "health-item";
    if (done) cls += " done";
    else if (isCurrent) cls += " current";

    html += `<div class="${cls}" style="opacity:${opacity}">
      <div class="health-row">
        <div class="health-icon" style="background:${done?"#edf7f1":isCurrent?"#fdf0ec":"#f5eff9"}">${done?"✅":"💉"}</div>
        <div class="health-content">
          <div style="display:flex;align-items:center;flex-wrap:wrap">
            <span class="health-name">${v.label}</span>
            ${isCurrent&&!done?`<span class="health-badge" style="background:#fdf0ec;color:#e8856a">Proxima</span>`:""}
            ${done&&!v.fixed?`<span style="font-size:10px;color:#5db87a;margin-left:6px">Administrada</span>`:""}
          </div>
          <div class="health-desc">${v.items.join(" · ")}</div>
        </div>
        ${!v.fixed?`<button class="mark-btn" style="background:${done?"#edf7f1":"#fdf0ec"};color:${done?"#5db87a":"#e8856a"}" onclick="toggleVac(${v.month})">${done?"✓":"Marcar"}</button>`:""}
      </div>
    </div>`;
  });

  html += `<div class="section-title section-title-mt">🩺 Revisiones pediatricas</div>`;

  CHECKUPS.forEach((c, i) => {
    const done = state.checkDone[c.month] || c.fixed;
    const isCurrent = c.month === ageMonths || c.month === ageMonths + 1;
    const opacity = c.month > ageMonths + 2 ? 0.45 : 1;
    let cls = "health-item";
    if (done) cls += " done";
    else if (isCurrent) cls += " current-purple";

    html += `<div class="${cls}" style="opacity:${opacity}">
      <div class="health-row">
        <div class="health-icon" style="background:${done?"#edf7f1":isCurrent?"#f3f0fd":"#f5eff9"}">${done?"✅":"🩺"}</div>
        <div class="health-content">
          <div style="display:flex;align-items:center;flex-wrap:wrap">
            <span class="health-name">${c.label}</span>
            ${isCurrent&&!done?`<span class="health-badge" style="background:#f3f0fd;color:#9b7fe8">Proxima</span>`:""}
          </div>
          <div class="health-desc">${c.desc}</div>
          ${!c.fixed?`<button class="toggle-btn" onclick="toggleCheckInfo(${i})">${openCheckIdx===i?"▲ cerrar":"▼ notas"}</button>`:""}
          ${openCheckIdx===i?`<textarea class="notes-textarea" placeholder="Anota preguntas para el pediatra..." onblur="saveCheckNote(${c.month}, this.value)">${state.logs["checkup_"+c.month]?.note||""}</textarea>`:""}
        </div>
        ${!c.fixed?`<button class="mark-btn" style="background:${done?"#edf7f1":"#f3f0fd"};color:${done?"#5db87a":"#9b7fe8"}" onclick="toggleCheck(${c.month})">${done?"✓":"Marcar"}</button>`:""}
      </div>
    </div>`;
  });

  html += `<div class="section-title section-title-mt">🔔 Recordatorios</div>`;
  html += `<div class="card" style="padding:14px;margin-bottom:12px">
    <input class="rem-input" id="rem-title" placeholder="Ej: Cita pediatra, comprar vitamina D...">
    <div class="rem-row">
      <input type="date" class="rem-date" id="rem-date">
      <button class="rem-add" onclick="addReminder()">+ Añadir</button>
    </div>
  </div>`;

  if (state.reminders.length === 0) {
    html += `<div class="empty-msg">No hay recordatorios. Añade citas, compras o alertas.</div>`;
  }

  const today = todayKey();
  const sorted = [...state.reminders].sort((a,b) => a.date.localeCompare(b.date));
  sorted.forEach(r => {
    const overdue = r.date < today && !r.done;
    html += `<div class="rem-item${r.done?" done":""}${overdue?" overdue":""}">
      <button class="rem-check${r.done?" done":""}" onclick="toggleReminder(${r.id})">${r.done?"✓":""}</button>
      <div style="flex:1">
        <div class="rem-title${r.done?" done":""}">${r.title}</div>
        <div class="rem-date-label" style="color:${overdue?"#e86a6a":"#8a9aaa"}">${r.date===today?"Hoy":overdue?"Vencido · "+r.date:r.date}</div>
      </div>
      <button class="rem-del" onclick="deleteReminder(${r.id})">×</button>
    </div>`;
  });

  container.innerHTML = html;
}

function toggleVac(month) {
  state.vacDone[month] = !state.vacDone[month];
  scheduleSave();
  renderSalud();
}

function toggleCheck(month) {
  state.checkDone[month] = !state.checkDone[month];
  scheduleSave();
  renderSalud();
}

function toggleCheckInfo(i) {
  openCheckIdx = openCheckIdx === i ? null : i;
  renderSalud();
}

function saveCheckNote(month, value) {
  if (!state.logs["checkup_"+month]) state.logs["checkup_"+month] = {};
  state.logs["checkup_"+month].note = value;
  scheduleSave();
}

function addReminder() {
  const title = document.getElementById("rem-title").value.trim();
  if (!title) return;
  const date = document.getElementById("rem-date").value || todayKey();
  state.reminders.push({ id: Date.now(), title, date, done: false });
  scheduleSave();
  renderSalud();
}

function toggleReminder(id) {
  const r = state.reminders.find(x => x.id === id);
  if (r) r.done = !r.done;
  scheduleSave();
  renderSalud();
}

function deleteReminder(id) {
  state.reminders = state.reminders.filter(x => x.id !== id);
  scheduleSave();
  renderSalud();
}

// --- TAB COMPRA ---
function renderCompra() {
  const container = document.getElementById("content-compra");
  let html = `<div style="padding:10px 14px;background:#fef7ec;border:1px solid rgba(232,168,74,0.2);border-radius:12px;margin-bottom:14px;font-size:12px;color:#e8a84a;line-height:1.6">
    🛒 Secciones <strong>SEMANAL</strong> hay que reponerlas cada semana. El resto son compras puntuales.
  </div>
  <div class="shop-top"><button class="reset-btn" onclick="resetShop()">Resetear lista</button></div>`;

  SHOPPING.forEach((sec, si) => {
    const color = sec.weekly ? "#e8a84a" : "#e8856a";
    const bg = sec.weekly ? "#fef7ec" : "#fdf0ec";
    html += `<div class="shop-section">
      <div class="shop-cat" style="color:${color};background:${bg}">
        ${sec.weekly?`<span class="shop-weekly-badge">SEMANAL</span>`:""}
        ${sec.cat}
      </div>`;
    sec.items.forEach((item, ii) => {
      const ck = `${si}_${ii}`;
      const checked = state.shop[ck];
      html += `<div class="shop-item${checked?" checked":""}" onclick="toggleShop('${ck}')">
        <div class="shop-checkbox${checked?" checked":""}">${checked?"✓":""}</div>
        <div>
          <div class="shop-name${checked?" checked":""}">${item.n}</div>
          ${item.tip?`<div class="shop-tip">${item.tip}</div>`:""}
        </div>
      </div>`;
    });
    html += `</div>`;
  });

  container.innerHTML = html;
}

function toggleShop(ck) {
  state.shop[ck] = !state.shop[ck];
  scheduleSave();
  renderCompra();
}

function resetShop() {
  state.shop = {};
  scheduleSave();
  renderCompra();
}

// --- INIT ---
renderHeader();
renderHoy();
