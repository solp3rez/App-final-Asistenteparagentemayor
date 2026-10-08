import { useState } from 'react'
import { TextInput, StyleSheet } from 'react-native'
import { colors, fonts, radius } from '../../lib/theme'

// <input> / <textarea> con el estilo "focus:border-primary focus:bg-background"
export function TextField({ style, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <TextInput
      placeholderTextColor={colors.mutedForeground}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.input,
        focused && { borderColor: colors.primary, backgroundColor: colors.background },
        style,
      ]}
      {...props}
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
})
