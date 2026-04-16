const GEMINI_MODEL_ORDER = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-latest',
  'gemini-2.5-pro-latest',
];
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1/models';
const SYSTEM_PROMPT = `Eres Sir Isaac Newton, un científico del siglo XVII con conocimiento profundo de física, matemáticas y filosofía natural. Responde con claridad, curiosidad y un estilo ligeramente formal. Mantén el contexto de la conversación y explica conceptos con ejemplos sencillos cuando sea posible. Tus respuestas deben ser breves, respetuosas y coherentes con la personalidad de Newton.`;

function buildRequestBody(messages) {
  const contentMessages = messages
    .map((message) => `${message.role === 'user' ? 'Usuario' : 'Newton'}: ${message.content}`)
    .join('\n');

  const promptText = `${SYSTEM_PROMPT}\n\n${contentMessages}\nNewton:`;

  return {
    contents: [
      {
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 250,
      candidateCount: 1,
    },
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

async function fetchModelList(apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
  const response = await fetch(url, { method: 'GET' });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Respuesta no válida de ListModels: ${text}`);
  }

  if (!response.ok) {
    const message = data.error?.message || 'Error listando modelos';
    throw new Error(message);
  }

  return data;
}

function selectModel(availableModels) {
  const availableNames = availableModels
    .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
    .map((model) => model.name.replace(/^models\//, ''));

  for (const preferred of GEMINI_MODEL_ORDER) {
    if (availableNames.includes(preferred)) {
      return preferred;
    }
  }

  return availableNames[0] || null;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Falta la variable de entorno GEMINI_API_KEY' });
    }

    try {
      const data = await fetchModelList(apiKey);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Error al listar modelos' });
    }
  }

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
    const body = JSON.stringify(buildRequestBody(messages));
    const available = await fetchModelList(apiKey);
    const selectedModel = selectModel(available.models || []);

    if (!selectedModel) {
      return res.status(500).json({ error: 'No se encontró un modelo compatible con generateContent' });
    }

    const url = `${GEMINI_BASE_URL}/${selectedModel}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: 'Respuesta no válida de Gemini', details: text });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Error en la API de Gemini',
        details: data.error?.details || data,
        model: selectedModel,
      });
    }

    const assistant = parseAssistantResponse(data);
    return res.status(200).json({ assistant, model: selectedModel });

    return res.status(503).json({
      error: 'Todos los modelos están saturados en este momento. Intenta de nuevo más tarde.',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error interno al procesar la petición' });
  }
}
