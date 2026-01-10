
# 🛒 Carrito - Gestión de Voluntarios PPOC

**Carrito** es una aplicación web moderna y profesional diseñada para organizar turnos mensuales y semanales.

## 🚀 Despliegue en Firebase Hosting

Para subir esta aplicación a producción en Firebase, sigue estos pasos:

1. **Instala las herramientas de Firebase** (si no lo has hecho):
   ```bash
   npm install -g firebase-tools
   ```

2. **Inicia sesión**:
   ```bash
   firebase login
   ```

3. **Construye la aplicación**:
   Vite generará los archivos optimizados en la carpeta `/dist`.
   ```bash
   npm run build
   ```

4. **Despliega**:
   ```bash
   firebase deploy
   ```

## 🛠️ Configuración de Seguridad (Firebase Console)

Recuerda configurar las **Reglas de la Realtime Database** en tu consola de Firebase para permitir la lectura/escritura:

```json
{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}
```
*Nota: Para un entorno de producción real, se recomienda restringir estas reglas mediante Firebase Auth.*

## 📱 Instalación en Móvil (PWA)

Una vez desplegada en Firebase (ej. `https://tu-proyecto.web.app`), abre la URL en tu móvil y selecciona "Añadir a pantalla de inicio".
