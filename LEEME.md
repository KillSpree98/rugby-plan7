# Plan Pilar · fase 2: definición, explosividad y ritmo de juego

> Para generar la **app Android (APK)** lee `LEEME-APK.md` (sigue igual).

PWA de HTML/CSS/JS puro, sin dependencias, 100% offline una vez cargada. Todo se guarda en
el propio móvil (`localStorage`). Esta fase cambia el objetivo: ya no se busca ganar fuerza
ni masa, sino **bajar grasa, llegar antes (0-10 m), pegar con potencia y repetir esfuerzos
(RSA) sin caerse**.

## 1. Cómo es la semana

El motor de semanas T1-T5 (partidos, semana libre, post-partido...) no ha cambiado: se
calcula solo desde la pestaña Calendario. Lo que cambia es el contenido.

**T1 · Desarrollo (sin partido)**

| Día | Sesión |
|---|---|
| Lun | Salidas de 10 m + trineo ligero + CMJ/cajón/salto con barra trampa + fuerza de mantenimiento (3x3) |
| Mar | Potencia de tren superior (banca explosiva, push press, balón medicinal) + cuello y agarre. Equipo de noche |
| Mié | **RSA** (12 sprints, bici si molestan las articulaciones) + circuito EMOM de densidad. El día duro |
| Jue | Zona 2 sin impacto + isométricos de melé y cuello. Equipo de noche |
| Vie | Full-body de potencia (tirón alto, trap bar) + trineo pesado + melé + HIIT 20/40 |
| Sáb | Circuito AMRAP "fatiga de partido": rucks, placajes levantándote, bear crawl, burpees, trineo |
| Dom | Descanso |

- **T2 (semana de partido)**: misma lógica con menos volumen; el miércoles es el día duro, el viernes activación y el sábado descanso.
- **T3 (post-partido)**: lunes MD+1 de recuperación y después la estructura T1.
- **T4 (semana libre)**: T1 con jueves de Zona 2 larga y domingo libre.
- **T5 (eliminatoria)**: como T2, con RSA corto el miércoles y solo activación el jueves.

Cada sesión incluye **pasos del día (NEAT)** y los ejercicios de RSA/circuito/HIIT llevan un
botón **⏱** que abre el cronómetro ya configurado.

La pestaña **Condición** sustituye a la antigua progresión 10K: 8 semanas de RSA, circuito y
contactos de salto. Avanza solo en semanas T1 y la pauta de la semana actual aparece sola en
la tarjeta del ejercicio. También recoge tus marcas (mejor 10 m, mejor sprint de RSA, mejor CMJ).

## 2. Nutrición y registro diario de calorías

- **Registro**: añade comidas con calorías y, si quieres, proteína/hidratos/grasa (si solo pones
  macros, las kcal se calculan 4/4/9). Toca *Rápido* (+100/+250/+500) o *Recientes* para repetir
  una comida. Puedes editar o borrar cada ingesta y registrar días anteriores con las flechas de fecha.
- **Barra de progreso** frente al objetivo del día (verde hasta el 100%, ámbar hasta el 105%, roja si te pasas) y barras de macros.
- **Historial de 14 días**: cumplido (85-103%), por debajo, pasado, racha, kcal media y grasa teórica
  perdida. Cada día conserva el objetivo con el que se registró aunque cambies después los datos.
- **Ciclado de carbohidratos**: las kcal se reparten según la carga del día (alta +6%, media, baja −12%,
  partido +12%; el día antes de un partido cuenta como alto). La proteína (≈2,35 g/kg de masa libre
  de grasa) y la grasa son fijas y el hidrato absorbe la diferencia, con un suelo de 100 g.
- **Peso diario**: se guarda, calcula media de 7 días y tendencia, y actualiza solo el peso de Nutrición
  (BMR/TDEE) y el de Progreso. Se cruza con las calorías registradas para decirte si vas
  demasiado rápido, en ritmo o estancado.
- **Avisos**: tope de kcal por debajo de tu BMR, ritmo teórico por encima del 1,2% del peso por semana,
  e ingestas de más de 6.000 kcal (suele ser un error al teclear).

Reglas de semana: **T5** va a mantenimiento (kcal = TDEE estimado) y **T3** mantiene el déficit
(se puede cambiar en *Datos*). El tope máximo de kcal solo limita las semanas de déficit.

## 3. Cronómetro (botón ⏱ flotante)

Tabata, intervalos trabajo/descanso, EMOM, AMRAP (con contador de rondas) y descansos entre series
(1:00, 1:30, 2:00, 3:00), o uno personalizado. Pitidos y vibración en cada cambio de fase y cuenta
atrás de 3 s. Se puede cerrar la pantalla del cronómetro y seguir viendo la app: el botón flotante
muestra el tiempo. Mide siempre contra el reloj, así que no se desfasa si el móvil estrangula los timers.
Intenta mantener la pantalla encendida; si tu navegador o WebView no lo permite, depende del ajuste
de apagado de pantalla de tu móvil.

## 4. Temas

Botón de arriba a la derecha: **Oscuro**, **Alto contraste** (negro puro, blanco puro, bordes gruesos,
todo un 12% más grande y botones más grandes, pensado para el gimnasio) y **Claro** (exterior).
Se recuerda entre sesiones.

## 5. Ayuda dentro de la app (sin conexión)

- **Botón `?`** (arriba a la derecha): abre la **Guía** con buscador. 17 secciones: empezar, qué hace cada
  pestaña, tipos de semana T1-T5, por qué este plan, cómo rellenar una tarjeta, **ejercicios A-Z**, cálculo
  de nutrición (con *tus* números de hoy), registro de calorías, peso y balance, qué comer, cronómetro,
  condición, progreso, glosario, seguridad, preguntas frecuentes y datos/copias.
- **Botón `ⓘ` en cada ejercicio**: despliega su ficha (qué es, cómo se hace, errores típicos, alternativa,
  cuándo parar y cómo se registra). Los 52 movimientos del plan tienen ficha propia.
- **Botones `ⓘ Ayuda`** en Hoy, Calendario, Nutrición, Condición, Progreso y Cronómetro: te llevan
  directo a la sección que explica esa pantalla.
- El selector del cronómetro explica cada modo (intervalos, EMOM, AMRAP, descanso).
- El buscador funciona por inicio de palabra y sin tildes ("calor" encuentra "calorías").
- Todo el texto está en `js/guide.js`: si cambias un ejercicio en `data.js`, edita también su ficha ahí
  (la clave es la misma que usa el historial del ejercicio).

## 6. Datos y compatibilidad

- Se conservan todos los datos anteriores: series, partidos, seguimiento, nutrición y copias de seguridad.
- El historial de ejercicios sigue por movimiento (sentadilla trasera, peso muerto rumano, remo Pendlay...).
- Claves nuevas en `localStorage`: `rp_food_log_v1`, `rp_weight_log_v1`, `rp_cond_progress_v1`, `rp_settings_v1`.
  La progresión 10K (`rp_run_progress_v1`) ya no se usa. Todo lo nuevo entra en la copia de seguridad.
- Si ya habías editado tus datos de Nutrición, se respetan: **revisa tope de kcal, % de déficit y edad**
  (el valor por defecto de edad es 18 y condiciona el BMR).

## 7. Publicar

Sube el contenido tal cual (manteniendo `css/`, `js/`, `icons/`). Se ha subido la versión de caché a
`plan-pilar-v11` en `sw.js`, así que la PWA instalada se actualiza sola (a veces hace falta abrirla dos veces).
Para el APK: `npm run sync` (o push a `main` con GitHub Actions). `www/` y `android/app/src/main/assets/public/`
se regeneran solos.

## 8. Dónde tocar cosas

- Ejercicios, semanas, mensajes, cronómetros predefinidos, factores de carga y protocolo de nutrición: `js/data.js`
- Textos de la guía, fichas de ejercicios, glosario y preguntas frecuentes: `js/guide.js`
- Lógica y pantallas: `js/app.js`
- Colores y temas: variables al principio de `css/style.css`
