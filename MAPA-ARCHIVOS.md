# Mapa de archivos del proyecto Cerca

Este documento sirve para encontrar cada parte de la app. Los nombres `index.jsx` y `_layout.jsx` se mantienen porque Expo Router los usa para la pantalla inicial y la estructura de navegación.

## Pantallas (`app/`)

- `index.jsx`: bienvenida y botones para entrar o crear una cuenta.
- `iniciar-sesion.jsx`: formulario y conexión del inicio de sesión.
- `registro.jsx`: pantalla para crear una cuenta.
- `mensaje.jsx`: pantalla para redactar y enviar o programar un mensaje.
- `(tabs)/inicio.jsx`: pantalla principal después de entrar.
- `(tabs)/programados.jsx`: lista de mensajes programados.
- `(tabs)/alertas.jsx`: pantalla de alertas.
- `(tabs)/ajustes.jsx`: ajustes y vínculos.
- `_layout.jsx` y `(tabs)/_layout.jsx`: configuración de navegación de Expo Router; no renombrar.

## Partes visuales reutilizables (`components/`)

- `aviso-alerta.jsx`: aviso destacado de ayuda.
- `inicio-vacio.jsx`: contenido de inicio cuando todavía no hay una persona vinculada.
- `encabezado-inicio.jsx`: encabezado de la pantalla principal.
- `flujo-vinculacion.jsx`: pasos para vincular a una persona.
- `personas-vinculadas.jsx`: muestra las personas vinculadas.
- `redactar-mensaje.jsx`: formulario para enviar o programar un mensaje.
- `acciones-rapidas.jsx`: accesos rápidos de la pantalla principal.
- `actividad-reciente.jsx`: muestra la actividad reciente; actualmente usa datos de ejemplo.
- `formulario-registro.jsx`: campos y envío del registro de usuario.
- `mensajes-programados.jsx`: muestra, modifica y elimina mensajes programados.
- `encabezado-pantalla.jsx`: encabezado reutilizable de pantallas.
- `vista-ajustes.jsx`: contenido de ajustes.
- `estado-parlante.jsx`: tarjeta con el estado del parlante.
- `ui/boton.jsx`, `ui/campo-fecha-hora.jsx`, `ui/caja-icono.jsx`, `ui/campo-texto.jsx`: controles visuales reutilizables.

## Conexiones y funciones (`lib/`)

- `conexion-pocketbase.js`: solicitudes de la app al servidor PocketBase.
- `conexion-mqtt.js`: conexión MQTT y envío/recepción de mensajes.
- `persona.js`: operaciones de personas vinculadas.
- `recordatorios.js`: operaciones locales de mensajes programados.
- `avatares.js`: selección de imágenes de avatar.
- `estilo-barra-pestanas.js`: estilo de la barra inferior.
- `tema.js`: colores, fuentes y estilos compartidos.

## Importante

Los archivos `.respaldo` son copias antiguas; no son parte del funcionamiento normal de la app. Renombrar un archivo no cambia automáticamente lo que hace el código: los imports se actualizaron junto con estos nombres. La app debe probarse antes de dar el cambio por terminado.
