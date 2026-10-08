import { View } from 'react-native'
import { Tabs } from 'expo-router'
import { Home, MessageSquare, Bell, Settings } from 'lucide-react-native'
import { colors, fonts } from '../../lib/theme'
import { useTabBarStyle } from '../../lib/tab-bar-style'

// La barra inferior (BottomTabBar) ahora la maneja Expo Router con <Tabs>
function TabIcon({ icon: Icon, color, badge }) {
  return (
    <View>
      <Icon size={24} color={color} />
      {badge && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.warn,
            borderWidth: 2,
            borderColor: colors.card,
          }}
        />
      )}
    </View>
  )
}

export default function TabsLayout() {
  const tabBarStyle = useTabBarStyle()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
        tabBarStyle,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabIcon icon={Home} color={color} />,
        }}
      />
      <Tabs.Screen
        name="programados"
        options={{
          title: 'Mensajes',
          tabBarIcon: ({ color }) => <TabIcon icon={MessageSquare} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color }) => <TabIcon icon={Bell} color={color} badge />,
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <TabIcon icon={Settings} color={color} />,
        }}
      />
    </Tabs>
  )
}
