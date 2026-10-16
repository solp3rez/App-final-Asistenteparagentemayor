import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import { colors } from '../../lib/tema'
import { getLinkedPerson, saveLinkedPerson } from '../../lib/persona'
import { verificarSesion } from '../../lib/conexion-pocketbase'
import { cerrarSesion, ErrorSesion } from '../../lib/sesion'
import { useTabBarStyle } from '../../lib/estilo-barra-pestanas'
import { HomeHeader } from '../../components/encabezado-inicio'
import { AlertBanner } from '../../components/aviso-alerta'
import { SpeakerStatusCard } from '../../components/estado-parlante'
import { QuickActions } from '../../components/acciones-rapidas'
import { LinkedPeople } from '../../components/personas-vinculadas'
import { RecentActivity } from '../../components/actividad-reciente'
import { EmptyHome } from '../../components/inicio-vacio'
import { LinkFlow } from '../../components/flujo-vinculacion'

export default function HomePage() {
  const router = useRouter()
  const navigation = useNavigation()
  const tabBarStyle = useTabBarStyle()
  const [view, setView] = useState('loading') // 'loading' | 'empty' | 'linking' | 'linked'
  const [person, setPerson] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [leaving, setLeaving] = useState(false)

  // Al volver a Inicio, verificamos la sesión y consultamos SOLO su familiar.
  useFocusEffect(
    useCallback(() => {
      let active = true
      setPerson(null)
      setError('')
      setView('loading')
      async function cargar() {
        try {
          await verificarSesion()
          const saved = await getLinkedPerson()
          if (!active) return
          setPerson(saved)
          setView(saved ? 'linked' : 'empty')
        } catch (error) {
          if (!active) return
          if (error instanceof ErrorSesion) {
            router.replace('/iniciar-sesion')
            return
          }
          setError(error.message || 'No se pudo consultar la persona vinculada.')
          setView('error')
        }
      }
      cargar()
      return () => { active = false }
    }, [retry, router]),
  )

  async function cambiarCuenta() {
    if (leaving) return
    setLeaving(true)
    try {
      await cerrarSesion()
      setPerson(null)
      router.replace('/iniciar-sesion')
    } catch (_) {
      setError('No se pudo cerrar la sesión. Intentá nuevamente.')
    } finally {
      setLeaving(false)
    }
  }

  // Mientras se vincula, ocultamos la barra de pestañas (igual que en la versión web)
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: view === 'linking' ? { ...tabBarStyle, display: 'none' } : tabBarStyle,
    })
  }, [view, navigation, tabBarStyle])

  async function completeLink(linked) {
    const saved = await saveLinkedPerson(linked)
    setPerson(saved)
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
        <View style={{ paddingHorizontal: 20, alignItems: 'flex-end', marginBottom: 12 }}>
          <Pressable onPress={cambiarCuenta} disabled={leaving} accessibilityRole="button" style={{ padding: 10 }}>
            <Text style={{ color: colors.primary }}>{leaving ? 'Cerrando sesión...' : 'Cambiar cuenta'}</Text>
          </Pressable>
        </View>
        {error ? <Text accessibilityRole="alert" style={{ color: '#B42318', paddingHorizontal: 20, marginBottom: 12 }}>{error}</Text> : null}
        {view === 'error' && (
          <Pressable onPress={() => setRetry(value => value + 1)} accessibilityRole="button" style={{ padding: 20 }}>
            <Text style={{ color: colors.primary }}>Volver a intentar</Text>
          </Pressable>
        )}
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
          </View>
        )}
        {(view === 'linked' || view === 'empty') && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <RecentActivity />
          </View>
        )}
      </ScrollView>
    </View>
  )
}
