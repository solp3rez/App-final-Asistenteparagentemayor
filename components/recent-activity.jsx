import { Pressable, Text, View, StyleSheet } from 'react-native'
import { TriangleAlert, MessageCircle, PhoneCall, Check } from 'lucide-react-native'
import { colors, fonts, radius, alpha, cardStyle } from '../lib/theme'
import { IconBox } from './ui/icon-box'

const tones = {
  warn: { bg: alpha(colors.warn, 0.12), fg: colors.warn },
  primary: { bg: colors.accent, fg: colors.accentForeground },
  ok: { bg: alpha(colors.ok, 0.12), fg: colors.ok },
}

const items = [
  { icon: TriangleAlert, title: 'Rosa pidió ayuda', time: '14:30', tone: 'warn' },
  { icon: MessageCircle, title: 'Mensaje recibido de Carlos', time: '12:05', tone: 'primary' },
  { icon: PhoneCall, title: 'Llamada con Rosa (4 min)', time: 'Ayer', tone: 'ok' },
]

export function RecentActivity() {
  return (
    <View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Actividad reciente</Text>
        <Pressable accessibilityRole="button">
          <Text style={styles.link}>Historial</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        {items.map((item, index) => {
          const tone = tones[item.tone]
          return (
            <View
              key={item.title}
              style={[styles.row, index < items.length - 1 && styles.divider]}
            >
              <IconBox size={40} radius={20} bg={tone.bg}>
                <item.icon size={20} color={tone.fg} />
              </IconBox>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemTime}>{item.time}</Text>
              </View>
              <Check size={16} color={colors.mutedForeground} />
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontFamily: fonts.displaySemibold, fontSize: 16, color: colors.foreground },
  link: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.primary },
  card: { ...cardStyle, borderRadius: radius['3xl'], overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  itemTitle: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.foreground },
  itemTime: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedForeground },
})
