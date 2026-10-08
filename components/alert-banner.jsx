import { Pressable, Text, View, StyleSheet } from 'react-native'
import { TriangleAlert, ChevronRight } from 'lucide-react-native'
import { colors, fonts, radius, alpha, shadowSm } from '../lib/theme'
import { IconBox } from './ui/icon-box'

export function AlertBanner({ onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.banner, pressed && { transform: [{ scale: 0.99 }] }]}
    >
      <IconBox size={40} radius={20} bg={alpha(colors.warnForeground, 0.2)}>
        <TriangleAlert size={20} color={colors.warnForeground} />
      </IconBox>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Rosa pidió ayuda</Text>
        <Text style={styles.subtitle}>Hace 2 minutos · tocá para responder</Text>
      </View>
      <ChevronRight size={20} color={colors.warnForeground} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.warn,
    borderRadius: radius['3xl'],
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadowSm,
  },
  title: { fontFamily: fonts.displaySemibold, fontSize: 14, color: colors.warnForeground },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: alpha(colors.warnForeground, 0.8),
  },
})
