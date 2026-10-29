/*
 * JHEIBOT 2.2 — PORTAFOLIO UPLA
 * Definiciones, ejemplo de algoritmo y búsqueda de tareas.
 * Utiliza el cliente sb y el bucket BUCKET de index.html.
 */
(() => {
  'use strict';

  function iniciar() {
    if (document.querySelector('.jhei-widget')) return;

    const limpiar = texto => String(texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const sanitizar = texto => String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();

    const numero = texto =>
      Number(String(texto).match(/\d+/)?.[0]);

    const cursos = [...document.querySelectorAll('.course-card')]
      .map(elemento => ({
        nombre: elemento.querySelector('.course-header h3')
          ?.textContent.trim() || 'Curso',
        elemento
      }));

    const semanas = [];

    for (const curso of cursos) {
      for (const bloque of curso.elemento.querySelectorAll('.unit-block')) {
        const unidad = bloque.querySelector('.unit-toggle')?.dataset.unidad
          || bloque.querySelector('h4')?.textContent.trim()
          || 'Unidad';

        for (const elemento of bloque.querySelectorAll('.week-item')) {
          const semana = elemento.querySelector('label')?.textContent.trim()
            || 'Semana';
          const tema = elemento.querySelector('span')?.textContent.trim()
            || 'Sin tema';

          semanas.push({
            curso: curso.nombre,
            unidad,
            semana,
            tema,
            elemento,
            bloque,
            ruta: [curso.nombre, unidad, semana].map(sanitizar).join('/')
          });
        }
      }
    }

    const widget = document.createElement('div');
    widget.className = 'jhei-widget';
    widget.innerHTML = `
      <button id="jhei-open" type="button"
        aria-label="Abrir JheiBot" aria-expanded="false">
        <img src="robot-chatbot.png" alt="JheiBot">
      </button>
      <section id="jhei-panel" role="dialog"
        aria-label="Chat con JheiBot" hidden>
        <header class="jhei-header">
          <img src="robot-chatbot.png" alt="">
          <div>
            <strong>JheiBot 2.2 🤖</strong>
            <small>Asistente académico del portafolio</small>
          </div>
          <button id="jhei-close" type="button"
            aria-label="Cerrar chat">×</button>
        </header>
        <div id="jhei-messages" role="log"
          aria-live="polite" aria-relevant="additions"></div>
        <div class="jhei-suggestions">
          <button type="button"
            data-question="¿Qué significa Algoritmos y Estructura de Datos?">
            💡 Significados
          </button>
          <button type="button"
            data-question="Dame un ejemplo de algoritmo">
            🧮 Ejemplo
          </button>
          <button type="button"
            data-question="Busca mis tareas">
            🔎 Tareas
          </button>
          <button type="button"
            data-question="¿Cuáles son los cursos?">
            📚 Cursos
          </button>
        </div>
        <form id="jhei-form">
          <input id="jhei-input" autocomplete="off"
            maxlength="300" placeholder="Escribe tu pregunta..."
            aria-label="Tu mensaje" required>
          <button type="submit" aria-label="Enviar">➤</button>
        </form>
      </section>
    `;
    document.body.appendChild(widget);

    const estilo = document.createElement('style');
    estilo.textContent = `
      #jhei-panel[hidden] { display:none !important; }
      .jhei-message .jhei-bubble {
        min-width:0;
        white-space:pre-line;
        overflow-wrap:anywhere;
      }
      .jhei-suggestions { overflow-x:auto; }
      .jhei-suggestions button {
        white-space:nowrap;
        flex-shrink:0;
      }
      .jhei-file-card {
        margin-top:10px;
        padding:10px;
        border:1px solid #d6dff5;
        border-radius:10px;
        background:#f6f8ff;
        color:#223674;
        white-space:normal;
      }
      .jhei-file-card strong,
      .jhei-file-card small {
        display:block;
        margin-bottom:7px;
        overflow-wrap:anywhere;
      }
      .jhei-card-actions {
        display:flex;
        flex-wrap:wrap;
        gap:6px;
      }
      .jhei-card-actions a,
      .jhei-card-actions button {
        padding:7px 9px;
        border:0;
        border-radius:8px;
        background:#4f46e5;
        color:white;
        text-decoration:none;
        font-size:12px;
        cursor:pointer;
      }
      #jhei-form button:disabled { opacity:.55; }
      .jhei-target-flash {
        outline:3px solid #756aff !important;
        outline-offset:4px;
        scroll-margin-top:140px;
      }
    `;
    document.head.appendChild(estilo);

    const panel = widget.querySelector('#jhei-panel');
    const abrir = widget.querySelector('#jhei-open');
    const mensajes = widget.querySelector('#jhei-messages');
    const formulario = widget.querySelector('#jhei-form');
    const entrada = widget.querySelector('#jhei-input');
    const enviar = formulario.querySelector('button');

    let contexto = { curso: null, unidad: null, semana: null };
    let pendiente = null;
    let ocupado = false;
    const cache = new Map();

    function mostrar(visible) {
      panel.hidden = !visible;
      abrir.setAttribute('aria-expanded', String(visible));
      if (visible) entrada.focus();
    }

    abrir.addEventListener('click', () => mostrar(panel.hidden));
    widget.querySelector('#jhei-close')
      .addEventListener('click', () => mostrar(false));

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

    function identificarCurso(q) {
      if (/\balgoritmos?\b|estructuras? de datos|\baed\b/.test(q)) {
        return cursos.find(c =>
          /algoritm|estructura/.test(limpiar(c.nombre))
        )?.nombre || 'Algoritmos y Estructura de Datos';
      }

      if (/\btaller\b|desarrollo de aplicacion/.test(q)) {
        return cursos.find(c =>
          /taller|desarrollo de aplicacion/.test(limpiar(c.nombre))
        )?.nombre || 'Taller de Desarrollo de Aplicación';
      }

      return null;
    }

    const ejemplo =
      'Ejemplo de algoritmo: sumar dos números.\n' +
      '1. Leer el primer número: 5.\n' +
      '2. Leer el segundo número: 3.\n' +
      '3. Sumar ambos números: 5 + 3.\n' +
      '4. Mostrar el resultado: 8.';

    function definicion(nombre) {
      if (/algoritm|estructura/.test(limpiar(nombre))) {
        return (
          'Algoritmos significa: conjunto de pasos ordenados y finitos ' +
          'para resolver un problema o realizar una tarea.\n\n' +
          'Estructura de datos significa: forma de organizar y almacenar ' +
          'datos para facilitar su acceso y modificación.\n\n' +
          ejemplo
        );
      }

      if (/taller|desarrollo de aplicacion/.test(limpiar(nombre))) {
        return (
          'Taller de Desarrollo de Aplicación: curso práctico que enseña ' +
          'a crear aplicaciones mediante la programación, el diseño ' +
          'y las pruebas de software.\n\n' +
          'Ejemplo: crear una aplicación que registre productos ' +
          'y muestre sus precios y cantidades disponibles.'
        );
      }

      return 'Todavía no tengo una definición guardada para ese curso.';
    }

    function explicar(nombre, soloEjemplo = false) {
      contexto = { curso: nombre, unidad: null, semana: null };
      pendiente = null;

      burbuja(
        soloEjemplo && /algoritm|estructura/.test(limpiar(nombre))
          ? ejemplo
          : definicion(nombre)
      );
    }

    function recordar(m) {
      contexto = {
        curso: m.curso,
        unidad: m.unidad,
        semana: m.semana
      };
    }

    function irASemana(m) {
      recordar(m);
      const boton = m.bloque.querySelector('.unit-toggle');

      if (boton && boton.getAttribute('aria-expanded') !== 'true') {
        boton.click();
      }

      mostrar(false);
      m.elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
      m.elemento.classList.add('jhei-target-flash');
      setTimeout(() => {
        m.elemento.classList.remove('jhei-target-flash');
      }, 2300);
    }

    function describirSemana(m) {
      recordar(m);
      const contenido = burbuja(
        `${m.curso} · ${m.unidad} · ${m.semana}\n` +
        `Tema: ${m.tema}\n\nPuedes preguntar: «¿Qué archivos subí aquí?»`
      );

      const boton = document.createElement('button');
      boton.type = 'button';
      boton.textContent = '📍 Ir a esa semana';
      boton.addEventListener('click', () => irASemana(m));
      contenido.appendChild(boton);
    }

    function tarjetaArchivo(contenido, archivo) {
      const caja = document.createElement('div');
      caja.className = 'jhei-file-card';

      const titulo = document.createElement('strong');
      titulo.textContent = archivo.enlace
        ? '🔗 Enlace guardado'
        : '📄 ' + archivo.nombre;

      const meta = document.createElement('small');
      meta.textContent =
        `${archivo.curso} · ${archivo.unidad} · ${archivo.semana}`;

      const acciones = document.createElement('div');
      acciones.className = 'jhei-card-actions';

      if (archivo.enlace) {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.textContent = 'Obtener enlace ↗';

        boton.addEventListener('click', async () => {
          boton.disabled = true;

          try {
            const { data, error } = await cliente().storage.from(bucket())
              .download(`${archivo.ruta}/enlace.json`);

            if (error || !data) throw error || Error('Sin enlace');

            const destino = new URL(JSON.parse(await data.text()).url);
            if (!['http:', 'https:'].includes(destino.protocol)) {
              throw Error('Enlace no válido');
            }

            const enlace = document.createElement('a');
            enlace.href = destino.href;
            enlace.target = '_blank';
            enlace.rel = 'noopener noreferrer';
            enlace.textContent = 'Abrir enlace ↗';
            boton.replaceWith(enlace);
          } catch (e) {
            burbuja('No pude obtener el enlace. Revisa la semana correspondiente.');
            boton.disabled = false;
          }
        });

        acciones.appendChild(boton);
      } else {
        const { data } = cliente().storage.from(bucket())
          .getPublicUrl(`${archivo.ruta}/${archivo.nombre}`);

        if (data?.publicUrl) {
          const enlace = document.createElement('a');
          enlace.href = data.publicUrl;
          enlace.target = '_blank';
          enlace.rel = 'noopener noreferrer';
          enlace.textContent = 'Abrir archivo ↗';
          acciones.appendChild(enlace);
        }
      }

      const ir = document.createElement('button');
      ir.type = 'button';
      ir.textContent = 'Ir a semana';
      ir.addEventListener('click', () => irASemana(archivo));
      acciones.appendChild(ir);

      caja.append(titulo, meta, acciones);
      contenido.appendChild(caja);
    }

    function terminosBusqueda(q) {
      const texto = q
        .replace(/\b(semana|unidad)\s*\d+\b/g, ' ')
        .replace(
          /\balgoritmos?\b|\baed\b|estructuras? de datos|taller|desarrollo de aplicaciones?/g,
          ' '
        );

      const ignorar = new Set((
        'yo mi mis tu que cual cuales como cuando donde esta estan ' +
        'el la los las un una unos unas de del en por para con y ' +
        'quiero puedes podrias favor busca buscar encuentra encontrar ' +
        'localiza muestra muestrame dame ver abrir archivo archivos ' +
        'documento documentos tarea tareas trabajo trabajos subi subido ' +
        'subidos subidas guarde guardado guardados hay tengo tienes ' +
        'esa ese esos estas todos todas bot jheibot mas algo ahi ' +
        'semana unidad curso cursos algun alguna enlace enlaces link links ' +
        'solo solamente unicamente actualiza actualizar recarga recargar ' +
        'refresca refrescar nuevos otra vez este aqui alli ahora'
      ).split(' '));

      return [...new Set(
        texto.split(' ').filter(t => t.length > 1 && !ignorar.has(t))
      )].map(t => t === 'matrices' ? 'matriz' : t);
    }

    async function listarSemana(m, actualizar) {
      const anterior = cache.get(m.ruta);
      if (!actualizar && anterior && Date.now() - anterior.fecha < 60000) {
        return anterior.archivos;
      }

      const archivos = [];
      for (let offset = 0; ; offset += 100) {
        const { data, error } = await cliente().storage.from(bucket())
          .list(m.ruta, { limit: 100, offset });

        if (error) throw error;

        for (const f of data || []) {
          if (!f.id || !f.name || f.name === '.emptyFolderPlaceholder') {
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

      cache.set(m.ruta, { fecha: Date.now(), archivos });
      return archivos;
    }

    async function buscarArchivos(q, opciones = {}) {
      const terminos = terminosBusqueda(q);
      const actualizar = /actualiz|recarg|refresc/.test(q);
      const soloEnlaces = /\benlaces?\b|\blinks?\b/.test(q);
      let alcance = semanas;

      if (opciones.curso) {
        alcance = alcance.filter(m => m.curso === opciones.curso);
      }
      if (opciones.unidad != null) {
        alcance = alcance.filter(m => numero(m.unidad) === opciones.unidad);
      }
      if (opciones.semana != null) {
        alcance = alcance.filter(m => numero(m.semana) === opciones.semana);
      }

      const seguimiento =
        /\b(esta semana|esa semana|este curso|ese curso|ahi|alli|aqui)\b/.test(q);

      if (
        !opciones.curso &&
        opciones.semana == null &&
        opciones.unidad == null &&
        contexto.curso &&
        (seguimiento || !terminos.length)
      ) {
        alcance = alcance.filter(m =>
          m.curso === contexto.curso &&
          (!contexto.unidad || m.unidad === contexto.unidad) &&
          (!contexto.semana || m.semana === contexto.semana)
        );
      }

      if (!alcance.length) {
        burbuja('No encontré semanas para esa búsqueda.');
        return;
      }

      if (!cliente()?.storage) {
        burbuja(
          'No tengo acceso a Supabase en este momento. ' +
          'Sí puedo responder las definiciones y el ejemplo.'
        );
        return;
      }

      const pensando = burbuja(
        `🔎 Revisando ${alcance.length} semana(s)…`
      );

      try {
        let siguiente = 0;
        let errores = 0;
        const encontrados = [];

        async function trabajador() {
          while (siguiente < alcance.length) {
            const m = alcance[siguiente++];
            try {
              encontrados.push(...await listarSemana(m, actualizar));
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

        const resultados = encontrados.filter(f => {
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

        pensando.parentElement.remove();

        const aviso = errores
          ? ` No pude consultar ${errores} carpeta(s).`
          : '';

        if (!resultados.length) {
          burbuja(
            'No encontré resultados.' + aviso +
            '\nPrueba otro nombre o indica el curso y la semana.'
          );
          return;
        }

        const contenido = burbuja(
          `Encontré ${resultados.length} resultado(s).` + aviso
        );

        resultados.slice(0, 6).forEach(f => {
          tarjetaArchivo(contenido, f);
        });

        if (resultados.length > 6) {
          const nota = document.createElement('small');
          nota.textContent =
            `Mostrando 6 de ${resultados.length}. Precisa tu búsqueda para ver otros resultados.`;
          contenido.appendChild(nota);
        }

        if (resultados.length === 1) recordar(resultados[0]);
        mensajes.scrollTop = mensajes.scrollHeight;
      } catch (e) {
        pensando.parentElement?.remove();
        console.warn('JheiBot:', e);
        burbuja('No pude completar la búsqueda. Revisa la conexión a Supabase.');
      }
    }

    async function responder(pregunta) {
      const q = limpiar(pregunta);
      const especifico = identificarCurso(q);
      const s = q.match(/\bsemana\s*(\d+)\b/);
      const u = q.match(/\bunidad\s*(\d+)\b/);
      const semana = s ? Number(s[1]) : null;
      const unidad = u ? Number(u[1]) : null;

      const archivos =
        /\b(busca|buscar|encuentra|localiza|muestra|muestrame|tareas?|archivos?|documentos?|subi|subidos|guarde|guardados|enlaces?|links?|pdf)\b/.test(q);
      const material =
        /\b(tareas?|archivos?|documentos?|subi|subidos|guarde|guardados|enlaces?|links?|pdf)\b/.test(q);
      const actualizar = /actualiz|recarg|refresc/.test(q);
      const pideDefinicion =
        /\b(que es|que son|que significa|que significan|significado|significados|significa|significacion|definicion|concepto|de que trata|en que consiste|que se aprende|que estudia|explica|explicame|define|defineme)\b/.test(q);
      const pideEjemplo = /\bejemplos?\b/.test(q);

      if (/\b(reiniciar|olvida|limpia|borrar contexto)\b/.test(q)) {
        contexto = { curso: null, unidad: null, semana: null };
        pendiente = null;
        cache.clear();
        burbuja('Contexto reiniciado. ¿Qué quieres consultar?');
        return;
      }

      if (
        (pideDefinicion || pideEjemplo) &&
        !material && !actualizar &&
        semana === null && unidad === null
      ) {
        if (/\b(cursos|materias|asignaturas)\b/.test(q)) {
          pendiente = null;
          burbuja(cursos.length
            ? cursos.map(c => definicion(c.nombre)).join('\n\n')
            : 'No encontré los cursos en esta página.');
          return;
        }

        const referencia = /\b(curso|materia|asignatura)\b/.test(q);
        const seguimiento =
          /^(y )?(dame un ejemplo|un ejemplo|de que trata|que significa|explicame|definicion)( ese| este| eso)?$/.test(q);

             if (especifico || referencia || seguimiento) {
          const elegido = especifico || contexto.curso;

          if (elegido) {
            return explicar(elegido, pideEjemplo && !pideDefinicion);
          }

          pendiente = {
            tipo: 'definicion',
            soloEjemplo: pideEjemplo && !pideDefinicion
          };

          burbuja(
            '¿De Algoritmos y Estructura de Datos o de Taller de Desarrollo de Aplicación?'
          );
          return;
        }
      }

      if (
        pendiente &&
        especifico &&
        semana === null &&
        unidad === null &&
        !archivos &&
        !actualizar
      ) {
        const p = pendiente;
        pendiente = null;

        if (p.tipo === 'definicion') {
          return explicar(especifico, p.soloEjemplo);
        }

        return responder(
          (p.buscar ? 'Busca archivos ' : '') +
          (p.semana !== null ? `Semana ${p.semana} ` : '') +
          (p.unidad !== null ? `Unidad ${p.unidad} ` : '') +
          `de ${especifico}`
        );
      }

      if (
        archivos ||
        actualizar ||
        semana !== null ||
        unidad !== null
      ) {
        pendiente = null;
      }

      if (semana !== null && (semana < 1 || semana > 16)) {
        burbuja('Cada curso tiene semanas del 1 al 16.');
        return;
      }

      if (unidad !== null && (unidad < 1 || unidad > 4)) {
        burbuja('Cada curso tiene unidades del 1 al 4.');
        return;
      }

      const curso = especifico || contexto.curso;

      if (especifico && especifico !== contexto.curso) {
        contexto = {
          curso: especifico,
          unidad: null,
          semana: null
        };
      }

      if ((semana !== null || unidad !== null) && !curso) {
        pendiente = {
          tipo: 'ubicacion',
          semana,
          unidad,
          buscar: archivos || actualizar
        };

        burbuja(
          '¿De Algoritmos o de Taller de Desarrollo de Aplicación?'
        );
        return;
      }

      let coincidencia = null;

      if (semana !== null || unidad !== null) {
        coincidencia = semanas.find(m =>
          m.curso === curso &&
          (semana === null || numero(m.semana) === semana) &&
          (unidad === null || numero(m.unidad) === unidad)
        );

        if (!coincidencia) {
          burbuja('No encontré esa semana o unidad en el curso.');
          return;
        }

        contexto = {
          curso,
          unidad: coincidencia.unidad,
          semana: semana !== null ? coincidencia.semana : null
        };
      }

      if (archivos || actualizar) {
        return buscarArchivos(q, {
          curso: especifico ||
            (semana !== null || unidad !== null ? curso : null),
          semana,
          unidad
        });
      }

      if (semana !== null) {
        return describirSemana(coincidencia);
      }

      if (unidad !== null) {
        const temas = semanas
          .filter(m =>
            m.curso === curso &&
            m.unidad === coincidencia.unidad
          )
          .map(m => `${m.semana}: ${m.tema}`)
          .join('\n');

        burbuja(
          `${curso} · ${coincidencia.unidad}\n${temas}\n\n` +
          'Puedes preguntar: «¿Qué archivos hay en esta unidad?»'
        );
        return;
      }

      if (/\b(cursos|materias|asignaturas)\b/.test(q)) {
        burbuja(
          cursos.length
            ? 'Tus cursos son:\n' +
              cursos.map(c => '• ' + c.nombre).join('\n')
            : 'No encontré los cursos en esta página.'
        );
        return;
      }

      if (/sobre mi|perfil|estudiante|quien soy/.test(q)) {
        burbuja(
          'Este es el portafolio académico de Harold Jheison Carbajal Fierro, ' +
          'estudiante de Ingeniería de Sistemas de la UPLA.'
        );
        return;
      }

      if (especifico) {
        return explicar(especifico);
      }

      if (
        contexto.semana &&
        /\b(que hay|tema|esa|ahi|alli)\b/.test(q)
      ) {
        const m = semanas.find(m =>
          m.curso === contexto.curso &&
          m.semana === contexto.semana
        );

        if (m) return describirSemana(m);
      }

      if (/^(hola|buenas|buenos dias|buenas tardes|hey)\b/.test(q)) {
        burbuja(
          '¡Hola! 👋 Puedo explicar tus cursos, darte un ejemplo de algoritmo ' +
          'y buscar tus tareas.'
        );
        return;
      }

      burbuja(
        'Puedes preguntarme:\n\n' +
        '• ¿Qué significa Algoritmos y Estructura de Datos?\n' +
        '• Dame un ejemplo de algoritmo.\n' +
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
      '¡Hola! Soy JheiBot 2.2 🤖\n\n' +
      'Pregúntame «¿Qué significa Algoritmos y Estructura de Datos?» ' +
      'o «Dame un ejemplo de algoritmo».'
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
