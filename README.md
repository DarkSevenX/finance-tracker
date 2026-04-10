# Boo Money (presupuesto personal en COP)

Aplicación web para registrar ingresos y gastos en **pesos colombianos (COP)**, con presupuesto por la regla **50/30/20** (necesidades, deseos, ahorros) y porcentajes **editables** por usuario. Incluye varias **cuentas** (efectivo, banco, tarjeta), **categorías** con subcategorías opcionales, **traspasos** entre cuentas y ajustes manuales entre bloques del presupuesto por mes.

La interfaz está en español y el flujo principal está bajo `/dashboard` con autenticación por correo y contraseña.

---

## Tabla de contenidos

1. [Características](#características)
2. [Stack técnico](#stack-técnico)
3. [Requisitos](#requisitos)
4. [Instalación y desarrollo local](#instalación-y-desarrollo-local)
5. [Variables de entorno](#variables-de-entorno)
6. [Base de datos](#base-de-datos)
7. [Scripts npm](#scripts-npm)
8. [Estructura del repositorio](#estructura-del-repositorio)
9. [Autenticación y rutas](#autenticación-y-rutas)
10. [Modelo de datos y reglas de negocio](#modelo-de-datos-y-reglas-de-negocio)
11. [Despliegue](#despliegue)
12. [Licencia](#licencia)

---

## Características

- **Registro e inicio de sesión** con email y contraseña (hash con bcrypt); sesión JWT vía Auth.js (NextAuth v5).
- **Cuentas financieras** con tipo (efectivo, banco, tarjeta, otra) y saldos derivados de movimientos.
- **Categorías** de ingreso y gasto; árbol opcional (subcategorías); asignación de gastos a bloques del presupuesto (necesidades, deseos, ahorros) cuando aplique.
- **Transacciones**: ingresos, gastos y traspasos entre cuentas; ingresos con modos de reparto al presupuesto (50/30/20 configurable, o 100% a un solo bloque).
- **Dashboard**: resumen mensual, tarjetas por bloque, gráficos de ingresos/gastos, tabla de movimientos, navegación por mes.
- **Reasignación entre bloques** en un mismo mes (mover disponibilidad entre necesidades, deseos y ahorros sin crear ingresos ni gastos ficticios).
- **Moneda**: montos enteros en COP.

---

## Stack técnico

| Área | Tecnología |
|------|------------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router, React Server Components donde aplica) |
| UI | React 19, Tailwind CSS 4 |
| Formularios / validación | react-hook-form, Zod |
| Base de datos | SQLite (local) o [Turso](https://turso.tech/) (libSQL en la nube) |
| ORM | Prisma 6 con adaptador opcional `@prisma/adapter-libsql` para Turso |
| Auth | Auth.js / NextAuth v5 (proveedor Credentials) |
| Animación / iconos | Framer Motion, Lucide React |
| Notificaciones | Sonner |

---

## Requisitos

- **Node.js** 20.x o compatible (recomendado alinear con la versión usada en desarrollo).
- **npm** (o gestor equivalente) para instalar dependencias.

---

## Instalación y desarrollo local

```bash
git clone <url-de-tu-repositorio>
cd finance-tracker
npm install
```

Crea un archivo `.env` en la raíz (puedes partir de `.env.example`):

```bash
cp .env.example .env
```

Ajusta los valores (ver [Variables de entorno](#variables-de-entorno)).

Genera el cliente de Prisma y aplica migraciones locales a SQLite:

```bash
npx prisma migrate dev
```

Arranca el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La landing redirige a usuarios autenticados al dashboard; las rutas `/dashboard/*` exigen sesión.

---

## Variables de entorno

| Variable | Obligatoriedad | Descripción |
|----------|----------------|-------------|
| `DATABASE_URL` | Sí | Cadena de conexión SQLite local, p. ej. `file:./dev.db`. Prisma la usa en el `schema.prisma` y para migraciones locales. |
| `AUTH_SECRET` | Sí en producción | Secreto para firmar el JWT; valor largo y aleatorio. |
| `NEXTAUTH_SECRET` | Recomendado | Compatibilidad con NextAuth; debe ser el **mismo valor** que `AUTH_SECRET`. El proxy de borde (`src/proxy.ts`) y `auth.ts` usan `AUTH_SECRET` o, si falta, `NEXTAUTH_SECRET`. |
| `AUTH_URL` | Sí en producción (Vercel, etc.) | URL pública del sitio **sin barra final**, p. ej. `https://boo-money.vercel.app`. Si falta, las cookies de sesión pueden no aplicarse bien y el login parece “no redirigir” al dashboard. |
| `TURSO_DATABASE_URL` | Opcional | URL `libsql://...` de la base en Turso. Si está definida junto con el token, la aplicación usa el adaptador libSQL en tiempo de ejecución. |
| `TURSO_AUTH_TOKEN` | Opcional | Token de autenticación de Turso; obligatorio si usas `TURSO_DATABASE_URL` en runtime. |

**Desarrollo solo con SQLite local:** define `DATABASE_URL` y los secretos; **no** definas `TURSO_*`.

**Producción con Turso:** define `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET`, `NEXTAUTH_SECRET` y mantén también un `DATABASE_URL` (p. ej. `file:./dev.db`) para que `prisma generate` y el build no fallen al resolver el schema.

Nunca subas `.env` al repositorio ni compartas tokens en issues o chats públicos.

---

## Base de datos

### SQLite local (desarrollo)

- El archivo por defecto suele ser `dev.db` en la raíz del proyecto si `DATABASE_URL=file:./dev.db`.
- Esquema y migraciones: carpeta `prisma/migrations/`.
- Comandos útiles:
  - `npx prisma migrate dev` — crea o aplica migraciones en desarrollo.
  - `npx prisma studio` — interfaz visual para inspeccionar datos.

### Turso (producción o prueba remota)

Prisma Migrate **no** ejecuta migraciones directamente contra Turso como contra un servidor SQL clásico. El flujo habitual es:

1. Generar y mantener migraciones contra SQLite local con `prisma migrate dev`.
2. Aplicar el SQL resultante a la base remota.

Este proyecto incluye un script que recorre `prisma/migrations/*/migration.sql` en orden cronológico y lo ejecuta en Turso mediante `@libsql/client`:

```bash
npm run db:turso:migrate
```

Requisitos: `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` en `.env`. Ejecútalo **una vez** al crear una base nueva en Turso, y de nuevo cuando añadas migraciones en el futuro (aplica solo archivos nuevos con cuidado: el script ejecuta todas las carpetas de migración; en bases ya migradas, conviene usar solo entornos nuevos o adaptar el proceso).

La instancia de Prisma (`src/lib/prisma.ts`) usa el adaptador **solo** si ambas variables `TURSO_*` están definidas y no vacías; en caso contrario usa el cliente estándar contra `DATABASE_URL`.

---

## Scripts npm

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo Next.js. |
| `npm run build` | Compilación de producción. |
| `npm run start` | Sirve la build (tras `build`). |
| `npm run lint` | ESLint. |
| `npm run db:turso:migrate` | Aplica todas las migraciones SQL locales a la base Turso configurada en `.env`. |
| `postinstall` | Ejecuta `prisma generate` tras `npm install`. |

---

## Estructura del repositorio

Rutas orientativas (simplificado):

```
prisma/
  schema.prisma          # Modelos y enums
  migrations/            # Migraciones SQL versionadas
scripts/
  apply-turso-migrations.mjs   # Volcado de migraciones a Turso
src/
  app/                   # App Router: páginas, layouts, API routes
    api/auth/[...nextauth]/    # Auth.js
    api/register/              # Registro HTTP + validación Zod
    dashboard/                 # Resumen, cuentas, categorías, movimientos
    login/, register/
  actions/               # Server Actions (cuentas, categorías, transacciones, etc.)
  auth.ts                # Configuración NextAuth
  components/            # UI reutilizable y formularios
  lib/                   # Prisma, utilidades de presupuesto, fechas, UI
  proxy.ts               # Next.js 16: protección de /dashboard y redirecciones de auth
```

---

## Autenticación y rutas

- **Proxy** (`src/proxy.ts`, sustituye a `middleware.ts` en Next.js 16): las rutas bajo `/dashboard` requieren JWT válido; si no hay sesión, redirección a `/login` con `callbackUrl`. Si ya hay sesión, `/login` y `/register` redirigen a `/dashboard`. En HTTPS, `getToken` debe usar `secureCookie: true` para leer la cookie `__Secure-authjs.session-token` (si no, la sesión parece vacía y el login queda en bucle en producción).
- **Credenciales**: validación en `authorize` contra la tabla `User`; contraseñas nunca en texto plano.
- **API de registro** (`POST /api/register`): crea usuario, hash de contraseña y `BudgetSettings` por defecto (50/30/20).

Rutas principales de la aplicación autenticada:

| Ruta | Contenido |
|------|-----------|
| `/dashboard` | Resumen del mes, bloques, gráficos y accesos rápidos |
| `/dashboard/cuentas` | Gestión de cuentas |
| `/dashboard/categorias` | Categorías y subcategorías |
| `/dashboard/movimientos` | Listado y altas de movimientos |

---

## Modelo de datos y reglas de negocio

- **Usuario** (`User`): email único, `passwordHash`, relación 1:1 con `BudgetSettings` (porcentajes `needsPct`, `wantsPct`, `savingsPct`).
- **Cuentas** (`FinancialAccount`, tabla `financial_accounts`): nombre, `WalletKind`, pertenencia al usuario.
- **Categorías** (`Category`): tipo ingreso/gasto, jerarquía opcional, campo `bucket` para gastos según regla 50/30/20.
- **Transacciones** (`Transaction`): ingreso, gasto o traspaso; montos enteros; categoría opcional en algunos casos; campos de reparto de ingresos y `expenseBucket` para gastos sin categoría; soporte de cuenta destino en traspasos (`toAccountId`).
- **BucketReallocation**: movimientos de saldo conceptual entre bloques NEEDS/WANTS/SAVINGS en un mes dado.

La lógica de agregación, saldos y presupuesto está repartida en `src/lib/` (por ejemplo `dashboard-data.ts`, `month-budget-envelope.ts`, `budget-alloc.ts`, `account-balance.ts`).

---

## Despliegue

1. Configura las variables de entorno en tu plataforma (Vercel, Railway, VPS con Node, etc.).
2. Con Turso: crea la base, obtén URL y token, ejecuta `npm run db:turso:migrate` desde un entorno con acceso a esas variables **o** aplica el SQL equivalente con la herramienta que prefieras.
3. Asegura `AUTH_SECRET` y `NEXTAUTH_SECRET` con valores seguros y únicos.
4. Ejecuta `npm run build` y `npm run start` (o el comando que use el proveedor).

Comprueba que la versión de Node del hosting sea compatible con Next.js 16 y Prisma 6.

---

## Licencia

Este proyecto se publica bajo **PolyForm Noncommercial License 1.0.0** (archivo `LICENSE` en la raíz). Permite uso, copia y modificación para fines **no comerciales**; el uso comercial requiere permiso aparte del titular de los derechos. No constituye asesoramiento legal: lee el texto completo en `LICENSE` y en [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

Sustituye en `LICENSE` las líneas de copyright por tu nombre u organización y mantén coherente el aviso `Required Notice`.

---

## Soporte y contribuciones

Para reportar errores o proponer mejoras, usa los issues del repositorio. Si contribuyes código, respeta la licencia y evita incluir datos personales o secretos en commits.
