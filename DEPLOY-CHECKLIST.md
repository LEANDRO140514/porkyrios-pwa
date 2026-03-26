# ✅ Deploy Checklist - Porkyrios

## 📋 Pre-Deploy (10 min)

### 1. Verificación Local
```bash
# Ejecutar script de verificación
bash scripts/pre-deploy-check.sh
```

**O manualmente:**
- [ ] `npm run build` - Build exitoso
- [ ] `npm run test:run` - Tests pasando
- [ ] `.env` está en `.gitignore`
- [ ] No hay console.logs críticos

---

## 🔑 Variables de Entorno (30 min)

### Obligatorias (CRITICAL)
- [ ] `DATABASE_URL` - Turso Database URL
- [ ] `DATABASE_AUTH_TOKEN` - Turso Auth Token
- [ ] `ADMIN_PASSWORD` - Contraseña admin panel

### Recomendadas (HIGH PRIORITY)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Error tracking
- [ ] `SENTRY_AUTH_TOKEN` - Sentry releases
- [ ] `SENTRY_ORG` - Org slug
- [ ] `SENTRY_PROJECT` - Project slug
- [ ] `RESEND_API_KEY` - Email notifications

### Opcionales
- [ ] `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` - Pagos
- [ ] `MERCADOPAGO_ACCESS_TOKEN` - Pagos backend

### Producción
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app`
- [ ] `NEXT_PUBLIC_PWA_ENABLED=true`

---

## 🚀 Deploy a Vercel (15 min)

### Opción A: Git + Vercel (Recomendado)
```bash
# 1. Push a GitHub
git add .
git commit -m "feat: ready for production"
git push origin main

# 2. Importar en Vercel
# - Ve a https://vercel.com/new
# - Importa el repo
# - Configura variables de entorno
# - Deploy
```

### Opción B: Vercel CLI
```bash
# 1. Instalar CLI
npm i -g vercel

# 2. Deploy
vercel login
vercel

# 3. Configurar env vars en UI
# 4. Deploy a producción
vercel --prod
```

---

## 🔍 Post-Deploy Testing (15 min)

### Critical Path Testing
- [ ] **Homepage** - Carga < 4s
- [ ] **Auth Flow** - Register → Login → Logout
- [ ] **Menu** - Productos se muestran
- [ ] **Cart** - Agregar/Remover productos
- [ ] **Checkout** - Formulario funciona
- [ ] **Payment** - MercadoPago redirect
- [ ] **Tracking** - Ver estado de pedido
- [ ] **Admin** - Acceso con password
- [ ] **PWA** - Instalar en móvil
- [ ] **Email** - Confirmación enviada (Resend)
- [ ] **Sentry** - Errores reportados

---

## 📊 Monitoring Setup (10 min)

### Vercel Dashboard
- [ ] Configurar alertas de errores
- [ ] Verificar Web Vitals
- [ ] Monitorear bandwidth usage

### Sentry Dashboard
- [ ] Configurar alertas por email
- [ ] Verificar source maps
- [ ] Crear Slack integration (opcional)

### Database (Turso)
- [ ] Verificar conexiones activas
- [ ] Configurar backup automático
- [ ] Monitorear storage usage

---

## 🔒 Security Checklist

- [ ] `.env` NO está en Git
- [ ] Secrets NO están hardcodeados
- [ ] ADMIN_PASSWORD cambiado del default
- [ ] CORS configurado correctamente
- [ ] Rate limiting activo (API routes)
- [ ] SQL injection protegido (Drizzle ORM)

---

## 🎯 Performance Targets

```
Métrica                     | Target  | Critical
----------------------------|---------|----------
Load Time (LCP)             | < 4s    | < 6s
First Input Delay (FID)     | < 100ms | < 300ms
Cumulative Layout Shift     | < 0.1   | < 0.25
Bundle Size                 | < 1.5MB | < 3MB
API Response Time           | < 500ms | < 1s
Error Rate                  | < 1%    | < 5%
```

---

## 🔄 Rollback Plan

### Si hay problemas críticos:

**Opción 1: Vercel UI**
1. Ve a Deployments
2. Encuentra deployment anterior
3. "Promote to Production"

**Opción 2: CLI**
```bash
vercel rollback
```

**Opción 3: Git Revert**
```bash
git revert HEAD
git push origin main
```

---

## 📞 Emergency Contacts

- **Vercel Support:** https://vercel.com/support
- **Turso Docs:** https://docs.turso.tech
- **Sentry Status:** https://status.sentry.io
- **Next.js Discord:** https://nextjs.org/discord

---

## ✅ Success Criteria

Deploy es exitoso cuando:
- ✅ Todos los tests pasan
- ✅ Performance < 4s load time
- ✅ Error rate < 1%
- ✅ Auth flow completo funciona
- ✅ Pagos funcionan end-to-end
- ✅ PWA instala correctamente
- ✅ Emails se envían
- ✅ Admin panel accesible
- ✅ Monitoring activo

---

## 🎉 Post-Launch

- [ ] Anunciar en redes sociales
- [ ] Notificar a stakeholders
- [ ] Documentar lessons learned
- [ ] Planear mejoras para próxima iteración
- [ ] **¡CELEBRAR! 🎊**

---

**Tiempo total estimado: 60-90 minutos**

Ver guía detallada: [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
