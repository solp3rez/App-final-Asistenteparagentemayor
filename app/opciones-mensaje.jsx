import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { ScreenHeader } from '../components/encabezado-pantalla'
import { Button } from '../components/ui/boton'
import { colors, fonts } from '../lib/tema'
export default function OpcionesMensaje() {
 const router = useRouter()
 return <View style={{flex:1,backgroundColor:colors.background}}><ScreenHeader title="Enviar mensaje" subtitle="Elegí cómo querés enviarlo" />
 <View style={{padding:20,gap:16}}><Text style={{fontFamily:fonts.body,color:colors.mutedForeground}}>Elegí una opción para tu persona vinculada.</Text>
 <Button label="Mensaje directo" onPress={() => router.push('/mensaje')} />
 <Button label="Programar mensaje" variant="secondary" onPress={() => router.push('/programar-mensaje')} />
 <Button label="Ver mensajes programados" variant="ghost" onPress={() => router.push('/programados-lista')} />
 </View></View>
}