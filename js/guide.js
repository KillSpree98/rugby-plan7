/* ==========================================================================
   GUÍA INTEGRADA · todo el contenido de ayuda de la app (funciona sin conexión)
   - GUIDE_EXERCISES: ficha de cada ejercicio (clave = clave de movimiento)
   - GUIDE_TIPOS: ayuda genérica por tipo de bloque (respaldo)
   - LOG_HELP: cómo rellenar cada tipo de registro
   - GUIDE_SECTIONS: secciones de la guía (bloques: p, h, ul, ol, kv, note, warn, dyn)
   - TIMER_MODE_HELP: texto bajo el selector del cronómetro
   ========================================================================== */

// ---------------------------------------------------------------------------
// FICHAS DE EJERCICIOS
// { t: título, cat: categoría, que: qué es y para qué, como: [pasos], fallos: [errores],
//   alt: alternativa o ajuste, para: cuándo parar }
// ---------------------------------------------------------------------------
const GUIDE_EXERCISE_CATS = [
  'Calentamiento y movilidad',
  'Aceleración y sprints',
  'Saltos y potencia',
  'Fuerza',
  'Lanzamientos y empujes',
  'Primera línea: cuello, agarre y melé',
  'Core',
  'Acondicionamiento (RSA, circuitos, HIIT)',
  'Cardio y pasos',
  'Descanso y partido',
];

const GUIDE_EXERCISES = {
  // ---------------- Calentamiento y movilidad ----------------
  'calentamiento-dinamico-activacion-de-gluteo': {
    t: 'Calentamiento dinámico + activación de glúteo', cat: 'Calentamiento y movilidad',
    que: 'Prepara articulaciones, músculos y sistema nervioso antes de sprints y saltos. Con tu peso, entrar frío a un sprint es la forma más fácil de lesionarte.',
    como: [
      '2-3 min de cardio suave (bici o trote muy lento) hasta empezar a sudar.',
      'Skipping bajo, zancadas caminando con giro de tronco y balanceos de pierna adelante/atrás y laterales.',
      'Puentes de glúteo 2x12 (o caminata lateral con goma) para "encender" el glúteo.',
      '2 progresiones de 10 m aumentando velocidad hasta ~80%.',
    ],
    fallos: ['Hacerlo sin llegar a sudar.', 'Saltarte la activación de glúteo: si no trabaja, el sprint lo pagan isquios y espalda.'],
    alt: 'Si vas justo de tiempo, recorta el cardio inicial, no las progresiones.',
  },
  'calentamiento-progresivo-3-progresiones-de-20-m': {
    t: 'Calentamiento progresivo + 3 progresiones de 20 m', cat: 'Calentamiento y movilidad',
    que: 'Calentamiento específico para el día de RSA. Lleva el cuerpo a velocidad máxima de forma gradual.',
    como: [
      '5 min de cardio suave y movilidad dinámica (cadera, tobillo, hombro).',
      '3 carreras de 20 m: la 1ª al ~60%, la 2ª al ~75% y la 3ª al ~90%.',
      'Camina de vuelta (≈1 min entre progresiones).',
    ],
    fallos: ['Pasar de frío directamente a sprints máximos.', 'Hacer las progresiones demasiado rápido y llegar cansado a la serie.'],
  },
  'movilidad-activacion-con-saco': {
    t: 'Movilidad + activación con saco', cat: 'Calentamiento y movilidad',
    que: 'Calentamiento del sábado: movilidad más gestos de contacto a baja intensidad para preparar el circuito.',
    como: ['5 min de movilidad dinámica.', 'Con el saco: levantarlo del suelo, empujarlo y golpe de hombro suave, sin impacto fuerte.', 'Termina con 2-3 respiraciones profundas antes de empezar.'],
    fallos: ['Hacer ya el contacto a tope: es solo activación.'],
  },
  'movilidad-de-cadera-tobillo-y-hombro': {
    t: 'Movilidad de cadera, tobillo y hombro', cat: 'Calentamiento y movilidad',
    que: 'Mantiene el rango de movimiento que necesitas para sprintar, agacharte en la melé y placar.',
    como: [
      'Cadera: círculos de cadera, 90/90 y zancada profunda con rotación.',
      'Tobillo: rodilla hacia la pared con el talón pegado, 10 reps por lado.',
      'Hombro: rotaciones con goma y apertura torácica (tumbado de lado).',
      'Respira lento y no fuerces: tensión sí, dolor no.',
    ],
    fallos: ['Hacerla rápido y sin atención: pierde el efecto.'],
    para: 'Para si notas dolor punzante o pinzamiento (distinto de la tensión de estirar).',
  },
  'movilidad-de-cadera-y-hombro': {
    t: 'Movilidad de cadera y hombro', cat: 'Calentamiento y movilidad',
    que: 'Versión corta de la movilidad (10-15 min) para días de recuperación o activación.',
    como: ['Zancada profunda con rotación 5 por lado.', '90/90 de cadera 8 reps por lado.', 'Rotaciones de hombro con goma 2x12.', 'Todo suave, sin buscar fatiga.'],
    fallos: ['Convertirla en una sesión intensa.'],
  },
  'movilidad-dinamica': {
    t: 'Movilidad dinámica (pre-partido)', cat: 'Calentamiento y movilidad',
    que: 'Sesión del viernes antes del partido: suelta el cuerpo sin generar fatiga.',
    como: ['15 min a ritmo cómodo.', 'Balanceos de pierna, círculos de cadera, zancadas con giro, rotaciones de hombro.', 'Nada que te deje cansado.'],
    fallos: ['Añadirle series o intensidad "porque te sientes bien".'],
  },
  'movilidad-suave': {
    t: 'Movilidad suave', cat: 'Calentamiento y movilidad',
    que: 'Trabajo opcional de recuperación para el domingo o días libres.',
    como: ['20-25 min de estiramientos suaves y movilidad.', 'Mantén cada posición 30-45 s respirando.', 'Céntrate en cadera, isquios, pecho y espalda alta.'],
    fallos: ['Estirar con dolor o rebotando.'],
  },
  'movilidad-general': {
    t: 'Movilidad general', cat: 'Calentamiento y movilidad',
    que: 'Movilidad completa para la semana de eliminatoria: soltar sin fatigar.',
    como: ['15-20 min a ritmo muy suave.', 'Cadera, tobillos, columna torácica y hombros.'],
    fallos: ['Hacerla con prisa.'],
  },
  'activacion-ligera': {
    t: 'Activación ligera', cat: 'Calentamiento y movilidad',
    que: 'Mantiene las piernas "despiertas" antes de una eliminatoria sin cansarte.',
    como: ['Skipping suave y técnica de carrera 5 min.', '3 salidas de 10 m al ~80%, caminando de vuelta.', 'Si sientes que te cuesta, para: la idea es llegar fresco.'],
    fallos: ['Hacer sprints al 100% el jueves antes de la final.'],
  },

  // ---------------- Aceleración y sprints ----------------
  'salidas-en-corto-10-m': {
    t: 'Salidas en corto 10 m', cat: 'Aceleración y sprints',
    que: 'Sprints de 10 m desde posición baja. Entrena la aceleración de los primeros pasos, que es lo que decide llegar antes al contacto o al ruck.',
    como: [
      'Posición de 3 apoyos: una mano en el suelo, pierna contraria a la mano adelantada, peso hacia delante.',
      'El primer paso empuja el suelo hacia atrás (no tires hacia delante). Tronco inclinado unos 45° durante 3-4 pasos.',
      'Pasos cortos, rápidos y potentes; extiende bien tobillo, rodilla y cadera. Levántate poco a poco.',
      'Descanso completo de ~90 s entre salidas: aquí entrenas velocidad, no cansancio.',
      'Cronometra cada salida (cronómetro manual o fotocélulas, siempre igual) y anótala en SEG.',
    ],
    fallos: ['Incorporarte demasiado pronto.', 'Pasos largos que te frenan.', 'Descansar poco: se convierte en cardio y pierdes calidad.', 'Hacerlas sin calentar bien.'],
    alt: 'Si te molesta la rodilla o la espinilla, hazlas de pie (posición semiflexionada) o con trineo ligero.',
    para: 'Para ante cualquier tirón en isquios, gemelo o aductor, o si el tiempo empeora claramente (>5%).',
  },
  'arrastre-de-trineo-ligero': {
    t: 'Arrastre de trineo ligero (aceleración)', cat: 'Aceleración y sprints',
    que: 'Trineo con poca carga para acelerar con tronco inclinado y empuje fuerte contra el suelo, con poco impacto articular.',
    como: [
      'Engánchalo al cinturón o arnés y colócate con el tronco inclinado.',
      'Carga ligera (trineo + discos ≈ 10-15% de tu peso). Si te frena mucho, quítale carga.',
      '15 m con pasos cortos y violentos; vuelta andando.',
      'Anota los kg totales (KG) y los metros (M).',
    ],
    fallos: ['Cargar demasiado: se convierte en fuerza lenta y pierdes la técnica de carrera.'],
  },
  'empuje-de-trineo-rapido': {
    t: 'Empuje de trineo rápido', cat: 'Aceleración y sprints',
    que: 'Empujar el trineo con carga media a máxima velocidad. Une fuerza y velocidad con el movimiento que usas en el ruck y la melé.',
    como: ['Manos en los postes, brazos casi extendidos, tronco bajo (~45°).', 'Carga media que te deje mantener la velocidad los 15 m.', 'Pasos potentes y rápidos; descansa lo necesario para repetir con calidad.', 'Anota kg totales y metros.'],
    fallos: ['Pasos lentos y arrastrados.', 'Espalda redondeada.'],
  },
  'rsa-sprints-repetidos': {
    t: 'RSA: sprints repetidos', cat: 'Aceleración y sprints',
    que: 'RSA (Repeated Sprint Ability) es la capacidad de repetir sprints con poca recuperación, como en un partido: llegar, caer al suelo, levantarte y volver a llegar sin que se te caiga la velocidad.',
    como: [
      'Calienta bien (hay ficha del calentamiento).',
      'Sprint al máximo en la distancia que marca tu semana en Condición (15-20 m). Vuelve andando.',
      'Cada sprint sale cada 30 s (35 s o 40 s en las primeras semanas). El cronómetro ⏱ lo marca por ti.',
      'Anota el tiempo de cada sprint en SEG.',
      'Compara el último con el primero: si es más de un 8% más lento, termina esa serie.',
      '3 min de descanso entre series (el cronómetro de descanso 3:00 te ayuda).',
    ],
    fallos: ['No ir al 100% en el primero: así no sabrás cuánto te caes.', 'Aguantar series con tiempos que se desploman: ya no es RSA, es cansancio.'],
    alt: 'Si te duelen articulaciones: bici de asalto, 6 s a tope y 24 s muy suave, mismo número de repeticiones.',
    para: 'Para si notas un tirón muscular, dolor de espinilla o rodilla, o mareo.',
  },
  'scrum-empuje': {
    t: 'Empuje/scrum (técnica)', cat: 'Primera línea: cuello, agarre y melé',
    que: 'Trabajo técnico de melé: empujar en posición de primera línea con intención máxima durante pocos segundos.',
    como: [
      'En máquina de melé, trineo contra pared o con compañero.',
      'Entra en posición: pies al ancho de cadera, cadera baja, espalda neutra, cabeza alta, rodillas ~120°.',
      'Empuje máximo de 5-6 s manteniendo la posición; descansa 60-90 s.',
      'Anota los segundos mantenidos (la unidad que pide la tarjeta).',
    ],
    fallos: ['Espalda redondeada o cuello en hiperextensión.', 'Empujar con la cabeza en vez de con piernas y cadera.'],
    para: 'Para si notas dolor o presión en cuello, hormigueo en brazos o mareo. Calienta siempre el cuello antes.',
  },

  // ---------------- Saltos y potencia ----------------
  'salto-con-contramovimiento': {
    t: 'Salto con contramovimiento (CMJ)', cat: 'Saltos y potencia',
    que: 'Salto vertical rápido. Es tu test principal de potencia de piernas y un buen termómetro de fatiga: si saltas menos de lo normal, estás cansado.',
    como: [
      'De pie, manos en la cadera (o con brazos, siempre igual).',
      'Baja rápido a un cuarto de sentadilla y salta lo más alto posible.',
      'Aterriza suave y silencioso, rodillas flexionadas y alineadas con los pies.',
      '60-90 s entre series. Anota la altura en CM (con app de salto, tapete o marca en la pared).',
      'Para la serie si pierdes más del 10% de altura.',
    ],
    fallos: ['Aterrizar rígido ("ruidoso"): a tu peso, se paga en rodillas y espinillas.', 'Rodillas que se van hacia dentro al caer.'],
    alt: 'Si tu rodilla o espinilla protestan, cambia a salto al cajón y baja andando.',
    para: 'Para si hay dolor en rodilla, tendón rotuliano o espinilla.',
  },
  'salto-al-cajon': {
    t: 'Salto al cajón', cat: 'Saltos y potencia',
    que: 'Saltas hacia arriba y aterrizas en una superficie alta: potencia con poco impacto, porque bajas andando.',
    como: ['Cajón a una altura que domines (empieza bajo).', 'Salta con extensión completa de cadera y rodillas.', 'Aterriza en cuarto de sentadilla, silencioso y estable.', 'BAJA ANDANDO, no saltando.', 'Anota la altura del cajón en CM.'],
    fallos: ['Cajón demasiado alto que te obliga a aterrizar en sentadilla profunda.', 'Bajar de un salto: sumas impacto sin ganar nada.'],
  },
  'salto-con-barra-trampa': {
    t: 'Salto con barra trampa (trap bar jump)', cat: 'Saltos y potencia',
    que: 'Salto con carga ligera dentro de la barra hexagonal: potencia de piernas con la barra en las manos.',
    como: ['Carga ligera (20-30% de tu 1RM de peso muerto).', 'Posición de peso muerto parcial, espalda neutra.', 'Salta lo más rápido posible; aterriza flexionando rodillas y caderas.', 'Anota KG y reps.'],
    fallos: ['Usar demasiado peso: pierdes velocidad y deja de ser potencia.'],
  },
  'tiron-alto-con-barra': {
    t: 'Tirón alto con barra (high pull)', cat: 'Saltos y potencia',
    que: 'Movimiento olímpico simplificado: extensión triple de tobillos, rodillas y cadera, y tirón de codos altos. Desarrolla potencia explosiva de todo el cuerpo.',
    como: [
      'Barra a mitad del muslo, espalda neutra, hombros delante de la barra.',
      'Extiende tobillos, rodillas y cadera de golpe (como un salto).',
      'Entonces tira con codos altos hasta el pecho, manteniendo la barra pegada al cuerpo.',
      'Baja controlado. 5x3 con peso moderado y velocidad.',
    ],
    fallos: ['Tirar con los brazos antes de extender la cadera.', 'Barra lejos del cuerpo.'],
    alt: 'Si te cuesta la técnica, empieza con muy poco peso o con mancuernas hasta dominar el movimiento.',
  },

  // ---------------- Fuerza ----------------
  'sentadilla-trasera': {
    t: 'Sentadilla trasera', cat: 'Fuerza',
    que: 'Mantenimiento de la fuerza de piernas. En esta fase NO buscas subir marcas: buscas conservar lo ganado mientras bajas peso.',
    como: [
      'Barra sobre trapecios, pies a la anchura de hombros, core apretado.',
      'Baja controlado (~2 s) hasta al menos paralelo.',
      'Sube lo más rápido posible. 3x3 con carga alta, dejando 1-2 reps en reserva.',
      '2-3 min de descanso entre series.',
    ],
    fallos: ['Hacer reps al fallo: quema recuperación que necesitas para sprintar.', 'Perder profundidad al cargar de más.'],
    alt: 'En déficit es normal que la fuerza baje un poco. Si pierdes técnica, baja peso en vez de forzar.',
    para: 'Para ante dolor lumbar agudo o de rodilla.',
  },
  'peso-muerto-rumano': {
    t: 'Peso muerto rumano', cat: 'Fuerza',
    que: 'Fortalece isquios y glúteo, los motores del sprint, y protege los isquios frente a tirones.',
    como: ['Rodillas ligeramente flexionadas y fijas.', 'Lleva la cadera hacia atrás con la barra pegada a los muslos.', 'Baja hasta sentir los isquios tensos (por debajo de la rodilla).', 'Sube empujando la cadera hacia delante. Espalda neutra todo el tiempo.'],
    fallos: ['Redondear la espalda.', 'Flexionar las rodillas como si fuera una sentadilla.'],
  },
  'peso-muerto-con-barra-trampa': {
    t: 'Peso muerto con barra trampa', cat: 'Fuerza',
    que: 'Fuerza máxima de cadena posterior con menos carga lumbar que la barra recta. Aquí se hace rápido.',
    como: ['Colócate dentro de la barra, pecho alto y espalda neutra.', 'Empuja el suelo con los pies y sube con velocidad.', 'Bloquea cadera arriba sin hiperextender la espalda.', 'Baja controlado. 4x3 con 2 min de descanso.'],
    fallos: ['Tirar con la espalda en vez de empujar con las piernas.', 'Rebotar la barra contra el suelo.'],
  },
  'press-banca-explosivo': {
    t: 'Press banca explosivo', cat: 'Fuerza',
    que: 'Press de banca con barra rápida: potencia de empuje para el contacto, no fuerza máxima.',
    como: ['60-70% de tu 1RM (o un peso con el que puedas hacer 3 reps muy rápidas).', 'Escápulas juntas y pies firmes.', 'Baja controlado 1-2 s y para 1 s en el pecho.', 'Empuja lo más rápido posible. 5x3 con 2 min de descanso.', 'Si la velocidad cae, termina la serie.'],
    fallos: ['Rebotar la barra en el pecho.', 'Cargar de más y hacer reps lentas.'],
    para: 'Para ante dolor de hombro agudo.',
  },
  'press-banca': {
    t: 'Press banca', cat: 'Fuerza',
    que: 'Press de banca en carga moderada para el día de recuperación (MD+1).',
    como: ['Carga moderada que deje 3-4 reps en reserva.', 'Escápulas juntas, bajada controlada, subida firme.', '3x8, sin llegar al fallo.'],
    fallos: ['Convertir el día de recuperación en un día duro.'],
  },
  'push-press': {
    t: 'Push press', cat: 'Fuerza',
    que: 'Press por encima de la cabeza con impulso de piernas. Transfiere fuerza de piernas al tren superior.',
    como: ['Barra en el pecho, codos algo adelantados.', 'Pequeña flexión de rodillas (dip) y extensión explosiva de piernas.', 'Aprovecha el impulso para llevar la barra arriba y bloquear los codos.', 'Baja controlado. Costillas abajo, sin arquear la lumbar. 4x4.'],
    fallos: ['Arquear la espalda.', 'Hacer el dip demasiado profundo.'],
  },
  'remo-pendlay': {
    t: 'Remo Pendlay explosivo', cat: 'Fuerza',
    que: 'Remo desde el suelo, rápido, para potencia de la espalda (clave en el ruck y la melé).',
    como: ['Barra en el suelo, torso casi paralelo al suelo, espalda neutra.', 'Tira explosivo hacia la parte baja del pecho.', 'Baja controlado y deja la barra en el suelo en cada repetición.', '4x5 con carga moderada para poder ser rápido.'],
    fallos: ['Subir el torso para ayudarte.', 'Carga excesiva que impide la velocidad.'],
  },
  'dominadas-jalon': {
    t: 'Dominadas o jalón al pecho', cat: 'Fuerza',
    que: 'Tirón vertical para espalda y dorsales.',
    como: ['Agarre algo más ancho que los hombros.', 'Hombros abajo y atrás, pecho hacia la barra.', 'Baja controlado hasta casi extender.', 'Si no llegas a 6 dominadas limpias, usa jalón. Anota el peso o lastre.'],
    fallos: ['Balancearte (kipping).', 'Encoger los hombros hacia las orejas.'],
    alt: 'Con tu peso corporal, el jalón al pecho es una opción totalmente válida.',
  },
  'remo-con-mancuerna-a-una-mano': {
    t: 'Remo con mancuerna a una mano', cat: 'Fuerza',
    que: 'Remo unilateral para espalda sin fatigar la zona lumbar.',
    como: ['Una mano y rodilla apoyadas en un banco, espalda neutra.', 'Tira de la mancuerna hacia la cadera con el codo pegado.', '3x10 por lado, control total.'],
    fallos: ['Girar el tronco para subir más peso.'],
  },
  'face-pull': {
    t: 'Face pull', cat: 'Fuerza',
    que: 'Trabaja la parte posterior del hombro y la estabilidad escapular. Protege los hombros con tanto empuje.',
    como: ['Polea o goma a la altura de la cara con cuerda.', 'Tira hacia la cara abriendo los codos y rotando los hombros hacia fuera.', 'Pausa breve y vuelve controlado. 3x15 con poco peso.'],
    fallos: ['Cargar demasiado y tirar con la espalda baja.'],
  },
  'shrugs-con-barra-trampa': {
    t: 'Shrugs con barra trampa', cat: 'Primera línea: cuello, agarre y melé',
    que: 'Encogimientos para trapecios y cuello: protegen la zona en melé y placaje.',
    como: ['De pie dentro de la barra hexagonal, brazos extendidos.', 'Sube los hombros hacia las orejas, pausa 1 s arriba.', 'Baja controlado. 3x10. Anota KG y reps.'],
    fallos: ['Rotar los hombros.', 'Usar impulso de piernas.'],
  },

  // ---------------- Lanzamientos y empujes ----------------
  'lanzamiento-de-balon-medicinal': {
    t: 'Lanzamiento de balón medicinal (pecho)', cat: 'Lanzamientos y empujes',
    que: 'Lanzar un balón pesado lo más fuerte posible: entrena la potencia de empuje que usas en el contacto.',
    como: ['Balón de 3-6 kg, de pie o arrodillado frente a una pared o con espacio libre.', 'Pase de pecho lanzando con todo el cuerpo.', 'Recoge y repite. Peso que te permita lanzar rápido.', 'Anota KG y reps.'],
    fallos: ['Balón tan pesado que el lanzamiento es lento.'],
  },
  'lanzamiento-rotacional-de-balon-medicinal': {
    t: 'Lanzamiento rotacional de balón medicinal', cat: 'Lanzamientos y empujes',
    que: 'Potencia rotacional (cadera → tronco → brazos) que se transfiere al placaje y al ruck.',
    como: ['De lado a una pared, balón al costado de la cadera.', 'Rota la cadera primero, luego el tronco y lanza.', '3x5 por lado, a máxima velocidad.'],
    fallos: ['Lanzar solo con los brazos.'],
  },
  'empuje-de-trineo-pesado': {
    t: 'Empuje de trineo pesado', cat: 'Lanzamientos y empujes',
    que: 'Empujar con carga alta: fuerza de empuje y posición baja, la misma que usas en la melé y el ruck.',
    como: ['Manos en los postes, tronco bajo, brazos casi extendidos.', 'Carga alta con la que puedas empujar 15 m sin detenerte.', 'Pasos potentes y constantes. 90 s de descanso entre series.', 'Anota kg totales (trineo + discos) y metros.'],
    fallos: ['Perder la posición baja y erguirte.', 'Tantos kg que paras a mitad de recorrido.'],
  },

  // ---------------- Primera línea ----------------
  'puente-de-cuello-isometrico': {
    t: 'Puente de cuello isométrico', cat: 'Primera línea: cuello, agarre y melé',
    que: 'Fortalece el cuello sin mover la cabeza: protege en melé y placaje.',
    como: ['Apoya la cabeza contra una mano, pared o goma.', 'Empuja con intensidad moderada (~50-70%) manteniendo el cuello neutro.', '25-30 s en cada dirección: frontal, laterales y trasero.', 'Sin movimientos bruscos ni giros.'],
    fallos: ['Empujar al máximo desde el primer segundo.', 'Mover la cabeza durante el mantenimiento.'],
    para: 'Para ante dolor agudo, hormigueo en los brazos o mareo.',
  },
  'puente-cuello-4-dir': {
    t: 'Puente de cuello (4 direcciones)', cat: 'Primera línea: cuello, agarre y melé',
    que: 'Igual que el puente isométrico pero con una serie por cada dirección.',
    como: ['20 s frontal, 20 s trasero, 20 s lateral izquierdo, 20 s lateral derecho.', 'Intensidad moderada, cuello neutro.', 'Repite 3 rondas.'],
    fallos: ['Saltarte direcciones: el cuello debe quedar equilibrado.'],
    para: 'Para ante dolor agudo, hormigueo en brazos o mareo.',
  },
  'pinza-de-disco': {
    t: 'Pinza de disco (grip)', cat: 'Primera línea: cuello, agarre y melé',
    que: 'Fuerza de agarre con los dedos: sostiene la camiseta rival y el balón en el ruck y la melé.',
    como: ['Agarra un disco de 5-10 kg por el borde, con el pulgar enfrente de los dedos.', 'Mantén 25-30 s por mano.', 'Anota los segundos mantenidos.'],
    fallos: ['Usar un disco tan pesado que no llegues a 20 s.'],
  },
  'isometrico-posicion-de-mele': {
    t: 'Isométrico posición de melé', cat: 'Primera línea: cuello, agarre y melé',
    que: 'Mantener la posición de pilar bajo carga. Es lo que ocurre en la melé: sostenida, no explosiva.',
    como: ['Pies al ancho de cadera, cadera baja, espalda neutra, cabeza alta, rodillas ~120°.', 'Empuja contra el trineo, pared o compañero al ~70% durante 20-30 s.', 'Anota los segundos mantenidos.'],
    fallos: ['Espalda redondeada.', 'Cuello hiperextendido.'],
    para: 'Para si pierdes la posición o notas dolor lumbar o cervical.',
  },
  'isometrico-mele-fatiga': {
    t: 'Isométrico de melé con fatiga', cat: 'Primera línea: cuello, agarre y melé',
    que: 'Posición de melé justo después del circuito: entrena a mantener la técnica cuando estás cansado.',
    como: ['Al acabar el circuito, entra a posición de melé sin recuperar.', 'Mantén 20 s con técnica correcta.', '3 series con descanso corto.'],
    fallos: ['Dejar caer la cadera o redondear la espalda por el cansancio. Si pasa, baja la intensidad.'],
  },

  // ---------------- Core ----------------
  'pallof-press-isometrico': {
    t: 'Pallof press isométrico', cat: 'Core',
    que: 'Core anti-rotación: aprende a resistir que te giren, como en la melé y el contacto.',
    como: ['Goma o cable a la altura del pecho, de lado.', 'Manos al pecho, extiende los brazos y aguanta 20-30 s resistiendo el giro.', 'Caderas y hombros cuadrados al frente. Cambia de lado.'],
    fallos: ['Dejar que el tronco gire.', 'Encoger los hombros.'],
  },
  'plancha-con-toque-de-hombro': {
    t: 'Plancha con toque de hombro', cat: 'Core',
    que: 'Plancha con antirotación: estabilidad de core con movimiento alterno.',
    como: ['Posición de flexión con los pies algo abiertos.', 'Toca el hombro contrario alternando sin girar la cadera.', '3x40 s con ritmo controlado.'],
    fallos: ['Cadera que se balancea.', 'Lumbar hundida.'],
  },
  'core-suave': {
    t: 'Core suave', cat: 'Core',
    que: 'Core ligero opcional para días de descanso.',
    como: ['2x15 de un ejercicio controlado: dead bug, plancha corta o abdominal lento.', 'Sin fatiga.'],
    fallos: ['Hacerlo hasta el fallo en un día de descanso.'],
  },

  // ---------------- Acondicionamiento ----------------
  'circuito-de-densidad': {
    t: 'Circuito de densidad (EMOM 12 min)', cat: 'Acondicionamiento (RSA, circuitos, HIIT)',
    que: 'EMOM significa "cada minuto en el minuto": al inicio de cada minuto haces una tarea y descansas lo que te sobre. Sube la densidad de trabajo con descansos cortos y controlados.',
    como: [
      'Minuto 1: 12 swings con kettlebell.',
      'Minuto 2: 6 burpees.',
      'Minuto 3: 20 m de empuje de trineo.',
      'Repite el ciclo de 3 minutos 4 veces (12 min). El cronómetro ⏱ marca cada minuto.',
      'Debes terminar cada tarea con al menos 10 s de descanso. Si no, baja repeticiones.',
      'Anota las vueltas completas de 3 minutos (máximo 4).',
    ],
    fallos: ['Hacer reps de más y no tener descanso: pierdes técnica.', 'Empezar tan fuerte que no aguantas los últimos minutos.'],
    para: 'Para si sientes mareo, dolor en el pecho o falta de aire anormal.',
  },
  'emom-8-swings-burpees': {
    t: 'EMOM 8 min: swings + burpees', cat: 'Acondicionamiento (RSA, circuitos, HIIT)',
    que: 'Versión corta del EMOM para semana de partido: ágil, sin paliza.',
    como: ['Minutos impares: 10 swings con kettlebell.', 'Minutos pares: 5 burpees.', '8 minutos en total. Termina cada minuto con descanso.', 'Anota las vueltas completas (pares de minutos).'],
    fallos: ['Convertirlo en una sesión dura en semana de partido.'],
  },
  'bici-de-asalto-o-trineo-20-seg-a-tope-40-seg-suave': {
    t: 'HIIT: bici de asalto o trineo 20/40', cat: 'Acondicionamiento (RSA, circuitos, HIIT)',
    que: 'HIIT (intervalos de alta intensidad): 20 s a tope y 40 s muy suave, 10 rondas. Sube la capacidad para esfuerzos repetidos con bajo impacto.',
    como: ['Calienta 5-8 min.', '20 s a máxima potencia, 40 s de pedaleo o paso muy suave.', '10 rondas con el cronómetro ⏱.', 'Anota cuántas rondas completaste manteniendo la potencia.'],
    fallos: ['Ir al 70% en todas: la gracia es que los 20 s sean máximos.', 'Descansar parado: en los 40 s sigue moviéndote suave.'],
    para: 'Para si hay mareo, náuseas intensas o dolor en el pecho.',
  },
  'amrap-limpieza-de-ruck-placaje-bear-crawl-burpee-trineo': {
    t: 'Circuito AMRAP "fatiga de partido"', cat: 'Acondicionamiento (RSA, circuitos, HIIT)',
    que: 'AMRAP significa "tantas rondas como puedas" en un tiempo fijo. Reproduce la fatiga real de partido: ruck, placajes, suelo y esfuerzos repetidos.',
    como: [
      'Cada ronda: 5 limpiezas de ruck con saco pesado, 4 placajes al saco (te levantas del suelo cada vez), 10 m de bear crawl, 6 burpees con salto y 15 m de trineo ligero rápido.',
      '30 s de pausa entre rondas: es el ritmo de partido.',
      'Pon el cronómetro AMRAP (la duración depende de tu semana en Condición).',
      'Pulsa +1 RONDA en el cronómetro cada vez que acabes una. Anota las rondas (admite medias, p. ej. 7,5).',
    ],
    fallos: ['Salir al máximo y no poder mantener el ritmo.', 'Placajes con choque excesivo contra el saco: técnica, no golpe.'],
    alt: 'Si hay molestias de rodilla, sustituye los burpees con salto por burpees sin salto.',
    para: 'Para si hay mareo, dolor en el pecho o dolor articular agudo.',
  },

  // ---------------- Cardio y pasos ----------------
  'cardio-z2-bajo-impacto': {
    t: 'Zona 2 sin impacto', cat: 'Cardio y pasos',
    que: 'Cardio a ritmo conversacional. Construye la base aeróbica que te ayuda a recuperarte entre sprints y gasta grasa sin cargar articulaciones.',
    como: ['Bici, elíptica o caminata inclinada.', 'Ritmo en el que puedes hablar en frases completas (orientativamente 125-140 lpm).', 'Mantén el ritmo constante 35-60 min.', 'Anota minutos (MIN) y distancia (KM).'],
    fallos: ['Convertirla en una sesión dura: si no puedes hablar, vas demasiado rápido.', 'Añadir saltos o carrera si te dolían las articulaciones.'],
  },
  'cardio-z1-recuperacion': {
    t: 'Cardio de recuperación (Zona 1)', cat: 'Cardio y pasos',
    que: 'Cardio muy suave el día después del partido: baja la fatiga mejor que quedarte quieto.',
    como: ['Bici o remo muy suave 20 min.', 'Pulso por debajo de ~120 lpm.', 'Anota minutos y distancia.'],
    fallos: ['Subir el ritmo porque te encuentras bien.'],
  },
  'pasos-del-dia': {
    t: 'Pasos del día (NEAT)', cat: 'Cardio y pasos',
    que: 'NEAT es el gasto de la vida diaria fuera del entreno. Es la palanca de déficit con menos fatiga: andar no te quita recuperación.',
    como: ['Cuenta los pasos con el móvil o un reloj.', 'Al final del día, anota el total (PASOS).', 'Objetivo orientativo: 8.000-10.000. En días de descanso, algo más.', 'Truco: 10 min andando después de cada comida.'],
    fallos: ['Compensar un día flojo con una sesión extra de cardio: añade fatiga.'],
  },

  // ---------------- Descanso y partido ----------------
  'descanso-absoluto': {
    t: 'Descanso absoluto', cat: 'Descanso y partido',
    que: 'El entrenamiento solo funciona si te recuperas. Hoy el músculo y el sistema nervioso se reparan.',
    como: ['Duerme 7-9 h.', 'Hidrátate y respeta tus comidas.', 'Si quieres moverte, camina o haz movilidad suave opcional.'],
    fallos: ['Añadir una sesión "porque te sientes bien".'],
  },
  'sin-sesion-descanso-total': {
    t: 'Sin sesión · descanso total (pre-partido)', cat: 'Descanso y partido',
    que: 'El día antes del partido: llegar fresco es la prioridad.',
    como: ['No entrenes.', 'Come carbohidrato y bebe agua.', 'Duerme bien.'],
    fallos: ['Hacer un entreno "suave" que acaba cansándote.'],
  },
  'descanso-activo': {
    t: 'Descanso activo', cat: 'Descanso y partido',
    que: 'Descanso con movimiento muy suave.',
    como: ['Caminar o movilidad suave sin fatiga.', 'Opcionalmente 30 min de Zona 2 sin impacto.'],
    fallos: ['Hacerlo a ritmo de entrenamiento.'],
  },
  'descanso-o-sesion-ligera-extra': {
    t: 'Descanso o sesión ligera extra', cat: 'Descanso y partido',
    que: 'Domingo de semana libre: puedes descansar del todo o hacer algo suave.',
    como: ['Descanso o movilidad suave.', 'Si haces algo, que no deje fatiga.'],
    fallos: ['Meter una sesión dura: interferirá con el lunes.'],
  },
  'partido': {
    t: 'Partido', cat: 'Descanso y partido',
    que: 'Día de partido: el objetivo es rendir.',
    como: ['Come hidrato 3 h antes y bebe agua.', 'Calienta bien: movilidad, progresiones y activación de cuello.', 'Después del partido, come proteína e hidrato y descansa.'],
    fallos: ['Llegar sin comer o sin hidratarte.'],
  },
};

// Respaldo por tipo de bloque (si un ejercicio no tuviera ficha propia)
const GUIDE_TIPOS = {
  fuerza: { que: 'Ejercicio de fuerza con barra o mancuernas.', como: ['Calienta con series ligeras (botón + Calentamiento).', 'Controla la bajada y sube con intención.', 'Deja 1-2 repeticiones en reserva.'], fallos: ['Ir al fallo: en esta fase pesa más la recuperación que la marca.'] },
  potencia: { que: 'Ejercicio de potencia: pocas repeticiones, máxima velocidad.', como: ['Peso o carga ligera-moderada.', 'Cada repetición a máxima velocidad.', 'Descansa lo suficiente para mantener la calidad.'], fallos: ['Cargar de más y perder velocidad.'] },
  sprint: { que: 'Sprint corto para trabajar velocidad.', como: ['Calienta bien.', 'Esfuerzo máximo.', 'Descanso completo entre repeticiones.'], fallos: ['Descansar poco.'] },
  rsa: { que: 'Sprints repetidos con poca recuperación.', como: ['Sprint máximo, recuperación activa corta.', 'Anota el tiempo de cada sprint.'], fallos: ['No ir al máximo.'] },
  hiit: { que: 'Intervalos de alta intensidad.', como: ['Trabajo máximo y descanso muy suave.', 'Usa el cronómetro ⏱.'], fallos: ['No dar el máximo en los intervalos.'] },
  metcon: { que: 'Acondicionamiento metabólico con descansos cortos.', como: ['Mantén un ritmo que puedas sostener.', 'Usa el cronómetro ⏱.'], fallos: ['Salir demasiado fuerte.'] },
  cardio: { que: 'Cardio continuo a ritmo controlado.', como: ['Ritmo conversacional.', 'Anota minutos y distancia.'], fallos: ['Ir demasiado rápido.'] },
  core: { que: 'Trabajo de core.', como: ['Control del movimiento y respiración.'], fallos: ['Perder la posición por cansancio.'] },
  primera_linea: { que: 'Trabajo específico de primera línea: cuello, agarre o melé.', como: ['Posición correcta antes que intensidad.', 'Calienta el cuello.'], fallos: ['Forzar con la técnica perdida.'], para: 'Para ante dolor cervical, hormigueo o mareo.' },
  movilidad: { que: 'Movilidad para mantener el rango de movimiento.', como: ['Suave, respirando.'], fallos: ['Forzar con dolor.'] },
  tecnica: { que: 'Trabajo técnico.', como: ['Calidad antes que intensidad.'], fallos: ['Hacerlo con prisa.'] },
  neat: { que: 'Pasos diarios fuera del entreno.', como: ['Anota el total al final del día.'], fallos: [] },
  partido: { que: 'Día de partido.', como: ['Come, hidrátate y calienta bien.'], fallos: [] },
  descanso: { que: 'Día de recuperación.', como: ['Descansa, duerme y come bien.'], fallos: [] },
};

// Cómo se rellena cada tipo de registro
const LOG_HELP = {
  peso_reps: 'Escribe KG y REPS de cada serie y toca ✓. "ANTERIOR" muestra la misma serie de tu última sesión. Si tocas ✓ con la serie vacía, se copian los valores anteriores.',
  distancia_duracion: 'Escribe los MIN y los KM de la sesión (si no mides la distancia, deja KM vacío). Es un registro de volumen: no cuenta como PR.',
  duracion: 'Escribe el tiempo que has aguantado o trabajado (SEG o MIN, según indique la columna).',
  reps: 'Escribe las repeticiones de cada serie.',
  pasos: 'Escribe los pasos totales del día. Se suman si añades más de una fila. No cuenta como PR.',
  sprints: 'Escribe el tiempo de cada sprint en SEG (admite decimales, p. ej. 1,95). Aquí MEJOR = MENOS tiempo: un PR es bajar tu mejor marca.',
  saltos: 'Escribe la altura en CM y las REPS. En el salto al cajón, la altura del cajón.',
  rondas: 'Escribe las rondas completadas (admite medias, p. ej. 7,5).',
  peso_metros: 'Escribe los KG totales (trineo + discos) y los METROS recorridos.',
};

const TIMER_MODE_HELP = {
  intervals: 'Intervalos: trabajas el tiempo de TRABAJO, descansas el de DESCANSO y repites las RONDAS. Antes de empezar hay 10 s de preparación.',
  emom: 'EMOM: al inicio de cada minuto (o cada X segundos) haces la tarea y descansas lo que te sobre. Suena un pitido en cada cambio.',
  amrap: 'AMRAP: tienes un tiempo fijo y haces tantas rondas como puedas. Pulsa +1 RONDA cada vez que acabes una.',
  rest: 'Descanso: cuenta atrás simple para recuperar entre series (suena al acabar).',
};

// ---------------------------------------------------------------------------
// SECCIONES DE LA GUÍA
// bloques: {p}, {h}, {ul}, {ol}, {kv:[[k,v]]}, {note}, {warn}, {dyn}
// ---------------------------------------------------------------------------
const GUIDE_SECTIONS = [
  {
    id: 'empezar', icon: '🚀', title: 'Empezar: tu día a día en 7 pasos',
    body: [
      { p: 'Esta guía está dentro de la app y funciona sin conexión. Ábrela siempre con el botón ? de arriba, busca una palabra en el buscador, o toca ⓘ en cualquier ejercicio para ver cómo se hace.' },
      { ol: [
        'Abre HOY: te muestra el entreno del día según el tipo de semana (T1 a T5) que corresponde a tu calendario.',
        'Calienta y haz los bloques en orden. En cada ejercicio rellena la serie y toca ✓.',
        'Si el ejercicio tiene el botón ⏱, púlsalo: abre el cronómetro ya configurado (RSA, HIIT, EMOM, AMRAP).',
        'Durante el día, apunta lo que comes en NUTRICIÓN y compárate con tu objetivo de calorías.',
        'Por la mañana, en ayunas, pésate y guarda el peso en NUTRICIÓN.',
        'Una vez por semana, rellena PROGRESO (medidas, sprints, sensaciones) y haz una copia de seguridad.',
        'Si has completado una semana T1 sin dolor, avanza una semana en CONDICIÓN.',
      ]},
      { note: 'Las flechas ◀ ▶ de arriba cambian de día: así puedes rellenar un día anterior o mirar el entreno de mañana.' },
    ],
  },
  {
    id: 'pestanas', icon: '🧭', title: 'Qué hace cada pestaña',
    body: [
      { kv: [
        ['🏋️ Hoy', 'Entreno del día, mensaje de motivación, tip, cuenta atrás al partido y un resumen de tus calorías (toca el resumen para ir a Nutrición).'],
        ['📋 Semana', 'Los 7 días de la semana en desplegables. Toca un día para ver y registrar su entreno.'],
        ['📅 Calendario', 'Mes completo con el color del tipo de semana. Aquí añades, editas o borras partidos y marcas semanas libres. Toca un día y pulsa "Ver el entreno de este día".'],
        ['🍽️ Nutrición', 'Objetivo de calorías del día, registro de comidas, peso diario, balance entre lo que comes y lo que pesas, historial y datos editables.'],
        ['⚡ Condición', 'Progresión de 8 semanas de RSA, circuito y saltos, y tus marcas personales (10 m, RSA, CMJ).'],
        ['📈 Progreso', 'Registro semanal (peso, grasa, sprints, CMJ...), gráficas, puntuación muscular, historial y copia de seguridad.'],
        ['⏱ Cronómetro', 'Botón flotante abajo a la derecha. Tabata, intervalos, EMOM, AMRAP y descansos.'],
        ['🌙 Tema', 'Botón de arriba: cambia entre oscuro, alto contraste (gimnasio) y claro (exterior).'],
        ['? Ayuda', 'Esta guía.'],
      ]},
    ],
  },
  {
    id: 'semanas', icon: '📅', title: 'Tipos de semana T1 a T5 y cómo se deciden',
    body: [
      { p: 'La app calcula sola el tipo de cada semana a partir de los partidos que tienes en el Calendario. El tipo cambia el entreno y también las calorías.' },
      { kv: [
        ['T1 · Desarrollo', 'Semana sin partido y sin venir de jugar. Es la semana "completa" de entrenamiento, con RSA el miércoles y circuito el sábado. Aquí avanza la progresión de Condición.'],
        ['T2 · Semana de partido', 'Hay partido de liga (o amistoso en sábado/domingo). Menos volumen y más calidad: el miércoles es el día duro, el viernes activación y el sábado descanso.'],
        ['T3 · Post-partido', 'No hay partido esta semana pero jugaste la anterior. El lunes es de recuperación (MD+1) y el resto sigue la estructura de T1.'],
        ['T4 · Semana libre', 'Nadie juega y la has marcado a mano. Como T1, pero el jueves es de Zona 2 larga y el domingo es libre.'],
        ['T5 · Eliminatoria', 'Semifinal o final. Como T2, con RSA corto el miércoles y solo activación el jueves. Las calorías suben a mantenimiento.'],
      ]},
      { h: 'En qué orden decide la app' },
      { ol: [
        'Si marcaste la semana como "libre" y no hay partido, es T4.',
        'Si hay una eliminatoria (semifinal/final), es T5.',
        'Si hay partido de liga, es T2.',
        'Si hay un amistoso en sábado o domingo, es T2. Si es entre semana, la estructura no cambia (T1, o T3 si venías de jugar) y el partido se añade debajo del entreno de la mañana.',
        'Si la semana anterior tuvo partido y esta no, es T3.',
        'Si nada de lo anterior, es T1.',
      ]},
      { note: 'Para cambiar algo: Calendario → toca el día → "Añadir partido" (o editar/eliminar). Para una semana sin partidos ni entreno de equipo, marca "Marcar TODA esta semana como libre".' },
    ],
  },
  {
    id: 'plan', icon: '🎯', title: 'Por qué este plan (la fase de definición)',
    body: [
      { p: 'Objetivo de la fase: bajar grasa para mejorar tu ratio potencia-peso, y ganar velocidad de salida, potencia de contacto y capacidad de repetir esfuerzos. Aceptas perder algo de masa muscular a cambio de moverte más rápido.' },
      { h: 'Las tres cualidades que se entrenan' },
      { kv: [
        ['Velocidad y explosividad', 'Salidas de 10 m, saltos, tirones olímpicos y lanzamientos. Se hacen frescos y con descansos largos: la calidad es lo que importa.'],
        ['Work rate (RSA)', 'Repetir sprints con poca recuperación y circuitos con descansos cortos: levantarte rápido del suelo y encadenar fases sin caerte.'],
        ['Agresividad y densidad', 'Circuito de fatiga de partido (rucks, placajes, melé), trineo pesado y rápido, y trabajo isométrico de cuello y core.'],
      ]},
      { h: 'Reglas que atraviesan todo el plan' },
      { ul: [
        'Calidad antes que cantidad en sprints y saltos. Si el tiempo o la altura empeoran claramente, la serie ya cumplió.',
        'Velocidad = descanso completo. Resistencia (RSA/circuitos) = descanso corto controlado.',
        'La fuerza se mantiene (3x3 sin fallo), no se persigue.',
        'El cardio base (Zona 2) es sin impacto para cuidar tus articulaciones.',
        'Los pasos del día son el déficit "gratis": no añaden fatiga.',
      ]},
      { h: 'Qué puedes esperar' },
      { ul: [
        'El peso debería bajar alrededor de 0,7-1,2 kg a la semana.',
        'Tu fuerza máxima puede bajar algo: es normal en déficit y asumido en esta fase.',
        'Tus tiempos de 10 m, tu CMJ y tu RSA deberían mantenerse o mejorar. Si empeoran dos semanas seguidas, revisa sueño y calorías.',
      ]},
      { h: 'Semana T1 por días' },
      { kv: [
        ['Lunes', 'Aceleración 0-10 m, saltos y fuerza de mantenimiento.'],
        ['Martes', 'Potencia de tren superior y cuello (entreno de equipo de noche).'],
        ['Miércoles', 'RSA y circuito de densidad: el día duro.'],
        ['Jueves', 'Zona 2 sin impacto e isométricos (entreno de equipo de noche).'],
        ['Viernes', 'Full-body de potencia, trineo pesado, melé y HIIT.'],
        ['Sábado', 'Circuito "fatiga de partido".'],
        ['Domingo', 'Descanso.'],
      ]},
      { h: 'Si no puedes hacer todo' },
      { p: 'Prioridad si vas justo: 1) RSA del miércoles, 2) aceleración y potencia del lunes, 3) full-body del viernes, 4) circuito del sábado, 5) resto. No recuperes un día perdido duplicando otro: simplemente sigue con el siguiente.' },
    ],
  },
  {
    id: 'tarjeta', icon: '🧾', title: 'Cómo leer y rellenar una tarjeta de ejercicio',
    body: [
      { kv: [
        ['SERIE', 'Número de la serie. La "C" es una serie de calentamiento.'],
        ['ANTERIOR', 'Lo que hiciste en esa misma serie la última vez. Es tu referencia para mejorar.'],
        ['Campos (KG, REPS, SEG...)', 'Escribe lo que has hecho. La columna indica la unidad.'],
        ['✓', 'Marca la serie hecha. Si la serie está vacía, copia los valores de la vez anterior (útil cuando repites exactamente lo mismo).'],
        ['+ Calentamiento', 'Añade una serie de calentamiento (solo en ejercicios de peso). No cuenta para PR ni mejor marca.'],
        ['+ Serie', 'Añade una serie extra.'],
        ['− Quitar última', 'Quita la última fila (pide confirmación si tiene datos).'],
        ['🏆 Nuevo PR', 'Aparece si superas tu mejor marca anterior. Empatar no cuenta. En sprints, el PR es bajar el tiempo.'],
        ['Mejor marca', 'Tu mejor marca histórica antes de hoy.'],
        ['Gráfica de progreso', 'Evolución de ese ejercicio sesión a sesión.'],
        ['ⓘ', 'Despliega la ficha del ejercicio: qué es, cómo se hace, errores típicos y cuándo parar.'],
      ]},
      { h: 'Qué se anota en cada tipo de ejercicio' },
      { dyn: 'logHelp' },
      { note: 'Tus datos se guardan solos al salir de cada campo. No hace falta ningún botón de guardar.' },
    ],
  },
  {
    id: 'ejercicios', icon: '📖', title: 'Ejercicios A-Z: cómo se hace cada uno',
    body: [
      { p: 'Fichas de todos los ejercicios del plan, agrupadas por categoría. También las ves con el botón ⓘ dentro de cada tarjeta.' },
      { dyn: 'exercises' },
    ],
  },
  {
    id: 'nutricion-calculo', icon: '🧮', title: 'Nutrición: cómo se calcula tu objetivo',
    body: [
      { p: 'Todos los números salen de tus datos de la pestaña Nutrición (abajo del todo, "Datos"). Son estimaciones: úsalas como punto de partida y ajústalas con tu peso real.' },
      { kv: [
        ['BMR', 'Metabolismo basal: lo que gastas en reposo. Fórmula Mifflin-St Jeor: 10 × peso + 6,25 × altura − 5 × edad + 5.'],
        ['TDEE', 'Gasto total diario = BMR × factor de actividad. Es lo que comes para mantener tu peso.'],
        ['Déficit', 'Porcentaje que se resta al TDEE en semanas de déficit. Ese resultado es la kcal base.'],
        ['Tope de kcal', 'Límite máximo en semanas de déficit. Si el cálculo da más, manda el tope.'],
        ['Mantenimiento', 'En T5 (y en T3 si desactivas el déficit) las kcal son tu TDEE: sin déficit.'],
        ['Ciclado por carga del día', 'La kcal base se reparte según el día: alta +6% (RSA, circuito, HIIT, sprints, día previo al partido), media 0% (fuerza/potencia), baja −12% (descanso/Z2), partido +12%. En mantenimiento no se aplica.'],
        ['Proteína', '≈2,35 g por kg de tu masa libre de grasa (MLG), fija cada día.'],
        ['Grasas', '≈0,7 g por kg de peso. En días de pocas kcal baja hasta 0,5 g/kg para dejar un mínimo de 100 g de hidratos.'],
        ['Hidratos', 'Lo que queda de calorías tras proteína y grasa, con un suelo de 100 g.'],
        ['Pérdida semanal', '(TDEE − kcal base) × 7 ÷ 7.700 kcal por kg de grasa. Es teórica: la real depende de cómo registres y de la retención de agua.'],
      ]},
      { warn: 'La app te avisa si la kcal base queda por debajo de tu BMR o si el ritmo teórico supera ~1,2% de tu peso por semana. No son avisos decorativos: comer muy poco con muchas sesiones cobra factura en rendimiento, sueño y lesiones.' },
      { h: 'Tus números de hoy' },
      { dyn: 'nutri' },
    ],
  },
  {
    id: 'nutricion-uso', icon: '📝', title: 'Registro diario de calorías: cómo usarlo',
    body: [
      { ol: [
        'Ve a Nutrición. Arriba verás el día (cámbialo con ◀ ▶ para registrar días anteriores).',
        'Escribe las calorías de lo que has comido. El nombre y los macros (proteína, hidratos, grasa) son opcionales.',
        'Si solo pones macros, la app calcula las kcal (proteína y carbo ×4, grasa ×9).',
        'Pulsa Añadir. Puedes editar (✎) o borrar (✕) cada comida.',
        'Los botones +100/+250/+500 añaden una ingesta rápida. "Recientes" repite una comida con un toque.',
      ]},
      { h: 'La barra de calorías' },
      { kv: [
        ['Verde', 'Hasta el 100% del objetivo del día.'],
        ['Ámbar', 'Entre el 100% y el 105%.'],
        ['Rojo', 'Te has pasado más del 5%.'],
      ]},
      { h: 'El historial de 14 días' },
      { kv: [
        ['✓ Cumplido', 'Entre el 85% y el 103% del objetivo.'],
        ['↓ Por debajo', 'Menos del 85%. No es "mejor": comer muy por debajo recorta rendimiento y hace más difícil mantener el plan.'],
        ['↑ Pasado', 'Más del 103%.'],
        ['Racha', 'Días seguidos cumplidos.'],
        ['Grasa teórica 7d', 'Déficit acumulado de los últimos 7 días ÷ 7.700.'],
      ]},
      { note: 'Cada día guarda el objetivo con el que se registró. Si cambias tus datos después, los días pasados no se reescriben.' },
      { warn: 'La app rechaza una ingesta de más de 6.000 kcal: casi siempre es un error de tecleo.' },
    ],
  },
  {
    id: 'peso', icon: '⚖️', title: 'Peso diario y balance',
    body: [
      { ul: [
        'Pésate por la mañana, en ayunas y después de ir al baño, siempre en la misma báscula.',
        'Guarda el peso en Nutrición. Se actualizan solos tu peso de BMR/TDEE y el peso semanal de Progreso.',
        'La media de 7 días suaviza las subidas y bajadas de agua. Mira la media, no el número de hoy.',
        'La tendencia de 14 días es la pérdida real en kg a la semana.',
      ]},
      { h: 'La tarjeta "Balance"' },
      { p: 'Compara lo que has perdido de verdad con lo que debería haber salido por tu déficit. Te dice si vas demasiado rápido, en ritmo o estancado.' },
      { kv: [
        ['Demasiado rápido (>1,2% del peso/semana)', 'Sube 150-250 kcal. Perder más rápido que eso suele costar potencia y músculo.'],
        ['En ritmo', 'No cambies nada.'],
        ['Lento con 4+ días registrados', 'Revisa porciones, aceites, fines de semana y pasos antes de recortar más.'],
        ['Sin datos', 'Pésate al menos 3 días en una semana y registra tus comidas.'],
      ]},
      { note: 'Es normal que un día la báscula suba 1 kg o más (sal, comida, hidratos, agua). No cambies el plan por un solo día.' },
    ],
  },
  {
    id: 'comer', icon: '🥗', title: 'Qué comer: protocolo práctico',
    body: [
      { kv: [
        ['Proteína fija', 'Reparte tu proteína en 4-5 tomas de 35-50 g. Ejemplos: pollo, pavo, pescado, huevos y claras, atún, yogur proteico, queso fresco batido, legumbres, tofu.'],
        ['Hidrato donde se usa', 'Concéntralo en las 3 h antes y las 2 h después de RSA, circuito, HIIT y partido: arroz, patata, pan, avena, fruta. En días de descanso o Z2, menos.'],
        ['Grasa moderada', 'Aceite de oliva medido, frutos secos en cantidad controlada. Es lo que más fácil se pasa de calorías sin darte cuenta.'],
        ['Volumen y saciedad', 'Verdura, sopas, ensaladas y fruta entera. Empieza el plato por la proteína.'],
        ['Hidratación', '35-40 ml de agua por kg de peso al día. Más con doble sesión o calor.'],
        ['Día de partido', 'Comida rica en hidrato unas 3 h antes, agua durante el día y, al terminar, proteína + hidrato.'],
        ['Día de recarga', 'Cada 10-14 días de déficit, un día a mantenimiento (mejor si coincide con tu día más duro).'],
      ]},
      { h: 'Errores típicos al registrar' },
      { ul: [
        'Pesar crudo y registrar cocinado (o al revés). Elige uno y mantenlo.',
        'No contar el aceite, las salsas y las bebidas.',
        'Los picoteos: un puñado de frutos secos son ~150-200 kcal.',
        'Registrar al final del día de memoria: mejor registra cuando comes.',
      ]},
      { note: 'Un error de 300 kcal al día es el 15% de tu déficit. Registrar bien vale más que recortar más.' },
    ],
  },
  {
    id: 'cronometro', icon: '⏱', title: 'Cronómetro: Tabata, EMOM, AMRAP, intervalos y descansos',
    body: [
      { p: 'El botón flotante ⏱ (abajo a la derecha) abre el cronómetro. Cuando un ejercicio tiene ⏱ en su tarjeta, al pulsarlo se abre ya configurado.' },
      { kv: [
        ['Intervalos', 'Trabajo / descanso / rondas. Antes de empezar hay 10 s de preparación. Ejemplo: Tabata = 20 s trabajo, 10 s descanso, 8 rondas.'],
        ['EMOM', 'Cada minuto (o cada X s) haces la tarea y descansas lo que sobre. Suena un pitido en cada cambio.'],
        ['AMRAP', 'Tiempo fijo, tantas rondas como puedas. Pulsa +1 RONDA al terminar cada una (−1 si te equivocas).'],
        ['Descanso', 'Cuenta atrás para recuperar entre series (1:00, 1:30, 2:00, 3:00 o el que pongas).'],
      ]},
      { h: 'Controles' },
      { kv: [
        ['▶ Iniciar', 'Empieza (con 10 s de preparación en los modos con rondas).'],
        ['Pausa / ▶ Seguir', 'Congela el tiempo y lo retoma sin saltos.'],
        ['⏮ ⏭', 'Salta a la fase anterior o siguiente.'],
        ['■ Parar', 'Cancela (pide confirmación).'],
        ['✕', 'Cierra la pantalla pero el cronómetro SIGUE. El botón flotante muestra el tiempo.'],
        ['🔔 / 🔕', 'Activa o silencia el sonido. La vibración sigue activa si tu móvil la permite.'],
      ]},
      { h: 'Sonido y avisos' },
      { ul: [
        'Pitido largo al empezar trabajo, doble corto al empezar descanso, y 3 pitidos cortos en los últimos 3 s.',
        'Tres pitidos al terminar y pantalla azul con "¡HECHO!".',
        'Colores: rojo = trabajo, verde = descanso, ámbar = preparación, azul = terminado.',
      ]},
      { note: 'El cronómetro mide contra el reloj del móvil, así que no se desfasa aunque el sistema lo ralentice. Intenta mantener la pantalla encendida; si tu móvil o navegador no lo permite, depende del ajuste de apagado de pantalla.' },
    ],
  },
  {
    id: 'condicion', icon: '⚡', title: 'Condición: progresión de 8 semanas',
    body: [
      { p: 'Cada semana tiene una pauta de RSA (el miércoles), de circuito (el sábado) y de contactos de salto. La pauta de la semana actual aparece sola dentro de la tarjeta del ejercicio.' },
      { ul: [
        'Avanza una semana solo cuando hayas completado una semana T1 sin dolor y con tiempos estables.',
        'Las semanas T2, T3, T4 y T5 NO hacen avanzar la progresión.',
        'Si notas dolor de rodilla, tobillo o espinilla, o los sprints empeoran, usa "Repetir semana anterior".',
        'La semana 4 es de descarga a propósito. No la saltes.',
        'La semana 8 es de tests: mide tiempo medio y caída del RSA, AMRAP de 20 min y mejor CMJ de 3 intentos.',
      ]},
      { h: 'Tus marcas' },
      { p: 'La tarjeta "Tus marcas" resume tu mejor tiempo de 10 m, tu mejor sprint de RSA y tu mejor CMJ, a partir de lo que registras.' },
      { warn: 'Con tu peso, cada contacto (salto o sprint) carga mucho las articulaciones. Por eso los contactos suben despacio. No añadas saltos extra por tu cuenta.' },
    ],
  },
  {
    id: 'progreso', icon: '📈', title: 'Progreso: el registro semanal',
    body: [
      { ul: [
        'Una vez por semana rellena lo que tengas: peso, grasa corporal, músculo, TDEE/BMR si tu báscula los da, sprints, RSA y CMJ.',
        '"Rellenar con mis registros de la semana" copia el peso, las kcal medias y los pasos medios que ya has registrado.',
        'La puntuación muscular (0-10) es subjetiva: valora cómo sientes cada zona. Sirve para ver tendencias, no para compararte.',
        'Las gráficas se dibujan cuando tienes al menos 2 registros.',
      ]},
      { h: 'Cómo medir sprints y CMJ' },
      { ul: [
        'Sprint: cronómetro manual o fotocélulas, siempre con el mismo método y la misma superficie.',
        'CMJ: app de salto, tapete de contacto o una marca en la pared. Manos en cadera, siempre igual.',
        'Compara solo con mediciones hechas igual.',
      ]},
      { note: 'Aquí está también la copia de seguridad: úsala antes de reinstalar la app o cambiar de móvil.' },
    ],
  },
  {
    id: 'glosario', icon: '🔤', title: 'Glosario',
    body: [
      { kv: [
        ['1RM', 'La carga máxima con la que puedes hacer 1 repetición.'],
        ['AMRAP', 'As Many Rounds As Possible: tantas rondas como puedas en un tiempo fijo.'],
        ['BMR', 'Metabolismo basal: calorías que gastas en reposo.'],
        ['CMJ', 'Countermovement Jump: salto vertical con contramovimiento. Mide potencia y fatiga.'],
        ['Concéntrico / excéntrico', 'Fase de subida (concéntrica) y de bajada (excéntrica) de un ejercicio.'],
        ['Déficit calórico', 'Comer menos de lo que gastas para perder peso.'],
        ['EMOM', 'Every Minute On the Minute: cada minuto empiezas una tarea.'],
        ['HIIT', 'Entrenamiento por intervalos de alta intensidad.'],
        ['Isométrico', 'Mantener una posición sin mover la articulación.'],
        ['Kcal base', 'Calorías del día antes del ciclado según carga.'],
        ['Mantenimiento', 'Comer lo que gastas (TDEE): ni déficit ni superávit.'],
        ['MD+1', 'Match Day +1: el día después del partido.'],
        ['MLG', 'Masa libre de grasa: todo lo que pesas menos la grasa.'],
        ['Melé (scrum)', 'Formación fija de empuje de los delanteros.'],
        ['NEAT', 'Gasto por actividad fuera del entreno (pasos, moverte).'],
        ['Pilar / talonador', 'Posiciones de primera línea: el talonador va en el centro, los pilares a los lados.'],
        ['PR', 'Personal Record: tu mejor marca.'],
        ['RSA', 'Repeated Sprint Ability: capacidad de repetir sprints con poca recuperación.'],
        ['Ruck', 'Formación tras un placaje en el suelo para disputar el balón.'],
        ['TDEE', 'Gasto energético total diario.'],
        ['Zona 2', 'Cardio a ritmo conversacional, ~125-140 lpm orientativamente.'],
        ['T1 a T5', 'Tipos de semana de la app: ver "Tipos de semana".'],
      ]},
    ],
  },
  {
    id: 'seguridad', icon: '🛑', title: 'Seguridad: cuándo parar y qué vigilar',
    body: [
      { warn: 'Esta app no sustituye a un médico, fisioterapeuta ni dietista. Si tienes dudas de salud o llevas un déficit largo y agresivo, consúltalo con un profesional.' },
      { h: 'Para el entreno y pide ayuda si notas' },
      { ul: [
        'Dolor en el pecho, falta de aire anormal, mareo intenso o desmayo.',
        'Dolor agudo o punzante en una articulación (no el cansancio muscular normal).',
        'Tirón muscular en isquios, gemelos o aductores.',
        'Hormigueo en los brazos, dolor o presión en el cuello (sobre todo en melé y puentes de cuello).',
        'Dolor lumbar que baja por la pierna.',
      ]},
      { h: 'Señales de que el déficit es demasiado grande' },
      { ul: [
        'Tus tiempos de sprint o CMJ empeoran dos semanas seguidas.',
        'Duermes peor, estás irritable o te lesionas más.',
        'Pierdes más de ~1,2% de tu peso por semana.',
        'Hambre constante y obsesión con la comida.',
      ]},
      { p: 'En esos casos sube 150-250 kcal, haz un día de mantenimiento o descansa un par de días. Bajar de peso más despacio y rendir es mejor que bajar rápido y lesionarte.' },
      { h: 'Siempre' },
      { ul: ['Calienta antes de sprints, saltos y contacto.', 'Calienta el cuello antes de melé y puentes.', 'No añadas saltos o sprints extra por tu cuenta.'] },
    ],
  },
  {
    id: 'faq', icon: '❓', title: 'Preguntas frecuentes y problemas',
    body: [
      { kv: [
        ['Me salté un día. ¿Qué hago?', 'Sigue con el siguiente día del plan. No dupliques sesiones para recuperar. Mira "Si no puedes hacer todo" en el apartado del plan.'],
        ['Mi fuerza ha bajado. ¿Es normal?', 'Sí, en déficit es normal que baje algo, y lo has aceptado en esta fase. Preocúpate si bajan sprints o CMJ.'],
        ['El PR no aparece.', 'Solo aparece si superas estrictamente tu mejor marca anterior (empatar no cuenta). En sprints, bajar el tiempo. Cardio y pasos no tienen PR.'],
        ['La semana no coincide con mi calendario.', 'Revisa Calendario: partido de liga = T2, eliminatoria = T5, semana libre se marca a mano. Un amistoso entre semana no cambia la estructura.'],
        ['Cambié la fecha de un partido.', 'Calendario → toca el día del partido → editar o eliminar, y añade el nuevo en la fecha correcta.'],
        ['No llego a mis calorías.', 'Un día por debajo no pasa nada, pero muy por debajo (<85%) recorta rendimiento. Añade una toma o una fuente de hidrato en torno al entreno.'],
        ['Me paso de calorías.', 'Registra igualmente: es más útil saber lo que pasó. Compensa con pasos y sigue al día siguiente; no te saltes comidas.'],
        ['La báscula sube un día.', 'Es agua. Mira la media de 7 días y la tendencia de 14.'],
        ['Mi objetivo diario es muy distinto cada día.', 'Es el ciclado: más calorías e hidrato los días de RSA, circuito, HIIT y partido; menos los días de descanso o Z2.'],
        ['¿Puedo cambiar los datos de Nutrición?', 'Sí, abajo del todo en Nutrición, "Datos". Revisa especialmente edad, % de déficit y tope de kcal.'],
        ['¿Por qué dice que estoy por debajo del BMR?', 'Tu kcal base es menor que tu metabolismo basal estimado. Sube el tope o baja el % de déficit si notas fatiga.'],
        ['No sé mi 1RM.', 'Estima: un peso con el que harías 3 reps muy fáciles y rápidas para los ejercicios explosivos, y un peso con el que hagas 3 reps duras (sin fallo) para la fuerza.'],
        ['No tengo fotocélulas.', 'Cronómetro manual, siempre igual. Compara solo con mediciones hechas igual.'],
        ['El cronómetro no suena.', 'Mira que no esté en 🔕 y que el volumen del móvil esté subido. En algunos móviles el sonido empieza al pulsar Iniciar.'],
        ['El cronómetro se apaga con la pantalla.', 'Depende del móvil. Mantén la pantalla encendida o sube el tiempo de apagado.'],
        ['Perdí mis datos / cambié de móvil.', 'Restaura la copia de seguridad en Progreso. Si no hiciste copia, no se pueden recuperar. Haz una cada semana.'],
        ['Instalé el APK y está vacío.', 'La APK es una app distinta de la PWA de Chrome: los datos no se pasan solos. Copia la copia de seguridad desde la PWA y restáurala en el APK.'],
        ['Quiero cambiar un ejercicio.', 'Los ejercicios están en js/data.js. Edita el nombre, series o detalle y recompila.'],
        ['Hay un error que no entiendo.', 'Haz una copia de seguridad y guarda una captura. Si la app falla, actualiza la caché cerrándola y abriéndola dos veces.'],
      ]},
    ],
  },
  {
    id: 'datos', icon: '💾', title: 'Datos, copia de seguridad y actualizaciones',
    body: [
      { ul: [
        'Todo se guarda en tu dispositivo. No hay cuenta ni nube.',
        'La copia de seguridad (en Progreso, al final) copia todo: series, partidos, comidas, pesos, nutrición, ajustes.',
        'Guárdala fuera de la app (nota, mail, chat contigo mismo) antes de reinstalar o cambiar de móvil.',
        'Para restaurar: pega el texto en la caja y pulsa "Restaurar desde el texto". Sustituye los datos actuales.',
      ]},
      { h: 'Actualizar la app' },
      { ul: [
        'PWA (Chrome): se actualiza sola al abrirla; a veces hace falta abrirla dos veces.',
        'APK: compila de nuevo (GitHub Actions o npm run sync). Para poder actualizar encima sin perder datos, firma siempre con la misma clave.',
      ]},
      { h: 'Temas' },
      { p: 'Oscuro (por defecto), Alto contraste (negro puro, texto más grande y botones más grandes, pensado para el gimnasio) y Claro (para exterior). Se cambia con el botón de arriba y se recuerda.' },
    ],
  },
];
