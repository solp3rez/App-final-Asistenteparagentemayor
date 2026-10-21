import { useState } from 'react'
import { TextInput, StyleSheet } from 'react-native'
import { colors, fonts, radius } from '../../lib/tema'

// Conserva el uso anterior. "error" es opcional y no se envía al control nativo.
export function TextField({ style, error = false, onFocus, onBlur, accessibilityHint, ...props }) {
  const [focused, setFocused] = useState(false)
  const errorHint = typeof error === 'string' ? error : ''
  return (
    <TextInput
      {...props}
      placeholderTextColor={error ? '#B42318' : (props.placeholderTextColor ?? colors.mutedForeground)}
      accessibilityHint={[accessibilityHint, errorHint].filter(Boolean).join(' ') || undefined}
      onFocus={(event) => {
        setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={[
        styles.input,
        focused && { borderColor: colors.primary, backgroundColor: colors.background },
        style,
        error && styles.invalid,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    borderRadius: radius['2xl'],
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.foreground,
  },
  invalid: { borderColor: '#B42318', borderWidth: 1.5, color: '#B42318' },
})
