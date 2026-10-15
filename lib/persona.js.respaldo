import AsyncStorage from '@react-native-async-storage/async-storage'

const PERSON_KEY = 'cerca:linked-person'

// { name, relation, avatar }  (avatar = clave: 'rosa' | 'carlos' | 'ana')
export async function getLinkedPerson() {
  try {
    const saved = await AsyncStorage.getItem(PERSON_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export async function saveLinkedPerson(person) {
  try {
    await AsyncStorage.setItem(PERSON_KEY, JSON.stringify(person))
  } catch {
    // ignorar errores de persistencia
  }
}

export async function clearLinkedPerson() {
  try {
    await AsyncStorage.removeItem(PERSON_KEY)
  } catch {
    // ignorar errores de persistencia
  }
}
