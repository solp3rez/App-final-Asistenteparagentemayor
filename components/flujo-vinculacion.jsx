import { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Speaker, Check } from 'lucide-react-native'
import { colors, fonts, radius, cardStyle } from '../lib/tema'
import { getAvatar } from '../lib/avatares'
import { IconBox } from './ui/caja-icono'

// Son claves de dibujos locales, no personas ya registradas.
const avatarOptions = ['rosa', 'carlos', 'ana']

// Conservamos el nombre y las propiedades que usa la pantalla de inicio.
export function LinkFlow({ onCancel, onComplete }) {
  const insets = useSafeAreaInsets()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const savingRef = useRef(false)

  async function savePerson() {
    if (savingRef.current) return
    const cleanName = name.trim()
    if (!cleanName) {
      setError('Escribí el nombre de la persona que va a usar el parlante.')
      return
    }

    savingRef.current = true
    setSaving(true)
    setError('')
    try {
      // El inicio guarda en PocketBase. No hacemos un segundo guardado acá.
      // Esto guarda el perfil; NO detecta ni conecta físicamente el parlante.
      await onComplete({ name: cleanName, relation: '', avatar })
    } catch (err) {
      setError('No se pudieron guardar los datos. Revisá la conexión y volvé a intentar.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          accessibilityState={{ disabled: saving }}
          disabled={saving}
          onPress={onCancel}
          style={[styles.back, saving && styles.disabled]}
        >
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </Pressable>
        <Text style={styles.headerTitle}>Configurar mi parlante</Text>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        <View style={styles.intro}>
          <IconBox size={80} radius={radius['3xl']} bg={colors.accent}>
            <Speaker size={40} color={colors.accentForeground} />
          </IconBox>
          <Text style={styles.title}>¿Quién va a usar el parlante?</Text>
          <Text style={styles.description}>
            Escribí su nombre para reconocer a quién enviás los mensajes.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre de la persona mayor</Text>
          <TextInput
            accessibilityLabel="Nombre de la persona mayor"
            value={name}
            onChangeText={(value) => {
              setName(value)
              if (error) setError('')
            }}
            editable={!saving}
            placeholder="Escribí su nombre"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={savePerson}
            style={styles.input}
          />

          <Text style={[styles.label, styles.avatarLabel]}>Imagen (opcional)</Text>
          <Text style={styles.help}>
            Elegí un dibujo. Si no elegís ninguno, se usa la imagen predeterminada.
          </Text>
          <View style={styles.avatarRow}>
            {avatarOptions.map((key, index) => {
              const selected = avatar === key
              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={`Imagen ${index + 1}`}
                  accessibilityState={{ selected, disabled: saving }}
                  disabled={saving}
                  onPress={() => setAvatar(selected ? '' : key)}
                  style={[styles.avatarChoice, selected && styles.avatarSelected]}
                >
                  <Image source={getAvatar(key)} style={styles.avatar} />
                  {selected && (
                    <View style={styles.check}>
                      <Check size={14} color={colors.primaryForeground} />
                    </View>
                  )}
                </Pressable>
              )
            })}
          </View>
        </View>

        <Text style={styles.connectionNote}>
          Este paso guarda los datos de la persona. La conexión con el parlante se comprueba por separado.
        </Text>
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: saving, busy: saving }}
          disabled={saving}
          onPress={savePerson}
          style={({ pressed }) => [
            styles.primaryBtn,
            saving && styles.disabled,
            pressed && !saving && styles.pressed,
          ]}
        >
          {saving && <ActivityIndicator size="small" color={colors.primaryForeground} />}
          <Text style={styles.primaryBtnText}>{saving ? 'Guardando…' : 'Guardar datos'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 16 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.foreground, flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20 },
  intro: { alignItems: 'center', paddingTop: 12, marginBottom: 24 },
  title: { marginTop: 20, fontFamily: fonts.displayBold, fontSize: 22, color: colors.foreground, textAlign: 'center' },
  description: { marginTop: 8, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.mutedForeground, textAlign: 'center' },
  card: { ...cardStyle, borderRadius: radius['3xl'], padding: 18 },
  label: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.foreground },
  input: { marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radius['2xl'], paddingHorizontal: 14, paddingVertical: 13, fontFamily: fonts.body, fontSize: 16, color: colors.foreground, backgroundColor: colors.background },
  avatarLabel: { marginTop: 24 },
  help: { marginTop: 6, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.mutedForeground },
  avatarRow: { flexDirection: 'row', gap: 16, marginTop: 14, flexWrap: 'wrap' },
  avatarChoice: { padding: 4, borderWidth: 2, borderColor: colors.border, borderRadius: radius['2xl'] },
  avatarSelected: { borderColor: colors.primary, backgroundColor: colors.accent },
  avatar: { width: 56, height: 56, borderRadius: radius['2xl'] },
  check: { position: 'absolute', right: -4, top: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  connectionNote: { marginTop: 18, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.mutedForeground },
  error: { marginTop: 16, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: '#B42318' },
  primaryBtn: { marginTop: 24, width: '100%', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 24, paddingVertical: 16 },
  primaryBtnText: { fontFamily: fonts.displaySemibold, fontSize: 16, color: colors.primaryForeground },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.98 }] },
})
