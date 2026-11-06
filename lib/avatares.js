// En React Native las imágenes locales se cargan con require(), no con rutas string.
// Guardamos solo la "clave" ('rosa', 'carlos', 'ana') y acá la convertimos en imagen.
const avatars = {
  ana: require('../assets/avatars/ana.png'),
  carlos: require('../assets/avatars/carlos.png'),
  rosa: require('../assets/avatars/rosa.png'),
  luna: require('../assets/avatars/luna.png'),
  mar: require('../assets/avatars/mar.png'),
  sol: require('../assets/avatars/sol.png'),
  rio: require('../assets/avatars/rio.png'),
}

export function getAvatar(key) {
  return avatars[key] ?? avatars.ana
}
