// En React Native las imágenes locales se cargan con require(), no con rutas string.
// Guardamos solo la "clave" ('rosa', 'carlos', 'ana') y acá la convertimos en imagen.
const avatars = {
  ana: require('../assets/avatars/ana.png'),
  carlos: require('../assets/avatars/carlos.png'),
  rosa: require('../assets/avatars/rosa.png'),
}

export function getAvatar(key) {
  return avatars[key] ?? avatars.ana
}
