# 🧪 Checklist de Testing - Productos Destacados

## 📋 Cambios Implementados

**Fecha:** 2025-01-23
**Versión:** 1.0

### Modificaciones Realizadas:
1. ✅ Control de productos destacados movido de **Promociones** → **Productos**
2. ✅ Eliminada sección duplicada en el tab de Promociones
3. ✅ Simplificada la UI del panel admin
4. ✅ Botón ⭐ agregado en la lista principal de productos

---

## ✅ Testing Manual - Panel Admin

### 1. Acceso al Panel Admin
- [ ] Navegar a `/admin`
- [ ] Iniciar sesión con credenciales de administrador
- [ ] Verificar que el panel carga correctamente

### 2. Tab de Productos - Funcionalidad Básica
- [ ] Ir al tab **"Productos"**
- [ ] Verificar que la lista de productos se carga correctamente
- [ ] Confirmar que cada producto muestra:
  - [ ] Imagen del producto
  - [ ] Nombre del producto
  - [ ] Precio
  - [ ] Categoría
  - [ ] Stock
  - [ ] Estado (activo/inactivo)
  - [ ] Botones de acción: ⭐ / ✏️ / 🔄 / 🗑️

### 3. Marcar Productos como Destacados
- [ ] Identificar un producto **sin** badge "⭐ Destacado"
- [ ] Hacer clic en el botón **⭐** (estrella vacía)
- [ ] Verificar que:
  - [ ] La estrella cambia a color naranja (llena)
  - [ ] Aparece el badge **"⭐ Destacado"** al lado del nombre
  - [ ] Se muestra un mensaje de confirmación/toast
  - [ ] El cambio persiste al recargar la página

### 4. Desmarcar Productos Destacados
- [ ] Identificar un producto **con** badge "⭐ Destacado"
- [ ] Hacer clic en el botón **⭐** (estrella llena naranja)
- [ ] Verificar que:
  - [ ] La estrella cambia a color amarillo (vacía)
  - [ ] Desaparece el badge "⭐ Destacado"
  - [ ] Se muestra un mensaje de confirmación/toast
  - [ ] El cambio persiste al recargar la página

### 5. Límite de 3 Productos Destacados
- [ ] Marcar 3 productos diferentes como destacados
- [ ] Verificar que todos muestran el badge "⭐ Destacado"
- [ ] Intentar marcar un 4º producto como destacado
- [ ] Verificar que:
  - [ ] El sistema permite marcar más de 3 (sin restricción en admin)
  - [ ] La homepage solo muestra los primeros 3 (verificar en siguiente sección)

### 6. Tab de Promociones - Verificación
- [ ] Ir al tab **"Promos"**
- [ ] Verificar que **solo** aparece:
  - [ ] Sección de "Banner Promocional"
  - [ ] Info card indicando que productos destacados se gestionan desde el tab Productos
- [ ] Confirmar que **NO** aparece:
  - [ ] Sección duplicada de "Productos Destacados en Homepage"
  - [ ] Lista duplicada de productos con botones ⭐

---

## ✅ Testing Manual - Homepage (Frontend)

### 7. Visualización en Homepage
- [ ] Abrir la página principal `/` en modo incógnito
- [ ] Buscar la sección **"⭐ Nuestros Productos Destacados"**
- [ ] Verificar que:
  - [ ] La sección aparece correctamente
  - [ ] Se muestran **máximo 3 productos** destacados
  - [ ] Cada producto muestra:
    - [ ] Imagen del producto (o ícono placeholder)
    - [ ] Nombre del producto
    - [ ] Descripción (si existe)
    - [ ] Precio
    - [ ] Botón "Ordenar"

### 8. Productos Destacados - Contenido Correcto
- [ ] Comparar los productos en homepage con los marcados en admin
- [ ] Verificar que los productos destacados en homepage coinciden con los marcados en el panel admin
- [ ] Confirmar que el orden de los productos es correcto

### 9. Si NO hay productos destacados
- [ ] En el panel admin, desmarcar **todos** los productos destacados
- [ ] Recargar la homepage
- [ ] Verificar que:
  - [ ] La sección de productos destacados **NO** aparece
  - [ ] O muestra un mensaje indicando que no hay productos destacados
  - [ ] No hay errores en consola

### 10. Responsive Design
- [ ] Verificar la sección de productos destacados en diferentes viewports:
  - [ ] Desktop (1920px+)
  - [ ] Tablet (768px - 1024px)
  - [ ] Mobile (375px - 767px)
- [ ] Confirmar que:
  - [ ] Las cards se adaptan correctamente
  - [ ] El grid cambia de 3 columnas → 2 columnas → 1 columna
  - [ ] Las imágenes no se deforman
  - [ ] El texto es legible en todos los tamaños

---

## ✅ Testing de Integración

### 11. Sincronización entre Admin y Frontend
- [ ] Marcar un producto como destacado en admin
- [ ] Recargar la homepage
- [ ] Confirmar que el producto aparece inmediatamente
- [ ] Desmarcar el producto en admin
- [ ] Recargar la homepage
- [ ] Confirmar que el producto desaparece

### 12. Performance y Carga
- [ ] Verificar que la homepage carga en menos de 3 segundos
- [ ] Confirmar que no hay errores en la consola del navegador
- [ ] Verificar que las imágenes de productos destacados cargan correctamente
- [ ] Confirmar que no hay "layout shift" al cargar los productos

### 13. Interacción con Otros Features
- [ ] Hacer clic en un producto destacado
- [ ] Verificar que redirige correctamente a `/menu`
- [ ] Confirmar que el producto existe en el menú
- [ ] Verificar que se puede agregar al carrito desde el menú

---

## ✅ Testing de Errores y Edge Cases

### 14. Manejo de Imágenes
- [ ] Marcar como destacado un producto **sin** imagen
- [ ] Verificar que muestra un ícono placeholder (ChefHat)
- [ ] Confirmar que no hay errores de imagen rota

### 15. Productos Inactivos
- [ ] Marcar un producto como destacado
- [ ] Desactivar ese producto (botón 🔄 en admin)
- [ ] Verificar en homepage:
  - [ ] ¿Se muestra el producto inactivo?
  - [ ] O se oculta automáticamente?
  - [ ] Documentar el comportamiento esperado

### 16. Productos Sin Stock
- [ ] Marcar un producto como destacado
- [ ] Establecer su stock en 0
- [ ] Verificar en homepage:
  - [ ] ¿Se muestra el producto sin stock?
  - [ ] ¿El botón "Ordenar" está deshabilitado?
  - [ ] Documentar el comportamiento esperado

### 17. Testing con Datos de Producción
- [ ] Si hay base de datos de producción con datos reales:
  - [ ] Marcar productos destacados reales
  - [ ] Verificar que no hay conflictos con categorías
  - [ ] Confirmar que los precios se muestran correctamente
  - [ ] Verificar que las descripciones no rompen el layout

---

## ✅ Testing de API Endpoints

### 18. GET /api/products/featured
- [ ] Usar herramienta de testing (Postman, curl, o DevTools)
- [ ] Hacer GET a `/api/products/featured`
- [ ] Verificar respuesta:
  - [ ] Status 200 OK
  - [ ] Devuelve array de productos destacados
  - [ ] Máximo 3 productos en el array
  - [ ] Cada producto tiene: id, name, description, price, image, stock, active, featured

### 19. PATCH /api/products/[id]/featured
- [ ] Marcar un producto como destacado vía API:
  ```bash
  PATCH /api/products/123/featured
  Body: { "featured": true }
  ```
- [ ] Verificar respuesta:
  - [ ] Status 200 OK
  - [ ] Producto actualizado correctamente
- [ ] Desmarcar el mismo producto:
  ```bash
  PATCH /api/products/123/featured
  Body: { "featured": false }
  ```
- [ ] Verificar respuesta:
  - [ ] Status 200 OK
  - [ ] Producto actualizado correctamente

### 20. Manejo de Errores en API
- [ ] Intentar actualizar producto que no existe:
  ```bash
  PATCH /api/products/999999/featured
  ```
- [ ] Verificar respuesta:
  - [ ] Status 404 Not Found
  - [ ] Mensaje de error claro

---

## 📊 Resultados del Testing

### Resumen
- **Total de pruebas:** 20 secciones
- **Pruebas completadas:** ___ / 20
- **Pruebas exitosas:** ___ / 20
- **Pruebas fallidas:** ___ / 20

### Bugs Encontrados
| # | Descripción | Severidad | Estado |
|---|-------------|-----------|--------|
| 1 | | Alta/Media/Baja | Abierto/Cerrado |
| 2 | | Alta/Media/Baja | Abierto/Cerrado |
| 3 | | Alta/Media/Baja | Abierto/Cerrado |

### Notas Adicionales
```
[Agregar cualquier observación, mejora sugerida, o comportamiento inesperado]
```

---

## 🚀 Aprobación Final

- [ ] Todos los tests manuales pasaron
- [ ] No hay bugs críticos
- [ ] Performance es aceptable (< 3s carga)
- [ ] UI/UX es intuitiva y clara
- [ ] Cambios documentados correctamente

**Aprobado por:** _______________  
**Fecha:** _______________  
**Firma:** _______________

---

## 📝 Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-01-23 | Checklist inicial para cambios de productos destacados |

---

## 🔗 Referencias

- [Panel Admin](/admin) - Gestión de productos destacados
- [Homepage](/) - Visualización de productos destacados
- [API Documentation](./API.md) - Endpoints relacionados
- [Architecture](./ARCHITECTURE.md) - Arquitectura del sistema
