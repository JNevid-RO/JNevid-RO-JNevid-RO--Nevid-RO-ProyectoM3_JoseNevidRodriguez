import { getRouteName, normalizeRoute, createMessage } from '../utils.js';

describe('utils', () => {
  it('normaliza rutas conocidas y envía /home para rutas desconocidas', () => {
    expect(normalizeRoute('/')).toBe('/home');
    expect(normalizeRoute('/chat')).toBe('/chat');
    expect(normalizeRoute('/no-existe')).toBe('/home');
  });

  it('devuelve el nombre correcto de ruta', () => {
    expect(getRouteName('/about')).toBe('/about');
  });

  it('crea mensajes con rol y contenido', () => {
    expect(createMessage('user', 'Hola')).toEqual({ role: 'user', content: 'Hola' });
  });
});
