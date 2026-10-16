import * as SecureStore from 'expo-secure-store'

const CLAVE = 'cerca.sesion.v1'

export class ErrorSesion extends Error {
  constructor() {
    super('Volvé a iniciar sesión para continuar.')
    this.name = 'ErrorSesion'
  }
}

// Guardamos un token de acceso y el ID del familiar, nunca su contraseña.
export async function guardarSesion(data) {
  if (!data?.token || !data?.record?.id || data.record.collectionName !== 'usuarios') {
    throw new Error('PocketBase no devolvió una sesión válida de usuarios.')
  }
  await SecureStore.setItemAsync(CLAVE, JSON.stringify({
    token: data.token,
    usuarioId: data.record.id,
  }))
}

export async function obtenerSesion() {
  const texto = await SecureStore.getItemAsync(CLAVE)
  if (!texto) return null
  try {
    const sesion = JSON.parse(texto)
    if (typeof sesion.token === 'string' && sesion.token &&
        typeof sesion.usuarioId === 'string' && /^[a-zA-Z0-9]+$/.test(sesion.usuarioId)) {
      return sesion
    }
  } catch (_) {
    // Una sesión dañada no debe convertirse en acceso a otra cuenta.
  }
  await cerrarSesion()
  return null
}

export async function exigirSesion() {
  const sesion = await obtenerSesion()
  if (!sesion) throw new ErrorSesion()
  return sesion
}

export async function cerrarSesion() {
  await SecureStore.deleteItemAsync(CLAVE)
}
