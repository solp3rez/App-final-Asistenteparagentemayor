import { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Eye, EyeOff } from 'lucide-react-native'
import { colors, fonts } from '../lib/tema'
import { Button } from '../components/ui/boton'
import { TextField } from '../components/ui/campo-texto'
import { ScreenHeader } from '../components/encabezado-pantalla'
import { confirmarRecuperacion, solicitarRecuperacion } from '../lib/conexion-pocketbase'
import { validarCorreo } from '../lib/validaciones-cuenta'

const ESPERA_REENVIO = 60

export default function RecuperarContrasenaPage() {
  const router = useRouter()
  const [paso, setPaso] = useState('correo') // 'correo' | 'codigo' | 'listo'
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [password, setPassword] = useState('')
  const [repetir, setRepetir] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [espera, setEspera] = useState(0)
  const accionRef = useRef(false)

  useEffect(() => {
    if (espera <= 0) return
    const timer = setTimeout(() => setEspera((n) => Math.max(0, n - 1)), 1000)
    return () => clearTimeout(timer)
  }, [espera])

  async function pedirCodigo() {
    if (accionRef.current || espera > 0) return
    setError('')
    const problema = validarCorreo(email)
    if (problema) {
      setError(problema)
      return
    }
    accionRef.current = true
    setCargando(true)
    try {
      await solicitarRecuperacion(email)
      setEspera(ESPERA_REENVIO)
      setAviso('Si el correo está registrado, te enviamos un mensaje con un código. Revisá Entrada y Spam; puede demorar.')
      setPaso('codigo')
    } catch (e) {
      setError(e.status === 429
        ? 'Hay demasiadas solicitudes. Esperá un momento antes de volver a pedir el código.'
        : e.message || 'No pudimos enviar el correo. Probá de nuevo.')
    } finally {
      accionRef.current = false
      setCargando(false)
    }
  }

  async function cambiarContrasena() {
    if (accionRef.current) return
    setError('')
    if (!codigo.trim()) return setError('Pegá el código que recibiste por correo.')
    if (password.length < 8) return setError('La contraseña nueva debe tener al menos 8 caracteres.')
    if (password !== repetir) return setError('Las contraseñas no coinciden.')
    accionRef.current = true
    setCargando(true)
    try {
      await confirmarRecuperacion(codigo, password, repetir)
      setPaso('listo')
    } catch (e) {
      if (e.status === 400) {
        const detalle = e.details || {}
        if (detalle.token) setError('El código no es válido o ya venció. Pedí uno nuevo.')
        else if (detalle.password) setError(detalle.password.message || 'La contraseña no cumple los requisitos.')
        else setError('No se pudo cambiar la contraseña. Revisá los datos e intentá de nuevo.')
      } else {
        setError(e.message || 'No se pudo cambiar la contraseña.')
      }
    } finally {
      accionRef.current = false
      setCargando(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Recuperar contraseña" subtitle="Te ayudamos a volver a entrar" backHref="/iniciar-sesion" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        {paso === 'correo' ? (
          <View style={{ gap: 16 }}>
            <Text style={styles.body}>Escribí el correo con el que creaste tu cuenta. Te enviaremos un código para elegir una contraseña nueva.</Text>
            <View>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextField accessibilityLabel="Correo electrónico" value={email}
                onChangeText={(v) => { setEmail(v); setError('') }} editable={!cargando}
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                autoComplete="email" textContentType="emailAddress" placeholder="ana@gmail.com"
                error={Boolean(error)} />
            </View>
            {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.errorText}>{error}</Text> : null}
            <Button label={cargando ? 'Enviando…' : 'Enviar código'} onPress={pedirCodigo} disabled={cargando} />
          </View>
        ) : null}

        {paso === 'codigo' ? (
          <View style={{ gap: 16 }}>
            {aviso ? <Text accessibilityLiveRegion="polite" style={styles.body}>{aviso}</Text> : null}
            <View>
              <Text style={styles.label}>Código recibido por correo</Text>
              <TextField accessibilityLabel="Código recibido por correo" value={codigo}
                onChangeText={(v) => { setCodigo(v); setError('') }} editable={!cargando}
                autoCapitalize="none" autoCorrect={false} placeholder="Pegá el código acá" />
            </View>
            <View>
              <Text style={styles.label}>Contraseña nueva</Text>
              <View>
                <TextField accessibilityLabel="Contraseña nueva" value={password}
                  onChangeText={(v) => { setPassword(v); setError('') }} editable={!cargando}
                  secureTextEntry={!verPassword} autoCapitalize="none" autoCorrect={false}
                  autoComplete="new-password" textContentType="newPassword"
                  placeholder="Al menos 8 caracteres" style={{ paddingRight: 48 }} />
                <Pressable accessibilityRole="button" accessibilityLabel={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onPress={() => setVerPassword((v) => !v)} style={styles.eye} hitSlop={8}>
                  {verPassword ? <EyeOff size={20} color={colors.mutedForeground} /> : <Eye size={20} color={colors.mutedForeground} />}
                </Pressable>
              </View>
            </View>
            <View>
              <Text style={styles.label}>Repetí la contraseña nueva</Text>
              <TextField accessibilityLabel="Repetir contraseña nueva" value={repetir}
                onChangeText={(v) => { setRepetir(v); setError('') }} editable={!cargando}
                secureTextEntry={!verPassword} autoCapitalize="none" autoCorrect={false}
                autoComplete="new-password" textContentType="newPassword" placeholder="Escribila otra vez" />
            </View>
            {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.errorText}>{error}</Text> : null}
            <Button label={cargando ? 'Guardando…' : 'Cambiar contraseña'} onPress={cambiarContrasena} disabled={cargando} />
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: cargando || espera > 0 }}
              disabled={cargando || espera > 0} onPress={pedirCodigo}
              style={[styles.reenviar, (cargando || espera > 0) && { opacity: 0.55 }]}>
              <Text style={styles.link}>{espera > 0 ? `Podés pedir otro código en ${espera} s` : 'Enviar otro código'}</Text>
            </Pressable>
          </View>
        ) : null}

        {paso === 'listo' ? (
          <View style={{ gap: 16 }}>
            <Text accessibilityLiveRegion="polite" style={styles.titulo}>¡Listo!</Text>
            <Text style={styles.body}>Cambiamos tu contraseña. Ya podés iniciar sesión con la nueva.</Text>
            <Button label="Ir a iniciar sesión" onPress={() => router.replace('/iniciar-sesion')} />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  label: { marginBottom: 8, fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.foreground },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.mutedForeground },
  titulo: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.foreground },
  errorText: { color: '#FF0000', fontFamily: fonts.bodySemibold, fontSize: 14, lineHeight: 21 },
  link: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.primary },
  eye: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  reenviar: { minHeight: 44, justifyContent: 'center', alignSelf: 'center' },
})
