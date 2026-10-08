import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import { colors } from '../../lib/theme'
import { getLinkedPerson, saveLinkedPerson } from '../../lib/person'
import { useTabBarStyle } from '../../lib/tab-bar-style'
import { HomeHeader } from '../../components/home-header'
import { AlertBanner } from '../../components/alert-banner'
import { SpeakerStatusCard } from '../../components/speaker-status-card'
import { QuickActions } from '../../components/quick-actions'
import { LinkedPeople } from '../../components/linked-people'
import { RecentActivity } from '../../components/recent-activity'
import { EmptyHome } from '../../components/empty-home'
import { LinkFlow } from '../../components/link-flow'

export default function HomePage() {
  const router = useRouter()
  const navigation = useNavigation()
  const tabBarStyle = useTabBarStyle()
  const [view, setView] = useState('loading') // 'loading' | 'empty' | 'linking' | 'linked'
  const [person, setPerson] = useState(null)

  // Leemos la persona vinculada cada vez que la pestaña recibe foco
  // (por ejemplo, después de desvincular desde Ajustes).
  useFocusEffect(
    useCallback(() => {
      let active = true
      getLinkedPerson().then((saved) => {
        if (!active) return
        setView((current) => {
          if (current === 'linking') return current
          return saved ? 'linked' : 'empty'
        })
        setPerson(saved)
      })
      return () => {
        active = false
      }
    }, []),
  )

  // Mientras se vincula, ocultamos la barra de pestañas (igual que en la versión web)
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: view === 'linking' ? { ...tabBarStyle, display: 'none' } : tabBarStyle,
    })
  }, [view, navigation, tabBarStyle])

  async function completeLink(linked) {
    setPerson(linked)
    await saveLinkedPerson(linked)
    setView('linked')
  }

  if (view === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Cargando" />
      </View>
    )
  }

  if (view === 'linking') {
    return <LinkFlow onCancel={() => setView('empty')} onComplete={completeLink} />
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <HomeHeader />
        {view === 'empty' && <EmptyHome onStart={() => setView('linking')} />}
        {view === 'linked' && person && (
          <View style={{ gap: 24, paddingHorizontal: 20, paddingTop: 4 }}>
            <AlertBanner onPress={() => router.navigate('/alertas')} />
            <SpeakerStatusCard />
            <QuickActions />
            <LinkedPeople
              people={[
                {
                  name: person.name,
                  relation: person.relation,
                  avatar: person.avatar,
                  status: 'ok',
                },
              ]}
            />
            <RecentActivity />
          </View>
        )}
      </ScrollView>
    </View>
  )
}
