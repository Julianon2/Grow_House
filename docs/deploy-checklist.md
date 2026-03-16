# Deploy Checklist - Grow House en Render

> Generado el 2026-03-14 | Proyecto: `Grow_House` | Stack: Node.js + Express + MongoDB + HTML/CSS/JS puro

---

## 1. Estructura del proyecto

| Elemento | Estado | Detalle |
|---|---|---|
| Backend en `backend/` | ✅ Correcto | `backend/src/server.js` es el entry point |
| Frontend en `frontend/` | ✅ Correcto | HTML estático en `frontend/src/pages/` |
| `package.json` en `backend/` | ✅ Correcto | Con `"start": "node src/server.js"` |

---

## 2. Problemas encontrados y soluciones

### 🔴 CRÍTICO - Import con mayúsculas incorrecto

**Archivo:** `backend/src/controllers/recomendaciones.controller.js` (línea 6)

```js
// ACTUAL (FALLARÁ en Linux/Render):
const Product = mongoose.models.Product || require('../models/Product');

// CORRECTO (el archivo en disco se llama product.js en minúscula):
const Product = mongoose.models.Product || require('../models/product');
```

**Por qué es crítico:** El archivo en disco es `models/product.js` (minúscula). Linux es case-sensitive. En Windows funciona, en Render (Linux) falla con `MODULE_NOT_FOUND`.

**También en utils (no crítico si no se usan en producción):**
- `utils/testAuthController.js` → `require('../models/Product')` → cambiar a `product`
- `utils/testController.js` → `require('../models/Product')` → cambiar a `product`

---

### 🔴 CRÍTICO - CORS con URL hardcodeada que no es Render

**Archivo:** `backend/src/app.js` (líneas 93-106)

```js
// ACTUAL - lista hardcodeada con Vercel:
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        'https://grow-house.vercel.app',  // ← URL de Vercel, no de Render
        'https://www.grow-house.com',
        process.env.FRONTEND_URL          // ← esta es la que debes usar
      ].filter(Boolean)
```

**Solución:** Agrega la URL de tu Render Static Site a `FRONTEND_URL` en las variables de entorno de Render. La URL tendrá el formato `https://grow-house-xxxx.onrender.com`. No necesitas tocar el código si configuras `FRONTEND_URL` correctamente.

---

### 🔴 CRÍTICO - Segundo `app.use(cors())` sin configuración

**Archivo:** `backend/src/app.js` (línea 157)

```js
// Esta línea anula la configuración CORS anterior:
app.use(cors());       // ← abre CORS a TODOS los orígenes
app.use(express.json());
app.use("/api/auth", authRoutes);
```

**Solución:** Eliminar la línea `app.use(cors())` de la línea 157. El CORS ya está correctamente configurado arriba en la línea 108.

---

### 🟡 ADVERTENCIA - dotenv sin ruta explícita

**Archivos:** `server.js` (línea 1) y `app.js` (línea 5)

```js
// ACTUAL:
require('dotenv').config();

// RECOMENDADO para mayor robustez:
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
```

En Render el CWD al ejecutar `node src/server.js` desde `backend/` es `backend/`, por lo que la configuración actual **funciona**. Sin embargo, si Render cambia el directorio de trabajo, puede fallar. La versión con ruta explícita es más robusta.

> **Nota:** `dotenv.config()` se llama dos veces (en `server.js` y en `app.js`). Basta con tenerlo en `server.js` línea 1 ya que es el primero en ejecutarse.

---

### 🟡 ADVERTENCIA - Dos sistemas de email con variables distintas

El proyecto usa **dos configuraciones de email diferentes**:

| Uso | Archivo | Variables requeridas |
|---|---|---|
| Verificación de cuenta / emails generales | `utils/sendEmail.js` | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` |
| Recuperación de contraseña | `controllers/passwordRecoveryController.js` | `EMAIL_USER`, `EMAIL_PASS` |
| Emails de admin / campañas | `controllers/adminController.js` | `SMTP_USER`, `SMTP_PASS` |

**Debes configurar TODAS estas variables en Render** aunque apunten al mismo correo Gmail.

---

### 🟡 ADVERTENCIA - .env en git (riesgo de seguridad)

El archivo `backend/.env` con todas las credenciales está commiteado en el repositorio. Antes del deploy:

1. Agregar `.env` al `.gitignore`
2. Eliminar el `.env` del historial git (opcional pero recomendado)
3. Crear un `.env.example` sin valores reales como documentación

---

### ✅ CORRECTO - MongoDB usa MONGODB_URI

```js
// database.js - correcto:
const conn = await mongoose.connect(process.env.MONGODB_URI, options);
```

---

### ✅ CORRECTO - Start script

```json
"scripts": {
  "start": "node src/server.js"
}
```

---

### ✅ CORRECTO - Node version especificada

```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

---

### ✅ CORRECTO - No usa Firebase

El proyecto usa **Google Auth Library** directamente (no Firebase SDK). No hay configuración de Firebase Console que actualizar.

---

## 3. Variables de entorno para Render (Backend Web Service)

Configurar en **Render → tu Web Service → Environment**:

```env
# Servidor
NODE_ENV=production
PORT=10000

# Base de datos
MONGODB_URI=mongodb+srv://grow_house:TU_PASSWORD@growhouse.ksrsa1n.mongodb.net/growhouse?retryWrites=true&w=majority&appName=GrowHouse

# JWT
JWT_SECRET=genera-una-clave-aleatoria-muy-larga-aqui
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# OpenAI
OPENAI_API_KEY=sk-proj-...tu-key...
AI_MODEL=gpt-4o-mini

# Email SMTP (para sendEmail.js y adminController.js)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=growhouse011@gmail.com
SMTP_PASS=tu-app-password-de-gmail

# Email alternativo (para passwordRecoveryController.js)
EMAIL_USER=testgrowhouse@gmail.com
EMAIL_PASS=tu-app-password-de-gmail

# Frontend URL (actualizar con tu URL de Render Static Site)
FRONTEND_URL=https://grow-house-XXXX.onrender.com

# Google OAuth
GOOGLE_CLIENT_ID=873365892028-gpklspl23p04fidlkvbva2mp3u2o2sbi.apps.googleusercontent.com

# Opcionales
LOG_LEVEL=info
GMAIL_FROM=growhouse011@gmail.com
```

> **IMPORTANTE:** `PORT` en Render se asigna automáticamente. Render inyecta `PORT` como variable de entorno, pero tu `server.js` ya lo maneja con `process.env.PORT || 5000`. No es necesario configurarlo manualmente.

---

## 4. Configuración del Web Service (Backend) en Render

| Campo | Valor |
|---|---|
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node src/server.js` |
| **Root Directory** | `backend` |

---

## 5. Configuración del Static Site (Frontend) en Render

| Campo | Valor |
|---|---|
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (compila Tailwind CSS) |
| **Publish Directory** | `src/pages` |

> El `index.html` está en `frontend/src/pages/index.html`. El Publish Directory relativo a `frontend/` es `src/pages`.

---

## 6. Google OAuth - Orígenes autorizados

El proyecto usa `google-auth-library` para autenticación con Google. Debes actualizar en **Google Cloud Console → APIs & Services → Credentials → tu OAuth 2.0 Client ID**:

**Authorized JavaScript origins:**
```
https://grow-house-XXXX.onrender.com   (tu Render Static Site URL)
```

**Authorized redirect URIs** (si aplica):
```
https://tu-backend.onrender.com/api/auth/google/callback
```

---

## 7. Checklist antes del primer deploy

### Código
- [ ] Corregir `require('../models/Product')` → `require('../models/product')` en `recomendaciones.controller.js`
- [ ] Eliminar `app.use(cors())` de la línea 157 en `app.js` (el que va sin configuración)
- [ ] Verificar que `FRONTEND_URL` en CORS production incluye tu URL de Render

### Render - Backend Web Service
- [ ] Crear Web Service apuntando al repositorio
- [ ] Configurar Root Directory: `backend`
- [ ] Configurar Start Command: `node src/server.js`
- [ ] Cargar TODAS las variables de entorno de la sección 3
- [ ] Verificar que el deploy muestra "Live" sin errores

### Render - Static Site (Frontend)
- [ ] Crear Static Site apuntando al repositorio
- [ ] Configurar Root Directory: `frontend`
- [ ] Configurar Publish Directory: `src/pages`
- [ ] Configurar Build Command: `npm run build`

### Conectar frontend con backend
- [ ] Actualizar las URLs de la API en los archivos JS del frontend para apuntar al backend de Render (buscar `localhost:5000` en `frontend/`)
- [ ] Configurar `FRONTEND_URL` en backend con la URL del Static Site de Render

### Google OAuth
- [ ] Agregar URL del Static Site a "Authorized JavaScript origins" en Google Cloud Console

### Email
- [ ] Verificar que las App Passwords de Gmail son válidas (no las contraseñas normales)
- [ ] Probar envío de email de verificación de cuenta
- [ ] Probar recuperación de contraseña

### MongoDB
- [ ] Verificar que la IP de Render está en la whitelist de MongoDB Atlas (o usar `0.0.0.0/0` para producción)
- [ ] Ir a MongoDB Atlas → Network Access → Add IP Address → `0.0.0.0/0`

### Pruebas finales
- [ ] `GET https://tu-backend.onrender.com/api/health` devuelve `{"database": "Connected"}`
- [ ] Login con email/password funciona
- [ ] Login con Google funciona
- [ ] Productos cargan en el frontend

---

## 8. URLs a actualizar en el frontend

Buscar `localhost:5000` (o la URL del backend actual) en todos los archivos JS del frontend y reemplazar por la URL del backend en Render:

```bash
# Buscar desde la raíz del proyecto:
grep -r "localhost:5000" frontend/
```

Reemplazar con:
```
https://tu-backend-name.onrender.com
```

---

*Checklist generado automáticamente por análisis del código fuente.*
