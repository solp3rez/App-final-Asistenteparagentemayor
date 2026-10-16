import { pbRequest } from './conexion-pocketbase'
import { ErrorSesion, exigirSesion } from './sesion'

export function formatearFechaMensaje(value) {
  const normalized = typeof value === 'string' ? value.trim().replace(' ', 'T') : value
  const date = new Date(normalized)
  if (!value || Number.isNaN(date.getTime())) return 'Fecha no disponible'
  const pad = number => String(number).padStart(2, '0')
  // La fecha de PocketBase se muestra en la hora local del celular.
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function describirEstadoMensaje(value) {
  if (value === 'pendiente') return 'Pendiente de envío'
  return value ? `Estado informado: ${String(value)}` : 'Estado no disponible'
}

export async function obtenerHistorialMensajes({ pagina = 1, tamano = 20 } = {}) {
  if (!Number.isInteger(pagina) || pagina < 1 || !Number.isInteger(tamano) || tamano < 1 || tamano > 50) {
    throw new Error('La página solicitada no es válida.')
  }
  const sesion = await exigirSesion()
  const result = await pbRequest('mensajes', {
    query: {
      filter: `familiar = ${JSON.stringify(sesion.usuarioId)}`,
      sort: '-created,-id',
      expand: 'persona_mayor',
      page: pagina,
      perPage: tamano,
    },
  })
  const actual = await exigirSesion()
  if (actual.usuarioId !== sesion.usuarioId) throw new ErrorSesion()
  if (!result || !Array.isArray(result.items) ||
      !Number.isInteger(result.page) || result.page < 1 ||
      !Number.isInteger(result.totalItems) || result.totalItems < 0 ||
      !Number.isInteger(result.totalPages) || result.totalPages < 0) {
    throw new Error('No se pudo interpretar el historial de PocketBase.')
  }
  if (result.items.some(record => record.familiar !== sesion.usuarioId)) {
    throw new Error('La consulta devolvió mensajes de otra cuenta. Revisá los permisos antes de continuar.')
  }
  return {
    usuarioId: sesion.usuarioId,
    page: result.page,
    totalItems: result.totalItems,
    totalPages: result.totalPages,
    items: result.items.map(record => ({
      id: record.id,
      texto: typeof record.texto === 'string' && record.texto ? record.texto : 'Mensaje sin texto (registro incompleto)',
      destinatario: record.expand?.persona_mayor?.name || 'Persona desvinculada o no disponible',
      estado: record.estado,
      created: record.created,
    })),
  }
}
