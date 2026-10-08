import { Pressable, Text, View, StyleSheet } from 'react-native'
import { Speaker, Wifi, BatteryFull, ChevronRight } from 'lucide-react-native'
import { colors, fonts, radius, cardStyle } from '../lib/theme'
import { IconBox } from './ui/icon-box'

export function SpeakerStatusCard() {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <IconBox size={48} radius={radius['2xl']} bg={colors.accent}>
            <Speaker size={24} color={colors.accentForeground} />
          </IconBox>
          <View>
            <Text style={styles.title}>Parlante de casa</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>En línea</Text>
            </View>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver detalle del dispositivo"
          style={({ pressed }) => [
            styles.chevron,
            pressed && { backgroundColor: colors.accent },
          ]}
        >
          <ChevronRight size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Wifi size={20} color={colors.primary} />
          <View>
            <Text style={styles.statLabel}>Señal</Text>
            <Text style={styles.statValue}>Estable</Text>
          </View>
        </View>
        <View style={styles.stat}>
          <BatteryFull size={20} color={colors.ok} />
          <View>
            <Text style={styles.statLabel}>Batería</Text>
            <Text style={styles.statValue}>92%</Text>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>Última actividad: hoy a las 14:32</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { ...cardStyle, borderRadius: radius['3xl'], padding: 20 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: fonts.displaySemibold, fontSize: 16, color: colors.foreground },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ok },
  statusText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ok },
  chevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row', gap: 12, marginTop: 20 },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.muted,
    borderRadius: radius['2xl'],
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedForeground },
  statValue: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.foreground },
  footer: { marginTop: 16, fontFamily: fonts.body, fontSize: 12, color: colors.mutedForeground },
})
