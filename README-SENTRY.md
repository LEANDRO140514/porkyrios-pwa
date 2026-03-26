# 🐛 Sentry Error Tracking - Configuración

## 📋 Resumen

Sentry está integrado en **Porkyrios** para monitoreo de errores en producción. Captura automáticamente:

- ✅ **Errores de cliente** (React components, eventos)
- ✅ **Errores de servidor** (API routes, server actions)
- ✅ **Errores de edge runtime** (middleware)
- ✅ **Session replays** (grabación de sesiones con errores)
- ✅ **Performance monitoring** (seguimiento de rendimiento)

---

## 🚀 Configuración Paso a Paso

### 1️⃣ Crear Cuenta en Sentry

1. Ve a [https://sentry.io](https://sentry.io)
2. Crea una cuenta gratuita
3. Confirma tu email

### 2️⃣ Crear Proyecto

1. Click en **"Create Project"**
2. Selecciona plataforma: **Next.js**
3. Nombre del proyecto: **porkyrios** (o el que prefieras)
4. Click en **"Create Project"**

### 3️⃣ Obtener DSN (Data Source Name)

El DSN es la URL pública para enviar errores desde el cliente.

1. En tu proyecto, ve a **Settings** (⚙️ arriba derecha)
2. Click en **SDK Setup** → **Client Keys (DSN)**
3. Copia el DSN completo:
   ```
   https://[key]@[org-id].ingest.sentry.io/[project-id]
   ```
4. Agrega a `.env`:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org-id].ingest.sentry.io/[project-id]
   ```

### 4️⃣ Crear Auth Token

El Auth Token permite subir sourcemaps automáticamente durante el build.

1. Ve a [https://sentry.io/settings/account/api/](https://sentry.io/settings/account/api/)
2. Click en **"Create New Token"** (arriba derecha)
3. Nombre: `porkyrios-deploy`
4. Selecciona estos **scopes**:
   - ✅ `project:read`
   - ✅ `project:write`
   - ✅ `org:read`
   - ✅ `releases:read`
   - ✅ `releases:write`
5. Click en **"Create Token"**
6. Copia el token (formato: `sntrys_...`)
7. Agrega a `.env`:
   ```env
   SENTRY_AUTH_TOKEN=sntrys_[tu-token-aqui]
   ```

### 5️⃣ Obtener Organization Slug

1. Ve a [https://sentry.io/settings/](https://sentry.io/settings/)
2. Mira la URL del navegador:
   ```
   https://sentry.io/organizations/[tu-org-slug]/
   ```
3. Copia el `[tu-org-slug]`
4. Agrega a `.env`:
   ```env
   SENTRY_ORG=tu-org-slug
   ```

### 6️⃣ Obtener Project Slug

1. En tu proyecto, ve a **Settings** → **General**
2. Busca el campo **"Project slug"**
3. Copia el valor
4. Agrega a `.env`:
   ```env
   SENTRY_PROJECT=tu-project-slug
   ```

### 7️⃣ Variables de Entorno Finales

Tu archivo `.env` debe tener:

```env
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org-id].ingest.sentry.io/[project-id]
SENTRY_AUTH_TOKEN=sntrys_[tu-token]
SENTRY_ORG=tu-org-slug
SENTRY_PROJECT=tu-project-slug
```

---

## 🧪 Probar la Integración

### Probar Errores de Cliente

Crea un botón de prueba en cualquier página:

```tsx
<button onClick={() => {
  throw new Error("Test error from client!");
}}>
  Probar Error Cliente
</button>
```

### Probar Errores de API

Llama a cualquier API con datos inválidos o fuerza un error:

```tsx
fetch('/api/products?id=invalid');
```

### Ver Errores en Sentry

1. Ve a tu proyecto en Sentry
2. Click en **Issues** en el sidebar
3. Deberías ver los errores capturados
4. Click en un error para ver:
   - Stack trace completo
   - Contexto de la petición
   - Breadcrumbs (acciones del usuario)
   - Session replay (si está habilitado)

---

## 📊 Features Implementados

### ✅ Error Boundaries

**Archivo:** `src/app/error.tsx`  
Captura errores en componentes de React (rutas anidadas).

**Archivo:** `src/app/global-error.tsx`  
Captura errores críticos en el root layout.

### ✅ API Routes Error Tracking

Todas las API routes tienen integración de Sentry:
- `/api/orders`
- `/api/products`
- `/api/payment/preference`
- Y más...

### ✅ Utilidades Personalizadas

**Archivo:** `src/lib/sentry-utils.ts`

```tsx
import { captureException, addBreadcrumb, setUser } from '@/lib/sentry-utils';

// Capturar excepción con contexto
captureException(error, { userId: '123', action: 'checkout' });

// Agregar breadcrumb (rastro de acciones)
addBreadcrumb('User clicked checkout', 'user_action', { cartTotal: 100 });

// Setear usuario para contexto
setUser({ id: '123', email: 'user@example.com', name: 'Juan' });
```

### ✅ Sampling Rates

**Producción:**
- **Traces:** 10% (reduce costo)
- **Session Replays:** 10% de sesiones normales
- **Error Replays:** 100% de sesiones con errores

**Desarrollo:**
- **Traces:** 100% (debugging completo)
- **Debug mode:** Habilitado

---

## 🔒 Seguridad

### Variables Públicas vs Privadas

| Variable | Público | Descripción |
|----------|---------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | ✅ Sí | Solo escritura, seguro exponerlo |
| `SENTRY_AUTH_TOKEN` | ❌ NO | **NUNCA** exponer en cliente |
| `SENTRY_ORG` | ❌ NO | Solo para builds |
| `SENTRY_PROJECT` | ❌ NO | Solo para builds |

**⚠️ IMPORTANTE:** Las variables `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, y `SENTRY_PROJECT` son **privadas** y solo se usan en el servidor durante el build para subir sourcemaps.

---

## 🎯 Buenas Prácticas

### 1. Agregar Contexto a Errores

```tsx
Sentry.captureException(error, {
  tags: {
    component: 'CheckoutForm',
    user_action: 'payment_submit',
  },
  contexts: {
    cart: {
      items: cartItems.length,
      total: cartTotal,
    },
  },
});
```

### 2. Filtrar Información Sensible

```tsx
Sentry.init({
  beforeSend(event, hint) {
    // Filtrar datos sensibles
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }
    return event;
  },
});
```

### 3. Establecer Usuario en Login

```tsx
import { setUser } from '@/lib/sentry-utils';

// Después de login exitoso
setUser({
  id: user.id,
  email: user.email,
  name: user.name,
});
```

---

## 📈 Monitoreo en Producción

### Dashboard Principal

1. **Issues:** Errores capturados y agrupados
2. **Performance:** Métricas de rendimiento
3. **Releases:** Versiones desplegadas
4. **Alerts:** Configurar notificaciones

### Configurar Alertas

1. Ve a **Alerts** en Sentry
2. Click en **"Create Alert"**
3. Configura:
   - Condición: "Errors increase by X%"
   - Notificación: Email, Slack, etc.

---

## 🛠️ Troubleshooting

### Errores No Aparecen en Sentry

1. ✅ Verifica que `NEXT_PUBLIC_SENTRY_DSN` esté configurado
2. ✅ Revisa que no haya errores en la consola del navegador
3. ✅ Confirma que el DSN sea válido
4. ✅ Verifica que el proyecto en Sentry esté activo

### Sourcemaps No Suben

1. ✅ Verifica `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
2. ✅ Asegúrate de que el token tenga los scopes correctos
3. ✅ Revisa los logs del build: `npm run build`

### Demasiados Eventos (Exceder Quota)

Ajusta los sampling rates en `sentry.client.config.ts`:

```typescript
Sentry.init({
  tracesSampleRate: 0.05, // 5% en vez de 10%
  replaysSessionSampleRate: 0.05, // 5% en vez de 10%
});
```

---

## 📚 Recursos

- **Docs oficiales:** [https://docs.sentry.io/platforms/javascript/guides/nextjs/](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- **GitHub:** [https://github.com/getsentry/sentry-javascript](https://github.com/getsentry/sentry-javascript)
- **Dashboard:** [https://sentry.io](https://sentry.io)

---

## ✅ Checklist de Configuración

- [ ] Cuenta en Sentry creada
- [ ] Proyecto Next.js creado
- [ ] DSN copiado a `.env`
- [ ] Auth Token creado con scopes correctos
- [ ] Organization slug configurado
- [ ] Project slug configurado
- [ ] Errores de prueba capturados correctamente
- [ ] Sourcemaps suben en build de producción

---

**🎉 ¡Listo! Sentry está completamente configurado para monitorear errores en producción.**
