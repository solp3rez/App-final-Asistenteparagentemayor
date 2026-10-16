import { useCallback, useEffect, useRef, useState } from 'react'
import { Image, Modal, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Speaker,
  RefreshCw,
  Bell,
  Volume2,
  ChevronRight,
  Unlink,
  X,
} from 'lucide-react-native'
import { colors, fonts, radius, alpha, cardStyle } from '../lib/tema'
import { getAvatar } from '../lib/avatares'
import { getLinkedPerson, clearLinkedPerson } from '../lib/persona'
import { ErrorSesion } from '../lib/sesion'
import { Button } from './ui/boton'
import { IconBox } from './ui/caja-icono'
import { ScreenHeader } from './encabezado-pantalla'

export function SettingsView() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [person, setPerson] = useState(null)
  const [ready, setReady] = useState(false)
  const [confirmUnlink, setConfirmUnlink] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [unlinkError, setUnlinkError] = useState('')
  const [unlinking, setUnlinking] = useState(false)
  const [retry, setRetry] = useState(0)
  const unlinkingRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useFocusEffect(
    useCallback(() => {
      let active = true
      setReady(false)
      setPerson(null)
      setLoadError('')
      getLinkedPerson()
        .then((p) => {
          if (active) setPerson(p)
        })
        .catch((error) => {
          if (!active) return
          if (error instanceof ErrorSesion) {
            router.replace('/iniciar-sesion')
            return
          }
          setLoadError(error.message || 'No se pudo consultar la persona vinculada.')
        })
        .finally(() => { if (active) setReady(true) })
      return () => { active = false }
    }, [retry, router]),
  )

  function openUnlink() {
    setUnlinkError('')
    setConfirmUnlink(true)
  }

  function closeUnlink() {
    if (!unlinkingRef.current) setConfirmUnlink(false)
  }

  async function unlink() {
    if (unlinkingRef.current || !person?.id) return
    unlinkingRef.current = true
    setUnlinking(true)
    setUnlinkError('')
    try {
      await clearLinkedPerson(person.id)
      if (!mountedRef.current) return
      setPerson(null)
      setConfirmUnlink(false)
      router.navigate('/inicio')
    } catch (error) {
      if (!mountedRef.current) return
      if (error instanceof ErrorSesion) {
        setConfirmUnlink(false)
        router.replace('/iniciar-sesion')
        return
      }
      setUnlinkError(
        error.status === 403
          ? 'PocketBase no permite desvincular todavía. Revisá la regla de Actualizar.'
          : error.message || 'No se pudo desvincular. Intentá nuevamente.'
      )
    } finally {
      unlinkingRef.current = false
      if (mountedRef.current) setUnlinking(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Ajustes" subtitle="Vínculos y preferencias" backHref="/inicio" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.sectionTitle}>Persona vinculada</Text>
          {!ready && <Text style={styles.emptyText}>Cargando datos...</Text>}
          {loadError ? (
            <View style={styles.empty}>
              <Text accessibilityRole="alert" style={styles.error}>{loadError}</Text>
              <Button label="Volver a intentar" onPress={() => setRetry(value => value + 1)} style={{ marginTop: 12 }} />
            </View>
          ) : null}
          {ready && !loadError && person ? (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Image source={getAvatar(person.avatar)} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.personName}>{person.name}</Text>
                  <Text style={styles.personRelation}>{person.relation}</Text>
                </View>
                <View style={styles.badge}>
                  <Speaker size={14} color={colors.ok} />
                  <Text style={styles.badgeText}>Vinculado</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <Button
                  label="Ver en Inicio"
                  icon={Speaker}
                  variant="secondary"
                  height={32}
                  radius={radius.xl}
                  fontSize={13}
                  weight="medium"
                  onPress={() => router.navigate('/inicio')}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Desvincular"
                  icon={Unlink}
                  variant="warn"
                  height={32}
                  radius={radius.xl}
                  fontSize={13}
                  weight="medium"
                  onPress={openUnlink}
                  disabled={unlinking}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            ready && !loadError && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No hay ninguna persona vinculada todavía.</Text>
                <Button
                  label="Vincular ahora"
                  height={32}
                  radius={radius.xl}
                  fontSize={13}
                  weight="medium"
                  onPress={() => router.navigate('/inicio')}
                  style={{ marginTop: 12, alignSelf: 'center', paddingHorizontal: 20 }}
                />
              </View>
            )
          )}
        </View>

        {/* Preferencias */}
        <View>
          <Text style={styles.sectionTitle}>Preferencias del parlante — de ejemplo</Text>
          <Text style={[styles.emptyText, { marginBottom: 12 }]}>Estas opciones todavía no modifican el equipo.</Text>
          <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
            <PrefRow icon={Volume2} label="Volumen de reproducción" value="Alto" />
            <PrefRow icon={Bell} label="Notificaciones de alertas" value="Activadas" />
            <PrefRow icon={RefreshCw} label="Reintentar si no hay respuesta" value="2 veces" last />
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={confirmUnlink}
        transparent
        animationType="fade"
        onRequestClose={closeUnlink}
      >
        <View style={styles.overlay}>
          <View style={[styles.sheet, { marginBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>¿Quitar a esta persona de tu cuenta?</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={closeUnlink}
                disabled={unlinking}
                style={styles.close}
              >
                <X size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <Text style={styles.sheetText}>
              Se quitará el vínculo de {person?.name || 'esta persona'} con tu cuenta. Su registro
              se conservará en la base de datos. Esto no apaga ni desconecta físicamente el parlante.
            </Text>
            {unlinkError ? <Text accessibilityRole="alert" style={[styles.error, { marginTop: 12 }]}>{unlinkError}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <Button
                label="Volver"
                variant="secondary"
                height={36}
                radius={radius.xl}
                fontSize={14}
                weight="medium"
                onPress={closeUnlink}
                disabled={unlinking}
                style={{ flex: 1 }}
              />
              <Button
                label={unlinking ? 'Desvinculando...' : 'Sí, desvincular'}
                variant="warn"
                height={36}
                radius={radius.xl}
                fontSize={14}
                weight="medium"
                onPress={unlink}
                disabled={unlinking}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function PrefRow({ icon: Icon, label, value, last }) {
  return (
    <View style={[styles.prefRow, !last && styles.prefDivider]}>
      <IconBox size={36} radius={radius.xl} bg={alpha(colors.primary, 0.1)}>
        <Icon size={20} color={colors.primary} />
      </IconBox>
      <Text style={styles.prefLabel}>{label}</Text>
      <Text style={styles.prefValue}>{value}</Text>
      <ChevronRight size={16} color={colors.mutedForeground} />
    </View>
  )
}

const styles = StyleSheet.create({
  error: { color: '#B42318', fontFamily: fonts.body, fontSize: 14 },
  sectionTitle: {
    marginBottom: 8,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.foreground,
  },
  card: { ...cardStyle, borderRadius: radius['2xl'], padding: 16 },
  avatar: { width: 52, height: 52, borderRadius: radius['2xl'] },
  personName: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.foreground },
  personRelation: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedForeground },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: alpha(colors.ok, 0.15),
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.ok },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: alpha(colors.secondary, 0.5),
    borderRadius: radius['2xl'],
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedForeground,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  prefDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  prefLabel: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.foreground },
  prefValue: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedForeground },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    backgroundColor: alpha(colors.foreground, 0.4),
  },
  sheet: { backgroundColor: colors.card, borderRadius: radius['3xl'], padding: 20 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.foreground },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedForeground,
  },
})
