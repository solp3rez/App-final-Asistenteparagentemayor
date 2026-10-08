import { Pressable, Text, StyleSheet } from 'react-native'
import { colors, fonts } from '../../lib/theme'

const variants = {
  default: { bg: colors.primary, fg: colors.primaryForeground },
  secondary: { bg: colors.secondary, fg: colors.secondaryForeground },
  ghost: { bg: 'transparent', fg: colors.primary },
  warn: { bg: colors.warn, fg: colors.warnForeground },
}

/**
 * Reemplazo del <Button> de shadcn/base-ui.
 * Props: label, onPress, variant, height, radius, fontSize, weight, icon (componente lucide), disabled, style
 */
export function Button({
  label,
  onPress,
  variant = 'default',
  height = 52,
  radius = 32,
  fontSize = 16,
  weight = 'semibold',
  icon: Icon,
  iconSize,
  disabled = false,
  style,
}) {
  const v = variants[variant]
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          borderRadius: radius,
          backgroundColor: pressed && variant === 'ghost' ? colors.accent : v.bg,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      {Icon ? <Icon size={iconSize ?? fontSize + 2} color={v.fg} /> : null}
      <Text
        style={{
          color: v.fg,
          fontSize,
          fontFamily: weight === 'medium' ? fonts.bodyMedium : fonts.bodySemibold,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
})
