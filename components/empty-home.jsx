import { Pressable, Text, View, StyleSheet } from 'react-native'
import { Speaker, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react-native'
import { colors, fonts, radius, cardStyle } from '../lib/theme'
import { IconBox } from './ui/icon-box'

export function EmptyHome({ onStart }) {
  return (
    <View style={styles.container}>
      <IconBox size={80} radius={radius['3xl']} bg={colors.accent}>
        <Speaker size={40} color={colors.accentForeground} />
      </IconBox>

      <Text style={styles.title}>Todavía no hay nada vinculado</Text>
      <Text style={styles.text}>
        Para empezar, conectá tu parlante y vinculá a la persona que vas a acompañar. Cuando esté
        todo listo, vas a verla acá.
      </Text>

      <View style={styles.steps}>
        <View style={styles.step}>
          <IconBox size={40} radius={radius['2xl']} bg={colors.muted}>
            <Speaker size={20} color={colors.primary} />
          </IconBox>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>Conectá el parlante</Text>
            <Text style={styles.stepText}>Enchufalo y conectalo a tu red wifi.</Text>
          </View>
        </View>
        <View style={styles.step}>
          <IconBox size={40} radius={radius['2xl']} bg={colors.muted}>
            <UserPlus size={20} color={colors.primary} />
          </IconBox>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>Vinculá a la persona</Text>
            <Text style={styles.stepText}>Asociá el parlante con tu ser querido.</Text>
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onStart}
        style={({ pressed }) => [styles.cta, pressed && { transform: [{ scale: 0.98 }] }]}
      >
        <Text style={styles.ctaText}>Vincular ahora</Text>
        <ArrowRight size={20} color={colors.primaryForeground} />
      </Pressable>

      <View style={styles.secure}>
        <ShieldCheck size={16} color={colors.ok} />
        <Text style={styles.secureText}>Conexión segura y privada</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 },
  title: {
    marginTop: 20,
    textAlign: 'center',
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.foreground,
  },
  text: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 23,
    color: colors.mutedForeground,
  },
  steps: { width: '100%', marginTop: 28, gap: 12 },
  step: {
    ...cardStyle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius['3xl'],
    padding: 16,
  },
  stepTitle: { fontFamily: fonts.displaySemibold, fontSize: 14, color: colors.foreground },
  stepText: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedForeground },
  cta: {
    marginTop: 28,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  ctaText: { fontFamily: fonts.displaySemibold, fontSize: 16, color: colors.primaryForeground },
  secure: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  secureText: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedForeground },
})
