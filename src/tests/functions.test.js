import handler from '../../api/functions.js';

function createResponse() {
  let statusCode = 200;
  let body = null;
  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      body = payload;
      return this;
    },
    get result() {
      return { statusCode, body };
    },
  };
}

describe('API serverless', () => {
  let originalApiKey;

  beforeEach(() => {
    originalApiKey = process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

  it('rechaza métodos distintos a POST', async () => {
    const res = createResponse();
    await handler({ method: 'GET' }, res);
    expect(res.result.statusCode).toBe(405);
    expect(res.result.body.error).toContain('Método no permitido');
  });

  it('requiere un arreglo de mensajes en el cuerpo', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const res = createResponse();
    await handler({ method: 'POST', body: { messages: 'invalid' } }, res);
    expect(res.result.statusCode).toBe(400);
  });

  it('rechaza llamadas cuando falta la API key en el entorno', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = createResponse();
    await handler({ method: 'POST', body: { messages: [] } }, res);
    expect(res.result.statusCode).toBe(500);
    expect(res.result.body.error).toContain('GEMINI_API_KEY');
  });

  it('parsea texto válido desde Gemini y responde con assistant', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: [{ type: 'text', text: 'Hola desde Gemini' }] }],
      }),
    })));

    const res = createResponse();
    await handler({ method: 'POST', body: { messages: [{ role: 'user', content: 'Hola' }] } }, res);
    expect(res.result.statusCode).toBe(200);
    expect(res.result.body.assistant).toBe('Hola desde Gemini');
  });
});
