import { useCallback, useState } from 'react'
import { Image, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import {
  CalendarClock,
  Mic,
  Type,
  Repeat,
  Trash2,
  Pencil,
  Check,
  X,
  Plus,
} from 'lucide-react-native'
import { colors, fonts, radius, alpha, cardStyle } from '../lib/tema'
import { getLinkedPerson } from '../lib/persona'
import { ErrorSesion, exigirSesion } from '../lib/sesion'
import { consultarProgramados } from '../lib/programados-pocketbase'
import { getAvatar } from '../lib/avatares'
import {
  getScheduled,
  removeScheduled,
  updateScheduled,
  formatWhen,
  repeatLabels,
} from '../lib/recordatorios'
import { Button } from './ui/boton'
import { DateTimeField } from './ui/campo-fecha-hora'
import { ScreenHeader } from './encabezado-pantalla'

export function ScheduledMessages() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [guardados, setGuardados] = useState([])
  const [mas, setMas] = useState(false)
  const [personaId, setPersonaId] = useState('')
  const [usuarioId, setUsuarioId] = useState('')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')

  useFocusEffect(useCallback(() => {
    let activo = true
    setReady(false)
    setItems([])
    setGuardados([])
    setError('')
    async function cargar() {
      try {
        const sesion = await exigirSesion()
        const persona = await getLinkedPerson()
        const locales = await getScheduled()
        const actual = await exigirSesion()
        if (actual.usuarioId !== sesion.usuarioId) throw new ErrorSesion()
        if (!activo) return
        setUsuarioId(sesion.usuarioId)
        setPersonaId(persona?.id || '')
        // Los recordatorios antiguos se conservan; se muestran solo los de la persona vinculada.
        setItems(Array.isArray(locales) && persona ? locales.filter(m => m.recipientId === persona.id) : [])
        const resultado = await consultarProgramados()
        if (!activo) return
        setGuardados(resultado.items)
        setMas(resultado.mas)
      } catch (e) {
        if (!activo) return
        if (e instanceof ErrorSesion) router.replace('/iniciar-sesion')
        else setError('No se pudo cargar el historial. Revisá la conexión y volvé a abrir esta pantalla.')
      } finally { if (activo) setReady(true) }
    }
    cargar()
    return () => { activo = false }
  }, [router]))

  async function comprobarCuenta() {
    const sesion = await exigirSesion()
    const persona = await getLinkedPerson()
    if (sesion.usuarioId !== usuarioId || !persona || persona.id !== personaId) throw new ErrorSesion()
    return persona
  }

  function startEdit(m) {
    setEditingId(m.id)
    setEditDate(m.date)
    setEditTime(m.time)
  }

  async function saveEdit(id) {
    try {
      await comprobarCuenta()
      await updateScheduled(id, { date: editDate, time: editTime })
      const list = await getScheduled()
      setItems(list.filter(m => m.recipientId === personaId))
      setEditingId(null)
    } catch (_) { setError('No se pudo editar. Volvé a abrir esta pantalla.') }
  }

  async function cancel(id) {
    try {
      await comprobarCuenta()
      await removeScheduled(id)
      const list = await getScheduled()
      setItems(list.filter(m => m.recipientId === personaId))
    } catch (_) { setError('No se pudo eliminar. Volvé a abrir esta pantalla.') }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Mensajes programados"
        subtitle="Guardados para tu persona vinculada"
        backHref="/inicio"
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Button
          label="Programar mensaje"
          icon={Plus}
          height={36}
          radius={radius['2xl']}
          fontSize={14}
          weight="medium"
          onPress={() => router.push('/programar-mensaje')}
        />
        <Text style={{ color: colors.mutedForeground, fontFamily: fonts.body, marginTop: 12, marginBottom: 12 }}>
          Todavía falta conectar el envío automático a la Raspberry.
        </Text>
        {!!error && <Text accessibilityRole="alert" style={{ color: '#B42318', marginBottom: 12 }}>{error}</Text>}
        {!ready && <Text style={{ color: colors.mutedForeground }}>Cargando...</Text>}
        {guardados.length > 0 && (
          <View style={{ gap: 12, marginBottom: 20 }}>
            <Text style={{ fontFamily: fonts.bodySemibold, color: colors.foreground }}>Guardados en PocketBase</Text>
            {guardados.map(m => (
              <View key={m.id} style={styles.card}>
                <Text style={styles.name}>{m.recipientName || 'Persona vinculada'}</Text>
                <Text style={styles.message}>{m.message || m.texto}</Text>
                <Text style={styles.message}>{formatWhen(m.date, m.time)} · Una vez</Text>
                <Text style={styles.message}>Guardado. Envío automático aún no conectado.</Text>
              </View>
            ))}
            {mas && <Text style={styles.message}>Se muestran los 100 registros más recientes.</Text>}
          </View>
        )}
        {ready && !error && items.length === 0 && guardados.length === 0 && (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <CalendarClock size={32} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.emptyTitle}>No hay mensajes programados</Text>
              <Text style={styles.emptyText}>
                Todavía no hay recordatorios guardados para esta cuenta.
              </Text>
            </View>
          </View>
        )}

        {items.length > 0 && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontFamily: fonts.bodySemibold, color: colors.foreground }}>Guardados solo en este celular</Text>
            <Text style={{ fontFamily: fonts.body, color: colors.mutedForeground }}>Estos recordatorios anteriores no se envían automáticamente.</Text>
            {items.map((m) => {
              const isEditing = editingId === m.id
              return (
                <View key={m.id} style={styles.card}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <Image source={getAvatar(m.recipientAvatar)} style={styles.avatar} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.name}>{m.recipientName}</Text>
                        <View style={styles.modeBadge}>
                          {m.mode === 'voice' ? (
                            <Mic size={12} color={colors.mutedForeground} />
                          ) : (
                            <Type size={12} color={colors.mutedForeground} />
                          )}
                          <Text style={styles.modeText}>{m.mode === 'voice' ? 'Voz' : 'Texto'}</Text>
                        </View>
                      </View>
                      <Text style={styles.message} numberOfLines={1}>
                        {m.message}
                      </Text>
                    </View>
                  </View>

                  {isEditing ? (
                    <View style={{ marginTop: 12, gap: 12 }}>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                          <DateTimeField
                            compact
                            mode="date"
                            value={editDate}
                            onChange={setEditDate}
                            accessibilityLabel="Nuevo día"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <DateTimeField
                            compact
                            mode="time"
                            value={editTime}
                            onChange={setEditTime}
                            accessibilityLabel="Nueva hora"
                          />
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Button
                          label="Guardar"
                          icon={Check}
                          height={32}
                          radius={radius.xl}
                          fontSize={13}
                          weight="medium"
                          onPress={() => saveEdit(m.id)}
                          style={{ flex: 1 }}
                        />
                        <Button
                          label="Cancelar"
                          icon={X}
                          variant="secondary"
                          height={32}
                          radius={radius.xl}
                          fontSize={13}
                          weight="medium"
                          onPress={() => setEditingId(null)}
                          style={{ flex: 1 }}
                        />
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.chips}>
                        <View style={[styles.chip, { backgroundColor: alpha(colors.primary, 0.1) }]}>
                          <CalendarClock size={14} color={colors.primary} />
                          <Text style={[styles.chipText, { color: colors.primary }]}>
                            {formatWhen(m.date, m.time)}
                          </Text>
                        </View>
                        <View style={[styles.chip, { backgroundColor: colors.secondary }]}>
                          <Repeat size={14} color={colors.mutedForeground} />
                          <Text style={[styles.chipText, { color: colors.mutedForeground }]}>
                            {repeatLabels[m.repeat] ?? 'Una vez'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.actions}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => startEdit(m)}
                          style={({ pressed }) => [
                            styles.action,
                            { backgroundColor: pressed ? colors.accent : colors.secondary },
                          ]}
                        >
                          <Pencil size={16} color={colors.secondaryForeground} />
                          <Text style={[styles.actionText, { color: colors.secondaryForeground }]}>
                            Editar
                          </Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => cancel(m.id)}
                          style={({ pressed }) => [
                            styles.action,
                            { backgroundColor: alpha(colors.warn, pressed ? 0.2 : 0.1) },
                          ]}
                        >
                          <Trash2 size={16} color={colors.warn} />
                          <Text style={[styles.actionText, { color: colors.warn }]}>Cancelar</Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: alpha(colors.secondary, 0.5),
    borderRadius: radius['3xl'],
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: alpha(colors.primary, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    textAlign: 'center',
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.foreground,
  },
  emptyText: {
    marginTop: 4,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedForeground,
  },
  card: { ...cardStyle, borderRadius: radius['2xl'], padding: 16 },
  avatar: { width: 44, height: 44, borderRadius: radius.xl },
  name: { fontFamily: fonts.displaySemibold, fontSize: 14, color: colors.foreground },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  modeText: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.mutedForeground },
  message: { marginTop: 2, fontFamily: fonts.body, fontSize: 14, color: colors.mutedForeground },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 12 },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.xl,
    paddingVertical: 8,
  },
  actionText: { fontFamily: fonts.bodyMedium, fontSize: 14 },
})
