# 🔐 Guía del Panel de Administración - Porkyrios

Esta guía te ayudará a usar todas las funciones del panel de administración de Porkyrios.

---

## 📑 Tabla de Contenidos

1. [Acceso al Panel](#acceso-al-panel)
2. [Dashboard](#dashboard)
3. [Gestión de Pedidos](#gestión-de-pedidos)
4. [Gestión de Productos](#gestión-de-productos)
5. [Gestión de Categorías](#gestión-de-categorías)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🔑 Acceso al Panel

### Credenciales por Defecto

- **URL**: `https://tu-dominio.com/admin`
- **Contraseña**: `PORKYRIOS2025`

### Cambiar la Contraseña

Para cambiar la contraseña del panel:

1. Edita el archivo `.env.local`
2. Modifica la variable `ADMIN_PASSWORD`
3. Reinicia el servidor

```env
ADMIN_PASSWORD=TuNuevaContraseñaSegura
```

### Acceso desde Móvil

El panel es completamente responsive y funciona en dispositivos móviles. Usa el mismo enlace `/admin`.

---

## 📊 Dashboard

El Dashboard te muestra una vista general del negocio en tiempo real.

### Estadísticas Principales

**🔵 Pedidos Hoy**
- Muestra el total de pedidos recibidos hoy
- Se actualiza automáticamente con cada nuevo pedido
- Clic para ver lista completa de pedidos

**💚 Ingresos**
- Total de ingresos del día actual
- Incluye todos los pedidos completados y en proceso
- Formato: Pesos mexicanos ($)

**🟠 En Preparación**
- Pedidos con estado: Preparando, Cocinando, o Empacando
- Requieren atención inmediata
- Clic para filtrar vista de pedidos

**🟢 Completados**
- Pedidos finalizados el día de hoy
- Indica eficiencia de operación
- Historial de satisfacción del cliente

### Pedidos Recientes

- Muestra los últimos 5 pedidos
- Información rápida: número de orden, tiempo transcurrido, total y estado
- Clic en "Ver Todos" para gestión completa

### Acciones Rápidas

**📋 Gestionar Menú**
- Acceso directo a productos
- Muestra total de productos activos

**📦 Pedidos**
- Vista completa de todos los pedidos
- Filtros por estado

**📁 Categorías**
- Organización del menú
- Total de categorías activas

---

## 📦 Gestión de Pedidos

### Ver Todos los Pedidos

Accede desde: **Dashboard → Pedidos** o **Pestaña "Pedidos"**

### Información de Cada Pedido

- **Número de Orden**: Identificador único (ej: P001)
- **Estado**: Badge de color según progreso
- **Cliente**: Nombre y teléfono
- **Total**: Monto total del pedido
- **Tiempo**: Hace cuánto se realizó

### Estados de Pedidos

| Estado | Color | Descripción | Siguiente Acción |
|--------|-------|-------------|------------------|
| 🟡 **Preparando** | Amarillo | Pedido recibido | → Cocinando |
| 🟠 **Cocinando** | Naranja | En cocina | → Empacando |
| 🔵 **Empacando** | Azul | Empaquetando | → Listo |
| 🟢 **Listo** | Verde | Para entregar | → Completado |
| ✅ **Completado** | Verde oscuro | Entregado | - |
| ❌ **Cancelado** | Rojo | Cancelado | - |

### Actualizar Estado de Pedido

**Flujo Normal:**
1. Clic en el botón del siguiente estado
2. El pedido avanza automáticamente
3. Notificación de confirmación

**Cancelar Pedido:**
1. Clic en botón rojo "✗ Cancelar"
2. El pedido se marca como cancelado
3. No se puede revertir

### Filtrar Pedidos

Usa el selector desplegable en la parte superior:
- **Todos los estados**: Vista completa
- **Preparando**: Solo pedidos nuevos
- **Cocinando**: En proceso
- **Empacando**: Casi listos
- **Listo**: Para entregar
- **Completado**: Histórico
- **Cancelado**: Pedidos cancelados

### Mejores Prácticas - Pedidos

✅ **Revisar pedidos cada 2-3 minutos**  
✅ **Actualizar estados en tiempo real**  
✅ **Comunicar al cliente cuando esté listo**  
✅ **Marcar completado solo al entregar**  
❌ **No cancelar sin confirmar con cliente**

---

## 🍽️ Gestión de Productos

### Agregar Nuevo Producto

1. Ve a la pestaña **"Productos"**
2. Rellena el formulario:
   - **Nombre*** (obligatorio): "Taco al Pastor"
   - **Precio*** (obligatorio): 3.50
   - **Categoría**: Selecciona del menú
   - **Stock Inicial**: 50
   - **Descripción**: Texto descriptivo opcional
3. Clic en **"+ Agregar Producto"**

### Editar Producto

1. Busca el producto en la lista
2. Clic en el ícono azul de **lápiz (Editar)**
3. Modifica los campos necesarios
4. Clic en **"💾 Guardar"** o **"✗"** para cancelar

### Activar/Desactivar Producto

- **Activo**: Visible en el menú público
- **Inactivo**: Oculto del menú (manteniendo datos)

**Para cambiar:**
1. Clic en botón **"Desactivar"** (naranja) o **"Activar"** (verde)
2. Confirmación automática

**Casos de uso:**
- Producto agotado temporalmente → Desactivar
- Fuera de temporada → Desactivar
- Promoción especial → Activar temporalmente

### Eliminar Producto

⚠️ **Acción irreversible**

1. Clic en botón rojo **"🗑️"**
2. Confirmar eliminación
3. El producto desaparece permanentemente

**Recomendación**: Mejor desactivar que eliminar para mantener historial.

### Filtrar Productos por Categoría

Usa el selector en la parte superior:
- **Todas las categorías**: Vista completa
- **Categoría específica**: Solo productos de esa categoría

### Indicadores de Stock

| Indicador | Descripción | Acción Recomendada |
|-----------|-------------|-------------------|
| ✅ **Stock normal** | > 5 unidades | Ninguna |
| ⚠️ **Stock bajo** | 1-5 unidades | Reponer pronto |
| 🚫 **Agotado** | 0 unidades | Desactivar o reponer |

---

## 📁 Gestión de Categorías

Las categorías organizan tu menú y facilitan la navegación.

### Agregar Nueva Categoría

1. Ve a la pestaña **"Categorías"**
2. Rellena el formulario:
   - **Nombre**: "Tacos"
   - **Emoji**: 🌮 (copia y pega o escribe)
3. Clic en **"+ Agregar"**

### Emojis Recomendados por Categoría

- 🌮 Tacos
- 🥖 Tortas
- 🧀 Quesadillas
- 🥤 Bebidas
- 🍟 Acompañamientos
- 🍰 Postres
- 🌭 Hot Dogs
- 🍕 Pizzas
- 🍗 Pollo

### Activar/Desactivar Categoría

- **Activa**: Visible en el menú público
- **Inactiva**: Oculta (productos también se ocultan)

**Para cambiar:**
1. Clic en **"Desactivar"** o **"Activar"**
2. Todos los productos de la categoría se afectan

### Eliminar Categoría

⚠️ **Solo se puede eliminar si está vacía**

1. Verifica que no tenga productos asociados
2. Clic en botón rojo **"🗑️"**
3. Confirmación automática

**Si tiene productos:**
- Muestra error: "No se puede eliminar. La categoría tiene X producto(s)"
- Debes reasignar o eliminar productos primero

### Reorganizar Productos entre Categorías

1. Ve a **"Productos"**
2. Edita el producto
3. Cambia la categoría en el selector
4. Guarda cambios

---

## 💡 Mejores Prácticas

### Gestión de Inventario

✅ **Actualizar stock después de cada compra grande**  
✅ **Revisar productos con stock bajo diariamente**  
✅ **Desactivar productos agotados inmediatamente**  
✅ **Mantener descripciones claras y atractivas**

### Gestión de Pedidos

✅ **Actualizar estados en tiempo real**  
✅ **Comunicar al cliente cuando esté listo**  
✅ **Revisar pedidos cada 2-3 minutos en horas pico**  
✅ **No eliminar pedidos completados (para histórico)**

### Organización del Menú

✅ **Usar categorías descriptivas**  
✅ **Emojis consistentes y relevantes**  
✅ **Precios claros y actualizados**  
✅ **Descripciones que destaquen ingredientes especiales**

### Seguridad

✅ **Cambiar la contraseña por defecto**  
✅ **No compartir credenciales**  
✅ **Cerrar sesión en dispositivos compartidos**  
✅ **Usar contraseñas fuertes**

---

## 🐛 Solución de Problemas

### No puedo acceder al panel

**Problema**: Contraseña incorrecta

**Solución**:
1. Verifica que estás usando la contraseña correcta (por defecto: `PORKYRIOS2025`)
2. Revisa que no haya espacios al inicio o final
3. Verifica mayúsculas y minúsculas
4. Si olvidaste la contraseña, edita `.env.local`

---

### Los productos no aparecen en el menú público

**Posibles causas**:
- ✅ Producto está desactivado → Activar
- ✅ Categoría está desactivada → Activar categoría
- ✅ Stock está en 0 → Actualizar stock
- ✅ Caché del navegador → Ctrl + F5 para recargar

---

### No puedo eliminar una categoría

**Problema**: "No se puede eliminar. La categoría tiene X producto(s)"

**Solución**:
1. Ve a **"Productos"**
2. Filtra por esa categoría
3. Elimina o reasigna todos los productos
4. Intenta eliminar la categoría nuevamente

---

### Los pedidos no se actualizan

**Solución**:
1. Recarga la página (F5)
2. Verifica tu conexión a internet
3. Cambia a otra pestaña y vuelve
4. Si persiste, reinicia el navegador

---

### Error al crear producto con precio

**Problema**: "El precio debe ser mayor a 0"

**Solución**:
- Usa formato decimal: `3.50` no `$3.50`
- No uses comas: `3.50` no `3,50`
- Precio mínimo: `0.01`

---

### Dashboard muestra datos incorrectos

**Solución**:
1. Recarga la página completamente (Ctrl + Shift + R)
2. Verifica que la fecha de tu sistema sea correcta
3. Los datos se calculan en tiempo real, espera unos segundos

---

## 📞 Soporte Técnico

Si necesitas ayuda adicional:

- 📧 **Email**: soporte@porkyrios.com
- 🐛 **Reportar bug**: GitHub Issues
- 📖 **Documentación**: `/docs`

---

## 🎓 Recursos Adicionales

- [Documentación API](./API.md) - Para integraciones
- [README Principal](../README.md) - Información general
- [PWA Guide](../PWA-README.md) - App instalable

---

<div align="center">
  <strong>¡Éxito con tu negocio! 🍖</strong>
  <br />
  <sub>Porkyrios - Sistema de Pedidos Online</sub>
</div>
