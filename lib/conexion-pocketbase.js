import { cerrarSesion, ErrorSesion, exigirSesion, guardarSesion, obtenerSesion } from './sesion'

// Si cambiás de red o pasás al servidor del colegio, cambiá esta dirección.
export const POCKETBASE_URL = 'http://192.168.1.100:8090'

async function solicitar(ruta, { method = 'GET', body, token } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(`${POCKETBASE_URL}${ruta}`, {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const data = response.status === 204 ? null : await response.json()
    if (!response.ok) {
      if (response.status === 401 && token) {
        const actual = await obtenerSesion()
        if (actual?.token === token) await cerrarSesion()
        throw new ErrorSesion()
      }
      const error = new Error(data?.message || `PocketBase respondió ${response.status}.`)
      error.status = response.status
      throw error
    }
    return data
  } catch (error) {
    if (error.name === 'AbortError' || error instanceof TypeError) {
      throw new Error('No se pudo conectar con PocketBase. Revisá que esté encendido y en la misma red.')
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export async function iniciarSesion(email, password) {
  // Un intento con otra cuenta no debe conservar la sesión de la anterior.
  await cerrarSesion()
  const data = await solicitar('/api/collections/usuarios/auth-with-password', {
    method: 'POST',
    body: { identity: email.trim().toLowerCase(), password },
  })
  await guardarSesion(data)
  return data.record
}

export async function verificarSesion() {
  const sesion = await exigirSesion()
  const data = await solicitar('/api/collections/usuarios/auth-refresh', {
    method: 'POST', token: sesion.token,
  })
  const actual = await obtenerSesion()
  if (actual?.token !== sesion.token) throw new ErrorSesion()
  await guardarSesion(data)
  return data.record
}

export async function pbRequest(collection, options = {}) {
  const method = options.method || 'GET'
  let sesion = null
  if (collection === 'usuarios' && method === 'POST' && !options.recordId) {
    // El formulario actual crea la cuenta, pero no autentica por sí solo.
    // Al finalizar irá al inicio, que pedirá iniciar sesión con esa cuenta.
    await cerrarSesion()
  } else if (options.auth !== false) {
    sesion = await obtenerSesion()
  }
  const query = Object.entries(options.query || {})
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
  const record = options.recordId ? `/${encodeURIComponent(options.recordId)}` : ''
  return solicitar(`/api/collections/${encodeURIComponent(collection)}/records${record}${query ? `?${query}` : ''}`, {
    method, body: options.body, token: sesion?.token,
  })
}
