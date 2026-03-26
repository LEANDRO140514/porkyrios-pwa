#!/bin/bash

# 🎯 Template Setup Script
# Personaliza este proyecto basado en Porkyrios

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🎯 Porkyrios Template Setup          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to prompt for input
prompt() {
  local prompt_text=$1
  local default_value=$2
  local var_name=$3
  
  if [ -n "$default_value" ]; then
    read -p "$(echo -e ${BLUE}$prompt_text${NC}) [${YELLOW}$default_value${NC}]: " input
    eval "$var_name=\"${input:-$default_value}\""
  else
    read -p "$(echo -e ${BLUE}$prompt_text${NC}): " input
    eval "$var_name=\"$input\""
  fi
}

# Get project information
echo -e "${GREEN}📝 Información del Nuevo Proyecto${NC}"
echo ""

prompt "Nombre del proyecto" "my-project" PROJECT_NAME
prompt "Descripción" "Mi nuevo proyecto basado en Porkyrios" PROJECT_DESCRIPTION
prompt "Autor" "$(git config user.name 2>/dev/null || echo 'Tu Nombre')" PROJECT_AUTHOR
prompt "Versión inicial" "1.0.0" PROJECT_VERSION
prompt "URL del repositorio (opcional)" "" REPO_URL

echo ""
echo -e "${GREEN}🔧 Personalizando proyecto...${NC}"

# Update package.json
echo -e "${BLUE}→${NC} Actualizando package.json..."
if [ -f "package.json" ]; then
  # Create backup
  cp package.json package.json.backup
  
  # Update using Node.js to preserve JSON structure
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.name = '$PROJECT_NAME';
    pkg.description = '$PROJECT_DESCRIPTION';
    pkg.version = '$PROJECT_VERSION';
    pkg.author = '$PROJECT_AUTHOR';
    if ('$REPO_URL') {
      pkg.repository = {
        type: 'git',
        url: '$REPO_URL'
      };
    }
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  "
  
  echo -e "${GREEN}  ✓${NC} package.json actualizado"
else
  echo -e "${RED}  ✗${NC} package.json no encontrado"
fi

# Create .env from .env.example if it doesn't exist
echo ""
echo -e "${BLUE}→${NC} Verificando variables de entorno..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${GREEN}  ✓${NC} .env creado desde .env.example"
    echo -e "${YELLOW}  ⚠${NC}  RECUERDA: Configurar credenciales en .env"
  else
    echo -e "${RED}  ✗${NC} .env.example no encontrado"
  fi
else
  echo -e "${YELLOW}  →${NC} .env ya existe (sin cambios)"
fi

# Clean cache directories
echo ""
echo -e "${BLUE}→${NC} Limpiando cache..."
rm -rf .next 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
echo -e "${GREEN}  ✓${NC} Cache limpiado"

# Create README template
echo ""
echo -e "${BLUE}→${NC} Creando README personalizado..."
cat > README.md << EOF
# $PROJECT_NAME

$PROJECT_DESCRIPTION

> 🚀 Proyecto basado en [Porkyrios](https://github.com/tu-usuario/porkyrios) - Un MVP de delivery de comida con PWA

---

## ✨ Características

- 🍽️ Menú de productos con categorías
- 🛒 Carrito de compras
- 💳 Checkout y procesamiento de pagos
- 📱 Progressive Web App (PWA)
- 📍 Rastreo de pedidos en tiempo real
- 🔐 Autenticación de usuarios
- 👨‍💼 Panel de administración
- 📊 Dashboard de analytics
- ⭐ Sistema de reseñas
- 🔔 Notificaciones push

---

## 🚀 Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui
- **Base de datos:** Turso (LibSQL) + Drizzle ORM
- **Autenticación:** Better Auth
- **Pagos:** MercadoPago
- **Email:** Resend + React Email
- **Monitoreo:** Sentry
- **Deployment:** Vercel

---

## 🏁 Inicio Rápido

### Prerrequisitos

- Node.js 18+ o Bun
- Cuenta en [Turso](https://turso.tech)
- (Opcional) Cuentas en Sentry, Resend, MercadoPago

### Instalación

1. **Clonar repositorio**:
   \`\`\`bash
   git clone $REPO_URL
   cd $PROJECT_NAME
   \`\`\`

2. **Instalar dependencias**:
   \`\`\`bash
   bun install
   # o
   npm install
   \`\`\`

3. **Configurar variables de entorno**:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edita \`.env\` con tus credenciales:
   - \`DATABASE_URL\` y \`DATABASE_AUTH_TOKEN\` (Turso)
   - \`ADMIN_PASSWORD\` (cambiar por uno seguro)
   - Otras credenciales opcionales

4. **Push schema a base de datos**:
   \`\`\`bash
   bun run db:push
   \`\`\`

5. **Seed con datos de prueba** (opcional):
   \`\`\`bash
   bun run db:seed
   \`\`\`

6. **Iniciar servidor de desarrollo**:
   \`\`\`bash
   bun run dev
   \`\`\`

7. **Abrir en navegador**:
   \`\`\`
   http://localhost:3000
   \`\`\`

---

## 📁 Estructura del Proyecto

\`\`\`
$PROJECT_NAME/
├── src/
│   ├── app/              # App Router pages
│   │   ├── api/          # API routes
│   │   ├── admin/        # Panel de administración
│   │   ├── menu/         # Menú de productos
│   │   ├── cart/         # Carrito
│   │   ├── payment/      # Checkout
│   │   └── tracking/     # Rastreo de pedidos
│   ├── components/       # Componentes reutilizables
│   │   └── ui/           # shadcn/ui components
│   ├── db/               # Database schema y seeds
│   ├── lib/              # Utilidades y configuración
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript types
├── public/               # Assets estáticos
├── scripts/              # Scripts de utilidad
└── docs/                 # Documentación
\`\`\`

---

## 🔧 Scripts Disponibles

\`\`\`bash
# Desarrollo
bun run dev              # Iniciar dev server (Turbopack)

# Build
bun run build            # Build para producción
bun run start            # Iniciar servidor de producción

# Database
bun run db:push          # Push schema a database
bun run db:seed          # Seed datos de prueba

# Testing
bun run test             # Ejecutar tests unitarios
bun run test:e2e         # Ejecutar tests E2E (Playwright)
bun run test:coverage    # Coverage report

# Linting
bun run lint             # Ejecutar ESLint
\`\`\`

---

## 🚀 Deploy

### Vercel (Recomendado)

1. Push a GitHub
2. Importa repositorio en [Vercel](https://vercel.com)
3. Configura variables de entorno
4. Deploy

Consulta **DEPLOYMENT-GUIDE.md** para instrucciones completas.

---

## 📚 Documentación Adicional

- **TEMPLATE-SETUP.md** - Guía para usar como template
- **DEPLOYMENT-GUIDE.md** - Guía completa de deployment
- **DEPLOY-CHECKLIST.md** - Checklist rápido de deploy
- **PWA-README.md** - Documentación PWA
- **README-SENTRY.md** - Configuración de Sentry

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/amazing-feature\`)
3. Commit tus cambios (\`git commit -m 'Add amazing feature'\`)
4. Push a la rama (\`git push origin feature/amazing-feature\`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver \`LICENSE\` para más detalles.

---

## 🙏 Créditos

Basado en **Porkyrios** - Un MVP de delivery de comida con PWA completa.

**Autor:** $PROJECT_AUTHOR
**Versión:** $PROJECT_VERSION

---

## 📧 Contacto

¿Preguntas? Abre un issue o contacta a $PROJECT_AUTHOR

---

¡Hecho con ❤️ usando Porkyrios como base!
EOF

echo -e "${GREEN}  ✓${NC} README.md creado"

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Setup Completado                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📦 Proyecto:${NC} $PROJECT_NAME"
echo -e "${BLUE}📝 Descripción:${NC} $PROJECT_DESCRIPTION"
echo -e "${BLUE}👤 Autor:${NC} $PROJECT_AUTHOR"
echo -e "${BLUE}🏷️  Versión:${NC} $PROJECT_VERSION"
if [ -n "$REPO_URL" ]; then
  echo -e "${BLUE}🔗 Repositorio:${NC} $REPO_URL"
fi

echo ""
echo -e "${YELLOW}⚠️  PRÓXIMOS PASOS:${NC}"
echo ""
echo -e "1. ${BLUE}Configurar .env${NC} con tus credenciales:"
echo -e "   ${YELLOW}→${NC} DATABASE_URL y DATABASE_AUTH_TOKEN (Turso)"
echo -e "   ${YELLOW}→${NC} ADMIN_PASSWORD (cambiar por uno seguro)"
echo -e "   ${YELLOW}→${NC} Otras credenciales según necesites"
echo ""
echo -e "2. ${BLUE}Crear base de datos en Turso${NC}:"
echo -e "   ${YELLOW}$${NC} turso db create $PROJECT_NAME"
echo -e "   ${YELLOW}$${NC} turso db show $PROJECT_NAME --url"
echo -e "   ${YELLOW}$${NC} turso db tokens create $PROJECT_NAME"
echo ""
echo -e "3. ${BLUE}Push schema a base de datos${NC}:"
echo -e "   ${YELLOW}$${NC} bun run db:push"
echo ""
echo -e "4. ${BLUE}Seed datos de prueba${NC} (opcional):"
echo -e "   ${YELLOW}$${NC} bun run db:seed"
echo ""
echo -e "5. ${BLUE}Iniciar desarrollo${NC}:"
echo -e "   ${YELLOW}$${NC} bun run dev"
echo ""
echo -e "${GREEN}🎉 ¡Tu proyecto está listo para despegar!${NC}"
echo ""
