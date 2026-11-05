import { useEffect } from 'react'
import { Alert, AppState } from 'react-native'
import { consultarAlertas } from '../lib/alertas'
import { obtenerSesion } from '../lib/sesion'

// Vigila los nuevos SOS solo mientras la app está abierta y activa.
export function VigilanteAlertas() {
  useEffect(() => {
    let montado = true
    let ocupado = false
    let cuenta = null
    let vistos = new Set()

    async function revisar() {
      if (!montado || ocupado || AppState.currentState !== 'active') return
      ocupado = true
      try {
        const sesion = await obtenerSesion()
        if (!sesion) {
          cuenta = null
          vistos = new Set()
          return
        }
        const resultado = await consultarAlertas({ cantidad: 30 })
        if (!montado || AppState.currentState !== 'active') return

        // Al empezar o cambiar de cuenta, lo anterior queda en el historial.
        if (cuenta !== resultado.usuarioId) {
          cuenta = resultado.usuarioId
          vistos = new Set(resultado.items.map(item => item.id))
          if (resultado.items.length > 0) {
            Alert.alert('Historial de alertas', 'Hay pedidos de ayuda registrados. Revisá la pestaña Alertas.')
          }
          return
        }

        const nuevas = resultado.items.filter(item => !vistos.has(item.id))
        resultado.items.forEach(item => vistos.add(item.id))
        if (nuevas.length > 0) {
          const ultima = nuevas[0]
          const texto = ultima.persona
            ? `${ultima.persona} pidió ayuda.`
            : 'Se registró un pedido de ayuda.'
          const extra = nuevas.length > 1 ? `\nHay ${nuevas.length} alertas nuevas.` : ''
          Alert.alert('Alerta SOS', `${texto}${extra}\nRevisá la pestaña Alertas.`)
        }
      } catch (_) {
        // El historial muestra un error si PocketBase no responde.
        // No se marca una alerta como vista cuando falla la consulta.
      } finally {
        ocupado = false
      }
    }

    revisar()
    const intervalo = setInterval(revisar, 5000)
    const cambio = AppState.addEventListener('change', estado => {
      if (estado === 'active') revisar()
    })
    return () => {
      montado = false
      clearInterval(intervalo)
      cambio.remove()
    }
  }, [])
  return null
}
