import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from './theme'

// Estilo de la barra de pestañas, compartido entre el layout y la pantalla de inicio
// (que la oculta mientras se vincula el parlante).
export function useTabBarStyle() {
  const insets = useSafeAreaInsets()
  return {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 56 + insets.bottom,
    paddingTop: 8,
    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
  }
}
