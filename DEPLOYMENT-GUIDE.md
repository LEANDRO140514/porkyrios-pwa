# 🚀 Guía de Deployment - Porkyrios

## 📋 Pre-requisitos Completados ✅

- ✅ Bundle optimization implementado
- ✅ Testing coverage completo
- ✅ PWA configurado
- ✅ Sentry integrado
- ✅ Performance optimizado
- ✅ Error handling robusto

---

## 🎯 Deployment en Vercel (Recomendado)

### 1️⃣ Preparación Local

#### Verificar que el build funciona:
```bash
npm run build
npm run start
```

Si hay errores, arreglarlos antes de continuar.

---

### 2️⃣ Configurar Variables de Entorno

**Necesitas obtener estas credenciales ANTES del deploy:**

#### 🗄️ **Turso Database** (CRÍTICO)
```bash
# 1. Instalar CLI de Turso
curl -sSfL https://get.tur.so/install.sh | bash

# 2. Login
turso auth login

# 3. Crear database
turso db create porkyrios

# 4. Obtener URL
turso db show porkyrios --url

# 5. Crear token
turso db tokens create porkyrios
```

Variables necesarias:
```
DATABASE_URL=libsql://[tu-database].turso.io
DATABASE_AUTH_TOKEN=[tu-auth-token]
```

#### 🐛 **Sentry Error Tracking** (Recomendado)
1. Crear cuenta en https://sentry.io
2. Crear proyecto Next.js
3. Obtener DSN en: Settings → SDK Setup → Client Keys
4. Crear Auth Token en: Settings → Account → API → Create Token
   - Scopes: `project:read`, `project:write`, `org:read`, `releases:read`, `releases:write`

Variables necesarias:
```
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]
SENTRY_AUTH_TOKEN=sntrys_[token]
SENTRY_ORG=[org-slug]
SENTRY_PROJECT=[project-slug]
```

#### 📧 **Resend Email Service** (Recomendado)
1. Crear cuenta en https://resend.com
2. Ir a API Keys en el dashboard
3. Crear nueva API key
4. Para producción: Verificar dominio propio

Variables necesarias:
```
RESEND_API_KEY=re_[tu-api-key]
```

#### 💳 **MercadoPago** (Si usas pagos)
1. Crear cuenta en https://mercadopago.com.ar/developers
2. Ir a "Tus credenciales"
3. Copiar Public Key y Access Token (modo producción)

Variables necesarias:
```
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-[public-key]
MERCADOPAGO_ACCESS_TOKEN=APP_USR-[access-token]
```

#### 🔐 **Seguridad**
```
ADMIN_PASSWORD=[cambiar-en-produccion]
NODE_ENV=production
```

---

### 3️⃣ Deploy a Vercel

#### Opción A: Deploy desde Git (Recomendado)

1. **Subir a GitHub:**
```bash
git init
git add .
git commit -m "feat: Ready for production deployment"
git branch -M main
git remote add origin https://github.com/tu-usuario/porkyrios.git
git push -u origin main
```

2. **Conectar con Vercel:**
   - Ve a https://vercel.com/new
   - Importa el repositorio de GitHub
   - Vercel detectará automáticamente Next.js

3. **Configurar Variables de Entorno en Vercel:**
   - En el dashboard de Vercel → Settings → Environment Variables
   - Agregar TODAS las variables del paso 2️⃣
   - **IMPORTANTE:** Marcar las que empiezan con `NEXT_PUBLIC_` como "Production, Preview, Development"
   - Las demás solo como "Production"

4. **Deploy:**
   - Click en "Deploy"
   - Esperar 3-5 minutos

#### Opción B: Deploy desde CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Configurar variables de entorno
vercel env add DATABASE_URL
vercel env add DATABASE_AUTH_TOKEN
# ... (repetir para todas las variables)

# 5. Deploy a producción
vercel --prod
```

---

### 4️⃣ Configuración Post-Deploy

#### A. Verificar URL de Producción
```
https://tu-proyecto.vercel.app
```

#### B. Actualizar Variables de Entorno
En Vercel, actualizar:
```
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

Hacer re-deploy:
```bash
vercel --prod
```

#### C. Configurar Dominio Propio (Opcional)
1. En Vercel → Settings → Domains
2. Agregar dominio (ej: `porkyrios.com`)
3. Configurar DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. SSL se configura automáticamente ✅

---

### 5️⃣ Smoke Testing en Producción

**Checklist de verificación:**

```
✅ Homepage carga correctamente
✅ Login/Register funcionan
✅ Menú muestra productos
✅ Carrito funciona
✅ Payment flow completo
✅ Tracking de pedidos
✅ Admin panel accesible
✅ PWA se instala correctamente
✅ Notificaciones funcionan
✅ Emails se envían (Resend)
✅ Errors reportan a Sentry
✅ Performance < 4s load time
```

**Testing rápido:**
1. **Auth Flow:**
   - Registrar usuario nuevo
   - Logout
   - Login nuevamente

2. **Purchase Flow:**
   - Agregar productos al carrito
   - Proceder a checkout
   - Completar pago
   - Verificar email de confirmación
   - Trackear pedido

3. **Admin Panel:**
   - Acceder con ADMIN_PASSWORD
   - Verificar dashboard analytics
   - Ver pedidos
   - Gestionar productos

4. **PWA:**
   - Instalar app en móvil
   - Verificar funcionamiento offline
   - Probar notificaciones push

---

### 6️⃣ Monitoreo Primeras 48h

#### A. Sentry Dashboard
Monitorear:
- Errores de JavaScript
- Errores de API
- Performance issues
- User sessions

URL: https://sentry.io/organizations/[tu-org]/projects/[tu-proyecto]/

#### B. Vercel Analytics
Monitorear:
- Real Experience Score
- Web Vitals (LCP, FID, CLS)
- Tiempo de carga
- Tráfico por página

URL: https://vercel.com/[tu-usuario]/[tu-proyecto]/analytics

#### C. Métricas Clave
```
Target   | Métrica                  | Objetivo
---------|--------------------------|----------
🚀 Speed | Load Time (LCP)          | < 4s
⚡ Inter  | First Input Delay (FID)  | < 100ms
🎯 Stab  | Cumulative Layout Shift  | < 0.1
📊 Error | Error Rate               | < 1%
💰 Conv  | Conversion Rate          | > 2%
```

---

### 7️⃣ Rollback Plan (Si algo sale mal)

#### Opción A: Revertir en Vercel UI
1. Ve a Deployments
2. Encuentra el deployment anterior que funcionaba
3. Click en "..." → "Promote to Production"

#### Opción B: Revertir con CLI
```bash
vercel rollback
```

#### Opción C: Revertir Git + Re-deploy
```bash
git revert HEAD
git push origin main
```

---

## 🔧 Troubleshooting Común

### Error: "Database connection failed"
**Solución:**
- Verificar DATABASE_URL y DATABASE_AUTH_TOKEN
- Confirmar que la DB de Turso está activa
- Revisar logs en Vercel: `vercel logs`

### Error: "Sentry not reporting"
**Solución:**
- Verificar NEXT_PUBLIC_SENTRY_DSN
- Confirmar que el proyecto de Sentry existe
- Revisar Source Maps en Sentry settings

### Error: "Emails not sending"
**Solución:**
- Verificar RESEND_API_KEY
- Confirmar que el dominio está verificado (producción)
- Revisar logs en Resend dashboard

### Error: "Admin panel 404"
**Solución:**
- Verificar que `middleware.ts` está en la raíz
- Confirmar ADMIN_PASSWORD está configurado
- Limpiar caché del navegador

### Error: "PWA not installing"
**Solución:**
- Verificar que estás en HTTPS (Vercel lo hace automático)
- Confirmar manifest.json es accesible
- Revisar Service Worker en DevTools

---

## 📊 Checklist Final Pre-Deploy

```bash
# Build local exitoso
✅ npm run build

# Tests pasando
✅ npm run test:run

# E2E tests pasando
✅ npm run test:e2e

# Variables de entorno configuradas
✅ Turso Database
✅ Sentry
✅ Resend
✅ MercadoPago (opcional)
✅ Admin Password

# Archivos críticos presentes
✅ vercel.json
✅ middleware.ts
✅ manifest.json
✅ robots.txt

# Seguridad
✅ .env en .gitignore
✅ Secrets no hardcodeados
✅ CORS configurado correctamente

# Performance
✅ Bundle optimizado
✅ Imágenes optimizadas
✅ Lazy loading implementado
```

---

## 🎉 Post-Deploy Success

**Una vez que todo esté funcionando:**

1. ✅ Actualizar README con URL de producción
2. ✅ Compartir link con stakeholders
3. ✅ Configurar alertas de Sentry
4. ✅ Configurar backup de Turso
5. ✅ Documentar proceso de deploy para equipo
6. ✅ Celebrar 🎊

---

## 📞 Soporte

- **Vercel:** https://vercel.com/support
- **Turso:** https://docs.turso.tech
- **Sentry:** https://docs.sentry.io
- **Next.js:** https://nextjs.org/docs

---

## 🔄 Actualizaciones Futuras

Para deploys futuros:
```bash
# 1. Hacer cambios
# 2. Commit
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Push
git push origin main

# 4. Vercel hace auto-deploy ✅
```

---

**Tiempo estimado de deploy completo: 30-60 minutos**

**¡Buena suerte con el lanzamiento! 🚀**
