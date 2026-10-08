import { useEffect, useRef, useState } from 'react'
import { enviar } from '../lib/mqtt-base'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Type, Mic, Play, CalendarClock, Check, Volume2 } from 'lucide-react-native'
import { colors, fonts, radius, alpha, shadowSm } from '../lib/theme'
import { getAvatar } from '../lib/avatars'
import { addScheduled, toDateString, toTimeString } from '../lib/scheduled'
import { Button } from './ui/button'
import { TextField } from './ui/text-field'
import { DateTimeField } from './ui/date-time-field'
import { IconBox } from './ui/icon-box'
import { ScreenHeader } from './screen-header'

const people = [
  { id: 'rosa', name: 'Rosa', relation: 'Mamá', avatar: 'rosa' },
  { id: 'carlos', name: 'Carlos', relation: 'Papá', avatar: 'carlos' },
]

const repeatOptions = [
  { id: 'once', label: 'Una vez' },
  { id: 'daily', label: 'Cada día' },
  { id: 'weekdays', label: 'Días de semana' },
  { id: 'weekly', label: 'Cada semana' },
]

const quickPhrases = [
  'Hola, ¿cómo estás hoy?',
  'Acordate de tomar la pastilla.',
  'Te llamo en un ratito.',
  'Te quiero mucho.',
]

export function MessageCompose() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [recipient, setRecipient] = useState('rosa')
  const [mode, setMode] = useState('text') // 'text' | 'voice'
  const [message, setMessage] = useState('')
  const [when, setWhen] = useState('now') // 'now' | 'schedule'
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [repeat, setRepeat] = useState('once')
  const [sent, setSent] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  // Al elegir "Programar" dejamos día y hora precargados (hoy, dentro de una hora),
  // porque el selector nativo siempre muestra un valor.
  function chooseWhen(next) {
    setWhen(next)
    if (next === 'schedule' && (!date || !time)) {
      const d = new Date(Date.now() + 60 * 60 * 1000)
      setDate(toDateString(d))
      setTime(toTimeString(d))
    }
  }

  const canSend =
    (mode === 'voice' || message.trim().length > 0) && (when === 'now' || (!!date && !!time))

  async function handleSubmit() {
    if (!canSend) return
    if (when === 'now' && mode === 'text') {
  if (!enviar('/prueba', message.trim())) {
    Alert.alert('No se pudo enviar', 'No hay conexión con el broker MQTT.')
    return
  }
}
    if (when === 'schedule') {
      const person = people.find((p) => p.id === recipient)
      await addScheduled({
        id: `${Date.now()}`,
        recipientId: recipient,
        recipientName: person?.name ?? '',
        recipientAvatar: person?.avatar ?? '',
        mode,
        message: mode === 'voice' ? 'Nota de voz' : message.trim(),
        date,
        time,
        repeat,
      })
    }
    setSent(true)
    timer.current = setTimeout(
      () => router.replace(when === 'schedule' ? '/programados' : '/home'),
      1600,
    )
  }

  if (sent) {
    const person = people.find((p) => p.id === recipient)
    return (
      <View style={styles.sent}>
        <IconBox size={80} radius={40} bg={colors.ok}>
          <Check size={40} color={colors.okForeground} />
        </IconBox>
        <View>
          <Text style={styles.sentTitle}>
            {when === 'now' ? '¡Mensaje enviado!' : '¡Mensaje programado!'}
          </Text>
          <Text style={styles.sentText}>
            {when === 'now'
              ? `Se está reproduciendo en el parlante de ${person?.name}.`
              : `Sonará en el parlante de ${person?.name} el ${date} a las ${time}.`}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Enviar mensaje" subtitle="Se reproduce en el parlante" backHref="/home" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={{ gap: 20 }}>
          {/* Destinatario */}
          <View>
            <Text style={styles.sectionTitle}>Para</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {people.map((p) => {
                const active = recipient === p.id
                return (
                  <Pressable
                    key={p.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setRecipient(p.id)}
                    style={[
                      styles.person,
                      active && {
                        borderColor: colors.primary,
                        backgroundColor: alpha(colors.primary, 0.1),
                      },
                    ]}
                  >
                    <Image source={getAvatar(p.avatar)} style={styles.avatar} />
                    <View>
                      <Text style={styles.personName}>{p.name}</Text>
                      <Text style={styles.personRelation}>{p.relation}</Text>
                    </View>
                  </Pressable>
                )
              })}
            </View>
          </View>

          {/* Tipo de mensaje */}
          <View>
            <Text style={styles.sectionTitle}>Tipo de mensaje</Text>
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { id: 'text', label: 'Texto', icon: Type },
                { id: 'voice', label: 'Voz', icon: Mic },
              ]}
            />

            {mode === 'text' ? (
              <View style={{ marginTop: 12, gap: 12 }}>
                <TextField
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  textAlignVertical="top"
                  placeholder="Escribí lo que querés que diga el parlante…"
                  style={{ minHeight: 92 }}
                />
                <View style={styles.chips}>
                  {quickPhrases.map((phrase) => (
                    <Pressable
                      key={phrase}
                      accessibilityRole="button"
                      onPress={() => setMessage(phrase)}
                      style={styles.phrase}
                    >
                      <Text style={styles.phraseText}>{phrase}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.voiceBox}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Grabar nota de voz"
                  onPress={() => setMessage('nota-de-voz')}
                  style={({ pressed }) => [styles.mic, pressed && { transform: [{ scale: 0.95 }] }]}
                >
                  <Mic size={28} color={colors.primaryForeground} />
                </Pressable>
                <Text style={styles.voiceText}>
                  {message === 'nota-de-voz' ? 'Nota de voz lista (0:08)' : 'Mantené para grabar tu voz'}
                </Text>
              </View>
            )}
          </View>

          {/* Cuándo */}
          <View>
            <Text style={styles.sectionTitle}>¿Cuándo reproducir?</Text>
            <Segmented
              value={when}
              onChange={chooseWhen}
              options={[
                { id: 'now', label: 'Ahora', icon: Play },
                { id: 'schedule', label: 'Programar', icon: CalendarClock },
              ]}
            />

            {when === 'schedule' && (
              <View style={{ marginTop: 12, gap: 16 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.smallLabel}>Día</Text>
                    <DateTimeField mode="date" value={date} onChange={setDate} accessibilityLabel="Día" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.smallLabel}>Hora</Text>
                    <DateTimeField mode="time" value={time} onChange={setTime} accessibilityLabel="Hora" />
                  </View>
                </View>
                <View>
                  <Text style={styles.smallLabel}>Repetir</Text>
                  <View style={styles.chips}>
                    {repeatOptions.map((opt) => {
                      const active = repeat === opt.id
                      return (
                        <Pressable
                          key={opt.id}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          onPress={() => setRepeat(opt.id)}
                          style={[
                            styles.phrase,
                            active && { backgroundColor: colors.primary, borderColor: colors.primary },
                          ]}
                        >
                          <Text
                            style={[
                              styles.phraseText,
                              { color: active ? colors.primaryForeground : colors.secondaryForeground },
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={{ marginTop: 24, gap: 12 }}>
          <View style={styles.hint}>
            <Volume2 size={20} color={colors.primary} />
            <Text style={styles.hintText}>Se reproducirá con voz clara y volumen alto.</Text>
          </View>
          <Button
            label={when === 'now' ? 'Reproducir ahora' : 'Programar mensaje'}
            onPress={handleSubmit}
            disabled={!canSend}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// Selector de dos opciones tipo "pestañas" (TabButton en la versión web)
function Segmented({ value, onChange, options }) {
  return (
    <View style={styles.segmented}>
      {options.map(({ id, label, icon: Icon }) => {
        const active = value === id
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(id)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Icon size={16} color={active ? colors.foreground : colors.mutedForeground} />
            <Text
              style={{
                fontFamily: fonts.bodySemibold,
                fontSize: 14,
                color: active ? colors.foreground : colors.mutedForeground,
              }}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  sent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 32,
    backgroundColor: colors.background,
  },
  sentTitle: {
    textAlign: 'center',
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.foreground,
  },
  sentText: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.mutedForeground,
  },
  sectionTitle: {
    marginBottom: 8,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.foreground,
  },
  smallLabel: {
    marginBottom: 6,
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    color: colors.foreground,
  },
  person: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    borderRadius: radius['2xl'],
    padding: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: radius.xl },
  personName: { fontFamily: fonts.displaySemibold, fontSize: 14, color: colors.foreground },
  personRelation: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedForeground },
  segmented: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.secondary,
    borderRadius: radius['2xl'],
    padding: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.xl,
    paddingVertical: 10,
  },
  segmentActive: { backgroundColor: colors.background, ...shadowSm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  phrase: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  phraseText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.secondaryForeground },
  voiceBox: {
    marginTop: 12,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    borderRadius: radius['2xl'],
    padding: 24,
  },
  mic: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceText: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedForeground },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: alpha(colors.primary, 0.1),
    borderRadius: radius['2xl'],
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  hintText: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.primary },
})
