import { pbRequest } from './conexion-pocketbase'
import { getLinkedPerson } from './persona'
import { ErrorSesion, exigirSesion } from './sesion'

// Identificador para reintentos, no una contraseña ni un token de seguridad.
export function crearIdMensaje() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 15 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function comprobarMensaje(record, expected) {
  if (!record || record.id !== expected.id || record.familiar !== expected.familiar ||
      record.persona_mayor !== expected.persona_mayor || record.texto !== expected.texto) {
    throw new Error('No se pudo confirmar este mensaje. Revisemos el registro antes de repetir.')
  }
  return record
}

async function buscarIntento(expected) {
  try {
    const record = await pbRequest('mensajes', { recordId: expected.id })
    return comprobarMensaje(record, expected)
  } catch (error) {
    if (error.status === 404) return null
    throw error
  }
}

export async function guardarMensajeDirecto({ id, texto, personaId }) {
  const sesion = await exigirSesion()
  const limpio = String(texto || '').trim()
  if (!limpio) throw new Error('Escribí el mensaje antes de guardarlo.')
  if (limpio.length > 200) throw new Error('El mensaje puede tener hasta 200 caracteres.')
  if (!/^[a-z0-9]{15}$/.test(id || '')) throw new Error('El identificador del mensaje no es válido.')
  if (!personaId) throw new Error('Primero agregá una persona mayor a tu cuenta.')

  const data = { id, texto: limpio, familiar: sesion.usuarioId, persona_mayor: personaId, estado: 'pendiente' }
  // Si una petición anterior llegó a la base pero su respuesta se perdió,
  // recuperamos ese mismo mensaje en lugar de crear otro.
  const anterior = await buscarIntento(data)
  if (anterior) return anterior

  const persona = await getLinkedPerson()
  if (!persona || persona.id !== personaId) {
    throw new Error('Tu persona vinculada cambió. Volvé a Inicio y abrí esta pantalla nuevamente.')
  }
  const actual = await exigirSesion()
  if (actual.usuarioId !== sesion.usuarioId) throw new ErrorSesion()

  try {
    const record = await pbRequest('mensajes', { method: 'POST', body: data })
    return comprobarMensaje(record, data)
  } catch (error) {
    if (error instanceof ErrorSesion) throw error
    try {
      const guardado = await buscarIntento(data)
      if (guardado) return guardado
    } catch (recoveryError) {
      if (recoveryError instanceof ErrorSesion) throw recoveryError
    }
    throw error
  }
}
