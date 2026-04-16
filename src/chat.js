import { createMessage, scrollToBottom } from './utils.js';

const history = [];
let isLoading = false;
let currentError = '';

function buildChatView() {
  return `
    <section class="panel">
      <h1 class="page-title">Chat con Isaac Newton</h1>
      <p class="page-copy">Escribe un mensaje y conversa con Isaac Newton, un personaje histórico virtual que responde como el sabio de la física y la matemática.</p>
      <div class="chat-shell">
        <div class="status-bar">
          <span>Historia de conversación en esta sesión.</span>
          <span class="error">${currentError || ''}</span>
        </div>
        <div class="chat-window" id="chat-window"></div>
        <form id="chat-form" class="form-row">
          <textarea id="chat-input" rows="4" placeholder="Escribe tu mensaje..." required></textarea>
          <button type="submit">Enviar</button>
        </form>
      </div>
    </section>
  `;
}

function renderMessages(container) {
  if (!container) return;
  container.innerHTML = history
    .map((message) => {
      const roleClass = message.role === 'user' ? 'user' : 'assistant';
      return `
        <div class="message ${roleClass}">
          <div>
            <div class="role">${message.role === 'user' ? 'Tú' : 'Newton'}</div>
            <span>${message.content}</span>
          </div>
        </div>
      `;
    })
    .join('');
  scrollToBottom(container);
}

function setLoading(root, loading) {
  isLoading = loading;
  const button = root.querySelector('button[type="submit"]');
  if (!button) return;
  button.textContent = loading ? 'Pensando...' : 'Enviar';
  button.disabled = loading;
}

async function callApi(messageList) {
  const response = await fetch('/api/functions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: messageList }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Respuesta inválida del servidor');
  }

  const data = await response.json();
  if (!data.assistant) {
    throw new Error('La respuesta de Gemini no contiene texto asistente');
  }

  return data.assistant;
}

async function handleSubmit(event) {
  event.preventDefault();
  const root = document.getElementById('app');
  const input = root.querySelector('#chat-input');
  const windowEl = root.querySelector('#chat-window');
  if (!input || !windowEl) return;

  const text = input.value.trim();
  if (!text) return;

  currentError = '';
  const userMessage = createMessage('user', text);
  history.push(userMessage);
  renderMessages(windowEl);
  input.value = '';
  setLoading(root, true);

  try {
    const assistantText = await callApi(history);
    history.push(createMessage('assistant', assistantText));
  } catch (error) {
    currentError = error.message || 'Error inesperado';
  } finally {
    setLoading(root, false);
    renderMessages(windowEl);
  }
}

export function renderChat(root) {
  root.innerHTML = buildChatView();
  const form = root.querySelector('#chat-form');
  const windowEl = root.querySelector('#chat-window');

  if (history.length === 0) {
    history.push(createMessage('assistant', 'Buenos días. Soy Sir Isaac Newton. Hazme una pregunta sobre física, matemáticas o filosofía natural y contestaré con claridad y brevedad.'));
  }

  renderMessages(windowEl);
  form?.addEventListener('submit', handleSubmit);
}

export function renderHome(root) {
  root.innerHTML = `
    <section class="panel">
      <h1 class="page-title">Bienvenido a Newton AI</h1>
      <p class="page-copy">Esta SPA te permite conversar con Isaac Newton, un personaje histórico virtual con respuestas claras, breves y científicas.</p>
      <div class="card">
        <h2>¿Qué puedes hacer?</h2>
        <ul>
          <li>Usar navegación SPA con History API.</li>
          <li>Conservar historial de chat mientras la sesión esté activa.</li>
          <li>Enviar y recibir mensajes sin exponer la API key en el frontend.</li>
        </ul>
      </div>
    </section>
  `;
}

export function renderAbout(root) {
  root.innerHTML = `
    <section class="panel">
      <h1 class="page-title">About</h1>
      <div class="about-grid">
        <img class="character-image" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/GodfreyKneller-IsaacNewton-1689.jpg/500px-GodfreyKneller-IsaacNewton-1689.jpg" alt="Retrato de Isaac Newton" />
        <div>
          <p class="page-copy">Isaac Newton es el personaje histórico virtual de este chat. Responde como el sabio del siglo XVII, con énfasis en física, matemáticas y filosofía natural.</p>
          <div class="card">
            <h2>Detalles del proyecto</h2>
            <p>Esta aplicación está construida como una Single Page Application con enrutado cliente, manejo de errores y una proxy serverless en Vercel.</p>
            <h3>Funcionalidades principales</h3>
            <ul>
              <li>Routing con History API y manejo de eventos <code>popstate</code>.</li>
              <li>Chat con historial en memoria.</li>
              <li>Servidor serverless que protege la API key de Gemini.</li>
              <li>Diseño responsive mobile-first.</li>
            </ul>
            <p class="page-copy"><strong>Autor:</strong> José Nevid Rodriguez Ortega</p>
          </div>
        </div>
      </div>
    </section>
  `;
}
