# Manual de Deploy — Grow House en Render
### Visual Studio Code + Terminal CMD · Guía completa paso a paso

> **Stack:** Node.js + Express · MongoDB Atlas · HTML/CSS/JS puro · Gmail SMTP · Google OAuth
> **Estructura:** `backend/` (servidor) · `frontend/` (sitio estático)

---

## Tabla de Contenidos

1. [Requisitos previos](#1-requisitos-previos)
2. [Verificar a qué cuenta de GitHub apunta tu proyecto](#2-verificar-a-qué-cuenta-de-github-apunta-tu-proyecto)
3. [Crear tu propio repositorio en GitHub](#3-crear-tu-propio-repositorio-en-github)
4. [Conectar el proyecto a tu repositorio y hacer el primer push](#4-conectar-el-proyecto-a-tu-repositorio-y-hacer-el-primer-push)
5. [Subir actualizaciones al repositorio](#5-subir-actualizaciones-al-repositorio)
6. [Configurar MongoDB Atlas para Render](#6-configurar-mongodb-atlas-para-render)
7. [Crear cuenta en Render y desplegar el backend](#7-crear-cuenta-en-render-y-desplegar-el-backend)
8. [Configurar variables de entorno en Render](#8-configurar-variables-de-entorno-en-render)
9. [Desplegar el frontend en Render](#9-desplegar-el-frontend-en-render)
10. [Conectar frontend con backend](#10-conectar-frontend-con-backend)
11. [Configurar Google OAuth para producción](#11-configurar-google-oauth-para-producción)
12. [Verificar funcionamiento](#12-verificar-funcionamiento)
13. [Actualizar la aplicación después del primer deploy](#13-actualizar-la-aplicación-después-del-primer-deploy)
14. [Errores comunes en Linux/Render](#14-errores-comunes-en-linuxrender)
15. [Checklist final de deploy](#15-checklist-final-de-deploy)

---

## 1. Requisitos previos

Antes de empezar, confirma que tienes lo siguiente:

- [ ] **Node.js** instalado → verificar con `node -v` en la terminal
- [ ] **Git** instalado → verificar con `git --version`
- [ ] Cuenta propia en **GitHub** → [github.com](https://github.com)
- [ ] Cuenta en **MongoDB Atlas** → [cloud.mongodb.com](https://cloud.mongodb.com)
- [ ] Cuenta en **Render** → [render.com](https://render.com)
- [ ] **App Password de Gmail** configurada (no la contraseña normal de Gmail)

> **App Password de Gmail:** Ve a tu cuenta Google → Seguridad → Verificación en dos pasos (debe estar activa) → Contraseñas de aplicaciones → Genera una para "Correo".

---

## 2. Verificar a qué cuenta de GitHub apunta tu proyecto

> ⚠️ **Este paso es crítico.** Si tu proyecto fue trabajado en equipo, puede estar apuntando al repositorio de otra persona. Subir tus cambios ahí sin querer puede causar conflictos o exponer tu código en una cuenta ajena.

### 2.1 Abre la terminal en VS Code

En VS Code: menú superior → **Terminal** → **New Terminal**

Asegúrate de estar en la raíz del proyecto:

```
cd "C:\Users\TU-USUARIO\ruta\al\proyecto\Grow_House"
```

### 2.2 Revisa a dónde apunta el remote actual

```
git remote -v
```

Verás algo como esto:

```
origin  https://github.com/ALGUIEN/Grow_House.git (fetch)
origin  https://github.com/ALGUIEN/Grow_House.git (push)
```

**Pregunta clave:** ¿El usuario que aparece después de `github.com/` es **tu propio usuario de GitHub**?

- Si dice tu usuario → estás bien, pasa al [paso 4](#4-conectar-el-proyecto-a-tu-repositorio-y-hacer-el-primer-push)
- Si dice el usuario de otra persona → debes crear tu propio repo y redirigir el remote (sigue al [paso 3](#3-crear-tu-propio-repositorio-en-github))
- Si no hay ningún remote (no aparece nada) → debes crear el repo y conectarlo (sigue al [paso 3](#3-crear-tu-propio-repositorio-en-github))

### 2.3 Revisa con qué usuario de Git estás trabajando localmente

```
git config user.name
git config user.email
```

Esto muestra el nombre y correo que aparecerán en los commits. Deben ser los tuyos.

Si no son los correctos, corrígelos antes de continuar:

```
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@gmail.com"
```

> Usa el mismo correo con el que creaste tu cuenta de GitHub para que los commits queden vinculados a tu perfil.

### 2.4 Verifica que estás autenticado con tu cuenta de GitHub

La forma más simple es ejecutar:

```
git config --global credential.helper
```

Si devuelve `manager` o `manager-core`, Windows guarda las credenciales automáticamente. Para ver qué cuenta tiene guardada, abre el menú Inicio → busca **Administrador de credenciales** → **Credenciales de Windows** → busca entradas de `github.com`.

Si la cuenta guardada no es la tuya, bórrala de ahí y la próxima vez que hagas `git push` GitHub te pedirá que inicies sesión con la cuenta correcta.

---

## 3. Crear tu propio repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión con **tu cuenta**
2. Haz clic en el botón **"+"** (esquina superior derecha) → **"New repository"**
3. Completa el formulario:
   - **Repository name:** `Grow_House`
   - **Description:** *(opcional)* Ecommerce de plantas
   - **Visibility:** Public o Private según prefieras
   - **IMPORTANTE:** No marques "Add a README file", "Add .gitignore" ni "Choose a license" — tu proyecto ya los tiene
4. Haz clic en **"Create repository"**
5. GitHub te mostrará una página con instrucciones — **copia la URL** de tu repo. Se ve así:
   ```
   https://github.com/TU-USUARIO/Grow_House.git
   ```

---

## 4. Conectar el proyecto a tu repositorio y hacer el primer push

### 4.1 Situación A — El proyecto ya tiene un remote (apuntaba a otra persona)

Elimina el remote antiguo y agrega el tuyo:

```
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/Grow_House.git
```

Verifica que quedó bien:

```
git remote -v
```

Debe mostrar **tu usuario**, no el de otra persona.

### 4.2 Situación B — El proyecto no tiene ningún remote

```
git init
git remote add origin https://github.com/TU-USUARIO/Grow_House.git
```

### 4.3 Asegúrate de que el .env NO se sube a GitHub

Antes del primer push, verifica que el `.gitignore` del proyecto excluye el archivo `.env`:

```
type .gitignore
```

Busca que contenga al menos estas líneas. Si no están, agrégalas antes de continuar:

```
.env
backend/.env
node_modules/
```

> Si el `.env` llega a subirse a GitHub (aunque sea por error y luego lo borres), tus contraseñas quedan expuestas en el historial. Es mejor prevenirlo desde el inicio.

### 4.4 Hacer el primer push

```
git add .
git commit -m "primer commit - proyecto Grow House"
git branch -M main
git push -u origin main
```

> La primera vez, VS Code o Windows puede abrir una ventana para que inicies sesión en GitHub. Inicia sesión con **tu cuenta**.

Cuando termine, entra a `https://github.com/TU-USUARIO/Grow_House` y confirma que todos los archivos aparecen correctamente.

---

## 5. Subir actualizaciones al repositorio

Cada vez que hagas cambios en el código y quieras subirlos:

```
git add .
git commit -m "descripción de lo que cambiaste"
git push
```

> Render detecta automáticamente cada `git push` y redespliegue tu aplicación sin que tengas que hacer nada más en el dashboard.

---

## 6. Configurar MongoDB Atlas para Render

Render usa IPs dinámicas (cambian constantemente), por lo que debes permitir conexiones desde cualquier IP en Atlas.

1. Ve a [cloud.mongodb.com](https://cloud.mongodb.com) e inicia sesión
2. Selecciona tu proyecto **GrowHouse**
3. En el menú izquierdo haz clic en **"Network Access"**
4. Haz clic en **"Add IP Address"**
5. Haz clic en **"Allow Access from Anywhere"** — esto agrega `0.0.0.0/0`
6. Haz clic en **"Confirm"**

> ❗ Sin este paso, el backend no puede conectarse a la base de datos y verás el error:
> `Could not connect to any servers in your MongoDB Atlas cluster`

### Obtener la cadena de conexión (MONGODB_URI)

1. En el menú izquierdo haz clic en **"Database"**
2. Haz clic en **"Connect"** en tu cluster
3. Selecciona **"Drivers"**
4. Copia la URI — se ve así:
   ```
   mongodb+srv://grow_house:<password>@growhouse.ksrsa1n.mongodb.net/growhouse?retryWrites=true&w=majority&appName=GrowHouse
   ```
5. Reemplaza `<password>` por la contraseña real de tu usuario de base de datos
6. Guarda esta URI, la necesitarás en el siguiente paso

---

## 7. Crear cuenta en Render y desplegar el backend

### 7.1 Crear cuenta en Render

1. Ve a [render.com](https://render.com)
2. Haz clic en **"Get Started for Free"**
3. Regístrate usando tu cuenta de **GitHub** (recomendado — así Render puede ver tus repositorios directamente)
4. Autoriza a Render para acceder a tus repositorios cuando te lo pida

### 7.2 Crear el Web Service (backend)

1. En el dashboard de Render haz clic en **"New +"** → **"Web Service"**
2. Selecciona **"Build and deploy from a Git repository"**
3. Busca y selecciona tu repositorio `Grow_House`
4. Completa la configuración así:

| Campo | Valor |
|---|---|
| **Name** | `grow-house-backend` *(o el nombre que prefieras)* |
| **Region** | Oregon (US West) *(la más estable del plan gratuito)* |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node src/server.js` |
| **Instance Type** | `Free` |

5. Desplázate hasta abajo y haz clic en **"Create Web Service"**

Render empezará el deploy. Esto puede tardar 2-5 minutos la primera vez. Puedes ver el progreso en tiempo real en la sección **"Logs"**.

### 7.3 Obtener la URL del backend

Una vez que el deploy termina verás **"Live"** en verde. La URL del backend aparece debajo del nombre del servicio:

```
https://grow-house-backend.onrender.com
```

**Guarda esta URL** — la necesitarás para el siguiente paso.

---

## 8. Configurar variables de entorno en Render

En el servicio backend ve a **"Environment"** en el menú lateral izquierdo y agrega las siguientes variables una por una:

> **Cómo agregar:** Haz clic en **"Add Environment Variable"**, escribe el nombre en **"Key"** y el valor en **"Value"** → repite para cada variable.

```
NODE_ENV          = production

MONGODB_URI       = mongodb+srv://grow_house:TU_PASSWORD@growhouse.ksrsa1n.mongodb.net/growhouse?retryWrites=true&w=majority&appName=GrowHouse

JWT_SECRET        = pega-aqui-una-clave-larga-y-aleatoria
JWT_EXPIRE        = 30d
JWT_COOKIE_EXPIRE = 30

OPENAI_API_KEY    = sk-proj-...tu-clave-de-openai...

GOOGLE_CLIENT_ID  = 873365892028-gpklspl23p04fidlkvbva2mp3u2o2sbi.apps.googleusercontent.com

# Sistema de email principal — verificación de cuentas y correos de admin
SMTP_HOST         = smtp.gmail.com
SMTP_PORT         = 587
SMTP_SECURE       = false
SMTP_USER         = growhouse011@gmail.com
SMTP_PASS         = tu-app-password-de-gmail-de-16-caracteres

# Sistema de email secundario — recuperación de contraseña
EMAIL_USER        = testgrowhouse@gmail.com
EMAIL_PASS        = tu-app-password-de-gmail-de-16-caracteres

# URL del frontend — actualizar en el paso 10 con la URL real
FRONTEND_URL      = https://PENDIENTE.onrender.com
```

**Cómo generar un JWT_SECRET seguro** — ejecuta esto en la terminal de VS Code:

```
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia el resultado completo y úsalo como valor de `JWT_SECRET`.

> **Nota sobre PORT:** No es necesario configurarlo. Render lo inyecta automáticamente y el servidor ya lo usa con `process.env.PORT || 5000`.

Cuando termines de agregar todas las variables, haz clic en **"Save Changes"**. Render redespliegue el backend automáticamente.

---

## 9. Desplegar el frontend en Render

### 9.1 Actualizar la URL del backend en config.js

Antes de desplegar el frontend, debes decirle a qué URL del backend debe apuntar en producción.

Abre el archivo `frontend/src/scripts/config.js` y reemplaza la URL de ejemplo por la URL real de tu backend:

```js
window.GROW_HOUSE_API = isLocal
    ? 'http://localhost:5000/api'
    : 'https://EL-NOMBRE-REAL-DE-TU-BACKEND.onrender.com/api';  // ← cambia esto
```

Guarda el archivo y sube el cambio a GitHub:

```
git add frontend/src/scripts/config.js
git commit -m "actualizar URL del backend en config.js"
git push
```

### 9.2 Crear el Static Site (frontend)

1. En el dashboard de Render haz clic en **"New +"** → **"Static Site"**
2. Selecciona el mismo repositorio `Grow_House`
3. Completa la configuración así:

| Campo | Valor |
|---|---|
| **Name** | `grow-house-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | *(dejar completamente vacío)* |
| **Publish Directory** | `src/pages` |

> El frontend es HTML/CSS/JS puro — no hay proceso de compilación.
> El `index.html` principal está en `frontend/src/pages/index.html`, por eso el Publish Directory es `src/pages`.

4. **Environment Variables:** dejar vacío — el frontend no usa variables de entorno del servidor
5. Haz clic en **"Deploy Static Site"**

Cuando termine verás la URL del frontend:

```
https://grow-house-frontend.onrender.com
```

---

## 10. Conectar frontend con backend

Ahora que tienes la URL del frontend, actualiza el backend para que la acepte en CORS.

1. Ve al servicio backend en Render → **"Environment"**
2. Busca la variable `FRONTEND_URL`
3. Cambia el valor por la URL real del frontend:
   ```
   FRONTEND_URL = https://grow-house-frontend.onrender.com
   ```
4. Haz clic en **"Save Changes"**

Render redespliegue el backend automáticamente con la nueva configuración.

### Verificar la conexión

Abre en tu navegador:

```
https://tu-backend.onrender.com/api/health
```

Debe responder algo como:

```json
{ "status": "OK", "database": "Connected" }
```

Si ves esa respuesta, el backend está vivo y conectado a MongoDB Atlas.

---

## 11. Configurar Google OAuth para producción

El proyecto usa **Google Auth Library** directamente (sin Firebase). Para que el botón de Google funcione en producción, debes autorizar el dominio del frontend en **Google Cloud Console**.

### 11.1 Ir a Google Cloud Console

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Asegúrate de estar en el proyecto correcto (menú desplegable arriba a la izquierda)
3. En el menú izquierdo ve a **"APIs & Services"** → **"Credentials"**

### 11.2 Editar el OAuth 2.0 Client ID

1. Busca tu **OAuth 2.0 Client ID** en la lista y haz clic en el ícono de lápiz (editar)
2. En la sección **"Authorized JavaScript origins"** haz clic en **"Add URI"** y agrega:
   ```
   https://grow-house-frontend.onrender.com
   ```
   *(reemplaza con tu URL real del Static Site)*
3. Haz clic en **"Save"**

> Los cambios en Google Cloud Console pueden tardar hasta 5 minutos en propagarse.

> Para seguir probando en local, verifica que también tengas `http://localhost:5500` o el puerto que uses con Live Server.

---

## 12. Verificar funcionamiento

Una vez todo desplegado, realiza estas pruebas en orden:

**1. Health check del backend**
```
https://tu-backend.onrender.com/api/health
```
Debe responder `{ "database": "Connected" }`

**2. Carga del frontend**
Abre `https://tu-frontend.onrender.com` — debe cargar el `index.html` con los productos visibles

**3. Login con email y contraseña**
Prueba con una cuenta existente en la base de datos

**4. Login con Google**
Haz clic en el botón de Google — debe abrir el popup, permitir seleccionar cuenta y redirigir al dashboard

**5. Registro de cuenta nueva**
Registra una cuenta nueva — debe llegar un correo de verificación a la dirección registrada

**6. Recuperación de contraseña**
Prueba el flujo de "olvidé mi contraseña" — debe llegar un correo con el código de recuperación

---

## 13. Actualizar la aplicación después del primer deploy

Cada vez que hagas cambios en el código:

```
git add .
git commit -m "descripción del cambio realizado"
git push
```

Render detecta el nuevo commit y redespliegue automáticamente tanto el backend como el frontend (los dos servicios están conectados al mismo repositorio).

> Si solo cambiaste variables de entorno directamente en Render (sin modificar código), ve al servicio en Render y haz clic en **"Manual Deploy"** → **"Deploy latest commit"** para que el backend tome los nuevos valores.

---

## 14. Errores comunes en Linux/Render

### Error: `Cannot find module '../models/Product'`

**Causa:** Linux distingue mayúsculas y minúsculas en nombres de archivo. Windows no. El archivo en disco se llama `product.js` pero el `require` dice `Product`.

**Solución:** El nombre en el `require()` debe coincidir **exactamente** con el nombre del archivo en disco.

```js
// ❌ Incorrecto (falla en Linux/Render)
const Product = require('../models/Product');

// ✅ Correcto
const Product = require('../models/product');
```

---

### Error: `Could not connect to any servers in your MongoDB Atlas cluster`

**Causa:** La IP de Render no está autorizada en MongoDB Atlas.

**Solución:** Ve al [paso 6](#6-configurar-mongodb-atlas-para-render) y permite acceso desde `0.0.0.0/0`.

---

### Error: `Invalid login: 535 Authentication Failed` (email)

**Causa:** Se está usando la contraseña normal de Gmail en vez de una App Password.

**Solución:**
1. Ve a tu cuenta Google → Seguridad → Verificación en dos pasos (actívala si no está)
2. Busca "Contraseñas de aplicaciones"
3. Genera una para "Correo" → usa esa clave de 16 caracteres en `SMTP_PASS` y `EMAIL_PASS` en Render

---

### El botón de Google no abre el popup o muestra error

**Causa:** El dominio del frontend no está autorizado en Google Cloud Console.

**Solución:** Ve al [paso 11](#11-configurar-google-oauth-para-producción) y agrega la URL del Static Site en "Authorized JavaScript origins".

---

### El frontend carga pero la API no responde (error CORS o `net::ERR_CONNECTION_REFUSED`)

**Causas posibles:**
1. `config.js` aún tiene la URL de ejemplo en vez de la URL real del backend
2. `FRONTEND_URL` en el backend no fue actualizada con la URL real del frontend
3. El backend está en reposo — en el plan gratuito de Render, el backend entra en "sleep" tras 15 minutos sin actividad. La primera petición puede tardar 30-60 segundos en "despertar"

**Solución:**
- Verifica `frontend/src/scripts/config.js` — debe tener la URL real del backend
- Verifica la variable `FRONTEND_URL` en Render → backend → Environment
- Espera 60 segundos y vuelve a intentar

---

### El primer deploy tarda mucho

Normal en el plan gratuito de Render. El build inicial puede tardar 3-5 minutos. Los deploys siguientes son más rápidos porque el caché de `node_modules` ya existe.

---

## 15. Checklist final de deploy

### Preparación local
- [ ] `git remote -v` muestra **tu propio usuario** de GitHub
- [ ] `git config user.email` muestra **tu correo** de GitHub
- [ ] `.env` está en `.gitignore` — las contraseñas NO están en el repositorio
- [ ] Todos los cambios están commiteados y en GitHub

### MongoDB Atlas
- [ ] IP `0.0.0.0/0` agregada en Network Access
- [ ] La cadena de conexión `MONGODB_URI` está copiada con la contraseña real (sin `<password>`)

### Render — Backend (Web Service)
- [ ] Root Directory: `backend`
- [ ] Start Command: `node src/server.js`
- [ ] Todas las variables de entorno del paso 8 están configuradas
- [ ] Estado del servicio: **"Live"** (en verde)
- [ ] `/api/health` responde con `"database": "Connected"`

### Render — Frontend (Static Site)
- [ ] Root Directory: `frontend`
- [ ] Publish Directory: `src/pages`
- [ ] Build Command: vacío
- [ ] El sitio carga en su URL sin errores

### Conexión entre servicios
- [ ] `config.js` tiene la URL real del backend (no la de ejemplo)
- [ ] `FRONTEND_URL` en el backend tiene la URL real del frontend
- [ ] El cambio de `config.js` fue commiteado y pusheado

### Google OAuth
- [ ] URL del Static Site agregada en "Authorized JavaScript origins" en Google Cloud Console

### Email
- [ ] `SMTP_PASS` y `EMAIL_PASS` usan App Passwords de Gmail (16 caracteres, no la contraseña normal)
- [ ] Se recibe correo de verificación al registrar una cuenta nueva
- [ ] Se recibe correo al solicitar recuperación de contraseña

### Pruebas finales
- [ ] Login con email y contraseña funciona en producción
- [ ] Login con Google funciona — usuarios nuevos se crean automáticamente
- [ ] Productos cargan en la página principal
- [ ] El carrito y checkout funcionan correctamente

---

> Manual generado para el proyecto **Grow House** · Node.js + Express + MongoDB + HTML/CSS/JS puro
