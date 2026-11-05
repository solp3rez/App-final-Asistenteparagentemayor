import { pbRequest } from './conexion-pocketbase'
import { ErrorSesion, exigirSesion } from './sesion'

// Consulta únicamente el historial de la cuenta que está abierta.
export async function consultarAlertas({ pagina = 1, cantidad = 20 } = {}) {
  const sesion = await exigirSesion()
  const resultado = await pbRequest('alertas', {
    query: {
      filter: `familiar = ${JSON.stringify(sesion.usuarioId)}`,
      sort: '-created,-id',
      expand: 'persona_mayor',
      page: pagina,
      perPage: cantidad,
    },
  })
  const actual = await exigirSesion()
  if (actual.usuarioId !== sesion.usuarioId) throw new ErrorSesion()
  if (!resultado || !Array.isArray(resultado.items)) {
    throw new Error('No se pudo leer el historial de alertas.')
  }
  if (resultado.items.some(item => item.familiar !== sesion.usuarioId)) {
    throw new Error('La consulta devolvió alertas de otra cuenta. Revisá los permisos.')
  }
  return {
    usuarioId: sesion.usuarioId,
    pagina: resultado.page,
    totalPaginas: resultado.totalPages,
    items: resultado.items.map(item => ({
      id: item.id,
      persona: item.expand?.persona_mayor?.name || '',
      mensaje: item.mensaje || 'Se registró un pedido de ayuda.',
      fecha: item.created,
    })),
  }
}

export function fechaAlerta(valor) {
  if (!valor) return 'Fecha no disponible'
  const fecha = new Date(String(valor).trim().replace(' ', 'T'))
  if (Number.isNaN(fecha.getTime())) return 'Fecha no disponible'
  const dos = n => String(n).padStart(2, '0')
  return `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`
}
