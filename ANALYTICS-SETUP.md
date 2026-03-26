# 📊 Configuración de Analytics - Google Analytics 4 & Meta Pixel

Esta guía te ayudará a configurar Google Analytics 4 (GA4) y Meta Pixel (Facebook Pixel) en tu aplicación Porkyrios.

---

## 📋 Tabla de Contenidos

1. [Google Analytics 4 (GA4)](#google-analytics-4-ga4)
2. [Meta Pixel (Facebook Pixel)](#meta-pixel-facebook-pixel)
3. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
4. [Eventos que se Rastrean](#eventos-que-se-rastrean)
5. [Verificación de Instalación](#verificación-de-instalación)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🔍 Google Analytics 4 (GA4)

### Paso 1: Crear Cuenta de Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Administrador"** (ícono de engranaje en la esquina inferior izquierda)

### Paso 2: Crear Propiedad

1. En la columna **"Cuenta"**, selecciona o crea una cuenta
2. En la columna **"Propiedad"**, haz clic en **"Crear propiedad"**
3. Completa la información:
   - **Nombre de la propiedad**: "Porkyrios"
   - **Zona horaria**: Selecciona tu zona horaria
   - **Moneda**: Selecciona tu moneda (MXN)
4. Haz clic en **"Siguiente"**

### Paso 3: Configurar Detalles del Negocio

1. Selecciona la categoría del sector: **"Comida y bebidas"**
2. Tamaño de la empresa: Selecciona el apropiado
3. Selecciona los objetivos comerciales que te interesen
4. Haz clic en **"Crear"**
5. Acepta los términos del servicio

### Paso 4: Configurar Flujo de Datos Web

1. En **"Recopilación y modificación de datos"**, selecciona **"Flujos de datos"**
2. Haz clic en **"Añadir flujo"** → **"Web"**
3. Completa la información:
   - **URL del sitio web**: `https://tudominio.com` (o tu URL de producción)
   - **Nombre del flujo**: "Sitio web de Porkyrios"
4. Haz clic en **"Crear flujo"**

### Paso 5: Obtener Measurement ID

1. Una vez creado el flujo, verás la página de detalles
2. En la parte superior derecha, encontrarás tu **"ID de medición"**
3. Copia el ID (formato: `G-XXXXXXXXXX`)
4. Guárdalo para el siguiente paso

### Ejemplo de Measurement ID:
```
G-ABC1234567
```

---

## 📘 Meta Pixel (Facebook Pixel)

### Paso 1: Acceder a Facebook Business Manager

1. Ve a [Facebook Business Manager](https://business.facebook.com/)
2. Inicia sesión con tu cuenta de Facebook
3. Si no tienes una cuenta empresarial, créala siguiendo las instrucciones

### Paso 2: Crear o Acceder a Events Manager

1. En el menú lateral izquierdo, busca **"Events Manager"**
2. Si no lo ves, ve a **"Todas las herramientas"** → **"Events Manager"**

### Paso 3: Crear un Pixel

1. En Events Manager, haz clic en **"Conectar orígenes de datos"**
2. Selecciona **"Web"**
3. Haz clic en **"Empezar"**
4. Selecciona **"Meta Pixel"** → **"Conectar"**

### Paso 4: Configurar el Pixel

1. Introduce un nombre para tu píxel: **"Porkyrios Pixel"**
2. Opcionalmente, añade la URL de tu sitio web
3. Haz clic en **"Crear píxel"**

### Paso 5: Obtener Pixel ID

1. Una vez creado, verás los detalles de tu píxel
2. El **Pixel ID** aparece en la parte superior (es un número de 15-16 dígitos)
3. También puedes encontrarlo en la URL: 
   ```
   business.facebook.com/events_manager2/list/pixel/[TU_PIXEL_ID]/overview
   ```
4. Copia el Pixel ID
5. Guárdalo para el siguiente paso

### Ejemplo de Pixel ID:
```
123456789012345
```

---

## ⚙️ Configuración de Variables de Entorno

### Paso 1: Abrir archivo .env

1. En la raíz de tu proyecto, abre o crea el archivo `.env`
2. Si no existe, copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

### Paso 2: Agregar los IDs

Agrega o actualiza las siguientes líneas en tu archivo `.env`:

```bash
# Google Analytics 4 Measurement ID
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Meta Pixel ID
NEXT_PUBLIC_META_PIXEL_ID=1234567890123456
```

**Reemplaza los valores de ejemplo con tus IDs reales:**
- `G-XXXXXXXXXX` → Tu Measurement ID de GA4
- `1234567890123456` → Tu Pixel ID de Meta

### Ejemplo completo:
```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ABC1234567

# Meta Pixel
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
```

### Paso 3: Reiniciar el servidor de desarrollo

```bash
# Si estás usando bun
bun dev

# Si estás usando npm
npm run dev
```

---

## 📊 Eventos que se Rastrean

### Eventos Automáticos

✅ **PageView**: Se rastrea automáticamente cada vez que un usuario visita una página

### Eventos Personalizados en `/menu`

✅ **add_to_cart**: Se rastrea cuando un usuario agrega un producto al carrito

**Datos enviados a Google Analytics:**
- `action`: "add_to_cart"
- `category`: "ecommerce"
- `label`: Nombre del producto
- `value`: Precio del producto

**Datos enviados a Meta Pixel:**
- `event`: "AddToCart"
- `content_ids`: [ID del producto]
- `content_name`: Nombre del producto
- `content_type`: "product"
- `value`: Precio
- `currency`: "MXN"

### Cómo Agregar Más Eventos

Puedes agregar más eventos en cualquier componente importando las funciones:

```typescript
import { trackGAEvent, trackFbqEvent } from "@/lib/analytics";

// Ejemplo: Rastrear búsqueda
trackGAEvent({
  action: 'search',
  category: 'engagement',
  label: searchQuery,
});

trackFbqEvent('Search', {
  search_string: searchQuery,
});

// Ejemplo: Rastrear compra completada
trackGAEvent({
  action: 'purchase',
  category: 'ecommerce',
  value: totalAmount,
  transaction_id: orderId,
});

trackFbqEvent('Purchase', {
  value: totalAmount,
  currency: 'MXN',
  content_ids: productIds,
});
```

---

## ✅ Verificación de Instalación

### Verificar Google Analytics 4

1. **Usando Google Analytics:**
   - Ve a tu propiedad en [Google Analytics](https://analytics.google.com/)
   - Navega a **"Informes"** → **"Tiempo real"**
   - Abre tu sitio web en otra pestaña
   - Deberías ver tu visita en tiempo real en GA4

2. **Usando las Herramientas de Desarrollo:**
   - Abre tu sitio web
   - Presiona `F12` para abrir DevTools
   - Ve a la pestaña **"Console"**
   - Escribe: `window.gtag`
   - Si devuelve una función, GA4 está instalado correctamente

3. **Usando Google Tag Assistant (Extensión Chrome):**
   - Instala [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
   - Abre tu sitio web
   - Haz clic en el ícono de la extensión
   - Deberías ver tu tag de GA4 activo

### Verificar Meta Pixel

1. **Usando Facebook Pixel Helper (Extensión Chrome):**
   - Instala [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
   - Abre tu sitio web
   - Haz clic en el ícono de la extensión
   - Deberías ver tu píxel activo con un ícono verde

2. **Usando Events Manager:**
   - Ve a [Events Manager](https://business.facebook.com/events_manager/)
   - Selecciona tu píxel
   - Ve a la pestaña **"Prueba de eventos"**
   - Ingresa la URL de tu sitio: `http://localhost:3000` (para desarrollo)
   - Haz clic en **"Abrir sitio web"**
   - Navega por tu sitio y deberías ver los eventos aparecer en tiempo real

3. **Usando las Herramientas de Desarrollo:**
   - Abre tu sitio web
   - Presiona `F12` para abrir DevTools
   - Ve a la pestaña **"Console"**
   - Escribe: `window.fbq`
   - Si devuelve una función, Meta Pixel está instalado correctamente

---

## 🔧 Solución de Problemas

### Google Analytics no aparece en los informes

**Problema:** No veo datos en GA4 después de varias horas.

**Soluciones:**
1. Verifica que el Measurement ID sea correcto en `.env`
2. Asegúrate de que la variable comience con `NEXT_PUBLIC_`
3. Reinicia el servidor de desarrollo
4. Limpia la caché del navegador: `Ctrl + Shift + Delete`
5. Verifica en "Tiempo real" primero (los informes estándar tardan 24-48 horas)
6. Asegúrate de no tener bloqueadores de anuncios o extensiones que bloqueen analytics

### Meta Pixel no se activa

**Problema:** Facebook Pixel Helper muestra que el píxel no está activo.

**Soluciones:**
1. Verifica que el Pixel ID sea correcto (solo números, sin guiones ni espacios)
2. Asegúrate de que la variable comience con `NEXT_PUBLIC_`
3. Reinicia el servidor de desarrollo
4. Verifica en la Consola si hay errores de JavaScript
5. Desactiva extensiones como AdBlock que puedan bloquear el píxel
6. Verifica que el script se cargue en la pestaña "Network" de DevTools

### `gtag is not defined` o `fbq is not defined`

**Problema:** Errores en la consola al intentar rastrear eventos.

**Soluciones:**
1. Los scripts se cargan con `strategy="afterInteractive"`, espera a que la página esté completamente cargada
2. Verifica que las variables de entorno estén configuradas correctamente
3. Solo llama a las funciones de tracking en componentes cliente (`"use client"`)
4. Agrega verificaciones condicionales:
   ```typescript
   if (typeof window !== 'undefined' && window.gtag) {
     window.gtag('event', 'test');
   }
   ```

### No veo eventos personalizados en GA4 o Meta

**Problema:** Solo veo PageViews, no otros eventos.

**Soluciones:**
1. Verifica que estés importando correctamente las funciones:
   ```typescript
   import { trackGAEvent, trackFbqEvent } from "@/lib/analytics";
   ```
2. Asegúrate de llamar a las funciones cuando ocurra el evento
3. Verifica en la Consola si hay errores
4. En GA4, los eventos personalizados pueden tardar hasta 24 horas en aparecer en los informes
5. Usa "DebugView" en GA4 para ver eventos en tiempo real

### Los scripts no se cargan en producción

**Problema:** Los scripts funcionan en desarrollo pero no en producción.

**Soluciones:**
1. Verifica que las variables de entorno estén configuradas en tu plataforma de deployment (Vercel, Netlify, etc.)
2. Las variables deben comenzar con `NEXT_PUBLIC_` para estar disponibles en el cliente
3. Después de agregar variables, vuelve a desplegar la aplicación
4. Verifica los logs de deployment para errores

---

## 📚 Recursos Adicionales

### Google Analytics 4
- [Documentación oficial de GA4](https://support.google.com/analytics/answer/9304153)
- [Guía de eventos de GA4](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Google Tag Manager](https://tagmanager.google.com/)

### Meta Pixel
- [Documentación de Meta Pixel](https://developers.facebook.com/docs/meta-pixel)
- [Eventos estándar de Meta](https://developers.facebook.com/docs/meta-pixel/reference)
- [Events Manager](https://business.facebook.com/events_manager/)

### Next.js
- [@next/third-parties](https://nextjs.org/docs/app/guides/third-party-libraries)
- [Script Component](https://nextjs.org/docs/app/api-reference/components/script)

---

## 🎉 ¡Listo!

Tu aplicación Porkyrios ahora está configurada con Google Analytics 4 y Meta Pixel. Los eventos se rastrearán automáticamente y podrás ver análisis detallados del comportamiento de tus usuarios.

### Próximos Pasos Recomendados:

1. ✅ Configura objetivos de conversión en GA4
2. ✅ Crea audiencias personalizadas en Meta para retargeting
3. ✅ Configura alertas en GA4 para cambios importantes en el tráfico
4. ✅ Agrega más eventos personalizados según tus necesidades de negocio
5. ✅ Revisa los informes semanalmente para optimizar tu estrategia

**¿Necesitas ayuda?** Revisa la sección de [Solución de Problemas](#solución-de-problemas) o consulta la documentación oficial.
