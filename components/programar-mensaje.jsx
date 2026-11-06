import { useCallback, useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, StyleSheet } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts, radius } from '../lib/tema'
import { getLinkedPerson } from '../lib/persona'
import { crearIdMensaje } from '../lib/mensajes'
import { ErrorSesion, exigirSesion } from '../lib/sesion'
import { fechaProgramadaValida, guardarProgramado } from '../lib/programados-pocketbase'
import { Button } from './ui/boton'
import { TextField } from './ui/campo-texto'
import { DateTimeField } from './ui/campo-fecha-hora'
import { ScreenHeader } from './encabezado-pantalla'

export function ProgramarMensaje() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [persona, setPersona] = useState(null)
  const [usuarioId, setUsuarioId] = useState('')
  const [texto, setTexto] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [guardado, setGuardado] = useState(false)
  const ocupado = useRef(false)
  const intento = useRef(null)
  const montado = useRef(true)
  const contexto = useRef('')

  useEffect(() => { montado.current = true; return () => { montado.current = false } }, [])
  useFocusEffect(useCallback(() => {
    let activo = true
    setCargando(true)
    setPersona(null)
    setUsuarioId('')
    setError('')
    async function cargar() {
      try {
        const sesion = await exigirSesion()
        const vinculada = await getLinkedPerson()
        const actual = await exigirSesion()
        if (actual.usuarioId !== sesion.usuarioId) throw new ErrorSesion()
        if (!activo) return
        const clave = `${sesion.usuarioId}:${vinculada?.id || ''}`
        if (contexto.current && contexto.current !== clave) {
          setTexto(''); setFecha(''); setHora(''); setGuardado(false); intento.current = null
        }
        contexto.current = clave
        setUsuarioId(sesion.usuarioId)
        setPersona(vinculada)
      } catch (e) {
        if (!activo) return
        if (e instanceof ErrorSesion) router.replace('/iniciar-sesion')
        else setError('No se pudo consultar la persona vinculada. Volvé a intentar.')
      } finally { if (activo) setCargando(false) }
    }
    cargar()
    return () => { activo = false }
  }, [router]))

  async function guardar() {
    if (ocupado.current || !persona || !usuarioId) return
    const limpio = texto.trim()
    if (!limpio || limpio.length > 200) { setError('Escribí un mensaje de hasta 200 caracteres.'); return }
    if (!fechaProgramadaValida(fecha, hora)) { setError('Elegí un día y una hora futuros.'); return }
    ocupado.current = true; setGuardando(true); setError('')
    try {
      const sesion = await exigirSesion()
      if (sesion.usuarioId !== usuarioId) throw new ErrorSesion()
      const clave = JSON.stringify([usuarioId, persona.id, limpio, fecha, hora])
      if (intento.current?.clave !== clave) intento.current = { clave, id: crearIdMensaje() }
      await guardarProgramado({ id: intento.current.id, texto: limpio, date: fecha, time: hora, personaId: persona.id })
      if (montado.current) setGuardado(true)
    } catch (e) {
      if (!montado.current) return
      if (e instanceof ErrorSesion) router.replace('/iniciar-sesion')
      else setError(e.status === 403 ? 'PocketBase no permite guardar el recordatorio. Revisá las reglas.' :
        e.message || 'No se pudo confirmar el guardado. Revisá el historial antes de repetir.')
    } finally { ocupado.current = false; if (montado.current) setGuardando(false) }
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Programar mensaje" subtitle="Una sola vez" backHref="/inicio" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 16 }} keyboardShouldPersistTaps="handled">
        {guardado ? (
          <>
            <Text style={styles.title}>Recordatorio guardado</Text>
            <Text style={styles.body}>Quedó programado para la fecha y hora elegidas.</Text>
            <Button label="Ver conversación" onPress={() => router.replace('/chat')} />
          </>
        ) : (
          <>
            {cargando ? <Text style={styles.body}>Buscando persona vinculada...</Text> : null}
            {!cargando && !error && !persona ? <Text style={styles.body}>Primero vinculá una persona mayor desde Inicio.</Text> : null}
            {!cargando && persona ? (
              <>
                <Text style={styles.body}>Para: {persona.name || 'tu persona vinculada'}</Text>
                <Text style={styles.label}>Mensaje</Text>
                <TextField value={texto} onChangeText={setTexto} editable={!guardando} multiline numberOfLines={4} maxLength={200} placeholder="Escribí tu mensaje..." />
                <Text style={styles.label}>Día</Text>
                <DateTimeField mode="date" value={fecha} onChange={setFecha} accessibilityLabel="Elegir día" />
                <Text style={styles.label}>Hora</Text>
                <DateTimeField mode="time" value={hora} onChange={setHora} accessibilityLabel="Elegir hora" />
                <Text style={styles.body}>Se guarda para una sola vez. Usá la hora de tu celular.</Text>
                <Text style={styles.body}>Si el servidor está apagado a esa hora, el mensaje no se enviará después.</Text>
                <Button label={guardando ? 'Guardando...' : 'Guardar recordatorio'} onPress={guardar} disabled={guardando || !texto.trim()} />
              </>
            ) : null}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.displayBold, color: colors.foreground, fontSize: 20 },
  label: { fontFamily: fonts.bodySemibold, color: colors.foreground, fontSize: 14 },
  body: { fontFamily: fonts.body, color: colors.mutedForeground, fontSize: 14 },
  error: { fontFamily: fonts.body, color: '#B42318', fontSize: 14 },
})
