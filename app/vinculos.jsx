import { useCallback, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { ScreenHeader } from '../components/encabezado-pantalla'
import { getLinkedPerson } from '../lib/persona'
import { getAvatar } from '../lib/avatares'
import { colors, fonts, cardStyle, radius } from '../lib/tema'
export default function Vinculos() {
 const router=useRouter(); const [persona,setPersona]=useState(null); const [error,setError]=useState(''); const [cargando,setCargando]=useState(true)
 useFocusEffect(useCallback(() => { let activo=true; setCargando(true); setError(''); getLinkedPerson().then(p=>{if(activo)setPersona(p)}).catch(()=>{if(activo)setError('No se pudieron cargar los vínculos. Revisá tu conexión.')}).finally(()=>{if(activo)setCargando(false)}); return ()=>{activo=false} },[]))
 return <View style={{flex:1,backgroundColor:colors.background}}><ScreenHeader title="Tus vínculos" subtitle="Personas que acompañás" />
 <View style={{padding:20,gap:16}}>{cargando ? <Text>Cargando...</Text> : error ? <Text accessibilityRole="alert">{error}</Text> : persona ?
 <Pressable accessibilityRole="button" onPress={()=>router.push('/chat')} style={{...cardStyle,borderRadius:radius['2xl'],padding:18,flexDirection:'row',alignItems:'center',gap:14}}><Image source={getAvatar(persona.avatar)} style={{width:55,height:55,borderRadius:28}}/><View><Text style={{fontFamily:fonts.displaySemibold,color:colors.foreground,fontSize:17}}>{persona.name}</Text><Text style={{color:colors.mutedForeground}}>Ver conversación ›</Text></View></Pressable>
 : <Text>No hay personas vinculadas todavía. Podés empezar desde Inicio.</Text>}</View></View>
}