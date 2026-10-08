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
import { colors, fonts, radius, alpha, cardStyle } from '../lib/theme'
import { getAvatar } from '../lib/avatars'
import {
  getScheduled,
  removeScheduled,
  updateScheduled,
  formatWhen,
  repeatLabels,
} from '../lib/scheduled'
import { Button } from './ui/button'
import { DateTimeField } from './ui/date-time-field'
import { ScreenHeader } from './screen-header'

export function ScheduledMessages() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')

  // Las pestañas quedan montadas, así que recargamos cada vez que la pantalla toma foco
  useFocusEffect(
    useCallback(() => {
      let active = true
      getScheduled().then((list) => {
        if (!active) return
        setItems(list)
        setReady(true)
      })
      return () => {
        active = false
      }
    }, []),
  )

  function startEdit(m) {
    setEditingId(m.id)
    setEditDate(m.date)
    setEditTime(m.time)
  }

  async function saveEdit(id) {
    await updateScheduled(id, { date: editDate, time: editTime })
    setItems(await getScheduled())
    setEditingId(null)
  }

  async function cancel(id) {
    await removeScheduled(id)
    setItems(await getScheduled())
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Mensajes programados"
        subtitle="Se reproducen solos en el parlante"
        backHref="/home"
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {ready && items.length === 0 && (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <CalendarClock size={32} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.emptyTitle}>No hay mensajes programados</Text>
              <Text style={styles.emptyText}>
                Programá un recordatorio o saludo para que suene automáticamente.
              </Text>
            </View>
            <Button
              label="Programar mensaje"
              icon={Plus}
              height={36}
              radius={radius['2xl']}
              fontSize={14}
              weight="medium"
              onPress={() => router.push('/mensaje')}
            />
          </View>
        )}

        {items.length > 0 && (
          <View style={{ gap: 12 }}>
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
