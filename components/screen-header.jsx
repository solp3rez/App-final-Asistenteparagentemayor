import { Pressable, Text, View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft } from 'lucide-react-native'
import { colors, fonts } from '../lib/theme'

// Encabezado con botón "Volver" que se repetía en alertas, ajustes, programados, mensaje y registro
export function ScreenHeader({ title, subtitle, backHref = '/home' }) {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={() => router.navigate(backHref)}
        style={({ pressed }) => [styles.back, pressed && { backgroundColor: colors.accent }]}
      >
        <ArrowLeft size={20} color={colors.foreground} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.foreground },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedForeground },
})
