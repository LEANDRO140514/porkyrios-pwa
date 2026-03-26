# 🤝 Guía de Contribución - Porkyrios

¡Gracias por tu interés en contribuir a Porkyrios! 🎉

Esta guía te ayudará a entender cómo puedes contribuir al proyecto de manera efectiva.

---

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Guías de Estilo](#guías-de-estilo)
5. [Proceso de Pull Request](#proceso-de-pull-request)
6. [Reportar Bugs](#reportar-bugs)
7. [Sugerir Mejoras](#sugerir-mejoras)

---

## 📜 Código de Conducta

Este proyecto adhiere a un Código de Conducta. Al participar, se espera que mantengas un ambiente respetuoso y colaborativo.

### Nuestros Estándares

**Comportamiento Esperado:**
- ✅ Usar lenguaje inclusivo y acogedor
- ✅ Respetar diferentes puntos de vista y experiencias
- ✅ Aceptar críticas constructivas con gracia
- ✅ Enfocarse en lo mejor para la comunidad
- ✅ Mostrar empatía hacia otros miembros

**Comportamiento Inaceptable:**
- ❌ Uso de lenguaje o imágenes sexualizadas
- ❌ Trolling, comentarios insultantes o ataques personales
- ❌ Acoso público o privado
- ❌ Publicar información privada de otros sin permiso
- ❌ Cualquier conducta que podría considerarse inapropiada

---

## 🎯 ¿Cómo Puedo Contribuir?

Hay muchas formas de contribuir a Porkyrios:

### 1. Reportar Bugs 🐛

Si encuentras un bug, por favor crea un issue con:
- Descripción clara del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots (si aplica)
- Versión del navegador/OS

### 2. Sugerir Mejoras 💡

¿Tienes una idea para mejorar Porkyrios? Crea un issue con:
- Descripción de la funcionalidad
- Por qué sería útil
- Ejemplos de implementación (opcional)

### 3. Contribuir Código 💻

- Corrección de bugs
- Nuevas funcionalidades
- Mejoras de rendimiento
- Refactoring
- Tests

### 4. Mejorar Documentación 📚

- Corregir typos
- Agregar ejemplos
- Traducir documentación
- Mejorar explicaciones

### 5. Diseño y UX 🎨

- Proponer mejoras de UI
- Crear mockups
- Mejorar accesibilidad

---

## 🔧 Configuración del Entorno

### Prerequisitos

- Node.js 18+ o Bun 1.0+
- Git
- Cuenta de Turso (para base de datos)

### Pasos de Instalación

1. **Fork el repositorio**
   - Ve a https://github.com/tu-usuario/porkyrios
   - Clic en "Fork" en la esquina superior derecha

2. **Clonar tu fork**
   ```bash
   git clone https://github.com/TU-USUARIO/porkyrios.git
   cd porkyrios
   ```

3. **Agregar upstream remote**
   ```bash
   git remote add upstream https://github.com/usuario-original/porkyrios.git
   ```

4. **Instalar dependencias**
   ```bash
   npm install
   # o
   bun install
   ```

5. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Editar .env.local con tus credenciales
   ```

6. **Ejecutar migraciones**
   ```bash
   npm run db:push
   npm run db:seed  # Datos de ejemplo
   ```

7. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

---

## 📐 Guías de Estilo

### Código TypeScript/JavaScript

#### Nomenclatura

```typescript
// ✅ Bueno
const userName = "Juan";
const isActive = true;
const userList = [];

function getUserById(id: number) { }

interface UserData {
  name: string;
  email: string;
}

// ❌ Malo
const user_name = "Juan";
const active = true;
const list = [];

function get_user(id: number) { }

interface userData { }
```

#### Formato

- **Indentación**: 2 espacios
- **Comillas**: Dobles para strings `"texto"`
- **Punto y coma**: Siempre usar al final de statements
- **Longitud de línea**: Máximo 100 caracteres

```typescript
// ✅ Bueno
export async function getUserOrders(userId: number): Promise<Order[]> {
  const orders = await db
    .select()
    .from(orderTable)
    .where(eq(orderTable.userId, userId))
    .limit(10);
  
  return orders;
}

// ❌ Malo
export async function getUserOrders(userId: number): Promise<Order[]> {
const orders = await db.select().from(orderTable).where(eq(orderTable.userId, userId)).limit(10);
return orders;
}
```

### Componentes React

#### Estructura de Componentes

```typescript
// ✅ Bueno
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductCardProps {
  name: string;
  price: number;
  onAddToCart: () => void;
}

export function ProductCard({ name, price, onAddToCart }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onAddToCart();
      toast.success("Producto agregado");
    } catch (error) {
      toast.error("Error al agregar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <h3 className="text-lg font-bold">{name}</h3>
      <p className="text-gray-600">${price}</p>
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? "Agregando..." : "Agregar"}
      </Button>
    </div>
  );
}
```

#### Props y State

- Usa interfaces para definir props
- Nombra handlers con `handle` prefix: `handleClick`, `handleSubmit`
- Usa nombres descriptivos para state: `isLoading`, `hasError`

### API Routes

```typescript
// ✅ Bueno
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    
    const products = await db.select()
      .from(productTable)
      .limit(limit);
    
    return Response.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
```

### CSS y Tailwind

- Usa Tailwind classes en lugar de CSS custom cuando sea posible
- Mantén orden consistente: layout → sizing → spacing → colors → typography
- Usa variables CSS para valores reutilizables

```typescript
// ✅ Bueno (orden lógico)
<div className="flex flex-col w-full max-w-md p-4 bg-gray-800 rounded-lg shadow-lg">
  <h2 className="text-xl font-bold text-white">Título</h2>
</div>

// ❌ Malo (orden inconsistente)
<div className="text-white rounded-lg p-4 flex bg-gray-800 flex-col shadow-lg w-full font-bold max-w-md text-xl">
  <h2>Título</h2>
</div>
```

### Git Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato (sin cambios de código)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```bash
feat(cart): add delivery method selection

Add toggle between delivery (+$35) and pickup (free)
Includes visual cards with images and descriptions

Closes #123

---

fix(admin): correct product stock validation

Prevent negative stock values when updating products

---

docs(readme): update installation instructions

Add Turso database setup steps
```

---

## 🔀 Proceso de Pull Request

### 1. Crear una Rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama descriptiva
git checkout -b feat/add-user-auth
git checkout -b fix/cart-total-calculation
git checkout -b docs/improve-api-docs
```

### 2. Hacer Cambios

- Escribe código limpio y testeado
- Sigue las guías de estilo
- Agrega comentarios cuando sea necesario
- Actualiza documentación si aplica

### 3. Commit

```bash
git add .
git commit -m "feat(auth): implement user registration"
```

### 4. Push

```bash
git push origin feat/add-user-auth
```

### 5. Crear Pull Request

1. Ve a tu fork en GitHub
2. Clic en "Compare & pull request"
3. Completa el template del PR:
   - **Título**: Descripción concisa del cambio
   - **Descripción**: Explicación detallada
   - **Tipo de cambio**: Feature/Bugfix/Docs/etc
   - **Tests**: ¿Se agregaron tests?
   - **Screenshots**: Si hay cambios visuales

### 6. Code Review

- Responde a comentarios de revisión
- Haz cambios solicitados
- Push adicionales se agregan automáticamente al PR

### 7. Merge

- Una vez aprobado, un maintainer hará merge
- Tu rama será eliminada automáticamente

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Busca en issues existentes** - ¿Ya fue reportado?
2. **Verifica la versión** - ¿Es la última versión?
3. **Reproduce el bug** - ¿Puedes reproducirlo consistentemente?

### Template de Bug Report

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ve a '...'
2. Haz clic en '...'
3. Scroll hasta '...'
4. Observa el error

**Comportamiento Esperado**
Lo que debería suceder.

**Comportamiento Actual**
Lo que sucede actualmente.

**Screenshots**
Si aplica, agrega screenshots.

**Entorno**
- OS: [ej. macOS 12.1]
- Navegador: [ej. Chrome 108]
- Versión: [ej. 1.0.0]

**Información Adicional**
Cualquier otro contexto sobre el problema.
```

---

## 💡 Sugerir Mejoras

### Template de Feature Request

```markdown
**¿Tu feature request está relacionado con un problema?**
Descripción clara del problema. Ej. "Me frustra que [...]"

**Describe la solución que te gustaría**
Descripción clara y concisa de lo que quieres que suceda.

**Describe alternativas que has considerado**
Otras soluciones o funcionalidades que has considerado.

**Contexto Adicional**
Agrega cualquier otro contexto o screenshots.
```

---

## ❓ ¿Preguntas?

Si tienes preguntas sobre cómo contribuir:

- 💬 Abre un issue con la etiqueta `question`
- 📧 Email: contribuciones@porkyrios.com
- 🐛 Revisa issues existentes con etiqueta `good first issue`

---

## 🎉 Reconocimientos

¡Todos los contribuidores serán reconocidos en el README!

Muchas gracias por ayudar a mejorar Porkyrios 🍖

---

<div align="center">
  <strong>¡Happy Coding! 💻</strong>
  <br />
  <sub>Con ❤️ desde el equipo de Porkyrios</sub>
</div>
