import * as mqttModule from 'mqtt/dist/mqtt'

const mqtt = mqttModule.connect
  ? mqttModule
  : mqttModule.default?.connect
  ? mqttModule.default
  : mqttModule.default?.default

console.log('mqtt exports:', Object.keys(mqttModule), 'connect?', typeof mqtt?.connect)


const HOST = '10.56.31.11'
const PORT = 9001 
const USER = 'admin'
const PASS = 'albornozit'
const BROKER_URL = `ws://${HOST}:${PORT}`

const client = mqtt.connect(BROKER_URL, {
  clientId: 'app-' + Math.random().toString(16).slice(2, 8),
  username: USER,
  password: PASS,
  clean: true,
  keepalive: 30,
  connectTimeout: 8000,
  reconnectPeriod: 3000,
})

client.on('connect', () => {
  console.log('Conectado al broker')
  client.subscribe('/escucha', (err) => {
    if (err) console.log('Error al suscribir:', err.message)
  })
})

client.on('message', (topic, payload) => {
  console.log('Recibido en', topic, ':', payload.toString())
})

client.on('reconnect', () => console.log('Reconectando…'))
client.on('close', () => console.log('Conexión cerrada'))
client.on('error', (err) => console.log('Error:', err.message))

export function enviar(topic, mensaje) {
  if (!client.connected) {
    console.log('No hay conexión')
    return false
  }
  client.publish(topic, String(mensaje))
  console.log('Enviado a', topic, ':', mensaje)
  return true
}