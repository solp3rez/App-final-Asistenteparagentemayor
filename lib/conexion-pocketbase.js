import { cerrarSesion, ErrorSesion, exigirSesion, guardarSesion, obtenerSesion } from './sesion'

// Si cambiás de red o pasás al servidor del colegio, cambiá esta dirección.
// Casa (Windows, Wi-Fi): http://192.168.0.68:8090
// Colegio (Linux): poné la IP que muestra ./iniciar.sh
export const POCKETBASE_URL = 'http://10.56.31.45:8090'

// Valida el formato; el enlace enviado por PocketBase comprueba el acceso al correo.
export function esCorreoValido(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export async function solicitarVerificacion(email) {
  if (!esCorreoValido(email)) throw new Error('Ingresá un correo electrónico válido.')
  return solicitar('/api/collections/usuarios/request-verification', {
    method: 'POST', body: { email: email.trim().toLowerCase() },
  })
}

// Pide el correo de recuperación. PocketBase responde 204 exista o no la cuenta,
// así que la app no puede (ni debe) revelar si un correo está registrado.
export async function solicitarRecuperacion(email) {
  if (!esCorreoValido(email)) throw new Error('Ingresá un correo electrónico válido.')
  return solicitar('/api/collections/usuarios/request-password-reset', {
    method: 'POST', body: { email: email.trim().toLowerCase() },
  })
}

// Cambia la contraseña con el código (token) que llegó en el correo.
export async function confirmarRecuperacion(token, password, passwordConfirm) {
  const limpio = String(token || '').trim()
  if (!limpio) throw new Error('Pegá el código que recibiste por correo.')
  if (!password || password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.')
  if (password !== passwordConfirm) throw new Error('Las contraseñas no coinciden.')
  // Una sesión vieja no debe sobrevivir a un cambio de contraseña.
  await cerrarSesion()
  return solicitar('/api/collections/usuarios/confirm-password-reset', {
    method: 'POST', body: { token: limpio, password, passwordConfirm },
  })
}

function exigirCorreoVerificado(data) {
  if (data?.record?.collectionName !== 'usuarios' || data.record.verified !== true) {
    const error = new Error('Verificá tu correo con el enlace recibido antes de iniciar sesión.')
    error.code = 'CORREO_NO_VERIFICADO'
    throw error
  }
}

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
      error.details = data?.data || {}
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
  if (!esCorreoValido(email)) throw new Error('Ingresá un correo electrónico válido.')
  if (!password) throw new Error('Ingresá tu contraseña.')
  // Un intento con otra cuenta no debe conservar la sesión de la anterior.
  await cerrarSesion()
  const data = await solicitar('/api/collections/usuarios/auth-with-password', {
    method: 'POST',
    body: { identity: email.trim().toLowerCase(), password },
  })
  exigirCorreoVerificado(data)
  await guardarSesion(data)
  return data.record
}

export async function verificarSesion() {
  const sesion = await exigirSesion()
  let data
  try {
    data = await solicitar('/api/collections/usuarios/auth-refresh', {
      method: 'POST', token: sesion.token,
    })
  } catch (error) {
    if (error instanceof ErrorSesion || [401, 403, 404].includes(error.status)) {
      const actual = await obtenerSesion()
      if (actual?.token === sesion.token) await cerrarSesion()
      throw new ErrorSesion()
    }
    // Un problema de red no debe borrar una sesión todavía válida.
    throw error
  }
  const actual = await obtenerSesion()
  if (actual?.token !== sesion.token) throw new ErrorSesion()
  if (data?.record?.verified !== true) {
    await cerrarSesion()
    throw new ErrorSesion()
  }
  exigirCorreoVerificado(data)
  await guardarSesion(data)
  return data.record
}

// Rutas propias del servidor (carpeta pb_hooks de DDS-sol), por ejemplo /api/cerca/parlante/...
// Siempre llevan la sesión: el servidor decide quién es el familiar por el token.
export async function pbRuta(ruta, { method = 'POST', body } = {}) {
  const sesion = await exigirSesion()
  return solicitar(ruta, { method, body, token: sesion.token })
}

export async function pbRequest(collection, options = {}) {
  const method = options.method || 'GET'
  let sesion = null
  if (collection === 'usuarios' && method === 'POST' && !options.recordId) {
    // El formulario actual crea la cuenta, pero no autentica por sí solo.
    // El formulario solicitará la verificación y después ofrecerá iniciar sesión.
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
