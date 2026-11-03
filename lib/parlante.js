import { pbRequest, pbRuta } from './conexion-pocketbase'
import { ErrorSesion, exigirSesion } from './sesion'

const COLLECTION = 'parlantes'
const FORMATO = /^CERCA-[0-9]{3,6}$/

const NO_ENCONTRADO = 'No encontramos un parlante disponible con ese identificador. Revisá que esté bien escrito. Si otra cuenta ya lo vinculó, no se puede usar.'

// "cerca 001", "cerca001" y " CERCA-001 " terminan siendo "CERCA-001".
export function normalizarIdentificador(valor) {
  return String(valor || '').replace(/\s+/g, '').toUpperCase().replace(/^CERCA-?/, 'CERCA-')
}

export function validarIdentificador(identificador) {
  if (!identificador) return 'Escribí el identificador de tu parlante.'
  if (!FORMATO.test(identificador)) return 'El identificador tiene que verse así: CERCA-001.'
  return ''
}

// Tema MQTT donde el servidor envía las órdenes de ESTE equipo. La Raspberry escucha el mismo.
export function temaOrdenes(identificador) {
  return `cerca/${identificador}/ordenes`
}

async function comprobarSesion(sesion) {
  const actual = await exigirSesion()
  if (actual.usuarioId !== sesion.usuarioId) throw new ErrorSesion()
}

// Devuelve el parlante de esta cuenta, o null si todavía no vinculó ninguno.
export async function getLinkedSpeaker() {
  const sesion = await exigirSesion()
  const result = await pbRequest(COLLECTION, {
    query: { filter: `familiar = ${JSON.stringify(sesion.usuarioId)}`, perPage: 2 },
  })
  await comprobarSesion(sesion)
  if (result.items?.some(speaker => speaker.familiar !== sesion.usuarioId)) {
    throw new Error('La base devolvió un parlante de otra cuenta. Revisá las reglas de acceso.')
  }
  if ((result.totalItems ?? result.items?.length ?? 0) > 1) {
    throw new Error('Esta cuenta tiene más de un parlante asociado. Revisemos los registros antes de continuar.')
  }
  return result.items?.[0] ?? null
}

// Vincula el parlante con ese identificador a la cuenta que inició sesión.
export async function linkSpeaker(valor) {
  const sesion = await exigirSesion()
  const identificador = normalizarIdentificador(valor)
  const problema = validarIdentificador(identificador)
  if (problema) throw new Error(problema)
  if (await getLinkedSpeaker()) throw new Error('Esta cuenta ya tiene un parlante vinculado.')

  // PocketBase solo muestra un parlante libre si se lo pide por su identificador exacto.
  const result = await pbRequest(COLLECTION, {
    query: { identificador, filter: `identificador = ${JSON.stringify(identificador)}`, perPage: 1 },
  })
  const speaker = result.items?.[0]
  if (!speaker || speaker.identificador !== identificador || speaker.familiar) throw new Error(NO_ENCONTRADO)

  await comprobarSesion(sesion)
  let updated
  try {
    updated = await pbRequest(COLLECTION, {
      method: 'PATCH',
      recordId: speaker.id,
      body: { familiar: sesion.usuarioId },
    })
  } catch (error) {
    // Si otra cuenta lo vinculó justo antes, PocketBase ya no deja modificarlo.
    if ([400, 403, 404].includes(error.status)) throw new Error(NO_ENCONTRADO)
    throw error
  }
  if (!updated || updated.id !== speaker.id || updated.familiar !== sesion.usuarioId) {
    throw new Error('No se confirmó la vinculación con tu cuenta. Revisá el registro antes de repetir.')
  }
  return updated
}

// El código del correo son 6 números; aceptamos que lo peguen con espacios o guiones.
export function normalizarCodigo(valor) {
  return String(valor || '').replace(/\D/g, '')
}

export function validarCodigo(codigo) {
  return /^[0-9]{6}$/.test(codigo) ? '' : 'Escribí los 6 números del código.'
}

// Pide que el servidor mande un código al correo de la cuenta. Devuelve { correo } con el
// correo escondido a medias (a***@gmail.com), para mostrarlo en pantalla.
export async function pedirCodigoParlante() {
  const sesion = await exigirSesion()
  const respuesta = await pbRuta('/api/cerca/parlante/enviar-codigo', { method: 'POST', body: {} })
  await comprobarSesion(sesion)
  return respuesta
}

// Comprueba el código en el servidor. Si es correcto, el servidor activa el parlante.
export async function confirmarCodigoParlante(valor) {
  const sesion = await exigirSesion()
  const codigo = normalizarCodigo(valor)
  const problema = validarCodigo(codigo)
  if (problema) throw new Error(problema)
  const respuesta = await pbRuta('/api/cerca/parlante/confirmar-codigo', { method: 'POST', body: { codigo } })
  await comprobarSesion(sesion)
  if (respuesta?.activo !== true) throw new Error('No se pudo confirmar la activación. Probá de nuevo.')
  return respuesta
}

// Libera el parlante (familiar queda vacío). No borra la ficha del equipo.
export async function unlinkSpeaker(expectedId) {
  const sesion = await exigirSesion()
  const speaker = await getLinkedSpeaker()
  if (!speaker) return null
  if (expectedId && speaker.id !== expectedId) {
    throw new Error('El parlante vinculado cambió. Volvé a abrir esta pantalla antes de confirmar.')
  }
  await comprobarSesion(sesion)
  const updated = await pbRequest(COLLECTION, {
    method: 'PATCH',
    recordId: speaker.id,
    body: { familiar: '' },
  })
  if (!updated || updated.id !== speaker.id || updated.familiar) {
    throw new Error('No se pudo confirmar la desvinculación. Revisá la base antes de repetir.')
  }
  return updated
}
