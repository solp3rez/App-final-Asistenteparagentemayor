import { useCallback, useRef, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { UserRound } from 'lucide-react-native'
import { colors, fonts, radius, cardStyle } from '../lib/tema'
import { guardarPerfil, urlFotoPerfil, verificarSesion } from '../lib/conexion-pocketbase'
import { ErrorSesion } from '../lib/sesion'
import { Button } from './ui/boton'
import { TextField } from './ui/campo-texto'

export function PerfilFamiliar() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [fotoUrl, setFotoUrl] = useState(null)
  const [fotoNueva, setFotoNueva] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [cargado, setCargado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [reintento, setReintento] = useState(0)
  const guardandoRef = useRef(false)

  useFocusEffect(useCallback(() => {
    let activo = true
    setCargando(true)
    setCargado(false)
    setNombre('')
    setFotoUrl(null)
    setFotoNueva(null)
    setError('')
    setAviso('')
    async function cargar() {
      try {
        const cuenta = await verificarSesion()
        let foto = null
        try { foto = await urlFotoPerfil(cuenta) } catch (e) { if (e instanceof ErrorSesion) throw e }
        if (!activo) return
        setCargado(true)
        setNombre(cuenta.nombre || '')
        setFotoUrl(foto)
      } catch (e) {
        if (!activo) return
        if (e instanceof ErrorSesion) router.replace('/iniciar-sesion')
        else setError(e.message || 'No se pudo cargar tu perfil.')
      } finally { if (activo) setCargando(false) }
    }
    cargar()
    return () => { activo = false }
  }, [router, reintento]))

  async function elegirFoto() {
    try {
      setError('')
      const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      if (resultado.canceled) return
      const foto = resultado.assets[0]
      if (foto.fileSize && foto.fileSize > 5 * 1024 * 1024) throw new Error('La foto debe pesar menos de 5 MB.')
      if (foto.mimeType && !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(foto.mimeType)) throw new Error('Elegí una imagen JPG, PNG, WebP o GIF.')
      setFotoNueva(foto)
      setAviso('')
    } catch (e) { setError(e.message || 'No se pudo elegir la foto.') }
  }

  async function guardar() {
    if (guardandoRef.current) return
    if (!nombre.trim()) { setError('Ingresá tu nombre.'); return }
    guardandoRef.current = true
    setGuardando(true)
    setError('')
    setAviso('')
    try {
      const cuenta = await guardarPerfil(nombre, fotoNueva)
      setNombre(cuenta.nombre || nombre.trim())
      setFotoNueva(null)
      try {
        setFotoUrl(await urlFotoPerfil(cuenta))
        setAviso('Perfil guardado.')
      } catch (e) {
        if (e instanceof ErrorSesion) throw e
        setFotoUrl(null)
        setAviso('Perfil guardado. No se pudo cargar la foto; volvé a intentar más tarde.')
      }
    } catch (e) {
      if (e instanceof ErrorSesion) router.replace('/iniciar-sesion')
      else setError(e.status === 403 ? 'No se pudo guardar. Revisá los permisos de tu cuenta en PocketBase.' : e.message || 'No se pudo guardar el perfil.')
    } finally { guardandoRef.current = false; setGuardando(false) }
  }

  return <View>
    <Text style={styles.titulo}>Mi perfil</Text>
    <View style={styles.card}>
      {cargando ? <Text style={styles.texto}>Cargando tu perfil...</Text> : !cargado ? <>
        <Text accessibilityRole="alert" style={styles.error}>{error || 'No se pudo cargar tu perfil.'}</Text>
        <Button label="Volver a intentar" onPress={() => setReintento(n => n + 1)} style={{ marginTop: 12 }} />
      </> : <>
        <View style={styles.fila}>
          {fotoNueva?.uri || fotoUrl ? <Image source={{ uri: fotoNueva?.uri || fotoUrl }} style={styles.avatar} accessibilityLabel="Tu foto de perfil" /> :
            <View style={[styles.avatar, styles.avatarVacio]}><UserRound size={30} color={colors.primary} /></View>}
          <Pressable onPress={elegirFoto} disabled={guardando} accessibilityRole="button" accessibilityLabel="Elegir foto de perfil" style={styles.elegir}>
            <Text style={styles.enlace}>Elegir foto</Text>
          </Pressable>
        </View>
        <Text style={styles.etiqueta}>Nombre de tu cuenta</Text>
        <TextField accessibilityLabel="Nombre de tu cuenta" value={nombre} onChangeText={setNombre} editable={!guardando} maxLength={255} autoComplete="name" placeholder="Tu nombre" />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {aviso ? <Text accessibilityLiveRegion="polite" style={styles.texto}>{aviso}</Text> : null}
        <Button label={guardando ? 'Guardando...' : 'Guardar perfil'} onPress={guardar} disabled={guardando} style={{ marginTop: 16 }} />
        {error ? <Pressable accessibilityRole="button" onPress={() => setReintento(n => n + 1)} style={{ paddingTop: 12 }}><Text style={styles.enlace}>Volver a cargar el perfil</Text></Pressable> : null}
      </>}
    </View>
  </View>
}

const styles = StyleSheet.create({
  titulo: { marginBottom: 8, fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.foreground },
  card: { ...cardStyle, borderRadius: radius['2xl'], padding: 16 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarVacio: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary },
  elegir: { minHeight: 44, justifyContent: 'center' },
  enlace: { color: colors.primary, fontFamily: fonts.bodySemibold, fontSize: 14 },
  etiqueta: { marginBottom: 8, fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.foreground },
  texto: { marginTop: 8, fontFamily: fonts.body, fontSize: 14, color: colors.mutedForeground },
  error: { marginTop: 8, fontFamily: fonts.body, fontSize: 14, color: '#B42318' },
})
