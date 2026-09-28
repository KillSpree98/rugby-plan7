# Plan Pilar — versión web/PWA

> Para generar la **app Android (APK)** lee `LEEME-APK.md`.

Es una PWA (web app instalable): HTML/CSS/JS puro, sin dependencias externas, con
todos los datos del plan ya integrados en el código. Funciona 100% offline una vez
cargada la primera vez. No hay backend, ni login, ni cuentas — todo se guarda en el
propio móvil (localStorage).

## 1. Súbela a un hosting con HTTPS (necesario para "Añadir a pantalla de inicio")

Android exige HTTPS para instalar una PWA de verdad (con icono propio y modo
standalone). La forma más rápida y gratuita:

**Opción A — GitHub Pages**
1. Crea un repositorio nuevo en GitHub y sube el contenido de esta carpeta tal cual
   (manteniendo la estructura de subcarpetas `css/`, `js/`, `icons/`).
2. En el repositorio: *Settings → Pages → Deploy from branch → main → /(root)*.
3. En 1-2 minutos tendrás una URL tipo `https://tu-usuario.github.io/tu-repo/`.

**Opción B — Netlify Drop**
1. Ve a https://app.netlify.com/drop
2. Arrastra la carpeta completa (o un ZIP con estos archivos).
3. Te da una URL HTTPS al instante.

Cualquier hosting de archivos estáticos sirve (Vercel, Cloudflare Pages, etc.),
lo único que necesitas es que se sirva por HTTPS y que se respete la estructura
de carpetas.

## 2. Instalar en el móvil Android

1. Abre la URL en **Chrome** en el móvil.
2. Chrome mostrará un aviso "Añadir Plan Pilar a la pantalla de inicio" (o pulsa
   el menú ⋮ → "Añadir a pantalla de inicio" / "Instalar app").
3. Confirma. Se crea un icono propio (el escudo con la "P") en tu pantalla de
   inicio, que abre la app directamente en la pantalla "Hoy", a pantalla completa
   y sin barra de navegador.
4. A partir de ahí funciona sin conexión: el service worker (`sw.js`) cachea
   todos los ficheros la primera vez que se abre.

## 3. Notas sobre los datos

- Todo el plan (calendario de 33 semanas, rutinas T1/T2/T4/T5, progresión de
  carrera, mensajes y tips) está escrito directamente en `js/data.js`. Si en
  algún momento cambia algo del plan (fechas, ejercicios...), se edita ese
  fichero y ya está — no hace falta rehacer la app.
- Los únicos datos que el usuario edita desde la propia app son: peso, altura,
  edad, masa libre de grasa, peso objetivo, factor de actividad y % de déficit
  (pestaña Nutrición), la semana de progresión de carrera (pestaña 10K), y el
  registro semanal de seguimiento (pestaña Seguimiento). Todo se guarda en el
  propio dispositivo.
- Regla de nutrición por semana: en las semanas **T3** (post-partido) y **T5**
  (semifinal/final) las calorías suben a mantenimiento (sin déficit). En **T1, T2
  y T4** se aplica el % de déficit configurado (19% por defecto). Se cambia en
  `weekIsMaintenance()` dentro de `js/app.js`.

## 4. Sistema de partidos y calendario (editable desde la app)

Los partidos (liga y amistosos) ya NO están fijos en el código: viven en `js/data.js`
solo como **semilla inicial** (`DEFAULT_MATCHES`), y desde la primera vez que abres la
app se copian a tu almacenamiento local, donde puedes añadir, editar o borrar partidos
libremente desde la pestaña **Calendario** (toca cualquier día del mes).

Reglas de cómo se calcula el tipo de semana (T1-T5), en este orden de prioridad:

1. Si esa semana la marcaste a mano como "descanso total" → **T4**.
2. Si hay un partido marcado como eliminatoria (semifinal/final) esa semana → **T5**.
3. Si hay un partido de **liga** esa semana (el día que sea, aunque se traslade a otro
   día distinto del domingo) → **T2**.
4. Si hay un **amistoso en sábado ó domingo** → **T2**. Si el amistoso es entre semana
   (lunes-viernes) → **T1** (o **T3** si la semana anterior tuvo partido). Ese día **se
   mantiene la rutina de la mañana** y el partido aparece añadido debajo como bloque
   "Partido". (Una liga trasladada entre semana, o un amistoso en sábado, sí sustituye
   el día entero por la tarjeta de partido.)
5. Si la semana anterior tuvo partido (liga, eliminatoria, o amistoso en sábado/domingo)
   pero esta semana no hay partido de fin de semana → **T3**: lunes MD+1 de
   recuperación (tren superior + cardio suave), martes día fuerte (pierna), miércoles
   cardio/resistencia, jueves día fuerte 2 + Z2, viernes fuerza + primera línea, sábado
   descanso ligero y domingo descanso (sin partido).
6. Si nada de lo anterior aplica → **T1**.

Si el motor se equivoca en algún caso raro, cada día tiene también un interruptor
manual de "semana de descanso total" en su panel de edición, que siempre gana sobre
el cálculo automático.

Al tocar un partido que ya se jugó (fecha pasada), aparece además la sección **"Cómo
te fue"**: titular o finalizador, minutos jugados, qué hiciste bien y qué mejorar —
todo guardado junto al partido.

## 5. Registro de series

En cada ejercicio de fuerza (peso x reps) hay tres botones: **+ Calentamiento** (fila
"C", va al principio y no cuenta para PR ni para "mejor marca"), **+ Serie** y
**− Quitar última** (puede bajar del nº de series prescritas; si la fila tiene datos,
pide confirmación).
