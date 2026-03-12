# 🍳 Chef-Web v2.0

**Chef-Web** es una aplicación web interactiva y *aesthetic* diseñada para transformar los ingredientes olvidados en tu nevera en recetas gourmet paso a paso. Utiliza la potencia de la inteligencia artificial de Google a través de `gemini-cli`.

---


## 🎥 Video 


https://github.com/user-attachments/assets/01e865b4-7da8-44f3-a0be-b1dece7b0bc0



---

## ✨ Características Principales

- **Diseño Aesthetic**: Interfaz inspirada en máquinas de escribir antiguas y cuadernos de notas vintage. Utiliza tipografías como *Special Elite* y *Courier Prime*.
- **Generación Inteligente**: Conexión directa con Gemini AI para crear recetas creativas basadas estrictamente en tus ingredientes y tiempo disponible.
- **Historial Persistente**: Panel lateral que guarda automáticamente tus últimas 10 recetas generadas para que nunca pierdas una buena idea.
- **Exportación Versátil**: 
  - 📥 **Descargar .txt**: Guarda la receta en formato Markdown puro.
  - 📄 **Guardar PDF / Imprimir**: Vista optimizada para impresión que conserva el estilo visual del chef.
- **Arquitectura Robusta**: Servidor Node.js con Express y gestión de errores mejorada para Windows.

---

## 🛠️ Requisitos Técnicos

1. **Node.js**: Instalado en el sistema.
2. **Gemini CLI**: El paquete `@google/gemini-cli` debe estar disponible (se ejecuta vía `npx`).
3. **Autenticación**: Debes haber iniciado sesión previamente en la terminal con:
   ```bash
   npx @google/gemini-cli auth login
   ```

---

## 🚀 Instalación y Uso

1. **Navegar a la carpeta**:
   ```powershell
   cd C:\Users\tu-usuario\chef-web
   ```

2. **Instalar dependencias** (si es la primera vez):
   ```bash
   npm install
   ```

3. **Iniciar el servidor**:
   ```bash
   node server.js
   ```

4. **Acceder a la aplicación**:
   Abre tu navegador en: [http://localhost:3001](http://localhost:3001)

---

## 📂 Estructura del Proyecto

- `server.js`: El motor de la aplicación. Gestiona las peticiones API, llama a Gemini y administra el historial.
- `public/`: Contiene la interfaz de usuario.
  - `index.html`: Estructura de la página y sidebar.
  - `style.css`: Estilos visuales, animaciones y reglas de impresión.
  - `script.js`: Lógica del cliente, llamadas fetch y gestión del DOM.
- `history.json`: Base de datos local en formato JSON para el historial.

---

## 🧠 ¿Cómo funciona?

1. El usuario ingresa ingredientes y tiempo en la web.
2. El frontend envía un JSON al servidor Node.js.
3. El servidor construye un *prompt* experto y ejecuta `npx @google/gemini-cli` de forma asíncrona.
4. La respuesta se guarda en `history.json` y se envía de vuelta al navegador.
5. El navegador renderiza el Markdown usando la librería `marked.js` y aplica el estilo visual.

---

## 🧠 ¿Que enseña este proyecto?

💡 Cómo hablar con un Robot (IA)
En lugar de escribir las recetas tú mismo, el proyecto enseña cómo pedirle a una Inteligencia Artificial (Gemini) que lo haga por ti. Es como tener un chef profesional atrapado en una caja que obedece tus órdenes según los ingredientes que tengas en tu nevera.

💡 Cómo guardar tus recuerdos (Historial)
¿Viste que la página tiene un panel a la izquierda? Eso enseña cómo hacer que un ordenador "recuerde" lo que hiciste antes. Aunque apagues el ordenador, las últimas recetas se quedan guardadas en un archivo llamado history.json, que funciona como el diario del chef.

💡 El arte de la "Elegancia" (Diseño Aesthetic)
Aprenderás que las páginas web no tienen por qué ser aburridas o blancas. Este proyecto usa un estilo de "máquina de escribir antigua". Enseña cómo cambiar las letras, poner fondos que parecen papel real y hasta añadir un sello de "Aprobado" que aparece de golpe cuando la receta está lista.
