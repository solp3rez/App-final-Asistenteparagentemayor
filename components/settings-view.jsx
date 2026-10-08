import { useCallback, useState } from 'react'
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
  UserPlus,
  X,
} from 'lucide-react-native'
import { colors, fonts, radius, alpha, cardStyle } from '../lib/theme'
import { getAvatar } from '../lib/avatars'
import { getLinkedPerson, clearLinkedPerson } from '../lib/person'
import { Button } from './ui/button'
import { IconBox } from './ui/icon-box'
import { ScreenHeader } from './screen-header'

export function SettingsView() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [person, setPerson] = useState(null)
  const [ready, setReady] = useState(false)
  const [confirmUnlink, setConfirmUnlink] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let active = true
      getLinkedPerson().then((p) => {
        if (!active) return
        setPerson(p)
        setReady(true)
      })
      return () => {
        active = false
      }
    }, []),
  )

  async function unlink() {
    await clearLinkedPerson()
    setPerson(null)
    setConfirmUnlink(false)
    router.navigate('/home')
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Ajustes" subtitle="Vínculos y preferencias" backHref="/home" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Persona vinculada */}
        <View>
          <Text style={styles.sectionTitle}>Persona vinculada</Text>
          {ready && person ? (
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
                  label="Cambiar persona"
                  icon={UserPlus}
                  variant="secondary"
                  height={32}
                  radius={radius.xl}
                  fontSize={13}
                  weight="medium"
                  onPress={() => router.navigate('/home')}
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
                  onPress={() => setConfirmUnlink(true)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            ready && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No hay ninguna persona vinculada todavía.</Text>
                <Button
                  label="Vincular ahora"
                  height={32}
                  radius={radius.xl}
                  fontSize={13}
                  weight="medium"
                  onPress={() => router.navigate('/home')}
                  style={{ marginTop: 12, alignSelf: 'center', paddingHorizontal: 20 }}
                />
              </View>
            )
          )}
        </View>

        {/* Preferencias */}
        <View>
          <Text style={styles.sectionTitle}>Preferencias del parlante</Text>
          <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
            <PrefRow icon={Volume2} label="Volumen de reproducción" value="Alto" />
            <PrefRow icon={Bell} label="Notificaciones de alertas" value="Activadas" />
            <PrefRow icon={RefreshCw} label="Reintentar si no hay respuesta" value="2 veces" last />
          </View>
        </View>
      </ScrollView>

      {/* Confirmación de desvinculación */}
      <Modal
        visible={confirmUnlink}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmUnlink(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.sheet, { marginBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>¿Desvincular?</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={() => setConfirmUnlink(false)}
                style={styles.close}
              >
                <X size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <Text style={styles.sheetText}>
              Se desconectará el parlante y ya no podrás enviar mensajes hasta volver a vincular a
              una persona.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <Button
                label="Volver"
                variant="secondary"
                height={36}
                radius={radius.xl}
                fontSize={14}
                weight="medium"
                onPress={() => setConfirmUnlink(false)}
                style={{ flex: 1 }}
              />
              <Button
                label="Sí, desvincular"
                variant="warn"
                height={36}
                radius={radius.xl}
                fontSize={14}
                weight="medium"
                onPress={unlink}
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
