import { pbRequest } from './conexion-pocketbase'
import { getLinkedPerson } from './persona'
import { ErrorSesion, exigirSesion } from './sesion'

const COLLECTION = 'mensajes_programados'

// Hora local del celular. No acepta fechas inexistentes ni pasadas.
export function fechaProgramadaValida(date, time, ahora = Date.now()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(time || '')) return false
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  const valor = new Date(y, m - 1, d, h, min, 0, 0)
  return valor.getFullYear() === y && valor.getMonth() === m - 1 && valor.getDate() === d &&
    valor.getHours() === h && valor.getMinutes() === min && valor.getTime() > ahora
}

function comprobar(record, expected) {
  if (!record || record.id !== expected.id || record.familiar !== expected.familiar ||
      record.persona_mayor !== expected.persona_mayor || record.message !== expected.message ||
      record.date !== expected.date || record.time !== expected.time || record.repeat !== 'once') {
    throw new Error('No se pudo confirmar el recordatorio. Revisá el historial antes de repetir.')
  }
  return record
}

async function buscarIntento(expected) {
  try {
    return comprobar(await pbRequest(COLLECTION, { recordId: expected.id }), expected)
  } catch (error) {
    if (error.status === 404) return null
    throw error
  }
}

export async function guardarProgramado({ id, texto, date, time, personaId }) {
  const sesion = await exigirSesion()
  const mensaje = String(texto || '').trim()
  if (!mensaje || mensaje.length > 200) throw new Error('Escribí un mensaje de hasta 200 caracteres.')
  if (!/^[a-z0-9]{15}$/.test(id || '')) throw new Error('El identificador no es válido.')
  if (!personaId) throw new Error('Primero vinculá una persona mayor.')
  if (!fechaProgramadaValida(date, time)) throw new Error('Elegí un día y una hora futuros.')
  const persona = await getLinkedPerson()
  if (!persona || persona.id !== personaId) throw new Error('La persona vinculada cambió. Volvé a abrir la pantalla.')
  const actual = await exigirSesion()
  if (actual.usuarioId !== sesion.usuarioId) throw new ErrorSesion()
  const expected = {
    id, familiar: sesion.usuarioId, persona_mayor: persona.id,
    recipientId: persona.id, recipientName: persona.name || '', recipientAvatar: persona.avatar || '',
    mode: 'text', message: mensaje, texto: mensaje, date, time, repeat: 'once', estado: 'pendiente',
  }
  const anterior = await buscarIntento(expected)
  if (anterior) return anterior
  try {
    return comprobar(await pbRequest(COLLECTION, { method: 'POST', body: expected }), expected)
  } catch (error) {
    if (error instanceof ErrorSesion) throw error
    try {
      const guardado = await buscarIntento(expected)
      if (guardado) return guardado
    } catch (recoveryError) {
      if (recoveryError instanceof ErrorSesion) throw recoveryError
    }
    throw error
  }
}

export async function consultarProgramados() {
  const sesion = await exigirSesion()
  const resultado = await pbRequest(COLLECTION, {
    query: { filter: `familiar = ${JSON.stringify(sesion.usuarioId)}`, sort: '-created,-id', perPage: 100 },
  })
  const actual = await exigirSesion()
  if (actual.usuarioId !== sesion.usuarioId) throw new ErrorSesion()
  if (!Array.isArray(resultado.items) || resultado.items.some(item => item.familiar !== sesion.usuarioId)) {
    throw new Error('La base devolvió recordatorios de otra cuenta. Revisá las reglas de acceso.')
  }
  return { items: resultado.items, mas: resultado.totalPages > 1 }
}
