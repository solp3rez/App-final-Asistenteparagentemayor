import { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Eye, EyeOff, Check, Mail } from 'lucide-react-native'
import { colors, fonts } from '../lib/tema'
import { Button } from './ui/boton'
import { TextField } from './ui/campo-texto'
import { ScreenHeader } from './encabezado-pantalla'
import { pbRequest, solicitarVerificacion } from '../lib/conexion-pocketbase'
import { obtenerRelacion, validarRegistro } from '../lib/validaciones-cuenta'

const relaciones = ['Hijo/a', 'Nieto/a', 'Sobrino/a', 'Cuidador/a', 'Otro']
const inicial = { nombre: '', email: '', telefono: '', password: '', relacion: '', otroRelacion: '', accepted: false }

export function RegisterForm() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [valores, setValores] = useState(inicial)
  const [errores, setErrores] = useState({})
  const [tocados, setTocados] = useState({})
  const [intento, setIntento] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [correoCreado, setCorreoCreado] = useState('')
  const [enviandoCorreo, setEnviandoCorreo] = useState(false)
  const [aviso, setAviso] = useState('')
  const [espera, setEspera] = useState(0)
  const submitRef = useRef(false)
  const envioRef = useRef(false)

  useEffect(() => {
    if (espera <= 0) return
    const timer = setTimeout(() => setEspera((n) => Math.max(0, n - 1)), 1000)
    return () => clearTimeout(timer)
  }, [espera])

  function cambiar(campo, valor) {
    const siguientes = { ...valores, [campo]: valor }
    setValores((actuales) => ({ ...actuales, [campo]: valor }))
    setError('')
    const nuevos = validarRegistro(siguientes)
    if (intento || tocados[campo] || errores[campo]) {
      setErrores((actuales) => ({ ...actuales, [campo]: nuevos[campo] || '' }))
    }
    if (campo === 'relacion' && valor !== 'Otro') {
      setErrores((actuales) => ({ ...actuales, otroRelacion: '' }))
    }
  }

  function revisar(campo) {
    setTocados((actuales) => ({ ...actuales, [campo]: true }))
    const nuevos = validarRegistro(valores)
    setErrores((actuales) => ({ ...actuales, [campo]: nuevos[campo] || '' }))
  }

  async function enviarCorreo(correo) {
    if (envioRef.current || espera > 0) return
    envioRef.current = true
    setEnviandoCorreo(true)
    setError('')
    setAviso('')
    setEspera(60)
    try {
      await solicitarVerificacion(correo)
      setAviso('Solicitamos el correo. Revisá Entrada y Spam; la entrega puede demorar unos minutos.')
    } catch (e) {
      setError(e.status === 429
        ? 'Hay demasiadas solicitudes. Esperá antes de volver a pedir el correo.'
        : 'Tu cuenta ya está creada. No pudimos confirmar el envío: esperá y pedí otro enlace, sin volver a registrarte.')
    } finally {
      envioRef.current = false
      setEnviandoCorreo(false)
    }
  }

  async function handleSubmit() {
    if (submitRef.current || loading || correoCreado) return
    setIntento(true)
    setError('')
    const nuevos = validarRegistro(valores)
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return
    submitRef.current = true
    setLoading(true)
    try {
      const correo = valores.email.trim().toLowerCase()
      await pbRequest('usuarios', {
        method: 'POST',
        body: {
          email: correo,
          password: valores.password,
          passwordConfirm: valores.password,
          nombre: valores.nombre.trim(),
          telefono: valores.telefono.trim(),
          relacion: obtenerRelacion(valores),
        },
      })
      setCorreoCreado(correo)
      setValores((actuales) => ({ ...actuales, password: '' }))
      await enviarCorreo(correo)
    } catch (e) {
      const datos = e.details || {}
      const campos = {}
      if (datos.email) campos.email = 'No se pudo usar este correo. Revisalo; si ya tenés cuenta, andá a Iniciar sesión.'
      if (datos.password || datos.passwordConfirm) campos.password = 'La contraseña no cumple los requisitos del servidor. Revisala.'
      if (datos.nombre) campos.nombre = 'Revisá el nombre ingresado.'
      if (datos.telefono) campos.telefono = 'Revisá el teléfono ingresado.'
      if (datos.relacion) campos[valores.relacion === 'Otro' ? 'otroRelacion' : 'relacion'] = 'Revisá el vínculo ingresado.'
      setErrores(campos)
      setError(Object.keys(campos).length
        ? 'Revisá los datos marcados en rojo.'
        : e.status === 429
          ? 'Hay demasiados intentos. Esperá un momento y volvé a probar.'
          : 'No pudimos confirmar la creación de la cuenta. Revisá la conexión. Si ya se creó, usá Iniciar sesión para pedir la verificación.')
    } finally {
      submitRef.current = false
      setLoading(false)
    }
  }

  if (correoCreado) {
    return (
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title="Revisá tu correo" subtitle="Solo falta confirmar tu dirección" backHref="/iniciar-sesion" />
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 32, gap: 20 }}>
          <View style={styles.mailIcon}><Mail size={34} color={colors.primary} /></View>
          <View style={{ gap: 10 }}>
            <Text style={styles.confirmTitle}>Tu cuenta ya está creada</Text>
            <Text style={styles.body}>Pedimos un enlace de verificación para:</Text>
            <Text selectable style={styles.emailAddress}>{correoCreado}</Text>
            <Text style={styles.body}>Abrí el correo y confirmá tu dirección. Después volvé a Cerca para iniciar sesión.</Text>
          </View>
          {enviandoCorreo ? <Text accessibilityLiveRegion="polite" style={styles.note}>Solicitando el correo…</Text> : null}
          {aviso ? <Text accessibilityLiveRegion="polite" style={styles.note}>{aviso}</Text> : null}
          {error ? <Text accessibilityRole="alert" style={[styles.errorText, { color: '#B42318' }]}>{error}</Text> : null}
          <Button label="Ir a iniciar sesión" onPress={() => router.replace('/iniciar-sesion')}
            disabled={loading || enviandoCorreo} height={52} radius={32} fontSize={16} />
          <View style={styles.resendSection}>
            <Text style={styles.note}>¿No lo encontrás? Revisá también Spam.</Text>
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: enviandoCorreo || espera > 0 }}
              disabled={enviandoCorreo || espera > 0} onPress={() => enviarCorreo(correoCreado)}
              style={({ pressed }) => [styles.textButton, (enviandoCorreo || espera > 0 || pressed) && { opacity: 0.55 }]}>
              <Text style={styles.link}>{enviandoCorreo ? 'Solicitando…' : espera > 0 ? `Podés pedir otro enlace en ${espera} s` : 'Enviar otro enlace'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Crear cuenta" subtitle="Empezá a acompañar con Cerca" backHref="/" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 32 }}>
        <View style={{ gap: 18 }}>
          <Field label="Nombre completo" error={errores.nombre}>
            <TextField accessibilityLabel="Nombre completo" value={valores.nombre} onChangeText={(v) => cambiar('nombre', v)}
              onBlur={() => revisar('nombre')} error={errores.nombre} editable={!loading}
              autoComplete="name" textContentType="name" placeholder="Ana García" />
          </Field>
          <Field label="Correo electrónico" error={errores.email}>
            <TextField accessibilityLabel="Correo electrónico" value={valores.email} onChangeText={(v) => cambiar('email', v)}
              onBlur={() => revisar('email')} error={errores.email} editable={!loading} keyboardType="email-address"
              autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" placeholder="ana@gmail.com" />
          </Field>
          <Field label="Teléfono" error={errores.telefono}>
            <TextField accessibilityLabel="Teléfono" value={valores.telefono} onChangeText={(v) => cambiar('telefono', v)}
              onBlur={() => revisar('telefono')} error={errores.telefono} editable={!loading} keyboardType="phone-pad"
              autoComplete="tel" textContentType="telephoneNumber" placeholder="+54 11 5555 5555" />
          </Field>
          <View>
            <Text style={[styles.label, errores.relacion ? { color: '#B42318' } : null]}>¿Qué vínculo tenés con la persona mayor?</Text>
            <View style={styles.chips}>
              {relaciones.map((r) => {
                const active = valores.relacion === r
                return (
                  <Pressable key={r} accessibilityRole="button" accessibilityState={{ selected: active, disabled: loading }}
                    disabled={loading} onPress={() => cambiar('relacion', r)}
                    style={[styles.chip, errores.relacion && { borderColor: '#B42318' }, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                    <Text style={[styles.chipText, { color: active ? colors.primaryForeground : colors.secondaryForeground }]}>{r}</Text>
                  </Pressable>
                )
              })}
            </View>
            {errores.relacion ? <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: '#B42318' }]}>{errores.relacion}</Text> : null}
          </View>
          {valores.relacion === 'Otro' ? (
            <Field label="Escribí tu vínculo" error={errores.otroRelacion}>
              <TextField accessibilityLabel="Escribí tu vínculo" value={valores.otroRelacion} onChangeText={(v) => cambiar('otroRelacion', v)}
                onBlur={() => revisar('otroRelacion')} error={errores.otroRelacion} editable={!loading} maxLength={60}
                autoCapitalize="sentences" placeholder="Por ejemplo: hermana, vecino o amiga" />
            </Field>
          ) : null}
          <Field label="Contraseña" error={errores.password} hint="Elegí una contraseña para Cerca de al menos 8 caracteres.">
            <View>
              <TextField accessibilityLabel="Contraseña" value={valores.password} onChangeText={(v) => cambiar('password', v)}
                onBlur={() => revisar('password')} error={errores.password} editable={!loading} secureTextEntry={!showPassword}
                autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword"
                placeholder="Creá tu contraseña" style={{ paddingRight: 48 }} />
              <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onPress={() => setShowPassword((v) => !v)} hitSlop={8} style={styles.eye}>
                {showPassword ? <EyeOff size={20} color={colors.mutedForeground} /> : <Eye size={20} color={colors.mutedForeground} />}
              </Pressable>
            </View>
          </Field>
          <View>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: valores.accepted, disabled: loading }}
              disabled={loading} onPress={() => cambiar('accepted', !valores.accepted)} style={styles.terms}>
              <View style={[styles.checkbox, errores.accepted && { borderColor: '#B42318' }, valores.accepted && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                {valores.accepted && <Check size={16} color={colors.primaryForeground} />}
              </View>
              <Text style={styles.termsText}>Acepto los términos de uso y la política de privacidad de Cerca.</Text>
            </Pressable>
            {errores.accepted ? <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: '#B42318' }]}>{errores.accepted}</Text> : null}
          </View>
        </View>
        <View style={{ marginTop: 24, gap: 14 }}>
          {error ? <Text accessibilityRole="alert" style={[styles.errorText, { color: '#B42318' }]}>{error}</Text> : null}
          <Button label={loading ? 'Creando cuenta…' : 'Crear cuenta'} onPress={handleSubmit} disabled={loading} height={52} radius={32} fontSize={16} />
          <Text style={styles.footer}>¿Ya tenés cuenta?{' '}
            <Text accessibilityRole="link" style={styles.link} onPress={() => { if (!loading) router.push('/iniciar-sesion') }}>Iniciar sesión</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({ label, error, hint, children }) {
  return <View>
    <Text style={[styles.label, error ? { color: '#B42318' } : null]}>{label}</Text>
    {children}
    {error ? <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: '#B42318' }]}>{error}</Text>
      : hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  label: { marginBottom: 8, fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.foreground },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 14 },
  eye: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  terms: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingTop: 4 },
  checkbox: { marginTop: 2, width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  termsText: { flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.mutedForeground },
  errorText: { marginTop: 6, fontFamily: fonts.body, color: '#B42318', fontSize: 13, lineHeight: 19 },
  hint: { marginTop: 6, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.mutedForeground },
  footer: { textAlign: 'center', fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.mutedForeground },
  link: { fontFamily: fonts.bodySemibold, color: colors.primary, fontSize: 14 },
  mailIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  confirmTitle: { fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 30, color: colors.foreground },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.foreground },
  emailAddress: { fontFamily: fonts.bodySemibold, fontSize: 16, lineHeight: 24, color: colors.primary },
  note: { fontFamily: fonts.body, color: colors.mutedForeground, fontSize: 13, lineHeight: 21 },
  resendSection: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 18, gap: 4 },
  textButton: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
})
