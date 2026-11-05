import { Pressable, Text, View, StyleSheet } from 'react-native'
import { TriangleAlert, ChevronRight } from 'lucide-react-native'
import { colors, fonts, radius, alpha, shadowSm } from '../lib/tema'
import { IconBox } from './ui/caja-icono'

export function AlertBanner({ onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.banner, pressed && { transform: [{ scale: 0.99 }] }]}
    >
      <IconBox size={40} radius={20} bg={alpha(colors.primary, 0.1)}>
        <TriangleAlert size={20} color={colors.primary} />
      </IconBox>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Ver historial de alertas</Text>
        <Text style={styles.subtitle}>Consultá los pedidos de ayuda registrados</Text>
      </View>
      <ChevronRight size={20} color={colors.foreground} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.secondary,
    borderRadius: radius['3xl'],
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadowSm,
  },
  title: { fontFamily: fonts.displaySemibold, fontSize: 14, color: colors.foreground },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.mutedForeground,
  },
})
