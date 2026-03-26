# 📱 Porkyrios PWA - Guía de Implementación

## ✅ FASE 5 COMPLETADA - Progressive Web App

Porkyrios ahora es una **Progressive Web App (PWA)** completamente funcional e instalable en dispositivos móviles y desktop.

---

## 🎯 Características Implementadas

### 1. **Manifest.json** ✅
- Ubicación: `/public/manifest.json`
- Configuración completa de la app
- Iconos en todos los tamaños necesarios (72x72 hasta 512x512)
- Screenshots para tiendas de aplicaciones
- Atajos rápidos (Hacer Pedido, Rastrear, Ver Carrito)
- Colores de tema: `#FF6B35` (naranja Porkyrios)

### 2. **Service Worker** ✅
- Ubicación: `/public/sw.js`
- **Estrategias de caché:**
  - Network-first para contenido dinámico
  - Cache-first para imágenes
  - API requests sin caché (siempre frescos)
- **Caché de assets críticos:**
  - Páginas: `/`, `/menu`, `/cart`, `/tracking`, `/payment`
  - Iconos y manifest
- **Funcionalidad offline:**
  - Página de offline personalizada
  - Fallback a caché cuando no hay conexión
- **Preparado para futuro:**
  - Background sync para pedidos offline
  - Push notifications para actualizaciones de pedidos

### 3. **Iconos PWA (8 tamaños)** ✅
- 72x72, 96x96, 128x128, 144x144
- 152x152 (Apple touch icon)
- 192x192 (Android launcher)
- 384x384, 512x512 (pantallas de alta resolución)
- Formato: PNG con transparencia
- Diseño: Logo de Porkyrios optimizado para app icon

### 4. **Banner de Instalación** ✅
- Componente: `src/components/InstallPWA.tsx`
- Detecta si la app es instalable
- Prompt personalizado de instalación
- Opción de "Ahora no" con persistencia
- Diseño coherente con marca Porkyrios
- Se oculta automáticamente si ya está instalada

### 5. **PWA Status Monitor** ✅
- Componente: `src/components/PWAStatus.tsx`
- Detecta cuando la app está instalada
- Notificaciones de instalación exitosa
- Alertas de actualizaciones disponibles
- Integrado con sistema de toasts (Sonner)

### 6. **Metadata y SEO** ✅
- Meta tags para PWA en `src/app/layout.tsx`
- Apple Web App tags
- Theme color configurado
- Viewport optimizado
- Icons link tags

### 7. **Assets Adicionales** ✅
- `public/offline.html` - Página de offline branded
- `public/screenshot-1.png` - Screenshot para manifest
- `public/robots.txt` - SEO configuration
- `scripts/generate-pwa-icons.js` - Script de generación

---

## 🚀 Cómo Instalar la PWA

### En Android (Chrome/Edge)
1. Abre el sitio en Chrome
2. Aparecerá un banner en la parte inferior: "¡Instala Porkyrios!"
3. Click en "Instalar App"
4. Confirma la instalación
5. La app aparecerá en tu pantalla de inicio

**O manualmente:**
1. Abre el sitio en Chrome
2. Toca el menú (⋮) → "Agregar a pantalla de inicio"
3. Confirma el nombre y toca "Agregar"

### En iOS (Safari)
1. Abre el sitio en Safari
2. Toca el botón "Compartir" (□↑)
3. Scroll down y toca "Agregar a pantalla de inicio"
4. Edita el nombre si quieres
5. Toca "Agregar"

### En Desktop (Chrome/Edge)
1. Abre el sitio
2. Busca el ícono de instalación (+) en la barra de URL
3. Click en "Instalar"
4. La app se abrirá en su propia ventana

---

## 🔧 Verificación Técnica

### Comprobar Service Worker
```javascript
// En la consola del navegador:
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers activos:', regs);
});
```

### Verificar Manifest
1. Chrome DevTools → Application → Manifest
2. Verificar que todos los campos estén completos
3. Verificar que los iconos se muestren correctamente

### Test de Instalación
1. Chrome DevTools → Application → Service Workers
2. Click en "Update" para forzar actualización
3. Chrome DevTools → Application → Manifest → "Add to homescreen"

### Lighthouse PWA Score
1. Chrome DevTools → Lighthouse
2. Seleccionar "Progressive Web App"
3. Click "Generate report"
4. **Objetivo: 90-100 puntos** ✅

---

## 📦 Archivos Generados

```
public/
├── manifest.json              # PWA manifest
├── sw.js                      # Service worker
├── offline.html               # Página offline
├── robots.txt                 # SEO
├── screenshot-1.png           # App screenshot
├── icon-72x72.png            # Iconos PWA
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png

src/
├── app/
│   ├── layout.tsx            # Meta tags PWA
│   └── sw-register.tsx       # Registro SW
└── components/
    ├── InstallPWA.tsx        # Banner instalación
    └── PWAStatus.tsx         # Monitor estado

scripts/
└── generate-pwa-icons.js     # Generador iconos
```

---

## 🎨 Personalización de Colores

La PWA usa el color principal de Porkyrios:
- **Theme Color:** `#FF6B35` (naranja/rojo)
- **Background:** Gradiente `#FF6B35` → `#FF8E53`

Para cambiar los colores:
1. Editar `public/manifest.json` → `theme_color` y `background_color`
2. Editar `src/app/layout.tsx` → `themeColor` en metadata
3. Editar `public/sw.js` → No requiere cambios
4. Regenerar iconos con nuevo color de fondo

---

## 🔄 Actualización de la PWA

El Service Worker verifica actualizaciones cada 60 segundos cuando la app está abierta.

### Para forzar actualización:
```javascript
// En sw-register.tsx
registration.update();
```

### Actualizar versión del caché:
```javascript
// En public/sw.js
const CACHE_NAME = 'porkyrios-v2'; // Incrementar versión
```

---

## 📱 Funcionalidades Offline

### Qué funciona sin conexión:
- ✅ Navegación entre páginas cacheadas
- ✅ Visualización de productos previamente visitados
- ✅ Interfaz completa (UI/UX)
- ✅ Página de offline personalizada

### Qué requiere conexión:
- ❌ Consultar productos actualizados
- ❌ Crear nuevos pedidos
- ❌ Ver stock en tiempo real
- ❌ Rastrear pedidos

### Futuras mejoras (preparadas en SW):
- 🔄 Background sync para pedidos offline
- 🔔 Push notifications para estado de pedidos
- 💾 IndexedDB para caché de productos

---

## 🎯 Shortcuts (Atajos Rápidos)

La PWA incluye 3 atajos que aparecen al mantener presionado el ícono:

1. **🍽️ Hacer Pedido** → `/menu`
2. **📍 Rastrear Pedido** → `/tracking`
3. **🛒 Ver Carrito** → `/cart`

---

## 📊 Métricas de PWA

### Criterios cumplidos:
- ✅ HTTPS (requerido en producción)
- ✅ Service Worker registrado
- ✅ Manifest.json válido
- ✅ Iconos en tamaños requeridos
- ✅ Responsive design
- ✅ Fast load time
- ✅ Installable
- ✅ Works offline
- ✅ Themed splash screen

### Score Lighthouse estimado:
- **Performance:** 90-95
- **Accessibility:** 95-100
- **Best Practices:** 95-100
- **SEO:** 90-100
- **PWA:** 90-100 ✅

---

## 🚨 Troubleshooting

### La app no se instala
1. Verificar que `manifest.json` sea accesible
2. Comprobar que el Service Worker esté registrado
3. Verificar que los iconos existan y sean del tamaño correcto
4. Asegurar que la app se sirva por HTTPS

### Service Worker no se actualiza
1. Cerrar todas las pestañas de la app
2. Chrome DevTools → Application → Service Workers → "Unregister"
3. Recargar la página (Ctrl/Cmd + Shift + R)

### Los iconos no se ven
1. Verificar rutas en `manifest.json`
2. Verificar que los archivos PNG existan en `/public`
3. Limpiar caché del navegador

---

## 🎉 Resultado Final

**Porkyrios es ahora una PWA completa con:**

✅ Instalable en móviles y desktop  
✅ Funciona offline con caché inteligente  
✅ Banner de instalación personalizado  
✅ Iconos optimizados para todas las plataformas  
✅ Service Worker con estrategias de caché  
✅ Splash screen automático con colores de marca  
✅ Atajos rápidos a funciones principales  
✅ Notificaciones de instalación y actualizaciones  
✅ SEO optimizado con robots.txt  
✅ Preparada para push notifications (futuro)  

---

## 📈 Próximos Pasos (Opcionales)

### FASE 6 - Documentación:
- [ ] README.md principal del proyecto
- [ ] Documentación de API endpoints
- [ ] Guía de usuario para admin panel

### Mejoras Futuras PWA:
- [ ] Push notifications para pedidos
- [ ] Background sync para pedidos offline
- [ ] Caché de productos con IndexedDB
- [ ] Share API para compartir productos
- [ ] Payment Request API integration

---

**Creado:** Noviembre 15, 2024  
**Versión PWA:** 1.0.0  
**Próxima actualización:** FASE 6 (Documentación)
