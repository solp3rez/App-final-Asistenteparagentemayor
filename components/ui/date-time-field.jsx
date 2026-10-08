import { useState } from 'react'
import { Platform, Pressable, Text, View, StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { colors, fonts, radius } from '../../lib/theme'
import {
  formatWhen,
  parseDateString,
  parseTimeString,
  toDateString,
  toTimeString,
} from '../../lib/scheduled'

/**
 * Reemplazo de <input type="date"> y <input type="time">.
 * value es un string: 'YYYY-MM-DD' (mode="date") o 'HH:MM' (mode="time").
 */
export function DateTimeField({ mode, value, onChange, accessibilityLabel, compact = false }) {
  const [show, setShow] = useState(false)
  const current = mode === 'date' ? parseDateString(value) : parseTimeString(value)

  function handleChange(event, selected) {
    if (Platform.OS === 'android') setShow(false)
    if (event?.type === 'dismissed' || !selected) return
    onChange(mode === 'date' ? toDateString(selected) : toTimeString(selected))
  }

  const boxStyle = [styles.box, compact && { paddingVertical: 10, borderRadius: radius.xl }]

  // iOS: el picker "compact" ya es un botón que abre su propio selector
  if (Platform.OS === 'ios') {
    return (
      <View style={[boxStyle, styles.iosBox]}>
        <DateTimePicker
          value={current}
          mode={mode}
          display="compact"
          locale="es-AR"
          themeVariant="light"
          accentColor={colors.primary}
          onChange={handleChange}
          accessibilityLabel={accessibilityLabel}
        />
      </View>
    )
  }

  // Android: botón que abre el diálogo nativo
  const label =
    value && mode === 'date'
      ? formatWhen(value, '').replace(/^./, (c) => c.toUpperCase())
      : value || (mode === 'date' ? 'Elegir día' : 'Elegir hora')

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => setShow(true)}
        style={boxStyle}
      >
        <Text style={styles.text} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={current}
          mode={mode}
          is24Hour
          display="default"
          onChange={handleChange}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    borderRadius: radius['2xl'],
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  iosBox: { alignItems: 'flex-start' },
  text: { fontSize: 14, fontFamily: fonts.body, color: colors.foreground },
})
