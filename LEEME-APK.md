# Plan Pilar — app Android (APK)

Misma web de siempre (`index.html`, `css/`, `js/`) empaquetada con **Capacitor 8** dentro
de un proyecto Android (`android/`). No hay que tocar código para que funcione: la app
lleva los ficheros dentro del APK, sin service worker y sin depender de Chrome.

> Estado: el proyecto está montado y sincronizado, pero **no he podido compilar el APK
> aquí** (sin Android SDK). La primera compilación en GitHub Actions o en tu PC es la
> prueba real; si falla, pásame el log.

## ⚠️ Antes de nada: tus datos NO se pasan solos

Los datos (series, peso, seguimiento...) están en el almacenamiento de la PWA de Chrome
y la app nueva es otra app distinta, así que empieza vacía.

1. En la PWA actual (ya con esta versión subida): pestaña **Seguimiento** → abajo,
   **Copia de seguridad** → *Copiar copia de seguridad*. Pégala en una nota o mail.
2. Instala el APK, abre **Seguimiento** → pega el texto → *Restaurar desde el texto*.

Hazlo también antes de desinstalar/reinstalar la app en el futuro.

## Opción A (recomendada): que GitHub compile el APK

No necesitas instalar nada en tu PC.

1. Sube **todo este contenido** a tu repo (incluida la carpeta `.github/`, `android/` e
   `icons/`). El `.gitignore` ya excluye lo que sobra.
2. En GitHub: *Actions → Build APK → Run workflow* (también se lanza solo con cada push a `main`).
3. Al terminar, entra en la ejecución → **Artifacts → plan-pilar-apk** → descarga el ZIP y
   pasa el `.apk` al móvil. Ábrelo y permite "instalar apps desconocidas" para tu navegador
   o gestor de archivos.

### Firmar con una clave propia (importante para poder actualizar)
Sin clave propia, el workflow compila `debug` y **cada compilación queda firmada con una
clave distinta**: Android no deja actualizar encima y habría que desinstalar (perdiendo
los datos). Para evitarlo, crea una clave una sola vez:

```bash
keytool -genkeypair -v -keystore planpilar.keystore -alias planpilar -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 planpilar.keystore > keystore.b64      # en Mac: base64 -i planpilar.keystore -o keystore.b64
```
En el repo: *Settings → Secrets and variables → Actions → New repository secret*:

| Secret | Valor |
|---|---|
| `KEYSTORE_BASE64` | contenido de `keystore.b64` |
| `KEYSTORE_PASSWORD` | la contraseña del keystore |
| `KEY_ALIAS` | `planpilar` |
| `KEY_PASSWORD` | la contraseña de la clave |

**Guarda `planpilar.keystore` y las contraseñas en un sitio seguro** (no en el repo). Si la
pierdes no podrás actualizar la app instalada. Con los secrets puestos, el workflow genera
un `release` firmado.

## Opción B: compilar en tu PC

Requisitos: Node 22, JDK 21 y Android Studio (o solo el Android SDK).

```bash
npm install
npm run icons        # genera los iconos de Android desde icons/icon-512.png y icon-maskable-512.png
npm run open         # sincroniza y abre Android Studio -> Build > Build APK(s)
# o por línea de comandos:
npm run apk:debug    # APK en android/app/build/outputs/apk/debug/app-debug.apk
```
En tu propio PC la clave de debug es siempre la misma, así que las actualizaciones encima funcionan.

## Cuando cambies código de la web
Edita `index.html`, `css/` o `js/` como siempre y vuelve a compilar (Opción A: push;
Opción B: `npm run sync`). `www/` se regenera solo. La versión web/PWA sigue funcionando
con los mismos ficheros (`manifest.json` y `sw.js` solo se usan ahí).

## Datos de la app (cámbialos ahora si quieres)
- **ID de aplicación:** `com.tanwydd.planpilar` (en `capacitor.config.json` y `android/app/build.gradle`).
  Es lo que identifica la app; cambiarlo después = otra app distinta. Decídelo antes de instalar.
- **Nombre:** "Plan Pilar". **Orientación:** solo vertical. **Android mínimo:** 7.0 (API 24).
- Sin permisos especiales ni anuncios; todo es offline.

## Pendiente para más adelante
- Pantalla de carga (splash) propia: ahora usa la de Capacitor.
- Publicar en Google Play: exige cuenta de desarrollador (25 USD, pago único), generar un
  `.aab` (`./gradlew bundleRelease`) y, según las reglas vigentes para cuentas personales nuevas, puede pedir un periodo de prueba
  cerrada con testers. Para uso personal, el APK directo basta.
