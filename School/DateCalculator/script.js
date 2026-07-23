// ===== helpers =====
const WEEKDAYS = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function daysInMonth(year, monthIndex0){
  // monthIndex0: 0-11, works even for negative/overflow via Date normalization
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function pad(n){ return String(n).padStart(2,'0'); }

function formatDatePt(date){
  return `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

// cascading breakdown: years / months / days / hours / minutes
function calcAgeBreakdown(birth, now){
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  let hours = now.getHours() - 0;   // birth assumed at 00:00
  let minutes = now.getMinutes() - 0;

  if (minutes < 0){ minutes += 60; hours -= 1; }
  if (hours < 0){ hours += 24; days -= 1; }
  if (days < 0){
    const prevMonthIndex = now.getMonth() - 1;
    const prevMonthYear = prevMonthIndex < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const prevMonthNorm = ((prevMonthIndex % 12) + 12) % 12;
    days += daysInMonth(prevMonthYear, prevMonthNorm);
    months -= 1;
  }
  if (months < 0){ months += 12; years -= 1; }

  return { years, months, days, hours, minutes };
}

function nextOccurrence(day, month, from){
  // month: 1-12
  let year = from.getFullYear();
  let candidate = new Date(year, month - 1, day, 0, 0, 0);
  const fromMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  if (candidate < fromMidnight){
    candidate = new Date(year + 1, month - 1, day, 0, 0, 0);
  }
  return candidate;
}

function daysBetween(a, b){
  const msPerDay = 24*60*60*1000;
  const aMid = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bMid = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bMid - aMid) / msPerDay);
}

function statCard(icon, value, label){
  return `<div class="stat-card">
      <div class="stat-card__icon">${icon}</div>
      <div class="stat-card__value">${value}</div>
      <div class="stat-card__label">${label}</div>
    </div>`;
}

// ===== TABS =====
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// ===== PAINEL 1: IDADE =====
const birthInput = document.getElementById('birth-date');
const ageStats = document.getElementById('age-stats');
const ageHint = document.getElementById('age-hint');
let storedBirthDate = null;

function renderAge(){
  if (!birthInput.value){
    ageHint.textContent = 'escolha o dia, mês e ano para ver sua idade completinha ✨';
    return;
  }
  const [y,m,d] = birthInput.value.split('-').map(Number);
  const birth = new Date(y, m-1, d, 0, 0, 0);
  storedBirthDate = { day:d, month:m };
  const now = new Date();

  if (birth > now){
    ageHint.textContent = 'ops! essa data ainda não chegou 🌱';
    ageStats.innerHTML = '';
    return;
  }

  const { years, months, days, hours, minutes } = calcAgeBreakdown(birth, now);
  ageHint.textContent = `nasceu em ${formatDatePt(birth)}, uma ${WEEKDAYS[birth.getDay()]} 🌼`;
  ageStats.innerHTML =
    statCard('🍎', years, 'anos') +
    statCard('🍊', months, 'meses') +
    statCard('🍇', days, 'dias') +
    statCard('🍓', hours, 'horas') +
    statCard('🍃', minutes, 'minutos');

  renderNextBirthday();
}

document.getElementById('calc-age-btn').addEventListener('click', renderAge);
birthInput.addEventListener('change', renderAge);

// ===== PAINEL 2: FORMATURA (contagem regressiva fim das aulas) =====
const SCHOOL_END = new Date(2026, 11, 20, 0, 0, 0); // 20/12/2026
const schoolCountdownEl = document.getElementById('school-countdown');

function renderSchoolCountdown(){
  const now = new Date();
  const diff = SCHOOL_END - now;

  if (diff <= 0){
    schoolCountdownEl.innerHTML = `<div class="stat-card" style="grid-column:1/-1;">
        <div class="stat-card__icon">🎉</div>
        <div class="stat-card__value" style="font-size:16px;">as aulas já terminaram!</div>
      </div>`;
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  schoolCountdownEl.innerHTML =
    statCard('📅', days, 'dias') +
    statCard('⏰', pad(hours), 'horas') +
    statCard('⌛', pad(minutes), 'minutos') +
    statCard('✨', pad(seconds), 'segundos');
}

// ===== PAINEL 3: PRÓXIMO ANIVERSÁRIO =====
const bdayResult = document.getElementById('bday-result');

function renderNextBirthday(){
  if (!storedBirthDate){
    bdayResult.innerHTML = `<p class="muted">preencha sua data de nascimento na aba idade primeiro!</p>`;
    return;
  }
  const now = new Date();
  const next = nextOccurrence(storedBirthDate.day, storedBirthDate.month, now);
  const diffDays = daysBetween(now, next);

  let msg;
  if (diffDays === 0){
    msg = `<span class="days-left">é hoje! 🎉🎂</span>`;
  } else {
    msg = `<span class="days-left">faltam ${diffDays} dia${diffDays === 1 ? '' : 's'}</span>`;
  }

  bdayResult.innerHTML = `
    <p class="big-date">${formatDatePt(next)}</p>
    <p class="muted">cai numa ${WEEKDAYS[next.getDay()]}</p>
    ${msg}
  `;
}

// ===== PAINEL 4: DATAS ESPECIAIS (preencher e guardar) =====
const STORAGE_KEY = 'minha-idade:datas-especiais';

function loadSpecialDates(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    return [];
  }
}

function saveSpecialDates(list){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }catch(e){ /* localStorage indisponível, segue sem salvar */ }
}

let specialDates = loadSpecialDates();

// popular os selects de dia e mês
const daySelect = document.getElementById('special-day');
const monthSelect = document.getElementById('special-month');
for (let d = 1; d <= 31; d++){
  daySelect.insertAdjacentHTML('beforeend', `<option value="${d}">${d}</option>`);
}
MONTHS.forEach((m, i) => {
  monthSelect.insertAdjacentHTML('beforeend', `<option value="${i+1}">${m}</option>`);
});

function renderSpecialDates(){
  const now = new Date();
  const list = document.getElementById('special-list');

  if (specialDates.length === 0){
    list.innerHTML = `<div class="empty-note">nenhuma data guardada ainda — preencha o formulário acima 🌼</div>`;
    return;
  }

  // ordena pela data mais próxima
  const withNext = specialDates.map((item, idx) => ({
    ...item,
    idx,
    next: nextOccurrence(item.day, item.month, now)
  })).sort((a,b) => a.next - b.next);

  list.innerHTML = withNext.map(item => {
    const diffDays = daysBetween(now, item.next);
    const badge = diffDays === 0 ? 'é hoje! 🎉' : `faltam ${diffDays} dia${diffDays === 1 ? '' : 's'}`;
    return `<div class="special-item">
        <div class="special-item__icon">${item.icon}</div>
        <div class="special-item__body">
          <div class="special-item__name">${item.name}</div>
          <div class="special-item__date">${pad(item.day)}/${pad(item.month)} · ${formatDatePt(item.next)} · ${WEEKDAYS[item.next.getDay()]}</div>
        </div>
        <div class="special-item__badge">${badge}</div>
        <button class="special-item__delete" data-idx="${item.idx}" title="remover" aria-label="remover">×</button>
      </div>`;
  }).join('');

  list.querySelectorAll('.special-item__delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      specialDates.splice(idx, 1);
      saveSpecialDates(specialDates);
      renderSpecialDates();
    });
  });
}

document.getElementById('add-special-btn').addEventListener('click', () => {
  const nameInput = document.getElementById('special-name');
  const name = nameInput.value.trim();
  if (!name){
    nameInput.focus();
    return;
  }
  const icon = document.getElementById('special-icon').value;
  const day = Number(daySelect.value);
  const month = Number(monthSelect.value);

  specialDates.push({ name, icon, day, month });
  saveSpecialDates(specialDates);
  nameInput.value = '';
  renderSpecialDates();
});

// ===== init =====
renderSchoolCountdown();
setInterval(renderSchoolCountdown, 1000);
renderSpecialDates();
setInterval(renderSpecialDates, 60000);
renderNextBirthday();

// live-refresh age minutes while user is on the tab
setInterval(() => { if (storedBirthDate) renderAge(); }, 60000);