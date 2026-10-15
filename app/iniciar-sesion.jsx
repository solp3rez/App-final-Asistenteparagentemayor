import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Eye, EyeOff } from 'lucide-react-native'
import { colors, fonts } from '../lib/tema'
import { Button } from '../components/ui/boton'
import { TextField } from '../components/ui/campo-texto'
import { ScreenHeader } from '../components/encabezado-pantalla'

const POCKETBASE_URL = 'http://10.56.2.22:8090'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Ingresá tu correo y contraseña.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        `${POCKETBASE_URL}/api/collections/users/auth-with-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: email.trim().toLowerCase(),
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          response.status === 400
            ? 'El correo o la contraseña son incorrectos.'
            : 'No se pudo iniciar sesión. Revisá la conexión con PocketBase.'
        )
        return
      }

      router.replace('/inicio')
    } catch (e) {
      console.error('Error al iniciar sesión:', e)
      setError('No se pudo conectar con PocketBase. Revisá que esté encendido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader
        title="Iniciar sesión"
        subtitle="Ingresá a tu cuenta de Cerca"
        backHref="/"
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={{ gap: 18 }}>
          <View>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextField
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="ana@ejemplo.com"
            />
          </View>

          <View>
            <Text style={styles.label}>Contraseña</Text>
            <View>
              <TextField
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                placeholder="Tu contraseña"
                style={{ paddingRight: 48 }}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onPress={() => setShowPassword(v => !v)}
                style={styles.eye}
                hitSlop={8}
              >
                {showPassword
                  ? <EyeOff size={20} color={colors.mutedForeground} />
                  : <Eye size={20} color={colors.mutedForeground} />}
              </Pressable>
            </View>
          </View>
        </View>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <View style={{ marginTop: 24, gap: 14 }}>
          <Button
            label={loading ? 'Ingresando...' : 'Iniciar sesión'}
            onPress={handleLogin}
            disabled={loading}
            height={52}
            radius={32}
            fontSize={16}
          />

          <Text style={styles.footer}>
            ¿Todavía no tenés cuenta?{' '}
            <Text
              style={styles.link}
              onPress={() => router.push('/registro')}
            >
              Crear cuenta
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  label: {
    marginBottom: 8,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.foreground,
  },
  eye: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  error: {
    marginTop: 16,
    color: '#B42318',
    fontSize: 14,
  },
  footer: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedForeground,
  },
  link: {
    fontFamily: fonts.bodySemibold,
    color: colors.primary,
  },
})
