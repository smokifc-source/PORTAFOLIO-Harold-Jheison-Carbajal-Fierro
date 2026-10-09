# Mejoras del portafolio

Se conservan el perfil, la fotografía, los dos cursos, sus ocho unidades, las 32 semanas y las rutas originales del bucket `tareas`. No se modifica ni se elimina material de Supabase.

## Cambios

- Portada y diseño institucional azul con tipografía, espaciado y contraste más claros.
- Menú móvil, búsqueda por tema o semana, filtro de curso y expansión de unidades.
- Estilos de enlaces incluidos en `enlaces.css`, que estaba referenciado pero faltaba en el repositorio.
- Apertura y cierre accesibles del diálogo de edición, etiquetas para seleccionar archivos y enlaces, y alternativa visual si la fotografía no carga.
- El material se consulta al abrir una unidad, en lugar de iniciar las 32 consultas al cargar la portada. Se puede reintentar una consulta fallida cerrando y abriendo la unidad.
- Descarga de `enlace.json` corregida para usar su ruta real, enlaces con protocolos validados y pestañas nuevas con `noopener noreferrer`.
- Las cargas no sobrescriben archivos existentes. Se valida la extensión y un máximo de 50 MB en la interfaz; el bucket puede tener un límite menor.

## Archivos

`index.html`, `estilos.css`, `enlaces.css` y `mejoras.js` deben quedar juntos en la raíz. La fotografía conserva su nombre y ubicación original. `archivo.java` no se modifica.

## Acceso y permisos

El acceso de edición original valida un usuario y contraseña en JavaScript y guarda una bandera en el navegador. Se mantiene para no romper el flujo existente, pero **no es autenticación real ni protege las operaciones del bucket**. La clave publishable de Supabase es una clave de cliente; los permisos reales deben aplicarse mediante Supabase Auth y políticas de Storage/RLS. No se modificaron ni se verificaron las políticas del servidor en esta mejora.

Para reemplazar ese acceso por autenticación real se necesita configurar la cuenta del propietario y las políticas de lectura/escritura en Supabase; esta rama no crea cuentas ni cambia permisos.

## Validación

Se verifican la sintaxis JavaScript, los recursos y anclas, la conservación de contenidos y rutas, y la normalización de enlaces y construcción de rutas con datos de ejemplo. No se realizan cargas, modificaciones ni eliminaciones en el bucket real. La revisión visual en navegador y una prueba integral con Supabase siguen pendientes.
