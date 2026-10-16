import { useCallback, useEffect, useRef, useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Check, Clock, Type } from 'lucide-react-native'
import { colors, fonts, radius, alpha } from '../lib/tema'
import { getAvatar } from '../lib/avatares'
import { getLinkedPerson } from '../lib/persona'
import { crearIdMensaje, guardarMensajeDirecto } from '../lib/mensajes'
import { ErrorSesion, exigirSesion } from '../lib/sesion'
import { Button } from './ui/boton'
import { TextField } from './ui/campo-texto'
import { IconBox } from './ui/caja-icono'
import { ScreenHeader } from './encabezado-pantalla'

const quickPhrases = [
  'Hola, ¿cómo estás hoy?',
  'Acordate de tomar la pastilla.',
  'Te llamo en un ratito.',
  'Te quiero mucho.',
]

export function MessageCompose() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [person, setPerson] = useState(null)
  const [usuarioId, setUsuarioId] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(null)
  const [retry, setRetry] = useState(0)
  const savingRef = useRef(false)
  const attemptRef = useRef(null)
  const contextRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useFocusEffect(useCallback(() => {
    let active = true
    setLoading(true)
    setLoadError('')
    setSaveError('')
    setPerson(null)
    async function cargar() {
      try {
        const sesion = await exigirSesion()
        const linked = await getLinkedPerson()
        if (!active) return
        // No conservar un texto de otra cuenta en una pantalla reutilizada.
        const key = `${sesion.usuarioId}:${linked?.id || ''}`
        if (contextRef.current && contextRef.current !== key) {
          setMessage('')
          setSaved(null)
          attemptRef.current = null
        }
        contextRef.current = key
        setUsuarioId(sesion.usuarioId)
        setPerson(linked)
      } catch (error) {
        if (!active) return
        if (error instanceof ErrorSesion) router.replace('/iniciar-sesion')
        else setLoadError(error.message || 'No se pudo consultar la persona de tu cuenta.')
      } finally {
        if (active) setLoading(false)
      }
    }
    cargar()
    return () => { active = false }
  }, [retry, router]))

  async function handleSubmit() {
    const texto = message.trim()
    if (savingRef.current || !person || !usuarioId || !texto || texto.length > 200) return
    savingRef.current = true
    setSaving(true)
    setSaveError('')
    try {
      const sesion = await exigirSesion()
      if (sesion.usuarioId !== usuarioId) throw new ErrorSesion()
      const key = JSON.stringify([usuarioId, person.id, texto])
      if (attemptRef.current?.key !== key) attemptRef.current = { key, id: crearIdMensaje() }
      const record = await guardarMensajeDirecto({ id: attemptRef.current.id, texto, personaId: person.id })
      if (mountedRef.current) setSaved(record)
    } catch (error) {
      if (!mountedRef.current) return
      if (error instanceof ErrorSesion) router.replace('/iniciar-sesion')
      else setSaveError(
        error.status === 403
          ? 'PocketBase no permite esta operación. Revisá las reglas de la colección mensajes.'
          : error.message || 'No se pudo confirmar el guardado. Intentá nuevamente sin cambiar el texto.'
      )
    } finally {
      savingRef.current = false
      if (mountedRef.current) setSaving(false)
    }
  }

  if (saved && !loading && !loadError && person) {
    return (
      <View style={styles.result}>
        <IconBox size={80} radius={40} bg={alpha(colors.ok, 0.15)}>
          <Check size={40} color={colors.ok} />
        </IconBox>
        <Text style={styles.resultTitle}>Mensaje guardado</Text>
        <Text style={styles.resultText}>El mensaje para {person?.name || 'tu persona vinculada'} quedó guardado en PocketBase.</Text>
        <View style={styles.notice}>
          <Clock size={20} color={colors.primary} />
          <Text style={styles.noticeText}>Estado: pendiente de envío. Todavía no se envió por MQTT ni se confirmó su reproducción.</Text>
        </View>
        <Button label="Volver al inicio" onPress={() => router.replace('/inicio')} style={{ width: '100%' }} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Preparar mensaje" subtitle="Texto directo para tu persona vinculada" backHref="/inicio" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 24, gap: 20 }}>
        {loading ? <Text style={styles.body}>Cargando persona vinculada...</Text> : null}
        {loadError ? (
          <View style={styles.card}>
            <Text accessibilityRole="alert" style={styles.error}>{loadError}</Text>
            <Button label="Volver a intentar" onPress={() => setRetry(value => value + 1)} />
          </View>
        ) : null}
        {!loading && !loadError && !person ? (
          <View style={styles.card}>
            <Text style={styles.body}>Primero agregá una persona mayor a tu cuenta desde Inicio.</Text>
            <Button label="Ir al inicio" onPress={() => router.replace('/inicio')} />
          </View>
        ) : null}
        {!loading && !loadError && person ? (
          <>
            <View>
              <Text style={styles.label}>Para</Text>
              <View style={styles.person}>
                <Image source={getAvatar(person.avatar)} style={styles.avatar} accessibilityLabel={`Imagen de ${person.name}`} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.personName}>{person.name}</Text>
                  {person.relation ? <Text style={styles.body}>{person.relation}</Text> : null}
                </View>
                <Type size={20} color={colors.primary} />
              </View>
            </View>
            <View>
              <Text style={styles.label}>¿Qué mensaje querés guardar?</Text>
              <TextField value={message} onChangeText={setMessage} editable={!saving} multiline numberOfLines={4} maxLength={200} textAlignVertical="top" placeholder="Escribí tu mensaje..." style={{ minHeight: 110 }} />
              <Text style={styles.counter}>{message.length}/200 caracteres</Text>
              <View style={styles.chips}>
                {quickPhrases.map(phrase => (
                  <Pressable key={phrase} accessibilityRole="button" disabled={saving} onPress={() => setMessage(phrase)} style={styles.phrase}>
                    <Text style={styles.phraseText}>{phrase}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.notice}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.noticeText}>En este paso guardamos texto directo como pendiente. El envío por MQTT, los audios y la programación se conectarán después.</Text>
            </View>
            {saveError ? <Text accessibilityRole="alert" style={styles.error}>{saveError}</Text> : null}
            <Button label={saving ? 'Guardando...' : 'Guardar mensaje'} onPress={handleSubmit} disabled={saving || !message.trim() || message.trim().length > 200} />
          </>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  label: { fontFamily: fonts.bodySemibold, color: colors.foreground, fontSize: 14, marginBottom: 8 },
  body: { fontFamily: fonts.body, color: colors.mutedForeground, fontSize: 14, lineHeight: 22 },
  card: { gap: 16, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radius['2xl'] },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, borderRadius: radius['2xl'] },
  avatar: { width: 48, height: 48, borderRadius: radius.xl },
  personName: { fontFamily: fonts.displaySemibold, fontSize: 16, color: colors.foreground },
  counter: { marginTop: 6, textAlign: 'right', color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 12 },
  chips: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  phrase: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, borderRadius: 999 },
  phraseText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.secondaryForeground },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 16, backgroundColor: alpha(colors.primary, 0.1), borderRadius: radius['2xl'] },
  noticeText: { flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.primary },
  error: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: '#B42318' },
  result: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20, paddingHorizontal: 24, backgroundColor: colors.background },
  resultTitle: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.foreground, textAlign: 'center' },
  resultText: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.mutedForeground, textAlign: 'center' },
})
