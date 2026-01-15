# Reglas de Desarrollo para PPCO - La Barbera

Este documento establece las directrices técnicas y el uso de librerías para el desarrollo y mantenimiento del sistema PPCO - La Barbera.

## 1. Stack Tecnológico Principal

*   **Frontend**: React 19 con TypeScript 5 y Vite 6 para el entorno de desarrollo y build.
*   **Estilos**: Tailwind CSS 3 para todo el diseño y la maquetación, priorizando un enfoque Mobile-First y layouts tipo Bento Box.
*   **Componentes UI**: Se utilizarán los componentes preconstruidos de `shadcn/ui` para elementos comunes de interfaz.
*   **Iconografía**: La librería `lucide-react` es la fuente oficial para todos los iconos.
*   **Persistencia de Datos**: `LocalStorage` para la gestión de datos en el cliente, con una simulación de sincronización a MongoDB Atlas.
*   **PWA (Progressive Web App)**: Soporte completo para funcionalidad offline mediante `Service Worker` (`sw.js`) y `Manifest` (`manifest.json`).
*   **Generación de PDFs**: `jsPDF` y `jspdf-autotable` para la exportación de cuadrantes y reportes.
*   **Enrutamiento**: React Router para la gestión de rutas en la aplicación (aunque actualmente la navegación se maneja internamente en `App.tsx`).

## 2. Uso de Librerías y Modelos de IA

Para mantener la coherencia y optimizar el rendimiento, se establecen las siguientes reglas para el uso de librerías y modelos de IA:

*   **UI Components**:
    *   **`shadcn/ui`**: Utilizar siempre los componentes de `shadcn/ui` cuando estén disponibles. Si se necesita una modificación significativa, crear un nuevo componente en `src/components/` en lugar de editar los archivos de `shadcn/ui` directamente.
    *   **Tailwind CSS**: Todas las clases de estilo deben ser de Tailwind CSS. Evitar estilos inline o CSS personalizado a menos que sea estrictamente necesario y justificado.
    *   **`lucide-react`**: Usar esta librería para todos los iconos.

*   **Google Gemini SDK**:
    *   **`gemini-3-flash-preview`**: Para tareas de planificación rápida, respuestas generales y cualquier interacción que requiera baja latencia.
    *   **`gemini-3-pro-preview`**: Para análisis de estadísticas profundos, razonamiento complejo y tareas que demanden mayor capacidad de procesamiento.
    *   **`gemini-2.5-flash-image`**: Exclusivamente para la edición de imágenes (ej. avatares) mediante procesamiento de lenguaje natural.
    *   **`gemini-2.5-flash`**: Para la integración con Google Maps Grounding y búsquedas locales.

*   **Persistencia**:
    *   **`db.ts` (LocalStorage)**: Es el servicio principal para la gestión de datos en el cliente. Todas las operaciones CRUD deben pasar por este servicio.
    *   **Supabase**: Si se integra Supabase en el futuro, se utilizará para autenticación y persistencia en la nube, reemplazando o complementando `LocalStorage` según la funcionalidad.

*   **Generación de Documentos**:
    *   **`jspdf` y `jspdf-autotable`**: Estas librerías son obligatorias para la creación y exportación de documentos PDF, como los cuadrantes de turnos.

*   **Manejo de Rutas**:
    *   **React Router**: Si se requiere un sistema de enrutamiento más complejo, se implementará utilizando React Router, manteniendo las definiciones de rutas en `src/App.tsx` o en un archivo de configuración de rutas centralizado.

*   **Notificaciones**:
    *   **Service Worker (`sw.js`)**: Para la gestión de notificaciones push y la funcionalidad offline.

*   **Variables de Entorno**:
    *   Las API Keys y otras configuraciones sensibles deben cargarse exclusivamente a través de `process.env.API_KEY` o `import.meta.env.VITE_NOMBRE_VARIABLE` (para Vite).

---