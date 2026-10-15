import { Platform } from 'react-native'

// Colores convertidos desde los oklch() de globals.css (tema claro)
export const colors = {
  background: '#f4fafa',
  foreground: '#1f303b',
  card: '#ffffff',
  primary: '#2c918f',
  primaryForeground: '#f8fdfd',
  secondary: '#e0f3f3',
  secondaryForeground: '#1d565f',
  muted: '#ecf3f5',
  mutedForeground: '#66747a',
  accent: '#cbf1ee',
  accentForeground: '#004d54',
  ok: '#47b777',
  okForeground: '#f9fdfa',
  warn: '#e2484f',
  warnForeground: '#fffafa',
  border: '#d7e0e2',
}

// --radius: 1.1rem y sus multiplicadores del @theme
export const radius = {
  sm: 11,
  md: 14,
  lg: 18,
  xl: 25,
  '2xl': 32,
  '3xl': 39,
}

// Poppins = font-display, Inter = font-sans
export const fonts = {
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  displayMedium: 'Poppins_500Medium',
  displaySemibold: 'Poppins_600SemiBold',
  displayBold: 'Poppins_700Bold',
}

// Equivalente a "color/10", "color/80", etc. de Tailwind
export function alpha(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

export const shadowSm = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  android: { elevation: 1 },
  default: {},
})

// "rounded-3xl bg-card shadow-sm ring-1 ring-border"
export const cardStyle = {
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadowSm,
}
