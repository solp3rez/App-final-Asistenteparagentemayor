import { Pressable, Text, View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { MessageCircle, Phone, BellRing } from 'lucide-react-native'
import { colors, fonts, radius, cardStyle } from '../lib/theme'
import { IconBox } from './ui/icon-box'

const actions = [
  { label: 'Enviar mensaje', icon: MessageCircle, bg: colors.primary, fg: colors.primaryForeground, href: '/mensaje' },
  { label: 'Llamar', icon: Phone, bg: colors.ok, fg: colors.okForeground, href: '/home' },
  { label: 'Alertas', icon: BellRing, bg: colors.warn, fg: colors.warnForeground, href: '/home' },
]

export function QuickActions() {
  const router = useRouter()

  return (
    <View style={styles.grid}>
      {actions.map(({ label, icon: Icon, bg, fg, href }) => (
        <Pressable
          key={label}
          accessibilityRole="button"
          onPress={() => router.push(href)}
          style={({ pressed }) => [styles.item, pressed && { transform: [{ scale: 0.97 }] }]}
        >
          <IconBox size={48} radius={radius['2xl']} bg={bg}>
            <Icon size={24} color={fg} />
          </IconBox>
          <Text style={styles.label}>{label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 12 },
  item: {
    ...cardStyle,
    flex: 1,
    alignItems: 'center',
    gap: 10,
    borderRadius: radius['3xl'],
    padding: 16,
  },
  label: {
    textAlign: 'center',
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 15,
    color: colors.foreground,
  },
})
