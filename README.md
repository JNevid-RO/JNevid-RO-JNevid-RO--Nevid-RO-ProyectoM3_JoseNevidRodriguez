# Proyecto Integrador 3 - Chat SPA con Gemini AI

## Descripción

Esta aplicación es una Single Page Application responsive que permite conversar con el personaje histórico **Isaac Newton**. La SPA usa routing cliente con History API, mantiene el historial de conversación en la sesión y se integra con Google Gemini AI mediante una función serverless en Vercel.

## Características principales

- Navegación SPA entre `/home`, `/chat` y `/about`
- Enrutado sin recarga de página usando `history.pushState` y manejo de `popstate`
- Chat con historial en memoria durante la sesión
- Proxy serverless para proteger la API key de Gemini
- Uso del endpoint correcto de Google Generative Language
- Modelo `gemini-2.5-flash` compatible con la API key disponible
- Diseño mobile-first con media queries para móvil, tablet y desktop
- Personaje: Isaac Newton con personalidad histórica
- Tests unitarios con Vitest

## Estructura del proyecto

```text
project-root/
├── api/
│   └── functions.js
├── src/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── chat.js
│   ├── utils.js
│   └── tests/
│       ├── functions.test.js
│       ├── utils.test.js
│       └── hello.test.js
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── vitest.config.js
├── README.md
└── vercel.json
```

## Tecnologías usadas

- HTML, CSS y JavaScript vanilla
- Vite para desarrollo local y build
- Vitest para pruebas unitarias
- Vercel Serverless Functions para la integración segura con Gemini

## Configuración local

1. Instala dependencias:

```bash
npm install
```

2. Crea un archivo `.env` en la raíz del proyecto con la variable:

```env
GEMINI_API_KEY=tu_api_key_aquí
```

> Nunca subas el archivo `.env` al repositorio.

3. Levanta el servidor de desarrollo:

```bash
npm run dev
```

4. Abre el navegador en la URL que indique Vite.

## Ejecutar tests

```bash
npm test
```

## Despliegue en Vercel

1. Crea un repositorio en GitHub y sube todo el proyecto al nuevo repositorio.
2. En Vercel, inicia sesión y elige la opción de importar un proyecto desde GitHub.
3. Selecciona el repositorio donde subiste el proyecto.
4. En la configuración de despliegue de Vercel, agrega la variable de entorno:

- `GEMINI_API_KEY`

5. Confirma el despliegue y espera a que Vercel complete el build.
6. Verifica que la URL pública funcione y que la ruta de la función serverless en `/api/functions` responda correctamente.

> Si haces cambios locales, haz commit y push a GitHub; Vercel redeplegará automáticamente.

## Uso de la función serverless

La ruta del backend es `/api/functions`. El frontend envía el historial completo de conversación con roles y el servidor agrega un `system prompt` seguro antes de llamar a Gemini.

## System prompt

El `system prompt` define a Isaac Newton como un personaje histórico con tono preciso, respetuoso y breve. Esto ayuda a que las respuestas mantengan coherencia con su estilo científico y filosófico.

## Notas sobre IA y prompts

- Se utilizó IA como soporte para estructurar la aplicación y definir un buen prompt para el personaje.
- El prompt se diseñó para que Isaac Newton responda con claridad histórica, precisión y brevedad.
- La decisión de usar una función serverless responde al requisito de no exponer la API key en el frontend.

## Buenas prácticas incluidas

- Separación entre lógica de routing y lógica de chat
- Manejo de errores de API y estados de carga
- SPA con history navigation y `popstate`
- Variables de entorno para proteger credenciales
- Documentación para ejecutar el proyecto localmente
