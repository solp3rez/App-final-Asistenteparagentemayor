import AsyncStorage from '@react-native-async-storage/async-storage'

// ScheduledMessage = {
//   id, recipientId, recipientName, recipientAvatar,
//   mode: 'text' | 'voice', message, date: 'YYYY-MM-DD', time: 'HH:MM', repeat
// }

const KEY = 'cerca:scheduled-messages'

export const repeatLabels = {
  once: 'Una vez',
  daily: 'Cada día',
  weekdays: 'Días de semana',
  weekly: 'Cada semana',
}

// Ojo: AsyncStorage es asíncrono (localStorage era síncrono), por eso todo es async.
export async function getScheduled() {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

async function save(list) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // ignorar errores de persistencia
  }
}

export async function addScheduled(msg) {
  const list = await getScheduled()
  await save([msg, ...list])
}

export async function updateScheduled(id, patch) {
  const list = (await getScheduled()).map((m) => (m.id === id ? { ...m, ...patch } : m))
  await save(list)
}

export async function removeScheduled(id) {
  const list = await getScheduled()
  await save(list.filter((m) => m.id !== id))
}

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

// Formateo manual en español (no dependemos de Intl, que varía según el dispositivo)
export function formatWhen(date, time) {
  if (!date) return time
  const [y, m, d] = date.split('-').map(Number)
  if (!y || !m || !d) return `${date} ${time}`
  const dt = new Date(y, m - 1, d)
  const formatted = `${WEEKDAYS[dt.getDay()]}, ${d} de ${MONTHS[m - 1]}`
  return time ? `${formatted} a las ${time}` : formatted
}

// Helpers para el selector de fecha/hora (guardamos strings, el picker usa Date)
const pad = (n) => String(n).padStart(2, '0')

export function toDateString(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function toTimeString(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function parseDateString(value) {
  const [y, m, d] = (value || '').split('-').map(Number)
  return y && m && d ? new Date(y, m - 1, d) : new Date()
}

export function parseTimeString(value) {
  const [h, min] = (value || '').split(':').map(Number)
  const now = new Date()
  if (Number.isNaN(h) || Number.isNaN(min) || value == null || value === '') return now
  now.setHours(h, min, 0, 0)
  return now
}
