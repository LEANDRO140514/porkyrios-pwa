# 🚀 Guía de Despliegue - Porkyrios

Esta guía te ayudará a desplegar Porkyrios en producción.

---

## 📋 Tabla de Contenidos

1. [Preparación Pre-Despliegue](#preparación-pre-despliegue)
2. [Despliegue en Vercel](#despliegue-en-vercel)
3. [Despliegue en Netlify](#despliegue-en-netlify)
4. [Despliegue en Railway](#despliegue-en-railway)
5. [Configuración Post-Despliegue](#configuración-post-despliegue)
6. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)

---

## 🔧 Preparación Pre-Despliegue

### 1. Verificar Configuración Local

Asegúrate de que todo funcione correctamente en desarrollo:

```bash
# Instalar dependencias
npm install

# Verificar build
npm run build

# Probar producción localmente
npm run start
```

### 2. Configurar Base de Datos en Turso

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Crear base de datos de producción
turso db create porkyrios-prod

# Obtener credenciales
turso db show porkyrios-prod --url
turso db tokens create porkyrios-prod
```

Guarda estas credenciales para usarlas en variables de entorno.

### 3. Aplicar Migraciones

```bash
# Configurar variables de entorno de producción
export DATABASE_URL="libsql://porkyrios-prod.turso.io"
export DATABASE_AUTH_TOKEN="tu-token-de-produccion"

# Aplicar migraciones
npm run db:push

# (Opcional) Poblar con datos iniciales
npm run db:seed
```

### 4. Configurar Variables de Entorno

Prepara las siguientes variables:

```env
# Base de datos
DATABASE_URL=libsql://porkyrios-prod.turso.io
DATABASE_AUTH_TOKEN=tu-token-de-produccion

# Seguridad
ADMIN_PASSWORD=TuContraseñaSegura2025

# Entorno
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## ☁️ Despliegue en Vercel (Recomendado)

Vercel es la forma más fácil de desplegar aplicaciones Next.js.

### Opción 1: Deploy desde GitHub

1. **Conectar Repositorio**
   - Ve a [vercel.com](https://vercel.com)
   - Clic en "Add New Project"
   - Conecta tu repositorio de GitHub
   - Importa el proyecto

2. **Configurar Variables de Entorno**
   - En el dashboard del proyecto → Settings → Environment Variables
   - Agrega todas las variables del archivo `.env.local`
   - Marca cada variable como Production/Preview/Development según necesites

3. **Configurar Build Settings**
   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Deploy**
   - Clic en "Deploy"
   - Espera 2-3 minutos
   - ¡Tu sitio estará en vivo!

### Opción 2: Deploy desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel

# Desplegar a producción
vercel --prod
```

### Configurar Dominio Personalizado

1. Ve a Settings → Domains
2. Agrega tu dominio: `www.porkyrios.com`
3. Configura DNS según instrucciones
4. Espera propagación (10-30 minutos)

### Variables de Entorno en Vercel

```bash
# Agregar desde CLI
vercel env add DATABASE_URL
vercel env add DATABASE_AUTH_TOKEN
vercel env add ADMIN_PASSWORD
```

---

## 🌐 Despliegue en Netlify

### 1. Preparar Proyecto

Crea `netlify.toml` en la raíz:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/admin"
  to = "/admin"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Deploy desde CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Inicializar
netlify init

# Configurar variables de entorno
netlify env:set DATABASE_URL "tu-url"
netlify env:set DATABASE_AUTH_TOKEN "tu-token"
netlify env:set ADMIN_PASSWORD "tu-password"

# Deploy
netlify deploy --prod
```

### 3. Deploy desde Dashboard

1. Ve a [netlify.com](https://netlify.com)
2. "Add new site" → "Import an existing project"
3. Conecta GitHub/GitLab
4. Configura build settings:
   ```
   Build command: npm run build
   Publish directory: .next
   ```
5. Agrega variables de entorno
6. Deploy

---

## 🚂 Despliegue en Railway

Railway es excelente para aplicaciones full-stack con base de datos.

### 1. Deploy desde Dashboard

1. Ve a [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Railway detectará Next.js automáticamente

### 2. Configurar Variables de Entorno

En Project → Variables:

```env
DATABASE_URL=libsql://tu-db.turso.io
DATABASE_AUTH_TOKEN=tu-token
ADMIN_PASSWORD=tu-password
NODE_ENV=production
```

### 3. Configurar Dominio

1. Settings → Networking
2. Generate Domain (Railway te da un dominio gratis)
3. O agrega tu dominio personalizado

### 4. Deploy desde CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar
railway init

# Link al proyecto
railway link

# Agregar variables
railway variables set DATABASE_URL="tu-url"
railway variables set DATABASE_AUTH_TOKEN="tu-token"
railway variables set ADMIN_PASSWORD="tu-password"

# Deploy
railway up
```

---

## 🔧 Configuración Post-Despliegue

### 1. Verificar Funcionalidad

Prueba todas las funcionalidades en producción:

- ✅ Homepage carga correctamente
- ✅ Menú muestra productos
- ✅ Carrito funciona
- ✅ Proceso de pago completa
- ✅ Rastreo de pedidos funciona
- ✅ Panel admin accesible
- ✅ PWA es instalable

### 2. Configurar PWA

Verifica que `manifest.json` tenga la URL correcta:

```json
{
  "start_url": "https://tu-dominio.com/",
  "scope": "https://tu-dominio.com/"
}
```

### 3. Configurar SSL/HTTPS

La mayoría de plataformas incluyen SSL automático. Verifica:

```bash
# Probar HTTPS
curl -I https://tu-dominio.com

# Debe retornar: HTTP/2 200
```

### 4. Optimizar Rendimiento

#### Habilitar Caché

En `next.config.ts`:

```typescript
const nextConfig = {
  // ... configuración existente
  
  headers: async () => [
    {
      source: '/:all*(svg|jpg|png|webp|gif)',
      locale: false,
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        }
      ],
    },
  ],
};
```

#### Comprimir Assets

Vercel y Netlify comprimen automáticamente, pero verifica:

```bash
# Instalar herramienta de análisis
npm install -g lighthouse

# Analizar sitio
lighthouse https://tu-dominio.com --view
```

### 5. Configurar Monitoreo

#### Vercel Analytics

```bash
npm install @vercel/analytics
```

En `src/app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Google Analytics

Agrega en `src/app/layout.tsx`:

```typescript
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 📊 Monitoreo y Mantenimiento

### 1. Logs y Debugging

**Vercel:**
```bash
# Ver logs en tiempo real
vercel logs

# Logs de función específica
vercel logs --follow
```

**Netlify:**
```bash
netlify logs --tail
```

**Railway:**
```bash
railway logs
```

### 2. Base de Datos

#### Backups Automáticos

Turso hace backups automáticos, pero puedes crear manuales:

```bash
# Crear backup
turso db dump porkyrios-prod > backup-$(date +%Y%m%d).sql

# Restaurar backup
turso db shell porkyrios-prod < backup-20250115.sql
```

#### Monitorear Base de Datos

```bash
# Ver estadísticas
turso db show porkyrios-prod

# Ejecutar query
turso db shell porkyrios-prod "SELECT COUNT(*) FROM orders"
```

### 3. Métricas de Rendimiento

Usa [PageSpeed Insights](https://pagespeed.web.dev/):

```bash
# Objetivo:
Performance: > 90
Accessibility: > 95
Best Practices: > 95
SEO: > 90
```

### 4. Actualizaciones

```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Corregir automáticamente
npm audit fix

# Desplegar actualización
git push origin main  # Auto-deploy en Vercel/Netlify
```

---

## 🔒 Seguridad en Producción

### 1. Cambiar Contraseñas

Nunca uses las contraseñas por defecto en producción:

```env
ADMIN_PASSWORD=Una_Contraseña_Muy_Segura_2025!
```

### 2. Configurar CORS (si usas API externa)

En `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://tu-dominio.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ];
  },
};
```

### 3. Rate Limiting

Considera agregar rate limiting para APIs:

```bash
npm install @upstash/ratelimit @upstash/redis
```

### 4. Secrets Management

Nunca commits secrets al repositorio:

```bash
# Verificar que .env esté en .gitignore
cat .gitignore | grep .env

# Si no está, agrégalo:
echo ".env*" >> .gitignore
```

---

## 🐛 Troubleshooting

### Build Falla en Producción

**Error**: `Module not found`

**Solución**:
```bash
# Limpiar caché
rm -rf .next node_modules
npm install
npm run build
```

---

### Base de Datos No Conecta

**Error**: `Database connection failed`

**Solución**:
1. Verifica que `DATABASE_URL` y `DATABASE_AUTH_TOKEN` estén configurados
2. Prueba conexión local:
   ```bash
   turso db shell porkyrios-prod "SELECT 1"
   ```
3. Regenera token si expiró

---

### PWA No Se Actualiza

**Solución**:
1. Incrementa versión en `public/sw.js`:
   ```javascript
   const CACHE_VERSION = 'v2'; // Cambiar número
   ```
2. Redeploy
3. En el navegador: Ctrl + Shift + R (hard refresh)

---

### 404 en Rutas Dinámicas

**Solución**:
Verifica que `next.config.ts` tenga:

```typescript
const nextConfig = {
  output: 'standalone', // Para algunos providers
};
```

---

## 📞 Soporte

Si tienes problemas durante el despliegue:

- 📖 [Vercel Docs](https://vercel.com/docs)
- 📖 [Netlify Docs](https://docs.netlify.com)
- 📖 [Railway Docs](https://docs.railway.app)
- 📖 [Turso Docs](https://docs.turso.tech)
- 🐛 [GitHub Issues](https://github.com/tu-usuario/porkyrios/issues)

---

<div align="center">
  <strong>¡Éxito con tu deploy! 🚀</strong>
  <br />
  <sub>Porkyrios en producción</sub>
</div>
