import { Image, Pressable, Text, View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Bell } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { colors, fonts, alpha } from '../lib/tema'
import { getAvatar } from '../lib/avatares'

export function HomeHeader() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <View style={styles.row}>
        <View style={styles.user}>
          <Image source={getAvatar('ana')} accessibilityLabel="Imagen de perfil" style={styles.avatar} />
          <View>
            <Text style={styles.hello}>Hola,</Text>
            <Text style={styles.name}>Cerca</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver alertas"
          onPress={() => router.navigate('/alertas')}
          style={({ pressed }) => [
            styles.bell,
            { backgroundColor: alpha(colors.primaryForeground, pressed ? 0.25 : 0.15) },
          ]}
        >
          <Bell size={20} color={colors.primaryForeground} />
        </Pressable>
      </View>
      <Text style={styles.subtitle}>
        Consultá las alertas y mensajes de tu persona vinculada.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  user: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: alpha(colors.primaryForeground, 0.4),
  },
  hello: { fontFamily: fonts.body, fontSize: 14, color: alpha(colors.primaryForeground, 0.7) },
  name: {
    fontFamily: fonts.displaySemibold,
    fontSize: 20,
    lineHeight: 25,
    color: colors.primaryForeground,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.warn,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  subtitle: {
    marginTop: 16,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: alpha(colors.primaryForeground, 0.8),
  },
})
