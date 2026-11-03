import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { Check, Mail, Speaker } from 'lucide-react-native'
import { colors, fonts, radius } from '../lib/tema'
import { Button } from '../components/ui/boton'
import { TextField } from '../components/ui/campo-texto'
import { IconBox } from '../components/ui/caja-icono'
import { ScreenHeader } from '../components/encabezado-pantalla'
import {
  confirmarCodigoParlante, getLinkedSpeaker, linkSpeaker, normalizarCodigo, normalizarIdentificador,
  pedirCodigoParlante, unlinkSpeaker, validarCodigo, validarIdentificador,
} from '../lib/parlante'
import { ErrorSesion } from '../lib/sesion'

const ESPERA_REENVIO = 60

const PASOS = [
  'Enchufá el parlante y esperá a que encienda.',
  'Buscá el identificador en la etiqueta del parlante. Se ve así: CERCA-001.',
  'Escribilo acá abajo y tocá Continuar.',
]

export default function VincularParlantePage() {
  const router = useRouter()
  // 'cargando' | 'error' | 'formulario' (falta el identificador) | 'codigo' (falta confirmar) | 'activo'
  const [vista, setVista] = useState('cargando')
  const [parlante, setParlante] = useState(null)
  const [identificador, setIdentificador] = useState('')
  const [codigo, setCodigo] = useState('')
  const [correo, setCorreo] = useState('')
  const [mostrarCodigo, setMostrarCodigo] = useState(false)
  const [error, setError] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const [espera, setEspera] = useState(0)
  const [reintento, setReintento] = useState(0)
  const [recienActivado, setRecienActivado] = useState(false)
  const accionRef = useRef(false)

  useEffect(() => {
    if (espera <= 0) return
    const timer = setTimeout(() => setEspera((n) => Math.max(0, n - 1)), 1000)
    return () => clearTimeout(timer)
  }, [espera])

  useFocusEffect(
    useCallback(() => {
      let activo = true
      setVista('cargando')
      setError('')
      async function cargar() {
        try {
          const actual = await getLinkedSpeaker()
          if (!activo) return
          setParlante(actual)
          setVista(!actual ? 'formulario' : actual.activo ? 'activo' : 'codigo')
        } catch (e) {
          if (!activo) return
          if (e instanceof ErrorSesion) return router.replace('/iniciar-sesion')
          setError(e.message || 'No se pudo consultar tu parlante.')
          setVista('error')
        }
      }
      cargar()
      return () => { activo = false }
    }, [reintento, router]),
  )

  // Todas las acciones comparten el mismo candado para que un doble toque no mande dos pedidos.
  async function ejecutar(accion) {
    if (accionRef.current) return
    accionRef.current = true
    setTrabajando(true)
    setError('')
    try {
      await accion()
    } catch (e) {
      if (e instanceof ErrorSesion) return router.replace('/iniciar-sesion')
      setError(e.status === 429 && !e.message ? 'Hay demasiados intentos. Esperá un momento.' : e.message || 'Algo salió mal. Probá de nuevo.')
      return e
    } finally {
      accionRef.current = false
      setTrabajando(false)
    }
  }

  function vincular() {
    const limpio = normalizarIdentificador(identificador)
    const problema = validarIdentificador(limpio)
    if (problema) return setError(problema)
    return ejecutar(async () => {
      const guardado = await linkSpeaker(limpio)
      setParlante(guardado)
      setVista('codigo')
    })
  }

  function mandarCodigo() {
    if (espera > 0) return
    return ejecutar(async () => {
      try {
        const respuesta = await pedirCodigoParlante()
        setCorreo(respuesta?.correo || '')
        setCodigo('')
        setEspera(ESPERA_REENVIO)
        setMostrarCodigo(true)
      } catch (e) {
        // Si ya se mandó uno hace menos de un minuto, ese código sigue sirviendo.
        if (e.status === 429) setMostrarCodigo(true)
        throw e
      }
    })
  }

  function confirmar() {
    const limpio = normalizarCodigo(codigo)
    const problema = validarCodigo(limpio)
    if (problema) return setError(problema)
    return ejecutar(async () => {
      await confirmarCodigoParlante(limpio)
      setParlante((actual) => ({ ...actual, activo: true }))
      setRecienActivado(true)
      setVista('activo')
    })
  }

  function confirmarDesvinculacion() {
    Alert.alert(
      'Desvincular parlante',
      `¿Querés desvincular ${parlante?.identificador}? Se desactiva y dejará de recibir tus mensajes hasta que lo vincules y lo actives otra vez.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Desvincular', style: 'destructive', onPress: desvincular },
      ],
    )
  }

  function desvincular() {
    return ejecutar(async () => {
      await unlinkSpeaker(parlante?.id)
      setParlante(null)
      setIdentificador('')
      setCodigo('')
      setMostrarCodigo(false)
      setEspera(0)
      setRecienActivado(false)
      setVista('formulario')
    })
  }

  const paso = vista === 'formulario' ? 'Paso 2 de 3 · Tu parlante' : vista === 'codigo' ? 'Paso 3 de 3 · Confirmá tu correo' : ''

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Vincular parlante" subtitle="Conectá el parlante de casa con tu cuenta" backHref="/inicio" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        {paso ? <Text style={styles.paso}>{paso}</Text> : null}

        {vista === 'cargando' ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Cargando" />
          </View>
        ) : null}

        {vista === 'error' ? (
          <View style={{ gap: 16 }}>
            <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>
            <Button label="Volver a intentar" onPress={() => setReintento((n) => n + 1)} />
          </View>
        ) : null}

        {vista === 'formulario' ? (
          <View style={{ gap: 20 }}>
            <View style={styles.pasos}>
              {PASOS.map((texto, i) => (
                <View key={texto} style={styles.pasoFila}>
                  <View style={styles.numero}><Text style={styles.numeroTexto}>{i + 1}</Text></View>
                  <Text style={styles.pasoTexto}>{texto}</Text>
                </View>
              ))}
            </View>
            <View>
              <Text style={styles.label}>Identificador del parlante</Text>
              <TextField accessibilityLabel="Identificador del parlante" value={identificador}
                onChangeText={(v) => { setIdentificador(v); setError('') }} editable={!trabajando}
                autoCapitalize="characters" autoCorrect={false} maxLength={14} returnKeyType="done"
                onSubmitEditing={vincular} placeholder="CERCA-001" error={Boolean(error)} />
            </View>
            {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.errorText}>{error}</Text> : null}
            <Button label={trabajando ? 'Vinculando…' : 'Continuar'} onPress={vincular} disabled={trabajando} />
          </View>
        ) : null}

        {vista === 'codigo' && parlante ? (
          <View style={{ gap: 20 }}>
            <View style={styles.tarjeta}>
              <IconBox size={56} radius={radius['2xl']} bg={colors.accent}>
                <Mail size={28} color={colors.accentForeground} />
              </IconBox>
              <Text style={styles.titulo}>Activá {parlante.identificador}</Text>
              <Text style={styles.body}>
                Te mandamos un código de 6 números al correo de tu cuenta
                {correo ? ` (${correo})` : ''}. Escribilo acá para habilitar el parlante.
              </Text>
            </View>

            {mostrarCodigo ? (
              <View>
                <Text style={styles.label}>Código del correo</Text>
                <TextField accessibilityLabel="Código del correo" value={codigo}
                  onChangeText={(v) => { setCodigo(normalizarCodigo(v).slice(0, 6)); setError('') }}
                  editable={!trabajando} keyboardType="number-pad" maxLength={6}
                  autoComplete="one-time-code" textContentType="oneTimeCode" autoCorrect={false}
                  returnKeyType="done" onSubmitEditing={confirmar} placeholder="123456"
                  style={styles.codigoInput} error={Boolean(error)} />
              </View>
            ) : null}

            {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.errorText}>{error}</Text> : null}

            {mostrarCodigo ? (
              <Button label={trabajando ? 'Confirmando…' : 'Confirmar código'} onPress={confirmar}
                disabled={trabajando || normalizarCodigo(codigo).length !== 6} />
            ) : null}
            <Button
              label={trabajando && !mostrarCodigo ? 'Enviando…' : mostrarCodigo
                ? (espera > 0 ? `Podés pedir otro código en ${espera} s` : 'Mandar otro código')
                : 'Mandar código por correo'}
              variant={mostrarCodigo ? 'secondary' : 'default'}
              onPress={mandarCodigo} disabled={trabajando || espera > 0} />
            {!mostrarCodigo ? (
              <Pressable accessibilityRole="button" onPress={() => setMostrarCodigo(true)} style={styles.enlace}>
                <Text style={styles.enlaceTexto}>Ya tengo un código</Text>
              </Pressable>
            ) : null}
            <Text style={styles.nota}>El código vale 10 minutos. Revisá también Spam.</Text>
            <Pressable accessibilityRole="button" disabled={trabajando} onPress={confirmarDesvinculacion} style={styles.enlace}>
              <Text style={styles.enlaceTexto}>No es este parlante, usar otro</Text>
            </Pressable>
          </View>
        ) : null}

        {vista === 'activo' && parlante ? (
          <View style={{ gap: 20 }}>
            <View style={styles.tarjeta}>
              <IconBox size={56} radius={radius['2xl']} bg={recienActivado ? colors.ok : colors.accent}>
                {recienActivado
                  ? <Check size={28} color={colors.okForeground} />
                  : <Speaker size={28} color={colors.accentForeground} />}
              </IconBox>
              <Text accessibilityLiveRegion="polite" style={styles.titulo}>
                {recienActivado ? '¡Parlante activado!' : 'Tu parlante está activo'}
              </Text>
              <Text style={styles.codigo}>{parlante.identificador}</Text>
              <Text style={styles.body}>
                Quedó habilitado para recibir tus mensajes y para enviar pedidos de ayuda.
              </Text>
            </View>
            {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
            <Button label="Volver al inicio" onPress={() => router.replace('/inicio')} disabled={trabajando} />
            <Button label={trabajando ? 'Desvinculando…' : 'Desvincular este parlante'} variant="warn"
              onPress={confirmarDesvinculacion} disabled={trabajando} />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  centro: { paddingVertical: 60, alignItems: 'center' },
  paso: { marginBottom: 14, fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.primary },
  label: { marginBottom: 8, fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.foreground },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.mutedForeground, textAlign: 'center' },
  nota: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.mutedForeground, textAlign: 'center' },
  titulo: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.foreground, textAlign: 'center' },
  codigo: { fontFamily: fonts.displaySemibold, fontSize: 20, letterSpacing: 1, color: colors.primary },
  codigoInput: { fontFamily: fonts.displaySemibold, fontSize: 24, letterSpacing: 8, textAlign: 'center' },
  errorText: { color: '#B42318', fontFamily: fonts.bodySemibold, fontSize: 14, lineHeight: 21 },
  enlace: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  enlaceTexto: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.primary },
  pasos: { gap: 14, backgroundColor: colors.secondary, borderRadius: radius.xl, padding: 18 },
  pasoFila: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  numero: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  numeroTexto: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.primaryForeground },
  pasoTexto: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.foreground },
  tarjeta: { alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: radius['3xl'], borderWidth: 1, borderColor: colors.border, padding: 24 },
})
