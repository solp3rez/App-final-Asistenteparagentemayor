import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { ScreenHeader } from '../components/encabezado-pantalla'
import { Button } from '../components/ui/boton'
import { pbRequest } from '../lib/conexion-pocketbase'
import { getLinkedPerson } from '../lib/persona'
import { exigirSesion, ErrorSesion } from '../lib/sesion'
import { colors, fonts, radius, cardStyle } from '../lib/tema'

function fecha(value) { const d=new Date(String(value || '').replace(' ','T')); return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('es-AR') }
export default function Chat() {
 const router=useRouter(); const [person,setPerson]=useState(null); const [items,setItems]=useState([]); const [error,setError]=useState(''); const [loading,setLoading]=useState(true); const [version,setVersion]=useState(0); const [mas,setMas]=useState(false)
 useFocusEffect(useCallback(()=>{let activo=true; setLoading(true); setError(''); setItems([]); setPerson(null)
  async function cargar(){try {const sesion=await exigirSesion(); const p=await getLinkedPerson(); if(!p){if(activo)setPerson(null);return}
   const filter=`familiar = ${JSON.stringify(sesion.usuarioId)} && persona_mayor = ${JSON.stringify(p.id)}`
   const q={filter,sort:'-created,-id',perPage:100}
   const [directos,programados,alertas]=await Promise.all(['mensajes','mensajes_programados','alertas'].map(c=>pbRequest(c,{query:q})))
   const actual=await exigirSesion(); if(actual.usuarioId!==sesion.usuarioId)throw new ErrorSesion()
   for(const r of [directos,programados,alertas]) {if(!Array.isArray(r.items)||r.items.some(x=>x.familiar!==sesion.usuarioId || x.persona_mayor!==p.id))throw new Error('No se pudo verificar el historial de esta cuenta.')}
   const rows=[...directos.items.map(x=>({id:'d'+x.id,tipo:'Mensaje directo',texto:x.texto,fecha:x.created})),...programados.items.map(x=>({id:'p'+x.id,tipo:'Mensaje programado',texto:x.message||x.texto,fecha:x.created,cuando:`${x.date || ''} ${x.time || ''}`})),...alertas.items.map(x=>({id:'a'+x.id,tipo:'Alerta SOS',texto:x.mensaje||'Pedido de ayuda',fecha:x.created}))]
   rows.sort((a,b)=>String(a.fecha||'').localeCompare(String(b.fecha||'')))
   if(activo){setPerson(p);setItems(rows);setMas([directos,programados,alertas].some(x=>x.totalPages>1))}
  } catch(e){if(activo){if(e instanceof ErrorSesion)router.replace('/iniciar-sesion');else setError(e.message||'No se pudo cargar el chat.')}} finally {if(activo)setLoading(false)}}
  cargar();return()=>{activo=false}},[router,version]))
 return <View style={{flex:1,backgroundColor:colors.background}}><ScreenHeader title={person?.name || 'Conversación'} subtitle="Mensajes y alertas" backHref="/vinculos" />
 <View style={{paddingHorizontal:20,paddingVertical:10,flexDirection:'row',gap:8}}><Button label="Mensaje directo" onPress={()=>router.push('/mensaje')} style={{flex:1}} fontSize={13}/><Button label="Programar" variant="secondary" onPress={()=>router.push('/programar-mensaje')} style={{flex:1}} fontSize={13}/></View>
 <ScrollView contentContainerStyle={{padding:20,gap:12,paddingBottom:40}}>{loading?<ActivityIndicator color={colors.primary}/>:null}
 {error?<View><Text accessibilityRole="alert" style={{color:colors.warn}}>{error}</Text><Pressable onPress={()=>setVersion(v=>v+1)}><Text style={{color:colors.primary}}>Volver a intentar</Text></Pressable></View>:null}
 {!loading&&!error&&!person?<Text>Primero vinculá una persona desde Inicio.</Text>:null}
 {!loading&&!error&&person&&items.length===0?<Text>Todavía no hay actividad en esta conversación.</Text>:null}
 {mas?<Text style={{color:colors.mutedForeground}}>Mostrando los 100 registros más recientes de cada tipo.</Text>:null}
 {items.map(item=><View key={item.id} style={{...cardStyle,borderRadius:radius.lg,padding:15,backgroundColor:item.tipo==='Alerta SOS'?'#fff0f0':colors.card}}><Text style={{fontFamily:fonts.bodySemibold,color:item.tipo==='Alerta SOS'?colors.warn:colors.primary}}>{item.tipo}</Text><Text style={{fontFamily:fonts.body,color:colors.foreground,marginTop:7}}>{item.texto || 'Sin texto'}</Text>{item.cuando?<Text style={{color:colors.mutedForeground,marginTop:6}}>Programado: {item.cuando}</Text>:null}<Text style={{color:colors.mutedForeground,marginTop:6,fontSize:12}}>Guardado: {fecha(item.fecha)}</Text></View>)}
 <Pressable accessibilityRole="button" onPress={()=>setVersion(v=>v+1)}><Text style={{color:colors.primary,textAlign:'center',padding:12}}>Actualizar conversación</Text></Pressable>
 </ScrollView></View>
}