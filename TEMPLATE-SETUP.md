# 🎯 Usar Porkyrios como Template

Esta guía te ayudará a crear un nuevo proyecto basado en Porkyrios sin perder tu MVP original.

---

## 🚀 Método 1: GitHub Template (Recomendado)

### Paso 1: Convertir Porkyrios en Template

1. **Sube Porkyrios a GitHub** (si no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "feat: Porkyrios MVP - Production Ready"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/porkyrios.git
   git push -u origin main
   ```

2. **Activa Template Repository**:
   - Ve a tu repositorio en GitHub
   - Click en **Settings** (⚙️)
   - En la sección **General**, busca **Template repository**
   - ✅ Marca **"Template repository"**
   - Click **Save**

### Paso 2: Crear Nuevo Proyecto desde Template

1. **Usa el Template**:
   - Ve a https://github.com/tu-usuario/porkyrios
   - Click en **"Use this template"** (botón verde)
   - Click en **"Create a new repository"**
   - Nombre: `mi-nuevo-proyecto`
   - Descripción: Tu nueva descripción
   - Público/Privado según prefieras
   - Click **"Create repository"**

2. **Clona tu nuevo proyecto**:
   ```bash
   git clone https://github.com/tu-usuario/mi-nuevo-proyecto.git
   cd mi-nuevo-proyecto
   ```

3. **Ejecuta el script de setup**:
   ```bash
   bash scripts/template-setup.sh
   ```
   
   Este script te preguntará:
   - Nombre del nuevo proyecto
   - Descripción
   - Autor
   - URL del repositorio

4. **Instala dependencias**:
   ```bash
   bun install
   ```

---

## 🔧 Método 2: Clone Manual (Sin GitHub)

Si prefieres trabajar localmente sin GitHub:

```bash
# 1. Copiar proyecto
cp -r porkyrios mi-nuevo-proyecto
cd mi-nuevo-proyecto

# 2. Limpiar historial git
rm -rf .git
git init
git add .
git commit -m "Initial commit - Basado en Porkyrios"

# 3. Ejecutar setup
bash scripts/template-setup.sh

# 4. Instalar dependencias
bun install
```

---

## 📋 Checklist de Personalización

Después de crear tu nuevo proyecto, personaliza estos archivos:

### 1️⃣ Identidad del Proyecto

- [ ] **package.json**
  - [ ] `name`: "mi-nuevo-proyecto"
  - [ ] `description`: Nueva descripción
  - [ ] `version`: "1.0.0"
  - [ ] `author`: Tu nombre

- [ ] **README.md**
  - [ ] Título del proyecto
  - [ ] Descripción y características
  - [ ] Capturas de pantalla (si aplica)

### 2️⃣ Branding & UI

- [ ] **src/app/page.tsx**
  - [ ] Cambiar logo/imagen principal
  - [ ] Actualizar textos y CTAs
  - [ ] Personalizar colores (si aplica)

- [ ] **src/app/manifest.ts** (PWA)
  - [ ] `name`: "Nuevo Nombre"
  - [ ] `short_name`: "NuevoApp"
  - [ ] `description`: Nueva descripción
  - [ ] `theme_color`: Color de tu marca

- [ ] **public/manifest.json**
  - [ ] Mismo contenido que manifest.ts

### 3️⃣ Variables de Entorno

- [ ] **Copiar .env.example a .env**:
  ```bash
  cp .env.example .env
  ```

- [ ] **Configurar nuevas credenciales** (ver DEPLOYMENT-GUIDE.md):
  - [ ] **Turso Database** (CRÍTICO)
    - [ ] `DATABASE_URL`
    - [ ] `DATABASE_AUTH_TOKEN`
  
  - [ ] **Seguridad**
    - [ ] `ADMIN_PASSWORD` (cambiar por uno único)
  
  - [ ] **Sentry** (Recomendado)
    - [ ] `NEXT_PUBLIC_SENTRY_DSN`
    - [ ] `SENTRY_AUTH_TOKEN`
    - [ ] `SENTRY_ORG`
    - [ ] `SENTRY_PROJECT`
  
  - [ ] **Resend Email** (Recomendado)
    - [ ] `RESEND_API_KEY`
  
  - [ ] **Configuración**
    - [ ] `NEXT_PUBLIC_APP_URL` (tu nueva URL)

### 4️⃣ Base de Datos

- [ ] **Crear nueva base de datos Turso**:
  ```bash
  # Instalar Turso CLI (si no lo tienes)
  curl -sSfL https://get.tur.so/install.sh | bash
  
  # Crear nueva database
  turso db create mi-nuevo-proyecto
  
  # Obtener URL
  turso db show mi-nuevo-proyecto --url
  
  # Crear token
  turso db tokens create mi-nuevo-proyecto
  
  # Copiar credenciales a .env
  ```

- [ ] **Push schema a nueva DB**:
  ```bash
  bun run db:push
  ```

- [ ] **Seed con datos de prueba** (opcional):
  ```bash
  bun run db:seed
  ```

### 5️⃣ Sentry (Error Tracking)

- [ ] **Crear nuevo proyecto en Sentry**:
  1. Ve a https://sentry.io
  2. Create Project → Next.js
  3. Copia DSN
  4. Create Auth Token (Settings → Account → API)
  5. Actualiza variables en .env

- [ ] **Actualizar next.config.ts**:
  ```typescript
  sentry: {
    org: "tu-nueva-org",
    project: "tu-nuevo-proyecto"
  }
  ```

### 6️⃣ Resend (Email)

- [ ] **Crear cuenta en Resend** (si no tienes):
  1. Ve a https://resend.com
  2. Crea cuenta
  3. API Keys → Create API Key
  4. Copia a .env

- [ ] **Personalizar emails** en `src/emails/`:
  - [ ] Actualizar branding
  - [ ] Cambiar textos
  - [ ] Modificar enlaces

---

## 🧹 Limpieza de Datos de Ejemplo

Si Porkyrios tiene datos de ejemplo que no quieres:

```bash
# Eliminar seeds (opcional)
rm -rf src/db/seeds/*

# Limpiar cache de Next.js
rm -rf .next
rm -rf node_modules/.cache

# Reinstalar
bun install
```

---

## ✅ Verificación Final

Antes de empezar a desarrollar:

```bash
# 1. Verificar que todo compila
bun run build

# 2. Probar localmente
bun run dev

# 3. Verificar que todas las rutas funcionan:
# - / (Homepage)
# - /menu (Menú de productos)
# - /cart (Carrito)
# - /payment (Pago)
# - /tracking (Rastreo)
# - /admin (Admin panel)
# - /login (Login)
# - /register (Registro)

# 4. Verificar conexión a DB
# - Crear un pedido de prueba
# - Verificar que se guarde en Turso
```

---

## 🚀 Deploy del Nuevo Proyecto

Una vez personalizado:

1. **Push a GitHub**:
   ```bash
   git add .
   git commit -m "feat: Proyecto inicial basado en Porkyrios"
   git push origin main
   ```

2. **Deploy en Vercel**:
   - Ve a https://vercel.com/new
   - Importa tu nuevo repositorio
   - Configura variables de entorno
   - Click "Deploy"

3. **Post-Deploy**:
   - Sigue **DEPLOY-CHECKLIST.md** para smoke testing
   - Monitorea primeras 48h
   - Revisa Sentry para errores

---

## 📊 Diferencias con Porkyrios Original

Tu nuevo proyecto será una copia exacta de Porkyrios, pero:

- ✅ **Base de datos separada** (nueva Turso DB)
- ✅ **Credenciales independientes** (nuevos tokens/keys)
- ✅ **Branding personalizado** (logos, textos, colores)
- ✅ **Deployment independiente** (nuevo Vercel project)
- ✅ **Monitoreo separado** (nuevo proyecto Sentry)

**Porkyrios original queda intacto** como tu MVP en producción.

---

## 🆘 Troubleshooting

### Error: "DATABASE_URL is not defined"
```bash
# Verificar que .env existe
ls -la .env

# Copiar desde example si no existe
cp .env.example .env

# Configurar credenciales
nano .env
```

### Error: "Failed to connect to Turso"
```bash
# Verificar credenciales
turso db show mi-nuevo-proyecto

# Regenerar token
turso db tokens create mi-nuevo-proyecto

# Actualizar .env
```

### Cambios no se reflejan
```bash
# Limpiar cache
rm -rf .next
rm -rf node_modules/.cache

# Reiniciar dev server
bun run dev
```

---

## 💡 Mejores Prácticas

1. **Mantén Porkyrios actualizado**: Úsalo como referencia para futuros proyectos
2. **Documenta cambios**: Si mejoras algo en el nuevo proyecto, considera actualizarlo en Porkyrios
3. **Versionamiento**: Usa tags de git para marcar versiones estables
4. **Testing**: Prueba a fondo antes de deploy
5. **Backup**: Siempre haz backup de tu base de datos antes de cambios grandes

---

## 🎯 Próximos Pasos Recomendados

Después de setup inicial:

1. **Personalizar modelo de datos** (src/db/schema.ts)
2. **Adaptar API routes** (src/app/api/)
3. **Modificar UI/UX** según tu marca
4. **Agregar features específicas** de tu negocio
5. **Optimizar SEO** (metadata, og:images)
6. **Configurar analytics** (Google Analytics, etc.)

---

**¿Preguntas?** Consulta:
- **DEPLOYMENT-GUIDE.md** - Guía completa de deploy
- **DEPLOY-CHECKLIST.md** - Checklist rápido
- **README.md** - Documentación general

---

¡Listo para escalar! 🚀
