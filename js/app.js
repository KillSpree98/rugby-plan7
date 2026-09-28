/* ==========================================================================
   LÓGICA DE LA APP
   ========================================================================== */

const LS_KEYS = {
  checks: 'rp_checks_v1',
  nutrition: 'rp_nutrition_v1',
  runProgress: 'rp_run_progress_v1',
  tracking: 'rp_tracking_v1',
  exerciseLogs: 'rp_exercise_logs_v3',
  matches: 'rp_matches_v1',
  restWeeks: 'rp_rest_weeks_v1',
};

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const ICONS = {
  fuerza: '🏋️', cardio: '🏃', rsa: '⚡', hiit: '🔥', core: '🧱',
  primera_linea: '🛡️', movilidad: '🤸', tecnica: '🎯', neat: '👣',
  partido: '🏉', descanso: '💤',
};

// ---------------- utilidades de fecha ----------------
function todayISO() {
  const d = new Date();
  return isoFromDate(d);
}
function isoFromDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return isoFromDate(d);
}
function dateObj(iso) { return new Date(iso + 'T00:00:00'); }
function fmtDateHuman(iso) {
  const d = dateObj(iso);
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}
function fmtDateShort(iso) {
  const d = dateObj(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function dayOfYear(iso) {
  const d = dateObj(iso);
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  return Math.floor(diff / 86400000);
}

// Lunes de la semana que contiene una fecha
function mondayOf(iso) {
  return addDays(iso, -weekdayIndexMonFirst(iso));
}

// índice de día 0=Lunes .. 6=Domingo dentro de la semana
function weekdayIndexMonFirst(iso) {
  const jsDay = dateObj(iso).getDay(); // 0=domingo..6=sabado
  return (jsDay + 6) % 7;
}

function isSundayISO(iso) { return dateObj(iso).getDay() === 0; }
function isSaturday(iso) { return dateObj(iso).getDay() === 6; }

// ---------------- partidos (editables desde Calendario) ----------------
function getMatches() {
  const matches = loadJSON(LS_KEYS.matches, DEFAULT_MATCHES.map(m => ({ ...m })));
  return matches.filter(match => isRecord(match)
    && typeof match.id === 'string'
    && typeof match.date === 'string'
    && (match.rival === undefined || typeof match.rival === 'string')
    && validateMatch(match).ok);
}
function saveMatches(list) { saveJSON(LS_KEYS.matches, list); }

function getRestWeeks() {
  return loadJSON(LS_KEYS.restWeeks, [...DEFAULT_REST_WEEKS])
    .filter(week => typeof week === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(week));
}
function saveRestWeeks(list) { saveJSON(LS_KEYS.restWeeks, list); }
function isRestWeek(monday) { return getRestWeeks().includes(monday); }
function toggleRestWeek(monday) {
  const list = getRestWeeks();
  const idx = list.indexOf(monday);
  if (idx >= 0) list.splice(idx, 1); else list.push(monday);
  saveRestWeeks(list);
}

function newMatchId() { return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// valida un partido antes de guardarlo; nunca deja la app en un estado roto
function validateMatch(match) {
  if (!match.date) return { ok: false, error: 'Falta la fecha del partido.' };
  const d = dateObj(match.date);
  if (isNaN(d.getTime())) return { ok: false, error: 'La fecha no es válida.' };
  if (match.tipo !== 'liga' && match.tipo !== 'amistoso') return { ok: false, error: 'Tipo de partido no válido.' };
  return { ok: true };
}

function upsertMatch(match) {
  const check = validateMatch(match);
  if (!check.ok) return check;
  const list = getMatches();
  const idx = list.findIndex(m => m.id === match.id);
  if (idx >= 0) list[idx] = match; else list.push(match);
  saveMatches(list);
  return { ok: true };
}
function deleteMatch(id) {
  saveMatches(getMatches().filter(m => m.id !== id));
}
function matchesOnDate(iso) {
  return getMatches().filter(m => m.date === iso);
}
function matchesInWeek(monday) {
  const end = addDays(monday, 6);
  return getMatches().filter(m => m.date >= monday && m.date <= end)
    .sort((a, b) => a.date < b.date ? -1 : 1);
}

function matchTeamLabel(equipo) {
  return equipo === 'ambos' ? '1er equipo y B' : equipo === 'B' ? 'Equipo B' : '1er equipo';
}
function matchLabel(m) {
  const rival = m.rival && m.rival.trim() ? m.rival.trim() : (m.tipo === 'liga' ? 'Jornada de liga' : 'Amistoso');
  return `${rival} · ${matchTeamLabel(m.equipo)}`;
}

// Cuenta como "semana con partido" (T2/T5, y por tanto el lunes siguiente es de
// recuperación -> T3) un partido de liga, una eliminatoria, o un amistoso en
// sábado o domingo. Es la misma regla que usa computeWeekTemplate para dar T2.
function matchCountsAsMatchWeek(m) {
  return m.tipo === 'liga' || m.esEliminatoria || (m.tipo === 'amistoso' && (isSundayISO(m.date) || isSaturday(m.date)));
}

// ---------------- cálculo de la plantilla (T1-T5) de una semana ----------------
// Reglas:
//  - Eliminatoria (semifinal/final) -> T5, recorta carga y sube a mantenimiento.
//  - Partido de liga esa semana -> siempre T2, sea cual sea el día.
//  - Amistoso en sábado ó domingo -> T2. Amistoso entre semana -> T1 (o T3 si la semana anterior tuvo partido)
//  - Sin partido esta semana:
//      · si está marcada a mano como descanso total -> T4
//      · si la semana anterior tuvo partido (T2/T5) -> T3 (recuperación, el lunes no puede ser de pierna pesada)
//      · si no, T1
function computeWeekTemplate(monday) {
  const matches = matchesInWeek(monday);
  const playoff = matches.find(m => m.esEliminatoria);
  if (playoff) return { template: 'T5', matches, primary: playoff, dayOverride: null };

  const liga = matches.find(m => m.tipo === 'liga' && !m.esEliminatoria);
  if (liga) return { template: 'T2', matches, primary: liga, dayOverride: null };

  const prevMonday = addDays(monday, -7);
  const prevHadMatch = matchesInWeek(prevMonday).some(matchCountsAsMatchWeek);

  const amistoso = matches.find(m => m.tipo === 'amistoso');
  if (amistoso) {
    if (isSundayISO(amistoso.date) || isSaturday(amistoso.date)) return { template: 'T2', matches, primary: amistoso, dayOverride: null };
    // amistoso entre semana: la estructura de la semana no cambia (T3 si venías de jugar, si no T1)
    return { template: prevHadMatch ? 'T3' : 'T1', matches, primary: amistoso, dayOverride: null };
  }

  if (isRestWeek(monday)) return { template: 'T4', matches, primary: null, dayOverride: null };

  if (prevHadMatch) return { template: 'T3', matches, primary: null, dayOverride: null };

  return { template: 'T1', matches, primary: null, dayOverride: null };
}

// etiqueta legible del evento de la semana, para las cabeceras de Hoy/Semana
function weekEventLabel(computed, monday) {
  if (computed.template === 'T4') return 'Descanso total · nadie juega';
  if (computed.matches.length === 0) {
    if (monday < SEASON_WEEKS[0]) return 'Pretemporada';
    if (monday > SEASON_WEEKS[SEASON_WEEKS.length - 1]) return 'Postemporada';
    return computed.template === 'T3' ? 'Sin partido esta semana (venías de jugar)' : 'Sin partido esta semana';
  }
  return computed.matches.map(matchLabel).join(' · ');
}

// La app es funcional TODOS los días del año: fuera de la ventana de
// temporada, sin partidos, siempre calcula T1 (o T3 si la semana anterior
// tuvo partido).
function getEffectiveWeek(iso) {
  const monday = mondayOf(iso);
  const computed = computeWeekTemplate(monday);
  return { monday, ...computed, event: weekEventLabel(computed, monday) };
}

// día de plantilla que corresponde a una fecha. El partido se muestra así:
//  - si la plantilla reserva hueco de partido (domingo T2/T5) -> se rellena con el rival real
//  - amistoso de lunes a viernes -> se MANTIENE la rutina del día (por la mañana) y se
//    añade debajo un bloque "Partido"
//  - cualquier otro partido fuera de hueco (p. ej. liga trasladada, o sábado) -> la
//    tarjeta de partido sustituye al día entero
const DAY_NAMES_MON_FIRST = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
function matchBlock(match) {
  return { grupo: 'Partido', ejercicios: [
    { id: 'match-' + match.id, name: matchLabel(match), sets: '—', detail: matchTeamLabel(match.equipo), tipo: 'partido' },
  ]};
}
function matchDayCard(match) {
  const d = dateObj(match.date);
  const titulo = match.esEliminatoria ? 'Partido de eliminatoria' : match.tipo === 'liga' ? 'Partido de liga' : 'Partido amistoso';
  return { day: DAY_NAMES[d.getDay()], titulo, bloques: [matchBlock(match)] };
}
function injectMatchInfo(dayData, match) {
  return {
    ...dayData,
    bloques: dayData.bloques.map(b => ({
      ...b,
      ejercicios: b.ejercicios.map(e => e.tipo === 'partido'
        ? { ...e, name: matchLabel(match), detail: matchTeamLabel(match.equipo) }
        : e),
    })),
  };
}
function isWeekdayMonToFri(iso) { return weekdayIndexMonFirst(iso) <= 4; }
function getDayData(iso) {
  const week = getEffectiveWeek(iso);
  const dIdx = weekdayIndexMonFirst(iso);
  let day = TEMPLATES[week.template][dIdx];
  const hasPartidoSlot = day.bloques.some(b => b.ejercicios.some(e => e.tipo === 'partido'));
  const matchToday = week.matches.find(m => m.date === iso);

  if (matchToday) {
    if (hasPartidoSlot) {
      day = injectMatchInfo(day, matchToday);
    } else if (matchToday.tipo === 'amistoso' && !matchToday.esEliminatoria && isWeekdayMonToFri(iso)) {
      // amistoso entre semana: rutina de la mañana + partido después
      day = { ...day, bloques: [...day.bloques, matchBlock(matchToday)] };
    } else {
      day = matchDayCard(matchToday);
    }
  } else if (hasPartidoSlot && week.primary) {
    // esta plantilla reserva un hueco de partido este día, pero el partido real
    // de la semana cayó otro día: no mentimos diciendo "Partido" aquí
    day = {
      ...day,
      bloques: day.bloques.map(b => ({
        ...b,
        ejercicios: b.ejercicios.map(e => e.tipo === 'partido'
          ? { id: e.id, name: 'Sin partido hoy', sets: '—', detail: `Esta semana jugasteis el ${fmtDateShort(week.primary.date)}`, tipo: 'descanso' }
          : e),
      })),
    };
  }
  return day;
}

// ---------------- estado app ----------------
const state = {
  tab: 'hoy',
  selectedDate: todayISO(),
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(value)) return fallback;
    if (isRecord(fallback) && !isRecord(value)) return fallback;
    return value;
  } catch (e) { return fallback; }
}
function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function saveJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ---------------- checks de ejercicios ----------------
function getChecksForDate(iso) {
  const all = loadJSON(LS_KEYS.checks, {});
  return isRecord(all[iso]) ? all[iso] : {};
}
function toggleCheck(iso, exId) {
  const all = loadJSON(LS_KEYS.checks, {});
  if (!isRecord(all[iso])) all[iso] = {};
  all[iso][exId] = !all[iso][exId];
  saveJSON(LS_KEYS.checks, all);
}

// ---------------- histórico de ejercicios (tipo Hevy: series individuales) ----------------
// Estructura: exerciseLogs[movKey][fecha] = { sets: [ {peso,reps,done}, {..}, ... ] }
function getExerciseLogs(movKey) {
  const all = loadJSON(LS_KEYS.exerciseLogs, {});
  const logs = all[movKey];
  if (!isRecord(logs)) return {};
  const validLogs = {};
  Object.entries(logs).forEach(([date, entry]) => {
    if (!isRecord(entry)) return;
    validLogs[date] = {
      ...entry,
      sets: Array.isArray(entry.sets) ? entry.sets.filter(isRecord) : [],
    };
  });
  return validLogs;
}
function getExerciseLogEntry(movKey, iso) {
  return getExerciseLogs(movKey)[iso] || null;
}
function getExerciseSets(movKey, iso) {
  const entry = getExerciseLogEntry(movKey, iso);
  return (entry && entry.sets) || [];
}
// guarda un campo de una serie concreta (por índice)
function saveExerciseSetField(movKey, iso, setIndex, fieldKey, value) {
  const all = loadJSON(LS_KEYS.exerciseLogs, {});
  if (!all[movKey]) all[movKey] = {};
  if (!all[movKey][iso]) all[movKey][iso] = { sets: [] };
  const sets = all[movKey][iso].sets;
  while (sets.length <= setIndex) sets.push({});
  sets[setIndex] = { ...sets[setIndex], [fieldKey]: value };
  saveJSON(LS_KEYS.exerciseLogs, all);
}
// marca/desmarca una serie como completada; si no tiene valores, los rellena con la referencia anterior
function toggleExerciseSetDone(movKey, iso, setIndex, fallbackValues) {
  const all = loadJSON(LS_KEYS.exerciseLogs, {});
  if (!all[movKey]) all[movKey] = {};
  if (!all[movKey][iso]) all[movKey][iso] = { sets: [] };
  const sets = all[movKey][iso].sets;
  while (sets.length <= setIndex) sets.push({});
  const current = sets[setIndex];
  const nowDone = !current.done;
  let next = { ...current, done: nowDone };
  if (nowDone && fallbackValues) {
    Object.entries(fallbackValues).forEach(([k, v]) => {
      if (next[k] === undefined || next[k] === '') next[k] = v;
    });
  }
  sets[setIndex] = next;
  saveJSON(LS_KEYS.exerciseLogs, all);
}
// Modelo: entry = { sets: [ {warmup?, done?, peso, reps, ...} ], custom?: true }
// Las series de calentamiento (warmup:true) van siempre al principio y NO cuentan
// para PR, marcas ni historial. Si custom=true, el nº de filas es exactamente el
// guardado (así se puede bajar de las series prescritas); si no, es max(prescritas, guardadas).
function isWarmupSet(s) { return !!(s && s.warmup); }
function workingSets(sets) { return (sets || []).filter(s => !isWarmupSet(s)); }
function warmupSets(sets) { return (sets || []).filter(isWarmupSet); }

// rellena con series vacías hasta las prescritas (solo series de trabajo)
function materializeSets(entry, prescribed) {
  if (entry.custom) return; // ya materializado: respeta el nº de filas que dejó el usuario
  while (workingSets(entry.sets).length < prescribed) entry.sets.push({});
}
function getOrCreateEntry(all, movKey, iso) {
  if (!all[movKey]) all[movKey] = {};
  if (!all[movKey][iso]) all[movKey][iso] = { sets: [] };
  if (!Array.isArray(all[movKey][iso].sets)) all[movKey][iso].sets = [];
  return all[movKey][iso];
}
// añade una serie de trabajo vacía al final (botón "+ Añadir serie")
function addExerciseSet(movKey, iso, prescribed) {
  const all = loadJSON(LS_KEYS.exerciseLogs, {});
  const entry = getOrCreateEntry(all, movKey, iso);
  materializeSets(entry, prescribed || 0);
  entry.sets.push({});
  entry.custom = true;
  saveJSON(LS_KEYS.exerciseLogs, all);
}
// añade una serie de calentamiento tras los calentamientos existentes (antes de las series de trabajo)
function addWarmupSet(movKey, iso, prescribed) {
  const all = loadJSON(LS_KEYS.exerciseLogs, {});
  const entry = getOrCreateEntry(all, movKey, iso);
  materializeSets(entry, prescribed || 0);
  const at = warmupSets(entry.sets).length; // los calentamientos están siempre al frente
  entry.sets.splice(at, 0, { warmup: true });
  entry.custom = true;
  saveJSON(LS_KEYS.exerciseLogs, all);
}
// quita la última fila visible (la última serie de trabajo; si solo quedan calentamientos, el último)
function removeLastExerciseSet(movKey, iso, prescribed) {
  const all = loadJSON(LS_KEYS.exerciseLogs, {});
  const entry = getOrCreateEntry(all, movKey, iso);
  materializeSets(entry, prescribed || 0);
  if (entry.sets.length === 0) return;
  entry.sets.pop();
  entry.custom = true;
  saveJSON(LS_KEYS.exerciseLogs, all);
}
// permite eliminar una serie concreta (por índice)
function deleteExerciseSet(movKey, iso, setIndex) {
  const all = loadJSON(LS_KEYS.exerciseLogs, {});
  if (!all[movKey] || !all[movKey][iso]) return;
  const sets = all[movKey][iso].sets;
  if (setIndex < 0 || setIndex >= sets.length) return;
  sets.splice(setIndex, 1);
  all[movKey][iso].custom = true;
  saveJSON(LS_KEYS.exerciseLogs, all);
}
// series de la sesión anterior (fecha < iso), para la columna "ANTERIOR"
function previousExerciseSets(movKey, iso) {
  const logs = getExerciseLogs(movKey);
  const dates = Object.keys(logs).filter(d => d < iso).sort();
  if (dates.length === 0) return [];
  return logs[dates[dates.length - 1]].sets || [];
}
// valor agregado (max o sum) de un campo entre las series de una fecha
function aggregateSetField(sets, fieldKey, agg) {
  const vals = workingSets(sets).map(s => parseFloat(s[fieldKey])).filter(v => !isNaN(v));
  if (vals.length === 0) return null;
  return agg === 'sum' ? vals.reduce((a, b) => a + b, 0) : Math.max(...vals);
}
// serie histórica (una fecha -> un valor agregado) para la gráfica de progreso
function exerciseHistorySeries(movKey, fieldKey, agg) {
  const logs = getExerciseLogs(movKey);
  return Object.keys(logs).sort()
    .map(d => ({ date: d, value: aggregateSetField(logs[d].sets, fieldKey, agg) }))
    .filter(p => p.value !== null);
}
// mejor marca histórica de un campo (para la insignia de PR), en fechas anteriores a iso
function historicalBestBefore(movKey, iso, fieldKey) {
  const logs = getExerciseLogs(movKey);
  const dates = Object.keys(logs).filter(d => d < iso).sort();
  let best = null;
  dates.forEach(d => {
    workingSets(logs[d].sets).forEach(s => {
      const v = parseFloat(s[fieldKey]);
      if (!isNaN(v) && (best === null || v > best)) best = v;
    });
  });
  return best;
}

// ---------------- nutrición ----------------
function getNutritionParams() {
  const stored = loadJSON(LS_KEYS.nutrition, null);
  return { ...NUTRITION_DEFAULTS, ...(isRecord(stored) ? stored : {}) };
}
function saveNutritionParams(p) { saveJSON(LS_KEYS.nutrition, p); }

// T3 (post-partido, sin partido esta semana) y T5 (eliminatoria/final) suben a
// mantenimiento. T1, T2 y T4 mantienen el déficit configurado.
function weekIsMaintenance(template) {
  return template === 'T3' || template === 'T5';
}

function computeNutrition(params, template) {
  const { peso, altura, edad, mlg, pesoObjetivo, factorActividad, porcentajeDeficit, kcalMax } = params;
  const bmr = 10 * peso + 6.25 * altura - 5 * edad + 5;
  const tdee = bmr * factorActividad;
  const maintenance = weekIsMaintenance(template);
  const deficitAplicado = maintenance ? 0 : porcentajeDeficit;
  const kcalCalculado = tdee * (1 - deficitAplicado);
  const tope = kcalMax || NUTRITION_DEFAULTS.kcalMax;
  const capApplied = kcalCalculado > tope;
  const kcalObjetivo = Math.min(kcalCalculado, tope);
  const proteina = mlg * 2.35;
  const grasas = peso * 0.68;
  const carbohidratos = Math.max(0, (kcalObjetivo - proteina * 4 - grasas * 9) / 4);
  const kgAPerder = peso - pesoObjetivo;
  const semanasEstimadas = kgAPerder > 0 ? kgAPerder / 0.9 : 0;
  return { bmr, tdee, kcalObjetivo, kcalCalculado, capApplied, tope, proteina, grasas, carbohidratos, kgAPerder, semanasEstimadas, maintenance, deficitAplicado };
}

// ---------------- progresión 10K ----------------
function getRunProgress() {
  return loadJSON(LS_KEYS.runProgress, { semana: 1 });
}
function setRunProgress(v) { saveJSON(LS_KEYS.runProgress, v); }

// ---------------- seguimiento semanal ----------------
function getTracking() {
  const stored = loadJSON(LS_KEYS.tracking, {});
  const validEntries = {};
  Object.entries(stored).forEach(([week, entry]) => {
    if (isRecord(entry)) validEntries[week] = entry;
  });
  return validEntries; // keyed by monday ISO of the week
}
function saveTrackingEntry(mondayIso, entry) {
  const all = getTracking();
  all[mondayIso] = { ...(all[mondayIso] || {}), ...entry };
  saveJSON(LS_KEYS.tracking, all);
}

// ---------------- render helpers ----------------
const $app = document.getElementById('app');

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c === null || c === undefined) return;
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return el;
}

function renderExercise(iso, exObj) {
  const specKey = getLogSpecKey(exObj);
  if (!specKey) return renderSimpleCheckRow(iso, exObj);
  return renderExerciseCard(iso, exObj, specKey);
}

// fila simple con checkbox, para lo que no tiene registro posible (partido, descanso)
function renderSimpleCheckRow(iso, exObj) {
  const checks = getChecksForDate(iso);
  const done = !!checks[exObj.id];
  const row = h('div', { class: 'ex-row' + (done ? ' ex-done' : '') });
  const box = h('button', {
    class: 'ex-check',
    'aria-label': 'Marcar completado',
    onclick: () => { toggleCheck(iso, exObj.id); render(); },
  }, done ? '✓' : '');
  const info = h('div', { class: 'ex-info' }, [
    h('div', { class: 'ex-name' }, `${ICONS[exObj.tipo] || ''} ${exObj.name}`),
    h('div', { class: 'ex-detail' }, [
      h('span', { class: 'ex-sets' }, exObj.sets),
      exObj.detail ? h('span', { class: 'ex-notes' }, ' · ' + exObj.detail) : null,
    ]),
  ]);
  row.appendChild(box);
  row.appendChild(info);
  return row;
}

function formatSetValue(fieldKey, val, unit) {
  if (val === undefined || val === null || val === '') return '—';
  const suffix = fieldKey === 'peso' ? 'kg' : fieldKey === 'reps' ? ' reps'
    : fieldKey === 'distancia' ? 'km' : fieldKey === 'duracion' ? unit
    : fieldKey === 'pasos' ? ' pasos' : '';
  return `${val}${suffix}`;
}

// tarjeta de ejercicio con tabla de series individuales (siempre visible, sin desplegable)
function renderExerciseCard(iso, exObj, specKey) {
  const spec = LOG_TYPE_SPECS[specKey];
  const movKey = getMovementKey(exObj);
  const unit = specKey === 'duracion' ? inferDurationUnit(exObj) : null;
  const fields = spec.fields.map(f => f.label ? f : { ...f, label: unit.toUpperCase() });

  const prescribed = Math.max(1, parseSetCount(exObj.sets));
  const entry = getExerciseLogEntry(movKey, iso);
  const isCustom = !!(entry && entry.custom);
  const rows = ((entry && entry.sets) || []).slice();
  // sin personalizar: se muestran al menos las series prescritas (filas virtuales vacías)
  if (!isCustom) while (workingSets(rows).length < prescribed) rows.push({});
  const rowCount = rows.length;

  const prevAll = previousExerciseSets(movKey, iso);
  const prevWarm = warmupSets(prevAll);
  const prevWork = workingSets(prevAll);
  const todaySets = (entry && entry.sets) || [];

  const bestBefore = historicalBestBefore(movKey, iso, spec.metric);
  const todayBest = aggregateSetField(todaySets, spec.metric, 'max');
  const isPR = bestBefore !== null && todayBest !== null && todayBest >= bestBefore;

  const card = h('div', { class: 'exercise-card' + (isPR ? ' exercise-is-pr' : '') });

  const head = h('div', { class: 'exercise-card-head' }, [
    h('div', { class: 'exercise-card-title' }, `${ICONS[exObj.tipo] || ''} ${exObj.name}`),
    h('div', { class: 'exercise-card-sub' }, [
      h('span', {}, exObj.sets),
      exObj.detail ? h('span', {}, ' · ' + exObj.detail) : null,
    ]),
  ]);
  if (isPR) head.appendChild(h('div', { class: 'pr-badge' }, '🏆 Nuevo PR'));
  else if (bestBefore !== null) head.appendChild(h('div', { class: 'best-mark' }, `Mejor marca: ${formatSetValue(spec.metric, bestBefore, unit)}`));
  card.appendChild(head);

  const gridHeadCells = [h('span', { class: 'set-col-serie' }, 'SERIE'), h('span', { class: 'set-col-anterior' }, 'ANTERIOR')];
  fields.forEach(f => gridHeadCells.push(h('span', { class: 'set-col-field' }, f.label)));
  gridHeadCells.push(h('span', { class: 'set-col-check' }, '✓'));
  card.appendChild(h('div', { class: `set-grid-head set-cols-${fields.length}` }, gridHeadCells));

  let warmIdx = 0;
  let workIdx = 0;
  for (let i = 0; i < rowCount; i++) {
    const todaySet = rows[i] || {};
    const isWarm = isWarmupSet(todaySet);
    // "ANTERIOR" se alinea por tipo: calentamiento con calentamiento, trabajo con trabajo
    const prevSet = (isWarm ? prevWarm[warmIdx] : prevWork[workIdx]) || null;
    const badgeText = isWarm ? 'C' : String(workIdx + 1);
    if (isWarm) warmIdx++; else workIdx++;
    const prevText = prevSet ? fields.map(f => formatSetValue(f.key, prevSet[f.key], unit)).join(' · ') : '—';
    const rowDone = !!todaySet.done;

    const rowCells = [
      h('span', { class: 'set-badge' + (isWarm ? ' set-badge-warmup' : ''), title: isWarm ? 'Calentamiento' : '' }, badgeText),
      h('span', { class: 'set-anterior' }, prevText),
    ];
    fields.forEach(f => {
      rowCells.push(h('input', {
        class: 'set-input', type: 'number', step: f.step,
        value: todaySet[f.key] ?? '',
        placeholder: prevSet && prevSet[f.key] !== undefined ? String(prevSet[f.key]) : '',
        onchange: (e) => { saveExerciseSetField(movKey, iso, i, f.key, e.target.value); render(); },
      }));
    });
    const fallbackValues = {};
    if (prevSet) fields.forEach(f => { if (prevSet[f.key] !== undefined) fallbackValues[f.key] = prevSet[f.key]; });
    rowCells.push(h('button', {
      class: 'set-check' + (rowDone ? ' set-check-done' : ''),
      'aria-label': 'Marcar serie completada',
      onclick: () => { toggleExerciseSetDone(movKey, iso, i, fallbackValues); render(); },
    }, rowDone ? '✓' : ''));

    card.appendChild(h('div', { class: `set-grid-row set-cols-${fields.length}` + (rowDone ? ' set-row-done' : '') + (isWarm ? ' set-row-warmup' : '') }, rowCells));
  }

  const actions = h('div', { class: 'set-actions' });
  // calentamiento: solo tiene sentido en ejercicios de peso x reps
  if (specKey === 'peso_reps') {
    actions.appendChild(h('button', {
      class: 'add-set-btn',
      onclick: () => { addWarmupSet(movKey, iso, prescribed); render(); },
    }, '+ Calentamiento'));
  }
  actions.appendChild(h('button', {
    class: 'add-set-btn',
    onclick: () => { addExerciseSet(movKey, iso, prescribed); render(); },
  }, '+ Serie'));
  if (rowCount > 1) {
    actions.appendChild(h('button', {
      class: 'add-set-btn remove-set-btn',
      onclick: () => {
        const last = rows[rowCount - 1] || {};
        const hasData = last.done || fields.some(f => last[f.key] !== undefined && last[f.key] !== '');
        if (hasData && !confirm('¿Quitar la última serie? Se perderán sus datos.')) return;
        removeLastExerciseSet(movKey, iso, prescribed);
        render();
      },
    }, '− Quitar última'));
  }
  card.appendChild(actions);

  const series = exerciseHistorySeries(movKey, spec.metric, spec.metricAgg).map(p => p.value);
  card.appendChild(h('div', { class: 'log-chart-label' }, `Progreso · ${spec.metricLabel}`));
  card.appendChild(renderLineChart(series, { width: 300, height: 90 }));

  return card;
}

function renderDayCard(iso, dayData, opts = {}) {
  const card = h('div', { class: 'day-card' });
  card.appendChild(h('div', { class: 'day-card-head' }, [
    h('div', { class: 'day-card-title' }, dayData.titulo),
  ]));
  dayData.bloques.forEach(b => {
    card.appendChild(h('div', { class: 'block-label' }, b.grupo));
    const list = h('div', { class: 'ex-list' });
    b.ejercicios.forEach(e => list.appendChild(renderExercise(iso, e)));
    card.appendChild(list);
  });
  return card;
}

// navegador de fecha: permite ver/registrar cualquier día, no solo el de hoy
function dateNav(iso) {
  const isToday = iso === todayISO();
  const nav = h('div', { class: 'date-nav' });
  nav.appendChild(h('button', {
    class: 'date-nav-btn', 'aria-label': 'Día anterior',
    onclick: () => { state.selectedDate = addDays(state.selectedDate, -1); render(); },
  }, '◀'));
  const labelBits = [h('div', { class: 'date-nav-day' }, fmtDateHuman(iso))];
  if (!isToday) {
    labelBits.push(h('button', {
      class: 'date-nav-today',
      onclick: () => { state.selectedDate = todayISO(); render(); },
    }, 'Volver a hoy'));
  }
  nav.appendChild(h('div', { class: 'date-nav-label' }, labelBits));
  nav.appendChild(h('button', {
    class: 'date-nav-btn', 'aria-label': 'Día siguiente',
    onclick: () => { state.selectedDate = addDays(state.selectedDate, 1); render(); },
  }, '▶'));
  return nav;
}

function daysBetween(isoA, isoB) {
  return Math.round((dateObj(isoB) - dateObj(isoA)) / 86400000);
}

// ---------------- TAB: HOY ----------------
function tabHoy() {
  const iso = state.selectedDate;
  const week = getEffectiveWeek(iso);
  const wrap = h('div', { class: 'screen' });
  wrap.appendChild(dateNav(iso));

  const template = week.template;
  const dayData = getDayData(iso);
  const meta = TEMPLATE_META[template];

  // banner motivación
  const doy = dayOfYear(iso);
  const useComida = doy % 2 === 0;
  const msgList = useComida ? MOTIVATION_COMIDA : MOTIVATION_RUGBY;
  const msg = msgList[doy % msgList.length];
  wrap.appendChild(h('div', { class: 'banner' }, [
    h('div', { class: 'banner-tag' }, useComida ? 'DISCIPLINA' : 'PACK'),
    h('div', { class: 'banner-text' }, msg),
  ]));

  // tip del día
  const tip = TIPS[doy % TIPS.length];
  wrap.appendChild(h('div', { class: 'tip' }, [
    h('span', { class: 'tip-cat' }, tip.cat),
    h('span', { class: 'tip-text' }, tip.texto),
  ]));

  // cabecera semana
  wrap.appendChild(h('div', { class: 'week-header' }, [
    h('span', { class: 'week-pill', style: `background:${meta.color}` }, `${template} · ${meta.label}`),
    h('span', { class: 'week-date' }, fmtDateHuman(iso)),
  ]));
  wrap.appendChild(h('div', { class: 'week-event' }, week.event));

  // cuenta atrás al próximo partido (solo semanas con partido: T2/T5)
  if ((template === 'T2' || template === 'T5') && week.primary) {
    const matchDate = week.primary.date;
    const diff = daysBetween(iso, matchDate);
    let matchTxt;
    if (diff === 0) matchTxt = `🏉 ¡Hoy juegas! · ${matchLabel(week.primary)}`;
    else if (diff > 0) matchTxt = `🏉 Partido en ${diff} día${diff === 1 ? '' : 's'} · ${matchLabel(week.primary)}`;
    else matchTxt = `🏉 Partido ya jugado esta semana · ${matchLabel(week.primary)}`;
    wrap.appendChild(h('div', { class: 'match-countdown' }, matchTxt));
  }

  wrap.appendChild(renderDayCard(iso, dayData));

  return wrap;
}

// ---------------- TAB: SEMANA ----------------
function tabSemana() {
  const iso = state.selectedDate;
  const week = getEffectiveWeek(iso);
  const wrap = h('div', { class: 'screen' });
  const meta = TEMPLATE_META[week.template];
  wrap.appendChild(h('div', { class: 'week-header' }, [
    h('span', { class: 'week-pill', style: `background:${meta.color}` }, `${week.template} · ${meta.label}`),
  ]));
  wrap.appendChild(h('div', { class: 'week-event' }, week.event));

  const todayIdx = weekdayIndexMonFirst(iso);
  TEMPLATES[week.template].forEach((_, i) => {
    const dIso = addDays(week.monday, i);
    const isToday = i === todayIdx;
    const dayData = getDayData(dIso);
    const item = h('details', { class: 'week-day-item' + (isToday ? ' is-today' : '') });
    const summary = h('summary', {}, [
      h('span', { class: 'wd-name' }, dayData.day + (isToday ? ' · viendo' : '')),
      h('span', { class: 'wd-title' }, dayData.titulo),
    ]);
    item.appendChild(summary);
    item.appendChild(renderDayCard(dIso, dayData));
    if (isToday) item.setAttribute('open', 'open');
    wrap.appendChild(item);
  });
  return wrap;
}

// ---------------- TAB: CALENDARIO ----------------
if (!state.calendarMonth) state.calendarMonth = todayISO().slice(0, 7); // "YYYY-MM"
if (state.calendarSelectedDate === undefined) state.calendarSelectedDate = null;

function shiftMonth(ym, delta) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  const label = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function matchIconFor(m) {
  if (m.esEliminatoria) return '★';
  return m.tipo === 'liga' ? '●' : '○';
}

function tabCalendario() {
  const ym = state.calendarMonth;
  const wrap = h('div', { class: 'screen' });

  // leyenda de tipos de semana
  wrap.appendChild(h('div', { class: 'legend' },
    Object.entries(TEMPLATE_META).map(([k, m]) =>
      h('span', { class: 'legend-item' }, [
        h('span', { class: 'legend-dot', style: `background:${m.color}` }),
        `${k} ${m.short}`,
      ])
    )
  ));
  wrap.appendChild(h('div', { class: 'legend legend-matches' }, [
    h('span', { class: 'legend-item' }, '● Liga'),
    h('span', { class: 'legend-item' }, '○ Amistoso'),
    h('span', { class: 'legend-item' }, '★ Eliminatoria'),
  ]));

  // navegación de mes
  const isCurrentMonth = ym === todayISO().slice(0, 7);
  const navLabelBits = [h('div', { class: 'cal-month-label' }, monthLabel(ym))];
  if (!isCurrentMonth) {
    navLabelBits.push(h('button', {
      class: 'date-nav-today',
      onclick: () => { state.calendarMonth = todayISO().slice(0, 7); render(); },
    }, 'Hoy'));
  }
  wrap.appendChild(h('div', { class: 'cal-month-nav' }, [
    h('button', { class: 'date-nav-btn', onclick: () => { state.calendarMonth = shiftMonth(ym, -1); render(); } }, '◀'),
    h('div', { class: 'cal-month-label-wrap' }, navLabelBits),
    h('button', { class: 'date-nav-btn', onclick: () => { state.calendarMonth = shiftMonth(ym, 1); render(); } }, '▶'),
  ]));

  // rejilla del mes
  wrap.appendChild(buildMonthGrid(ym));

  // panel del día seleccionado
  if (state.calendarSelectedDate) {
    wrap.appendChild(buildDayEditor(state.calendarSelectedDate));
  } else {
    wrap.appendChild(h('div', { class: 'notice-small cal-hint' }, 'Toca un día para ver su tipo de semana, añadir un partido o registrar cómo te fue.'));
  }

  return wrap;
}

function buildMonthGrid(ym) {
  const [y, m] = ym.split('-').map(Number);
  const firstOfMonth = `${ym}-01`;
  const gridStart = addDays(firstOfMonth, -weekdayIndexMonFirst(firstOfMonth));
  const today = todayISO();

  const grid = h('div', { class: 'cal-grid' });
  ['L', 'M', 'X', 'J', 'V', 'S', 'D'].forEach(d => grid.appendChild(h('div', { class: 'cal-weekday-label' }, d)));

  for (let i = 0; i < 42; i++) {
    const dIso = addDays(gridStart, i);
    const inMonth = dIso.slice(0, 7) === ym;
    if (!inMonth && i >= 35) continue; // no añadir una 6ª fila si no hace falta
    const template = getEffectiveWeek(dIso).template;
    const meta = TEMPLATE_META[template];
    const matches = matchesOnDate(dIso);
    const isToday = dIso === today;
    const isSelected = dIso === state.calendarSelectedDate;

    const cell = h('button', {
      class: 'cal-day-cell' + (inMonth ? '' : ' cal-day-outside') + (isToday ? ' cal-day-today' : '') + (isSelected ? ' cal-day-selected' : ''),
      style: `--cal-color:${meta.color}`,
      onclick: () => { state.calendarSelectedDate = isSelected ? null : dIso; render(); },
    }, [
      h('span', { class: 'cal-day-num' }, String(dateObj(dIso).getDate())),
      matches.length ? h('span', { class: 'cal-day-match' }, matches.map(matchIconFor).join(' ')) : null,
    ]);
    grid.appendChild(cell);
  }
  return grid;
}

function emptyMatchDraft(dIso) {
  return { id: newMatchId(), date: dIso, tipo: 'liga', rival: '', equipo: 'primero', esEliminatoria: false, notas: '' };
}

function buildDayEditor(dIso) {
  const week = getEffectiveWeek(dIso);
  const meta = TEMPLATE_META[week.template];
  const existingMatch = matchesOnDate(dIso)[0] || null;
  const monday = week.monday;

  const panel = h('div', { class: 'card day-editor' });
  panel.appendChild(h('div', { class: 'day-editor-header' }, [
    h('div', { class: 'day-editor-date' }, fmtDateHuman(dIso)),
    h('span', { class: 'week-pill', style: `background:${meta.color}` }, `${week.template} · ${meta.label}`),
  ]));
  panel.appendChild(h('div', { class: 'notice-small' }, week.event));

  // toggle de semana de descanso total (afecta a la semana entera, no solo al día)
  const restRow = h('div', { class: 'field-row' });
  restRow.appendChild(h('label', {}, 'Marcar TODA esta semana como descanso total (T4)'));
  const restChk = h('input', {
    type: 'checkbox',
    onchange: () => { toggleRestWeek(monday); render(); },
  });
  restChk.checked = isRestWeek(monday);
  restRow.appendChild(restChk);
  panel.appendChild(restRow);

  panel.appendChild(buildMatchForm(dIso, existingMatch));

  // registro de impresiones, solo si el partido ya se jugó (fecha <= hoy)
  if (existingMatch && dIso <= todayISO()) {
    panel.appendChild(buildMatchJournal(existingMatch));
  }

  return panel;
}

function buildMatchForm(dIso, existingMatch) {
  const isNew = !existingMatch;
  const draft = existingMatch || emptyMatchDraft(dIso);
  const wrap = h('div', { class: 'match-form' });
  wrap.appendChild(h('div', { class: 'card-title' }, isNew ? 'Añadir partido este día' : 'Editar partido'));

  const errorBox = h('div', { class: 'form-error', style: 'display:none' });

  function field(labelText, inputEl, full) {
    const row = h('div', { class: 'field-row' + (full ? ' field-row-full' : '') });
    row.appendChild(h('label', {}, labelText));
    row.appendChild(inputEl);
    return row;
  }

  const tipoSelect = h('select', { class: 'match-select' }, [
    h('option', { value: 'liga', selected: draft.tipo === 'liga' ? 'selected' : undefined }, 'Liga'),
    h('option', { value: 'amistoso', selected: draft.tipo === 'amistoso' ? 'selected' : undefined }, 'Amistoso'),
  ]);
  wrap.appendChild(field('Tipo', tipoSelect));

  const rivalInput = h('input', { type: 'text', placeholder: 'Nombre del rival', value: draft.rival || '' });
  wrap.appendChild(field('Rival', rivalInput));

  const equipoSelect = h('select', { class: 'match-select' }, [
    h('option', { value: 'primero', selected: draft.equipo === 'primero' ? 'selected' : undefined }, '1er equipo'),
    h('option', { value: 'B', selected: draft.equipo === 'B' ? 'selected' : undefined }, 'Equipo B'),
    h('option', { value: 'ambos', selected: draft.equipo === 'ambos' ? 'selected' : undefined }, 'Ambos'),
  ]);
  wrap.appendChild(field('Juegas con', equipoSelect));

  const eliminatoriaChk = h('input', { type: 'checkbox' });
  eliminatoriaChk.checked = !!draft.esEliminatoria;
  wrap.appendChild(field('Es eliminatoria (semifinal/final)', eliminatoriaChk));

  const notasInput = h('textarea', { rows: 2, placeholder: 'Notas (opcional)' }, draft.notas || '');
  wrap.appendChild(field('Notas', notasInput, true));

  wrap.appendChild(errorBox);

  const btnRow = h('div', { class: 'btn-row' });
  btnRow.appendChild(h('button', {
    class: 'btn btn-accent',
    onclick: () => {
      const payload = {
        id: draft.id,
        date: dIso,
        tipo: tipoSelect.value,
        rival: rivalInput.value.trim(),
        equipo: equipoSelect.value,
        esEliminatoria: eliminatoriaChk.checked,
        notas: notasInput.value.trim(),
        registro: draft.registro || null,
      };
      const result = upsertMatch(payload);
      if (!result.ok) {
        errorBox.textContent = result.error;
        errorBox.style.display = 'block';
        return;
      }
      render();
    },
  }, isNew ? 'Guardar partido' : 'Guardar cambios'));

  if (!isNew) {
    btnRow.appendChild(h('button', {
      class: 'btn btn-danger',
      onclick: () => { deleteMatch(draft.id); render(); },
    }, 'Eliminar partido'));
  }
  wrap.appendChild(btnRow);

  return wrap;
}

function buildMatchJournal(match) {
  const reg = match.registro || {};
  const wrap = h('div', { class: 'match-form journal-section' });
  wrap.appendChild(h('div', { class: 'card-title' }, 'Cómo te fue'));

  function field(labelText, inputEl, full) {
    const row = h('div', { class: 'field-row' + (full ? ' field-row-full' : '') });
    row.appendChild(h('label', {}, labelText));
    row.appendChild(inputEl);
    return row;
  }

  function saveField(key, value) {
    const current = getMatches().find(m => m.id === match.id);
    if (!current) return;
    upsertMatch({ ...current, registro: { ...(current.registro || {}), [key]: value } });
  }

  const rolSelect = h('select', {
    class: 'match-select',
    onchange: (e) => { saveField('rol', e.target.value); },
  }, [
    h('option', { value: '', selected: !reg.rol ? 'selected' : undefined }, '—'),
    h('option', { value: 'titular', selected: reg.rol === 'titular' ? 'selected' : undefined }, 'Titular'),
    h('option', { value: 'finalizador', selected: reg.rol === 'finalizador' ? 'selected' : undefined }, 'Finalizador (suplente)'),
  ]);
  wrap.appendChild(field('Rol en el partido', rolSelect));

  const minutosInput = h('input', {
    type: 'number', min: 0, max: 80, value: reg.minutos ?? '',
    onchange: (e) => { saveField('minutos', e.target.value); },
  });
  wrap.appendChild(field('Minutos jugados', minutosInput));

  const bienInput = h('textarea', {
    rows: 2, placeholder: 'Lo que hiciste bien',
    onchange: (e) => { saveField('bien', e.target.value); },
  }, reg.bien || '');
  wrap.appendChild(field('Cosas que hice bien', bienInput, true));

  const mejorarInput = h('textarea', {
    rows: 2, placeholder: 'Lo que puedes mejorar',
    onchange: (e) => { saveField('mejorar', e.target.value); },
  }, reg.mejorar || '');
  wrap.appendChild(field('Cosas a mejorar', mejorarInput, true));

  return wrap;
}

// ---------------- TAB: NUTRICIÓN ----------------
function tabNutricion() {
  const iso = state.selectedDate;
  const week = getEffectiveWeek(iso);
  const template = week.template;
  const params = getNutritionParams();
  const wrap = h('div', { class: 'screen' });

  const res = computeNutrition(params, template);

  wrap.appendChild(h('div', { class: 'nutri-status', style: `border-color:${res.maintenance ? '#B4432E' : '#4C7A62'}` }, [
    h('div', { class: 'nutri-status-title' }, res.maintenance ? 'Semana de mantenimiento' : 'Semana de déficit'),
    h('div', { class: 'nutri-status-sub' }, res.maintenance
      ? `Semana ${template} (${template === 'T3' ? 'post-partido' : 'eliminatoria/final'}): calorías subidas a mantenimiento, sin déficit.`
      : `Semana ${template}: déficit del ${Math.round(res.deficitAplicado * 100)}% aplicado.`),
  ]));

  if (res.capApplied) {
    wrap.appendChild(h('div', { class: 'nutri-status', style: 'border-color:#D9A441' }, [
      h('div', { class: 'nutri-status-title' }, `Tope de ${Math.round(res.tope)} kcal aplicado`),
      h('div', { class: 'nutri-status-sub' }, `El cálculo daba ${Math.round(res.kcalCalculado)} kcal, pero nunca se superan las ${Math.round(res.tope)} kcal/día.`),
    ]));
  }

  const macroGrid = h('div', { class: 'macro-grid' }, [
    macroBox('Kcal objetivo', Math.round(res.kcalObjetivo), ''),
    macroBox('Proteína', Math.round(res.proteina), 'g'),
    macroBox('Grasas', Math.round(res.grasas), 'g'),
    macroBox('Carbohidratos', Math.round(res.carbohidratos), 'g'),
  ]);
  wrap.appendChild(macroGrid);

  wrap.appendChild(h('div', { class: 'card' }, [
    h('div', { class: 'card-title' }, 'Progreso hacia el objetivo'),
    h('div', { class: 'kv' }, [h('span', {}, 'BMR'), h('span', {}, `${Math.round(res.bmr)} kcal`)]),
    h('div', { class: 'kv' }, [h('span', {}, 'TDEE'), h('span', {}, `${Math.round(res.tdee)} kcal`)]),
    h('div', { class: 'kv' }, [h('span', {}, 'Kg por perder'), h('span', {}, `${res.kgAPerder.toFixed(1)} kg`)]),
    h('div', { class: 'kv' }, [h('span', {}, 'Semanas estimadas'), h('span', {}, `${res.semanasEstimadas.toFixed(0)} sem (ritmo 0,7-1,2 kg/sem)`)]),
  ]));

  // formulario editable
  const form = h('div', { class: 'card' }, [
    h('div', { class: 'card-title' }, 'Datos (editables)'),
  ]);
  const fields = [
    ['peso', 'Peso actual (kg)', 0.1],
    ['altura', 'Altura (cm)', 1],
    ['edad', 'Edad (años)', 1],
    ['mlg', 'Masa libre de grasa (kg)', 0.1],
    ['pesoObjetivo', 'Peso objetivo (kg)', 0.1],
    ['factorActividad', 'Factor de actividad', 0.01],
    ['porcentajeDeficit', '% Déficit (semanas normales)', 0.01],
    ['kcalMax', 'Tope máximo de kcal/día', 10],
  ];
  fields.forEach(([key, label, step]) => {
    const row = h('div', { class: 'field-row' });
    row.appendChild(h('label', {}, label));
    const displayVal = key === 'porcentajeDeficit' ? Math.round(params[key] * 100) : params[key];
    const input = h('input', {
      type: 'number', step: key === 'porcentajeDeficit' ? 1 : step, value: displayVal,
      onchange: (e) => {
        const raw = parseFloat(e.target.value);
        if (isNaN(raw)) return;
        const p = getNutritionParams();
        p[key] = key === 'porcentajeDeficit' ? raw / 100 : raw;
        saveNutritionParams(p);
        render();
      },
    });
    row.appendChild(input);
    form.appendChild(row);
  });
  wrap.appendChild(form);

  return wrap;
}
function macroBox(label, value, unit) {
  return h('div', { class: 'macro-box' }, [
    h('div', { class: 'macro-value' }, `${value}${unit}`),
    h('div', { class: 'macro-label' }, label),
  ]);
}

// ---------------- TAB: PROGRESIÓN 10K ----------------
function tabProgresion() {
  const wrap = h('div', { class: 'screen' });
  const rp = getRunProgress();
  const cur = RUN_PROGRESSION.find(r => r.semana === rp.semana) || RUN_PROGRESSION[0];

  wrap.appendChild(h('div', { class: 'card highlight-card' }, [
    h('div', { class: 'card-title' }, `Semana de progresión ${cur.semana} / 9`),
    h('div', { class: 'kv' }, [h('span', {}, 'Tirada larga (sábado)'), h('span', {}, cur.tirada)]),
    h('div', { class: 'kv' }, [h('span', {}, 'Tempo (jueves)'), h('span', {}, cur.tempo)]),
    h('div', { class: 'notice-small' }, 'Avanza solo en semanas T1. Si no te encuentras bien (dolor articular, fatiga excesiva), repite la semana en vez de avanzar.'),
    h('div', { class: 'btn-row' }, [
      h('button', { class: 'btn', onclick: () => {
        const v = getRunProgress();
        if (v.semana > 1) { setRunProgress({ semana: v.semana - 1 }); render(); }
      }}, '← Repetir semana anterior'),
      h('button', { class: 'btn btn-accent', onclick: () => {
        const v = getRunProgress();
        if (v.semana < 9) { setRunProgress({ semana: v.semana + 1 }); render(); }
      }}, 'Avanzar semana →'),
    ]),
  ]));

  const table = h('div', { class: 'table' });
  RUN_PROGRESSION.forEach(r => {
    table.appendChild(h('div', { class: 'table-row' + (r.semana === cur.semana ? ' table-row-current' : '') }, [
      h('div', { class: 'table-cell cell-week' }, `S${r.semana}`),
      h('div', { class: 'table-cell' }, [
        h('div', { class: 'cell-label' }, 'Tirada'),
        h('div', {}, r.tirada),
        h('div', { class: 'cell-label' }, 'Tempo'),
        h('div', {}, r.tempo),
      ]),
    ]));
  });
  wrap.appendChild(table);
  return wrap;
}

// ---------------- TAB: SEGUIMIENTO ----------------
function currentWeekMonday(iso) {
  return getEffectiveWeek(iso).monday;
}

function tabSeguimiento() {
  const wrap = h('div', { class: 'screen' });
  const tracking = getTracking();
  const thisMonday = currentWeekMonday(state.selectedDate);
  const entry = tracking[thisMonday] || {};

  const form = h('div', { class: 'card' }, [
    h('div', { class: 'card-title' }, `Registro semana del ${fmtDateShort(thisMonday)}`),
  ]);

  const fields = [
    ['peso', 'Peso (kg)', 'number'],
    ['masaMuscular', 'Masa muscular (kg)', 'number'],
    ['grasaCorporal', 'Grasa corporal (%)', 'number'],
    ['imc', 'Índice de Masa Corporal', 'number'],
    ['grasaVisceral', 'Grasa visceral (kg)', 'number'],
    ['tdee', 'TDEE (kcal/día)', 'number'],
    ['bmr', 'BMR (kcal/día)', 'number'],
    ['kcalMedias', 'Kcal medias/día', 'number'],
    ['pasosMedios', 'Pasos medios/día', 'number'],
    ['tiempo10k', 'Tiempo 10K (si aplica)', 'text'],
  ];
  fields.forEach(([key, label, type]) => {
    const row = h('div', { class: 'field-row' });
    row.appendChild(h('label', {}, label));
    row.appendChild(h('input', {
      type, value: entry[key] ?? '',
      onchange: (e) => { saveTrackingEntry(thisMonday, { [key]: e.target.value }); },
    }));
    form.appendChild(row);
  });

  const chkRow = h('div', { class: 'field-row' });
  chkRow.appendChild(h('label', {}, '¿Completó el 10K esta semana?'));
  const chk = h('input', {
    type: 'checkbox',
    onchange: (e) => { saveTrackingEntry(thisMonday, { completo10k: e.target.checked }); },
  });
  chk.checked = !!entry.completo10k;
  chkRow.appendChild(chk);
  form.appendChild(chkRow);

  const commentRow = h('div', { class: 'field-row field-row-full' });
  commentRow.appendChild(h('label', {}, 'Comentarios'));
  commentRow.appendChild(h('textarea', {
    rows: 3,
    oninput: (e) => { saveTrackingEntry(thisMonday, { comentarios: e.target.value }); },
  }, entry.comentarios || ''));
  form.appendChild(commentRow);

  wrap.appendChild(form);

  // gráfica de peso
  const weightSeries = Object.keys(tracking).sort()
    .filter(w => tracking[w].peso !== undefined && tracking[w].peso !== '')
    .map(w => parseFloat(tracking[w].peso));
  wrap.appendChild(h('div', { class: 'card' }, [
    h('div', { class: 'card-title' }, 'Evolución del peso'),
    renderLineChart(weightSeries),
  ]));

  // puntuación de musculatura corporal
  wrap.appendChild(renderMuscleSection(tracking, thisMonday));

  // historial
  const hist = h('div', { class: 'card' }, [h('div', { class: 'card-title' }, 'Historial')]);
  const weeks = Object.keys(tracking).sort();
  if (weeks.length === 0) {
    hist.appendChild(h('div', { class: 'notice-small' }, 'Aún no hay registros.'));
  } else {
    weeks.slice().reverse().forEach(wk => {
      const e = tracking[wk];
      hist.appendChild(h('div', { class: 'hist-row' }, [
        h('div', { class: 'hist-date' }, fmtDateShort(wk)),
        h('div', { class: 'hist-data' }, `${e.peso || '—'} kg · ${e.masaMuscular || '—'} kg · ${e.grasaCorporal || '—'}% · IMC ${e.imc || '—'} · Visceral ${e.grasaVisceral || '—'} kg · TDEE ${e.tdee || '—'} kcal · BMR ${e.bmr || '—'} kcal · ${e.kcalMedias || '—'} kcal/día · ${e.pasosMedios || '—'} pasos · 10K: ${e.tiempo10k || (e.completo10k ? 'completado' : '—')}${e.comentarios ? ` · ${e.comentarios}` : ''}`),
      ]));
    });
  }
  wrap.appendChild(hist);

  wrap.appendChild(renderBackupCard());

  return wrap;
}

// ---------------- COPIA DE SEGURIDAD ----------------
// Todos los datos viven en localStorage del dispositivo. Al pasar de la PWA de Chrome
// a la app Android (o al reinstalarla) NO se transfieren solos, así que se exportan
// como un texto JSON que se copia y se pega en el otro lado.
function buildBackup() {
  const data = {};
  Object.values(LS_KEYS).forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) data[k] = v;
  });
  return JSON.stringify({ app: 'plan-pilar', version: 1, exportedAt: new Date().toISOString(), data });
}
function restoreBackup(text) {
  let obj;
  try { obj = JSON.parse(text); } catch (e) { return { ok: false, error: 'El texto no es una copia válida (JSON incorrecto o incompleto).' }; }
  if (!isRecord(obj) || obj.app !== 'plan-pilar' || !isRecord(obj.data)) {
    return { ok: false, error: 'Eso no parece una copia de seguridad de Plan Pilar.' };
  }
  const allowed = new Set(Object.values(LS_KEYS));
  const entries = Object.entries(obj.data).filter(([k, v]) => allowed.has(k) && typeof v === 'string');
  if (entries.length === 0) return { ok: false, error: 'La copia no contiene datos reconocibles.' };
  for (const [k, v] of entries) {
    try { JSON.parse(v); } catch (e) { return { ok: false, error: `Datos dañados en "${k}". No se ha restaurado nada.` }; }
  }
  entries.forEach(([k, v]) => localStorage.setItem(k, v));
  return { ok: true, count: entries.length };
}

function renderBackupCard() {
  const card = h('div', { class: 'card' }, [
    h('div', { class: 'card-title' }, 'Copia de seguridad'),
    h('div', { class: 'notice-small' }, 'Tus datos solo están en este dispositivo. Copia la copia de seguridad y guárdala (nota, mail, chat contigo mismo) antes de reinstalar o cambiar de móvil. Para restaurar: pega el texto aquí y pulsa Restaurar.'),
  ]);
  const area = h('textarea', { rows: 4, class: 'backup-area', placeholder: 'Aquí aparece la copia, o pega aquí la que quieras restaurar' });
  const status = h('div', { class: 'notice-small backup-status' }, '');
  function say(msg) { status.textContent = msg; }

  const copyBtn = h('button', {
    class: 'btn btn-accent',
    onclick: async () => {
      const text = buildBackup();
      area.value = text;
      try {
        await navigator.clipboard.writeText(text);
        say('Copia hecha y copiada al portapapeles.');
      } catch (e) {
        area.focus(); area.select();
        say('No pude copiarla automáticamente: el texto está seleccionado, cópialo a mano.');
      }
    },
  }, 'Copiar copia de seguridad');

  const restoreBtn = h('button', {
    class: 'btn btn-danger',
    onclick: () => {
      const text = area.value.trim();
      if (!text) { say('Pega primero el texto de la copia.'); return; }
      if (!confirm('Esto sustituye los datos actuales de este dispositivo por los de la copia. ¿Continuar?')) return;
      const result = restoreBackup(text);
      if (!result.ok) { say(result.error); return; }
      say(`Restaurado (${result.count} bloques de datos). Recargando...`);
      setTimeout(() => location.reload(), 600);
    },
  }, 'Restaurar desde el texto');

  card.appendChild(area);
  card.appendChild(h('div', { class: 'btn-row' }, [copyBtn, restoreBtn]));
  card.appendChild(status);
  return card;
}

function renderLineChart(values, opts = {}) {
  const { width = 320, height = 110, colorVar = '--accent', minPoints = 2 } = opts;
  if (values.length < minPoints) {
    return h('div', { class: 'notice-small' }, `Necesitas al menos ${minPoints} registros para ver la gráfica.`);
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = (max - min) || 1;
  const PAD = 10;
  const stepX = values.length > 1 ? (width - PAD * 2) / (values.length - 1) : 0;
  const scaleY = v => height - PAD - ((v - min) / span) * (height - PAD * 2);
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${PAD + i * stepX} ${scaleY(v)}`).join(' ');
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'weight-chart');
  const line = document.createElementNS(svgNS, 'path');
  line.setAttribute('d', path);
  line.setAttribute('stroke', `var(${colorVar})`);
  line.setAttribute('class', 'weight-chart-line');
  svg.appendChild(line);
  values.forEach((v, i) => {
    const c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('cx', PAD + i * stepX);
    c.setAttribute('cy', scaleY(v));
    c.setAttribute('r', 3);
    c.setAttribute('fill', `var(${colorVar})`);
    c.setAttribute('class', 'weight-chart-dot');
    svg.appendChild(c);
  });
  return svg;
}

function scoreColor(v) {
  if (v === null || v === undefined || v === '') return '#3a3d42';
  const n = parseFloat(v);
  if (isNaN(n)) return '#3a3d42';
  if (n < 4) return '#b4432e';
  if (n < 7) return '#d9a441';
  return '#4c7a62';
}

// Silueta frontal simplificada de un cuerpo masculino, construida como zonas propias
// (no es una imagen importada: al ser una PWA 100% offline, un dibujo propio evita
// depender de una descarga externa y de posibles derechos de una imagen de terceros).
function buildBodySVG(scores) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 220 380');
  svg.setAttribute('class', 'body-svg');

  function shape(tag, attrs, muscleKey) {
    const el = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (muscleKey) {
      el.setAttribute('fill', scoreColor(scores[muscleKey]));
      el.setAttribute('class', 'muscle-zone');
      el.setAttribute('data-muscle', muscleKey);
    }
    el.setAttribute('stroke', '#0d0e10');
    el.setAttribute('stroke-width', '2');
    return el;
  }

  const head = shape('ellipse', { cx: 110, cy: 26, rx: 17, ry: 19 });
  head.setAttribute('fill', '#4a4d53');
  svg.appendChild(head);

  svg.appendChild(shape('rect', { x: 98, y: 42, width: 24, height: 16, rx: 4 }, 'cuello'));
  svg.appendChild(shape('rect', { x: 44, y: 58, width: 44, height: 26, rx: 10 }, 'hombros'));
  svg.appendChild(shape('rect', { x: 132, y: 58, width: 44, height: 26, rx: 10 }, 'hombros'));
  svg.appendChild(shape('rect', { x: 22, y: 62, width: 26, height: 108, rx: 12 }, 'brazos'));
  svg.appendChild(shape('rect', { x: 172, y: 62, width: 26, height: 108, rx: 12 }, 'brazos'));
  svg.appendChild(shape('rect', { x: 80, y: 60, width: 60, height: 50, rx: 12 }, 'pecho'));
  svg.appendChild(shape('rect', { x: 86, y: 108, width: 48, height: 62, rx: 10 }, 'core'));
  svg.appendChild(shape('rect', { x: 66, y: 176, width: 36, height: 108, rx: 14 }, 'piernas'));
  svg.appendChild(shape('rect', { x: 118, y: 176, width: 36, height: 108, rx: 14 }, 'piernas'));
  svg.appendChild(shape('rect', { x: 68, y: 288, width: 30, height: 84, rx: 12 }, 'gemelos'));
  svg.appendChild(shape('rect', { x: 122, y: 288, width: 30, height: 84, rx: 12 }, 'gemelos'));

  return svg;
}

function getMuscleScores(tracking, mondayIso) {
  return (tracking[mondayIso] && tracking[mondayIso].musculo) || {};
}

function saveMuscleScore(mondayIso, key, value) {
  const tracking = getTracking();
  const current = getMuscleScores(tracking, mondayIso);
  saveTrackingEntry(mondayIso, { musculo: { ...current, [key]: value } });
}

function muscleHistorySeries(tracking, key) {
  return Object.keys(tracking).sort()
    .map(wk => parseFloat(getMuscleScores(tracking, wk)[key]))
    .filter(v => !isNaN(v));
}

function renderMuscleSection(tracking, thisMonday) {
  const scores = getMuscleScores(tracking, thisMonday);
  const wrap = h('div', { class: 'card' }, [
    h('div', { class: 'card-title' }, 'Puntuación muscular (0-10)'),
  ]);

  const layout = h('div', { class: 'muscle-layout' });
  layout.appendChild(buildBodySVG(scores));

  const list = h('div', { class: 'muscle-list' });
  MUSCLE_GROUPS.forEach(m => {
    const details = h('details', { class: 'muscle-row-details' });
    const summary = h('summary', {}, [
      h('span', { class: 'muscle-dot', style: `background:${scoreColor(scores[m.key])}` }),
      h('span', { class: 'muscle-label' }, m.label),
      h('span', { class: 'muscle-current-score' }, scores[m.key] !== undefined && scores[m.key] !== '' ? `${scores[m.key]}/10` : '—'),
    ]);
    details.appendChild(summary);

    const body = h('div', { class: 'muscle-row-body' });
    const fw = h('div', { class: 'log-field' });
    fw.appendChild(h('label', {}, 'Puntuación esta semana (0-10)'));
    fw.appendChild(h('input', {
      type: 'number', min: 0, max: 10, step: 1,
      value: scores[m.key] ?? '',
      onchange: (e) => { saveMuscleScore(thisMonday, m.key, e.target.value); render(); },
    }));
    body.appendChild(fw);

    const series = muscleHistorySeries(tracking, m.key);
    body.appendChild(h('div', { class: 'log-chart-label' }, 'Tendencia'));
    body.appendChild(renderLineChart(series, { width: 260, height: 70 }));

    details.appendChild(body);
    list.appendChild(details);
  });
  layout.appendChild(list);
  wrap.appendChild(layout);

  const vals = Object.values(scores).map(v => parseFloat(v)).filter(v => !isNaN(v));
  const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  wrap.appendChild(h('div', { class: 'kv' }, [
    h('span', {}, 'Puntuación general esta semana'),
    h('span', {}, avg !== null ? avg.toFixed(1) + ' / 10' : '— (rellena los grupos)'),
  ]));

  const weeklyAverages = Object.keys(tracking).sort().map(wk => {
    const s = getMuscleScores(tracking, wk);
    const v = Object.values(s).map(x => parseFloat(x)).filter(x => !isNaN(x));
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  }).filter(v => v !== null);
  wrap.appendChild(h('div', { class: 'log-chart-label' }, 'Evolución de la puntuación general'));
  wrap.appendChild(renderLineChart(weeklyAverages));

  return wrap;
}

// ---------------- NAV ----------------
const TABS = [
  { id: 'hoy', label: 'Hoy', render: tabHoy },
  { id: 'semana', label: 'Semana', render: tabSemana },
  { id: 'calendario', label: 'Calendario', render: tabCalendario },
  { id: 'nutricion', label: 'Nutrición', render: tabNutricion },
  { id: 'progresion', label: '10K', render: tabProgresion },
  { id: 'seguimiento', label: 'Seguimiento', render: tabSeguimiento },
];

function render() {
  $app.innerHTML = '';
  const activeTab = TABS.find(t => t.id === state.tab) || TABS[0];
  $app.appendChild(activeTab.render());

  const nav = document.getElementById('nav');
  nav.innerHTML = '';
  TABS.forEach(t => {
    const btn = h('button', {
      class: 'nav-btn' + (t.id === state.tab ? ' nav-btn-active' : ''),
      onclick: () => { state.tab = t.id; render(); window.scrollTo(0, 0); },
    }, t.label);
    nav.appendChild(btn);
  });
}

render();

// ---------------- Service worker ----------------
// Solo en la versión web/PWA. En la app Android (Capacitor) los ficheros van dentro
// del APK, así que no hace falta caché ni service worker (y evitaría ver actualizaciones).
const IS_NATIVE_APP = !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
if ('serviceWorker' in navigator && !IS_NATIVE_APP) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
