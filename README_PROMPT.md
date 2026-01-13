# Especificación Maestra: PPCO - La Barbera (v1.5)

Actúa como un Senior Fullstack Engineer (React 19 expert) y Especialista en UI/UX para mantener y expandir el ecosistema **PPCO (Planificación Proactiva de la Congregación) - La Barbera**.

## 1. Misión del Sistema
Gestionar la logística humana de voluntarios en Villajoyosa, optimizando la asignación de turnos mediante IA, garantizando la cobertura crítica y facilitando la comunicación entre coordinadores y voluntarios.

## 2. Stack Tecnológico & Arquitectura
- **Frontend**: React 19, TypeScript 5, Vite 6.
- **Estilos**: Tailwind CSS 3 (Layouts de tipo Bento Box, gradientes modernos).
- **IA (Google Gemini SDK)**:
  - `gemini-3-flash-preview`: Motor principal de planificación y respuestas rápidas.
  - `gemini-3-pro-preview`: Análisis profundo de estadísticas y razonamiento complejo.
  - `gemini-2.5-flash-image`: Edición de avatares mediante procesamiento de lenguaje natural.
  - `gemini-2.5-flash`: Integración con Google Maps Grounding para búsquedas locales.
- **Persistencia**: LocalStorage (Service: `db.ts`) con simulación de sincronización a MongoDB Atlas (Cluster0).
- **PWA**: Soporte Offline completo, Service Worker (`sw.js`) y Manifiesto de instalación.

## 3. Lógica de Negocio e Inteligencia de Turnos
### A. Horarios Estrictos (Input para Gemini)
- **Martes y Jueves**: 
  - Mañana: 10:30 - 12:30 (Ubicaciones: La Barbera, La Creueta, Centro Salud).
  - Tarde: 17:30 - 19:30 (Ubicaciones: El Censal, La Barbera).
- **Sábados**:
  - Bloque 1: 10:30 - 12:00 (Ubicaciones: Dr. Esquerdo, El Censal).
  - Bloque 2: 12:00 - 13:30 (Ubicaciones: Dr. Esquerdo, El Censal).

### B. Algoritmo de Asignación (Reglas Críticas)
1. **Regla del Dúo**: Cada turno DEBE tener exactamente 2 voluntarios asignados. El coordinador puede añadir un 3º manualmente.
2. **Prioridad de Familia**: El sistema debe priorizar emparejar a voluntarios con el **mismo apellido** en el mismo slot (ej. matrimonios o familiares).
3. **Descanso Obligatorio**: Un voluntario no puede ser asignado a dos franjas el mismo día (ej. mañana y tarde el mismo martes).
4. **Validación de Disponibilidad**: Solo asignar según el estado 'ambos', 'manana' o 'tarde' enviado por el usuario en su MonthlyAvailability.

### C. Flujo de Incidencias (Cobertura Urgente)
- Cuando un usuario marca "No puedo asistir" en un turno confirmado:
  1. El turno cambia a estado `en_sustitucion`.
  2. Se dispara una notificación `urgente_cobertura` a TODOS los voluntarios activos (excepto el que canceló).
  3. El primer voluntario en aceptar desde la notificación se queda el turno automáticamente (`reasignado`).
  4. Se notifican los cambios al coordinador y al voluntario saliente.

## 4. Seguridad y Control de Acceso
- **Acceso Coordinador**: Protegido por contraseña estática: `1914`.
- **Roles**: 
  - `usuario`: Acceso a sus tareas, disponibilidad y perfil.
  - `coordinador`: Acceso a CRUD de usuarios, generación de planificación, estadísticas globales y envío de comunicados masivos.

## 5. Especificaciones de UI/UX (Design System)
- **Tipografía**: `Plus Jakarta Sans` (400, 600, 800 para títulos).
- **Paleta de Colores**:
  - `Slate-950`: Fondos oscuros/profundos.
  - `Blue-600`: Color de acción principal.
  - `Red-500/600`: Alertas de cobertura urgente e incidencias.
  - `Green-500`: Confirmaciones y estados positivos.
- **Componentes Clave**:
  - **Bento Cards**: Bordes `rounded-3xl`, sombras suaves `shadow-sm`, bordes `slate-100`.
  - **Feedback Visual**: Estados de carga con `animate-pulse`, transiciones de entrada `animate-in fade-in slide-in-from-bottom`.
  - **PDF Export**: Generación de cuadrantes limpios usando `jsPDF` y `autoTable` con colores corporativos (Azul/Naranja).

## 6. Servicios de IA Detallados
### Gemini Service (`geminiService.ts`)
- **Smart Planning**: Recibe lista de usuarios y disponibilidades. Debe devolver un JSON puro mapeado al tipo `Shift`.
- **Image Editor**: Recibe base64 y prompt. Retorna imagen editada (ej. "Ponme un filtro de sol").
- **Maps Grounding**: Utiliza geolocalización real para filtrar resultados cercanos en Villajoyosa.

## 7. Instrucciones para Desarrollo Futuro
Cualquier nueva funcionalidad debe respetar los tipos definidos en `types.ts`. No se debe modificar la lógica de la API Key, la cual se obtiene exclusivamente de `process.env.API_KEY`. El diseño debe permanecer móvil-primero (Mobile-First) debido al uso intensivo de voluntarios en exteriores.
