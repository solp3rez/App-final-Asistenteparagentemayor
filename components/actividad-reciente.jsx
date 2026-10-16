import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, Text, View, StyleSheet } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Clock, MessageCircle, X } from 'lucide-react-native'
import { colors, fonts, radius, alpha, cardStyle } from '../lib/tema'
import { obtenerHistorialMensajes, formatearFechaMensaje, describirEstadoMensaje } from '../lib/historial'
import { ErrorSesion } from '../lib/sesion'
import { Button } from './ui/boton'
import { IconBox } from './ui/caja-icono'

export function RecentActivity() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)
  const generationRef = useRef(0)
  const busyRef = useRef(false)
  const ownerRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const informarError = useCallback(error => {
    if (error instanceof ErrorSesion) {
      setItems([])
      setVisible(false)
      router.replace('/iniciar-sesion')
    } else {
      setError(error.status === 403
        ? 'PocketBase no permite consultar los mensajes. Revisá sus reglas de Listar y Ver.'
        : error.message || 'No se pudo cargar el historial.')
    }
  }, [router])

  const cargarPrimera = useCallback(async () => {
    const generation = ++generationRef.current
    busyRef.current = true
    ownerRef.current = null
    setItems([])
    setPage(0)
    setTotalPages(0)
    setTotalItems(0)
    setLoading(true)
    setLoadingMore(false)
    setError('')
    try {
      const result = await obtenerHistorialMensajes()
      if (!mountedRef.current || generationRef.current !== generation) return
      ownerRef.current = result.usuarioId
      setItems(result.items)
      setPage(result.page)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (error) {
      if (mountedRef.current && generationRef.current === generation) informarError(error)
    } finally {
      if (mountedRef.current && generationRef.current === generation) {
        busyRef.current = false
        setLoading(false)
      }
    }
  }, [informarError])

  useFocusEffect(useCallback(() => {
    cargarPrimera()
    return () => {
      generationRef.current += 1
      busyRef.current = false
      setVisible(false)
    }
  }, [cargarPrimera]))

  async function cargarMas() {
    if (busyRef.current || page >= totalPages) return
    const generation = generationRef.current
    const owner = ownerRef.current
    busyRef.current = true
    setLoadingMore(true)
    setError('')
    try {
      const result = await obtenerHistorialMensajes({ pagina: page + 1 })
      if (!mountedRef.current || generationRef.current !== generation) return
      if (result.usuarioId !== owner) throw new ErrorSesion()
      setItems(previous => {
        const seen = new Set(previous.map(item => item.id))
        return [...previous, ...result.items.filter(item => !seen.has(item.id))]
      })
      setPage(result.page)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (error) {
      if (mountedRef.current && generationRef.current === generation) informarError(error)
    } finally {
      if (mountedRef.current && generationRef.current === generation) {
        busyRef.current = false
        setLoadingMore(false)
      }
    }
  }

  function abrirHistorial() {
    setVisible(true)
    cargarPrimera()
  }

  const preview = items.slice(0, 3)
  const empty = !loading && !error && items.length === 0

  return (
    <View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Actividad reciente</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir historial de mensajes" onPress={abrirHistorial} style={styles.linkButton}>
          <Text style={styles.link}>Historial</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        {loading ? <View style={styles.info}><ActivityIndicator color={colors.primary} /><Text style={styles.body}>Cargando mensajes...</Text></View> : null}
        {preview.map((item, index) => <MessageRow key={item.id} item={item} preview divider={index < preview.length - 1} />)}
        {empty ? <Text style={[styles.body, styles.padding]}>Todavía no hay mensajes guardados en esta cuenta.</Text> : null}
        {error ? <View style={styles.padding}><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Pressable accessibilityRole="button" onPress={cargarPrimera} disabled={loading || loadingMore} style={styles.linkButton}><Text style={styles.link}>Volver a intentar</Text></Pressable></View> : null}
        {!loading && totalItems > 3 ? <Text style={[styles.caption, styles.padding]}>Últimos 3 mensajes. Tocá Cargar más para abrir el historial completo.</Text> : null}
      </View>
      {!loading && !error && items.length > 0 ? (
        <Button
          label="Cargar más"
          variant="secondary"
          height={44}
          onPress={abrirHistorial}
          style={{ marginTop: 12 }}
        />
      ) : null}
      <Text style={[styles.caption, { marginTop: 8 }]}>Mensajes guardados en PocketBase. Las alertas y confirmaciones del parlante todavía no están integradas.</Text>

      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setVisible(false)}>
        <View style={[styles.modal, { paddingTop: insets.top + 12, paddingBottom: insets.bottom }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Historial de mensajes</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar historial" onPress={() => setVisible(false)} style={styles.close}>
              <X size={22} color={colors.foreground} />
            </Pressable>
          </View>
          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <MessageRow item={item} divider />}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarPrimera} tintColor={colors.primary} colors={[colors.primary]} />}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListHeaderComponent={
              <View style={styles.padding}>
                <Text style={styles.body}>Solo los mensajes de tu cuenta, del más reciente al más antiguo. Fechas en la hora local de tu celular.</Text>
                <Text style={[styles.caption, { marginTop: 6 }]}>Guardar no significa enviar ni reproducir. Por ahora los mensajes quedan pendientes.</Text>
                <Pressable accessibilityRole="button" onPress={cargarPrimera} disabled={loading || loadingMore} style={[styles.linkButton, { alignSelf: 'flex-start' }]}>
                  <Text style={styles.link}>{loading ? 'Actualizando...' : 'Actualizar historial'}</Text>
                </Pressable>
              </View>
            }
            ListEmptyComponent={!loading && !error ? <Text style={[styles.body, styles.padding]}>Todavía no hay mensajes guardados en esta cuenta.</Text> : null}
            ListFooterComponent={
              <View style={[styles.padding, { gap: 12 }]}>
                {error ? <><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Button label="Volver a intentar" disabled={loading || loadingMore} onPress={page > 0 ? cargarMas : cargarPrimera} /></> : null}
                {!loading && items.length > 0 ? <Text style={styles.caption}>Mostrando {items.length} de {totalItems} mensajes.</Text> : null}
                {!error && page < totalPages ? <Button label={loadingMore ? 'Cargando...' : 'Cargar más mensajes'} disabled={loading || loadingMore} onPress={cargarMas} /> : null}
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  )
}

function MessageRow({ item, preview = false, divider = false }) {
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <IconBox size={40} radius={20} bg={colors.accent}>
        <MessageCircle size={20} color={colors.accentForeground} />
      </IconBox>
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={styles.recipient}>Para: {item.destinatario}</Text>
        <Text style={styles.itemText} numberOfLines={preview ? 2 : undefined}>{item.texto}</Text>
        <Text style={styles.caption}>Guardado: {formatearFechaMensaje(item.created)}</Text>
        <View style={styles.status}>
          {item.estado === 'pendiente' ? <Clock size={14} color={colors.primary} /> : null}
          <Text style={styles.statusText}>{describirEstadoMensaje(item.estado)}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontFamily: fonts.displaySemibold, fontSize: 16, color: colors.foreground },
  link: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.primary },
  linkButton: { paddingVertical: 10, paddingHorizontal: 8 },
  card: { ...cardStyle, borderRadius: radius['3xl'], overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  recipient: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.foreground },
  itemText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.foreground },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.mutedForeground },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.mutedForeground },
  info: { padding: 20, gap: 12, alignItems: 'center' },
  padding: { padding: 16 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: alpha(colors.primary, 0.08), borderRadius: 8 },
  statusText: { color: colors.primary, fontFamily: fonts.bodyMedium, fontSize: 12, flexShrink: 1 },
  error: { color: '#B42318', fontFamily: fonts.body, fontSize: 14, lineHeight: 22 },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { flex: 1, fontFamily: fonts.displayBold, fontSize: 19, color: colors.foreground },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.muted },
})
