// Estas comprobaciones ayudan a corregir el formulario. El servidor valida de nuevo.
// El formato de un correo no demuestra que exista: eso lo comprueba el enlace.
export function validarCorreo(email = '') {
  if (!email.trim()) return 'Ingresá tu correo electrónico.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Escribí un correo válido, por ejemplo ana@gmail.com.'
  return ''
}

export function obtenerRelacion(valores) {
  return valores.relacion === 'Otro' ? valores.otroRelacion.trim() : valores.relacion
}

export function validarRegistro(valores) {
  const errores = {}
  if (!valores.nombre.trim()) errores.nombre = 'Ingresá tu nombre.'
  const correo = validarCorreo(valores.email)
  if (correo) errores.email = correo
  const telefono = valores.telefono.trim()
  const digitos = telefono.replace(/\D/g, '')
  if (!telefono) errores.telefono = 'Ingresá tu teléfono.'
  else if (!/^\+?[\d\s().-]+$/.test(telefono) || digitos.length < 7 || digitos.length > 15) {
    errores.telefono = 'Usá entre 7 y 15 números. Podés incluir +, espacios, paréntesis o guiones.'
  }
  if (!valores.password) errores.password = 'Elegí una contraseña para Cerca.'
  else if (valores.password.length < 8) errores.password = 'La contraseña debe tener al menos 8 caracteres.'
  if (!['Hijo/a', 'Nieto/a', 'Sobrino/a', 'Cuidador/a', 'Otro'].includes(valores.relacion)) {
    errores.relacion = 'Elegí tu vínculo con la persona mayor.'
  }
  if (valores.relacion === 'Otro' && !valores.otroRelacion.trim()) {
    errores.otroRelacion = 'Contanos qué vínculo tenés con la persona mayor.'
  }
  if (valores.relacion === 'Otro' && valores.otroRelacion.trim().length > 60) {
    errores.otroRelacion = 'Describí el vínculo en hasta 60 caracteres.'
  }
  if (!valores.accepted) errores.accepted = 'Aceptá los términos para crear la cuenta.'
  return errores
}

export function validarAcceso(valores) {
  const errores = {}
  const correo = validarCorreo(valores.email)
  if (correo) errores.email = correo
  // No imponemos un mínimo nuevo al entrar: PocketBase comprueba la contraseña real.
  if (!valores.password) errores.password = 'Ingresá tu contraseña de Cerca.'
  return errores
}
