# CLAUDE.md — Bricklack

## ¿Qué es este proyecto?

Bricklack es una web app para fanáticos de LEGO que perdieron piezas de sus sets y quieren volver a armarlos. El usuario elige un set, importa su inventario de piezas, y va marcando las que ya encontró hasta completarlo. También puede identificar piezas sueltas con IA y descubrir qué sets puede armar con las piezas que tiene disponibles.

**Web**: bricklack.com  
**Mobile**: app Flutter independiente (posterior), comparte la misma base de datos Firestore.

---

## Stack

- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Animaciones**: GSAP + `@gsap/react` — obligatorio para TODAS las animaciones. No usar CSS transitions ni Framer Motion.
- **UI/Componentes**: diseño propio. No usar component libraries (shadcn, MUI, Chakra, etc.). Seguir los principios de la `frontend-design` skill: tipografía distintiva, identidad visual cohesiva, sin estética genérica de IA.
- **Backend**: Firebase (Firestore, Auth, Storage, Cloud Functions v2)
- **Auth**: Firebase Auth — Google Sign-In únicamente
- **API externa**: Rebrickable API (sets, piezas, inventarios, imágenes)
- **IA**: Anthropic Claude API (`claude-sonnet-4-20250514`) via Cloud Function proxy — nunca llamar directo desde el cliente en producción

---

## Variables de Entorno

```env
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_REBRICKABLE_API_KEY
VITE_ANTHROPIC_API_KEY  # solo en desarrollo local, en prod va en Cloud Function
```

---

## Estructura de Rutas

```
/                        → Home (hero animado + buscador + piezas decorativas)
/search?q=...            → Resultados de búsqueda (sets o piezas)
/set/:setId              → Detalle de un set
/piece/:partNum          → Detalle de una pieza
/dashboard               → Colección de proyectos del usuario (requiere auth)
/project/:projectId      → Vista detallada de un proyecto en progreso
/project/new             → Crear nuevo proyecto (con o sin set)
/identify                → Identificar pieza por foto (requiere auth)
```

---

## Estructura de Datos Firestore

```
users/{userId}
  - displayName: string
  - email: string
  - photoURL: string
  - createdAt: timestamp
  - scanCount: number          // escaneos de IA usados en el mes actual
  - scanResetDate: timestamp   // fecha del último reset mensual del contador

users/{userId}/projects/{projectId}
  - name: string
  - setId: string | null       // null si es proyecto libre (sin set elegido)
  - setName: string | null
  - setImageUrl: string | null
  - status: 'in_progress' | 'completed' | 'paused'
  - createdAt: timestamp
  - updatedAt: timestamp
  - totalPieces: number
  - foundPieces: number

users/{userId}/projects/{projectId}/pieces/{pieceId}
  - partNum: string
  - name: string
  - color: string
  - colorCode: string
  - imageUrl: string
  - quantityRequired: number
  - quantityFound: number
  - isComplete: boolean
```

---

## Reglas de Negocio Importantes

### Límite de escaneos IA
- La feature de identificación de piezas por foto **requiere login obligatorio**
- Cada usuario tiene **3 escaneos gratuitos por mes**
- El contador `scanCount` se guarda en Firestore en el documento del usuario
- Al inicio de cada mes (comparar con `scanResetDate`) se resetea a 0
- Si `scanCount >= 3`, mostrar mensaje claro explicando el límite y cuándo se renueva
- **Nunca** llamar a la Claude API sin verificar el límite primero — la verificación va en la Cloud Function, no solo en el cliente

### Caché de sets de Rebrickable
- Cuando un usuario agrega un set por primera vez, guardar el inventario completo en Firestore bajo `sets/{setId}/pieces`
- Los siguientes usuarios que agreguen el mismo set usan el caché, no llaman a Rebrickable de nuevo
- Esto evita quemar el rate limit de la API gratuita

### Compatibilidad con mobile (Flutter)
- Respetar la estructura de Firestore desde el día 1, no cambiarla después
- Las Cloud Functions deben ser agnósticas al cliente (web o mobile)
- No guardar nada específico de web en Firestore que rompa la lectura desde Flutter

---

## Diseño Visual

### Estética
- **Tema**: Light, limpio, "inventario/catálogo profesional". Identidad propia, no genérica.
- **Color de fondo de página**: Blanco roto o gris muy claro — `#F8F7F4` o `white`
- **Color de superficie (cards, modales)**: Blanco puro `#FFFFFF` con borde `navy/8` y sombra `shadow-brick`
- **Color de texto principal**: Navy `#0A1628` — headings y texto de datos
- **Color de texto secundario**: `navy/30` a `navy/40` — set numbers, labels, metadata
- **Acento interactivo**: Amarillo LEGO `#FFD700` — CTAs, highlights, estados activos, barras de progreso. Usar este, no el rojo.
- **Estados de status**: success `#22C55E`, warning `#F59E0B`, error `#EF4444`
- **Tipografía**: `Outfit` (display + body) + `JetBrains Mono` (números de piezas, IDs, cantidades técnicas)

### Paleta de tokens Tailwind (referencia rápida)
```
bg-white            → superficie de cards y paneles
bg-navy/5           → fondo de imágenes dentro de cards (gris suave)
border-navy/8       → bordes sutiles de cards
text-navy           → títulos y texto principal
text-navy/30–40     → texto secundario / metadata
text-lego-yellow    → acento activo, porcentajes, highlights
shadow-brick        → sombra estándar de cards
bg-lego-yellow      → fills de progreso, botones primarios
```

### Home
- Fondo azul marino oscuro (`#0A1628`) **solo en la sección hero** — es la excepción, no la regla
- Piezas de LEGO dibujadas en estilo minimalista (solo trazo, sin relleno) en color cream/blanco sobre ese fondo
- Las piezas se animan con GSAP: aparecen, rotan suavemente, se desvanecen en loop
- El resto de la página (secciones de features, search, etc.) usa el tema claro

### Componentes
- Cards: `bg-white`, borde `navy/8`, `shadow-brick` — deben sentirse como objetos físicos sobre fondo claro
- Imágenes dentro de cards: área `bg-navy/5` (gris muy suave) para que la imagen contraste sin fondo blanco puro
- Hover states con micro-animaciones GSAP (lift + sombra), no CSS puro
- Loading states con animaciones GSAP, no spinners genéricos
- Todos los componentes deben ser responsive mobile-first

---

## Animaciones — Reglas GSAP

```ts
// Siempre usar useGSAP() de @gsap/react, nunca useEffect para animaciones
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Las animaciones se limpian automáticamente con useGSAP — no hace falta cleanup manual
// ScrollTrigger.refresh() después de cambios de layout dinámicos
```

- Entrada de secciones al scroll: `ScrollTrigger` con `stagger`
- Transiciones entre rutas: fade suave
- Piezas decorativas del Home: loop infinito con `gsap.to()` y `repeat: -1`
- Interacciones de cards: `gsap.to()` en `onMouseEnter/Leave`

---

## Integración Rebrickable API

Base URL: `https://rebrickable.com/api/v3/lego/`  
Headers: `Authorization: key {VITE_REBRICKABLE_API_KEY}`

Endpoints principales:
```
GET /sets/{set_num}/          → info del set
GET /sets/{set_num}/parts/    → inventario de piezas del set
GET /parts/{part_num}/        → info de una pieza
GET /sets/?search=...         → búsqueda de sets
GET /parts/?search=...        → búsqueda de piezas
```

---

## Integración Claude API (Cloud Function)

La Cloud Function actúa como proxy. El cliente nunca llama a Anthropic directamente en producción.

### Identificación de pieza por foto
```ts
// Payload que recibe la Cloud Function desde el cliente
{
  imageBase64: string,   // imagen comprimida antes de enviar
  userId: string         // para verificar el límite de escaneos
}

// Prompt al modelo
"Eres un experto en piezas de LEGO. Analiza esta imagen e identifica:
1. Tipo de pieza (brick, plate, tile, technic, slope, etc.)
2. Color
3. Dimensiones (ej: 2x4, 1x2, 1x1)
4. Número de parte probable según el sistema de Rebrickable/BrickLink
5. Sets conocidos en los que aparece esta pieza

Responde en JSON con esta estructura:
{
  type: string,
  color: string,
  dimensions: string,
  partNum: string | null,
  confidence: 'high' | 'medium' | 'low',
  knownSets: string[]
}"
```

### Sugerencia de sets armables (proyecto libre)
```ts
// El cliente envía la lista de piezas disponibles del usuario
// La Cloud Function consulta a Claude con el inventario
// Claude sugiere sets que se pueden armar parcial o totalmente
```

---

## Orden de Desarrollo

1. Setup: Vite + React 19 + TS + Tailwind + Firebase config
2. Firebase Auth con Google Sign-In
3. Home: diseño base + navbar + animaciones GSAP de fondo
4. Integración Rebrickable API — búsqueda de sets y piezas
5. Dashboard: CRUD de proyectos en Firestore
6. Vista de proyecto: lista de piezas + contador + marcar como encontrada
7. Caché de sets en Firestore
8. Cloud Function proxy para Claude API
9. Feature: identificación de pieza por foto + límite de 3 escaneos/mes
10. Feature: sugerencia de sets armables con IA
11. Pulido visual, responsive, optimizaciones, deploy en Vercel

---

## Notas Finales

- El proyecto debe estar listo para ser consumido también por una app Flutter en el futuro — respetar la estructura de datos y hacer las Cloud Functions agnósticas al cliente
- Ante la duda entre velocidad y calidad de código, priorizar calidad — este proyecto va al portfolio
- Cada componente visual debe tener identidad propia, siguiendo los principios de `frontend-design`
- GSAP es obligatorio para animaciones, sin excepciones
