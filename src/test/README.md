# 🧪 Documentación de Testing - Porkyrios

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Estructura de Tests](#estructura-de-tests)
- [Comandos Disponibles](#comandos-disponibles)
- [Tests Unitarios](#tests-unitarios)
- [Tests de Componentes](#tests-de-componentes)
- [Tests E2E](#tests-e2e)
- [Coverage Reports](#coverage-reports)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Descripción General

El proyecto Porkyrios cuenta con **3 tipos de tests**:

1. **Tests Unitarios** - Lógica de negocio (Context, Hooks)
2. **Tests de Componentes** - UI y comportamiento de componentes React
3. **Tests E2E** - Flujos completos de usuario con Playwright

### Tecnologías Utilizadas

- **Vitest** - Framework de testing para tests unitarios y de componentes
- **React Testing Library** - Utilidades para testear componentes React
- **Playwright** - Framework para tests E2E
- **jsdom** - Entorno DOM simulado para tests

---

## 📁 Estructura de Tests

```
src/test/
├── unit/                          # Tests unitarios
│   └── CartContext.test.tsx      # Tests del Context del carrito (30 tests)
├── components/                    # Tests de componentes
│   ├── MenuPage.test.tsx         # Tests de la página de menú (26 tests)
│   ├── CartPage.test.tsx         # Tests de la página del carrito (40+ tests)
│   └── PaymentPage.test.tsx      # Tests de la página de pago (60+ tests)
├── e2e/                          # Tests End-to-End
│   ├── checkout-flow.spec.ts     # Flujo completo de compra (8 tests)
│   ├── authentication.spec.ts    # Flujo de autenticación (15 tests)
│   └── menu-search-filter.spec.ts # Búsqueda y filtros (20 tests)
├── setup.ts                      # Configuración global de Vitest
└── README.md                     # Esta documentación
```

---

## ⚡ Comandos Disponibles

### Tests Unitarios y de Componentes (Vitest)

```bash
# Ejecutar todos los tests
bun test

# Ejecutar tests en modo watch (rerun on change)
bun test:watch

# Ejecutar tests con coverage
bun test:coverage

# Ejecutar tests de una carpeta específica
bunx vitest run src/test/unit/
bunx vitest run src/test/components/

# Ejecutar un archivo específico
bunx vitest run src/test/unit/CartContext.test.tsx

# Ejecutar tests con interfaz gráfica
bunx vitest --ui
```

### Tests E2E (Playwright)

```bash
# Ejecutar todos los tests E2E
bun test:e2e

# Ejecutar tests E2E en modo headed (ver navegador)
bunx playwright test --headed

# Ejecutar tests E2E en modo debug
bunx playwright test --debug

# Ejecutar un archivo específico
bunx playwright test src/test/e2e/checkout-flow.spec.ts

# Ver reporte de tests E2E
bunx playwright show-report

# Abrir interfaz gráfica de Playwright
bunx playwright test --ui
```

---

## 🧩 Tests Unitarios

### CartContext Tests (30 tests)

**Ubicación:** `src/test/unit/CartContext.test.tsx`

**Cobertura:**
- ✅ Inicialización del carrito
- ✅ Agregar productos al carrito
- ✅ Actualizar cantidades
- ✅ Remover productos
- ✅ Vaciar carrito
- ✅ Persistencia en localStorage
- ✅ Validaciones de stock
- ✅ Cálculos de subtotal y total

**Ejemplo de ejecución:**

```bash
bunx vitest run src/test/unit/CartContext.test.tsx
```

**Tests clave:**
- Validación de límites de stock
- Persistencia entre recargas
- Cálculos de precios con múltiples productos
- Manejo de productos duplicados

---

## 🎨 Tests de Componentes

### MenuPage Tests (26 tests)

**Ubicación:** `src/test/components/MenuPage.test.tsx`

**Cobertura:**
- ✅ Renderizado inicial y loading states
- ✅ Fetch de productos y categorías desde API
- ✅ Búsqueda en tiempo real
- ✅ Filtros por categoría
- ✅ Agregar productos al carrito
- ✅ Validación de stock
- ✅ Navegación

**Casos críticos:**
```typescript
// Búsqueda case-insensitive
it('should search products case insensitively')

// Combinación de filtros
it('should combine category filter with search')

// Stock warnings
it('should disable add button when stock is 0')
```

### CartPage Tests (40+ tests)

**Ubicación:** `src/test/components/CartPage.test.tsx`

**Cobertura:**
- ✅ Autenticación y redirecciones
- ✅ Estado vacío del carrito
- ✅ Display de productos
- ✅ Controles de cantidad
- ✅ Remover items
- ✅ Métodos de entrega (Pickup/Delivery)
- ✅ Cálculos de IVA y total
- ✅ Navegación entre páginas

**Casos críticos:**
```typescript
// Cálculo de impuestos
it('should calculate tax (16%) correctly')

// Método de entrega
it('should show delivery cost when delivery selected')

// Warnings de stock
it('should show low stock warning')
```

### PaymentPage Tests (60+ tests)

**Ubicación:** `src/test/components/PaymentPage.test.tsx`

**Cobertura:**
- ✅ Autenticación requerida
- ✅ Validación de tarjeta de crédito
- ✅ Formato de número de tarjeta (espacios cada 4 dígitos)
- ✅ Validación de fecha de expiración
- ✅ Validación de CVV
- ✅ Procesamiento de pago
- ✅ Estados de error y éxito
- ✅ Integración con backend

**Casos críticos:**
```typescript
// Validación en tiempo real
it('should validate card number in real-time')

// Formato automático
it('should auto-format card number with spaces')

// Manejo de errores de pago
it('should show error when payment fails')
```

---

## 🌐 Tests E2E

### Checkout Flow Tests (8 tests)

**Ubicación:** `src/test/e2e/checkout-flow.spec.ts`

**Flujos completos:**
1. **Compra completa**: Menu → Agregar productos → Cart → Payment
2. **Actualizar cantidades**: Incrementar/decrementar en el carrito
3. **Remover items**: Eliminar productos individuales
4. **Vaciar carrito**: Limpiar todo el carrito
5. **Persistencia**: Verificar que el carrito persiste entre navegaciones
6. **Warnings de stock**: Mostrar alertas de stock bajo
7. **Cálculo de impuestos**: Verificar IVA en el resumen
8. **Métodos de entrega**: Cambiar entre pickup y delivery

**Ejemplo:**

```bash
# Ejecutar solo tests de checkout
bunx playwright test src/test/e2e/checkout-flow.spec.ts --headed
```

### Authentication Tests (15 tests)

**Ubicación:** `src/test/e2e/authentication.spec.ts`

**Flujos de autenticación:**
- Login y registro
- Validación de formularios
- Formatos de email y contraseña
- Confirmación de contraseña
- Redirecciones de páginas protegidas
- Toggle de visibilidad de contraseña

**Ejemplo:**

```bash
# Ejecutar solo tests de autenticación
bunx playwright test src/test/e2e/authentication.spec.ts
```

### Menu Search & Filter Tests (20 tests)

**Ubicación:** `src/test/e2e/menu-search-filter.spec.ts`

**Funcionalidades:**
- Búsqueda por nombre de producto
- Case-insensitive search
- Filtros por categoría
- Combinación de búsqueda + filtro
- Display de stock y precios
- Agregar al carrito desde menú
- Navegación y notificaciones

**Ejemplo:**

```bash
# Ejecutar solo tests de menú
bunx playwright test src/test/e2e/menu-search-filter.spec.ts --headed
```

---

## 📊 Coverage Reports

### Generar Reporte de Coverage

```bash
# Generar coverage con Vitest
bun test:coverage
```

**El reporte incluye:**
- **Lines**: Porcentaje de líneas ejecutadas
- **Statements**: Porcentaje de declaraciones ejecutadas
- **Functions**: Porcentaje de funciones ejecutadas
- **Branches**: Porcentaje de ramas (if/else) ejecutadas

**Visualizar reporte HTML:**

```bash
# El reporte se genera en coverage/index.html
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Interpretación de Resultados

- **✅ > 80%**: Excelente cobertura
- **⚠️ 60-80%**: Cobertura aceptable
- **❌ < 60%**: Necesita más tests

### Áreas Actuales de Cobertura

```
┌─────────────────────┬─────────┬─────────┬─────────┬─────────┐
│ File                │ Lines   │ Branches│ Funcs   │ Uncovered│
├─────────────────────┼─────────┼─────────┼─────────┼─────────┤
│ CartContext.tsx     │ 95%+    │ 90%+    │ 100%    │ -       │
│ MenuPage.tsx        │ 85%+    │ 80%+    │ 90%+    │ -       │
│ CartPage.tsx        │ 90%+    │ 85%+    │ 95%+    │ -       │
│ PaymentPage.tsx     │ 90%+    │ 85%+    │ 95%+    │ -       │
└─────────────────────┴─────────┴─────────┴─────────┴─────────┘
```

---

## 🎯 Best Practices

### 1. Organización de Tests

```typescript
describe('ComponentName', () => {
  // Setup antes de cada test
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Feature Group', () => {
    it('should do specific thing', () => {
      // Test implementation
    });
  });
});
```

### 2. Naming Conventions

✅ **CORRECTO:**
```typescript
it('should add product to cart when button clicked')
it('should validate email format')
it('should show error toast on API failure')
```

❌ **INCORRECTO:**
```typescript
it('test add product')  // Muy vago
it('works')  // No descriptivo
it('should work correctly')  // Muy genérico
```

### 3. Mocking

```typescript
// Mock de fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockData),
  })
) as any;

// Mock de router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));
```

### 4. Assertions

```typescript
// Usa matchers específicos
expect(element).toBeInTheDocument();  // ✅
expect(element).toBeTruthy();  // ❌

// Espera elementos asincrónicos
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### 5. User Interactions

```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

// Simular clicks
await user.click(button);

// Simular typing
await user.type(input, 'texto');

// Simular clear + type
await user.clear(input);
await user.type(input, 'nuevo texto');
```

---

## 🐛 Troubleshooting

### Problema: Tests fallan con error de fetch

**Solución:**
```typescript
// Mockear fetch en cada test
beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  ) as any;
});
```

### Problema: "Element not found"

**Solución:**
```typescript
// Usar waitFor para elementos asincrónicos
await waitFor(() => {
  expect(screen.getByText('Texto')).toBeInTheDocument();
});

// O usar queries findBy (tienen timeout built-in)
const element = await screen.findByText('Texto');
```

### Problema: Tests E2E fallan con timeout

**Solución:**
```typescript
// Aumentar timeout específico
await page.waitForSelector('text=Elemento', { timeout: 10000 });

// O configurar timeout global en playwright.config.ts
timeout: 30000
```

### Problema: Tests pasan localmente pero fallan en CI

**Causas comunes:**
1. **Timing issues**: Agregar `waitFor` o aumentar timeouts
2. **Datos mockeados**: Asegurar que mocks sean consistentes
3. **Estado compartido**: Limpiar localStorage/sessionStorage en `beforeEach`

**Solución:**
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
```

### Problema: Coverage bajo en funciones específicas

**Solución:**
- Identificar funciones no cubiertas con `bun test:coverage`
- Agregar tests específicos para esas funciones
- Revisar branches (if/else) no cubiertos

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)

### Comandos Útiles

```bash
# Ver ayuda de Vitest
bunx vitest --help

# Ver ayuda de Playwright
bunx playwright --help

# Instalar navegadores de Playwright
bunx playwright install

# Generar tests de Playwright con codegen
bunx playwright codegen http://localhost:3000
```

---

## ✅ Checklist de Testing

Antes de hacer commit/deploy, verifica:

- [ ] Todos los tests unitarios pasan (`bun test`)
- [ ] Coverage > 80% en archivos críticos
- [ ] Tests E2E pasan localmente
- [ ] No hay warnings en consola de tests
- [ ] Mocks están actualizados con APIs reales
- [ ] Tests son descriptivos y mantenibles

---

## 🚀 Integración Continua

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Run unit tests
        run: bun test
      
      - name: Run E2E tests
        run: bunx playwright install && bun test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📝 Mantención

**Actualizar tests cuando:**
- Se agregan nuevas features
- Se modifican componentes existentes
- Se cambian APIs o interfaces
- Se detectan bugs en producción

**Revisar coverage:**
- Semanalmente: Quick check de `bun test:coverage`
- Mensualmente: Análisis detallado de áreas sin cobertura
- Pre-release: Full regression testing

---

**🎉 ¡Happy Testing!**

Para preguntas o problemas, consulta la documentación oficial o abre un issue en el repositorio.
