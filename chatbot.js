/*
 * JHEIBOT · PORTAFOLIO ACADÉMICO UPLA
 * Búsqueda de tareas en Supabase, contexto y definiciones de cursos.
 * Conserva chatbot.css y robot-chatbot.png.
 * Usa el cliente sb y el bucket BUCKET de tu portafolio.
 */

(() => {
  'use strict';

  function iniciar() {
    if (document.querySelector('.jhei-widget')) return;

    const tarjetas = [...document.querySelectorAll('.course-card')];
    if (!tarjetas.length) return;

    const limpiar = texto => String(texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_\.\-]+/g, ' ')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const sanitizar = texto => String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();

    const widget = document.createElement('div');
    widget.className = 'jhei-widget';

    widget.innerHTML = `
      <button
        id="jhei-open"
        type="button"
        aria-label="Abrir JheiBot"
        aria-expanded="false">
        <img src="robot-chatbot.png" alt="">
      </button>

      <section
        id="jhei-panel"
        role="dialog"
        aria-label="Chat con JheiBot"
        hidden>

        <header class="jhei-header">
          <img src="robot-chatbot.png" alt="">
          <div>
            <strong>JheiBot 2.0 🤖</strong>
            <small>Asistente académico del portafolio</small>
          </div>
          <button
            id="jhei-close"
            type="button"
            aria-label="Cerrar chat">×</button>
        </header>

        <div
          id="jhei-messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions"></div>

        <div class="jhei-suggestions">
          <button
            type="button"
            data-question="Busca mis tareas de matrices">
            🔎 Buscar tareas
          </button>
          <button
            type="button"
            data-question="Semana 6 de Algoritmos">
            📚 Semana 6
          </button>
          <button
            type="button"
            data-question="¿Cuáles son los cursos?">
            📖 Cursos
          </button>
          <button
            type="button"
            data-question="¿Qué significa Algoritmos y Estructura de Datos?">
            💡 Definiciones
          </button>
        </div>

        <form id="jhei-form">
          <input
            id="jhei-input"
            autocomplete="off"
            maxlength="300"
            placeholder="Busca tareas o pregunta algo..."
            aria-label="Tu mensaje"
            required>
          <button type="submit" aria-label="Enviar mensaje">➤</button>
        </form>
      </section>
    `;

    document.body.appendChild(widget);

    const estilos = document.createElement('style');
    estilos.id = 'jhei-resultados-css';
    estilos.textContent = `
      .jhei-message .jhei-bubble {
        min-width: 0;
        white-space: pre-line;
      }

      #jhei-panel[hidden] {
        display: none !important;
      }

      .jhei-bubble .jhei-file-card {
        padding: 9px;
        margin-top: 9px;
        border: 1px solid #d6dff5;
        border-radius: 11px;
        background: #f6f8ff;
        white-space: normal;
      }

      .jhei-file-card strong {
        display: block;
        font-size: 12px;
        color: #223674;
        overflow-wrap: anywhere;
      }

      .jhei-file-card small {
        display: block;
        margin: 5px 0 7px;
        font-size: 11px;
        line-height: 1.4;
        color: #62718c;
      }

      .jhei-file-card .jhei-card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .jhei-file-card .jhei-card-actions a,
      .jhei-file-card .jhei-card-actions button {
        display: inline-flex;
        align-items: center;
        margin: 0;
        padding: 7px 9px;
        border: 0;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        background: #e4e9ff;
        color: #3545ac;
      }

      .jhei-file-card .jhei-card-actions a {
        background: #4f46e5;
        color: white;
      }

      .jhei-suggestions {
        overflow-x: auto;
      }

      .jhei-suggestions button {
        white-space: nowrap;
        flex-shrink: 0;
      }

      .jhei-bubble .jhei-context {
        display: block;
        margin-top: 7px;
        font-size: 11px;
        color: #6b7895;
      }

      #jhei-form button:disabled {
        opacity: .55;
        cursor: wait;
      }

      .jhei-target-flash {
        outline: 3px solid #756aff !important;
        outline-offset: 4px;
        scroll-margin-top: 140px;
      }
    `;

    document.head.appendChild(estilos);

    const openBtn = widget.querySelector('#jhei-open');
    const panel = widget.querySelector('#jhei-panel');
    const closeBtn = widget.querySelector('#jhei-close');
    const mensajes = widget.querySelector('#jhei-messages');
    const formulario = widget.querySelector('#jhei-form');
    const entrada = widget.querySelector('#jhei-input');
    const enviar = formulario.querySelector('button[type="submit"]');

    function mostrar(abierto) {
      panel.hidden = !abierto;
      openBtn.setAttribute('aria-expanded', String(abierto));
      if (abierto) entrada.focus();
    }

    openBtn.addEventListener('click', () => mostrar(panel.hidden));
    closeBtn.addEventListener('click', () => mostrar(false));

    const cursos = tarjetas.map(t => ({
      nombre:
        t.querySelector('.course-header h3')?.textContent.trim() ||
        'Curso',
      elemento: t
    }));

    const metadatos = [];

    for (const curso of cursos) {
      for (const unidadEl of curso.elemento.querySelectorAll('.unit-block')) {
        const titulo = unidadEl.querySelector('.unit-toggle');
        const h4 = unidadEl.querySelector('h4');

        const unidad =
          titulo?.dataset.unidad ||
          h4?.textContent.trim() ||
          'Unidad';

        const nombreUnidad = h4?.dataset.titulo || '';

        for (const semanaEl of unidadEl.querySelectorAll('.week-item')) {
          const semana =
            semanaEl.querySelector('label')?.textContent.trim() ||
            'Semana';

          const tema =
            semanaEl.querySelector('span')?.textContent.trim() ||
            'Sin tema';

          metadatos.push({
            curso: curso.nombre,
            unidad,
            semana,
            tema,
            nombreUnidad,
            elemento: semanaEl,
            unidadEl,
            ruta: [curso.nombre, unidad, semana]
              .map(sanitizar)
              .join('/')
          });
        }
      }
    }

    let contexto = { curso: null, unidad: null, semana: null };
    let pendiente = null;
    let ocupado = false;

    const cache = new Map();
    const vigencia = 60 * 1000;

    function cliente() {
      try {
        return typeof sb !== 'undefined' ? sb : null;
      } catch {
        return null;
      }
    }

    function bucket() {
      try {
        return typeof BUCKET !== 'undefined' ? BUCKET : 'tareas';
      } catch {
        return 'tareas';
      }
    }

    function burbuja(texto, quien = 'bot') {
      const fila = document.createElement('div');
      fila.className = 'jhei-message ' + quien;

      if (quien === 'bot') {
        const imagen = document.createElement('img');
        imagen.src = 'robot-chatbot.png';
        imagen.alt = 'JheiBot';
        fila.appendChild(imagen);
      }

      const contenido = document.createElement('div');
      contenido.className = 'jhei-bubble';
      contenido.textContent = texto;

      fila.appendChild(contenido);
      mensajes.appendChild(fila);
      mensajes.scrollTop = mensajes.scrollHeight;

      return contenido;
    }

    function irASemana(m) {
      const boton = m.unidadEl.querySelector('.unit-toggle');

      if (boton && boton.getAttribute('aria-expanded') !== 'true') {
        boton.click();
      }

      mostrar(false);

      m.elemento.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      m.elemento.classList.add('jhei-target-flash');

      setTimeout(() => {
        m.elemento.classList.remove('jhei-target-flash');
      }, 2300);
    }

    function accionIr(contenido, m) {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.textContent = '📍 Ir a esa semana';
      boton.addEventListener('click', () => irASemana(m));
      contenido.appendChild(boton);
    }

    function tarjetaArchivo(contenido, archivo) {
      const caja = document.createElement('div');
      caja.className = 'jhei-file-card';

      const nombre = document.createElement('strong');
      nombre.textContent = archivo.enlace
        ? '🔗 Enlace guardado'
        : '📄 ' + archivo.nombre;

      const meta = document.createElement('small');
      meta.textContent =
        `${archivo.curso} · ${archivo.unidad} · ${archivo.semana}`;

      const acciones = document.createElement('div');
      acciones.className = 'jhei-card-actions';

      if (!archivo.enlace) {
        const storage = cliente()?.storage.from(bucket());
        const url = storage
          ?.getPublicUrl(`${archivo.ruta}/${archivo.nombre}`)
          .data?.publicUrl;

        if (url) {
          const ver = document.createElement('a');
          ver.textContent = 'Abrir archivo ↗';
          ver.href = url;
          ver.target = '_blank';
          ver.rel = 'noopener noreferrer';
          acciones.appendChild(ver);
        }
      } else {
        const ver = document.createElement('button');
        ver.type = 'button';
        ver.textContent = 'Abrir enlace ↗';

        ver.addEventListener('click', async () => {
          ver.disabled = true;

          try {
            const { data, error } = await cliente()
              .storage.from(bucket())
              .download(`${archivo.ruta}/enlace.json`);

            if (error || !data) {
              throw error || Error('Enlace no disponible');
            }

            const url = JSON.parse(await data.text()).url;
            const destino = new URL(url);

            if (!['http:', 'https:'].includes(destino.protocol)) {
              throw Error('Enlace no válido');
            }

            window.open(destino.href, '_blank', 'noopener,noreferrer');
          } catch (e) {
            burbuja(
              'No pude abrir ese enlace. Revisa los permisos de Supabase o ve a la semana.'
            );
          } finally {
            ver.disabled = false;
          }
        });

        acciones.appendChild(ver);
      }

      const ir = document.createElement('button');
      ir.type = 'button';
      ir.textContent = 'Ir a semana →';

      ir.addEventListener('click', () => {
        contexto = {
          curso: archivo.curso,
          unidad: archivo.unidad,
          semana: archivo.semana
        };
        irASemana(archivo);
      });

      acciones.appendChild(ir);
      caja.append(nombre, meta, acciones);
      contenido.appendChild(caja);
    }

    function cursoExplicito(q) {
      if (/\balgoritm|estructuras? de datos|\baed\b/.test(q)) {
        return cursos.find(c =>
          /algoritm|estructuras? de datos/.test(limpiar(c.nombre))
        )?.nombre || null;
      }

      if (/\btaller\b|desarrollo de aplicacion/.test(q)) {
        return cursos.find(c =>
          /taller|desarrollo de aplicacion/.test(limpiar(c.nombre))
        )?.nombre || null;
      }

      return null;
    }

    // DEFINICIONES SEPARADAS DE LOS TÉRMINOS.
    function definicionCurso(nombre) {
      const n = limpiar(nombre);

      if (/algoritm|estructuras? de datos/.test(n)) {
        return (
          'Algoritmos significa: conjunto de pasos ordenados y finitos ' +
          'para resolver un problema o realizar una tarea.' +
          '\n\n' +
          'Estructura de datos significa: forma de organizar y almacenar ' +
          'datos para facilitar su acceso y modificación.'
        );
      }

      if (/taller|desarrollo de aplicacion/.test(n)) {
        return (
          'Taller de Desarrollo de Aplicación: curso práctico que enseña ' +
          'a crear aplicaciones mediante la programación, el diseño ' +
          'y las pruebas de software.'
        );
      }

      return 'Todavía no tengo una definición guardada para este curso.';
    }

    function explicarCurso(nombre) {
      contexto = {
        curso: nombre,
        unidad: null,
        semana: null
      };

      pendiente = null;
      burbuja(definicionCurso(nombre));
    }

    function fragmento(q, clase) {
      const expresion = clase === 'semana'
        ? /\bsemana\s*(\d{1,2})\b/
        : /\bunidad\s*(\d{1,2})\b/;

      const m = q.match(expresion);
      return m ? Number(m[1]) : null;
    }

    function numero(etiqueta) {
      return Number(String(etiqueta).match(/\d+/)?.[0]);
    }

    function extraerTerminos(q) {
      const texto = q
        .replace(/\bsemana\s*\d{1,2}\b/g, ' ')
        .replace(/\bunidad\s*\d{1,2}\b/g, ' ')
        .replace(
          /\balgoritmos?\b|\baed\b|\bestructuras? de datos\b|\btaller\b|\bdesarrollo de aplicaciones?\b/g,
          ' '
        );

      const stop = new Set([
        'yo', 'mi', 'mis', 'tu', 'que', 'cual', 'cuales',
        'como', 'cuando', 'donde', 'esta', 'estan',
        'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
        'de', 'del', 'en', 'por', 'para', 'con', 'y',
        'quiero', 'puedes', 'podrias', 'favor',
        'busca', 'buscar', 'encuentra', 'encontrar',
        'localiza', 'muestra', 'muestrame', 'dame', 'ver', 'abrir',
        'archivo', 'archivos', 'documento', 'documentos',
        'tarea', 'tareas', 'trabajo', 'trabajos',
        'subi', 'subido', 'subidos', 'subidas',
        'guarde', 'guardado', 'guardados', 'hay', 'tengo', 'tienes',
        'esa', 'ese', 'esos', 'estas', 'todos', 'todas',
        'bot', 'jheibot', 'mas', 'algo', 'ahi',
        'semana', 'unidad', 'curso', 'cursos', 'pdfs', 'algun', 'alguna',
        'enlace', 'enlaces', 'link', 'links',
        'solo', 'solamente', 'unicamente',
        'actualiza', 'actualizar', 'recarga', 'recargar',
        'refresca', 'refrescar', 'nuevos',
        'otra', 'vez', 'este', 'aqui', 'alli', 'ahora'
      ]);

      return [
        ...new Set(
          texto.split(' ').filter(t => t.length > 1 && !stop.has(t))
        )
      ].map(t => t === 'matrices' ? 'matriz' : t);
    }

    async function listarSemana(m, forzar) {
      const item = cache.get(m.ruta);

      if (!forzar && item && Date.now() - item.fecha < vigencia) {
        return item.archivos;
      }

      const storage = cliente().storage.from(bucket());
      const archivos = [];

      for (let offset = 0; offset < 400; offset += 100) {
        const { data, error } = await storage.list(m.ruta, {
          limit: 100,
          offset
        });

        if (error) throw error;

        for (const f of (data || [])) {
          if (!f?.name || f.name === '.emptyFolderPlaceholder' || !f.id) {
            continue;
          }

          archivos.push({
            ...m,
            nombre: f.name,
            enlace: f.name === 'enlace.json'
          });
        }

        if ((data || []).length < 100) break;
      }

      cache.set(m.ruta, {
        fecha: Date.now(),
        archivos
      });

      return archivos;
    }

    async function encontrar(
      alcance,
      terminos,
      soloEnlaces = false,
      forzar = false
    ) {
      const encontrados = [];
      let errores = 0;
      let siguiente = 0;

      async function trabajador() {
        while (siguiente < alcance.length) {
          const m = alcance[siguiente++];

          try {
            encontrados.push(...await listarSemana(m, forzar));
          } catch (e) {
            errores++;
            console.warn('JheiBot: sin acceso a', m.ruta, e);
          }
        }
      }

      await Promise.all(
        Array.from(
          { length: Math.min(4, alcance.length) },
          () => trabajador()
        )
      );

      const coincidencias = encontrados.filter(f => {
        if (soloEnlaces ? !f.enlace : f.enlace) return false;

        const texto = limpiar(
          `${f.nombre} ${f.tema} ${f.curso} ${f.unidad} ${f.semana}`
        );

        return terminos.every(t => texto.includes(t));
      }).sort((a, b) =>
        a.curso.localeCompare(b.curso) ||
        numero(a.semana) - numero(b.semana) ||
        a.nombre.localeCompare(b.nombre)
      );

      return { coincidencias, errores };
    }

    function recordar(m) {
      contexto = {
        curso: m.curso,
        unidad: m.unidad,
        semana: m.semana
      };
    }

    function describirSemana(m) {
      recordar(m);

      const contenido = burbuja(
        `${m.curso} · ${m.unidad} · ${m.semana}\n` +
        `Tema: ${m.tema}\n` +
        '¿Quieres saber qué archivos subiste aquí?'
      );

      accionIr(contenido, m);
    }

    async function buscarArchivos(q, opciones = {}) {
      const terminos = extraerTerminos(q);
      const actualizacion = /actualiz|recarg|refresc/.test(q);

      const directo =
        /\besta semana\b|\besa semana\b|\bese curso\b|\beste curso\b|\bahi\b|\balli\b|\baqui\b/.test(q);

      let alcance = metadatos;

      if (opciones.curso) {
        alcance = alcance.filter(m => m.curso === opciones.curso);
      }

      if (opciones.unidad) {
        alcance = alcance.filter(m => numero(m.unidad) === opciones.unidad);
      }

      if (opciones.semana) {
        alcance = alcance.filter(m => numero(m.semana) === opciones.semana);
      }

      if (
        !opciones.semana &&
        !opciones.unidad &&
        !opciones.curso &&
        contexto.semana &&
        (directo || terminos.length === 0)
      ) {
        alcance = alcance.filter(m =>
          m.curso === contexto.curso &&
          m.semana === contexto.semana
        );
      } else if (
        !opciones.curso &&
        !opciones.semana &&
        !opciones.unidad &&
        contexto.curso &&
        (directo || terminos.length === 0)
      ) {
        alcance = alcance.filter(m =>
          m.curso === contexto.curso &&
          (!contexto.unidad ||
            numero(m.unidad) === numero(contexto.unidad))
        );
      }

      if (!alcance.length) {
        burbuja('No encontré esa semana o unidad en el portafolio.');
        return;
      }

      if (!cliente()?.storage) {
        burbuja(
          'No tengo acceso a Supabase en este momento. Puedes usar el buscador de Cursos.'
        );
        return;
      }

      const soloEnlaces = /enlace|\blinks?\b/.test(q);
      const pensando = burbuja(
        `🔎 Revisando ${alcance.length} semana(s) en Supabase…`
      );

      try {
        const { coincidencias, errores } = await encontrar(
          alcance,
          terminos,
          soloEnlaces,
          actualizacion
        );

        pensando.parentElement?.remove();

        if (!coincidencias.length) {
          burbuja(
            `No encontré ${soloEnlaces ? 'enlaces' : 'archivos'} que coincidan con tu búsqueda.` +
            (errores
              ? ` No pude consultar ${errores} carpeta(s) de Supabase.`
              : '') +
            '\nPrueba otro nombre o usa «Buscar tareas» en Cursos.'
          );
          return;
        }

        const contenido = burbuja(
          `Encontré ${coincidencias.length} ${soloEnlaces ? 'enlace(s)' : 'archivo(s)'}.` +
          (errores ? ` No pude consultar ${errores} carpeta(s).` : '') +
          '\nAquí están los primeros resultados:'
        );

        for (const archivo of coincidencias.slice(0, 6)) {
          tarjetaArchivo(contenido, archivo);
        }

        if (coincidencias.length > 6) {
          const nota = document.createElement('small');
          nota.className = 'jhei-context';
          nota.textContent =
            `Mostrando 6 de ${coincidencias.length}. Añade el nombre del archivo para precisar la búsqueda.`;

          contenido.appendChild(nota);
        }

        if (coincidencias.length === 1) {
          recordar(coincidencias[0]);
        }

        mensajes.scrollTop = mensajes.scrollHeight;
      } catch (e) {
        pensando.parentElement?.remove();
        console.warn('JheiBot: error al buscar', e);

        burbuja(
          'No pude completar la búsqueda. Revisa la conexión a Supabase e inténtalo otra vez.'
        );
      }
    }

    async function responder(pregunta) {
      const q = limpiar(pregunta);
      const especifico = cursoExplicito(q);
      const semana = fragmento(q, 'semana');
      const unidad = fragmento(q, 'unidad');

      const pideArchivos =
        /\b(busca|buscar|encuentra|localiza|muestra|muestrame|tareas|tarea|archivos|archivo|documentos|documento|subi|subidos|guarde|guardados|enlaces|enlace|links|link|pdf)\b/.test(q);

      const pideActualizar = /actualiz|recarg|refresc/.test(q);

      const pideDefinicion =
        /\b(que es|que son|que significa|que significan|significado|significa|significacion|definicion|concepto|de que trata|en que consiste|que se aprende|que estudia|explica|explicame|define|defineme)\b/.test(q);

      const saludo =
        /^(hola|buenas|buenos dias|buenas tardes|hey)\b/.test(q);

      if (/\b(reiniciar|olvida|limpia|borrar contexto)\b/.test(q)) {
        contexto = { curso: null, unidad: null, semana: null };
        pendiente = null;
        cache.clear();

        burbuja(
          'He reiniciado el contexto. ¿Qué curso, semana o tarea buscas ahora?'
        );
        return;
      }

      if (
        saludo &&
        !pideDefinicion &&
        !pideArchivos &&
        !especifico &&
        semana === null &&
        unidad === null
      ) {
        burbuja(
          '¡Hola! 👋 Soy JheiBot. Puedo explicar el significado de tus cursos, buscar tareas y mostrar los temas de cada semana.'
        );
        return;
      }

      // Primero responde las definiciones.
      const buscaMaterial =
        /\b(tareas?|archivos?|documentos?|enlaces?|links?|pdf|subi|subidos|guardados)\b/.test(q);

      const referenciaCurso = /\b(curso|materia|asignatura)\b/.test(q);

      if (
        pideDefinicion &&
        !buscaMaterial &&
        !pideActualizar &&
        semana === null &&
        unidad === null
      ) {
        if (/\b(cursos|materias|asignaturas)\b/.test(q)) {
          pendiente = null;
          burbuja(
            cursos.map(c => definicionCurso(c.nombre)).join('\n\n')
          );
          return;
        }

        if (
          especifico ||
          referenciaCurso ||
          /^(y )?(de que trata|que significa|explicame|definicion)( ese| este| eso)?$/.test(q)
        ) {
          const elegido = especifico || contexto.curso;

          if (elegido) {
            return explicarCurso(elegido);
          }

          pendiente = { definicion: true };

          burbuja(
            `¿De qué curso quieres la definición: ${cursos.map(c => c.nombre).join(' o ')}?`
          );
          return;
        }
      }

      if (
        pendiente?.definicion &&
        especifico &&
        semana === null &&
        unidad === null &&
        !pideArchivos &&
        !pideActualizar
      ) {
        return explicarCurso(especifico);
      }

      if (
        pendiente?.definicion &&
        (pideArchivos || pideActualizar || semana !== null || unidad !== null)
      ) {
        pendiente = null;
      }

      // Aclaración: «Semana 6» → «Algoritmos».
      if (
        pendiente &&
        !pendiente.definicion &&
        especifico &&
        semana === null &&
        unidad === null &&
        !pideArchivos &&
        !pideActualizar
      ) {
        const p = pendiente;
        pendiente = null;

        return responder(
          (p.buscar ? 'Busca archivos de ' : '') +
          (p.unidad !== null
            ? `Unidad ${p.unidad} `
            : `Semana ${p.semana} `) +
          `de ${especifico}`
        );
      }

      const curso = especifico || contexto.curso;

      if (especifico && especifico !== contexto.curso) {
        contexto = {
          curso: especifico,
          unidad: null,
          semana: null
        };
      }

      if (semana !== null && (semana < 1 || semana > 16)) {
        burbuja('Cada curso tiene semanas del 1 al 16.');
        return;
      }

      if (unidad !== null && (unidad < 1 || unidad > 4)) {
        burbuja('Cada curso tiene unidades del 1 al 4.');
        return;
      }

      if ((semana !== null || unidad !== null) && !curso) {
        pendiente = {
          semana,
          unidad,
          buscar: pideArchivos
        };

        burbuja(
          `¿Te refieres a ${cursos.map(c => c.nombre).join(' o ')}?`
        );
        return;
      }

      const coincidencia = semana !== null
        ? metadatos.find(m =>
            m.curso === curso &&
            numero(m.semana) === semana &&
            (unidad === null || numero(m.unidad) === unidad)
          )
        : unidad !== null
          ? metadatos.find(m =>
              m.curso === curso && numero(m.unidad) === unidad
            )
          : null;

      if (
        (semana !== null || unidad !== null) &&
        !coincidencia
      ) {
        burbuja('No encontré esa semana o unidad en el curso.');
        return;
      }

      if (coincidencia) {
        pendiente = null;
        recordar(coincidencia);
      }

      if (pideArchivos || pideActualizar) {
        return buscarArchivos(q, {
          curso: especifico ||
            (semana !== null || unidad !== null ? curso : null),
          unidad,
          semana
        });
      }

      if (semana !== null) {
        return describirSemana(coincidencia);
      }

      if (unidad !== null) {
        contexto = {
          curso,
          unidad: coincidencia.unidad,
          semana: null
        };

        const temas = metadatos
          .filter(m =>
            m.curso === curso &&
            m.unidad === coincidencia.unidad
          )
          .map(m => `${m.semana}: ${m.tema}`)
          .join('\n');

        burbuja(
          `${curso} · ${coincidencia.unidad}\n${temas}\n` +
          'Puedes preguntar: «¿Qué archivos hay en esta unidad?»'
        );
        return;
      }

      if (/\bcursos\b|\bmaterias\b|\basignaturas\b/.test(q)) {
        burbuja(
          'Estos son tus cursos:\n' +
          cursos.map((c, i) => `${i + 1}. ${c.nombre}`).join('\n') +
          '\nCada uno tiene 4 unidades y 16 semanas.' +
          '\nPuedes preguntarme qué significa cada curso.'
        );
        return;
      }

      if (/sobre mi|perfil|estudiante|quien/.test(q)) {
        burbuja(
          'Este es el portafolio académico de Harold Jheison Carbajal Fierro, estudiante de Ingeniería de Sistemas de la UPLA.'
        );
        return;
      }

      if (especifico) {
        burbuja(
          `Estamos hablando de ${especifico}. Puedes preguntar qué significa, indicar una semana o pedir «Busca mis tareas».`
        );
        return;
      }

      if (
        contexto.semana &&
        /\b(que hay|tema|esa|ahi|alli)\b/.test(q)
      ) {
        const m = metadatos.find(x =>
          x.curso === contexto.curso &&
          x.semana === contexto.semana
        );

        if (m) return describirSemana(m);
      }

      burbuja(
        'Puedes preguntarme:\n\n' +
        '• ¿Qué significa Algoritmos y Estructura de Datos?\n' +
        '• ¿De qué trata Taller de Desarrollo de Aplicación?\n' +
        '• Busca mis tareas de matrices.\n' +
        '• Semana 6 de Algoritmos.'
      );
    }

    async function preguntar(texto) {
      const mensaje = String(texto || '').trim();

      if (!mensaje || ocupado) return;

      ocupado = true;
      enviar.disabled = true;
      entrada.disabled = true;
      burbuja(mensaje, 'user');

      try {
        await responder(mensaje);
      } catch (e) {
        console.warn('JheiBot:', e);
        burbuja('Ocurrió un problema. Intenta nuevamente.');
      } finally {
        ocupado = false;
        enviar.disabled = false;
        entrada.disabled = false;
        entrada.focus();
      }
    }

    formulario.addEventListener('submit', e => {
      e.preventDefault();
      const texto = entrada.value;
      entrada.value = '';
      preguntar(texto);
    });

    widget.querySelectorAll('[data-question]').forEach(boton => {
      boton.addEventListener('click', () => {
        preguntar(boton.dataset.question);
      });
    });

    burbuja(
      '¡Hola! 👋 Soy JheiBot.\n\n' +
      'Puedo buscar tus tareas, mostrar temas por semana y explicar tus cursos.\n\n' +
      'Prueba: «¿Qué significa Algoritmos y Estructura de Datos?»'
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
