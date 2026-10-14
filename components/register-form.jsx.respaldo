import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Eye, EyeOff, Check } from 'lucide-react-native'
import { colors, fonts } from '../lib/theme'
import { Button } from './ui/button'
import { TextField } from './ui/text-field'
import { ScreenHeader } from './screen-header'

const relaciones = ['Hijo/a', 'Nieto/a', 'Sobrino/a', 'Cuidador/a', 'Otro']

export function RegisterForm() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [relacion, setRelacion] = useState('')
  const [accepted, setAccepted] = useState(false)

  // En la web esto lo validaba el navegador (required / minLength); acá lo hacemos a mano
  const valid =
    nombre.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email.trim()) &&
    telefono.trim().length > 0 &&
    password.length >= 8 &&
    accepted &&
    !!relacion

  function handleSubmit() {
    if (!valid) return
    router.replace('/home')
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Crear cuenta" subtitle="Configurá tu perfil de cuidador" backHref="/" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={{ gap: 16 }}>
          <Field label="Nombre completo">
            <TextField
              value={nombre}
              onChangeText={setNombre}
              autoComplete="name"
              textContentType="name"
              placeholder="Ana García"
            />
          </Field>

          <Field label="Correo electrónico">
            <TextField
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="ana@ejemplo.com"
            />
          </Field>

          <Field label="Teléfono">
            <TextField
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              placeholder="+54 11 5555 5555"
            />
          </Field>

          <View>
            <Text style={styles.label}>¿Cuál es tu vínculo?</Text>
            <View style={styles.chips}>
              {relaciones.map((r) => {
                const active = relacion === r
                return (
                  <Pressable
                    key={r}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setRelacion(r)}
                    style={[
                      styles.chip,
                      active && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? colors.primaryForeground : colors.secondaryForeground },
                      ]}
                    >
                      {r}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          <Field label="Contraseña">
            <View>
              <TextField
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                placeholder="Mínimo 8 caracteres"
                style={{ paddingRight: 48 }}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
                style={styles.eye}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.mutedForeground} />
                ) : (
                  <Eye size={20} color={colors.mutedForeground} />
                )}
              </Pressable>
            </View>
          </Field>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: accepted }}
            onPress={() => setAccepted((v) => !v)}
            style={styles.terms}
          >
            <View
              style={[
                styles.checkbox,
                accepted && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              {accepted && <Check size={16} color={colors.primaryForeground} />}
            </View>
            <Text style={styles.termsText}>
              Acepto los términos de uso y la política de privacidad de Cerca.
            </Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 24, gap: 12 }}>
          <Button
            label="Crear cuenta"
            onPress={handleSubmit}
            disabled={!valid}
            height={52}
            radius={32}
            fontSize={16}
          />
          <Text style={styles.login}>
            ¿Ya tenés cuenta?{' '}
            <Text style={styles.loginLink} onPress={() => router.push('/home')}>
              Iniciar sesión
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({ label, children }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  label: { marginBottom: 8, fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.foreground },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 14 },
  eye: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  terms: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingTop: 4 },
  checkbox: {
    marginTop: 2,
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 23,
    color: colors.mutedForeground,
  },
  login: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedForeground,
  },
  loginLink: { fontFamily: fonts.bodySemibold, color: colors.primary },
})
