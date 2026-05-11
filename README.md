# Vibe500NTL

Aplicacion web para explorar startups, gestionar perfiles y conectar usuarios con proyectos del ecosistema NTL/500. El frontend esta construido con Next.js App Router y React; el backend usa rutas API de Next, Prisma y PostgreSQL.

## Stack

- Next.js 16 con App Router
- React 19
- TypeScript
- Prisma 7 + PostgreSQL
- Cloudflare R2 para imagenes y assets
- Google OAuth para autenticacion
- Framer Motion, GSAP, Lenis y Anime.js para interacciones
- ESLint 9

## Estructura

- `app/`: paginas, layouts y rutas API.
- `components/`: experiencias y vistas principales de la aplicacion.
- `lib/`: clientes, helpers de sesion, datos y configuracion compartida.
- `prisma/`: schema, migraciones y seed.
- `public/`: assets estaticos.

## Configuracion local

```bash
npm install
cp .env.example .env
npm run db:generate
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## Variables de entorno

Usa `.env.example` como plantilla. Las variables reales no deben subirse al repo.

Variables principales:

- `DATABASE_URL` o `ACCELERATE_URL`
- `R2_ACCOUNT_ID`, `R2_API_TOKEN`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `OPENAI_API_KEY` para diagnosticos internos opcionales
- `N500_PLATFORM_API_BASE` y `N500_PLATFORM_API_TOKEN` para integracion con backend externo

## Scripts

```bash
npm run dev          # servidor local
npm run build        # prisma generate + next build
npm run start        # servidor de produccion
npm run lint         # eslint
npm run db:generate  # genera cliente Prisma
npm run db:migrate   # migraciones locales
npm run db:deploy    # migraciones para deploy
npm run db:seed      # seed de datos
npm run test:db      # prueba conexion a base de datos
npm run test:r2      # prueba conexion a R2
```

## Publicacion

Repositorio previsto: `https://github.com/CMindsDEV/Vibe500NTL`.

Antes de desplegar, configura las mismas variables de `.env.example` en el proveedor de hosting y ejecuta `npm run db:deploy` contra la base de datos de produccion.
