# ❓ Preguntas Frecuentes (FAQ) - Porkyrios

Respuestas a las preguntas más comunes sobre Porkyrios.

---

## 📋 General

### ¿Qué es Porkyrios?

Porkyrios es un sistema completo de pedidos online diseñado específicamente para restaurantes. Incluye menú digital, carrito de compras, rastreo de pedidos en tiempo real, panel de administración y es instalable como una app nativa (PWA).

### ¿Es gratis?

Sí, Porkyrios es de código abierto bajo licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente. Los únicos costos son los de hosting (Vercel es gratis para proyectos personales) y la base de datos Turso (tier gratuito disponible).

### ¿Qué tipo de restaurantes pueden usar Porkyrios?

Cualquier restaurante que necesite recibir pedidos online. Está optimizado para comida mexicana pero es completamente personalizable para cualquier tipo de cocina.

---

## 🚀 Instalación y Configuración

### ¿Cuánto tiempo toma configurar Porkyrios?

Aproximadamente 15-20 minutos siguiendo la guía de instalación:
1. Clonar repositorio: 2 min
2. Instalar dependencias: 3 min
3. Configurar Turso: 5 min
4. Configurar variables de entorno: 2 min
5. Ejecutar migraciones: 3 min
6. Agregar datos iniciales: 5 min

### ¿Necesito conocimientos técnicos?

Para la instalación básica, necesitas conocimientos básicos de:
- Terminal/línea de comandos
- Git
- Variables de entorno

Para personalización avanzada:
- React y Next.js
- TypeScript
- Tailwind CSS

### ¿Qué pasa si no tengo cuenta de Turso?

Turso es obligatorio para la base de datos. Puedes crear una cuenta gratuita en [turso.tech](https://turso.tech) que incluye:
- 500 MB de almacenamiento
- 1 billion row reads
- 25 million row writes
- Suficiente para la mayoría de proyectos pequeños

**Alternativas:**
- Podrías adaptar el código para usar PostgreSQL
- O cualquier otra base de datos compatible con Drizzle ORM

### ¿Cómo cambio la contraseña del admin?

Edita el archivo `.env.local`:

```env
ADMIN_PASSWORD=TuNuevaContraseñaSegura2025
```

Reinicia el servidor para aplicar cambios.

---

## 💻 Uso del Sistema

### ¿Cómo agrego productos al menú?

1. Accede al panel admin: `/admin`
2. Ve a la pestaña "Productos"
3. Completa el formulario de nuevo producto
4. Clic en "Agregar Producto"

O usa la API:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Taco al Pastor",
    "price": 3.50,
    "categoryId": 1,
    "stock": 50
  }'
```

### ¿Cómo funcionan las categorías?

Las categorías organizan tu menú. Cada producto puede tener una categoría. Las categorías incluyen un emoji para mejor UX.

**Ejemplo:**
- 🌮 Tacos
- 🥖 Tortas
- 🧀 Quesadillas

### ¿Puedo tener productos sin categoría?

Sí, el campo `categoryId` es opcional. Los productos sin categoría aparecerán en una sección "Sin categoría" en el menú.

### ¿Cómo funciona el stock?

El stock se gestiona automáticamente:
- Al crear un producto, defines stock inicial
- Se muestra alerta cuando stock < 5
- Se muestra "Agotado" cuando stock = 0
- Puedes actualizar stock manualmente en el panel admin

**Futuro:** Decrementación automática de stock al confirmar pedido.

### ¿Los pedidos se actualizan en tiempo real?

Sí y no. Actualmente usa **polling** (consulta cada 5 segundos). El cliente revisa el estado del pedido periódicamente.

**Futuro:** Implementación de WebSockets para actualizaciones instantáneas.

---

## 📱 PWA (App Instalable)

### ¿Qué es una PWA?

Progressive Web App - es una aplicación web que puede instalarse como si fuera una app nativa en tu teléfono o computadora.

**Ventajas:**
- ✅ Instalable sin App Store/Play Store
- ✅ Funciona offline
- ✅ Más rápida que una web normal
- ✅ Puede enviarse al home screen
- ✅ Splash screen personalizado

### ¿Cómo instalo Porkyrios en mi móvil?

**Android (Chrome):**
1. Abre el sitio
2. Aparecerá un banner "¡Instala Porkyrios!"
3. Clic en "Instalar App"

**iOS (Safari):**
1. Abre el sitio en Safari
2. Toca el botón "Compartir"
3. Selecciona "Agregar a pantalla de inicio"

**Desktop:**
1. Abre el sitio
2. Busca el ícono (+) en la barra de URL
3. Clic en "Instalar Porkyrios"

### ¿Funciona sin internet?

Parcialmente. Las páginas visitadas previamente se cachean y funcionan offline. Sin embargo, las funciones que requieren base de datos (agregar al carrito, hacer pedidos) necesitan conexión.

### ¿Cómo actualizo la PWA?

La PWA se actualiza automáticamente. Cuando hay una nueva versión:
1. El Service Worker detecta cambios
2. Descarga nueva versión en segundo plano
3. Muestra notificación "Actualización disponible"
4. Al recargar, usa la nueva versión

---

## 🔐 Panel de Administración

### ¿Puedo tener múltiples usuarios admin?

Actualmente no. Solo hay una contraseña compartida. 

**Futuro:** Sistema de autenticación con roles y permisos.

### ¿Cómo veo las estadísticas?

En el Dashboard del panel admin verás:
- Pedidos del día
- Ingresos totales
- Pedidos en preparación
- Pedidos completados

**Futuro:** Gráficas avanzadas, reportes exportables, comparativas por período.

### ¿Puedo eliminar pedidos?

Sí, pero **no es recomendado** para mantener historial. Mejor marca como "Cancelado".

### ¿El panel funciona en móvil?

Sí, el panel es completamente responsive y funciona perfectamente en tablets y móviles.

---

## 💳 Pagos

### ¿Porkyrios procesa pagos reales?

No actualmente. La pantalla de pago es un **mockup** para demostración. El cliente ingresa datos de tarjeta pero NO se cobra.

**Para producción, debes integrar:**
- Stripe
- MercadoPago
- PayPal
- Openpay

### ¿Cómo integro pagos reales?

Necesitarás:
1. Cuenta en proveedor de pagos
2. Instalar SDK correspondiente
3. Modificar `src/app/payment/page.tsx`
4. Agregar lógica de procesamiento
5. Manejar webhooks para confirmaciones

**Recursos:**
- [Stripe con Next.js](https://stripe.com/docs/payments/quickstart)
- [MercadoPago SDK](https://www.mercadopago.com.mx/developers)

---

## 🚢 Despliegue

### ¿Dónde puedo hospedar Porkyrios?

Plataformas recomendadas:
- **Vercel** (recomendado) - Deploy en 2 minutos
- **Netlify** - Excelente para JAMstack
- **Railway** - Incluye base de datos
- **Cloudflare Pages** - Global edge network

### ¿Cuánto cuesta el hosting?

**Gratis para proyectos pequeños:**
- Vercel: Hobby plan (gratis)
- Netlify: Starter plan (gratis)
- Turso: 500MB gratis

**Costos estimados para producción:**
- Vercel Pro: $20/mes
- Turso Scaler: $29/mes
- Total: ~$50/mes

### ¿Necesito un dominio personalizado?

No es obligatorio. Las plataformas te dan un subdominio gratis:
- Vercel: `tu-app.vercel.app`
- Netlify: `tu-app.netlify.app`

Para dominio personalizado:
- Compra dominio en Namecheap/GoDaddy (~$10-15/año)
- Configura DNS en tu plataforma de hosting

### ¿Cómo configuro HTTPS?

Las plataformas modernas incluyen SSL/HTTPS automáticamente. No necesitas hacer nada.

---

## 🔧 Personalización

### ¿Cómo cambio los colores?

Edita `src/app/globals.css` y busca las variables CSS:

```css
:root {
  --primary: oklch(0.205 0 0);  /* Negro */
  --background: oklch(1 0 0);    /* Blanco */
  /* ... otros colores */
}
```

También puedes cambiar el color principal en componentes:
- Busca `bg-[#FF6B35]` (naranja actual)
- Reemplaza con tu color: `bg-blue-500`

### ¿Cómo cambio el logo?

1. Reemplaza los iconos en `public/`:
   - `icon-192x192.png`
   - `icon-512x512.png`
   - Otros tamaños

2. Actualiza `public/manifest.json`:
   ```json
   {
     "name": "Tu Restaurante",
     "short_name": "Tu Nombre"
   }
   ```

### ¿Cómo agrego idiomas?

Actualmente solo está en español. Para agregar inglés:

1. Instala i18n:
   ```bash
   npm install next-intl
   ```

2. Crea archivos de traducción:
   ```
   messages/
     es.json
     en.json
   ```

3. Configura Next.js para i18n

**Alternativa simple:** Buscar y reemplazar textos manualmente.

### ¿Puedo cambiar el diseño completamente?

Sí, todo el código es personalizable. Los componentes están en:
- `src/app/` - Páginas
- `src/components/` - Componentes reutilizables
- `src/app/globals.css` - Estilos globales

---

## 📊 Rendimiento

### ¿Qué tan rápido es Porkyrios?

**Lighthouse Score (objetivo):**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

**Optimizaciones incluidas:**
- Server Components de Next.js
- Lazy loading de imágenes
- Code splitting automático
- Service Worker para caché
- Edge deployment con Vercel

### ¿Soporta cuántos usuarios concurrentes?

**Con Turso Free Tier:**
- ~100-200 usuarios concurrentes
- Depende de las consultas

**Con Turso Scaler:**
- Miles de usuarios concurrentes
- Replicación global

### ¿Cómo optimizo la base de datos?

Ya incluye optimizaciones:
- Índices en columnas frecuentes
- Queries optimizados con Drizzle
- Límites en consultas

**Para más optimización:**
- Agregar caché con Redis
- Implementar paginación
- Usar queries preparados

---

## 🐛 Problemas Comunes

### Error: "Module not found" al hacer build

**Causa:** Dependencia faltante o caché corrupta

**Solución:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Error: "Database connection failed"

**Causa:** Credenciales incorrectas de Turso

**Solución:**
1. Verifica `DATABASE_URL` en `.env.local`
2. Verifica `DATABASE_AUTH_TOKEN`
3. Regenera token si expiró:
   ```bash
   turso db tokens create nombre-db
   ```

### La PWA no se actualiza

**Causa:** Service Worker cachea versión vieja

**Solución:**
1. Incrementa versión en `public/sw.js`:
   ```js
   const CACHE_VERSION = 'v2'; // Cambiar número
   ```
2. Hard refresh: Ctrl + Shift + R
3. O borra caché del navegador

### El carrito se vacía al recargar

**Causa:** localStorage no está funcionando

**Solución:**
1. Verifica que no estés en modo incógnito
2. Verifica permisos del navegador
3. Revisa console para errores

### Productos no aparecen en el menú

**Posibles causas:**
- Producto está desactivado → Activar en admin
- Categoría está desactivada → Activar categoría
- Stock es 0 → Actualizar stock
- Error en API → Revisar consola del navegador

---

## 📞 Soporte

### ¿Dónde puedo obtener ayuda?

- 📧 **Email**: soporte@porkyrios.com
- 🐛 **GitHub Issues**: [Reportar bug](https://github.com/tu-usuario/porkyrios/issues)
- 📖 **Documentación**: `/docs`
- 💬 **Discussions**: [GitHub Discussions](https://github.com/tu-usuario/porkyrios/discussions)

### ¿Ofrecen servicios de personalización?

Porkyrios es open source y puedes contratar a cualquier desarrollador para personalizarlo. 

Si necesitas soporte comercial o personalización profesional, contacta a: enterprise@porkyrios.com

### ¿Puedo contribuir al proyecto?

¡Sí! Lee [CONTRIBUTING.md](../CONTRIBUTING.md) para saber cómo contribuir.

---

## 🔮 Futuro

### ¿Qué funcionalidades vienen próximamente?

Ver [CHANGELOG.md](../CHANGELOG.md) sección "Unreleased":
- Autenticación de usuarios
- Pagos reales (Stripe, MercadoPago)
- Push notifications
- WebSockets para tiempo real
- Reportes avanzados
- Multi-idioma
- Y más...

### ¿Puedo solicitar una funcionalidad?

Sí, abre un issue en GitHub con la etiqueta "feature request" y describe tu idea.

---

<div align="center">
  <strong>¿Tu pregunta no está aquí?</strong>
  <br />
  <sub>Abre un issue o envía un email a soporte@porkyrios.com</sub>
</div>
