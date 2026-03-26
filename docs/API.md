# 📡 API Documentation - Porkyrios

Esta documentación describe todos los endpoints disponibles en la API de Porkyrios.

**Base URL**: `http://localhost:3000/api` (desarrollo) o `https://tu-dominio.com/api` (producción)

---

## 📋 Tabla de Contenidos

- [Categorías](#categorías)
- [Productos](#productos)
- [Pedidos](#pedidos)
- [Inventario](#inventario)
- [Códigos de Estado](#códigos-de-estado)
- [Ejemplos de Uso](#ejemplos-de-uso)

---

## 📁 Categorías

### `GET /api/categories`

Lista todas las categorías.

**Query Parameters:**
- `limit` (opcional): Número máximo de resultados. Default: 100

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "name": "Tacos",
    "emoji": "🌮",
    "active": true,
    "createdAt": "2025-01-15T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Tortas",
    "emoji": "🥖",
    "active": true,
    "createdAt": "2025-01-15T10:05:00.000Z"
  }
]
```

---

### `POST /api/categories`

Crea una nueva categoría.

**Body:**
```json
{
  "name": "Quesadillas",
  "emoji": "🧀",
  "active": true
}
```

**Respuesta exitosa (201):**
```json
{
  "id": 3,
  "name": "Quesadillas",
  "emoji": "🧀",
  "active": true,
  "createdAt": "2025-01-15T11:00:00.000Z"
}
```

**Errores:**
- `400`: Datos inválidos (falta nombre o emoji)
- `500`: Error del servidor

---

### `PUT /api/categories?id={id}`

Actualiza una categoría existente.

**Query Parameters:**
- `id` (requerido): ID de la categoría

**Body (campos opcionales):**
```json
{
  "name": "Tacos Especiales",
  "emoji": "🌮",
  "active": false
}
```

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "name": "Tacos Especiales",
  "emoji": "🌮",
  "active": false,
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

**Errores:**
- `400`: ID no proporcionado
- `404`: Categoría no encontrada
- `500`: Error del servidor

---

### `DELETE /api/categories?id={id}`

Elimina una categoría.

**Query Parameters:**
- `id` (requerido): ID de la categoría

**Respuesta exitosa (200):**
```json
{
  "message": "Category deleted successfully"
}
```

**Errores:**
- `400`: ID no proporcionado o categoría tiene productos asociados
- `404`: Categoría no encontrada
- `500`: Error del servidor

---

## 🍽️ Productos

### `GET /api/products`

Lista todos los productos.

**Query Parameters:**
- `limit` (opcional): Número máximo de resultados. Default: 100
- `categoryId` (opcional): Filtrar por categoría

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "name": "Taco al Pastor",
    "description": "Carne de cerdo marinada con piña",
    "price": 3.50,
    "categoryId": 1,
    "stock": 50,
    "image": null,
    "active": true,
    "createdAt": "2025-01-15T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Torta Cubana",
    "description": "Con jamón, queso, milanesa y más",
    "price": 8.00,
    "categoryId": 2,
    "stock": 20,
    "image": null,
    "active": true,
    "createdAt": "2025-01-15T10:10:00.000Z"
  }
]
```

---

### `POST /api/products`

Crea un nuevo producto.

**Body:**
```json
{
  "name": "Quesadilla de Flor de Calabaza",
  "description": "Con queso Oaxaca y epazote",
  "price": 4.50,
  "categoryId": 3,
  "stock": 30,
  "image": "https://example.com/quesadilla.jpg",
  "active": true
}
```

**Respuesta exitosa (201):**
```json
{
  "id": 3,
  "name": "Quesadilla de Flor de Calabaza",
  "description": "Con queso Oaxaca y epazote",
  "price": 4.50,
  "categoryId": 3,
  "stock": 30,
  "image": "https://example.com/quesadilla.jpg",
  "active": true,
  "createdAt": "2025-01-15T11:30:00.000Z"
}
```

**Errores:**
- `400`: Datos inválidos (falta nombre o precio <= 0)
- `500`: Error del servidor

---

### `PUT /api/products?id={id}`

Actualiza un producto existente.

**Query Parameters:**
- `id` (requerido): ID del producto

**Body (campos opcionales):**
```json
{
  "name": "Taco al Pastor Premium",
  "price": 4.00,
  "stock": 45,
  "active": false
}
```

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "name": "Taco al Pastor Premium",
  "description": "Carne de cerdo marinada con piña",
  "price": 4.00,
  "categoryId": 1,
  "stock": 45,
  "image": null,
  "active": false,
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

**Errores:**
- `400`: ID no proporcionado o precio inválido
- `404`: Producto no encontrado
- `500`: Error del servidor

---

### `DELETE /api/products?id={id}`

Elimina un producto.

**Query Parameters:**
- `id` (requerido): ID del producto

**Respuesta exitosa (200):**
```json
{
  "message": "Product deleted successfully"
}
```

**Errores:**
- `400`: ID no proporcionado
- `404`: Producto no encontrado
- `500`: Error del servidor

---

## 📦 Pedidos

### `GET /api/orders`

Lista todos los pedidos.

**Query Parameters:**
- `limit` (opcional): Número máximo de resultados. Default: 100
- `status` (opcional): Filtrar por estado
  - Valores válidos: `preparing`, `cooking`, `packing`, `ready`, `completed`, `cancelled`
- `orderNumber` (opcional): Buscar por número de orden específico

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "orderNumber": "P001",
    "customerName": "Juan Pérez",
    "phone": "555-1234",
    "total": 45.50,
    "status": "cooking",
    "createdAt": "2025-01-15T12:00:00.000Z",
    "updatedAt": "2025-01-15T12:05:00.000Z"
  },
  {
    "id": 2,
    "orderNumber": "P002",
    "customerName": "María González",
    "phone": "555-5678",
    "total": 28.00,
    "status": "ready",
    "createdAt": "2025-01-15T12:15:00.000Z",
    "updatedAt": "2025-01-15T12:30:00.000Z"
  }
]
```

---

### `POST /api/orders`

Crea un nuevo pedido.

**Body:**
```json
{
  "customerName": "Carlos Ramírez",
  "phone": "555-9999",
  "items": [
    {
      "productId": 1,
      "quantity": 3,
      "price": 3.50
    },
    {
      "productId": 2,
      "quantity": 1,
      "price": 8.00
    }
  ],
  "deliveryMethod": "delivery",
  "total": 53.50
}
```

**Respuesta exitosa (201):**
```json
{
  "order": {
    "id": 3,
    "orderNumber": "P003",
    "customerName": "Carlos Ramírez",
    "phone": "555-9999",
    "total": 53.50,
    "status": "preparing",
    "createdAt": "2025-01-15T13:00:00.000Z",
    "updatedAt": "2025-01-15T13:00:00.000Z"
  },
  "items": [
    {
      "id": 1,
      "orderId": 3,
      "productId": 1,
      "quantity": 3,
      "price": 3.50,
      "productName": "Taco al Pastor"
    },
    {
      "id": 2,
      "orderId": 3,
      "productId": 2,
      "quantity": 1,
      "price": 8.00,
      "productName": "Torta Cubana"
    }
  ]
}
```

**Errores:**
- `400`: Datos inválidos (falta información requerida)
- `500`: Error del servidor

---

### `PUT /api/orders?id={id}`

Actualiza el estado de un pedido.

**Query Parameters:**
- `id` (requerido): ID del pedido

**Body:**
```json
{
  "status": "ready"
}
```

**Estados válidos:**
- `preparing`: Pedido recibido, en preparación
- `cooking`: En proceso de cocción
- `packing`: Empacando el pedido
- `ready`: Listo para entregar/recoger
- `completed`: Entregado/completado
- `cancelled`: Cancelado

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "orderNumber": "P001",
  "customerName": "Juan Pérez",
  "phone": "555-1234",
  "total": 45.50,
  "status": "ready",
  "createdAt": "2025-01-15T12:00:00.000Z",
  "updatedAt": "2025-01-15T12:45:00.000Z"
}
```

**Errores:**
- `400`: ID no proporcionado o estado inválido
- `404`: Pedido no encontrado
- `500`: Error del servidor

---

### `DELETE /api/orders?id={id}`

Elimina un pedido.

**Query Parameters:**
- `id` (requerido): ID del pedido

**Respuesta exitosa (200):**
```json
{
  "message": "Order deleted successfully"
}
```

**Errores:**
- `400`: ID no proporcionado
- `404`: Pedido no encontrado
- `500`: Error del servidor

---

### `GET /api/orders/items?orderId={orderId}`

Obtiene los items de un pedido específico.

**Query Parameters:**
- `orderId` (requerido): ID del pedido

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "productId": 1,
    "quantity": 3,
    "price": 3.50,
    "productName": "Taco al Pastor"
  },
  {
    "id": 2,
    "orderId": 1,
    "productId": 2,
    "quantity": 1,
    "price": 8.00,
    "productName": "Torta Cubana"
  }
]
```

---

## 📊 Inventario

### `GET /api/inventory`

Obtiene el estado del inventario de todos los productos.

**Query Parameters:**
- `productId` (opcional): Filtrar por producto específico

**Respuesta exitosa (200):**
```json
[
  {
    "productId": 1,
    "productName": "Taco al Pastor",
    "stock": 50,
    "status": "available"
  },
  {
    "productId": 2,
    "productName": "Torta Cubana",
    "stock": 4,
    "status": "low"
  },
  {
    "productId": 3,
    "productName": "Quesadilla",
    "stock": 0,
    "status": "out_of_stock"
  }
]
```

**Estados de inventario:**
- `available`: Stock normal (> 5 unidades)
- `low`: Stock bajo (1-5 unidades)
- `out_of_stock`: Sin stock (0 unidades)

---

### `PUT /api/inventory?productId={productId}`

Actualiza el stock de un producto.

**Query Parameters:**
- `productId` (requerido): ID del producto

**Body:**
```json
{
  "quantity": 100
}
```

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "name": "Taco al Pastor",
  "stock": 100,
  "message": "Stock updated successfully"
}
```

**Errores:**
- `400`: ID no proporcionado o cantidad inválida
- `404`: Producto no encontrado
- `500`: Error del servidor

---

## 📊 Códigos de Estado

| Código | Descripción |
|--------|-------------|
| `200` | OK - Solicitud exitosa |
| `201` | Created - Recurso creado exitosamente |
| `400` | Bad Request - Datos inválidos |
| `404` | Not Found - Recurso no encontrado |
| `500` | Internal Server Error - Error del servidor |

---

## 💡 Ejemplos de Uso

### JavaScript (Fetch)

```javascript
// Obtener todos los productos
const products = await fetch('/api/products')
  .then(res => res.json());

// Crear un nuevo pedido
const newOrder = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'Juan Pérez',
    phone: '555-1234',
    items: [
      { productId: 1, quantity: 2, price: 3.50 }
    ],
    total: 7.00
  })
}).then(res => res.json());

// Actualizar estado de pedido
const updated = await fetch('/api/orders?id=1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'ready' })
}).then(res => res.json());
```

### TypeScript (con tipos)

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryId: number | null;
  active: boolean;
}

// GET con tipo
const products: Product[] = await fetch('/api/products')
  .then(res => res.json());

// POST con tipo
const createProduct = async (data: Omit<Product, 'id'>): Promise<Product> => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

### cURL

```bash
# GET - Listar productos
curl http://localhost:3000/api/products

# POST - Crear categoría
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Bebidas","emoji":"🥤","active":true}'

# PUT - Actualizar pedido
curl -X PUT "http://localhost:3000/api/orders?id=1" \
  -H "Content-Type: application/json" \
  -d '{"status":"ready"}'

# DELETE - Eliminar producto
curl -X DELETE "http://localhost:3000/api/products?id=5"
```

---

## 🔐 Autenticación

Actualmente la API no requiere autenticación para las operaciones de lectura y escritura. En producción, se recomienda implementar:

- **JWT tokens** para autenticación de usuarios
- **API Keys** para acceso programático
- **Rate limiting** para prevenir abuso
- **CORS** configurado correctamente

---

## 📝 Notas Adicionales

1. **Paginación**: Todos los endpoints GET soportan el parámetro `limit`
2. **Ordenamiento**: Por defecto ordenado por `createdAt` descendente
3. **Timestamps**: Todos los timestamps están en formato ISO 8601 UTC
4. **IDs**: Todos los IDs son integers autoincrementales
5. **Soft Delete**: Los productos y categorías usan el campo `active` en lugar de eliminación física

---

## 🐛 Reportar Errores

Si encuentras algún error en la API, por favor repórtalo en:
- GitHub Issues: https://github.com/tu-usuario/porkyrios/issues
- Email: soporte@porkyrios.com
