import { useCallback, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { TriangleAlert } from 'lucide-react-native'
import { colors, fonts, radius, alpha, cardStyle } from '../../lib/tema'
import { consultarAlertas, fechaAlerta } from '../../lib/alertas'
import { IconBox } from '../../components/ui/caja-icono'
import { ScreenHeader } from '../../components/encabezado-pantalla'

export default function AlertasPage() {
  const [items, setItems] = useState([])
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)
  const ocupado = useRef(false)
  const paginaActual = useRef(1)
  const activo = useRef(false)

  const cargar = useCallback(async (numero = 1) => {
    if (ocupado.current) return
    ocupado.current = true
    setCargando(true)
    try {
      const resultado = await consultarAlertas({ pagina: numero })
      if (!activo.current) return
      setItems(anteriores => numero === 1 ? resultado.items : [...anteriores, ...resultado.items])
      paginaActual.current = numero
      setPagina(numero)
      setTotalPaginas(resultado.totalPaginas || 0)
      setError('')
      setListo(true)
    } catch (_) {
      if (activo.current) {
        setError('No se pudo consultar el historial. Revisá tu conexión y volvé a intentar.')
        setListo(true)
      }
    } finally {
      ocupado.current = false
      if (activo.current) setCargando(false)
    }
  }, [])

  useFocusEffect(useCallback(() => {
    activo.current = true
    paginaActual.current = 1
    setItems([])
    setListo(false)
    cargar(1)
    // Actualizar la primera página mientras la pantalla está abierta.
    const intervalo = setInterval(() => {
      if (paginaActual.current === 1) cargar(1)
    }, 5000)
    return () => {
      activo.current = false
      clearInterval(intervalo)
    }
  }, [cargar]))

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Alertas" subtitle="Historial de pedidos de ayuda" backHref="/inicio" />
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable accessibilityRole="button" onPress={() => cargar(1)} disabled={cargando}>
          <Text style={styles.enlace}>{cargando ? 'Actualizando…' : 'Actualizar historial'}</Text>
        </Pressable>
        {cargando && !listo ? <ActivityIndicator accessibilityLabel="Cargando alertas" /> : null}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {listo && !error && items.length === 0 ? (
          <Text style={styles.texto}>Todavía no hay alertas registradas.</Text>
        ) : null}
        {items.map(item => (
          <View key={item.id} style={styles.tarjeta}>
            <IconBox size={44} radius={radius.xl} bg={colors.warn}>
              <TriangleAlert size={24} color={colors.warnForeground} />
            </IconBox>
            <View style={{ flex: 1 }}>
              <Text style={styles.persona}>{item.persona || 'Persona vinculada'}</Text>
              <Text style={styles.texto}>{item.mensaje}</Text>
              <Text style={styles.fecha}>{fechaAlerta(item.fecha)}</Text>
            </View>
          </View>
        ))}
        {pagina < totalPaginas ? (
          <Pressable accessibilityRole="button" onPress={() => cargar(pagina + 1)} disabled={cargando}>
            <Text style={styles.enlace}>{cargando ? 'Cargando…' : 'Cargar alertas anteriores'}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  contenido: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 12 },
  tarjeta: {
    ...cardStyle, borderRadius: radius['2xl'], padding: 16, flexDirection: 'row', gap: 12,
    borderColor: alpha(colors.warn, 0.3), backgroundColor: alpha(colors.warn, 0.1),
  },
  persona: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.foreground },
  texto: { marginTop: 2, fontFamily: fonts.body, fontSize: 14, color: colors.mutedForeground },
  fecha: { marginTop: 6, fontFamily: fonts.body, fontSize: 12, color: colors.mutedForeground },
  enlace: { color: colors.primary, fontFamily: fonts.bodySemibold, paddingVertical: 8 },
  error: { color: '#B42318', fontFamily: fonts.body, fontSize: 14 },
})
