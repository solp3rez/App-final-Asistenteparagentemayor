import { Linking, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native'
import { TriangleAlert, CheckCircle2, PhoneCall } from 'lucide-react-native'
import { colors, fonts, radius, alpha, cardStyle } from '../../lib/theme'
import { IconBox } from '../../components/ui/icon-box'
import { ScreenHeader } from '../../components/screen-header'

const alerts = [
  { id: '1', person: 'Rosa', kind: 'help', text: 'Pidió ayuda desde el parlante.', time: 'Hace 5 min' },
  { id: '2', person: 'Carlos', kind: 'resolved', text: 'Alerta resuelta, todo en orden.', time: 'Ayer, 18:40' },
  { id: '3', person: 'Rosa', kind: 'resolved', text: 'Confirmó que tomó la medicación.', time: 'Ayer, 09:05' },
]

export default function AlertasPage() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Alertas" subtitle="Avisos del parlante" backHref="/home" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {alerts.map((a) => {
          const help = a.kind === 'help'
          return (
            <View
              key={a.id}
              style={[
                styles.card,
                help && {
                  borderColor: alpha(colors.warn, 0.3),
                  backgroundColor: alpha(colors.warn, 0.1),
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <IconBox
                  size={44}
                  radius={radius.xl}
                  bg={help ? colors.warn : alpha(colors.ok, 0.15)}
                >
                  {help ? (
                    <TriangleAlert size={24} color={colors.warnForeground} />
                  ) : (
                    <CheckCircle2 size={24} color={colors.ok} />
                  )}
                </IconBox>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.person}>{a.person}</Text>
                    <Text style={styles.time}>{a.time}</Text>
                  </View>
                  <Text style={styles.text}>{a.text}</Text>
                  {help && (
                    <Pressable
                      accessibilityRole="link"
                      onPress={() => Linking.openURL('tel:911')}
                      style={({ pressed }) => [styles.call, pressed && { opacity: 0.9 }]}
                    >
                      <PhoneCall size={16} color={colors.warnForeground} />
                      <Text style={styles.callText}>Llamar ahora</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { ...cardStyle, borderRadius: radius['2xl'], padding: 16 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  person: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.foreground },
  time: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedForeground },
  text: { marginTop: 2, fontFamily: fonts.body, fontSize: 14, color: colors.mutedForeground },
  call: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warn,
    borderRadius: radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  callText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.warnForeground },
})
