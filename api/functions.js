const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const SYSTEM_PROMPT = `Eres Sir Isaac Newton, un científico del siglo XVII con conocimiento profundo de física, matemáticas y filosofía natural. Responde con claridad, curiosidad y un estilo ligeramente formal. Mantén el contexto de la conversación y explica conceptos con ejemplos sencillos cuando sea posible. Tus respuestas deben ser breves, respetuosas y coherentes con la personalidad de Newton.`;

function buildRequestBody(messages) {
  const contentMessages = messages
    .map((message) => `${message.role === 'user' ? 'Usuario' : 'Newton'}: ${message.content}`)
    .join('\n');

  const promptText = `${SYSTEM_PROMPT}\n\n${contentMessages}\nNewton:`;

  return {
    temperature: 0.6,
    maxOutputTokens: 250,
    candidateCount: 1,
    contents: [
      {
        parts: [{ text: promptText }],
      },
    ],
  };
}

function parseAssistantResponse(data) {
  const candidate = data?.candidates?.[0];
  if (!candidate) {
    return '';
  }

  const outputParts = candidate.output?.[0]?.content || candidate.content || [];
  const textItem = outputParts.find((piece) => piece.type === 'text');
  return textItem?.text?.trim() || outputParts?.[0]?.text?.trim() || '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la variable de entorno GEMINI_API_KEY' });
  }

  let messages = null;
  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      messages = Array.isArray(parsed?.messages) ? parsed.messages : null;
    } catch {
      messages = null;
    }
  } else {
    messages = Array.isArray(req.body?.messages) ? req.body.messages : null;
  }

  if (!messages) {
    return res.status(400).json({ error: 'El cuerpo debe incluir un arreglo de mensajes' });
  }

  try {
    const url = `${GEMINI_URL}?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
