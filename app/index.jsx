import { Image, ScrollView, Text, View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ShieldCheck, MessageCircleHeart, BellRing } from 'lucide-react-native'
import { colors, fonts, radius } from '../lib/theme'
import { Button } from '../components/ui/button'
import { IconBox } from '../components/ui/icon-box'

const highlights = [
  { icon: MessageCircleHeart, label: 'Enviá mensajes de voz al parlante del hogar' },
  { icon: BellRing, label: 'Recibí alertas si tu familiar pide ayuda' },
  { icon: ShieldCheck, label: 'Sabé en todo momento que está acompañado' },
]

export default function WelcomePage() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: insets.top + 24,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <IconBox size={36} radius={radius['2xl']} bg={colors.primary}>
            <MessageCircleHeart size={20} color={colors.primaryForeground} />
          </IconBox>
          <Text style={styles.brandText}>Cerca</Text>
        </View>

        <View style={styles.illustration}>
          <Image
            source={require('../assets/welcome-illustration.png')}
            accessibilityLabel="Ilustración de una persona mayor en casa conectada con su familiar a través de un parlante inteligente"
            style={{ width: '100%', height: 224 }}
            resizeMode="cover"
          />
        </View>

        <View style={{ marginTop: 28 }}>
          <Text style={styles.title}>Acompañá a quien querés, estés donde estés</Text>
          <Text style={styles.text}>
            Mantené el vínculo con tus mayores a través del parlante del hogar. Simple para ellos,
            tranquilo para vos.
          </Text>
        </View>

        <View style={{ marginTop: 24, gap: 12 }}>
          {highlights.map(({ icon: Icon, label }) => (
            <View key={label} style={styles.highlight}>
              <IconBox size={40} radius={20} bg={colors.accent}>
                <Icon size={20} color={colors.accentForeground} />
              </IconBox>
              <Text style={styles.highlightText}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button label="Crear cuenta" onPress={() => router.push('/registro')} />
        <Button
          label="Ya tengo cuenta"
          variant="ghost"
          height={48}
          onPress={() => router.push('/home')}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.foreground },
  illustration: {
    marginTop: 24,
    overflow: 'hidden',
    borderRadius: radius['3xl'],
    backgroundColor: colors.accent,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    lineHeight: 35,
    color: colors.foreground,
  },
  text: {
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 26,
    color: colors.mutedForeground,
  },
  highlight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  highlightText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 23,
    color: colors.foreground,
  },
  footer: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
})
