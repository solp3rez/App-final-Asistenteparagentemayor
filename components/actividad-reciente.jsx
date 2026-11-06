import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from './ui/boton'
import { colors, fonts } from '../lib/tema'
export function RecentActivity() {
 const router=useRouter()
 return <View style={{gap:12}}><Text style={{fontFamily:fonts.displaySemibold,fontSize:16,color:colors.foreground}}>Actividad reciente</Text><Text style={{color:colors.mutedForeground}}>Mirá los mensajes y alertas de tu vínculo en una conversación.</Text><Button label="Ver historial completo" variant="secondary" onPress={()=>router.push('/chat')}/></View>
}
