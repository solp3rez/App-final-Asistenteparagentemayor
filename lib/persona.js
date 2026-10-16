import { pbRequest } from './conexion-pocketbase'
import { ErrorSesion, exigirSesion } from './sesion'

const COLLECTION = 'personas_mayores'

function normalizePerson(record) {
  if (!record) return null
  return {
    ...record,
    relation: record.relation ?? record.realiton ?? '',
    avatar: record.avatar ?? record.avartar ?? '',
  }
}

export async function getLinkedPerson() {
  const sesion = await exigirSesion()
  const result = await pbRequest(COLLECTION, {
    query: { filter: `familiar = ${JSON.stringify(sesion.usuarioId)}`, perPage: 2 },
  })
  if (result.items?.some(person => person.familiar !== sesion.usuarioId)) {
    throw new Error('La base devolvió una persona de otra cuenta. Revisá las reglas de acceso.')
  }
  if ((result.totalItems ?? result.items?.length ?? 0) > 1) {
    throw new Error('Esta cuenta tiene más de una persona asociada. Revisemos los registros antes de continuar.')
  }
  return normalizePerson(result.items?.[0] ?? null)
}

export async function saveLinkedPerson(person) {
  const sesion = await exigirSesion()
  const name = String(person.name || '').trim()
  if (!name) throw new Error('Escribí el nombre de la persona mayor.')
  if (await getLinkedPerson()) {
    throw new Error('Esta cuenta ya tiene una persona vinculada.')
  }
  const actual = await exigirSesion()
  if (actual.usuarioId !== sesion.usuarioId) throw new ErrorSesion()
  const record = await pbRequest(COLLECTION, {
    method: 'POST',
    body: {
      name,
      relation: person.relation ?? person.realiton ?? '',
      avatar: person.avatar ?? person.avartar ?? '',
      familiar: sesion.usuarioId,
    },
  })
  if (record.familiar !== sesion.usuarioId) {
    throw new Error('No se confirmó la asociación con tu cuenta. Revisá el registro antes de repetir.')
  }
  return normalizePerson(record)
}

// Vacía únicamente la relación familiar. No elimina la persona ni la cuenta.
// El ID confirmado evita desvincular otra persona si la pantalla quedó vieja.
export async function clearLinkedPerson(expectedPersonId) {
  const sesion = await exigirSesion()
  const person = await getLinkedPerson()
  if (!person) return null // Ya no hay una persona asociada a esta cuenta.
  if (expectedPersonId && person.id !== expectedPersonId) {
    throw new Error('La persona vinculada cambió. Volvé a abrir Ajustes antes de confirmar.')
  }
  const actual = await exigirSesion()
  if (actual.usuarioId !== sesion.usuarioId) throw new ErrorSesion()
  const updated = await pbRequest(COLLECTION, {
    method: 'PATCH',
    recordId: person.id,
    body: { familiar: '' },
  })
  if (!updated || updated.id !== person.id || updated.familiar) {
    throw new Error('No se pudo confirmar la desvinculación. Revisá la base antes de repetir.')
  }
  return normalizePerson(updated)
}
