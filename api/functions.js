const GEMINI_URL = 'https://gemini.googleapis.com/v1/models/gemini-1.5-mini/chat:generate';
const SYSTEM_PROMPT = `Eres Sir Isaac Newton, un científico del siglo XVII con conocimiento profundo de física, matemáticas y filosofía natural. Responde con claridad, curiosidad y un estilo ligeramente formal. Mantén el contexto de la conversación y explica conceptos con ejemplos sencillos cuando sea posible. Tus respuestas deben ser breves, respetuosas y coherentes con la personalidad de Newton.`;

function buildRequestBody(messages) {
  const contentMessages = messages.map((message) => ({
    role: message.role,
    content: [{ type: 'text', text: message.content }],
  }));

  return {
    messages: [
      { role: 'system', content: [{ type: 'text', text: SYSTEM_PROMPT }] },
      ...contentMessages,
    ],
    temperature: 0.6,
    maxOutputTokens: 250,
  };
}

function parseAssistantResponse(data) {
  const candidate = data?.candidates?.[0];
  if (!candidate) {
    return '';
  }

  const textItem = candidate.content?.find((piece) => piece.type === 'text');
  return textItem?.text?.trim() || candidate.content?.[0]?.text?.trim() || '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la variable de entorno GEMINI_API_KEY' });
  }

  const messages = Array.isArray(req.body?.messages) ? req.body.messages : null;
  if (!messages) {
    return res.status(400).json({ error: 'El cuerpo debe incluir un arreglo de mensajes' });
  }

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(buildRequestBody(messages)),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Error en la API de Gemini' });
    }

    const assistant = parseAssistantResponse(data);
    return res.status(200).json({ assistant });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error interno al procesar la petición' });
  }
}
