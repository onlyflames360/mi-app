
# 🛒 Carrito - Gestión de Voluntarios PPOC

**Carrito** es una aplicación web moderna y profesional diseñada para organizar turnos mensuales y semanales de grandes grupos de voluntarios (aprox. 100 personas). Está optimizada para funcionar como una **PWA (Progressive Web App)**, lo que permite su instalación en dispositivos **iOS y Android** como si fuera una aplicación nativa.

## ✨ Características Principales

- 📅 **Planificación Inteligente**: Generación automática de turnos basada en la disponibilidad de los voluntarios.
- 🔔 **Sistema de Avisos Críticos**: Notificaciones instantáneas (Toasts) y centro de avisos para cubrir bajas urgentes.
- 👤 **Panel del Voluntario**: Confirmación de asistencia con un solo toque y gestión de perfil personal.
- 🛠️ **Panel del Coordinador**: Control total sobre la planilla, registro de nuevos voluntarios y estadísticas de cumplimiento.
- 📱 **Mobile First**: Diseño adaptado a "Safe Areas" de móviles modernos (Notch) y optimizado para toques.
- 🔒 **Acceso Seguro**: Código de coordinación para funciones administrativas.

## 🚀 Instalación Local

Para ejecutar este proyecto en tu ordenador, sigue estos pasos:

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/carrito-ppoc.git
   cd carrito-ppoc
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en `http://localhost:5173`.

## 🔑 Códigos de Acceso (Demo)

- **Código de Coordinador**: `1914`
- **Acceso Voluntario**: Busca cualquier nombre registrado en el sistema para entrar como voluntario.

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript**
- **Vite** (Build tool de última generación)
- **Tailwind CSS** (Diseño moderno y responsive)
- **Recharts** (Estadísticas visuales)
- **FontAwesome** (Iconografía)

## 📱 Instalación en Móvil (PWA)

1. Despliega la app en un servidor HTTPS (ej. Vercel).
2. Abre la URL en tu móvil.
3. **iOS**: Pulsa "Compartir" -> "Añadir a la pantalla de inicio".
4. **Android**: Pulsa los tres puntos -> "Instalar aplicación".

---
Desarrollado con ❤️ para la gestión de voluntarios.
