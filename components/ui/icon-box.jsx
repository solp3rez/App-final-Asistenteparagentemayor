import { View } from 'react-native'

// Contenedor cuadrado/redondo centrado para íconos: "flex h-10 w-10 items-center justify-center rounded-full bg-…"
export function IconBox({ size, radius, bg, children, style }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}
