# Plan de Arquitectura — BrickLack

## Contexto

BrickLack es una web app para fans de LEGO que quieren reconstruir sets con piezas perdidas. Se construye desde cero con React 19 + Vite + TypeScript, Firebase como backend, GSAP para animaciones, y una Cloud Function como proxy de la Claude API para identificación de piezas por foto. El objetivo de este plan es definir toda la arquitectura antes de escribir una sola línea de código, para evitar refactors costosos.

**Decisiones tomadas por el usuario:**
- Router: **React Router v7** con `createBrowserRouter()`
- Estado: **Zustand** (UI/auth) + **TanStack Query v5** (server state)
- Cloud Functions: **Monorepo** — carpeta `/functions` en este repo
- Acento visual: **Amarillo LEGO `#FFD700`**
- Fondo: `#0A1628` (navy), Texto: `#F5F0E8` (cream)
- Tipografía: **Outfit** (display + body) + **JetBrains Mono** (datos técnicos)

---

## 1. Estructura Completa de Carpetas

```
BrickLack/
├── .env.example
├── .env.local                          # gitignored
├── .gitignore
├── .firebaserc
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts                      # alias: @ -> src
├── tailwind.config.ts
├── postcss.config.js
├── public/
│   ├── favicon.svg
│   ├── og-image.png
│   └── robots.txt
│
├── functions/                          # Cloud Functions (monorepo)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                            # ANTHROPIC_API_KEY (gitignored)
│   └── src/
│       ├── index.ts                    # exporta todas las functions
│       ├── identifyPiece.ts
│       ├── suggestSets.ts
│       ├── lib/
│       │   ├── claude.ts               # wrapper Anthropic SDK
│       │   ├── firestore.ts            # admin SDK init
│       │   └── cors.ts
│       ├── prompts/
│       │   ├── identifyPiece.ts
│       │   └── suggestSets.ts
│       └── types/
│           └── index.ts
│
└── src/
    ├── main.tsx                        # entry point + providers chain
    ├── App.tsx                         # RouterProvider wrapper
    ├── vite-env.d.ts
    │
    ├── assets/
    │   ├── fonts/
    │   │   ├── Outfit-Variable.woff2
    │   │   └── JetBrainsMono-Variable.woff2
    │   └── svg/
    │       ├── brick-2x4.svg
    │       ├── brick-2x2.svg
    │       ├── plate-1x2.svg
    │       ├── slope-2x2.svg
    │       ├── technic-pin.svg
    │       ├── tile-1x1.svg
    │       ├── google-logo.svg
    │       └── logo-bricklack.svg
    │
    ├── types/
    │   ├── index.ts                    # barrel re-export
    │   ├── user.ts
    │   ├── project.ts
    │   ├── piece.ts
    │   ├── set.ts
    │   ├── rebrickable.ts
    │   └── api.ts
    │
    ├── config/
    │   ├── firebase.ts                 # initializeApp, getAuth, getFirestore
    │   ├── queryClient.ts              # TanStack QueryClient con defaults
    │   └── gsap.ts                     # registerPlugin(ScrollTrigger) + globals
    │
    ├── lib/
    │   ├── rebrickable.ts              # fetch a Rebrickable API
    │   ├── auth.ts                     # signInWithGoogle, signOut, onAuthChanged
    │   ├── storage.ts                  # upload imagen para identificación
    │   ├── cloudFunctions.ts           # llamadas a identifyPiece, suggestSets
    │   └── firestore/
    │       ├── converters.ts           # withConverter<T> + converters por tipo
    │       ├── users.ts
    │       ├── projects.ts
    │       ├── pieces.ts
    │       └── setCache.ts
    │
    ├── hooks/
    │   ├── useAuth.ts                  # wrapper: user state + login/logout
    │   ├── useMediaQuery.ts
    │   ├── queries/
    │   │   ├── queryKeys.ts            # factory de query keys
    │   │   ├── useUserProfile.ts
    │   │   ├── useSetSearch.ts
    │   │   ├── usePieceSearch.ts
    │   │   ├── useSetDetail.ts
    │   │   ├── useSetParts.ts
    │   │   ├── usePieceDetail.ts
    │   │   ├── useProjects.ts
    │   │   ├── useProject.ts
    │   │   └── useProjectPieces.ts
    │   └── mutations/
    │       ├── useCreateProject.ts
    │       ├── useUpdateProject.ts
    │       ├── useDeleteProject.ts
    │       ├── useTogglePiece.ts       # con optimistic update
    │       ├── useIdentifyPiece.ts
    │       └── useSuggestSets.ts
    │
    ├── stores/
    │   ├── authStore.ts                # user | null, isLoading, isAuthenticated
    │   └── uiStore.ts                  # mobileMenuOpen, toasts[]
    │
    ├── router/
    │   ├── index.ts                    # createBrowserRouter
    │   ├── ProtectedRoute.tsx          # layout route: redirect si no auth
    │   └── routePaths.ts              # ROUTES const + buildXPath() helpers
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx              # variantes: primary, secondary, ghost, danger
    │   │   ├── Input.tsx
    │   │   ├── SearchInput.tsx         # input + debounce
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   ├── ProgressBar.tsx         # animada con GSAP
    │   │   ├── Modal.tsx               # overlay con GSAP
    │   │   ├── Toast.tsx
    │   │   ├── Spinner.tsx             # GSAP, no CSS spinner
    │   │   ├── Skeleton.tsx            # shimmer GSAP
    │   │   ├── EmptyState.tsx
    │   │   ├── ErrorState.tsx
    │   │   ├── Avatar.tsx
    │   │   ├── Counter.tsx             # número animado GSAP
    │   │   └── ConfirmDialog.tsx
    │   ├── layout/
    │   │   ├── RootLayout.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── MobileMenu.tsx          # GSAP slide
    │   │   ├── Footer.tsx
    │   │   └── PageTransition.tsx      # fade entre rutas GSAP
    │   ├── auth/
    │   │   ├── GoogleSignInButton.tsx
    │   │   └── UserMenu.tsx
    │   ├── home/
    │   │   ├── HeroSection.tsx
    │   │   ├── SearchBar.tsx
    │   │   ├── FloatingBricks.tsx      # SVGs animados loop infinito GSAP
    │   │   └── FeatureCards.tsx
    │   ├── search/
    │   │   ├── SearchResults.tsx
    │   │   ├── SetResultCard.tsx
    │   │   ├── PieceResultCard.tsx
    │   │   └── SearchFilters.tsx
    │   ├── set/
    │   │   ├── SetHeader.tsx
    │   │   ├── SetPartsList.tsx
    │   │   ├── SetPartItem.tsx
    │   │   └── AddToProjectButton.tsx
    │   ├── piece/
    │   │   ├── PieceHeader.tsx
    │   │   ├── PieceColorVariants.tsx
    │   │   └── PieceSetAppearances.tsx
    │   ├── dashboard/
    │   │   ├── ProjectGrid.tsx
    │   │   ├── ProjectCard.tsx
    │   │   ├── NewProjectCard.tsx
    │   │   └── DashboardStats.tsx
    │   ├── project/
    │   │   ├── ProjectHeader.tsx
    │   │   ├── PieceChecklist.tsx
    │   │   ├── PieceCheckItem.tsx      # animación checkmark GSAP
    │   │   ├── ProjectProgress.tsx
    │   │   ├── ProjectActions.tsx
    │   │   └── NewProjectForm.tsx
    │   └── identify/
    │       ├── CameraCapture.tsx
    │       ├── IdentifyResult.tsx
    │       ├── ScanCounter.tsx
    │       └── ScanLimitReached.tsx
    │
    ├── pages/
    │   ├── HomePage.tsx
    │   ├── SearchPage.tsx
    │   ├── SetDetailPage.tsx
    │   ├── PieceDetailPage.tsx
    │   ├── DashboardPage.tsx
    │   ├── ProjectDetailPage.tsx
    │   ├── NewProjectPage.tsx
    │   ├── IdentifyPage.tsx
    │   └── NotFoundPage.tsx
    │
    ├── styles/
    │   ├── index.css                   # @tailwind + @font-face + global
    │   └── animations.ts              # constantes GSAP reutilizables
    │
    └── utils/
        ├── cn.ts                       # clsx + twMerge
        ├── formatters.ts
        ├── imageCompression.ts
        └── debounce.ts
```

---

## 2. Providers Chain (main.tsx)

```
<React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>           ← componente efecto: escucha onAuthStateChanged → authStore
      <RouterProvider router={router} />
    </AuthProvider>
  </QueryClientProvider>
</React.StrictMode>
```

`AuthProvider` no es un Context React — es un componente efecto que escucha Firebase `onAuthStateChanged` y actualiza Zustand `authStore`. Zustand es el único source of truth para auth state en el cliente.

---

## 3. Router Structure (React Router v7)

```ts
createBrowserRouter([
  {
    element: <RootLayout />,           // Navbar + PageTransition + Footer
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/set/:setId', element: <SetDetailPage /> },
      { path: '/piece/:partNum', element: <PieceDetailPage /> },
      {
        element: <ProtectedRoute />,   // layout route — redirect si no auth
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/project/new', element: <NewProjectPage /> },
          { path: '/project/:projectId', element: <ProjectDetailPage /> },
          { path: '/identify', element: <IdentifyPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
```

---

## 4. Tipos TypeScript Clave

### user.ts
```ts
import { Timestamp } from 'firebase/firestore';
export interface UserDoc {
  displayName: string; email: string; photoURL: string;
  createdAt: Timestamp; scanCount: number; scanResetDate: Timestamp;
}
export interface User extends Omit<UserDoc, 'createdAt' | 'scanResetDate'> {
  uid: string; createdAt: Date; scanResetDate: Date;
}
```

### project.ts
```ts
export type ProjectStatus = 'in_progress' | 'completed' | 'paused';
export interface ProjectDoc {
  name: string; setId: string | null; setName: string | null;
  setImageUrl: string | null; status: ProjectStatus;
  createdAt: Timestamp; updatedAt: Timestamp;
  totalPieces: number; foundPieces: number;
}
export interface Project extends Omit<ProjectDoc, 'createdAt' | 'updatedAt'> {
  id: string; createdAt: Date; updatedAt: Date;
}
```

### piece.ts
```ts
export interface PieceDoc {
  partNum: string; name: string; color: string; colorCode: string;
  imageUrl: string; quantityRequired: number; quantityFound: number; isComplete: boolean;
}
export interface ProjectPiece extends PieceDoc { id: string; }
export interface PieceIdentification {
  type: string; color: string; dimensions: string;
  partNum: string | null; confidence: 'high' | 'medium' | 'low'; knownSets: string[];
}
```

---

## 5. Configuración Tailwind

```ts
// tailwind.config.ts
colors: {
  navy: { DEFAULT: '#0A1628', 50: '#0D1E38', 100: '#112648' },
  cream: { DEFAULT: '#F5F0E8', 200: '#E8DFD0' },
  lego: { yellow: '#FFD700', red: '#E3000B' },
  status: { success: '#22C55E', warning: '#F59E0B', error: '#EF4444' },
},
fontFamily: {
  display: ['"Outfit"', 'system-ui', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'monospace'],
},
boxShadow: {
  brick: '0 4px 0 0 rgba(0,0,0,0.25), 0 8px 24px -4px rgba(0,0,0,0.3)',
  'brick-hover': '0 6px 0 0 rgba(0,0,0,0.25), 0 12px 32px -4px rgba(0,0,0,0.35)',
  'glow-yellow': '0 0 20px rgba(255,215,0,0.3)',
},
```

Tipografía: **Outfit** (variable font, geométrica con redondez que evoca studs LEGO) + **JetBrains Mono** (para part numbers, cantidades, datos técnicos). Carga via `@font-face` local en `index.css`, no Google Fonts CDN.

---

## 6. Query Keys Factory

```ts
// src/hooks/queries/queryKeys.ts
export const queryKeys = {
  sets: {
    search: (query: string) => ['sets', 'search', query] as const,
    detail: (setId: string) => ['sets', 'detail', setId] as const,
    parts: (setId: string) => ['sets', 'parts', setId] as const,
  },
  pieces: {
    search: (query: string) => ['pieces', 'search', query] as const,
    detail: (partNum: string) => ['pieces', 'detail', partNum] as const,
  },
  projects: {
    all: (userId: string) => ['projects', userId] as const,
    detail: (userId: string, projectId: string) => ['projects', userId, projectId] as const,
    pieces: (userId: string, projectId: string) => ['projects', userId, projectId, 'pieces'] as const,
  },
  users: { profile: (userId: string) => ['users', userId] as const },
} as const;
```

**staleTime por tipo:** búsquedas Rebrickable 5min, detalles de set/pieza 30min, proyectos del usuario 0 (siempre re-fetch), perfil 1min.

---

## 7. Firestore Converters

`src/lib/firestore/converters.ts` — patrón: los tipos `Doc` tienen `Timestamp`, las entidades de dominio tienen `Date` y agregan `id`. Los converters transforman entre los dos en la capa de acceso a datos. Los componentes nunca tocan Firestore Timestamps.

```ts
export const projectConverter: FirestoreDataConverter<Project> = {
  toFirestore: ({ id, createdAt, updatedAt, ...rest }) => ({
    ...rest,
    createdAt: Timestamp.fromDate(createdAt),
    updatedAt: Timestamp.fromDate(updatedAt),
  }),
  fromFirestore: (snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt.toDate(),
    updatedAt: snapshot.data().updatedAt.toDate(),
  } as Project),
};
```

---

## 8. Constantes GSAP (src/styles/animations.ts)

```ts
export const GSAP_DEFAULTS = {
  DURATION: { FAST: 0.2, NORMAL: 0.4, SLOW: 0.8, PAGE: 0.5 },
  EASE: { ENTER: 'power2.out', EXIT: 'power2.in', BOUNCE: 'back.out(1.7)' },
  STAGGER: { CARDS: 0.08, LIST: 0.05, HERO: 0.15 },
} as const;

export const CARD_HOVER = { scale: 1.03, duration: 0.25, ease: 'power2.out' } as const;
```

Regla absoluta: `useGSAP()` de `@gsap/react` para todas las animaciones. Nunca `useEffect`. Usar `gsap.matchMedia()` para `prefers-reduced-motion`.

---

## 9. Cloud Functions — Arquitectura

```
Cliente → POST /identifyPiece → Cloud Function → verifica límite Firestore
                                               → llama Claude API
                                               → incrementa scanCount
                                               ← retorna { success, data, remainingScans }
```

**Seguridad:** El cliente envía Firebase ID token en header `Authorization: Bearer <token>`. La Function lo verifica con `admin.auth().verifyIdToken(token)` y extrae el `uid` desde ahí — nunca confía en el `userId` del body. `ANTHROPIC_API_KEY` solo vive en el environment de la Cloud Function, nunca en el cliente.

**Verificación del límite:** server-side siempre. Si han pasado más de 30 días desde `scanResetDate`, resetear `scanCount` a 0. Si `scanCount >= 3`, rechazar con error.

---

## 10. Cache de Sets Rebrickable

Flujo al crear un proyecto desde un set:
1. Verificar si `sets/{setId}/pieces` existe en Firestore
2. Si NO existe: fetch a Rebrickable (paginado) → batch write al caché
3. Si existe: leer del caché
4. Crear `users/{userId}/projects/{projectId}` con metadata del set
5. Copiar piezas a `users/{userId}/projects/{projectId}/pieces/{pieceId}` con `quantityFound: 0`

El caché es **inmutable** una vez escrito (Firestore rules: `allow create` but not `update`/`delete`).

---

## 11. Optimistic Update — useTogglePiece

El hook más crítico de UX. Implementa optimistic update completo:
1. `onMutate`: cancela queries en vuelo, toma snapshot, actualiza cache localmente
2. `onError`: rollback al snapshot anterior
3. `onSettled`: invalida `pieces` y `detail` del proyecto para sincronizar con Firestore

---

## 12. Firestore Security Rules

```
match /users/{userId} { allow read, write: if request.auth.uid == userId; }
match /users/{userId}/projects/{projectId} { allow read, write: if request.auth.uid == userId; }
match /users/{userId}/projects/{projectId}/pieces/{pieceId} { allow read, write: if request.auth.uid == userId; }
match /sets/{setId}/pieces/{pieceId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update, delete: if false;  // caché inmutable
}
```

---

## 13. Orden de Creación de Archivos

### ✅ Fase 0 — Configuración base (COMPLETA)
```
package.json → tsconfig.json → tsconfig.node.json → vite.config.ts
→ tailwind.config.ts → postcss.config.js → index.html → .gitignore
→ .env.example → firebase.json → .firebaserc → firestore.rules
→ firestore.indexes.json → storage.rules
```

### ✅ Fase 1 — Fundaciones frontend (COMPLETA)
```
src/vite-env.d.ts → src/styles/index.css → assets/fonts/
→ src/types/* (user, project, piece, set, rebrickable, api, index)
→ src/utils/cn.ts → src/utils/formatters.ts → src/utils/debounce.ts → src/utils/imageCompression.ts
→ src/config/firebase.ts → src/config/queryClient.ts → src/config/gsap.ts
→ src/styles/animations.ts
```

### ✅ Fase 2 — Stores + Lib (COMPLETA)
```
src/stores/authStore.ts → src/stores/uiStore.ts
→ src/lib/auth.ts → src/lib/firestore/converters.ts
→ src/lib/firestore/users.ts → src/lib/firestore/projects.ts
→ src/lib/firestore/pieces.ts → src/lib/firestore/setCache.ts
→ src/lib/rebrickable.ts → src/lib/storage.ts → src/lib/cloudFunctions.ts
```

### ✅ Fase 3 — Hooks (COMPLETA)
```
src/hooks/queries/queryKeys.ts → src/hooks/useAuth.ts → src/hooks/useMediaQuery.ts
→ src/hooks/queries/* (todos) → src/hooks/mutations/* (todos)
```

### ✅ Fase 4 — Componentes UI base (COMPLETA)
```
Button → Input → SearchInput → Card → Badge → ProgressBar → Modal
→ Toast → Spinner → Skeleton → EmptyState → ErrorState → Avatar → Counter → ConfirmDialog
```

### ✅ Fase 5 — Layout + Auth + Router + App (COMPLETA)
```
GoogleSignInButton → UserMenu → Footer → PageTransition → MobileMenu → Navbar → RootLayout
→ src/router/routePaths.ts → src/router/ProtectedRoute.tsx → src/router/index.tsx
→ src/App.tsx → src/main.tsx
```

### ✅ Fase 6 — Features (COMPLETA)
```
Home: FloatingBricks → SearchBar → HeroSection → FeatureCards → HomePage
Search: SetResultCard → PieceResultCard → SearchFilters → SearchResults → SearchPage
Set: SetPartItem → SetPartsList → SetHeader → AddToProjectButton → SetDetailPage
Piece: PieceHeader → PieceColorVariants → PieceSetAppearances → PieceDetailPage
Dashboard: DashboardStats → ProjectCard → NewProjectCard → ProjectGrid → DashboardPage
Project: PieceCheckItem → PieceChecklist → ProjectProgress → ProjectHeader → ProjectActions
       → NewProjectForm → ProjectDetailPage → NewProjectPage
Identify: ScanCounter → ScanLimitReached → CameraCapture → IdentifyResult → IdentifyPage
NotFoundPage
```

### Fase 7 — Cloud Functions
```
functions/package.json → functions/tsconfig.json
→ functions/src/types/index.ts → functions/src/lib/cors.ts
→ functions/src/lib/firestore.ts → functions/src/lib/claude.ts
→ functions/src/prompts/* → functions/src/identifyPiece.ts
→ functions/src/suggestSets.ts → functions/src/index.ts
```

---

## 14. Archivos Críticos

- `src/config/firebase.ts` — todo depende de la inicialización de Firebase
- `src/types/index.ts` y sus módulos — contrato de datos de toda la app
- `src/hooks/queries/queryKeys.ts` — columna vertebral de TanStack Query
- `src/router/index.ts` — estructura de navegación y rutas protegidas
- `src/lib/firestore/converters.ts` — tipado fuerte de Firestore en toda la app
- `functions/src/identifyPiece.ts` — Cloud Function más crítica: auth, límite scans, Claude API

---

## Verificación

Para confirmar que el setup funciona antes de escribir features:
1. `npm run dev` — app levanta sin errores en `localhost:5173`
2. Google Sign-In redirige y persiste sesión en Firestore
3. Buscar un set retorna resultados de Rebrickable
4. Crear un proyecto guarda docs en Firestore con la estructura correcta
5. Marcar pieza aplica optimistic update y sincroniza con Firestore
6. Cloud Function responde localmente via Firebase Emulator
