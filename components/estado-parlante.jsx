import { Pressable, Text, View, StyleSheet } from 'react-native'
import { Speaker, ChevronRight } from 'lucide-react-native'
import { colors, fonts, radius, cardStyle } from '../lib/tema'
import { IconBox } from './ui/caja-icono'
import { Button } from './ui/boton'

// speaker: el parlante vinculado a la cuenta, o null si todavía no hay ninguno.
// loadError: texto si no se pudo consultar. onLink: abre la pantalla de vinculación.
// Todavía no leemos si el equipo está en línea (eso llegará con MQTT), así que no lo mostramos.
export function SpeakerStatusCard({ speaker = null, loadError = '', onLink }) {
  if (speaker) {
    const activo = speaker.activo === true
    const estado = activo ? 'Activo' : 'Falta confirmar el correo'
    return (
      <Pressable accessibilityRole="button"
        accessibilityLabel={`Parlante ${speaker.identificador}. ${estado}. Tocá para ${activo ? 'administrarlo' : 'continuar'}.`}
        onPress={onLink} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
        <View style={styles.top}>
          <View style={styles.titleRow}>
            <IconBox size={48} radius={radius['2xl']} bg={colors.accent}>
              <Speaker size={24} color={colors.accentForeground} />
            </IconBox>
            <View>
              <Text style={styles.title}>Parlante de casa</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, !activo && { backgroundColor: colors.mutedForeground }]} />
                <Text style={[styles.statusText, !activo && { color: colors.mutedForeground }]}>{estado}</Text>
              </View>
            </View>
          </View>
          <View style={styles.chevron}>
            <ChevronRight size={18} color={colors.mutedForeground} />
          </View>
        </View>
        <Text style={styles.footer}>
          Identificador: {speaker.identificador}{activo ? '' : ' · Tocá para terminar de activarlo'}
        </Text>
      </Pressable>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <IconBox size={48} radius={radius['2xl']} bg={colors.muted}>
          <Speaker size={24} color={colors.mutedForeground} />
        </IconBox>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Todavía no vinculaste un parlante</Text>
          <Text style={styles.help}>Vinculalo para que tus mensajes salgan por el parlante de casa.</Text>
        </View>
      </View>
      {loadError ? <Text accessibilityRole="alert" style={styles.errorText}>{loadError}</Text> : null}
      <Button label="Vincular parlante" onPress={onLink} height={48} fontSize={15} style={{ marginTop: 16 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: { ...cardStyle, borderRadius: radius['3xl'], padding: 20 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: fonts.displaySemibold, fontSize: 16, color: colors.foreground },
  help: { marginTop: 2, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.mutedForeground },
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
  footer: { marginTop: 16, fontFamily: fonts.body, fontSize: 12, color: colors.mutedForeground },
  errorText: { marginTop: 12, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: '#B42318' },
})
