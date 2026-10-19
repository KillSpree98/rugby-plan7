/* ==========================================================================
   LÓGICA DE LA APP · Plan Pilar (fase 2)
   ========================================================================== */

const LS_KEYS = {
  checks: 'rp_checks_v1',
  nutrition: 'rp_nutrition_v1',
  condProgress: 'rp_cond_progress_v1',
  tracking: 'rp_tracking_v1',
  exerciseLogs: 'rp_exercise_logs_v3',
  matches: 'rp_matches_v1',
  restWeeks: 'rp_rest_weeks_v1',
  foodLog: 'rp_food_log_v1',
  weightLog: 'rp_weight_log_v1',
  settings: 'rp_settings_v1',
};

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const ICONS = {
  fuerza: '🏋️', potencia: '💥', sprint: '⚡', rsa: '🔁', hiit: '🔥', metcon: '🥵',
  cardio: '🏃', core: '🧱', primera_linea: '🛡️', movilidad: '🤸', tecnica: '🎯',
  neat: '👣', partido: '🏉', descanso: '💤',
};

// ---------------- utilidades de fecha ----------------
function todayISO() { return isoFromDate(new Date()); }
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
  return dateObj(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}
function fmtDateShort(iso) {
  return dateObj(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtDateTiny(iso) {
  return dateObj(iso).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}
function dayOfYear(iso) {
  const d = dateObj(iso);
  const start = new Date(d.getFullYear(), 0, 0);
  // round (no floor): evita desfases de una hora por el cambio horario
  return Math.round((d - start) / 86400000);
}
function daysBetween(isoA, isoB) {
  return Math.round((dateObj(isoB) - dateObj(isoA)) / 86400000);
}
// índice de día 0=Lunes .. 6=Domingo
function weekdayIndexMonFirst(iso) {
  return (dateObj(iso).getDay() + 6) % 7;
}
function mondayOf(iso) { return addDays(iso, -weekdayIndexMonFirst(iso)); }
function isSundayISO(iso) { return dateObj(iso).getDay() === 0; }
function isSaturday(iso) { return dateObj(iso).getDay() === 6; }

// ---------------- formato numérico ----------------
function fmtNum(n, dec) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toLocaleString('es-ES', { maximumFractionDigits: dec === undefined ? 0 : dec });
}
function numOrNull(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
}

// ---------------- almacenamiento ----------------
function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function validAgainst(fallback, value) {
  if (Array.isArray(fallback) && !Array.isArray(value)) return false;
  if (isRecord(fallback) && !isRecord(value)) return false;
  return true;
}
// Lectura MUTABLE: parsea siempre de cero. Úsala cuando vayas a modificar y guardar.
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return validAgainst(fallback, value) ? value : fallback;
  } catch (e) { return fallback; }
}
// Lectura de SOLO LECTURA con caché por texto crudo: evita re-parsear cientos de
// KB de historial en cada tarjeta. NUNCA modifiques lo que devuelve.
const _readCache = {};
function readJSON(key, fallback) {
  let raw = null;
  try { raw = localStorage.getItem(key); } catch (e) { return fallback; }
  if (!raw) return fallback;
  const c = _readCache[key];
  if (c && c.raw === raw) return c.value;
  try {
    const value = JSON.parse(raw);
    if (!validAgainst(fallback, value)) return fallback;
    _readCache[key] = { raw, value };
    return value;
  } catch (e) { return fallback; }
}
function saveJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (e) {
    toast('No se pudo guardar: almacenamiento lleno o bloqueado. Haz una copia de seguridad.');
    return false;
  }
}

// aviso flotante breve
let _toastTimer = null;
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('toast-show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('toast-show'), 3200);
}

// ---------------- ajustes (tema, sonido) ----------------
const THEMES = [
  { id: 'oscuro',    label: 'Oscuro',         icon: '🌙', color: '#14161a' },
  { id: 'contraste', label: 'Alto contraste', icon: '◐',  color: '#000000' },
  { id: 'claro',     label: 'Claro',          icon: '☀️', color: '#f4f1ea' },
];
function getSettings() {
  const s = readJSON(LS_KEYS.settings, {});
  return { theme: 'oscuro', timerMute: false, ...s };
}
function saveSettings(patch) {
  saveJSON(LS_KEYS.settings, { ...loadJSON(LS_KEYS.settings, {}), ...patch });
}
function applyTheme() {
  const t = THEMES.find(x => x.id === getSettings().theme) || THEMES[0];
  document.documentElement.setAttribute('data-theme', t.id);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t.color);
  const btn = document.getElementById('theme-btn');
  if (btn) {
    btn.textContent = t.icon;
    btn.setAttribute('aria-label', `Tema: ${t.label}. Toca para cambiar`);
    btn.setAttribute('title', `Tema: ${t.label}`);
  }
}
function cycleTheme() {
  const cur = THEMES.findIndex(x => x.id === getSettings().theme);
  const next = THEMES[(cur + 1) % THEMES.length];
  saveSettings({ theme: next.id });
  applyTheme();
  toast(`Tema: ${next.label}`);
}

// ---------------- partidos (editables desde Calendario) ----------------
function getMatches() {
  const matches = readJSON(LS_KEYS.matches, DEFAULT_MATCHES.map(mt => ({ ...mt })));
  return matches.filter(match => isRecord(match)
    && typeof match.id === 'string'
    && typeof match.date === 'string'
    && (match.rival === undefined || typeof match.rival === 'string')
    && validateMatch(match).ok);
}
function saveMatches(list) { saveJSON(LS_KEYS.matches, list); }

function getRestWeeks() {
  return readJSON(LS_KEYS.restWeeks, [...DEFAULT_REST_WEEKS])
    .filter(week => typeof week === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(week));
}
function saveRestWeeks(list) { saveJSON(LS_KEYS.restWeeks, list); }
function isRestWeek(monday) { return getRestWeeks().includes(monday); }
function toggleRestWeek(monday) {
  const list = getRestWeeks().slice();
  const idx = list.indexOf(monday);
  if (idx >= 0) list.splice(idx, 1); else list.push(monday);
  saveRestWeeks(list);
}

function newMatchId() { return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

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
  const list = getMatches().slice();
  const idx = list.findIndex(x => x.id === match.id);
  if (idx >= 0) list[idx] = match; else list.push(match);
  saveMatches(list);
  return { ok: true };
}
function deleteMatch(id) { saveMatches(getMatches().filter(x => x.id !== id)); }
function matchesOnDate(iso) { return getMatches().filter(x => x.date === iso); }
function matchesInWeek(monday) {
  const end = addDays(monday, 6);
  return getMatches().filter(x => x.date >= monday && x.date <= end)
    .sort((a, b) => a.date < b.date ? -1 : 1);
}

function matchTeamLabel(equipo) {
  return equipo === 'ambos' ? '1er equipo y B' : equipo === 'B' ? 'Equipo B' : '1er equipo';
}
function matchLabel(mt) {
  const rival = mt.rival && mt.rival.trim() ? mt.rival.trim() : (mt.tipo === 'liga' ? 'Jornada de liga' : 'Amistoso');
  return `${rival} · ${matchTeamLabel(mt.equipo)}`;
}

// Cuenta como "semana con partido": liga, eliminatoria, o amistoso en sábado/domingo.
function matchCountsAsMatchWeek(mt) {
  return mt.tipo === 'liga' || mt.esEliminatoria || (mt.tipo === 'amistoso' && (isSundayISO(mt.date) || isSaturday(mt.date)));
}

// ---------------- cálculo de la plantilla (T1-T5) de una semana ----------------
//  - Eliminatoria -> T5
//  - Partido de liga esa semana -> T2
//  - Amistoso en sábado/domingo -> T2; entre semana -> T1 (T3 si venías de jugar)
//  - Sin partido: marcada a mano como libre -> T4; venías de jugar -> T3; si no T1
function computeWeekTemplate(monday) {
  const matches = matchesInWeek(monday);
  const playoff = matches.find(x => x.esEliminatoria);
  if (playoff) return { template: 'T5', matches, primary: playoff, dayOverride: null };

  const liga = matches.find(x => x.tipo === 'liga' && !x.esEliminatoria);
  if (liga) return { template: 'T2', matches, primary: liga, dayOverride: null };

  const prevHadMatch = matchesInWeek(addDays(monday, -7)).some(matchCountsAsMatchWeek);

  const amistoso = matches.find(x => x.tipo === 'amistoso');
  if (amistoso) {
    if (isSundayISO(amistoso.date) || isSaturday(amistoso.date)) return { template: 'T2', matches, primary: amistoso, dayOverride: null };
    return { template: prevHadMatch ? 'T3' : 'T1', matches, primary: amistoso, dayOverride: null };
  }

  if (isRestWeek(monday)) return { template: 'T4', matches, primary: null, dayOverride: null };
  if (prevHadMatch) return { template: 'T3', matches, primary: null, dayOverride: null };
  return { template: 'T1', matches, primary: null, dayOverride: null };
}

function weekEventLabel(computed, monday) {
  if (computed.template === 'T4') return 'Semana libre · nadie juega';
  if (computed.matches.length === 0) {
    if (monday < SEASON_WEEKS[0]) return 'Pretemporada';
    if (monday > SEASON_WEEKS[SEASON_WEEKS.length - 1]) return 'Postemporada';
    return computed.template === 'T3' ? 'Sin partido esta semana (venías de jugar)' : 'Sin partido esta semana';
  }
  return computed.matches.map(matchLabel).join(' · ');
}

function getEffectiveWeek(iso) {
  const monday = mondayOf(iso);
  const computed = computeWeekTemplate(monday);
  return { monday, ...computed, event: weekEventLabel(computed, monday) };
}

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
  const matchToday = week.matches.find(x => x.date === iso);

  if (matchToday) {
    if (hasPartidoSlot) {
      day = injectMatchInfo(day, matchToday);
    } else if (matchToday.tipo === 'amistoso' && !matchToday.esEliminatoria && isWeekdayMonToFri(iso)) {
      day = { ...day, bloques: [...day.bloques, matchBlock(matchToday)] };
    } else {
      day = matchDayCard(matchToday);
    }
  } else if (hasPartidoSlot && week.primary) {
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
  calendarMonth: todayISO().slice(0, 7),
  calendarSelectedDate: null,
  openWeekDays: new Set(),
  weekInit: new Set(),
  openMuscles: new Set(),
  foodEditId: null,
  // ayuda integrada
  guideOpen: new Set(['empezar']),
  guideOpenEx: new Set(),
  openHelp: new Set(),
  prevTab: 'hoy',
  guideQuery: '',
};
let loadedToday = todayISO();

// ---------------- checks de ejercicios ----------------
function getChecksForDate(iso) {
  const all = readJSON(LS_KEYS.checks, {});
  return isRecord(all[iso]) ? all[iso] : {};
}
function toggleCheck(iso, exId) {
  const all = loadJSON(LS_KEYS.checks, {});
  if (!isRecord(all[iso])) all[iso] = {};
  all[iso][exId] = !all[iso][exId];
  saveJSON(LS_KEYS.checks, all);
}

// ---------------- histórico de ejercicios (series individuales) ----------------
// exerciseLogs[movKey][fecha] = { sets: [ {peso,reps,done,warmup}, ... ], custom? }
function getExerciseLogs(movKey) {
  const all = readJSON(LS_KEYS.exerciseLogs, {});
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
function getExerciseLogEntry(movKey, iso) { return getExerciseLogs(movKey)[iso] || null; }

function saveExerciseSetField(movKey, iso, setIndex, fieldKey, value) {
  const all = loadJSON(LS_KEYS.exerciseLogs, {});
  const entry = getOrCreateEntry(all, movKey, iso);
  const sets = entry.sets;
  while (sets.length <= setIndex) sets.push({});
  sets[setIndex] = { ...sets[setIndex], [fieldKey]: value };
  saveJSON(LS_KEYS.exerciseLogs, all);
}
// marca/desmarca una serie; al marcar sin valores, rellena con la referencia anterior
function toggleExerciseSetDone(movKey, iso, setIndex, fallbackValues) {
  const all = loadJSON(LS_KEYS.exerciseLogs, {});
  const entry = getOrCreateEntry(all, movKey, iso);
  const sets = entry.sets;
  while (sets.length <= setIndex) sets.push({});
  const current = sets[setIndex];
  const nowDone = !current.done;
  const next = { ...current, done: nowDone };
  if (nowDone && fallbackValues) {
    Object.entries(fallbackValues).forEach(([k, v]) => {
      if (next[k] === undefined || next[k] === '') next[k] = v;
    });
  }
  sets[setIndex] = next;
  saveJSON(LS_KEYS.exerciseLogs, all);
}

// Series de calentamiento (warmup:true): van siempre al principio y NO cuentan para
// PR, marcas ni historial. Si custom=true, el nº de filas es exactamente el guardado;
// si no, es max(prescritas, guardadas).
function isWarmupSet(s) { return !!(s && s.warmup); }
function workingSets(sets) { return (sets || []).filter(s => !isWarmupSet(s)); }
function warmupSets(sets) { return (sets || []).filter(isWarmupSet); }

function materializeSets(entry, prescribed) {
  if (entry.custom) return;
  while (workingSets(entry.sets).length < prescribed) entry.sets.push({});
}
function getOrCreateEntry(all, movKey, iso) {
  if (!all[movKey]) all[movKey] = {};
  if (!all[movKey][iso]) all[movKey][iso] = { sets: [] };
  if (!Array.isArray(all[movKey][iso].sets)) all[movKey][iso].sets = [];
  return all[movKey][iso];
}
function addExerciseSet(movKey, iso, prescribed) {
  const all = loadJSON(LS_KEYS.exerciseLogs, {});
  const entry = getOrCreateEntry(all, movKey, iso);
  materializeSets(entry, prescribed || 0);
  entry.sets.push({});
  entry.custom = true;
  saveJSON(LS_KEYS.exerciseLogs, all);
}
function addWarmupSet(movKey, iso, prescribed) {
  const all = loadJSON(LS_KEYS.exerciseLogs, {});
  const entry = getOrCreateEntry(all, movKey, iso);
  materializeSets(entry, prescribed || 0);
  const at = warmupSets(entry.sets).length;
  entry.sets.splice(at, 0, { warmup: true });
  entry.custom = true;
  saveJSON(LS_KEYS.exerciseLogs, all);
}
function removeLastExerciseSet(movKey, iso, prescribed) {
  const all = loadJSON(LS_KEYS.exerciseLogs, {});
  const entry = getOrCreateEntry(all, movKey, iso);
  materializeSets(entry, prescribed || 0);
  if (entry.sets.length === 0) return;
  entry.sets.pop();
  entry.custom = true;
  saveJSON(LS_KEYS.exerciseLogs, all);
}
function previousExerciseSets(movKey, iso) {
  const logs = getExerciseLogs(movKey);
  const dates = Object.keys(logs).filter(d => d < iso).sort();
  if (dates.length === 0) return [];
  return logs[dates[dates.length - 1]].sets || [];
}

// valor agregado de un campo entre las series de trabajo de una fecha.
// agg: 'sum' | 'min' | 'max'. Se ignoran valores vacíos y <= 0.
function aggregateSetField(sets, fieldKey, agg) {
  const vals = workingSets(sets).map(s => parseFloat(s[fieldKey])).filter(v => !isNaN(v) && v > 0);
  if (vals.length === 0) return null;
  if (agg === 'sum') return vals.reduce((a, b) => a + b, 0);
  if (agg === 'min') return Math.min(...vals);
  return Math.max(...vals);
}
function exerciseHistorySeries(movKey, fieldKey, agg) {
  const logs = getExerciseLogs(movKey);
  return Object.keys(logs).sort()
    .map(d => ({ date: d, value: aggregateSetField(logs[d].sets, fieldKey, agg) }))
    .filter(p => p.value !== null);
}
// mejor marca histórica en fechas anteriores a iso (mejor = max o min según el tipo)
function historicalBestBefore(movKey, iso, fieldKey, better) {
  const logs = getExerciseLogs(movKey);
  let best = null;
  Object.keys(logs).filter(d => d < iso).forEach(d => {
    workingSets(logs[d].sets).forEach(s => {
      const v = parseFloat(s[fieldKey]);
      if (isNaN(v) || v <= 0) return;
      if (best === null || (better === 'min' ? v < best : v > best)) best = v;
    });
  });
  return best;
}
// mejor marca absoluta (todas las fechas) de un movimiento
function bestEver(movKey, fieldKey, better) {
  return historicalBestBefore(movKey, '9999-12-31', fieldKey, better);
}

// ======================================================================
// NUTRICIÓN
// ======================================================================
function getNutritionParams() {
  const stored = readJSON(LS_KEYS.nutrition, null);
  return { ...NUTRITION_DEFAULTS, ...(isRecord(stored) ? stored : {}) };
}
function saveNutritionParams(p) { saveJSON(LS_KEYS.nutrition, p); }

// T5 (eliminatoria) siempre mantenimiento. T3 (post-partido) mantiene el déficit
// salvo que lo desactives en los datos (deficitEnT3 = false).
function weekIsMaintenance(template, params) {
  if (template === 'T5') return true;
  if (template === 'T3') return !!params && params.deficitEnT3 === false;
  return false;
}

// Carga del día para repartir calorías: partido > alta > media > baja.
// El día previo a un partido cuenta como "alta" (carga de hidratos).
function dayLoadKey(iso) {
  const tipos = new Set();
  getDayData(iso).bloques.forEach(b => b.ejercicios.forEach(e => tipos.add(e.tipo)));
  if (tipos.has('partido')) return 'partido';
  const tomorrow = new Set();
  getDayData(addDays(iso, 1)).bloques.forEach(b => b.ejercicios.forEach(e => tomorrow.add(e.tipo)));
  if (tomorrow.has('partido')) return 'alta';
  if (['rsa', 'hiit', 'metcon', 'sprint'].some(t => tipos.has(t))) return 'alta';
  if (tipos.has('fuerza') || tipos.has('potencia')) return 'media';
  return 'baja';
}

function computeNutrition(params, template, loadKey) {
  const { peso, altura, edad, mlg, pesoObjetivo, factorActividad, porcentajeDeficit, kcalMax } = params;
  const bmr = 10 * peso + 6.25 * altura - 5 * edad + 5;
  const tdee = bmr * factorActividad;
  const maintenance = weekIsMaintenance(template, params);
  const deficitAplicado = maintenance ? 0 : porcentajeDeficit;
  const kcalCalculado = tdee * (1 - deficitAplicado);
  // El tope solo limita las semanas de déficit (antes también recortaba el
  // "mantenimiento" y nunca se subía de verdad).
  const tope = kcalMax > 0 ? kcalMax : Infinity;
  const capApplied = !maintenance && kcalCalculado > tope;
  const kcalBase = maintenance ? kcalCalculado : Math.min(kcalCalculado, tope);

  // En semanas de mantenimiento no se aplica el ciclado por carga del día: el mantenimiento
  // ya es la cifra alta y sumarle +12% el día de partido daba cantidades poco realistas.
  const baseLoad = DAY_LOAD_FACTORS[loadKey] || DAY_LOAD_FACTORS.media;
  const load = maintenance ? { ...baseLoad, factor: 1 } : baseLoad;
  const kcalObjetivo = Math.round(kcalBase * load.factor);

  const proteina = mlg * 2.35;
  let grasas = peso * 0.7;
  let carbohidratos = (kcalObjetivo - proteina * 4 - grasas * 9) / 4;
  // suelo de hidratos (100 g): se recorta grasa hasta 0,5 g/kg antes de dejar el hidrato en nada
  const MIN_CARBS = 100;
  if (carbohidratos < MIN_CARBS) {
    const needKcal = (MIN_CARBS - carbohidratos) * 4;
    const reducible = Math.max(0, (grasas - peso * 0.5) * 9);
    const cut = Math.min(needKcal, reducible);
    grasas -= cut / 9;
    carbohidratos += cut / 4;
  }
  carbohidratos = Math.max(0, carbohidratos);

  const kgAPerder = peso - pesoObjetivo;
  const perdidaSemanalKg = maintenance ? 0 : Math.max(0, (tdee - kcalBase) * 7 / 7700);
  const perdidaPct = peso > 0 ? perdidaSemanalKg / peso * 100 : 0;
  const semanasEstimadas = perdidaSemanalKg > 0 && kgAPerder > 0 ? kgAPerder / perdidaSemanalKg : null;

  return {
    bmr, tdee, kcalBase, kcalObjetivo, kcalCalculado, capApplied, tope,
    proteina, grasas, carbohidratos, kgAPerder, semanasEstimadas, perdidaSemanalKg, perdidaPct,
    maintenance, deficitAplicado, loadKey: loadKey || 'media', loadFactor: load.factor,
    // se avisa por la media de la semana (kcalBase), no por cada día de carga baja
    bajoBMR: !maintenance && kcalBase < bmr,
  };
}

function getDayTarget(iso) {
  const params = getNutritionParams();
  const week = getEffectiveWeek(iso);
  const loadKey = dayLoadKey(iso);
  return { ...computeNutrition(params, week.template, loadKey), template: week.template, iso };
}
function targetSnapshot(iso) {
  const t = getDayTarget(iso);
  return { kcal: t.kcalObjetivo, p: Math.round(t.proteina), c: Math.round(t.carbohidratos), g: Math.round(t.grasas), tdee: Math.round(t.tdee), load: t.loadKey };
}
// objetivo de un día: los días pasados con registro conservan el objetivo con el que se registraron
function targetForDay(iso) {
  const day = getFoodDay(iso);
  if (iso < todayISO() && day.target && numOrNull(day.target.kcal) !== null) return day.target;
  return targetSnapshot(iso);
}

// ======================================================================
// REGISTRO DIARIO DE CALORÍAS
// foodLog[fecha] = { items: [ {id, t, momento, name, kcal, p, c, g} ], target: {...} }
// ======================================================================
const MEAL_SLOTS = ['Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena', 'Pre-entreno', 'Post-entreno', 'Snack'];
function defaultMealSlot() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'Desayuno';
  if (h >= 10 && h < 12) return 'Almuerzo';
  if (h >= 12 && h < 16) return 'Comida';
  if (h >= 16 && h < 19) return 'Merienda';
  if (h >= 19 && h < 23) return 'Cena';
  return 'Snack';
}
function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function newFoodId() { return 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function getFoodDay(iso) {
  const all = readJSON(LS_KEYS.foodLog, {});
  const d = all[iso];
  if (!isRecord(d)) return { items: [], target: null };
  return {
    items: Array.isArray(d.items) ? d.items.filter(isRecord) : [],
    target: isRecord(d.target) ? d.target : null,
  };
}
function foodTotals(items) {
  const t = { kcal: 0, p: 0, c: 0, g: 0 };
  (items || []).forEach(i => {
    t.kcal += numOrNull(i.kcal) || 0;
    t.p += numOrNull(i.p) || 0;
    t.c += numOrNull(i.c) || 0;
    t.g += numOrNull(i.g) || 0;
  });
  return t;
}
function writeFoodDay(iso, items) {
  const all = loadJSON(LS_KEYS.foodLog, {});
  if (items.length === 0) delete all[iso];
  else all[iso] = { items, target: targetSnapshot(iso) };
  saveJSON(LS_KEYS.foodLog, all);
}
// valida y normaliza una ingesta. Si no hay kcal pero hay macros, las calcula (4/4/9).
function normalizeFoodInput(raw) {
  const kcalIn = numOrNull(raw.kcal);
  const p = numOrNull(raw.p), c = numOrNull(raw.c), g = numOrNull(raw.g);
  for (const [label, v] of [['Proteína', p], ['Hidratos', c], ['Grasas', g]]) {
    if (v !== null && (v < 0 || v > 1000)) return { ok: false, error: `${label}: valor no válido (0-1000 g).` };
  }
  let kcal = kcalIn;
  if (kcal === null && (p !== null || c !== null || g !== null)) {
    kcal = Math.round((p || 0) * 4 + (c || 0) * 4 + (g || 0) * 9);
  }
  if (kcal === null || kcal <= 0) return { ok: false, error: 'Pon las calorías (o al menos algún macro).' };
  if (kcal > 6000) return { ok: false, error: 'Más de 6.000 kcal en una sola ingesta: revisa el número.' };
  const item = {
    name: (raw.name || '').trim() || 'Ingesta rápida',
    momento: raw.momento || defaultMealSlot(),
    t: raw.t || nowHHMM(),
    kcal: Math.round(kcal),
  };
  if (p !== null) item.p = Math.round(p * 10) / 10;
  if (c !== null) item.c = Math.round(c * 10) / 10;
  if (g !== null) item.g = Math.round(g * 10) / 10;
  return { ok: true, item };
}
function addFoodItem(iso, item) {
  const day = getFoodDay(iso);
  writeFoodDay(iso, [...day.items, { ...item, id: newFoodId() }]);
}
function updateFoodItem(iso, id, item) {
  const day = getFoodDay(iso);
  writeFoodDay(iso, day.items.map(i => i.id === id ? { ...item, id } : i));
}
function deleteFoodItem(iso, id) {
  const day = getFoodDay(iso);
  writeFoodDay(iso, day.items.filter(i => i.id !== id));
}
// últimas ingestas distintas (para repetirlas con un toque)
function recentFoods(limit) {
  const all = readJSON(LS_KEYS.foodLog, {});
  const out = [];
  const seen = new Set();
  Object.keys(all).sort().reverse().forEach(d => {
    const items = isRecord(all[d]) && Array.isArray(all[d].items) ? all[d].items.filter(isRecord) : [];
    items.slice().reverse().forEach(i => {
      if (out.length >= limit) return;
      const key = [i.name, i.kcal, i.p, i.c, i.g].join('|');
      if (seen.has(key) || !i.name || i.name === 'Ingesta rápida') return;
      seen.add(key);
      out.push(i);
    });
  });
  return out;
}

// estado de cumplimiento de un día: none | bajo | ok | alto
function foodDayStatus(iso) {
  const day = getFoodDay(iso);
  if (day.items.length === 0) return { key: 'none', pct: 0, kcal: 0, target: targetForDay(iso) };
  const tot = foodTotals(day.items);
  const target = targetForDay(iso);
  const pct = target.kcal > 0 ? tot.kcal / target.kcal : 0;
  const key = pct < 0.85 ? 'bajo' : pct <= 1.03 ? 'ok' : 'alto';
  return { key, pct, kcal: tot.kcal, target, totals: tot };
}

// ======================================================================
// PESO CORPORAL DIARIO
// weightLog[fecha] = kg
// ======================================================================
function weightEntriesSorted() {
  const w = readJSON(LS_KEYS.weightLog, {});
  return Object.keys(w)
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && numOrNull(w[d]) !== null && numOrNull(w[d]) > 0)
    .sort()
    .map(d => ({ date: d, kg: numOrNull(w[d]) }));
}
// Mantiene sincronizados el peso de Nutrición (BMR/TDEE) y el peso semanal de Progreso
function syncWeightEverywhere(iso) {
  const entries = weightEntriesSorted();
  if (entries.length === 0) return;
  const latest = entries[entries.length - 1];
  const stored = loadJSON(LS_KEYS.nutrition, {});
  stored.peso = latest.kg;
  saveJSON(LS_KEYS.nutrition, stored);
  const monday = mondayOf(iso);
  const wk = entries.filter(e => mondayOf(e.date) === monday);
  if (wk.length) saveTrackingEntry(monday, { peso: String(wk[wk.length - 1].kg) });
}
function saveWeight(iso, kg) {
  const all = loadJSON(LS_KEYS.weightLog, {});
  all[iso] = Math.round(kg * 10) / 10;
  saveJSON(LS_KEYS.weightLog, all);
  syncWeightEverywhere(iso);
}
function deleteWeight(iso) {
  const all = loadJSON(LS_KEYS.weightLog, {});
  delete all[iso];
  saveJSON(LS_KEYS.weightLog, all);
  syncWeightEverywhere(iso);
}
// media móvil (ventana de N días hacia atrás) para cada día registrado
function movingAverage(entries, windowDays) {
  return entries.map(e => {
    const from = addDays(e.date, -(windowDays - 1));
    const win = entries.filter(x => x.date >= from && x.date <= e.date);
    return { date: e.date, avg: win.reduce((a, b) => a + b.kg, 0) / win.length };
  });
}
// pendiente de regresión lineal (kg por semana) sobre los últimos N días
function slopePerWeek(entries, windowDays) {
  if (entries.length < 3) return null;
  const last = entries[entries.length - 1].date;
  const from = addDays(last, -(windowDays - 1));
  const pts = entries.filter(e => e.date >= from);
  if (pts.length < 3) return null;
  const x = pts.map(p => daysBetween(pts[0].date, p.date));
  if (x[x.length - 1] - x[0] < 5) return null;
  const y = pts.map(p => p.kg);
  const n = pts.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (x[i] - mx) * (y[i] - my); den += (x[i] - mx) ** 2; }
  if (den === 0) return null;
  return (num / den) * 7;
}

// Cruza peso real, calorías registradas y déficit teórico de los últimos 7 días
function progressAnalysis() {
  const entries = weightEntriesSorted();
  const slope = slopePerWeek(entries, 14);
  const params = getNutritionParams();
  const today = todayISO();
  const logged = [];
  for (let i = 0; i < 7; i++) {
    const iso = addDays(today, -i);
    const day = getFoodDay(iso);
    if (day.items.length === 0) continue;
    const tgt = targetForDay(iso);
    logged.push({ iso, kcal: foodTotals(day.items).kcal, tdee: numOrNull(tgt.tdee) || getDayTarget(iso).tdee });
  }
  const avgKcal = logged.length ? logged.reduce((a, b) => a + b.kcal, 0) / logged.length : null;
  const avgDeficit = logged.length ? logged.reduce((a, b) => a + (b.tdee - b.kcal), 0) / logged.length : null;
  const expectedPerWeek = logged.length >= 3 && avgDeficit !== null ? avgDeficit * 7 / 7700 : null;
  const out = { slope, avgKcal, loggedDays: logged.length, expectedPerWeek, lossPerWeek: null, verdict: 'datos', message: '' };

  if (slope === null) {
    out.message = 'Pésate varios días (al menos 3 en una semana) para ver tu tendencia real y compararla con lo que comes.';
    return out;
  }
  const loss = -slope;
  out.lossPerWeek = loss;
  const pct = params.peso > 0 ? loss / params.peso * 100 : 0;
  if (pct > 1.2) {
    out.verdict = 'rapido';
    out.message = `Estás perdiendo ${fmtNum(loss, 1)} kg/semana (${fmtNum(pct, 1)}% de tu peso). Es más rápido de lo recomendable para conservar potencia: sube 150-250 kcal.`;
  } else if (loss < 0.3 && out.loggedDays >= 4) {
    out.verdict = 'lento';
    out.message = `La tendencia es de ${fmtNum(loss, 1)} kg/semana con ${out.loggedDays} días registrados. Revisa porciones y aceites, los fines de semana y los pasos diarios antes de recortar más.`;
  } else if (loss >= 0.3) {
    out.verdict = 'ok';
    out.message = `Tendencia de ${fmtNum(loss, 1)} kg/semana (${fmtNum(pct, 1)}% del peso): ritmo correcto. Mantén el plan.`;
  } else {
    out.message = `Tendencia de ${fmtNum(loss, 1)} kg/semana. Registra más días de comida para valorar si hay que ajustar.`;
  }
  return out;
}

// ======================================================================
// PROGRESIÓN DE ACONDICIONAMIENTO
// ======================================================================
function getCondProgress() {
  const v = readJSON(LS_KEYS.condProgress, { semana: 1 });
  const s = parseInt(v.semana, 10);
  return { semana: isNaN(s) ? 1 : Math.min(Math.max(s, 1), CONDITIONING_PROGRESSION.length) };
}
function setCondProgress(v) { saveJSON(LS_KEYS.condProgress, v); }
function currentCondWeek() {
  const sem = getCondProgress().semana;
  return CONDITIONING_PROGRESSION.find(r => r.semana === sem) || CONDITIONING_PROGRESSION[0];
}
// detalle de un ejercicio, con la pauta de la semana de progresión si la tiene
function exerciseDetail(exObj) {
  let d = exObj.detail || '';
  if (exObj.prog) {
    const cw = currentCondWeek();
    const pauta = cw[exObj.prog];
    if (pauta) d = (d ? d + ' · ' : '') + `Semana ${cw.semana}: ${pauta}`;
  }
  return d;
}

// ======================================================================
// SEGUIMIENTO SEMANAL
// ======================================================================
function getTracking() {
  const stored = readJSON(LS_KEYS.tracking, {});
  const validEntries = {};
  Object.entries(stored).forEach(([week, entry]) => {
    if (isRecord(entry)) validEntries[week] = entry;
  });
  return validEntries; // por lunes ISO de la semana
}
function saveTrackingEntry(mondayIso, entry) {
  const all = getTracking();
  all[mondayIso] = { ...(all[mondayIso] || {}), ...entry };
  saveJSON(LS_KEYS.tracking, all);
}
// medias de la semana a partir de los registros de comida, pasos y peso
function weekAverages(monday) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const kcals = [];
  days.forEach(d => { const it = getFoodDay(d).items; if (it.length) kcals.push(foodTotals(it).kcal); });
  const stepLogs = getExerciseLogs('pasos-del-dia');
  const steps = [];
  days.forEach(d => { if (stepLogs[d]) { const v = aggregateSetField(stepLogs[d].sets, 'pasos', 'sum'); if (v) steps.push(v); } });
  const wk = weightEntriesSorted().filter(e => e.date >= monday && e.date <= days[6]);
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  return {
    kcal: avg(kcals), kcalDays: kcals.length,
    pasos: avg(steps), pasosDays: steps.length,
    peso: wk.length ? wk[wk.length - 1].kg : null,
  };
}

// ======================================================================
// COPIA DE SEGURIDAD
// ======================================================================
function buildBackup() {
  const data = {};
  Object.values(LS_KEYS).forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) data[k] = v;
  });
  return JSON.stringify({ app: 'plan-pilar', version: 2, exportedAt: new Date().toISOString(), data });
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
  try {
    entries.forEach(([k, v]) => localStorage.setItem(k, v));
  } catch (e) {
    return { ok: false, error: 'No se pudo escribir en el almacenamiento (¿lleno?).' };
  }
  return { ok: true, count: entries.length };
}

// ======================================================================
// RENDER · helpers
// ======================================================================
const $app = document.getElementById('app');

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c === null || c === undefined || c === false) return;
    el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  });
  return el;
}

// Re-render completo conservando el scroll
function render() {
  const y = window.scrollY;
  clearTimeout(_softTimer); // un render completo anula cualquier refresco diferido pendiente
  $app.innerHTML = '';
  const activeTab = TABS.find(t => t.id === state.tab) || TABS[0];
  $app.appendChild(activeTab.render());

  const nav = document.getElementById('nav');
  nav.innerHTML = '';
  TABS.filter(t => !t.hidden).forEach(t => {
    nav.appendChild(h('button', {
      class: 'nav-btn' + (t.id === state.tab ? ' nav-btn-active' : ''),
      'aria-label': t.label,
      'aria-current': t.id === state.tab ? 'page' : null,
      onclick: () => { state.tab = t.id; render(); window.scrollTo(0, 0); },
    }, [h('span', { class: 'nav-ico' }, t.icon), h('span', { class: 'nav-txt' }, t.label)]));
  });
  updateTopbar();
  window.scrollTo(0, y);
}

// Re-render diferido: no destruye el campo que el usuario está rellenando.
// (Antes cada "change" hacía render() y el teclado se cerraba al saltar de KG a REPS.)
let _softTimer = null;
function softRender() {
  clearTimeout(_softTimer);
  _softTimer = setTimeout(() => {
    const a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && $app.contains(a)) return;
    render();
  }, 350);
}

function updateTopbar() {
  const sub = document.getElementById('topbar-sub');
  if (!sub) return;
  const p = getNutritionParams();
  sub.textContent = `${fmtNum(p.peso, 1)} → ${fmtNum(p.pesoObjetivo, 1)} kg · Definición`;
}

function progressBar(pct, extraClass) {
  const cls = pct <= 1.0 ? 'pb-ok' : pct <= 1.05 ? 'pb-warn' : 'pb-over';
  return h('div', { class: 'pbar ' + (extraClass || '') }, [
    h('div', { class: 'pbar-fill ' + cls, style: `width:${Math.max(0, Math.min(pct, 1)) * 100}%` }),
  ]);
}

function renderLineChart(values, opts = {}) {
  const { width = 320, height = 110, colorVar = '--accent', minPoints = 2, secondary = null, decimals = 1 } = opts;
  if (values.length < minPoints) {
    return h('div', { class: 'notice-small' }, `Necesitas al menos ${minPoints} registros para ver la gráfica.`);
  }
  const sec = secondary ? secondary.filter(v => v !== null && !isNaN(v)) : [];
  const all = values.concat(sec);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = (max - min) || 1;
  const PL = 34, PR = 10, PT = 10, PB = 10;
  const stepX = values.length > 1 ? (width - PL - PR) / (values.length - 1) : 0;
  const scaleY = v => height - PB - ((v - min) / span) * (height - PT - PB);
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'weight-chart');
  svg.setAttribute('role', 'img');

  function txt(x, y, s) {
    const t = document.createElementNS(svgNS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('class', 'chart-label');
    t.textContent = s;
    svg.appendChild(t);
  }
  txt(2, PT + 3, fmtNum(max, decimals));
  txt(2, height - PB + 3, fmtNum(min, decimals));

  if (secondary && secondary.length === values.length) {
    let d = '';
    secondary.forEach((v, i) => {
      if (v === null || isNaN(v)) return;
      d += `${d ? 'L' : 'M'} ${PL + i * stepX} ${scaleY(v)} `;
    });
    const sl = document.createElementNS(svgNS, 'path');
    sl.setAttribute('d', d);
    sl.setAttribute('class', 'chart-line-secondary');
    svg.appendChild(sl);
  }
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${PL + i * stepX} ${scaleY(v)}`).join(' ');
  const line = document.createElementNS(svgNS, 'path');
  line.setAttribute('d', path);
  line.setAttribute('stroke', `var(${colorVar})`);
  line.setAttribute('class', 'weight-chart-line');
  svg.appendChild(line);
  const dotEvery = values.length > 40 ? Math.ceil(values.length / 40) : 1;
  values.forEach((v, i) => {
    if (i % dotEvery !== 0 && i !== values.length - 1) return;
    const c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('cx', PL + i * stepX);
    c.setAttribute('cy', scaleY(v));
    c.setAttribute('r', 3);
    c.setAttribute('fill', `var(${colorVar})`);
    c.setAttribute('class', 'weight-chart-dot');
    svg.appendChild(c);
  });
  return svg;
}

// ======================================================================
// EJERCICIOS
// ======================================================================
function renderExercise(iso, exObj) {
  const specKey = getLogSpecKey(exObj);
  if (!specKey) return renderSimpleCheckRow(iso, exObj);
  return renderExerciseCard(iso, exObj, specKey);
}

function renderSimpleCheckRow(iso, exObj) {
  const checks = getChecksForDate(iso);
  const done = !!checks[exObj.id];
  const row = h('div', { class: 'ex-row' + (done ? ' ex-done' : '') });
  const box = h('button', {
    class: 'ex-check',
    'aria-label': 'Marcar completado',
    onclick: () => { toggleCheck(iso, exObj.id); render(); },
  }, done ? '✓' : '');
  const detail = exerciseDetail(exObj);
  const info = h('div', { class: 'ex-info' }, [
    h('div', { class: 'ex-name' }, `${ICONS[exObj.tipo] || ''} ${exObj.name}`),
    h('div', { class: 'ex-detail' }, [
      h('span', { class: 'ex-sets' }, exObj.sets),
      detail ? h('span', { class: 'ex-notes' }, ' · ' + detail) : null,
    ]),
  ]);
  row.appendChild(box);
  row.appendChild(info);
  const hk = getMovementKey(exObj);
  row.appendChild(infoToggleBtn(hk));
  if (!state.openHelp.has(hk)) return row;
  return h('div', {}, [row, renderExerciseHelpPanel(exObj, null)]);
}

function formatSetValue(fieldKey, val, unit) {
  if (val === undefined || val === null || val === '') return '—';
  const suffix = fieldKey === 'peso' ? 'kg' : fieldKey === 'reps' ? ' reps'
    : fieldKey === 'distancia' ? 'km' : fieldKey === 'duracion' ? unit
    : fieldKey === 'pasos' ? ' pasos' : fieldKey === 'tiempo' ? 's'
    : fieldKey === 'altura' ? 'cm' : fieldKey === 'rondas' ? ' rondas'
    : fieldKey === 'metros' ? 'm' : '';
  return `${val}${suffix}`;
}

// tarjeta de ejercicio con tabla de series individuales
function renderExerciseCard(iso, exObj, specKey) {
  const spec = LOG_TYPE_SPECS[specKey];
  const movKey = getMovementKey(exObj);
  const unit = specKey === 'duracion' ? inferDurationUnit(exObj) : null;
  const fields = spec.fields.map(f => f.label ? f : { ...f, label: unit.toUpperCase() });
  const better = spec.better === 'min' ? 'min' : 'max';

  const prescribed = Math.max(1, parseSetCount(exObj.sets));
  const entry = getExerciseLogEntry(movKey, iso);
  const isCustom = !!(entry && entry.custom);
  const rows = ((entry && entry.sets) || []).slice();
  if (!isCustom) while (workingSets(rows).length < prescribed) rows.push({});
  const rowCount = rows.length;

  const prevAll = previousExerciseSets(movKey, iso);
  const prevWarm = warmupSets(prevAll);
  const prevWork = workingSets(prevAll);
  const todaySets = (entry && entry.sets) || [];

  // PR solo si mejora ESTRICTAMENTE la mejor marca anterior (antes empatar ya contaba como PR)
  const bestBefore = spec.noPR ? null : historicalBestBefore(movKey, iso, spec.metric, better);
  const todayBest = aggregateSetField(todaySets, spec.metric, better);
  const isPR = bestBefore !== null && todayBest !== null
    && (better === 'min' ? todayBest < bestBefore : todayBest > bestBefore);

  const card = h('div', { class: 'exercise-card' + (isPR ? ' exercise-is-pr' : '') });
  card.appendChild(infoToggleBtn(movKey));

  const detail = exerciseDetail(exObj);
  const head = h('div', { class: 'exercise-card-head' }, [
    h('div', { class: 'exercise-card-title' }, `${ICONS[exObj.tipo] || ''} ${exObj.name}`),
    h('div', { class: 'exercise-card-sub' }, [
      h('span', {}, exObj.sets),
      detail ? h('span', {}, ' · ' + detail) : null,
    ]),
  ]);
  if (isPR) head.appendChild(h('div', { class: 'pr-badge' }, '🏆 Nuevo PR'));
  else if (bestBefore !== null) head.appendChild(h('div', { class: 'best-mark' }, `Mejor marca: ${formatSetValue(spec.metric, bestBefore, unit)}`));
  if (exObj.timer) {
    head.appendChild(h('button', {
      class: 'tm-open-btn',
      onclick: () => openTimer(exObj.timer),
    }, `⏱ ${exObj.timer.label}`));
  }
  card.appendChild(head);
  if (state.openHelp.has(movKey)) card.appendChild(renderExerciseHelpPanel(exObj, specKey));

  const gridHeadCells = [h('span', { class: 'set-col-serie' }, 'SERIE'), h('span', { class: 'set-col-anterior' }, 'ANTERIOR')];
  fields.forEach(f => gridHeadCells.push(h('span', { class: 'set-col-field' }, f.label)));
  gridHeadCells.push(h('span', { class: 'set-col-check' }, '✓'));
  card.appendChild(h('div', { class: `set-grid-head set-cols-${fields.length}` }, gridHeadCells));

  let warmIdx = 0;
  let workIdx = 0;
  for (let i = 0; i < rowCount; i++) {
    const todaySet = rows[i] || {};
    const isWarm = isWarmupSet(todaySet);
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
        class: 'set-input', type: 'number', step: f.step, inputmode: 'decimal',
        'aria-label': `${f.label} serie ${badgeText}`,
        value: todaySet[f.key] ?? '',
        placeholder: prevSet && prevSet[f.key] !== undefined ? String(prevSet[f.key]) : '',
        // guarda sin re-render inmediato: así no se cierra el teclado al saltar de campo
        onchange: (e) => { saveExerciseSetField(movKey, iso, i, f.key, e.target.value); softRender(); },
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
  card.appendChild(renderLineChart(series, { width: 300, height: 90, decimals: spec.metric === 'tiempo' ? 2 : 1 }));

  return card;
}

function renderDayCard(iso, dayData) {
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

// navegador de fecha: ver/registrar cualquier día
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

// ======================================================================
// TAB: HOY
// ======================================================================
function nutritionSummaryCard(iso) {
  const day = getFoodDay(iso);
  const tot = foodTotals(day.items);
  const tgt = targetForDay(iso);
  const pct = tgt.kcal > 0 ? tot.kcal / tgt.kcal : 0;
  const load = DAY_LOAD_FACTORS[tgt.load] || DAY_LOAD_FACTORS.media;
  const card = h('button', {
    class: 'card nutri-mini',
    'aria-label': 'Abrir Nutrición',
    onclick: () => { state.tab = 'nutricion'; render(); window.scrollTo(0, 0); },
  }, [
    h('div', { class: 'nutri-mini-row' }, [
      h('span', { class: 'nutri-mini-title' }, day.items.length ? 'Calorías de hoy' : 'Calorías: sin registrar'),
      h('span', { class: 'nutri-mini-num' }, `${fmtNum(tot.kcal)} / ${fmtNum(tgt.kcal)} kcal`),
    ]),
    progressBar(pct),
    h('div', { class: 'notice-small' }, `${load.label} · proteína objetivo ${fmtNum(tgt.p)} g`),
  ]);
  return card;
}

function tabHoy() {
  const iso = state.selectedDate;
  const week = getEffectiveWeek(iso);
  const wrap = h('div', { class: 'screen' });
  wrap.appendChild(dateNav(iso));

  const template = week.template;
  const dayData = getDayData(iso);
  const meta = TEMPLATE_META[template];
  const params = getNutritionParams();

  const doy = dayOfYear(iso);
  const useComida = doy % 2 === 0;
  const msgList = useComida ? MOTIVATION_COMIDA : MOTIVATION_RUGBY;
  const msg = msgList[doy % msgList.length]
    .replace('{peso}', `${fmtNum(params.peso, 1)} kg`)
    .replace('{objetivo}', `${fmtNum(params.pesoObjetivo, 1)} kg`);
  wrap.appendChild(h('div', { class: 'banner' }, [
    h('div', { class: 'banner-tag' }, useComida ? 'DISCIPLINA' : 'PACK'),
    h('div', { class: 'banner-text' }, msg),
  ]));

  const tip = TIPS[doy % TIPS.length];
  wrap.appendChild(h('div', { class: 'tip' }, [
    h('span', { class: 'tip-cat' }, tip.cat),
    h('span', { class: 'tip-text' }, tip.texto),
  ]));

  wrap.appendChild(h('div', { class: 'week-header' }, [
    h('span', { class: 'week-pill', style: `background:${meta.color}` }, `${template} · ${meta.label}`),
    h('span', { class: 'week-date' }, fmtDateHuman(iso)),
  ]));
  wrap.appendChild(h('div', { class: 'week-event' }, week.event));
  wrap.appendChild(h('div', { class: 'help-row' }, [helpBtn('semanas', 'Qué significa esta semana'), helpBtn('plan', 'Por qué este plan')]));

  if ((template === 'T2' || template === 'T5') && week.primary) {
    const diff = daysBetween(iso, week.primary.date);
    let matchTxt;
    if (diff === 0) matchTxt = `🏉 ¡Hoy juegas! · ${matchLabel(week.primary)}`;
    else if (diff > 0) matchTxt = `🏉 Partido en ${diff} día${diff === 1 ? '' : 's'} · ${matchLabel(week.primary)}`;
    else matchTxt = `🏉 Partido ya jugado esta semana · ${matchLabel(week.primary)}`;
    wrap.appendChild(h('div', { class: 'match-countdown' }, matchTxt));
  }

  wrap.appendChild(nutritionSummaryCard(iso));
  wrap.appendChild(renderDayCard(iso, dayData));
  return wrap;
}

// ======================================================================
// TAB: SEMANA
// ======================================================================
function tabSemana() {
  const iso = state.selectedDate;
  const week = getEffectiveWeek(iso);
  const wrap = h('div', { class: 'screen' });
  const meta = TEMPLATE_META[week.template];
  wrap.appendChild(h('div', { class: 'week-header' }, [
    h('span', { class: 'week-pill', style: `background:${meta.color}` }, `${week.template} · ${meta.label}`),
  ]));
  wrap.appendChild(h('div', { class: 'week-event' }, week.event));

  // por defecto se abre el día que estás viendo; luego se respeta lo que abras/cierres
  // (antes, al marcar una serie en otro día, se plegaba solo)
  if (!state.weekInit.has(week.monday)) {
    state.weekInit.add(week.monday);
    state.openWeekDays.add(iso);
  }

  const todayIdx = weekdayIndexMonFirst(iso);
  TEMPLATES[week.template].forEach((_, i) => {
    const dIso = addDays(week.monday, i);
    const isToday = i === todayIdx;
    const dayData = getDayData(dIso);
    const item = h('details', { class: 'week-day-item' + (isToday ? ' is-today' : '') });
    item.appendChild(h('summary', {}, [
      h('span', { class: 'wd-name' }, dayData.day + (isToday ? ' · viendo' : '')),
      h('span', { class: 'wd-title' }, dayData.titulo),
    ]));
    const isOpen = state.openWeekDays.has(dIso);
    if (isOpen) item.setAttribute('open', 'open');
    if (isOpen) item.appendChild(renderDayCard(dIso, dayData));
    item.addEventListener('toggle', () => {
      if (item.open) {
        state.openWeekDays.add(dIso);
        if (!item.querySelector('.day-card')) item.appendChild(renderDayCard(dIso, dayData));
      } else {
        state.openWeekDays.delete(dIso);
      }
    });
    wrap.appendChild(item);
  });
  return wrap;
}

// ======================================================================
// TAB: CALENDARIO
// ======================================================================
function shiftMonth(ym, delta) {
  const [y, mo] = ym.split('-').map(Number);
  const d = new Date(y, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(ym) {
  const [y, mo] = ym.split('-').map(Number);
  const label = new Date(y, mo - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
function matchIconFor(mt) {
  if (mt.esEliminatoria) return '★';
  return mt.tipo === 'liga' ? '●' : '○';
}

function tabCalendario() {
  const ym = state.calendarMonth;
  const wrap = h('div', { class: 'screen' });
  wrap.appendChild(h('div', { class: 'help-row' }, helpBtn('semanas', 'Cómo se decide el tipo de semana')));

  wrap.appendChild(h('div', { class: 'legend' },
    Object.entries(TEMPLATE_META).map(([k, mt]) =>
      h('span', { class: 'legend-item' }, [
        h('span', { class: 'legend-dot', style: `background:${mt.color}` }),
        `${k} ${mt.short}`,
      ])
    )
  ));
  wrap.appendChild(h('div', { class: 'legend legend-matches' }, [
    h('span', { class: 'legend-item' }, '● Liga'),
    h('span', { class: 'legend-item' }, '○ Amistoso'),
    h('span', { class: 'legend-item' }, '★ Eliminatoria'),
  ]));

  const isCurrentMonth = ym === todayISO().slice(0, 7);
  const navLabelBits = [h('div', { class: 'cal-month-label' }, monthLabel(ym))];
  if (!isCurrentMonth) {
    navLabelBits.push(h('button', {
      class: 'date-nav-today',
      onclick: () => { state.calendarMonth = todayISO().slice(0, 7); render(); },
    }, 'Hoy'));
  }
  wrap.appendChild(h('div', { class: 'cal-month-nav' }, [
    h('button', { class: 'date-nav-btn', 'aria-label': 'Mes anterior', onclick: () => { state.calendarMonth = shiftMonth(ym, -1); render(); } }, '◀'),
    h('div', { class: 'cal-month-label-wrap' }, navLabelBits),
    h('button', { class: 'date-nav-btn', 'aria-label': 'Mes siguiente', onclick: () => { state.calendarMonth = shiftMonth(ym, 1); render(); } }, '▶'),
  ]));

  wrap.appendChild(buildMonthGrid(ym));

  if (state.calendarSelectedDate) {
    wrap.appendChild(buildDayEditor(state.calendarSelectedDate));
  } else {
    wrap.appendChild(h('div', { class: 'notice-small cal-hint' }, 'Toca un día para ver su tipo de semana, añadir un partido o registrar cómo te fue.'));
  }
  return wrap;
}

function buildMonthGrid(ym) {
  const firstOfMonth = `${ym}-01`;
  const gridStart = addDays(firstOfMonth, -weekdayIndexMonFirst(firstOfMonth));
  const today = todayISO();

  const grid = h('div', { class: 'cal-grid' });
  ['L', 'M', 'X', 'J', 'V', 'S', 'D'].forEach(d => grid.appendChild(h('div', { class: 'cal-weekday-label' }, d)));

  // la plantilla es la misma para los 7 días de una semana: se calcula 1 vez por semana
  const weekCache = {};
  for (let i = 0; i < 42; i++) {
    const dIso = addDays(gridStart, i);
    const inMonth = dIso.slice(0, 7) === ym;
    if (!inMonth && i >= 35) continue;
    const mon = mondayOf(dIso);
    if (!weekCache[mon]) weekCache[mon] = getEffectiveWeek(dIso).template;
    const meta = TEMPLATE_META[weekCache[mon]];
    const matches = matchesOnDate(dIso);
    const isToday = dIso === today;
    const isSelected = dIso === state.calendarSelectedDate;

    grid.appendChild(h('button', {
      class: 'cal-day-cell' + (inMonth ? '' : ' cal-day-outside') + (isToday ? ' cal-day-today' : '') + (isSelected ? ' cal-day-selected' : ''),
      style: `--cal-color:${meta.color}`,
      'aria-label': fmtDateHuman(dIso),
      onclick: () => { state.calendarSelectedDate = isSelected ? null : dIso; render(); },
    }, [
      h('span', { class: 'cal-day-num' }, String(dateObj(dIso).getDate())),
      matches.length ? h('span', { class: 'cal-day-match' }, matches.map(matchIconFor).join(' ')) : null,
    ]));
  }
  return grid;
}

function emptyMatchDraft(dIso) {
  return { id: newMatchId(), date: dIso, tipo: 'liga', rival: '', equipo: 'primero', esEliminatoria: false, notas: '' };
}

function formField(labelText, inputEl, full) {
  const row = h('div', { class: 'field-row' + (full ? ' field-row-full' : '') });
  row.appendChild(h('label', {}, labelText));
  row.appendChild(inputEl);
  return row;
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

  panel.appendChild(h('button', {
    class: 'btn btn-accent',
    style: 'margin-top:8px',
    onclick: () => { state.selectedDate = dIso; state.tab = 'hoy'; render(); window.scrollTo(0, 0); },
  }, 'Ver el entreno de este día'));

  const restChk = h('input', { type: 'checkbox', onchange: () => { toggleRestWeek(monday); render(); } });
  restChk.checked = isRestWeek(monday);
  panel.appendChild(formField('Marcar TODA esta semana como libre (T4)', restChk));

  panel.appendChild(buildMatchForm(dIso, existingMatch));
  if (existingMatch && dIso <= todayISO()) panel.appendChild(buildMatchJournal(existingMatch));
  return panel;
}

function buildMatchForm(dIso, existingMatch) {
  const isNew = !existingMatch;
  const draft = existingMatch || emptyMatchDraft(dIso);
  const wrap = h('div', { class: 'match-form' });
  wrap.appendChild(h('div', { class: 'card-title' }, isNew ? 'Añadir partido este día' : 'Editar partido'));

  const errorBox = h('div', { class: 'form-error', style: 'display:none' });

  const tipoSelect = h('select', { class: 'match-select' }, [
    h('option', { value: 'liga', selected: draft.tipo === 'liga' ? 'selected' : undefined }, 'Liga'),
    h('option', { value: 'amistoso', selected: draft.tipo === 'amistoso' ? 'selected' : undefined }, 'Amistoso'),
  ]);
  wrap.appendChild(formField('Tipo', tipoSelect));

  const rivalInput = h('input', { type: 'text', placeholder: 'Nombre del rival', value: draft.rival || '' });
  wrap.appendChild(formField('Rival', rivalInput));

  const equipoSelect = h('select', { class: 'match-select' }, [
    h('option', { value: 'primero', selected: draft.equipo === 'primero' ? 'selected' : undefined }, '1er equipo'),
    h('option', { value: 'B', selected: draft.equipo === 'B' ? 'selected' : undefined }, 'Equipo B'),
    h('option', { value: 'ambos', selected: draft.equipo === 'ambos' ? 'selected' : undefined }, 'Ambos'),
  ]);
  wrap.appendChild(formField('Juegas con', equipoSelect));

  const eliminatoriaChk = h('input', { type: 'checkbox' });
  eliminatoriaChk.checked = !!draft.esEliminatoria;
  wrap.appendChild(formField('Es eliminatoria (semifinal/final)', eliminatoriaChk));

  const notasInput = h('textarea', { rows: 2, placeholder: 'Notas (opcional)' }, draft.notas || '');
  wrap.appendChild(formField('Notas', notasInput, true));
  wrap.appendChild(errorBox);

  const btnRow = h('div', { class: 'btn-row' });
  btnRow.appendChild(h('button', {
    class: 'btn btn-accent',
    onclick: () => {
      const payload = {
        id: draft.id, date: dIso, tipo: tipoSelect.value, rival: rivalInput.value.trim(),
        equipo: equipoSelect.value, esEliminatoria: eliminatoriaChk.checked,
        notas: notasInput.value.trim(), registro: draft.registro || null,
      };
      const result = upsertMatch(payload);
      if (!result.ok) { errorBox.textContent = result.error; errorBox.style.display = 'block'; return; }
      render();
    },
  }, isNew ? 'Guardar partido' : 'Guardar cambios'));

  if (!isNew) {
    btnRow.appendChild(h('button', {
      class: 'btn btn-danger',
      onclick: () => { if (confirm('¿Eliminar este partido?')) { deleteMatch(draft.id); render(); } },
    }, 'Eliminar partido'));
  }
  wrap.appendChild(btnRow);
  return wrap;
}

function buildMatchJournal(match) {
  const reg = match.registro || {};
  const wrap = h('div', { class: 'match-form journal-section' });
  wrap.appendChild(h('div', { class: 'card-title' }, 'Cómo te fue'));

  function saveField(key, value) {
    const current = getMatches().find(x => x.id === match.id);
    if (!current) return;
    upsertMatch({ ...current, registro: { ...(current.registro || {}), [key]: value } });
  }

  const rolSelect = h('select', {
    class: 'match-select',
    onchange: (e) => saveField('rol', e.target.value),
  }, [
    h('option', { value: '', selected: !reg.rol ? 'selected' : undefined }, '—'),
    h('option', { value: 'titular', selected: reg.rol === 'titular' ? 'selected' : undefined }, 'Titular'),
    h('option', { value: 'finalizador', selected: reg.rol === 'finalizador' ? 'selected' : undefined }, 'Finalizador (suplente)'),
  ]);
  wrap.appendChild(formField('Rol en el partido', rolSelect));

  wrap.appendChild(formField('Minutos jugados', h('input', {
    type: 'number', min: 0, max: 80, inputmode: 'numeric', value: reg.minutos ?? '',
    onchange: (e) => saveField('minutos', e.target.value),
  })));
  wrap.appendChild(formField('Cosas que hice bien', h('textarea', {
    rows: 2, placeholder: 'Lo que hiciste bien', onchange: (e) => saveField('bien', e.target.value),
  }, reg.bien || ''), true));
  wrap.appendChild(formField('Cosas a mejorar', h('textarea', {
    rows: 2, placeholder: 'Lo que puedes mejorar', onchange: (e) => saveField('mejorar', e.target.value),
  }, reg.mejorar || ''), true));
  return wrap;
}

// ======================================================================
// TAB: NUTRICIÓN
// ======================================================================
function tabNutricion() {
  const iso = state.selectedDate;
  const target = getDayTarget(iso);
  const wrap = h('div', { class: 'screen' });
  wrap.appendChild(dateNav(iso));
  wrap.appendChild(renderTargetStatus(target));
  wrap.appendChild(renderCalorieTracker(iso));
  wrap.appendChild(renderAnalysisCard());
  wrap.appendChild(renderWeightCard(iso));
  wrap.appendChild(renderFoodHistory());
  wrap.appendChild(renderProtocolCard());
  wrap.appendChild(renderNutritionParams(target));
  return wrap;
}

function renderTargetStatus(t) {
  const load = DAY_LOAD_FACTORS[t.loadKey] || DAY_LOAD_FACTORS.media;
  const box = h('div', { class: 'stack' });
  box.appendChild(h('div', { class: 'help-row' }, [helpBtn('nutricion-calculo', 'Cómo se calcula mi objetivo'), helpBtn('comer', 'Qué comer')]));

  const sub = t.maintenance
    ? `Semana ${t.template} (${t.template === 'T5' ? 'eliminatoria/final' : 'post-partido'}): calorías a mantenimiento estimado (${fmtNum(t.tdee)} kcal de base).`
    : `Semana ${t.template}: déficit del ${Math.round(t.deficitAplicado * 100)}% sobre tu gasto estimado${t.capApplied ? `, limitado por el tope de ${fmtNum(t.tope)} kcal` : ''}. Ritmo teórico: ${fmtNum(t.perdidaSemanalKg, 1)} kg/semana.`;
  box.appendChild(h('div', { class: 'nutri-status', style: `border-color:${t.maintenance ? 'var(--danger)' : 'var(--pack)'}` }, [
    h('div', { class: 'nutri-status-title' }, t.maintenance ? 'Semana de mantenimiento' : 'Semana de déficit'),
    h('div', { class: 'nutri-status-sub' }, sub),
  ]));

  const pctTxt = `${t.loadFactor >= 1 ? '+' : '−'}${Math.abs(Math.round((t.loadFactor - 1) * 100))}% sobre la base`;
  box.appendChild(h('div', { class: 'nutri-status', style: 'border-color:var(--accent)' }, [
    h('div', { class: 'nutri-status-title' }, `${load.label} · ${fmtNum(t.kcalObjetivo)} kcal`),
    h('div', { class: 'nutri-status-sub' }, `${load.hint} (${pctTxt}).`),
  ]));

  if (!t.maintenance && t.bajoBMR) {
    box.appendChild(h('div', { class: 'nutri-status', style: 'border-color:var(--danger)' }, [
      h('div', { class: 'nutri-status-title' }, 'Objetivo por debajo de tu metabolismo basal'),
      h('div', { class: 'nutri-status-sub' }, `Hoy son ${fmtNum(t.kcalObjetivo)} kcal y tu BMR estimado es ${fmtNum(t.bmr)}. Con tantas sesiones esto suele pagarse en rendimiento, sueño y lesiones. Si notas fatiga o los sprints empeoran, sube el tope de kcal en "Datos".`),
    ]));
  }
  if (!t.maintenance && t.perdidaPct > 1.2) {
    box.appendChild(h('div', { class: 'nutri-status', style: 'border-color:var(--danger)' }, [
      h('div', { class: 'nutri-status-title' }, 'Ritmo teórico demasiado alto'),
      h('div', { class: 'nutri-status-sub' }, `Este déficit supone ${fmtNum(t.perdidaPct, 1)}% de tu peso por semana. Por encima de ~1,2% se pierde potencia y músculo con facilidad.`),
    ]));
  }
  return box;
}

// ---------- registro de calorías ----------
function macroRow(label, val, goal, kind) {
  const pct = goal > 0 ? val / goal : 0;
  const cls = kind === 'min' ? (pct >= 0.9 ? 'pb-ok' : 'pb-neutral') : (pct <= 1.0 ? 'pb-ok' : pct <= 1.05 ? 'pb-warn' : 'pb-over');
  return h('div', { class: 'macro-row' }, [
    h('div', { class: 'macro-row-head' }, [
      h('span', {}, label),
      h('span', { class: 'macro-row-num' }, `${fmtNum(val)} / ${fmtNum(goal)} g`),
    ]),
    h('div', { class: 'pbar pbar-sm' }, [h('div', { class: 'pbar-fill ' + cls, style: `width:${Math.max(0, Math.min(pct, 1)) * 100}%` })]),
  ]);
}

function renderCalorieTracker(iso) {
  const day = getFoodDay(iso);
  const tot = foodTotals(day.items);
  const tgt = targetForDay(iso);
  const pct = tgt.kcal > 0 ? tot.kcal / tgt.kcal : 0;
  const diff = tgt.kcal - tot.kcal;

  const card = h('div', { class: 'card' });
  card.appendChild(titleWithHelp('Registro de calorías', 'nutricion-uso', 'Cómo usarlo'));
  card.appendChild(h('div', { class: 'kcal-big' }, [
    h('span', { class: 'kcal-big-num' }, fmtNum(tot.kcal)),
    h('span', { class: 'kcal-big-goal' }, ` / ${fmtNum(tgt.kcal)} kcal`),
  ]));
  card.appendChild(progressBar(pct));
  card.appendChild(h('div', { class: 'kcal-remaining' + (diff < 0 ? ' kcal-over' : '') },
    diff >= 0 ? `Te quedan ${fmtNum(diff)} kcal` : `Te has pasado ${fmtNum(-diff)} kcal`));
  if (day.items.length && iso < todayISO() && pct < 0.85) {
    card.appendChild(h('div', { class: 'notice-small' }, 'Ese día quedaste muy por debajo del objetivo. Un déficit extra no suma si luego no rindes: ajusta en los próximos días.'));
  }

  card.appendChild(h('div', { class: 'macro-rows' }, [
    macroRow('Proteína', tot.p, tgt.p, 'min'),
    macroRow('Hidratos', tot.c, tgt.c, 'max'),
    macroRow('Grasas', tot.g, tgt.g, 'max'),
  ]));

  card.appendChild(renderFoodChips(iso));
  card.appendChild(renderFoodForm(iso, day));
  card.appendChild(renderFoodEntries(iso, day));
  return card;
}

function renderFoodChips(iso) {
  const wrap = h('div', { class: 'chips-block' });
  const quick = h('div', { class: 'chips' }, [h('span', { class: 'chips-label' }, 'Rápido:')]);
  [100, 250, 500].forEach(k => quick.appendChild(h('button', {
    class: 'chip',
    onclick: () => { addFoodItem(iso, { name: 'Ingesta rápida', momento: defaultMealSlot(), t: nowHHMM(), kcal: k }); render(); },
  }, `+${k} kcal`)));
  wrap.appendChild(quick);

  const rec = recentFoods(8);
  if (rec.length) {
    const r = h('div', { class: 'chips' }, [h('span', { class: 'chips-label' }, 'Recientes:')]);
    rec.forEach(i => {
      r.appendChild(h('button', {
        class: 'chip',
        title: 'Añadir de nuevo',
        onclick: () => {
          const copy = { name: i.name, momento: defaultMealSlot(), t: nowHHMM(), kcal: i.kcal };
          ['p', 'c', 'g'].forEach(k => { if (i[k] !== undefined) copy[k] = i[k]; });
          addFoodItem(iso, copy);
          render();
        },
      }, `${i.name} · ${fmtNum(i.kcal)}`));
    });
    wrap.appendChild(r);
  }
  return wrap;
}

function renderFoodForm(iso, day) {
  const editing = state.foodEditId ? day.items.find(i => i.id === state.foodEditId) : null;
  if (state.foodEditId && !editing) state.foodEditId = null;
  const d = editing || {};

  const wrap = h('div', { class: 'food-form' });
  wrap.appendChild(h('div', { class: 'food-form-title' }, editing ? 'Editar ingesta' : 'Añadir comida'));

  const mk = (ph, val, step) => h('input', {
    class: 'food-input', type: 'number', step: step || 'any', inputmode: 'decimal',
    placeholder: ph, value: val ?? '', 'aria-label': ph,
    onkeydown: (e) => { if (e.key === 'Enter') submit(); },
  });
  const nameIn = h('input', {
    class: 'food-input food-input-name', type: 'text', placeholder: 'Qué has comido (opcional)',
    value: d.name && d.name !== 'Ingesta rápida' ? d.name : '', 'aria-label': 'Nombre de la comida',
    onkeydown: (e) => { if (e.key === 'Enter') submit(); },
  });
  const kcalIn = mk('kcal', d.kcal, 1);
  const pIn = mk('Prot g', d.p);
  const cIn = mk('Hidr g', d.c);
  const gIn = mk('Grasa g', d.g);
  const slotSel = h('select', { class: 'match-select food-slot', 'aria-label': 'Momento del día' },
    MEAL_SLOTS.map(s => h('option', { value: s, selected: (d.momento || defaultMealSlot()) === s ? 'selected' : undefined }, s)));
  const err = h('div', { class: 'form-error', style: 'display:none' });

  function submit() {
    const res = normalizeFoodInput({
      name: nameIn.value, kcal: kcalIn.value, p: pIn.value, c: cIn.value, g: gIn.value,
      momento: slotSel.value, t: editing ? editing.t : nowHHMM(),
    });
    if (!res.ok) { err.textContent = res.error; err.style.display = 'block'; return; }
    if (editing) { updateFoodItem(iso, editing.id, res.item); state.foodEditId = null; }
    else addFoodItem(iso, res.item);
    render();
  }

  wrap.appendChild(nameIn);
  wrap.appendChild(h('div', { class: 'food-grid' }, [kcalIn, pIn, cIn, gIn]));
  wrap.appendChild(h('div', { class: 'food-grid food-grid-2' }, [
    slotSel,
    h('button', { class: 'btn btn-accent', onclick: submit }, editing ? 'Guardar cambios' : 'Añadir'),
  ]));
  if (editing) {
    wrap.appendChild(h('button', { class: 'btn', style: 'margin-top:6px', onclick: () => { state.foodEditId = null; render(); } }, 'Cancelar edición'));
  }
  wrap.appendChild(h('div', { class: 'notice-small' }, 'Si solo pones los macros, las kcal se calculan solas (4/4/9).'));
  wrap.appendChild(err);
  return wrap;
}

function renderFoodEntries(iso, day) {
  const wrap = h('div', { class: 'food-list' });
  if (day.items.length === 0) {
    wrap.appendChild(h('div', { class: 'notice-small' }, 'Aún no has registrado nada este día.'));
    return wrap;
  }
  const items = day.items.slice().sort((a, b) => String(a.t || '').localeCompare(String(b.t || '')));
  items.forEach(i => {
    const macros = [
      i.p !== undefined ? `P ${fmtNum(i.p, 1)}` : null,
      i.c !== undefined ? `H ${fmtNum(i.c, 1)}` : null,
      i.g !== undefined ? `G ${fmtNum(i.g, 1)}` : null,
    ].filter(Boolean).join(' · ');
    wrap.appendChild(h('div', { class: 'food-item' + (state.foodEditId === i.id ? ' food-item-editing' : '') }, [
      h('div', { class: 'food-item-main' }, [
        h('div', { class: 'food-item-name' }, i.name || 'Ingesta rápida'),
        h('div', { class: 'food-item-sub' }, `${i.momento || ''}${i.t ? ' · ' + i.t : ''}${macros ? ' · ' + macros : ''}`),
      ]),
      h('div', { class: 'food-item-kcal' }, `${fmtNum(i.kcal)}`),
      h('button', { class: 'icon-btn', 'aria-label': 'Editar', onclick: () => { state.foodEditId = i.id; render(); } }, '✎'),
      h('button', { class: 'icon-btn icon-btn-danger', 'aria-label': 'Borrar', onclick: () => { deleteFoodItem(iso, i.id); if (state.foodEditId === i.id) state.foodEditId = null; render(); } }, '✕'),
    ]));
  });
  return wrap;
}

// ---------- análisis cruzado peso / calorías ----------
function renderAnalysisCard() {
  const a = progressAnalysis();
  const border = a.verdict === 'ok' ? 'var(--pack)' : a.verdict === 'datos' ? 'var(--line)' : 'var(--danger)';
  const card = h('div', { class: 'card', style: `border-color:${border}` });
  card.appendChild(titleWithHelp('Balance: comida vs. peso', 'peso', 'Cómo leerlo'));
  card.appendChild(h('div', { class: 'notice' }, a.message));
  if (a.loggedDays > 0 || a.lossPerWeek !== null) {
    card.appendChild(h('div', { class: 'kv' }, [h('span', {}, 'Kcal media (7 días registrados)'), h('span', {}, a.avgKcal !== null ? `${fmtNum(a.avgKcal)} kcal` : '—')]));
    card.appendChild(h('div', { class: 'kv' }, [h('span', {}, 'Días con registro (últimos 7)'), h('span', {}, `${a.loggedDays} / 7`)]));
    card.appendChild(h('div', { class: 'kv' }, [h('span', {}, 'Pérdida esperada por tu déficit'), h('span', {}, a.expectedPerWeek !== null ? `${fmtNum(Math.max(0, a.expectedPerWeek), 1)} kg/sem` : '—')]));
    card.appendChild(h('div', { class: 'kv' }, [h('span', {}, 'Pérdida real (tendencia 14 días)'), h('span', {}, a.lossPerWeek !== null ? `${fmtNum(a.lossPerWeek, 1)} kg/sem` : '—')]));
  }
  return card;
}

// ---------- peso diario ----------
function renderWeightCard(iso) {
  const entries = weightEntriesSorted();
  const latest = entries[entries.length - 1] || null;
  const ma = movingAverage(entries, 7);
  const slope = slopePerWeek(entries, 14);

  const card = h('div', { class: 'card' });
  card.appendChild(titleWithHelp('Peso corporal', 'peso', 'Cómo pesarte'));

  const existing = entries.find(e => e.date === iso);
  const kgIn = h('input', {
    class: 'food-input', type: 'number', step: '0.1', inputmode: 'decimal',
    placeholder: latest ? fmtNum(latest.kg, 1) : 'kg', value: existing ? existing.kg : '', 'aria-label': 'Peso en kg',
    onkeydown: (e) => { if (e.key === 'Enter') save(); },
  });
  const err = h('div', { class: 'form-error', style: 'display:none' });
  function save() {
    const kg = numOrNull(kgIn.value);
    if (kg === null || kg < 30 || kg > 300) { err.textContent = 'Pon un peso válido entre 30 y 300 kg.'; err.style.display = 'block'; return; }
    const prev = entries.filter(e => e.date !== iso && e.date < iso).pop() || latest;
    if (prev && Math.abs(kg - prev.kg) > 4 && !confirm(`Es una diferencia de ${fmtNum(Math.abs(kg - prev.kg), 1)} kg con tu registro anterior (${fmtNum(prev.kg, 1)} kg). ¿Guardar igualmente?`)) return;
    saveWeight(iso, kg);
    render();
    toast('Peso guardado');
  }
  card.appendChild(h('div', { class: 'food-grid food-grid-2' }, [
    kgIn,
    h('button', { class: 'btn btn-accent', onclick: save }, `Guardar peso · ${fmtDateTiny(iso)}`),
  ]));
  card.appendChild(err);
  card.appendChild(h('div', { class: 'notice-small' }, 'Mejor en ayunas y a la misma hora. Se actualiza solo tu peso de Nutrición (BMR/TDEE) y el de Progreso.'));

  if (latest) {
    const lastMA = ma[ma.length - 1];
    card.appendChild(h('div', { class: 'kv' }, [h('span', {}, 'Último registro'), h('span', {}, `${fmtNum(latest.kg, 1)} kg · ${fmtDateTiny(latest.date)}`)]));
    card.appendChild(h('div', { class: 'kv' }, [h('span', {}, 'Media de 7 días'), h('span', {}, `${fmtNum(lastMA.avg, 1)} kg`)]));
    card.appendChild(h('div', { class: 'kv' }, [h('span', {}, 'Tendencia (14 días)'), h('span', {}, slope !== null ? `${slope > 0 ? '+' : ''}${fmtNum(slope, 1)} kg/sem` : '—')]));
    const last30 = entries.slice(-30);
    const ma30 = movingAverage(entries, 7).slice(-30).map(x => x.avg);
    card.appendChild(h('div', { class: 'log-chart-label' }, 'Peso diario (línea) y media de 7 días (discontinua)'));
    card.appendChild(renderLineChart(last30.map(e => e.kg), { secondary: ma30 }));

    const list = h('div', { class: 'food-list' });
    entries.slice(-5).reverse().forEach(e => {
      list.appendChild(h('div', { class: 'food-item' }, [
        h('div', { class: 'food-item-main' }, h('div', { class: 'food-item-name' }, fmtDateTiny(e.date))),
        h('div', { class: 'food-item-kcal' }, `${fmtNum(e.kg, 1)} kg`),
        h('button', { class: 'icon-btn icon-btn-danger', 'aria-label': 'Borrar peso', onclick: () => { deleteWeight(e.date); render(); } }, '✕'),
      ]));
    });
    card.appendChild(list);
  }
  return card;
}

// ---------- historial de cumplimiento ----------
const STATUS_META = {
  none: { icon: '·', label: 'Sin registro', cls: 'st-none' },
  bajo: { icon: '↓', label: 'Por debajo', cls: 'st-bajo' },
  ok:   { icon: '✓', label: 'Cumplido',   cls: 'st-ok' },
  alto: { icon: '↑', label: 'Pasado',     cls: 'st-alto' },
};
function renderFoodHistory() {
  const today = todayISO();
  const rows = [];
  for (let i = 0; i < 14; i++) {
    const iso = addDays(today, -i);
    rows.push({ iso, st: foodDayStatus(iso) });
  }
  const registered = rows.filter(r => r.st.key !== 'none');
  const okCount = rows.filter(r => r.st.key === 'ok').length;

  let streak = 0;
  for (let i = rows[0].st.key === 'none' ? 1 : 0; i < rows.length; i++) {
    if (rows[i].st.key === 'ok') streak++; else break;
  }
  const last7 = rows.slice(0, 7).filter(r => r.st.key !== 'none');
  const avg7 = last7.length ? last7.reduce((a, r) => a + r.st.kcal, 0) / last7.length : null;
  const deficit7 = last7.reduce((a, r) => a + ((numOrNull(r.st.target.tdee) || 0) - r.st.kcal), 0);

  const card = h('div', { class: 'card' });
  card.appendChild(titleWithHelp('Historial (14 días)', 'nutricion-uso', 'Qué significa'));
  card.appendChild(h('div', { class: 'stat-grid' }, [
    h('div', { class: 'stat' }, [h('div', { class: 'stat-num' }, `${okCount}/14`), h('div', { class: 'stat-lbl' }, 'Días cumplidos')]),
    h('div', { class: 'stat' }, [h('div', { class: 'stat-num' }, String(streak)), h('div', { class: 'stat-lbl' }, 'Racha actual')]),
    h('div', { class: 'stat' }, [h('div', { class: 'stat-num' }, avg7 !== null ? fmtNum(avg7) : '—'), h('div', { class: 'stat-lbl' }, 'Kcal media 7d')]),
    h('div', { class: 'stat' }, [h('div', { class: 'stat-num' }, last7.length ? `${fmtNum(deficit7 / 7700, 1)} kg` : '—'), h('div', { class: 'stat-lbl' }, 'Grasa teórica 7d')]),
  ]));
  if (registered.length === 0) {
    card.appendChild(h('div', { class: 'notice-small' }, 'Cuando registres comidas verás aquí el cumplimiento de cada día. Cumplido = entre el 85% y el 103% del objetivo.'));
    return card;
  }
  rows.forEach(({ iso, st }) => {
    const meta = STATUS_META[st.key];
    card.appendChild(h('button', {
      class: 'hist-food-row',
      onclick: () => { state.selectedDate = iso; render(); window.scrollTo(0, 0); },
    }, [
      h('span', { class: 'hist-food-date' }, fmtDateTiny(iso)),
      h('span', { class: 'hist-food-bar' }, st.key === 'none' ? null : h('span', { class: 'hist-food-fill ' + meta.cls, style: `width:${Math.min(st.pct, 1.3) / 1.3 * 100}%` })),
      h('span', { class: 'hist-food-num' }, st.key === 'none' ? '—' : `${fmtNum(st.kcal)} / ${fmtNum(st.target.kcal)}`),
      h('span', { class: 'hist-food-ico ' + meta.cls, title: meta.label }, meta.icon),
    ]));
  });
  card.appendChild(h('div', { class: 'notice-small' }, '↓ por debajo del 85% · ✓ cumplido (85-103%) · ↑ pasado. Toca un día para abrirlo.'));
  return card;
}

function renderProtocolCard() {
  const det = h('details', { class: 'card protocol' });
  det.appendChild(h('summary', { class: 'card-title protocol-sum' }, 'Protocolo de definición para el rendimiento'));
  det.appendChild(h('div', { class: 'help-row' }, helpBtn('comer', 'Guía práctica de comidas')));
  NUTRITION_PROTOCOL.forEach(p => {
    det.appendChild(h('div', { class: 'protocol-item' }, [
      h('div', { class: 'protocol-t' }, p.t),
      h('div', { class: 'protocol-d' }, p.d),
    ]));
  });
  return det;
}

function renderNutritionParams(res) {
  const params = getNutritionParams();
  const wrap = h('div', { class: 'stack' });
  wrap.appendChild(h('div', { class: 'card' }, [
    titleWithHelp('Progreso hacia el objetivo', 'nutricion-calculo', 'Cómo se calcula'),
    h('div', { class: 'kv' }, [h('span', {}, 'BMR'), h('span', {}, `${fmtNum(res.bmr)} kcal`)]),
    h('div', { class: 'kv' }, [h('span', {}, 'TDEE'), h('span', {}, `${fmtNum(res.tdee)} kcal`)]),
    h('div', { class: 'kv' }, [h('span', {}, 'Kcal base (semana de déficit)'), h('span', {}, `${fmtNum(res.kcalBase)} kcal`)]),
    h('div', { class: 'kv' }, [h('span', {}, 'Kg por perder'), h('span', {}, `${fmtNum(Math.max(0, res.kgAPerder), 1)} kg`)]),
    h('div', { class: 'kv' }, [h('span', {}, 'Semanas estimadas'), h('span', {}, res.semanasEstimadas !== null ? `${fmtNum(res.semanasEstimadas)} sem (a ${fmtNum(res.perdidaSemanalKg, 1)} kg/sem)` : '—')]),
  ]));

  const form = h('div', { class: 'card' }, [titleWithHelp('Datos (editables)', 'nutricion-calculo', 'Qué es cada dato')]);
  const fields = [
    ['peso', 'Peso actual (kg) · sigue a tu último peso registrado', 0.1],
    ['altura', 'Altura (cm)', 1],
    ['edad', 'Edad (años) · revisa que sea la tuya', 1],
    ['mlg', 'Masa libre de grasa (kg)', 0.1],
    ['pesoObjetivo', 'Peso objetivo (kg)', 0.1],
    ['factorActividad', 'Factor de actividad', 0.01],
    ['porcentajeDeficit', '% Déficit (semanas de déficit)', 1],
    ['kcalMax', 'Tope máximo de kcal/día (0 = sin tope)', 10],
  ];
  fields.forEach(([key, label, step]) => {
    const displayVal = key === 'porcentajeDeficit' ? Math.round(params[key] * 100) : params[key];
    form.appendChild(formField(label, h('input', {
      type: 'number', step, inputmode: 'decimal', value: displayVal,
      onchange: (e) => {
        const raw = parseFloat(e.target.value);
        if (isNaN(raw) || raw < 0) return;
        const stored = loadJSON(LS_KEYS.nutrition, {});
        stored[key] = key === 'porcentajeDeficit' ? raw / 100 : raw;
        saveNutritionParams(stored);
        softRender();
      },
    })));
  });
  const t3 = h('input', {
    type: 'checkbox',
    onchange: (e) => {
      const stored = loadJSON(LS_KEYS.nutrition, {});
      stored.deficitEnT3 = e.target.checked;
      saveNutritionParams(stored);
      softRender();
    },
  });
  t3.checked = params.deficitEnT3 !== false;
  form.appendChild(formField('Mantener el déficit en semana post-partido (T3)', t3));
  wrap.appendChild(form);
  return wrap;
}

// ======================================================================
// TAB: CONDICIÓN (progresión de acondicionamiento + marcas)
// ======================================================================
function tabCondicion() {
  const wrap = h('div', { class: 'screen' });
  const cur = currentCondWeek();
  const last = CONDITIONING_PROGRESSION.length;

  wrap.appendChild(h('div', { class: 'card highlight-card' }, [
    titleWithHelp(`Semana de progresión ${cur.semana} / ${last}`, 'condicion', 'Cómo funciona'),
    h('div', { class: 'kv' }, [h('span', {}, 'RSA (miércoles)'), h('span', {}, cur.rsa)]),
    h('div', { class: 'kv' }, [h('span', {}, 'Circuito (sábado)'), h('span', {}, cur.metcon)]),
    h('div', { class: 'kv' }, [h('span', {}, 'Saltos y contactos'), h('span', {}, cur.contactos)]),
    h('div', { class: 'notice-small' }, 'Avanza solo en semanas T1. Si notas dolor articular (rodilla, tobillo, espinilla) o los tiempos de sprint empeoran, repite la semana en vez de avanzar. Con tu peso, los contactos se suben despacio.'),
    h('div', { class: 'btn-row' }, [
      h('button', { class: 'btn', onclick: () => {
        const v = getCondProgress();
        if (v.semana > 1) { setCondProgress({ semana: v.semana - 1 }); render(); }
      }}, '← Repetir semana anterior'),
      h('button', { class: 'btn btn-accent', onclick: () => {
        const v = getCondProgress();
        if (v.semana < last) { setCondProgress({ semana: v.semana + 1 }); render(); }
      }}, 'Avanzar semana →'),
    ]),
  ]));

  // marcas personales (de los registros)
  const marks = [
    { label: 'Salida 10 m · mejor tiempo', mov: 'salidas-en-corto-10-m', field: 'tiempo', better: 'min', agg: 'min', unit: 's', dec: 2 },
    { label: 'RSA · mejor sprint', mov: 'rsa-sprints-repetidos', field: 'tiempo', better: 'min', agg: 'min', unit: 's', dec: 2 },
    { label: 'CMJ · mejor altura', mov: 'salto-con-contramovimiento', field: 'altura', better: 'max', agg: 'max', unit: 'cm', dec: 0 },
  ];
  const mcard = h('div', { class: 'card' }, [h('div', { class: 'card-title' }, 'Tus marcas')]);
  marks.forEach(mk => {
    const best = bestEver(mk.mov, mk.field, mk.better);
    const series = exerciseHistorySeries(mk.mov, mk.field, mk.agg).map(p => p.value);
    mcard.appendChild(h('div', { class: 'kv' }, [h('span', {}, mk.label), h('span', {}, best !== null ? `${fmtNum(best, mk.dec)} ${mk.unit}` : '—')]));
    if (series.length >= 2) mcard.appendChild(renderLineChart(series, { width: 300, height: 70, decimals: mk.dec }));
  });
  mcard.appendChild(h('div', { class: 'notice-small' }, 'Salen de lo que registras en las sesiones. Mide los sprints con cronómetro manual o fotocélulas, siempre igual.'));
  wrap.appendChild(mcard);

  const table = h('div', { class: 'table' });
  CONDITIONING_PROGRESSION.forEach(r => {
    table.appendChild(h('div', { class: 'table-row' + (r.semana === cur.semana ? ' table-row-current' : '') }, [
      h('div', { class: 'table-cell cell-week' }, `S${r.semana}`),
      h('div', { class: 'table-cell' }, [
        h('div', { class: 'cell-label' }, 'RSA'), h('div', {}, r.rsa),
        h('div', { class: 'cell-label' }, 'Circuito'), h('div', {}, r.metcon),
        h('div', { class: 'cell-label' }, 'Contactos'), h('div', {}, r.contactos),
      ]),
    ]));
  });
  wrap.appendChild(table);
  return wrap;
}

// ======================================================================
// TAB: PROGRESO (seguimiento semanal)
// ======================================================================
function tabProgreso() {
  const wrap = h('div', { class: 'screen' });
  const tracking = getTracking();
  const thisMonday = getEffectiveWeek(state.selectedDate).monday;
  const entry = tracking[thisMonday] || {};

  const form = h('div', { class: 'card' }, [
    titleWithHelp(`Registro semana del ${fmtDateShort(thisMonday)}`, 'progreso', 'Qué rellenar'),
  ]);

  const avgs = weekAverages(thisMonday);
  const parts = [];
  if (avgs.peso !== null) parts.push(`peso ${fmtNum(avgs.peso, 1)} kg`);
  if (avgs.kcal !== null) parts.push(`${fmtNum(avgs.kcal)} kcal/día (${avgs.kcalDays} d)`);
  if (avgs.pasos !== null) parts.push(`${fmtNum(avgs.pasos)} pasos/día (${avgs.pasosDays} d)`);
  if (parts.length) {
    form.appendChild(h('div', { class: 'notice-small' }, `Tus registros de esta semana: ${parts.join(' · ')}.`));
    form.appendChild(h('button', {
      class: 'btn',
      style: 'margin:8px 0 4px',
      onclick: () => {
        const patch = {};
        if (avgs.peso !== null) patch.peso = String(avgs.peso);
        if (avgs.kcal !== null) patch.kcalMedias = String(Math.round(avgs.kcal));
        if (avgs.pasos !== null) patch.pasosMedios = String(Math.round(avgs.pasos));
        saveTrackingEntry(thisMonday, patch);
        render();
        toast('Rellenado con tus registros');
      },
    }, 'Rellenar con mis registros de la semana'));
  }

  const fields = [
    ['peso', 'Peso (kg)'],
    ['grasaCorporal', 'Grasa corporal (%)'],
    ['masaMuscular', 'Masa muscular (kg)'],
    ['imc', 'Índice de Masa Corporal'],
    ['grasaVisceral', 'Grasa visceral (kg)'],
    ['tdee', 'TDEE (kcal/día)'],
    ['bmr', 'BMR (kcal/día)'],
    ['kcalMedias', 'Kcal medias/día'],
    ['pasosMedios', 'Pasos medios/día'],
    ['sprint10m', 'Mejor 10 m (seg)'],
    ['rsaMedia', 'RSA: media 6x20 m (seg)'],
    ['cmj', 'CMJ (cm)'],
  ];
  fields.forEach(([key, label]) => {
    form.appendChild(formField(label, h('input', {
      type: 'number', step: 'any', inputmode: 'decimal', value: entry[key] ?? '',
      onchange: (e) => saveTrackingEntry(thisMonday, { [key]: e.target.value }),
    })));
  });
  form.appendChild(formField('Comentarios', h('textarea', {
    rows: 3, oninput: (e) => saveTrackingEntry(thisMonday, { comentarios: e.target.value }),
  }, entry.comentarios || ''), true));
  wrap.appendChild(form);

  // gráfica de peso: diario con media 7d si hay datos, si no semanal
  const wEntries = weightEntriesSorted();
  if (wEntries.length >= 2) {
    const last60 = wEntries.slice(-60);
    const ma = movingAverage(wEntries, 7).slice(-60).map(x => x.avg);
    wrap.appendChild(h('div', { class: 'card' }, [
      h('div', { class: 'card-title' }, 'Evolución del peso'),
      renderLineChart(last60.map(e => e.kg), { secondary: ma }),
    ]));
  } else {
    const weightSeries = Object.keys(tracking).sort()
      .filter(w => numOrNull(tracking[w].peso) !== null)
      .map(w => numOrNull(tracking[w].peso));
    wrap.appendChild(h('div', { class: 'card' }, [
      h('div', { class: 'card-title' }, 'Evolución del peso'),
      renderLineChart(weightSeries),
    ]));
  }

  const fatSeries = Object.keys(tracking).sort()
    .filter(w => numOrNull(tracking[w].grasaCorporal) !== null)
    .map(w => numOrNull(tracking[w].grasaCorporal));
  wrap.appendChild(h('div', { class: 'card' }, [
    h('div', { class: 'card-title' }, 'Evolución de la grasa corporal (%)'),
    renderLineChart(fatSeries),
  ]));

  wrap.appendChild(renderMuscleSection(tracking, thisMonday));

  // historial
  const hist = h('div', { class: 'card' }, [h('div', { class: 'card-title' }, 'Historial')]);
  const weeks = Object.keys(tracking).sort();
  if (weeks.length === 0) {
    hist.appendChild(h('div', { class: 'notice-small' }, 'Aún no hay registros.'));
  } else {
    const labels = [
      ['peso', 'kg', ' kg'], ['grasaCorporal', 'grasa', '%'], ['masaMuscular', 'músculo', ' kg'],
      ['grasaVisceral', 'visceral', ' kg'], ['kcalMedias', '', ' kcal/día'], ['pasosMedios', '', ' pasos'],
      ['sprint10m', '10 m', ' s'], ['rsaMedia', 'RSA', ' s'], ['cmj', 'CMJ', ' cm'], ['tiempo10k', '10K', ''],
    ];
    weeks.slice().reverse().forEach(wk => {
      const e = tracking[wk];
      const bits = labels
        .filter(([k]) => e[k] !== undefined && e[k] !== '')
        .map(([k, lbl, suf]) => `${lbl && lbl !== 'kg' ? lbl + ' ' : ''}${e[k]}${suf}`);
      if (e.comentarios) bits.push(e.comentarios);
      hist.appendChild(h('div', { class: 'hist-row' }, [
        h('div', { class: 'hist-date' }, fmtDateShort(wk)),
        h('div', { class: 'hist-data' }, bits.length ? bits.join(' · ') : '—'),
      ]));
    });
  }
  wrap.appendChild(hist);

  wrap.appendChild(renderBackupCard());
  return wrap;
}

function renderBackupCard() {
  const card = h('div', { class: 'card' }, [
    h('div', { class: 'card-title' }, 'Copia de seguridad'),
    h('div', { class: 'notice-small' }, 'Tus datos solo están en este dispositivo. Copia la copia de seguridad y guárdala (nota, mail, chat contigo mismo) antes de reinstalar o cambiar de móvil. Para restaurar: pega el texto aquí y pulsa Restaurar.'),
  ]);
  const area = h('textarea', { rows: 4, class: 'backup-area', placeholder: 'Aquí aparece la copia, o pega aquí la que quieras restaurar' });
  const status = h('div', { class: 'notice-small backup-status' }, '');
  const say = (msg) => { status.textContent = msg; };

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

// ---------- puntuación muscular ----------
function scoreColor(v) {
  if (v === null || v === undefined || v === '') return '#3a3d42';
  const n = parseFloat(v);
  if (isNaN(n)) return '#3a3d42';
  if (n < 4) return '#b4432e';
  if (n < 7) return '#d9a441';
  return '#4c7a62';
}

// Silueta frontal simplificada hecha con formas propias (la app es 100% offline)
function buildBodySVG(scores) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 220 380');
  svg.setAttribute('class', 'body-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Silueta con la puntuación de cada grupo muscular');

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
  const current = getMuscleScores(getTracking(), mondayIso);
  saveTrackingEntry(mondayIso, { musculo: { ...current, [key]: value } });
}
function muscleHistorySeries(tracking, key) {
  return Object.keys(tracking).sort()
    .map(wk => parseFloat(getMuscleScores(tracking, wk)[key]))
    .filter(v => !isNaN(v));
}

function renderMuscleSection(tracking, thisMonday) {
  const scores = getMuscleScores(tracking, thisMonday);
  const wrap = h('div', { class: 'card' }, [h('div', { class: 'card-title' }, 'Puntuación muscular (0-10)')]);

  const layout = h('div', { class: 'muscle-layout' });
  layout.appendChild(buildBodySVG(scores));

  const list = h('div', { class: 'muscle-list' });
  MUSCLE_GROUPS.forEach(mg => {
    const details = h('details', { class: 'muscle-row-details' });
    if (state.openMuscles.has(mg.key)) details.setAttribute('open', 'open');
    // se recuerda qué grupos están abiertos (antes se cerraban al guardar la nota)
    details.addEventListener('toggle', () => {
      if (details.open) state.openMuscles.add(mg.key); else state.openMuscles.delete(mg.key);
    });
    details.appendChild(h('summary', {}, [
      h('span', { class: 'muscle-dot', style: `background:${scoreColor(scores[mg.key])}` }),
      h('span', { class: 'muscle-label' }, mg.label),
      h('span', { class: 'muscle-current-score' }, scores[mg.key] !== undefined && scores[mg.key] !== '' ? `${scores[mg.key]}/10` : '—'),
    ]));

    const body = h('div', { class: 'muscle-row-body' });
    const fw = h('div', { class: 'log-field' });
    fw.appendChild(h('label', {}, 'Puntuación esta semana (0-10)'));
    fw.appendChild(h('input', {
      type: 'number', min: 0, max: 10, step: 1, inputmode: 'numeric', value: scores[mg.key] ?? '',
      onchange: (e) => {
        const v = Math.min(10, Math.max(0, parseFloat(e.target.value)));
        saveMuscleScore(thisMonday, mg.key, isNaN(v) ? '' : String(v));
        softRender();
      },
    }));
    body.appendChild(fw);
    body.appendChild(h('div', { class: 'log-chart-label' }, 'Tendencia'));
    body.appendChild(renderLineChart(muscleHistorySeries(tracking, mg.key), { width: 260, height: 70 }));
    details.appendChild(body);
    list.appendChild(details);
  });
  layout.appendChild(list);
  wrap.appendChild(layout);

  const vals = Object.values(scores).map(v => parseFloat(v)).filter(v => !isNaN(v));
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  wrap.appendChild(h('div', { class: 'kv' }, [
    h('span', {}, 'Puntuación general esta semana'),
    h('span', {}, avg !== null ? fmtNum(avg, 1) + ' / 10' : '— (rellena los grupos)'),
  ]));

  const weeklyAverages = Object.keys(tracking).sort().map(wk => {
    const v = Object.values(getMuscleScores(tracking, wk)).map(x => parseFloat(x)).filter(x => !isNaN(x));
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  }).filter(v => v !== null);
  wrap.appendChild(h('div', { class: 'log-chart-label' }, 'Evolución de la puntuación general'));
  wrap.appendChild(renderLineChart(weeklyAverages));
  return wrap;
}

// ======================================================================
// CRONÓMETRO · Tabata / EMOM / AMRAP / intervalos / descansos
// El tiempo se calcula siempre contra el reloj (Date.now), no contando ticks:
// si el móvil estrangula los timers con la pantalla apagada, no se desfasa.
// ======================================================================
const TM = {
  cfg: null, phases: [], total: 0, status: 'idle', // idle | running | paused | done
  t0: 0, pausedAt: 0, interval: null, lastIdx: -1, lastSecKey: '', rounds: 0,
  open: false, wake: null, audio: null, ui: {},
};

function tmFmt(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function tmPhases(cfg) {
  const ph = [];
  const prep = cfg.mode === 'rest' ? 0 : (cfg.prep === undefined ? 10 : cfg.prep);
  if (prep > 0) ph.push({ type: 'prep', dur: prep, label: 'PREPÁRATE' });
  if (cfg.mode === 'intervals') {
    for (let r = 1; r <= cfg.rounds; r++) {
      ph.push({ type: 'work', dur: cfg.work, label: 'TRABAJO', round: r, rounds: cfg.rounds });
      if (r < cfg.rounds && cfg.rest > 0) ph.push({ type: 'rest', dur: cfg.rest, label: 'DESCANSO', round: r, rounds: cfg.rounds });
    }
  } else if (cfg.mode === 'emom') {
    for (let mi = 1; mi <= cfg.minutes; mi++) {
      ph.push({ type: 'work', dur: cfg.every || 60, label: `MINUTO ${mi}/${cfg.minutes}`, round: mi, rounds: cfg.minutes });
    }
  } else if (cfg.mode === 'amrap') {
    ph.push({ type: 'work', dur: cfg.minutes * 60, label: 'AMRAP', amrap: true });
  } else if (cfg.mode === 'rest') {
    ph.push({ type: 'rest', dur: cfg.seconds, label: 'DESCANSO' });
  }
  return ph;
}

function tmElapsed() {
  const now = TM.status === 'paused' ? TM.pausedAt : Date.now();
  return (now - TM.t0) / 1000;
}
function tmLocate(elapsed) {
  let acc = 0;
  for (let i = 0; i < TM.phases.length; i++) {
    const dur = TM.phases[i].dur;
    if (elapsed < acc + dur) return { idx: i, left: acc + dur - elapsed, into: elapsed - acc, start: acc };
    acc += dur;
  }
  return null;
}
function tmPhaseStart(idx) {
  let acc = 0;
  for (let i = 0; i < idx; i++) acc += TM.phases[i].dur;
  return acc;
}

// ---- sonido, vibración y pantalla encendida ----
function tmEnsureAudio() {
  try {
    if (!TM.audio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) TM.audio = new AC();
    }
    if (TM.audio && TM.audio.state === 'suspended') TM.audio.resume();
  } catch (e) { /* sin audio: el cronómetro sigue funcionando */ }
}
function tmTone(freq, ms, delayMs, vol) {
  if (!TM.audio) return;
  try {
    const t = TM.audio.currentTime + (delayMs || 0) / 1000;
    const o = TM.audio.createOscillator();
    const g = TM.audio.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + ms / 1000);
    o.connect(g); g.connect(TM.audio.destination);
    o.start(t); o.stop(t + ms / 1000 + 0.02);
  } catch (e) { /* ignorar */ }
}
function tmCue(kind) {
  const mute = getSettings().timerMute;
  if (!mute) {
    if (kind === 'go') { tmTone(988, 420, 0, 0.35); }
    else if (kind === 'rest') { tmTone(523, 300, 0, 0.3); }
    else if (kind === 'prep') { tmTone(440, 120, 0, 0.2); }
    else if (kind === 'tick') { tmTone(740, 90, 0, 0.25); }
    else if (kind === 'end') { tmTone(880, 200, 0, 0.35); tmTone(880, 200, 280, 0.35); tmTone(1175, 500, 560, 0.4); }
  }
  try {
    if (navigator.vibrate) {
      navigator.vibrate(kind === 'go' ? 250 : kind === 'rest' ? [120, 60, 120] : kind === 'end' ? [300, 100, 300, 100, 500] : kind === 'tick' ? 40 : 30);
    }
  } catch (e) { /* ignorar */ }
}
async function tmAcquireWake() {
  try {
    if ('wakeLock' in navigator && !TM.wake) {
      TM.wake = await navigator.wakeLock.request('screen');
      TM.wake.addEventListener('release', () => { TM.wake = null; });
    }
  } catch (e) { /* no soportado o denegado */ }
}
function tmReleaseWake() {
  try { if (TM.wake) TM.wake.release(); } catch (e) { /* ignorar */ }
  TM.wake = null;
}

// ---- control ----
function tmTick() {
  if (TM.status !== 'running') return;
  const el = tmElapsed();
  const loc = tmLocate(el);
  if (!loc) { tmFinish(); return; }
  const ph = TM.phases[loc.idx];
  if (loc.idx !== TM.lastIdx) {
    TM.lastIdx = loc.idx;
    TM.lastSecKey = '';
    tmCue(ph.type === 'work' ? 'go' : ph.type === 'rest' ? 'rest' : 'prep');
  }
  const secLeft = Math.ceil(loc.left);
  const key = `${loc.idx}-${secLeft}`;
  if (secLeft <= 3 && key !== TM.lastSecKey) {
    TM.lastSecKey = key;
    // en el AMRAP (una fase larga) solo suenan los últimos 3 s; evita pitar al arrancar fases de 3 s o menos
    if (loc.into > 0.4) tmCue('tick');
  }
  tmSyncUI(loc);
}
function tmFinish() {
  clearInterval(TM.interval);
  TM.interval = null;
  TM.status = 'done';
  tmCue('end');
  tmReleaseWake();
  tmSyncUI(null);
}
function tmStart() {
  const cfg = tmReadForm();
  if (typeof cfg === 'string') { TM.ui.err.textContent = cfg; TM.ui.err.style.display = 'block'; return; }
  TM.ui.err.style.display = 'none';
  TM.cfg = cfg;
  TM.phases = tmPhases(cfg);
  TM.total = TM.phases.reduce((a, p) => a + p.dur, 0);
  TM.rounds = 0;
  TM.status = 'running';
  TM.t0 = Date.now();
  TM.lastIdx = -1;
  TM.lastSecKey = '';
  tmEnsureAudio();
  tmAcquireWake();
  clearInterval(TM.interval);
  TM.interval = setInterval(tmTick, 200);
  tmTick();
}
function tmTogglePause() {
  if (TM.status === 'running') {
    TM.status = 'paused';
    TM.pausedAt = Date.now();
  } else if (TM.status === 'paused') {
    TM.t0 += Date.now() - TM.pausedAt;
    TM.status = 'running';
    tmAcquireWake();
  }
  tmSyncUI();
}
function tmSkip(dir) {
  if (TM.status !== 'running' && TM.status !== 'paused') return;
  const loc = tmLocate(tmElapsed());
  if (!loc) return;
  const target = loc.idx + dir;
  if (target >= TM.phases.length) { tmFinish(); return; }
  const idx = Math.max(0, target);
  const base = TM.status === 'paused' ? TM.pausedAt : Date.now();
  TM.t0 = base - tmPhaseStart(idx) * 1000;
  TM.lastIdx = -1;
  if (TM.status === 'running') tmTick(); else tmSyncUI();
}
function tmReset() {
  clearInterval(TM.interval);
  TM.interval = null;
  TM.status = 'idle';
  TM.rounds = 0;
  tmReleaseWake();
  tmSyncUI();
}

// ---- formulario de configuración ----
function tmNumField(id, label, val, min, max) {
  const input = h('input', {
    type: 'number', inputmode: 'numeric', min, max, value: val,
    class: 'tm-input', id: 'tm-' + id, 'aria-label': label,
    // al tocar un valor, el nombre del preset deja de ser válido
    oninput: () => { TM.ui.pickedLabel = ''; if (TM.ui.picked) TM.ui.picked.textContent = ''; },
  });
  TM.ui[id] = input;
  return h('label', { class: 'tm-field tm-f-' + id }, [h('span', {}, label), input]);
}
function tmModeChanged() {
  const mode = TM.ui.mode.value;
  if (TM.ui.modeHelp) TM.ui.modeHelp.textContent = TIMER_MODE_HELP[mode] || '';
  const show = { work: 'intervals', rest: 'intervals', rounds: 'intervals', minutes: 'emom amrap', every: 'emom', seconds: 'rest' };
  Object.entries(show).forEach(([id, modes]) => {
    const row = TM.ui.setup.querySelector('.tm-f-' + id);
    if (row) row.style.display = modes.split(' ').includes(mode) ? '' : 'none';
  });
}
function tmFillForm(cfg) {
  const u = TM.ui;
  u.mode.value = cfg.mode;
  if (cfg.mode === 'intervals') { u.work.value = cfg.work; u.rest.value = cfg.rest; u.rounds.value = cfg.rounds; }
  if (cfg.mode === 'emom') { u.minutes.value = cfg.minutes; u.every.value = cfg.every || 60; }
  if (cfg.mode === 'amrap') { u.minutes.value = cfg.minutes; }
  if (cfg.mode === 'rest') { u.seconds.value = cfg.seconds; }
  u.picked.textContent = cfg.label ? `Seleccionado: ${cfg.label}` : '';
  u.pickedLabel = cfg.label || '';
  tmModeChanged();
}
function tmReadForm() {
  const u = TM.ui;
  const mode = u.mode.value;
  const n = (el) => parseInt(el.value, 10);
  const inRange = (v, lo, hi) => !isNaN(v) && v >= lo && v <= hi;
  if (mode === 'intervals') {
    const work = n(u.work), rest = n(u.rest), rounds = n(u.rounds);
    if (!inRange(work, 1, 3600)) return 'Trabajo: entre 1 y 3600 segundos.';
    if (!inRange(rest, 0, 3600)) return 'Descanso: entre 0 y 3600 segundos.';
    if (!inRange(rounds, 1, 99)) return 'Rondas: entre 1 y 99.';
    return { mode, work, rest, rounds, label: u.pickedLabel || `${work}/${rest} × ${rounds}` };
  }
  if (mode === 'emom') {
    const minutes = n(u.minutes), every = n(u.every);
    if (!inRange(minutes, 1, 120)) return 'Minutos: entre 1 y 120.';
    if (!inRange(every, 10, 600)) return 'Cada: entre 10 y 600 segundos.';
    return { mode, minutes, every, label: u.pickedLabel || `EMOM ${minutes} min` };
  }
  if (mode === 'amrap') {
    const minutes = n(u.minutes);
    if (!inRange(minutes, 1, 120)) return 'Minutos: entre 1 y 120.';
    return { mode, minutes, label: u.pickedLabel || `AMRAP ${minutes} min` };
  }
  const seconds = n(u.seconds);
  if (!inRange(seconds, 5, 3600)) return 'Descanso: entre 5 y 3600 segundos.';
  return { mode: 'rest', seconds, label: u.pickedLabel || `Descanso ${tmFmt(seconds)}` };
}

function tmBuildOverlay() {
  const u = TM.ui;

  u.mode = h('select', { class: 'match-select tm-mode', 'aria-label': 'Tipo de cronómetro', onchange: () => { u.pickedLabel = ''; u.picked.textContent = ''; tmModeChanged(); } }, [
    h('option', { value: 'intervals' }, 'Intervalos (trabajo / descanso)'),
    h('option', { value: 'emom' }, 'EMOM (cada minuto)'),
    h('option', { value: 'amrap' }, 'AMRAP (tantas rondas como puedas)'),
    h('option', { value: 'rest' }, 'Descanso entre series'),
  ]);
  u.modeHelp = h('div', { class: 'notice-small tm-modehelp' }, '');
  u.picked = h('div', { class: 'notice-small tm-picked' }, '');
  u.pickedLabel = '';
  u.err = h('div', { class: 'form-error', style: 'display:none' });

  const chips = h('div', { class: 'chips tm-chips' }, TIMER_PRESETS.map(p => h('button', {
    class: 'chip',
    onclick: () => tmFillForm(p.cfg),
  }, p.label)));

  u.setup = h('div', { class: 'tm-setup' }, [
    h('div', { class: 'tm-section' }, 'Presets'),
    chips,
    h('div', { class: 'tm-section' }, 'Personalizado'),
    u.mode,
    u.modeHelp,
    h('div', { class: 'tm-fields' }, [
      tmNumField('work', 'Trabajo (seg)', 20, 1, 3600),
      tmNumField('rest', 'Descanso (seg)', 10, 0, 3600),
      tmNumField('rounds', 'Rondas', 8, 1, 99),
      tmNumField('minutes', 'Minutos', 10, 1, 120),
      tmNumField('every', 'Cada (seg)', 60, 10, 600),
      tmNumField('seconds', 'Segundos', 90, 5, 3600),
    ]),
    u.picked,
    u.err,
    h('div', { class: 'help-row' }, helpBtn('cronometro', 'Guía del cronómetro')),
    h('button', { class: 'btn btn-accent tm-start', onclick: tmStart }, '▶ Iniciar'),
  ]);

  // vista en marcha
  u.phase = h('div', { class: 'tm-phase' }, '');
  u.time = h('div', { class: 'tm-time', role: 'timer', 'aria-live': 'off' }, '0:00');
  u.sub = h('div', { class: 'tm-sub' }, '');
  u.barFill = h('div', { class: 'tm-bar-fill' });
  u.roundsNum = h('span', { class: 'tm-rounds-num' }, '0');
  u.amrapBox = h('div', { class: 'tm-amrap' }, [
    h('div', { class: 'tm-rounds' }, ['Rondas: ', u.roundsNum]),
    h('div', { class: 'tm-amrap-btns' }, [
      h('button', { class: 'tm-btn tm-btn-big', onclick: () => { TM.rounds++; tmSyncUI(); tmCue('tick'); } }, '+1 RONDA'),
      h('button', { class: 'tm-btn', 'aria-label': 'Quitar una ronda', onclick: () => { TM.rounds = Math.max(0, TM.rounds - 1); tmSyncUI(); } }, '−1'),
    ]),
  ]);
  u.pauseBtn = h('button', { class: 'tm-btn', onclick: tmTogglePause }, 'Pausa');
  u.doneBtns = h('div', { class: 'tm-controls' }, [
    h('button', { class: 'tm-btn', onclick: () => { tmReset(); } }, 'Nuevo'),
    h('button', { class: 'tm-btn tm-btn-big', onclick: () => { const c = TM.cfg; tmReset(); if (c) { tmFillForm(c); tmStart(); } } }, '↻ Repetir'),
  ]);
  u.controls = h('div', { class: 'tm-controls' }, [
    h('button', { class: 'tm-btn', 'aria-label': 'Fase anterior', onclick: () => tmSkip(-1) }, '⏮'),
    u.pauseBtn,
    h('button', { class: 'tm-btn', 'aria-label': 'Fase siguiente', onclick: () => tmSkip(1) }, '⏭'),
    h('button', { class: 'tm-btn tm-btn-stop', onclick: () => { if (confirm('¿Parar el cronómetro?')) tmReset(); } }, '■ Parar'),
  ]);
  u.run = h('div', { class: 'tm-run' }, [
    u.phase, u.time, u.sub,
    h('div', { class: 'tm-bar' }, u.barFill),
    u.amrapBox, u.controls, u.doneBtns,
  ]);

  u.title = h('div', { class: 'tm-title' }, 'Cronómetro');
  u.muteBtn = h('button', { class: 'tm-icon', 'aria-label': 'Sonido', onclick: () => { saveSettings({ timerMute: !getSettings().timerMute }); tmSyncUI(); } }, '🔔');
  u.overlay = h('div', { id: 'timer-overlay', class: 'tm-overlay', role: 'dialog', 'aria-label': 'Cronómetro' }, [
    h('div', { class: 'tm-head' }, [
      h('button', { class: 'tm-icon', 'aria-label': 'Cerrar (el cronómetro sigue)', onclick: closeTimer }, '✕'),
      u.title,
      u.muteBtn,
    ]),
    u.setup, u.run,
  ]);
  document.body.appendChild(u.overlay);

  u.fab = h('button', { id: 'timer-fab', class: 'tm-fab', 'aria-label': 'Abrir cronómetro', onclick: () => openTimer() }, '⏱');
  document.body.appendChild(u.fab);

  tmFillForm(TIMER_PRESETS[0].cfg);
  tmSyncUI();
}

function openTimer(cfg) {
  if (cfg) {
    if ((TM.status === 'running' || TM.status === 'paused') && !confirm('Hay un cronómetro en marcha. ¿Sustituirlo por este?')) {
      TM.open = true; tmSyncUI(); return;
    }
    if (TM.status !== 'idle') tmReset();
    tmFillForm(cfg);
  }
  TM.open = true;
  tmSyncUI();
}
function closeTimer() {
  TM.open = false;
  tmSyncUI();
}

function tmSyncUI(locIn) {
  const u = TM.ui;
  if (!u.overlay) return;
  const active = TM.status === 'running' || TM.status === 'paused';
  const loc = locIn || (active ? tmLocate(tmElapsed()) : null);

  u.overlay.classList.toggle('tm-open', TM.open);
  document.body.classList.toggle('tm-lock', TM.open);
  u.fab.classList.toggle('tm-fab-hidden', TM.open);
  u.fab.classList.toggle('tm-fab-active', active);
  u.muteBtn.textContent = getSettings().timerMute ? '🔕' : '🔔';

  u.setup.style.display = TM.status === 'idle' ? '' : 'none';
  u.run.style.display = TM.status === 'idle' ? 'none' : '';
  u.title.textContent = TM.status === 'idle' ? 'Cronómetro' : (TM.cfg && TM.cfg.label) || 'Cronómetro';

  const types = ['tm-type-work', 'tm-type-rest', 'tm-type-prep', 'tm-type-done'];
  types.forEach(c => u.overlay.classList.remove(c));

  if (TM.status === 'idle') { u.fab.textContent = '⏱'; return; }

  u.controls.style.display = TM.status === 'done' ? 'none' : '';
  u.doneBtns.style.display = TM.status === 'done' ? '' : 'none';
  u.pauseBtn.textContent = TM.status === 'paused' ? '▶ Seguir' : 'Pausa';
  const isAmrap = !!(TM.cfg && TM.cfg.mode === 'amrap');
  u.amrapBox.style.display = isAmrap && TM.status !== 'idle' ? '' : 'none';
  u.roundsNum.textContent = String(TM.rounds);
  u.amrapBox.querySelector('.tm-amrap-btns').style.display = TM.status === 'done' ? 'none' : '';

  if (TM.status === 'done' || !loc) {
    u.overlay.classList.add('tm-type-done');
    u.phase.textContent = '¡HECHO!';
    u.time.textContent = tmFmt(TM.total);
    u.sub.textContent = isAmrap ? `${TM.rounds} rondas completadas · anótalas en el registro` : `Tiempo total ${tmFmt(TM.total)}`;
    u.barFill.style.width = '100%';
    u.fab.textContent = '✓';
    return;
  }

  const ph = TM.phases[loc.idx];
  u.overlay.classList.add('tm-type-' + ph.type);
  u.phase.textContent = TM.status === 'paused' ? `${ph.label} · PAUSA` : ph.label;
  u.time.textContent = tmFmt(loc.left);
  const workPhases = TM.phases.filter(p => p.type === 'work').length;
  const workIdx = TM.phases.slice(0, loc.idx + 1).filter(p => p.type === 'work').length;
  const remainingTotal = TM.total - tmElapsed();
  u.sub.textContent = (ph.round && TM.cfg.mode === 'intervals' ? `Ronda ${ph.round}/${ph.rounds} · ` : '')
    + (ph.type === 'prep' && workPhases > 0 ? `${workPhases} ${TM.cfg.mode === 'emom' ? 'minutos' : 'rondas'} por delante · ` : '')
    + `Quedan ${tmFmt(remainingTotal)} en total`;
  u.barFill.style.width = `${Math.min(100, (loc.into / ph.dur) * 100)}%`;
  u.fab.textContent = (ph.type === 'work' ? '🔥 ' : ph.type === 'rest' ? '😮‍💨 ' : '⏱ ') + tmFmt(loc.left);
}


// ======================================================================
// GUÍA Y AYUDA INTEGRADA (contenido en js/guide.js)
// ======================================================================
const normText = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ficha de un ejercicio: la suya, o la genérica de su tipo
function guideEntryFor(exObj) {
  const key = exObj.tipo === 'partido' ? 'partido' : getMovementKey(exObj);
  if (GUIDE_EXERCISES[key]) return { key, entry: GUIDE_EXERCISES[key], generic: false };
  const g = GUIDE_TIPOS[exObj.tipo];
  return g ? { key, entry: g, generic: true } : null;
}

// botón pequeño que abre una sección concreta de la guía
function helpBtn(sectionId, label, entryKey) {
  return h('button', {
    class: 'help-btn',
    type: 'button',
    'aria-label': label || 'Ayuda',
    onclick: (e) => { e.stopPropagation(); openGuide(sectionId, entryKey); },
  }, `ⓘ ${label || 'Ayuda'}`);
}
function titleWithHelp(text, sectionId, label) {
  return h('div', { class: 'card-title card-title-row' }, [
    h('span', {}, text),
    helpBtn(sectionId, label || 'Ayuda'),
  ]);
}

function openGuide(sectionId, entryKey) {
  if (state.tab !== 'guia') state.prevTab = state.tab;
  state.tab = 'guia';
  if (sectionId || entryKey) state.guideQuery = '';
  if (sectionId) state.guideOpen.add(sectionId);
  if (entryKey) state.guideOpenEx.add(entryKey);
  closeTimer();
  render();
  const target = entryKey ? document.getElementById('guide-ex-' + entryKey)
    : sectionId ? document.getElementById('guide-' + sectionId) : null;
  if (target) target.scrollIntoView({ block: 'start' });
  else window.scrollTo(0, 0);
}
function closeGuide() {
  state.tab = state.prevTab && state.prevTab !== 'guia' ? state.prevTab : 'hoy';
  render();
  window.scrollTo(0, 0);
}
function toggleGuide() {
  if (state.tab === 'guia') closeGuide(); else openGuide();
}

// ---- bloques de contenido ----
function renderGuideBlocks(blocks) {
  const out = [];
  blocks.forEach(b => {
    if (b.p) out.push(h('p', { class: 'guide-p' }, b.p));
    else if (b.h) out.push(h('div', { class: 'guide-h' }, b.h));
    else if (b.ul) out.push(h('ul', { class: 'guide-list' }, b.ul.map(t => h('li', {}, t))));
    else if (b.ol) out.push(h('ol', { class: 'guide-list' }, b.ol.map(t => h('li', {}, t))));
    else if (b.kv) out.push(h('div', { class: 'guide-kv' }, b.kv.map(([k, v]) => h('div', { class: 'guide-kv-row' }, [
      h('div', { class: 'guide-kv-k' }, k),
      h('div', { class: 'guide-kv-v' }, v),
    ]))));
    else if (b.note) out.push(h('div', { class: 'guide-note' }, b.note));
    else if (b.warn) out.push(h('div', { class: 'guide-warn' }, b.warn));
    else if (b.dyn === 'logHelp') out.push(renderLogHelpList());
    else if (b.dyn === 'exercises') out.push(renderGuideExercises());
    else if (b.dyn === 'nutri') out.push(renderGuideNutri());
  });
  return out;
}

function renderLogHelpList() {
  const names = {
    peso_reps: 'Fuerza y lanzamientos (KG y REPS)', distancia_duracion: 'Cardio (MIN y KM)', duracion: 'Aguantar o trabajar un tiempo',
    reps: 'Repeticiones', pasos: 'Pasos del día', sprints: 'Sprints y RSA (SEG)', saltos: 'Saltos (CM y REPS)',
    rondas: 'Circuitos, EMOM, AMRAP y HIIT (RONDAS)', peso_metros: 'Trineo (KG y M)',
  };
  return h('div', { class: 'guide-kv' }, Object.keys(LOG_HELP).map(k => h('div', { class: 'guide-kv-row' }, [
    h('div', { class: 'guide-kv-k' }, names[k] || k),
    h('div', { class: 'guide-kv-v' }, LOG_HELP[k]),
  ])));
}

// cuerpo de una ficha de ejercicio (se usa en la guía y en el ⓘ de la tarjeta)
function renderExerciseGuideBody(entry, specKey) {
  const box = h('div', { class: 'guide-entry' });
  if (entry.que) box.appendChild(h('p', { class: 'guide-p' }, entry.que));
  if (entry.como && entry.como.length) {
    box.appendChild(h('div', { class: 'guide-h' }, 'Cómo se hace'));
    box.appendChild(h('ol', { class: 'guide-list' }, entry.como.map(t => h('li', {}, t))));
  }
  if (entry.fallos && entry.fallos.length) {
    box.appendChild(h('div', { class: 'guide-h' }, 'Errores típicos'));
    box.appendChild(h('ul', { class: 'guide-list' }, entry.fallos.map(t => h('li', {}, t))));
  }
  if (entry.alt) box.appendChild(h('div', { class: 'guide-note' }, `Alternativa o ajuste: ${entry.alt}`));
  if (entry.para) box.appendChild(h('div', { class: 'guide-warn' }, `Cuándo parar: ${entry.para}`));
  if (specKey && LOG_HELP[specKey]) {
    box.appendChild(h('div', { class: 'guide-h' }, 'Cómo se registra'));
    box.appendChild(h('p', { class: 'guide-p' }, LOG_HELP[specKey]));
  }
  return box;
}

// panel que se despliega dentro de la tarjeta (botón ⓘ)
function renderExerciseHelpPanel(exObj, specKey) {
  const g = guideEntryFor(exObj);
  const panel = h('div', { class: 'help-panel' });
  if (!g) { panel.appendChild(h('p', { class: 'guide-p' }, 'Sin ficha para este ejercicio.')); return panel; }
  panel.appendChild(renderExerciseGuideBody(g.entry, specKey));
  if (!g.generic) {
    panel.appendChild(h('button', {
      class: 'btn', style: 'margin-top:8px',
      onclick: () => openGuide('ejercicios', g.key),
    }, 'Ver en la guía'));
  }
  return panel;
}
function infoToggleBtn(movKey) {
  const open = state.openHelp.has(movKey);
  return h('button', {
    class: 'info-btn' + (open ? ' info-btn-open' : ''),
    type: 'button',
    'aria-label': open ? 'Ocultar ayuda del ejercicio' : 'Ver cómo se hace este ejercicio',
    'aria-expanded': open ? 'true' : 'false',
    onclick: () => {
      if (state.openHelp.has(movKey)) state.openHelp.delete(movKey); else state.openHelp.add(movKey);
      render();
    },
  }, 'ⓘ');
}

// ---- A-Z de ejercicios ----
function renderGuideExercises() {
  const wrap = h('div', { class: 'guide-ex-list' });
  GUIDE_EXERCISE_CATS.forEach(cat => {
    const keys = Object.keys(GUIDE_EXERCISES).filter(k => GUIDE_EXERCISES[k].cat === cat);
    if (!keys.length) return;
    wrap.appendChild(h('div', { class: 'guide-h guide-cat' }, cat));
    keys.forEach(k => {
      const e = GUIDE_EXERCISES[k];
      const det = h('details', { class: 'guide-ex', id: 'guide-ex-' + k, 'data-key': k });
      if (state.guideOpenEx.has(k)) det.setAttribute('open', 'open');
      det.addEventListener('toggle', () => {
        if (_guideFiltering) return;
        if (det.open) state.guideOpenEx.add(k); else state.guideOpenEx.delete(k);
      });
      det.appendChild(h('summary', {}, e.t));
      det.appendChild(renderExerciseGuideBody(e, null));
      wrap.appendChild(det);
    });
  });
  return wrap;
}

// ---- tus números de nutrición ----
function renderGuideNutri() {
  const iso = todayISO();
  const t = getDayTarget(iso);
  const p = getNutritionParams();
  const load = DAY_LOAD_FACTORS[t.loadKey] || DAY_LOAD_FACTORS.media;
  const rows = [
    ['Peso / altura / edad', `${fmtNum(p.peso, 1)} kg · ${fmtNum(p.altura)} cm · ${fmtNum(p.edad)} años`],
    ['BMR', `${fmtNum(t.bmr)} kcal`],
    ['Factor de actividad', fmtNum(p.factorActividad, 2)],
    ['TDEE', `${fmtNum(t.tdee)} kcal`],
    ['Semana de hoy', `${t.template} · ${t.maintenance ? 'mantenimiento' : 'déficit del ' + Math.round(t.deficitAplicado * 100) + '%'}`],
    ['Kcal base', `${fmtNum(t.kcalBase)} kcal${t.capApplied ? ' (limitada por el tope de ' + fmtNum(t.tope) + ')' : ''}`],
    ['Carga de hoy', `${load.label} (${t.loadFactor >= 1 ? '+' : '−'}${Math.abs(Math.round((t.loadFactor - 1) * 100))}%)`],
    ['Objetivo de hoy', `${fmtNum(t.kcalObjetivo)} kcal`],
    ['Proteína / hidratos / grasa', `${fmtNum(t.proteina)} g · ${fmtNum(t.carbohidratos)} g · ${fmtNum(t.grasas)} g`],
    ['Pérdida teórica', t.maintenance ? '—' : `${fmtNum(t.perdidaSemanalKg, 1)} kg/semana (${fmtNum(t.perdidaPct, 1)}% del peso)`],
    ['Kg por perder hasta tu objetivo', `${fmtNum(Math.max(0, t.kgAPerder), 1)} kg`],
  ];
  return h('div', { class: 'guide-kv guide-kv-numbers' }, rows.map(([k, v]) => h('div', { class: 'guide-kv-row' }, [
    h('div', { class: 'guide-kv-k' }, k),
    h('div', { class: 'guide-kv-v' }, v),
  ])));
}

// ---- pantalla de la guía ----
let _guideFiltering = false;
// coincidencia por INICIO de palabra y todas las palabras: "rsa" no casa con "personal", "calor" sí con "calorías"
function guideMatches(text, nq) {
  return nq.split(/\s+/).filter(Boolean).every(tok => {
    const esc = tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('(^|[^a-z0-9])' + esc).test(text);
  });
}
function filterGuide(root, q) {
  const nq = normText(q.trim());
  _guideFiltering = true;
  let anyShown = false;
  root.querySelectorAll('.guide-sec').forEach(sec => {
    const entries = [...sec.querySelectorAll('.guide-ex')];
    if (!nq) {
      sec.style.display = '';
      sec.open = state.guideOpen.has(sec.dataset.id);
      entries.forEach(e => { e.style.display = ''; e.open = state.guideOpenEx.has(e.dataset.key); });
      root.querySelectorAll('.guide-cat').forEach(c => { c.style.display = ''; });
      anyShown = true;
      return;
    }
    let show;
    if (entries.length) {
      let any = false;
      entries.forEach(e => {
        const m = guideMatches(e.dataset.text, nq);
        e.style.display = m ? '' : 'none';
        if (m) { any = true; e.open = true; }
      });
      sec.querySelectorAll('.guide-cat').forEach(c => { c.style.display = 'none'; });
      // las cabeceras de categoría con alguna ficha visible se mantienen
      sec.querySelectorAll('.guide-cat').forEach(c => {
        let n = c.nextElementSibling, visible = false;
        while (n && !n.classList.contains('guide-cat')) { if (n.style.display !== 'none') visible = true; n = n.nextElementSibling; }
        c.style.display = visible ? '' : 'none';
      });
      show = any;
    } else {
      show = guideMatches(sec.dataset.text, nq);
    }
    sec.style.display = show ? '' : 'none';
    sec.open = show;
    if (show) anyShown = true;
  });
  const none = root.querySelector('.guide-none');
  if (none) none.style.display = anyShown ? 'none' : '';
  setTimeout(() => { _guideFiltering = false; }, 0);
}

function tabGuia() {
  const wrap = h('div', { class: 'screen guide' });

  const searchIn = h('input', {
    class: 'food-input guide-search', type: 'search', placeholder: 'Buscar: RSA, calorías, sprint, cuello...',
    'aria-label': 'Buscar en la guía', value: state.guideQuery || '',
    oninput: (e) => { state.guideQuery = e.target.value; filterGuide(wrap, e.target.value); },
  });
  wrap.appendChild(h('div', { class: 'card' }, [
    h('div', { class: 'guide-top' }, [
      h('button', { class: 'btn guide-back', onclick: closeGuide }, '← Volver'),
      h('div', { class: 'card-title', style: 'margin:0' }, 'Guía y ayuda'),
    ]),
    h('p', { class: 'guide-p' }, 'Todo lo que hace la app y por qué, sin conexión. Busca una palabra o abre una sección.'),
    searchIn,
    h('div', { class: 'chips guide-chips' }, GUIDE_SECTIONS.map(s => h('button', {
      class: 'chip',
      onclick: () => { searchIn.value = ''; state.guideQuery = ''; state.guideOpen.add(s.id); filterGuide(wrap, ''); const el = document.getElementById('guide-' + s.id); if (el) el.scrollIntoView({ block: 'start' }); },
    }, `${s.icon} ${s.title.split(':')[0].split(' (')[0]}`))),
  ]));

  GUIDE_SECTIONS.forEach(s => {
    const det = h('details', { class: 'guide-sec card', id: 'guide-' + s.id, 'data-id': s.id });
    if (state.guideOpen.has(s.id)) det.setAttribute('open', 'open');
    det.addEventListener('toggle', () => {
      if (_guideFiltering) return;
      if (det.open) state.guideOpen.add(s.id); else state.guideOpen.delete(s.id);
    });
    det.appendChild(h('summary', { class: 'guide-sum' }, `${s.icon} ${s.title}`));
    det.appendChild(h('div', { class: 'guide-body' }, renderGuideBlocks(s.body)));
    wrap.appendChild(det);
  });
  wrap.appendChild(h('div', { class: 'notice guide-none', style: 'display:none' }, 'Sin resultados. Prueba con otra palabra.'));

  // texto normalizado para el buscador
  wrap.querySelectorAll('.guide-sec').forEach(sec => { sec.dataset.text = normText(sec.textContent); });
  wrap.querySelectorAll('.guide-ex').forEach(e => { e.dataset.text = normText(e.textContent); });
  if (state.guideQuery) setTimeout(() => filterGuide(wrap, state.guideQuery), 0);
  return wrap;
}

// ======================================================================
// NAV + ARRANQUE
// ======================================================================
const TABS = [
  { id: 'hoy', label: 'Hoy', icon: '🏋️', render: tabHoy },
  { id: 'semana', label: 'Semana', icon: '📋', render: tabSemana },
  { id: 'calendario', label: 'Calendario', icon: '📅', render: tabCalendario },
  { id: 'nutricion', label: 'Nutrición', icon: '🍽️', render: tabNutricion },
  { id: 'condicion', label: 'Condición', icon: '⚡', render: tabCondicion },
  { id: 'progreso', label: 'Progreso', icon: '📈', render: tabProgreso },
  { id: 'guia', label: 'Guía', icon: '❓', hidden: true, render: tabGuia },
];

applyTheme();
const _themeBtn = document.getElementById('theme-btn');
if (_themeBtn) _themeBtn.addEventListener('click', cycleTheme);
const _helpBtn = document.getElementById('help-btn');
if (_helpBtn) _helpBtn.addEventListener('click', toggleGuide);
tmBuildOverlay();
render();

// Al salir de un campo hacia un botón/nada, refresca PR y gráficas (sin cerrar el teclado al saltar entre campos)
$app.addEventListener('focusout', (e) => {
  const next = e.relatedTarget;
  if (!next || !/^(INPUT|TEXTAREA|SELECT)$/.test(next.tagName)) softRender();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  // si la app se quedó abierta de un día para otro y seguías viendo "hoy", salta al día actual
  const now = todayISO();
  if (now !== loadedToday) {
    if (state.selectedDate === loadedToday) state.selectedDate = now;
    loadedToday = now;
    render();
  }
  if (TM.status === 'running') { tmAcquireWake(); tmTick(); }
});

// ---------------- Service worker ----------------
// Solo en la versión web/PWA. En la app Android (Capacitor) los ficheros van dentro del APK.
const IS_NATIVE_APP = !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
if ('serviceWorker' in navigator && !IS_NATIVE_APP) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
