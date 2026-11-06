import AsyncStorage from '@react-native-async-storage/async-storage'
const CLAVES=['ana','carlos','rosa','luna','mar','sol','rio']
export const opcionesPerfil=CLAVES
export async function leerAvatarPerfil(id) { if(!id)return 'ana'; const valor=await AsyncStorage.getItem('cerca.avatar.'+id); return CLAVES.includes(valor)?valor:'ana' }
export async function guardarAvatarPerfil(id,valor) { if(!id||!CLAVES.includes(valor)) throw new Error('No se pudo guardar la imagen.'); await AsyncStorage.setItem('cerca.avatar.'+id,valor) }
