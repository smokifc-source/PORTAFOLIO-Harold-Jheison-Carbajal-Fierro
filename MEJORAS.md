# Portafolio académico · segunda versión

El portafolio conserva los dos cursos, ocho unidades, 32 temas semanales y la fotografía original. La nueva portada presenta a Harold Jheison y ofrece acceso directo a sus materiales académicos.

## Diseño y navegación

- Paleta azul profundo, superficies claras y acentos verdes; modo oscuro con colores propios y preferencia guardada en el navegador.
- Explorador con pestañas de curso y unidad, búsqueda por tema y filas semanales desplegables.
- Favoritos, semanas revisadas y acceso a la última semana abierta. Este seguimiento pertenece al navegador y no representa notas ni entregas académicas.
- Menú móvil, enlaces de unidad para compartir, atajo `/` para buscar, foco de teclado y respeto por movimiento reducido.
- Retrato real, biografía conservada y presentación de LION como idea en exploración.

## Materiales

Las rutas se conservan con la regla original: nombre del curso / `Unidad N` / `Semana N`, normalizados a minúsculas y sin tildes. Los archivos se cargan al abrir una semana y se pueden actualizar o reintentar si falla la conexión. Las listas se paginan y los enlaces se leen desde `enlace.json`.

Las cargas aceptan PDF, Word, JPG, PNG, ZIP y RAR hasta 50 MB. Los archivos nuevos usan `upsert: false` para evitar sobrescrituras. El formulario valida los enlaces HTTP/HTTPS y rechaza protocolos ejecutables y credenciales en URL. El enlace de una tarea mantiene `upsert: true` y se guarda como JSON. La eliminación requiere confirmar el elemento elegido.

## Estructura

`index.html`, `estilos.css` y `enlaces.css` contienen la interfaz. `cursos.js` conserva el contenido académico; `utilidades.js` contiene filtros y validaciones; `almacenamiento.js` agrupa las operaciones de Supabase; `mejoras.js` conecta las interacciones. El sitio es estático y no necesita instalación ni compilación.

## Validación y límites

Se verificaron sintaxis JavaScript, recursos y anclas, referencias de IDs, estructura de CSS, los 32 temas y sus rutas, filtros, datos personales, validación de URL y archivos. Las pruebas del adaptador usaron un cliente simulado para comprobar paginación, errores, lectura de enlaces, cargas y eliminación. Las 12 combinaciones principales de texto de cada tema superan una relación de contraste de 4.5:1 por cálculo.

La revisión visual en navegador y la prueba integral contra el almacenamiento real quedan pendientes. No se hicieron cargas, eliminaciones ni cambios de políticas en Supabase durante el desarrollo.

El acceso de edición usa Supabase Auth con correo y contraseña, sin credenciales incrustadas en el código. Requiere una cuenta existente del proyecto Supabase; no se creó ninguna cuenta ni se modificó su configuración. La sesión restaurada se valida con `getUser()`. Las políticas de Storage/RLS existentes siguen determinando la autorización para escribir y eliminar; no se verificaron ni modificaron durante este cambio. La marca de sesión del acceso anterior deja de habilitar la edición.
