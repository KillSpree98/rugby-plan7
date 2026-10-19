/* ==========================================================================
   DATOS MAESTROS DEL PLAN · FASE 2: DEFINICIÓN, EXPLOSIVIDAD Y RITMO DE JUEGO
   Primera línea dinámico (pilar derecho / talonador).
   Objetivo: bajar grasa para mejorar el ratio potencia-peso, ganar velocidad de
   salida (0-10 m), potencia de contacto y capacidad de repetir esfuerzos (RSA).
   ========================================================================== */

// ---------- CALENDARIO DE TEMPORADA (33 semanas, lunes a domingo) ----------
// Solo las fechas de inicio de cada semana. El TIPO de cada semana (T1-T5) se
// calcula en app.js a partir de los partidos (DEFAULT_MATCHES) y de las semanas
// de descanso explícitas (DEFAULT_REST_WEEKS).
const SEASON_WEEKS = [
  '2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05',
  '2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09',
  '2026-11-16', '2026-11-23', '2026-11-30', '2026-12-07', '2026-12-14',
  '2026-12-21', '2026-12-28', '2027-01-04', '2027-01-11', '2027-01-18',
  '2027-01-25', '2027-02-01', '2027-02-08', '2027-02-15', '2027-02-22',
  '2027-03-01', '2027-03-08', '2027-03-15', '2027-03-22', '2027-03-29',
  '2027-04-05', '2027-04-12', '2027-04-19',
];

// Partidos por defecto (semilla inicial, editable desde la app: Calendario).
// tipo: 'liga' | 'amistoso'
// equipo: 'primero' | 'B' | 'ambos'
// esEliminatoria: true fuerza T5 (semifinal/final)
function m(id, date, tipo, rival, equipo, esEliminatoria) {
  return { id, date, tipo, rival, equipo: equipo || 'primero', esEliminatoria: !!esEliminatoria };
}
const DEFAULT_MATCHES = [
  m('m1', '2026-09-27', 'amistoso', 'Rival amistoso 1'),
  m('m2', '2026-10-11', 'amistoso', 'Rival amistoso 2'),
  m('m3', '2026-10-25', 'liga', 'Jornada 1'),
  m('m4', '2026-11-01', 'liga', 'Jornada 2'),
  m('m5', '2026-11-15', 'liga', 'Jornada 3'),
  m('m6', '2026-11-22', 'liga', 'Recuperación', 'B'),
  m('m7', '2026-11-29', 'liga', 'Jornada 4'),
  m('m8', '2026-12-06', 'liga', 'Jornada 5'),
  m('m9', '2026-12-20', 'liga', 'Jornada 6'),
  m('m10', '2026-12-27', 'liga', 'Jornada 7'),
  m('m11', '2027-01-17', 'liga', 'Jornada 8'),
  m('m12', '2027-01-24', 'liga', 'Jornada 9'),
  m('m13', '2027-01-31', 'liga', 'Recuperación', 'B'),
  m('m14', '2027-02-07', 'liga', 'Jornada 10'),
  m('m15', '2027-02-14', 'liga', 'Jornada 11'),
  m('m16', '2027-02-21', 'liga', 'Recuperación', 'B'),
  m('m17', '2027-02-28', 'liga', 'Jornada 12'),
  m('m18', '2027-03-14', 'liga', 'Jornada 13'),
  m('m19', '2027-03-21', 'liga', 'Jornada 14'),
  m('m20', '2027-04-11', 'liga', 'Semifinal', 'primero', true),
  m('m21', '2027-04-18', 'liga', 'Final', 'primero', true),
];

// Semanas de descanso total explícitas (T4): nadie juega y se marcan a mano.
const DEFAULT_REST_WEEKS = ['2027-03-22', '2027-04-19'];

const TEMPLATE_META = {
  T1: { label: 'Desarrollo',          color: '#5B7C99', short: 'Sin partido' },
  T2: { label: 'Semana de partido',   color: '#D9A441', short: 'Partido' },
  T3: { label: 'Post-partido',        color: '#8B6FA8', short: 'Sin partido, tras jugar' },
  T4: { label: 'Semana libre',        color: '#4C7A62', short: 'Nadie juega' },
  T5: { label: 'Eliminatoria',        color: '#B4432E', short: 'Final / semifinal' },
};

// ---------- PLANTILLAS DE ENTRENO ----------
// Cada plantilla: array de 7 días (Lunes -> Domingo).
// tipos de bloque: fuerza | potencia | sprint | rsa | hiit | metcon | cardio | core |
//                  primera_linea | movilidad | tecnica | neat | partido | descanso
//
// ex(id, nombre, series, detalle, tipo, claveMovimiento?, extras?)
//   extras = {
//     log:   fuerza el tipo de registro (ver LOG_TYPE_SPECS),
//     timer: configuración de cronómetro que se abre desde la tarjeta,
//     prog:  'rsa' | 'metcon' | 'contactos' -> añade la pauta de la semana
//            de progresión de condición (pestaña Condición) al detalle.
//   }
function ex(id, name, sets, detail, tipo, mov, extras) {
  return { id, name, sets, detail, tipo, mov, ...(extras || {}) };
}

// Normaliza un nombre de ejercicio a una clave de movimiento por defecto:
// minúsculas, sin acentos, sin texto entre paréntesis.
function slugifyMovement(name) {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
function getMovementKey(exObj) {
  return exObj.mov || slugifyMovement(exObj.name);
}

// Pasos del día (NEAT): palanca principal de déficit sin añadir fatiga.
function neat(id, target) {
  return { grupo: 'Pasos (NEAT)', ejercicios: [
    ex(id, 'Pasos del día', target, 'Fuera del entreno. Es el déficit "gratis": no añade fatiga', 'neat', 'pasos-del-dia'),
  ]};
}

// Cronómetros reutilizables por los ejercicios
const TM_RSA     = { mode: 'intervals', work: 6,  rest: 24, rounds: 6,  label: 'RSA · salida cada 30 s' };
const TM_RSA_L   = { mode: 'intervals', work: 6,  rest: 24, rounds: 4,  label: 'RSA reducido · 4 sprints' };
const TM_HIIT    = { mode: 'intervals', work: 20, rest: 40, rounds: 10, label: 'HIIT 20/40 × 10' };
const TM_RUCK    = { mode: 'intervals', work: 30, rest: 30, rounds: 8,  label: 'Rucks 30/30 × 8' };
const TM_EMOM12  = { mode: 'emom', minutes: 12, every: 60, label: 'EMOM 12 min' };
const TM_EMOM8   = { mode: 'emom', minutes: 8,  every: 60, label: 'EMOM 8 min' };
const TM_AMRAP18 = { mode: 'amrap', minutes: 18, label: 'AMRAP 18 min' };
const TM_TABATA  = { mode: 'intervals', work: 20, rest: 10, rounds: 8, label: 'Tabata 20/10 × 8' };

// ===================== T1 · SEMANA DE DESARROLLO (sin partido) =====================
// Lun: aceleración + potencia inferior       Mar: potencia superior + cuello (equipo noche)
// Mié: RSA + densidad (día duro, sin equipo)  Jue: Z2 bajo impacto + isométricos (equipo noche)
// Vie: full-body potencia + empuje + HIIT     Sáb: circuito "fatiga de partido"
// Dom: descanso
const T1_DAYS = [
  {
    day: 'Lunes', titulo: 'Aceleración 0-10 m + potencia tren inferior',
    bloques: [
      { grupo: 'Activación', ejercicios: [
        ex('t1-lu-1', 'Calentamiento dinámico + activación de glúteo', '10 min', 'Skipping, zancadas, puentes de glúteo, 2 progresiones de 10 m', 'movilidad'),
      ]},
      { grupo: 'Aceleración', ejercicios: [
        ex('t1-lu-2', 'Salidas en corto 10 m (3 apoyos)', '6x10 m', 'Intención máxima, 90 seg de descanso completo. Anota el tiempo si puedes medirlo', 'sprint'),
        ex('t1-lu-3', 'Arrastre de trineo ligero (aceleración)', '5x15 m', 'Carga ~10-15% del peso corporal, tronco inclinado, pasos cortos y violentos', 'potencia', undefined, { log: 'peso_metros' }),
      ]},
      { grupo: 'Potencia', ejercicios: [
        ex('t1-lu-4', 'Salto con contramovimiento (CMJ)', '4x4', 'Aterriza suave y silencioso. 60-90 seg entre series. Para si pierdes altura', 'potencia', undefined, { log: 'saltos', prog: 'contactos' }),
        ex('t1-lu-5', 'Salto al cajón', '4x3', 'Altura que domines. Baja andando, no saltando', 'potencia', undefined, { log: 'saltos' }),
        ex('t1-lu-6', 'Salto con barra trampa (trap bar jump)', '4x3', 'Carga ligera (20-30% de tu 1RM), velocidad máxima', 'potencia', undefined, { log: 'peso_reps' }),
      ]},
      { grupo: 'Fuerza (mantenimiento)', ejercicios: [
        ex('t1-lu-7', 'Sentadilla trasera', '3x3', 'Carga alta, subida explosiva, 2-3 min de descanso', 'fuerza'),
        ex('t1-lu-8', 'Peso muerto rumano', '3x6', 'Bajada controlada, subida rápida', 'fuerza'),
      ]},
      { grupo: 'Core', ejercicios: [
        ex('t1-lu-9', 'Pallof press isométrico', '3x20-30 seg', 'Por lado', 'core', undefined, { log: 'duracion' }),
      ]},
      neat('t1-lu-10', '8.000-10.000'),
    ],
  },
  {
    day: 'Martes', titulo: 'Potencia tren superior + cuello (entreno de equipo esta noche 21-23h)',
    bloques: [
      { grupo: 'Potencia', ejercicios: [
        ex('t1-ma-1', 'Press banca explosivo', '5x3', '60-70% del 1RM, barra rápida, pausa de 1 seg en pecho', 'fuerza'),
        ex('t1-ma-2', 'Push press', '4x4', 'Impulso de piernas, bloqueo arriba', 'fuerza'),
        ex('t1-ma-3', 'Lanzamiento de balón medicinal (pecho)', '4x5', 'Contra pared o suelo, máxima velocidad', 'potencia', undefined, { log: 'peso_reps' }),
        ex('t1-ma-4', 'Lanzamiento rotacional de balón medicinal', '3x5', 'Por lado. Potencia de cadera hacia el hombro', 'potencia', undefined, { log: 'peso_reps' }),
      ]},
      { grupo: 'Tirón', ejercicios: [
        ex('t1-ma-5', 'Remo Pendlay explosivo', '4x5', 'Barra al suelo en cada rep, tirón rápido', 'fuerza', 'remo-pendlay'),
        ex('t1-ma-6', 'Dominadas o jalón al pecho', '3x6-8', '', 'fuerza', 'dominadas-jalon'),
      ]},
      { grupo: 'Primera línea · cuello y agarre', ejercicios: [
        ex('t1-ma-7', 'Puente de cuello isométrico', '3x25-30 seg', 'Frontal, laterales y trasero', 'primera_linea'),
        ex('t1-ma-8', 'Shrugs con barra trampa', '3x10', '', 'primera_linea'),
        ex('t1-ma-9', 'Pinza de disco (grip)', '3x25-30 seg', 'Por mano', 'primera_linea'),
      ]},
      neat('t1-ma-10', '8.000-10.000'),
    ],
  },
  {
    day: 'Miércoles', titulo: 'RSA + densidad de trabajo (el día duro, sin entreno de equipo)',
    bloques: [
      { grupo: 'Calentamiento', ejercicios: [
        ex('t1-mi-1', 'Calentamiento progresivo + 3 progresiones de 20 m', '12 min', 'Sube de intensidad poco a poco', 'movilidad'),
      ]},
      { grupo: 'RSA · repetir sprints', ejercicios: [
        ex('t1-mi-2', 'RSA: sprints repetidos', '12 sprints', '2 series con 3 min entre series. Anota el tiempo de cada sprint; si el último es >8% más lento que el primero, termina la serie. Bajo impacto: bici de asalto 6 seg a tope / 24 seg suave', 'rsa', undefined, { log: 'sprints', timer: TM_RSA, prog: 'rsa' }),
      ]},
      { grupo: 'Acondicionamiento metabólico', ejercicios: [
        ex('t1-mi-3', 'Circuito de densidad (EMOM 12 min)', '1 circuito', 'Min 1: 12 swings con kettlebell · Min 2: 6 burpees · Min 3: 20 m de empuje de trineo. Acaba cada minuto con ≥10 seg de descanso. Anota las rondas completas', 'metcon', undefined, { log: 'rondas', timer: TM_EMOM12 }),
      ]},
      { grupo: 'Core', ejercicios: [
        ex('t1-mi-4', 'Plancha con toque de hombro', '3x40 seg', '', 'core', undefined, { log: 'duracion' }),
      ]},
      neat('t1-mi-5', '8.000-10.000'),
    ],
  },
  {
    day: 'Jueves', titulo: 'Zona 2 bajo impacto + isométricos (entreno de equipo esta noche)',
    bloques: [
      { grupo: 'Cardio base (oxidación de grasa)', ejercicios: [
        ex('t1-ju-1', 'Zona 2 sin impacto (bici, elíptica o caminata inclinada)', '35-45 min', 'Ritmo conversacional, 125-140 lpm. Cuida las articulaciones: cero saltos hoy', 'cardio', 'cardio-z2-bajo-impacto'),
      ]},
      { grupo: 'Movilidad', ejercicios: [
        ex('t1-ju-2', 'Movilidad de cadera, tobillo y hombro', '15 min', '', 'movilidad'),
      ]},
      { grupo: 'Primera línea · isométricos', ejercicios: [
        ex('t1-ju-3', 'Isométrico posición de melé', '4x20-30 seg', 'Cadera baja, espalda neutra', 'primera_linea'),
        ex('t1-ju-4', 'Puente de cuello (4 direcciones)', '3x20 seg', 'Por dirección', 'primera_linea', 'puente-cuello-4-dir'),
        ex('t1-ju-5', 'Pinza de disco (grip)', '3x25-30 seg', 'Por mano', 'primera_linea'),
      ]},
      neat('t1-ju-6', '10.000'),
    ],
  },
  {
    day: 'Viernes', titulo: 'Full-body potencia + empuje pesado + HIIT',
    bloques: [
      { grupo: 'Potencia', ejercicios: [
        ex('t1-vi-1', 'Tirón alto con barra (high pull)', '5x3', 'Desde la cadera, extensión triple explosiva', 'potencia', undefined, { log: 'peso_reps' }),
        ex('t1-vi-2', 'Peso muerto con barra trampa', '4x3', 'Rápido en la subida, 2 min de descanso', 'fuerza'),
      ]},
      { grupo: 'Empuje (contacto y melé)', ejercicios: [
        ex('t1-vi-3', 'Empuje de trineo pesado', '6x15 m', 'Carga alta, tronco bajo, 90 seg entre series', 'potencia', undefined, { log: 'peso_metros' }),
        ex('t1-vi-4', 'Empuje/scrum (técnica)', '6 series', '5-6 seg de empuje máximo', 'primera_linea', 'scrum-empuje'),
      ]},
      { grupo: 'HIIT', ejercicios: [
        ex('t1-vi-5', 'Bici de asalto o trineo: 20 seg a tope / 40 seg suave', '1 bloque', '10 rondas. Anota cuántas rondas completas manteniendo la potencia', 'hiit', undefined, { log: 'rondas', timer: TM_HIIT }),
      ]},
      neat('t1-vi-6', '8.000'),
    ],
  },
  {
    day: 'Sábado', titulo: 'Circuito "fatiga de partido" (rucks, placajes, melé)',
    bloques: [
      { grupo: 'Calentamiento', ejercicios: [
        ex('t1-sa-1', 'Movilidad + activación con saco', '10 min', '', 'movilidad'),
      ]},
      { grupo: 'Circuito de partido', ejercicios: [
        ex('t1-sa-2', 'AMRAP: limpieza de ruck, placaje, bear crawl, burpee, trineo', '1 circuito', 'Cada ronda: 5 limpiezas de ruck (saco pesado) · 4 placajes al saco levantándote del suelo cada vez · 10 m bear crawl · 6 burpees con salto · 15 m trineo ligero rápido. 30 seg de pausa entre rondas = ritmo de partido', 'metcon', undefined, { log: 'rondas', timer: TM_AMRAP18, prog: 'metcon' }),
      ]},
      { grupo: 'Primera línea', ejercicios: [
        ex('t1-sa-3', 'Isométrico de melé con fatiga', '3x20 seg', 'Justo al acabar el circuito, aguanta la posición', 'primera_linea', 'isometrico-mele-fatiga'),
      ]},
      neat('t1-sa-4', '8.000'),
    ],
  },
  {
    day: 'Domingo', titulo: 'Descanso / recuperación absoluta',
    bloques: [
      { grupo: 'Recuperación', ejercicios: [
        ex('t1-do-1', 'Descanso absoluto', '—', 'El músculo y el sistema nervioso se recuperan hoy. Duerme', 'descanso'),
      ]},
      { grupo: 'Opcional', ejercicios: [
        ex('t1-do-3', 'Movilidad suave', '20-25 min', 'Opcional', 'movilidad'),
        ex('t1-do-4', 'Core suave', '2x15', 'Opcional', 'core'),
      ]},
      neat('t1-do-5', '8.000'),
    ],
  },
];

// ===================== T2 · SEMANA DE PARTIDO (domingo) =====================
// Calidad sobre cantidad: la fatiga baja a medida que se acerca el partido.
const T2_DAYS = [
  {
    day: 'Lunes', titulo: 'MD+1 · Recuperación activa: tren superior ligero + Z1',
    bloques: [
      { grupo: 'Fuerza ligera', ejercicios: [
        ex('t2-lu-1', 'Press banca', '3x8', 'Carga moderada, sin llegar al fallo', 'fuerza'),
        ex('t2-lu-2', 'Remo con mancuerna a una mano', '3x10', '', 'fuerza'),
        ex('t2-lu-3', 'Face pull', '3x15', '', 'fuerza'),
      ]},
      { grupo: 'Cardio recuperación', ejercicios: [
        ex('t2-lu-4', 'Bici o remo muy suave', '20 min', 'Zona 1, pulso <120', 'cardio', 'cardio-z1-recuperacion'),
        ex('t2-lu-5', 'Movilidad de cadera y hombro', '10-15 min', '', 'movilidad'),
      ]},
      neat('t2-lu-6', '8.000'),
    ],
  },
  {
    day: 'Martes', titulo: 'Aceleración + potencia inferior, volumen reducido (entreno de equipo esta noche 21-23h)',
    bloques: [
      { grupo: 'Aceleración', ejercicios: [
        ex('t2-ma-1', 'Salidas en corto 10 m (3 apoyos)', '5x10 m', '90 seg de descanso completo', 'sprint'),
      ]},
      { grupo: 'Potencia', ejercicios: [
        ex('t2-ma-2', 'Salto con contramovimiento (CMJ)', '3x4', '', 'potencia', undefined, { log: 'saltos' }),
      ]},
      { grupo: 'Fuerza (mantenimiento)', ejercicios: [
        ex('t2-ma-3', 'Sentadilla trasera', '3x3', 'Carga alta pero sin fallo, subida explosiva', 'fuerza'),
        ex('t2-ma-4', 'Peso muerto rumano', '2x6', '', 'fuerza'),
      ]},
      { grupo: 'Core', ejercicios: [
        ex('t2-ma-5', 'Pallof press isométrico', '3x20-30 seg', 'Por lado', 'core', undefined, { log: 'duracion' }),
      ]},
      neat('t2-ma-6', '8.000'),
    ],
  },
  {
    day: 'Miércoles', titulo: 'RSA + empuje de trineo (el día duro de la semana, sin entreno de equipo)',
    bloques: [
      { grupo: 'Calentamiento', ejercicios: [
        ex('t2-mi-1', 'Calentamiento progresivo + 3 progresiones de 20 m', '12 min', '', 'movilidad'),
      ]},
      { grupo: 'RSA', ejercicios: [
        ex('t2-mi-2', 'RSA: sprints repetidos', '6 sprints', 'Una sola serie. 24 seg de recuperación entre sprints. Bajo impacto: bici de asalto', 'rsa', 'rsa-sprints-repetidos', { log: 'sprints', timer: { mode: 'intervals', work: 6, rest: 24, rounds: 6, label: 'RSA 6 sprints' } }),
      ]},
      { grupo: 'Empuje', ejercicios: [
        ex('t2-mi-3', 'Empuje de trineo rápido', '6x15 m', 'Carga media, máxima velocidad', 'potencia', 'empuje-de-trineo-rapido', { log: 'peso_metros' }),
      ]},
      { grupo: 'Metabólico corto', ejercicios: [
        ex('t2-mi-4', 'EMOM 8 min: 10 swings con kettlebell + 5 burpees', '1 circuito', 'Que sea ágil, no una paliza. Anota rondas completas', 'metcon', 'emom-8-swings-burpees', { log: 'rondas', timer: TM_EMOM8 }),
      ]},
      neat('t2-mi-5', '8.000-10.000'),
    ],
  },
  {
    day: 'Jueves', titulo: 'Activación neural + cuello/core (entreno de equipo esta noche)',
    bloques: [
      { grupo: 'Potencia (poco volumen)', ejercicios: [
        ex('t2-ju-1', 'Press banca explosivo', '3x3', '50-60% del 1RM, solo velocidad', 'fuerza'),
        ex('t2-ju-2', 'Lanzamiento de balón medicinal (pecho)', '3x5', '', 'potencia', undefined, { log: 'peso_reps' }),
        ex('t2-ju-3', 'Salto con contramovimiento (CMJ)', '2x4', 'Aterriza suave', 'potencia', undefined, { log: 'saltos' }),
      ]},
      { grupo: 'Primera línea', ejercicios: [
        ex('t2-ju-4', 'Isométrico posición de melé', '3x20 seg', '', 'primera_linea'),
        ex('t2-ju-5', 'Puente de cuello isométrico', '3x25-30 seg', '', 'primera_linea'),
        ex('t2-ju-6', 'Pinza de disco (grip)', '3x25-30 seg', 'Por mano', 'primera_linea'),
      ]},
      { grupo: 'Movilidad', ejercicios: [
        ex('t2-ju-7', 'Movilidad de cadera y hombro', '10 min', '', 'movilidad'),
      ]},
      neat('t2-ju-8', '8.000'),
    ],
  },
  {
    day: 'Viernes', titulo: 'Activación pre-partido',
    bloques: [
      { grupo: 'Activación', ejercicios: [
        ex('t2-vi-1', 'Movilidad dinámica', '15 min', 'Suave, sin fatiga', 'movilidad'),
        ex('t2-vi-2', 'Salidas en corto 10 m al 90%', '4x10 m', 'Solo calidad, descanso completo', 'sprint', 'salidas-en-corto-10-m'),
      ]},
      { grupo: 'Primera línea', ejercicios: [
        ex('t2-vi-3', 'Trabajo técnico de melé', '4 series', 'Técnica y coordinación, 5 seg al 80%', 'primera_linea', 'scrum-empuje'),
        ex('t2-vi-4', 'Puente de cuello isométrico', '2x20 seg', '', 'primera_linea'),
      ]},
      neat('t2-vi-5', '6.000-8.000'),
    ],
  },
  {
    day: 'Sábado', titulo: 'Descanso completo antes del partido',
    bloques: [
      { grupo: 'Recuperación', ejercicios: [
        ex('t2-sa-1', 'Sin sesión · descanso total', '—', 'Prioridad: llegar fresco al domingo. Hidrátate y come carbohidrato', 'descanso'),
      ]},
    ],
  },
  {
    day: 'Domingo', titulo: 'PARTIDO',
    bloques: [
      { grupo: 'Partido', ejercicios: [
        ex('t2-do-1', 'Partido (mañana/mediodía)', '—', 'Con 1er equipo o equipo B, según semana', 'partido'),
      ]},
    ],
  },
];

// ===================== T3 · POST-PARTIDO (sin partido esta semana, venías de jugar) =====================
// Lunes MD+1 de recuperación, luego la estructura de T1 ajustada a los días de equipo.
const withDay = (d, day, titulo) => ({ ...d, day, ...(titulo ? { titulo } : {}) });
const T3_DAYS = [
  T2_DAYS[0],
  withDay(T1_DAYS[0], 'Martes', 'Aceleración 0-10 m + potencia tren inferior (entreno de equipo esta noche 21-23h)'),
  withDay(T1_DAYS[2], 'Miércoles', 'RSA + densidad de trabajo (el día duro, sin entreno de equipo)'),
  withDay(T1_DAYS[1], 'Jueves', 'Potencia tren superior + cuello (entreno de equipo esta noche)'),
  T1_DAYS[4],
  {
    day: 'Sábado', titulo: 'Descanso activo (sin partido mañana)',
    bloques: [
      { grupo: 'Recuperación', ejercicios: [
        ex('t3-sa-1', 'Descanso activo', '—', 'Caminar o movilidad suave, sin fatiga', 'descanso'),
        ex('t3-sa-2', 'Zona 2 sin impacto (opcional)', '30 min', 'Opcional · bici suave o caminata inclinada', 'cardio', 'cardio-z2-bajo-impacto'),
        ex('t3-sa-3', 'Movilidad suave (opcional)', '20-25 min', 'Opcional', 'movilidad'),
      ]},
      neat('t3-sa-4', '8.000-10.000'),
    ],
  },
  T1_DAYS[6],
];

// ===================== T4 · SEMANA LIBRE (nadie juega) =====================
// Estructura T1, pero el jueves se convierte en Z2 largo (más gasto sin impacto)
// y el domingo queda libre: aprovecha para apretar el déficit.
const T4_DAYS = T1_DAYS.map((d, i) => {
  if (i === 3) {
    return {
      day: 'Jueves', titulo: 'Zona 2 larga sin impacto + isométricos',
      bloques: [
        { grupo: 'Cardio base (oxidación de grasa)', ejercicios: [
          ex('t4-ju-1', 'Zona 2 sin impacto (bici, elíptica o caminata inclinada)', '50-60 min', 'Ritmo conversacional, 125-140 lpm', 'cardio', 'cardio-z2-bajo-impacto'),
        ]},
        { grupo: 'Primera línea · isométricos', ejercicios: [
          ex('t4-ju-2', 'Isométrico posición de melé', '4x20-30 seg', '', 'primera_linea'),
          ex('t4-ju-3', 'Puente de cuello (4 direcciones)', '3x20 seg', 'Por dirección', 'primera_linea', 'puente-cuello-4-dir'),
        ]},
        neat('t4-ju-4', '10.000'),
      ],
    };
  }
  if (i === 6) {
    return {
      day: 'Domingo', titulo: 'Sin partido · sesión ligera o descanso',
      bloques: [
        { grupo: 'Recuperación', ejercicios: [
          ex('t4-do-1', 'Descanso o sesión ligera extra', '—', 'Aprovecha la semana para apretar el déficit', 'descanso'),
          ex('t4-do-2', 'Movilidad suave (opcional)', '20-25 min', 'Opcional', 'movilidad'),
        ]},
        neat('t4-do-3', '8.000-10.000'),
      ],
    };
  }
  return d;
});

// ===================== T5 · ELIMINATORIA (semifinal / final) =====================
// Como T2, pero el miércoles baja a calidad pura y el jueves es solo activación.
const T5_DAYS = T2_DAYS.map((d, i) => {
  if (i === 2) {
    return {
      day: 'Miércoles', titulo: 'RSA corto, calidad pura (sin entreno de equipo)',
      bloques: [
        { grupo: 'Calentamiento', ejercicios: [
          ex('t5-mi-1', 'Calentamiento progresivo + 3 progresiones de 20 m', '12 min', '', 'movilidad'),
        ]},
        { grupo: 'RSA', ejercicios: [
          ex('t5-mi-2', 'RSA: sprints repetidos', '4 sprints', 'Una serie, calidad máxima, 24 seg de recuperación', 'rsa', 'rsa-sprints-repetidos', { log: 'sprints', timer: TM_RSA_L }),
        ]},
        { grupo: 'Empuje', ejercicios: [
          ex('t5-mi-3', 'Empuje de trineo rápido', '4x15 m', 'Carga media', 'potencia', 'empuje-de-trineo-rapido', { log: 'peso_metros' }),
        ]},
        neat('t5-mi-4', '8.000'),
      ],
    };
  }
  if (i === 3) {
    return {
      day: 'Jueves', titulo: 'Recorte de carga · movilidad y activación ligera',
      bloques: [
        { grupo: 'Movilidad y activación', ejercicios: [
          ex('t5-ju-1', 'Movilidad general', '15-20 min', 'Suave, sin fatiga', 'movilidad'),
          ex('t5-ju-2', 'Activación ligera', '10-15 min', 'Skipping suave, técnica de carrera, 3 salidas de 10 m al 80%', 'movilidad'),
        ]},
        { grupo: 'Primera línea', ejercicios: [
          ex('t5-ju-3', 'Pinza de disco (grip)', '3x20 seg', 'Por mano · carga baja', 'primera_linea'),
        ]},
        neat('t5-ju-4', '6.000-8.000'),
      ],
    };
  }
  return d;
});

const TEMPLATES = { T1: T1_DAYS, T2: T2_DAYS, T3: T3_DAYS, T4: T4_DAYS, T5: T5_DAYS };

// ---------- PROGRESIÓN DE ACONDICIONAMIENTO (8 semanas) ----------
// Avanza únicamente en semanas T1 (bloque de desarrollo). La pauta de la semana
// actual se añade sola al detalle de RSA, circuito y saltos.
// Con tu peso corporal, los contactos (saltos/sprints) se suben poco a poco:
// si aparece dolor de rodilla, tobillo o espinilla, repite la semana.
const CONDITIONING_PROGRESSION = [
  { semana: 1, rsa: '2x5 sprints de 15 m · salida cada 35 s',                       metcon: 'AMRAP 12 min',                          contactos: '~40 contactos/semana · cajón bajo' },
  { semana: 2, rsa: '2x6 sprints de 15 m · salida cada 35 s',                       metcon: 'AMRAP 14 min',                          contactos: '~50 contactos/semana' },
  { semana: 3, rsa: '2x6 sprints de 20 m · salida cada 35 s',                       metcon: 'AMRAP 15 min',                          contactos: '~60 contactos/semana' },
  { semana: 4, rsa: '2x4 sprints de 20 m · salida cada 40 s (descarga)',            metcon: 'AMRAP 10 min (descarga)',               contactos: '~40 contactos/semana (descarga)' },
  { semana: 5, rsa: '2x6 sprints de 20 m · salida cada 30 s',                       metcon: 'AMRAP 16 min',                          contactos: '~70 contactos/semana' },
  { semana: 6, rsa: '3x5 sprints de 20 m · salida cada 30 s',                       metcon: 'AMRAP 18 min',                          contactos: '~80 contactos/semana' },
  { semana: 7, rsa: '3x6 sprints de 20 m · salida cada 30 s',                       metcon: 'AMRAP 18 min + 1 ruck extra por ronda', contactos: '~90 contactos/semana' },
  { semana: 8, rsa: 'TEST: 6x20 m, salida cada 20 s (mide tiempo medio y caída)',   metcon: 'TEST: AMRAP 20 min',                    contactos: 'TEST: mejor CMJ de 3 intentos' },
];

// ---------- CRONÓMETROS (presets de la pestaña ⏱) ----------
const TIMER_PRESETS = [
  { id: 'tabata',  label: 'Tabata',        cfg: TM_TABATA },
  { id: 'rsa',     label: 'RSA 6x20 m',    cfg: TM_RSA },
  { id: 'hiit',    label: 'HIIT 20/40',    cfg: TM_HIIT },
  { id: 'ruck',    label: 'Rucks 30/30',   cfg: TM_RUCK },
  { id: 'emom10',  label: 'EMOM 10',       cfg: { mode: 'emom', minutes: 10, every: 60, label: 'EMOM 10 min' } },
  { id: 'emom12',  label: 'EMOM 12',       cfg: TM_EMOM12 },
  { id: 'amrap12', label: 'AMRAP 12',      cfg: { mode: 'amrap', minutes: 12, label: 'AMRAP 12 min' } },
  { id: 'amrap18', label: 'AMRAP 18',      cfg: TM_AMRAP18 },
  { id: 'rest60',  label: 'Descanso 1:00', cfg: { mode: 'rest', seconds: 60,  label: 'Descanso 1:00' } },
  { id: 'rest90',  label: 'Descanso 1:30', cfg: { mode: 'rest', seconds: 90,  label: 'Descanso 1:30' } },
  { id: 'rest120', label: 'Descanso 2:00', cfg: { mode: 'rest', seconds: 120, label: 'Descanso 2:00' } },
  { id: 'rest180', label: 'Descanso 3:00', cfg: { mode: 'rest', seconds: 180, label: 'Descanso 3:00' } },
];

// ---------- MENSAJES DE MOTIVACIÓN (rotan a diario, alternando categoría) ----------
// {peso} y {objetivo} se sustituyen por los valores actuales de la pestaña Nutrición.
const MOTIVATION_COMIDA = [
  'Hoy pesas {peso} y el objetivo son {objetivo}. Cada kilo que sobra lo cargas en cada sprint. Lo decide lo que comas en las próximas horas.',
  'Nadie controla tu comida por ti. Es la única parte del plan que depende solo de ti.',
  'Un entrenamiento perfecto no compensa un día de comer sin cabeza. Las dos cosas van juntas o no funciona ninguna.',
  'El ratio potencia-peso se mejora en la cocina tanto como en el gimnasio.',
  'No necesitas motivación para comer bien, necesitas decidirlo antes de tener hambre. Decídelo ahora.',
  'Apunta lo que comes. Lo que no se mide, se negocia contigo mismo.',
  'El peso no baja por desearlo, baja por lo que hay en el plato. Hoy también cuenta.',
  'Si hoy fallas con la comida, mañana no empieza de cero: empieza más abajo. Corta la racha antes de que empiece.',
  'No hay comida buena ni mala: hay comida que te acerca a tu objetivo y comida que te aleja. Hoy toca la primera.',
  'Cada kilo de grasa que pierdes es un kilo menos que mover en la salida de los primeros 5 metros.',
  'Proteína primero, verdura después, hidrato alrededor del entreno. Lo demás es ruido.',
  'Un déficit bien hecho se nota en la báscula y en el tiempo de tus sprints. Si el sprint empeora, revisa el plato.',
];

const MOTIVATION_RUGBY = [
  'Eres primera línea, pero ahora eres un primera línea que llega primero. Esta fase es para eso.',
  'El que se levanta rápido del suelo gana la siguiente fase. Hoy entrenas para levantarte.',
  'El contacto se decide en el primer paso. Hoy entrenas el primer paso.',
  'Nadie ve el trabajo de las 6 de la mañana. Se nota en el minuto 70, cuando el otro pilar ya no llega al ruck y tú sí.',
  'La resistencia específica no se hace corriendo despacio: se hace repitiendo esfuerzos duros con poco descanso.',
  'Agresividad no es fuerza bruta: es llegar antes, con más velocidad, y repetirlo diez veces seguidas.',
  'Tu trabajo no es lucir bien, es no ceder ni un centímetro en el minuto 78. Para eso entrenas hoy.',
  'Si hoy no te apetece entrenar, recuerda que el domingo tampoco te apetecerá llegar al ruck. Hazlo por tu equipo.',
  'Cada sprint repetido hoy es un ruck que limpias en el segundo tiempo.',
  'El pack no se construye con talento, se construye con constancia. Hoy toca otra sesión más.',
  'Intensidad con descansos cortos: incomodidad controlada. Esa incomodidad es la del partido.',
  'No necesitas ser el más rápido del campo. Necesitas ser el pilar más rápido que ha visto tu rival.',
];

// ---------- TIP DEL DÍA (rota, sin repetir consecutivos) ----------
const TIPS = [
  { cat: 'Nutrición', texto: 'Empieza el plato por la proteína: si la cubres primero, es más difícil pasarte con lo demás.' },
  { cat: 'Velocidad', texto: 'Los sprints se hacen frescos: descanso completo entre salidas de 10 m. Si te cansas, la calidad desaparece y ya no entrenas velocidad.' },
  { cat: 'Recuperación', texto: 'Dormir menos de 7 h empeora la recuperación y sube el hambre. En déficit, el sueño es parte del plan.' },
  { cat: 'Work rate', texto: 'En RSA, compara el tiempo del último sprint con el del primero. Si cae más de un 8%, la serie ya cumplió.' },
  { cat: 'Nutrición', texto: 'El hambre real tarda en aparecer; el antojo aparece de golpe. Aprende a distinguirlos antes de comer.' },
  { cat: 'Primera línea', texto: 'Un cuello fuerte protege en el placaje y en la melé. El trabajo isométrico no es relleno.' },
  { cat: 'Recuperación', texto: 'El cardio muy suave (Zona 1) el día después del partido baja más la fatiga que quedarte quieto.' },
  { cat: 'Velocidad', texto: 'En el CMJ, aterriza suave y silencioso. Un aterrizaje ruidoso a tu peso se paga en rodillas y espinillas.' },
  { cat: 'Nutrición', texto: 'Los días de RSA, circuito o HIIT son los de más hidrato. Los días de descanso, menos. La app ya lo ajusta.' },
  { cat: 'Primera línea', texto: 'El grip aguanta agarres en la melé y en el ruck. Los 3x25-30 seg de pinza no son relleno.' },
  { cat: 'Work rate', texto: 'Descansos cortos controlados: la sesión mejora cuando bajas el descanso, no cuando subes el peso.' },
  { cat: 'Recuperación', texto: 'El dolor articular no se aguanta: si aparece, repite la semana de progresión en vez de avanzar.' },
  { cat: 'Nutrición', texto: 'El déficit se construye en la suma de días, no en uno aislado. Registra lo que comes aunque sea un mal día.' },
  { cat: 'Velocidad', texto: 'En la salida de 10 m, empuja el suelo hacia atrás y mantén el tronco inclinado. No te levantes antes de tiempo.' },
  { cat: 'Work rate', texto: 'Para levantarte rápido del suelo en el partido, entrénalo: cada placaje al saco del circuito termina de pie y rápido.' },
  { cat: 'Nutrición', texto: 'Pésate a la misma hora, en ayunas. Mira la media de 7 días, no el número de hoy.' },
  { cat: 'Recuperación', texto: 'Si tus sprints empeoran dos semanas seguidas y a la vez pierdes peso muy rápido, sube 150-250 kcal.' },
  { cat: 'Primera línea', texto: 'En el empuje de melé, la fuerza sale de la cadera y las piernas, no de arquear la espalda.' },
  { cat: 'Work rate', texto: 'Zona 2 y HIIT no se pelean: la Z2 es la base que te deja repetir esfuerzos y el HIIT es el estímulo. Haz las dos.' },
  { cat: 'Nutrición', texto: 'Bebe 35-40 ml de agua por kg de peso al día, más en días de doble sesión. Con calor, añade sal.' },
];

// ---------- Grupos musculares (puntuación de musculatura en Progreso) ----------
const MUSCLE_GROUPS = [
  { key: 'cuello', label: 'Cuello' },
  { key: 'hombros', label: 'Hombros' },
  { key: 'pecho', label: 'Pecho' },
  { key: 'brazos', label: 'Brazos' },
  { key: 'core', label: 'Core / abdomen' },
  { key: 'piernas', label: 'Piernas (cuádriceps)' },
  { key: 'gemelos', label: 'Gemelos' },
];

// ---------- Tipos de registro de ejercicio ----------
// better: 'max' (por defecto) o 'min' (tiempos: cuanto menos, mejor)
const LOG_TYPE_SPECS = {
  peso_reps: {
    fields: [
      { key: 'peso', label: 'KG', step: 0.5 },
      { key: 'reps', label: 'REPS', step: 1 },
    ],
    metric: 'peso', metricLabel: 'Peso (kg)', metricAgg: 'max',
  },
  distancia_duracion: {
    fields: [
      { key: 'duracion', label: 'MIN', step: 1 },
      { key: 'distancia', label: 'KM', step: 0.1 },
    ],
    metric: 'duracion', metricLabel: 'Duración total (min)', metricAgg: 'sum', noPR: true,
  },
  duracion: {
    fields: [{ key: 'duracion', label: null, step: 5 }], // label se resuelve en runtime (SEG/MIN)
    metric: 'duracion', metricLabel: 'Mejor serie', metricAgg: 'max',
  },
  reps: {
    fields: [{ key: 'reps', label: 'REPS', step: 1 }],
    metric: 'reps', metricLabel: 'Mejor serie (reps)', metricAgg: 'max',
  },
  pasos: {
    fields: [{ key: 'pasos', label: 'PASOS', step: 100 }],
    metric: 'pasos', metricLabel: 'Pasos', metricAgg: 'sum', noPR: true,
  },
  sprints: {
    fields: [{ key: 'tiempo', label: 'SEG', step: 0.01 }],
    metric: 'tiempo', metricLabel: 'Mejor sprint (seg)', metricAgg: 'min', better: 'min',
  },
  saltos: {
    fields: [
      { key: 'altura', label: 'CM', step: 1 },
      { key: 'reps', label: 'REPS', step: 1 },
    ],
    metric: 'altura', metricLabel: 'Mejor altura (cm)', metricAgg: 'max',
  },
  rondas: {
    fields: [{ key: 'rondas', label: 'RONDAS', step: 0.5 }],
    metric: 'rondas', metricLabel: 'Mejores rondas', metricAgg: 'max',
  },
  peso_metros: {
    fields: [
      { key: 'peso', label: 'KG', step: 1 },
      { key: 'metros', label: 'M', step: 1 },
    ],
    metric: 'peso', metricLabel: 'Carga (kg)', metricAgg: 'max',
  },
};

// Nº de series (filas) a partir del texto de "sets":
// "3x5" -> 3, "6 series" -> 6, "12 sprints" -> 12. Sin patrón -> 1 entrada.
function parseSetCount(setsStr) {
  if (!setsStr) return 1;
  const s = setsStr.trim();
  if (s === '—') return 0;
  let mm = s.match(/^(\d+)\s*[x×]/i);
  if (mm) return parseInt(mm[1], 10);
  mm = s.match(/^(\d+)(?:-\d+)?\s*(series|rondas|sprints|intentos)/i);
  if (mm) return parseInt(mm[1], 10);
  return 1;
}

// Unidad de duración (segundos o minutos), inferida del texto
function inferDurationUnit(exObj) {
  const text = ((exObj.sets || '') + ' ' + (exObj.detail || '')).toLowerCase();
  if (text.includes('seg')) return 'seg';
  return 'min';
}

// Qué tipo de registro corresponde a cada ejercicio
function getLogSpecKey(exObj) {
  if (exObj.log) return exObj.log;
  const name = exObj.name.toLowerCase();
  switch (exObj.tipo) {
    case 'fuerza': return 'peso_reps';
    case 'potencia': return 'peso_reps';
    case 'sprint': return 'sprints';
    case 'rsa': return 'sprints';
    case 'hiit':
    case 'metcon': return 'rondas';
    case 'cardio': return 'distancia_duracion';
    case 'primera_linea': return name.includes('shrug') ? 'peso_reps' : 'duracion';
    case 'core': return name.includes('plancha') ? 'duracion' : 'reps';
    case 'movilidad':
    case 'tecnica': return 'duracion';
    case 'neat': return 'pasos';
    default: return null; // partido, descanso: sin registro
  }
}

// ---------- NUTRICIÓN ----------
// Protocolo de definición: déficit sostenido + proteína alta y fija + carbohidrato
// concentrado en los días de más intensidad (ciclado de carbohidratos).
const NUTRITION_DEFAULTS = {
  peso: 140,
  altura: 195,
  edad: 18,              // REVÍSALA: es la edad con la que se calcula tu BMR
  mlg: 89.3,
  pesoObjetivo: 112.5,
  factorActividad: 1.65,
  porcentajeDeficit: 0.25,
  kcalMax: 2600,         // tope en semanas de déficit (≈ por encima de tu BMR estimado)
  deficitEnT3: true,     // en semana post-partido (T3) se mantiene el déficit
};

// Reparto de calorías según la carga del día (la media semanal se mantiene ~igual)
const DAY_LOAD_FACTORS = {
  alta:    { factor: 1.06, label: 'Día de carga alta',  hint: 'Sprints, RSA, circuito o HIIT: más hidrato' },
  media:   { factor: 1.00, label: 'Día de carga media', hint: 'Fuerza y potencia' },
  baja:    { factor: 0.88, label: 'Día de carga baja',  hint: 'Descanso, Z2 o activación: menos hidrato' },
  partido: { factor: 1.12, label: 'Día de partido',     hint: 'Recarga: hidrato alto, sin recortar' },
};

// Protocolo nutricional que se muestra en la pestaña Nutrición
const NUTRITION_PROTOCOL = [
  { t: 'Proteína fija', d: '≈2,35 g por kg de masa libre de grasa cada día, repartida en 4-5 tomas de 35-50 g. Protege el músculo mientras pierdes grasa.' },
  { t: 'Hidrato donde se usa', d: 'Concentra los hidratos en las 3 h antes y las 2 h después de RSA, circuito, HIIT y partido. En días de descanso o Z2, menos.' },
  { t: 'Grasa moderada', d: '≈0,7 g por kg de peso. Por debajo de eso empiezas a perder energía y recuperación.' },
  { t: 'Ritmo de pérdida', d: 'Objetivo 0,7-1,2 kg por semana (≤1% del peso). Más rápido que eso y empiezas a perder potencia y velocidad: sube 150-250 kcal.' },
  { t: 'Si los sprints empeoran', d: 'Si el tiempo de tus sprints o tu CMJ empeoran dos semanas seguidas, el déficit es demasiado grande. Sube kcal o haz un día de mantenimiento.' },
  { t: 'Día de recarga', d: 'Cada 10-14 días de déficit, un día a mantenimiento (mejor si coincide con el día más duro) ayuda a rendir y a seguir el plan.' },
  { t: 'Hidratación', d: '35-40 ml por kg de peso al día; más con doble sesión o calor.' },
  { t: 'Registro', d: 'Apunta todo lo que comes. Un error de 300 kcal diarias es el 15% del déficit.' },
];
