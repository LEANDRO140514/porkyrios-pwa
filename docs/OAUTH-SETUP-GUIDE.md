# 🔐 Guía Completa: Configuración OAuth (Google & Facebook)

## 📋 Tabla de Contenidos
1. [¿Por qué usar OAuth?](#por-qué-usar-oauth)
2. [Configuración Google OAuth](#configuración-google-oauth)
3. [Configuración Facebook OAuth](#configuración-facebook-oauth)
4. [Ventajas para el Píxel de Facebook](#ventajas-para-el-píxel-de-facebook)
5. [Pruebas y Verificación](#pruebas-y-verificación)

---

## 🎯 ¿Por qué usar OAuth?

### ✅ Beneficios
- **Reduce fricción**: Usuario registra en 1 click vs llenar formulario
- **Aumenta conversiones**: 30-40% más registros con social login
- **Datos verificados**: Google/Facebook ya validaron el email
- **Tracking mejorado**: El píxel de Facebook funciona MEJOR con Facebook Login
- **Menos contraseñas olvidadas**: Usuario usa credenciales que ya conoce

### 📊 Impacto en el Píxel de Facebook
Cuando un usuario inicia sesión con Facebook:
- ✅ El píxel puede rastrear con **mayor precisión**
- ✅ Mejora la **calidad de las audiencias personalizadas**
- ✅ Optimiza las **conversiones en anuncios**
- ✅ Reduce el **costo por adquisición (CPA)**

---

## 🔵 Configuración Google OAuth

### Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Haz clic en el **selector de proyectos** (arriba a la izquierda)
3. Clic en **"NEW PROJECT"**
4. Nombre del proyecto: `Porkyrios OAuth` (o el que prefieras)
5. Clic en **"CREATE"**

### Paso 2: Habilitar APIs necesarias

1. En el menú lateral: **APIs & Services** → **Library**
2. Busca: `Google+ API` (aunque esté deprecada, aún es necesaria para OAuth)
3. Clic en **"ENABLE"**

### Paso 3: Configurar OAuth Consent Screen

1. **APIs & Services** → **OAuth consent screen**
2. Selecciona: **External** (para uso público)
3. Clic en **"CREATE"**

**Información de la aplicación:**
```
App name: Porkyrios
User support email: [tu-email@dominio.com]
App logo: (opcional) sube el logo de Porkyrios

Developer contact information:
Email: [tu-email@dominio.com]
```

4. Clic en **"SAVE AND CONTINUE"**

**Scopes (permisos):**
5. Clic en **"ADD OR REMOVE SCOPES"**
6. Selecciona:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
7. Clic en **"UPDATE"** → **"SAVE AND CONTINUE"**

**Test users (opcional para desarrollo):**
8. Agrega emails de prueba si quieres (opcional)
9. Clic en **"SAVE AND CONTINUE"**

### Paso 4: Crear OAuth Client ID

1. **APIs & Services** → **Credentials**
2. Clic en **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Application type: **Web application**

**Configuración:**
```
Name: Porkyrios Web Client

Authorized JavaScript origins:
- http://localhost:3000
- https://tu-dominio.com (en producción)

Authorized redirect URIs:
- http://localhost:3000/api/auth/callback/google
- https://tu-dominio.com/api/auth/callback/google (en producción)
```

4. Clic en **"CREATE"**

### Paso 5: Copiar Credenciales

Se mostrará un modal con:
```
Client ID: 123456789-abcdefg....apps.googleusercontent.com
Client Secret: GOCSPX-abc123xyz...
```

**Guárdalos en tu archivo `.env.local`:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefg....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz...
```

---

## 🔵 Configuración Facebook OAuth

### Paso 1: Crear App en Facebook Developers

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Clic en **"My Apps"** (arriba derecha)
3. Clic en **"Create App"**

### Paso 2: Seleccionar Tipo de App

1. Elige: **Business** (recomendado para e-commerce)
2. Clic en **"Next"**

### Paso 3: Seleccionar Caso de Uso

1. Selecciona: **Other**
2. Clic en **"Next"**

### Paso 4: Información de la App

```
App name: Porkyrios
App contact email: [tu-email@dominio.com]
Business account: (selecciona tu Business Manager si tienes)
```

3. Clic en **"Create App"**

### Paso 5: Agregar Facebook Login Product

1. En el dashboard de tu app, busca **"Facebook Login"** en productos
2. Clic en **"Set Up"**
3. Selecciona plataforma: **Web**
4. En "Site URL" ingresa: `http://localhost:3000` (o tu dominio)
5. Clic en **"Save"** → **"Continue"**

### Paso 6: Configurar OAuth Redirect URIs

1. En el menú lateral: **Facebook Login** → **Settings**

**Valid OAuth Redirect URIs:**
```
http://localhost:3000/api/auth/callback/facebook
https://tu-dominio.com/api/auth/callback/facebook
```

**Otras configuraciones importantes:**
```
Use Strict Mode for Redirect URIs: ✅ SI (ACTIVAR)
Login from Devices: ✅ NO
Embedded Browser OAuth Login: ✅ SI
```

2. Clic en **"Save Changes"**

### Paso 7: Obtener App ID y App Secret

1. En el menú lateral: **Settings** → **Basic**

Verás:
```
App ID: 1234567890123456
App Secret: [Clic en "Show" para ver] abc123xyz...
```

**Guárdalos en tu archivo `.env.local`:**
```env
FACEBOOK_CLIENT_ID=1234567890123456
FACEBOOK_CLIENT_SECRET=abc123xyz...
```

### Paso 8: Configurar Privacy Policy y Terms of Service (Requerido)

1. En **Settings** → **Basic**
2. Scroll hasta "Privacy Policy URL" y "Terms of Service URL"
3. Ingresa URLs válidas (puedes crear páginas `/privacy` y `/terms` en tu sitio)

Ejemplo:
```
Privacy Policy URL: https://tu-dominio.com/privacy
Terms of Service URL: https://tu-dominio.com/terms
```

4. Clic en **"Save Changes"**

### Paso 9: Publicar la App (Producción)

**Para desarrollo:** La app funciona en modo "Development" con hasta 50 usuarios

**Para producción:**
1. En el dashboard, cambia el switch de **Development** a **Live**
2. Facebook revisará tu app (puede tomar 1-2 días)
3. Necesitarás:
   - Logo de la app
   - Privacy Policy URL
   - Terms of Service URL
   - Descripción de cómo usas Facebook Login

---

## 📱 Ventajas para el Píxel de Facebook

### ¿Por qué Facebook Login mejora el tracking?

Cuando un usuario inicia sesión con Facebook:

1. **Identificación Precisa**: Facebook puede vincular la sesión del usuario con su perfil
2. **Eventos Más Precisos**: Los eventos del píxel se atribuyen correctamente
3. **Mejores Audiencias**: Las audiencias personalizadas son más exactas
4. **Retargeting Efectivo**: Puedes crear audiencias basadas en comportamiento real
5. **Conversiones Optimizadas**: Los anuncios se optimizan con datos más precisos

### Ejemplo de Flujo Mejorado:

**Sin Facebook Login:**
```
Usuario ve anuncio → Visita sitio → Píxel detecta usuario anónimo → Conversión difícil de rastrear
```

**Con Facebook Login:**
```
Usuario ve anuncio → Visita sitio → Inicia sesión con Facebook → Píxel vincula usuario → Conversión rastreada con precisión ✅
```

### Eventos que Mejoran:

- ✅ `InitiateCheckout` - Más preciso
- ✅ `AddPaymentInfo` - Vinculado al usuario real
- ✅ `Purchase` - Atribuido correctamente
- ✅ `CompleteRegistration` - 100% preciso (es nativo de Facebook)

---

## 🧪 Pruebas y Verificación

### Verificar Google OAuth

1. Ve a `/login` en tu aplicación
2. Clic en "Continuar con Google"
3. Deberías ver la pantalla de consentimiento de Google
4. Selecciona tu cuenta
5. Deberías ser redirigido a `/menu` autenticado

**Troubleshooting común:**
- ❌ Error 400: Redirect URI mismatch → Verifica que las URLs coincidan exactamente
- ❌ Error 403: Access denied → Verifica que el scope esté configurado correctamente
- ❌ Error 500: Invalid client → Verifica que el Client ID y Secret sean correctos

### Verificar Facebook OAuth

1. Ve a `/login` en tu aplicación
2. Clic en "Continuar con Facebook"
3. Deberías ver la pantalla de login de Facebook
4. Inicia sesión con tu cuenta
5. Deberías ser redirigido a `/menu` autenticado

**Troubleshooting común:**
- ❌ URL Blocked: Verifica que la URL esté en "Valid OAuth Redirect URIs"
- ❌ App Not Setup: Asegúrate de que Facebook Login esté agregado como producto
- ❌ Invalid OAuth: Verifica "Use Strict Mode for Redirect URIs"

### Verificar en Database

1. Después de iniciar sesión con Google o Facebook
2. Ve al **Database Studio** (tab superior)
3. Busca la tabla `account`
4. Deberías ver un registro con:
   - `provider`: "google" o "facebook"
   - `providerAccountId`: El ID de tu cuenta de Google/Facebook
   - `userId`: Tu user ID en la tabla `user`

---

## 🚀 Checklist Final

### Antes de ir a producción:

**Google OAuth:**
- [ ] Client ID y Secret configurados en `.env`
- [ ] Redirect URIs de producción agregadas
- [ ] OAuth Consent Screen verificado
- [ ] Probado en localhost
- [ ] Probado en dominio de producción

**Facebook OAuth:**
- [ ] App ID y Secret configurados en `.env`
- [ ] Redirect URIs de producción agregadas
- [ ] Privacy Policy URL configurada
- [ ] Terms of Service URL configurada
- [ ] App publicada (modo Live)
- [ ] Probado en localhost
- [ ] Probado en dominio de producción

**Tracking:**
- [ ] Meta Pixel configurado con Facebook Login
- [ ] Eventos de conversión probados
- [ ] Audiencias personalizadas funcionando

---

## 💡 Tips Pro

### Optimización de Conversión

1. **Coloca los botones sociales primero**: Los usuarios prefieren OAuth sobre formularios
2. **Usa íconos reconocibles**: Los botones ya tienen los logos oficiales
3. **Mensajes claros**: "Continuar con Google" es mejor que "Sign in with Google"
4. **Reduce fricciones**: No pidas información adicional después de OAuth

### Seguridad

- ✅ **NUNCA** expongas los Client Secrets en el frontend
- ✅ Usa HTTPS en producción (requerido por OAuth)
- ✅ Valida los tokens en el servidor
- ✅ Implementa rate limiting en los endpoints de auth

### Marketing

- ✅ Usa Facebook Login para mejorar tus campañas publicitarias
- ✅ Crea audiencias personalizadas basadas en usuarios autenticados
- ✅ Optimiza conversiones con datos precisos
- ✅ Reduce CPA con mejor targeting

---

## 📞 Soporte

Si tienes problemas:

1. **Google OAuth**: [Documentación oficial](https://developers.google.com/identity/protocols/oauth2)
2. **Facebook OAuth**: [Documentación oficial](https://developers.facebook.com/docs/facebook-login)
3. **Better Auth**: [Documentación](https://better-auth.com/docs/authentication/social)

---

**¡Tu sistema OAuth está listo! 🎉**

Ahora puedes:
- ✅ Registrar usuarios en 1 click
- ✅ Mejorar el tracking del píxel de Facebook
- ✅ Aumentar conversiones
- ✅ Reducir fricción en el checkout
