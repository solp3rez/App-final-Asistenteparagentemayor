import { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Eye, EyeOff } from 'lucide-react-native'
import { colors, fonts } from '../lib/tema'
import { Button } from '../components/ui/boton'
import { TextField } from '../components/ui/campo-texto'
import { ScreenHeader } from '../components/encabezado-pantalla'
import { iniciarSesion, solicitarVerificacion } from '../lib/conexion-pocketbase'
import { validarAcceso, validarCorreo } from '../lib/validaciones-cuenta'

const ERROR_CREDENCIALES = 'El correo o la contraseña son incorrectos. Vuelve a intentarlo.'

// En esta pantalla, un correo escrito con formato incorrecto usa el mismo
// mensaje de credenciales. El formulario de registro conserva su explicación.
function validarDatos(email, password) {
  const errores = validarAcceso({ email, password })
  if (email.trim() && errores.email) errores.email = true
  return errores
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errores, setErrores] = useState({})
  const [tocados, setTocados] = useState({})
  const [intento, setIntento] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [mostrarAyuda, setMostrarAyuda] = useState(false)
  const [mensajeVerificacion, setMensajeVerificacion] = useState('')
  const [errorCorreo, setErrorCorreo] = useState('')
  const [enviandoCorreo, setEnviandoCorreo] = useState(false)
  const [espera, setEspera] = useState(0)
  const accionRef = useRef(false)
  const ocupado = loading || enviandoCorreo
  const mensajeError = error || ((errores.email === true || errores.password === true) ? ERROR_CREDENCIALES : '')

  useEffect(() => {
    if (espera <= 0) return
    const timer = setTimeout(() => setEspera((n) => Math.max(0, n - 1)), 1000)
    return () => clearTimeout(timer)
  }, [espera])

  function cambiar(campo, valor) {
    if (campo === 'email') {
      setEmail(valor)
      setMensajeVerificacion('')
      setAviso('')
      setErrorCorreo('')
    } else setPassword(valor)
    setError('')
    if (intento || tocados[campo] || errores[campo]) {
      const nuevos = validarDatos(campo === 'email' ? valor : email, campo === 'password' ? valor : password)
      setErrores((actuales) => ({ ...actuales, [campo]: nuevos[campo] || '' }))
    }
  }

  function revisar(campo) {
    setTocados((actuales) => ({ ...actuales, [campo]: true }))
    const nuevos = validarDatos(email, password)
    setErrores((actuales) => ({ ...actuales, [campo]: nuevos[campo] || '' }))
  }

  async function handleReenviar() {
    if (accionRef.current || espera > 0) return
    const correoError = validarCorreo(email)
    if (correoError) {
      setErrores((actuales) => ({ ...actuales, email: email.trim() ? true : correoError }))
      setErrorCorreo('Escribí un correo válido en el campo de arriba.')
      return
    }
    accionRef.current = true
    setEnviandoCorreo(true)
    setErrorCorreo('')
    setAviso('')
    setEspera(60)
    try {
      await solicitarVerificacion(email)
      setAviso('Si la cuenta existe y todavía no está verificada, solicitamos un enlace. Revisá Entrada y Spam; puede demorar.')
    } catch (e) {
      setErrorCorreo(e.status === 429
        ? 'Hay demasiadas solicitudes. Esperá antes de volver a pedir el correo.'
        : 'No pudimos solicitar el enlace. Revisá la conexión y probá de nuevo más tarde.')
    } finally {
      accionRef.current = false
      setEnviandoCorreo(false)
    }
  }

  async function handleLogin() {
    if (accionRef.current) return
    setIntento(true)
    setError('')
    setAviso('')
    setMensajeVerificacion('')
    setErrorCorreo('')
    const nuevos = validarDatos(email, password)
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return
    accionRef.current = true
    setLoading(true)
    try {
      await iniciarSesion(email, password)
      router.replace('/inicio')
    } catch (e) {
      if (e.code === 'CORREO_NO_VERIFICADO') {
        setMostrarAyuda(true)
        setMensajeVerificacion('Tu correo todavía necesita confirmación. Abrí el enlace recibido o pedí uno nuevo acá.')
      } else if (e.status === 403) {
        setError('No se pudo autorizar el ingreso. Si te falta verificar el correo, podés pedir el enlace abajo.')
        setMostrarAyuda(true)
      } else if (e.status === 400) {
        // El servidor no indica cuál de las dos credenciales es incorrecta.
        setErrores({ email: true, password: true })
        setError(ERROR_CREDENCIALES)
      } else {
        setError(e.status === 429 ? 'Hay demasiados intentos. Esperá un momento y volvé a probar.' : e.message || 'No se pudo iniciar sesión.')
      }
    } finally {
      accionRef.current = false
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Iniciar sesión" subtitle="Qué bueno tenerte de vuelta" backHref="/" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={{ gap: 20 }}>
          <View>
            <Text style={[styles.label, errores.email ? { color: '#FF0000' } : null]}>Correo electrónico</Text>
            <TextField accessibilityLabel="Correo electrónico" value={email} onChangeText={(v) => cambiar('email', v)}
              onBlur={() => revisar('email')} error={errores.email} editable={!ocupado} keyboardType="email-address"
              autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" placeholder="ana@gmail.com" />
            {typeof errores.email === 'string' && errores.email ? <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: '#FF0000' }]}>{errores.email}</Text> : null}
          </View>
          <View>
            <Text style={[styles.label, errores.password ? { color: '#f31919' } : null]}>Contraseña</Text>
            <View>
              <TextField accessibilityLabel="Contraseña" value={password} onChangeText={(v) => cambiar('password', v)}
                onBlur={() => revisar('password')} error={errores.password} editable={!ocupado} secureTextEntry={!showPassword}
                autoCapitalize="none" autoCorrect={false} autoComplete="current-password" textContentType="password"
                placeholder="Tu contraseña de Cerca" style={{ paddingRight: 48 }} />
              <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onPress={() => setShowPassword((v) => !v)} style={styles.eye} hitSlop={8}>
                {showPassword ? <EyeOff size={20} color={colors.mutedForeground} /> : <Eye size={20} color={colors.mutedForeground} />}
              </Pressable>
            </View>
            {typeof errores.password === 'string' && errores.password ? <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: '#FF0000' }]}>{errores.password}</Text> : null}
            <Pressable accessibilityRole="link" disabled={ocupado} hitSlop={8}
              onPress={() => router.push('/recuperar-contrasena')} style={styles.forgotLink}>
              <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </View>
        </View>
        <View style={{ marginTop: 26, gap: 14 }}>
          {mensajeError ? (
            <Text
              testID="mensaje-error-inicio-sesion"
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              style={{ color: '#FF0000', fontSize: 15, lineHeight: 22, fontFamily: fonts.bodySemibold }}
            >
              {mensajeError}
            </Text>
          ) : null}
          <Button label={loading ? 'Ingresando…' : 'Iniciar sesión'} onPress={handleLogin} disabled={ocupado} height={52} radius={32} fontSize={16} />
          <Text style={styles.footer}>¿Todavía no tenés cuenta?{' '}
            <Text accessibilityRole="link" style={styles.link} onPress={() => { if (!ocupado) router.push('/registro') }}>Crear cuenta</Text>
          </Text>
        </View>
        <View style={styles.helpSection}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: mostrarAyuda, disabled: ocupado }}
            disabled={ocupado} onPress={() => setMostrarAyuda((actual) => !actual)} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>{mostrarAyuda ? 'Ocultar ayuda de verificación' : '¿No recibiste el correo de verificación?'}</Text>
          </Pressable>
          {mostrarAyuda ? (
            <View style={styles.helpCard}>
              <Text style={styles.helpTitle}>Confirmá tu correo</Text>
              <Text style={styles.helpBody}>{mensajeVerificacion || 'Usaremos el correo que escribiste arriba. Si ya creaste tu cuenta, podés pedir otro enlace sin registrarte otra vez.'}</Text>
              {aviso ? <Text accessibilityLiveRegion="polite" style={styles.helpBody}>{aviso}</Text> : null}
              {errorCorreo ? <Text accessibilityRole="alert" style={[styles.errorText, { color: '#FF0000' }]}>{errorCorreo}</Text> : null}
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: ocupado || espera > 0 }}
                disabled={ocupado || espera > 0} onPress={handleReenviar}
                style={({ pressed }) => [styles.resendLink, (ocupado || espera > 0 || pressed) && { opacity: 0.55 }]}>
                <Text style={styles.link}>{enviandoCorreo ? 'Solicitando enlace…' : espera > 0 ? `Podés pedir otro enlace en ${espera} s` : 'Enviar enlace de verificación'}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  label: { marginBottom: 8, fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.foreground },
  eye: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  errorText: { marginTop: 6, color: '#FF0000', fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  footer: { textAlign: 'center', fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.mutedForeground },
  link: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.primary },
  forgotLink: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-end' },
  helpSection: { marginTop: 28, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  helpLink: { minHeight: 44, justifyContent: 'center', alignSelf: 'center', paddingVertical: 8 },
  helpLinkText: { textAlign: 'center', fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.mutedForeground },
  helpCard: { marginTop: 8, padding: 16, borderRadius: 18, backgroundColor: colors.secondary, gap: 10 },
  helpTitle: { fontFamily: fonts.bodySemibold, color: colors.foreground, fontSize: 14 },
  helpBody: { fontFamily: fonts.body, color: colors.mutedForeground, fontSize: 13, lineHeight: 21 },
  resendLink: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
})
