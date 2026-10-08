import { Image, Pressable, Text, View, StyleSheet } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { colors, fonts, radius, cardStyle } from '../lib/theme'
import { getAvatar } from '../lib/avatars'

// Person = { name, relation, avatar (clave), status: 'ok' | 'waiting' | 'help' }
const defaultPeople = [
  { name: 'Rosa', relation: 'Mamá', avatar: 'rosa', status: 'help' },
  { name: 'Carlos', relation: 'Papá', avatar: 'carlos', status: 'ok' },
]

const statusMeta = {
  ok: { label: 'Todo bien', color: colors.ok },
  waiting: { label: 'Esperando respuesta', color: colors.primary },
  help: { label: '¡Ayuda!', color: colors.warn },
}

export function LinkedPeople({ people = defaultPeople }) {
  return (
    <View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Tus vínculos</Text>
        <Pressable accessibilityRole="button">
          <Text style={styles.link}>Ver todos</Text>
        </Pressable>
      </View>

      <View style={{ gap: 12 }}>
        {people.map((person) => {
          const meta = statusMeta[person.status]
          return (
            <Pressable
              key={person.name}
              accessibilityRole="button"
              style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.99 }] }]}
            >
              <View>
                <Image
                  source={getAvatar(person.avatar)}
                  accessibilityLabel={`Foto de ${person.name}`}
                  style={styles.avatar}
                />
                <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{person.name}</Text>
                <Text style={styles.relation}>{person.relation}</Text>
                <Text style={[styles.status, { color: meta.color }]}>{meta.label}</Text>
              </View>
              <ChevronRight size={20} color={colors.mutedForeground} />
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontFamily: fonts.displaySemibold, fontSize: 16, color: colors.foreground },
  link: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.primary },
  card: {
    ...cardStyle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius['3xl'],
    padding: 12,
  },
  avatar: { width: 52, height: 52, borderRadius: radius['2xl'] },
  statusDot: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.card,
  },
  name: { fontFamily: fonts.displaySemibold, fontSize: 14, color: colors.foreground },
  relation: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedForeground },
  status: { marginTop: 4, fontFamily: fonts.bodyMedium, fontSize: 12 },
})
