import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Speaker, Wifi, Check, UserPlus, PartyPopper } from 'lucide-react-native'
import { colors, fonts, radius, cardStyle, alpha } from '../lib/theme'
import { getAvatar } from '../lib/avatars'
import { IconBox } from './ui/icon-box'

// LinkedPerson = { name, relation, avatar (clave) }
const candidates = [
  { name: 'Rosa', relation: 'Mamá', avatar: 'rosa' },
  { name: 'Carlos', relation: 'Papá', avatar: 'carlos' },
]

export function LinkFlow({ onCancel, onComplete }) {
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState('speaker') // 'speaker' | 'connecting' | 'person' | 'done'
  const [selected, setSelected] = useState(null)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function connectSpeaker() {
    setStep('connecting')
    timer.current = setTimeout(() => setStep('person'), 1800)
  }

  const stepIndex = step === 'speaker' || step === 'connecting' ? 0 : step === 'person' ? 1 : 2

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        {step !== 'done' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={onCancel}
            style={styles.back}
          >
            <ArrowLeft size={20} color={colors.mutedForeground} />
          </Pressable>
        )}
        <Text style={styles.headerTitle}>Vincular</Text>
      </View>

      <View style={styles.progress}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: i <= stepIndex ? colors.primary : colors.muted }]}
          />
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {step === 'speaker' && (
          <View style={{ alignItems: 'center' }}>
            <IconBox size={80} radius={radius['3xl']} bg={colors.accent}>
              <Speaker size={40} color={colors.accentForeground} />
            </IconBox>
            <Text style={styles.h2Center}>Conectá tu parlante</Text>
            <Text style={styles.pCenter}>
              Asegurate de que el parlante esté enchufado y cerca del router. Detectamos uno
              disponible en tu red.
            </Text>

            <View style={[styles.speakerCard, { marginTop: 24 }]}>
              <IconBox size={44} radius={radius['2xl']} bg={colors.muted}>
                <Wifi size={20} color={colors.primary} />
              </IconBox>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Parlante Cerca</Text>
                <Text style={styles.cardText}>Listo para conectar</Text>
              </View>
              <View style={styles.okDot} />
            </View>

            <PrimaryButton label="Conectar parlante" onPress={connectSpeaker} />
          </View>
        )}

        {step === 'connecting' && (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.connecting}>Conectando…</Text>
            <Text style={[styles.cardText, { marginTop: 4, fontSize: 14, textAlign: 'center' }]}>
              Estableciendo una conexión segura con el parlante.
            </Text>
          </View>
        )}

        {step === 'person' && (
          <View>
            <View style={styles.connectedBanner}>
              <Check size={20} color={colors.accentForeground} />
              <Text style={styles.connectedText}>Parlante conectado</Text>
            </View>

            <View style={styles.personHeader}>
              <IconBox size={44} radius={radius['2xl']} bg={colors.muted}>
                <UserPlus size={20} color={colors.primary} />
              </IconBox>
              <View>
                <Text style={styles.h2Left}>Vinculá a la persona</Text>
                <Text style={[styles.cardText, { fontSize: 14 }]}>¿A quién vas a acompañar?</Text>
              </View>
            </View>

            <View style={{ gap: 12 }}>
              {candidates.map((person) => {
                const active = selected?.name === person.name
                return (
                  <Pressable
                    key={person.name}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setSelected(person)}
                    style={[
                      styles.candidate,
                      active && { backgroundColor: colors.accent, borderColor: colors.primary },
                    ]}
                  >
                    <Image
                      source={getAvatar(person.avatar)}
                      accessibilityLabel={`Foto de ${person.name}`}
                      style={styles.avatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{person.name}</Text>
                      <Text style={styles.cardText}>{person.relation}</Text>
                    </View>
                    <View
                      style={[
                        styles.check,
                        { backgroundColor: active ? colors.primary : colors.muted },
                      ]}
                    >
                      {active && <Check size={16} color={colors.primaryForeground} />}
                    </View>
                  </Pressable>
                )
              })}
            </View>

            <PrimaryButton
              label="Vincular persona"
              disabled={!selected}
              onPress={() => setStep('done')}
            />
          </View>
        )}

        {step === 'done' && selected && (
          <View style={{ alignItems: 'center', paddingTop: 32 }}>
            <IconBox size={80} radius={radius['3xl']} bg={alpha(colors.ok, 0.15)}>
              <PartyPopper size={40} color={colors.ok} />
            </IconBox>
            <Text style={styles.h2Center}>¡Todo listo!</Text>
            <Text style={styles.pCenter}>
              El parlante quedó vinculado con {selected.name}. Ya podés enviar mensajes y ver su
              estado en la pantalla de inicio.
            </Text>

            <View style={[styles.candidate, { marginTop: 24, width: '100%' }]}>
              <Image
                source={getAvatar(selected.avatar)}
                accessibilityLabel={`Foto de ${selected.name}`}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{selected.name}</Text>
                <Text style={styles.cardText}>{selected.relation} · Parlante de casa</Text>
              </View>
              <Check size={20} color={colors.ok} />
            </View>

            <PrimaryButton label="Ir al inicio" onPress={() => onComplete(selected)} />
          </View>
        )}
      </ScrollView>
    </View>
  )
}

function PrimaryButton({ label, onPress, disabled }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
        disabled && { opacity: 0.4 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.foreground },
  progress: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 20 },
  bar: { flex: 1, height: 6, borderRadius: 3 },
  h2Center: {
    marginTop: 20,
    textAlign: 'center',
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.foreground,
  },
  h2Left: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.foreground },
  pCenter: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 23,
    color: colors.mutedForeground,
  },
  speakerCard: {
    ...cardStyle,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius['3xl'],
    padding: 16,
  },
  cardTitle: { fontFamily: fonts.displaySemibold, fontSize: 14, color: colors.foreground },
  cardText: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedForeground },
  okDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ok },
  connecting: {
    marginTop: 20,
    fontFamily: fonts.displaySemibold,
    fontSize: 18,
    color: colors.foreground,
  },
  connectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    backgroundColor: colors.accent,
    borderRadius: radius['2xl'],
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  connectedText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.accentForeground },
  personHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  candidate: {
    ...cardStyle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius['3xl'],
    padding: 12,
  },
  avatar: { width: 52, height: 52, borderRadius: radius['2xl'] },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  primaryBtnText: {
    fontFamily: fonts.displaySemibold,
    fontSize: 16,
    color: colors.primaryForeground,
  },
})
