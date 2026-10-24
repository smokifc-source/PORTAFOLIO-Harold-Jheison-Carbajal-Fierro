
/*
 * BUSCADOR DE TAREAS UPLA
 * Busca temas, semanas, archivos y enlaces de Supabase.
 * No modifica las funciones de guardado ni eliminación.
 */

(() => {
  'use strict';

  function iniciarBuscador() {
    const seccion = document.getElementById('cursos');
    const encabezado = seccion?.querySelector('.section-heading');
    const tarjetas = [...document.querySelectorAll('.course-card')];

    if (!encabezado || !tarjetas.length ||
        document.getElementById('bt-buscador')) return;

    // ESTILOS DEL BUSCADOR
    const styles = document.createElement('style');

    styles.textContent = `
      #bt-buscador {
        margin:24px 0 34px;
        padding:24px;
        border:1px solid #dbe5ff;
        border-radius:22px;
        background:#fff;
        box-shadow:0 18px 38px rgba(25,46,103,.10);
      }

      #bt-buscador * { box-sizing:border-box; }

      #bt-buscador .bt-heading {
        display:flex;
        align-items:center;
        gap:12px;
        margin-bottom:8px;
      }

      #bt-buscador .bt-icon {
        display:grid;
        place-items:center;
        width:44px;
        height:44px;
        border-radius:14px;
        background:#e9eeff;
        font-size:21px;
      }

      #bt-buscador h3 {
        color:#142e70;
        margin:0;
        font-size:clamp(1.2rem,2vw,1.5rem);
      }

      #bt-buscador .bt-intro {
        color:#5d6b82;
        line-height:1.65;
        margin:4px 0 17px;
      }

      #bt-buscador .bt-form {
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        align-items:stretch;
      }

      #bt-buscador input,
      #bt-buscador select {
        min-height:45px;
        border:1px solid #cfdcf6;
        border-radius:11px;
        background:#f8faff;
        color:#172d5e;
        padding:10px 12px;
        font:inherit;
      }

      #bt-buscador input {
        flex:2 1 240px;
        min-width:0;
      }

      #bt-buscador select {
        flex:1 1 155px;
        min-width:125px;
        max-width:280px;
      }

      #bt-buscador button {
        cursor:pointer;
        font:inherit;
      }

      #bt-buscador .bt-submit {
        border:0;
        border-radius:11px;
        padding:10px 19px;
        background:linear-gradient(125deg,#3048af,#6650cf);
        color:#fff;
        font-weight:800;
      }

      #bt-buscador .bt-refresh {
        border:1px solid #cfdcf6;
        border-radius:11px;
        padding:10px 14px;
        background:#eef2ff;
        color:#273b80;
        font-weight:750;
      }

      #bt-buscador button:disabled {
        opacity:.65;
        cursor:wait;
      }

      #bt-buscador .bt-status {
        min-height:22px;
        margin-top:12px;
        font-size:.88rem;
        color:#50628c;
      }

      #bt-buscador .bt-list {
        display:grid;
        gap:11px;
        margin-top:12px;
      }

      #bt-buscador .bt-result {
        display:flex;
        gap:13px;
        align-items:center;
        justify-content:space-between;
        flex-wrap:wrap;
        background:#f8faff;
        border:1px solid #dfe7fa;
        border-radius:15px;
        padding:14px;
      }

      #bt-buscador .bt-text {
        flex:1 1 225px;
        min-width:0;
      }

      #bt-buscador .bt-text strong {
        display:block;
        color:#172e70;
        overflow-wrap:anywhere;
        font-size:.94rem;
      }

      #bt-buscador .bt-meta {
        margin:5px 0 0;
        color:#667792;
        font-size:.79rem;
        line-height:1.6;
      }

      #bt-buscador .bt-type {
        display:inline-block;
        margin-bottom:6px;
        font-size:.68rem;
        font-weight:800;
        letter-spacing:.07em;
        color:#4b51ba;
        text-transform:uppercase;
      }

      #bt-buscador .bt-actions {
        display:flex;
        flex-wrap:wrap;
        gap:7px;
      }

      #bt-buscador .bt-actions a,
      #bt-buscador .bt-actions button {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        border:1px solid #c9d4f3;
        border-radius:9px;
        padding:9px 12px;
        background:#fff;
        color:#3549a6;
        text-decoration:none;
        font-weight:750;
        font-size:.8rem;
      }

      #bt-buscador .bt-actions a {
        background:#4055c8;
        border-color:#4055c8;
        color:#fff;
      }

      #bt-buscador .bt-empty {
        padding:14px;
        color:#60708a;
        border:1px dashed #cbd6f0;
        border-radius:12px;
      }

      .bt-highlight {
        outline:3px solid #6e69f0!important;
        outline-offset:4px;
        scroll-margin-top:140px;
        transition:outline-color .3s;
      }

      @media(max-width:640px) {
        #bt-buscador { padding:17px; }

        #bt-buscador .bt-form>* {
          max-width:none!important;
          flex:1 1 100%!important;
        }

        #bt-buscador .bt-actions { width:100%; }
      }
    `;

    document.head.appendChild(styles);

    // CREAR INTERFAZ
    const panel = document.createElement('section');
    panel.id = 'bt-buscador';
    panel.setAttribute('aria-labelledby', 'bt-titulo');

    panel.innerHTML = `
      <div class="bt-heading">
        <span class="bt-icon" aria-hidden="true">🔎</span>
        <h3 id="bt-titulo">Buscador de tareas y semanas</h3>
      </div>

      <p class="bt-intro">
        Encuentra temas, archivos que subiste y enlaces
        guardados en tus dos cursos.
      </p>

      <form class="bt-form" id="bt-form" role="search">

        <input
          id="bt-entrada"
          type="search"
          maxlength="160"
          placeholder="Ej.: matriz, semana 6, informe.pdf"
          aria-label="Buscar tarea o semana"
          required
        >

        <select id="bt-curso" aria-label="Filtrar por curso">
          <option value="">Ambos cursos</option>
        </select>

        <select id="bt-tipo" aria-label="Filtrar por tipo">
          <option value="">Todo</option>
          <option value="archivo">Archivos subidos</option>
          <option value="semana">Temas y semanas</option>
          <option value="enlace">Enlaces guardados</option>
        </select>

        <button class="bt-submit" type="submit">
          Buscar
        </button>

        <button
          class="bt-refresh"
          type="button"
          title="Buscar tareas recién subidas">
          ↻ Actualizar archivos
        </button>
      </form>

      <p
        class="bt-status"
        id="bt-estado"
        role="status"
        aria-live="polite">
        Escribe lo que necesitas y pulsa Buscar.
      </p>

      <div
        class="bt-list"
        id="bt-resultados"
        aria-label="Resultados de búsqueda">
      </div>
    `;

    encabezado.insertAdjacentElement('afterend', panel);

    const input = panel.querySelector('#bt-entrada');
    const form = panel.querySelector('#bt-form');
    const filtroCurso = panel.querySelector('#bt-curso');
    const filtroTipo = panel.querySelector('#bt-tipo');
    const refrescar = panel.querySelector('.bt-refresh');
    const buscarBtn = panel.querySelector('.bt-submit');
    const estado = panel.querySelector('#bt-estado');
    const resultados = panel.querySelector('#bt-resultados');

    // UTILIDADES DE TEXTO
    const rutaSegura = texto => String(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();

    const normalizar = texto => String(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[_\-.]+/g, ' ')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // OBTENER SEMANAS DEL PORTAFOLIO
    const semanas = [];

    for (const tarjeta of tarjetas) {

      const curso = tarjeta
        .querySelector('.course-header h3')
        ?.textContent.trim() || 'Curso';

      if (![...filtroCurso.options].some(o => o.value === curso)) {
        const opcion = document.createElement('option');
        opcion.value = curso;
        opcion.textContent = curso;
        filtroCurso.appendChild(opcion);
      }

      for (const unidadEl of tarjeta.querySelectorAll('.unit-block')) {

        const unidad = unidadEl
          .querySelector('.unit-toggle')
          ?.dataset.unidad ||
          unidadEl.querySelector('h4')
          ?.textContent.trim() || 'Unidad';

        for (const semanaEl of unidadEl.querySelectorAll('.week-item')) {

          const semana = semanaEl
            .querySelector('label')
            ?.textContent.trim() || 'Semana';

          const tema = semanaEl
            .querySelector('span')
            ?.textContent.trim() || 'Sin tema';

          const carpeta = [curso, unidad, semana]
            .map(rutaSegura).join('/');

          semanas.push({
            curso,
            unidad,
            semana,
            tema,
            carpeta,
            unidadEl,
            semanaEl
          });
        }
      }
    }

    // ÍNDICE DE TEMAS
    const itemsSemanas = semanas.map(m => ({
      ...m,
      tipo: 'semana',
      nombre: m.tema,
      indice: normalizar(
        [m.curso, m.unidad, m.semana, m.tema].join(' ')
      )
    }));

    let itemsGuardados = [];
    let fechaIndice = 0;
    let escaneo = null;
    let fallos = 0;

    // CONEXIÓN A SUPABASE YA EXISTENTE
    const cliente = () =>
      (typeof sb !== 'undefined' && sb?.storage) ? sb : null;

    const almacen = () =>
      (typeof BUCKET !== 'undefined' ? BUCKET : 'tareas');

    // LEER ARCHIVOS SUBIDOS
    async function listarArchivos(meta) {

      const archivoStorage = cliente().storage.from(almacen());
      const encontrados = [];
      const LIMITE = 100;

      for (let offset = 0; offset < 500; offset += LIMITE) {

        const {data, error} = await archivoStorage.list(
          meta.carpeta,
          {
            limit: LIMITE,
            offset,
            sortBy: {column: 'name', order: 'asc'}
          }
        );

        if (error) throw error;

        encontrados.push(...(data || []));

        if (!data || data.length < LIMITE) break;
      }

      return encontrados
        .filter(f =>
          f && f.name &&
          f.name !== '.emptyFolderPlaceholder'
        )
        .map(f => ({
          ...meta,
          tipo: f.name === 'enlace.json'
            ? 'enlace' : 'archivo',
          nombre: f.name === 'enlace.json'
            ? 'Enlace guardado' : f.name,
          archivo: f.name,
          indice: normalizar([
            meta.curso,
            meta.unidad,
            meta.semana,
            meta.tema,
            f.name === 'enlace.json'
              ? 'enlace link' : f.name
          ].join(' '))
        }));
    }

    // CREAR ÍNDICE DESDE SUPABASE
    async function cargarIndice(forzar = false) {

      if (escaneo) return escaneo;

      if (
        !forzar &&
        fechaIndice &&
        Date.now() - fechaIndice < 5 * 60 * 1000
      ) return;

      if (!cliente()) {
        estado.textContent =
          'No se pudo conectar con Supabase. ' +
          'Solo puedo buscar temas y semanas.';
        fallos = semanas.length;
        return;
      }

      buscarBtn.disabled = true;
      refrescar.disabled = true;

      estado.textContent =
        `Consultando las ${semanas.length} semanas de Supabase…`;

      escaneo = (async () => {

        const nuevos = [];
        let completadas = 0;
        fallos = 0;
        let siguiente = 0;

        // CUATRO CONSULTAS SIMULTÁNEAS
        async function trabajador() {

          while (siguiente < semanas.length) {

            const pos = siguiente++;

            try {
              nuevos.push(
                ...await listarArchivos(semanas[pos])
              );
            } catch (e) {
              fallos++;

              console.warn(
                'No se pudo listar:',
                semanas[pos].carpeta,
                e
              );
            }

            completadas++;

            estado.textContent =
              `Revisando archivos: ${completadas} ` +
              `de ${semanas.length} semanas…`;
          }
        }

        await Promise.all(
          Array.from(
            {length: Math.min(4, semanas.length)},
            trabajador
          )
        );

        itemsGuardados = nuevos;
        fechaIndice = Date.now();

      })().finally(() => {
        escaneo = null;
        buscarBtn.disabled = false;
        refrescar.disabled = false;
      });

      return escaneo;
    }

    // ABRIR SEMANA DESPLEGABLE
    function irASemana(meta) {

      const boton = meta.unidadEl
        .querySelector('.unit-toggle');

      if (
        boton &&
        boton.getAttribute('aria-expanded') !== 'true'
      ) {
        boton.click();
      }

      meta.semanaEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      meta.semanaEl.classList.add('bt-highlight');

      window.setTimeout(() => {
        meta.semanaEl.classList.remove('bt-highlight');
      }, 2400);
    }

    // MOSTRAR RESULTADOS
    function dibujar() {

      resultados.replaceChildren();

      const consulta = normalizar(input.value);

      if (!consulta) {
        estado.textContent =
          'Escribe el nombre de un archivo, ' +
          'una semana o un tema para buscar.';
        return;
      }

      const palabras = consulta.split(' ');

      const lista = [
        ...itemsGuardados,
        ...itemsSemanas
      ].filter(item =>

        (!filtroCurso.value ||
         item.curso === filtroCurso.value) &&

        (!filtroTipo.value ||
         item.tipo === filtroTipo.value) &&

        palabras.every(p =>
          item.indice.includes(p)
        )

      ).sort((a, b) =>
        ({archivo: 0, enlace: 1, semana: 2}[a.tipo] -
         {archivo: 0, enlace: 1, semana: 2}[b.tipo])
      );

      const avisoFallos = fallos
        ? ` ⚠️ No se pudieron consultar ${fallos} carpetas de Supabase.`
        : '';

      estado.textContent =
        `${lista.length} resultado(s) encontrados.` +
        avisoFallos;

      if (!lista.length) {

        const vacio = document.createElement('p');
        vacio.className = 'bt-empty';

        vacio.textContent = fallos
          ? 'No hubo coincidencias en los datos accesibles. ' +
            'Algunas carpetas no se pudieron consultar.'
          : 'No encontré coincidencias. Prueba con otra ' +
            'palabra o pulsa «Actualizar archivos».';

        resultados.appendChild(vacio);
        return;
      }

      for (const item of lista.slice(0, 60)) {

        const fila = document.createElement('article');
        fila.className = 'bt-result';

        const info = document.createElement('div');
        info.className = 'bt-text';

        const tipo = document.createElement('span');
        tipo.className = 'bt-type';

        tipo.textContent =
          item.tipo === 'archivo' ? '📄 Archivo subido' :
          item.tipo === 'enlace' ? '🔗 Enlace guardado' :
          '📚 Tema de semana';

        const nombre = document.createElement('strong');
        nombre.textContent = item.nombre;

        const meta = document.createElement('p');
        meta.className = 'bt-meta';

        meta.textContent =
          `${item.curso} · ${item.unidad} · ${item.semana}` +
          (item.tipo !== 'semana'
            ? ` · ${item.tema}` : '');

        info.append(tipo, nombre, meta);

        const acciones = document.createElement('div');
        acciones.className = 'bt-actions';

        // ABRIR ARCHIVO
        if (item.tipo === 'archivo') {

          const link = document.createElement('a');

          link.textContent = 'Abrir archivo ↗';
          link.target = '_blank';
          link.rel = 'noopener noreferrer';

          link.href = cliente()
            ?.storage.from(almacen())
            .getPublicUrl(
              `${item.carpeta}/${item.archivo}`
            ).data.publicUrl || '#';

          acciones.appendChild(link);
        }

        // LOCALIZAR SEMANA
        const ir = document.createElement('button');
        ir.type = 'button';
        ir.textContent = 'Ir a la semana →';

        ir.addEventListener('click', () => {
          irASemana(item);
        });

        acciones.appendChild(ir);
        fila.append(info, acciones);
        resultados.appendChild(fila);
      }

      if (lista.length > 60) {

        const aviso = document.createElement('p');
        aviso.className = 'bt-meta';

        aviso.textContent =
          'Se muestran los primeros 60 resultados. ' +
          'Escribe más detalles para afinar la búsqueda.';

        resultados.appendChild(aviso);
      }
    }

    // BOTÓN BUSCAR
    form.addEventListener('submit', async e => {
      e.preventDefault();

      if (!input.value.trim()) return;

      await cargarIndice();
      dibujar();
    });

    // ACTUALIZAR ARCHIVOS
    refrescar.addEventListener('click', async () => {

      await cargarIndice(true);

      if (input.value.trim()) {
        dibujar();
      } else {
        estado.textContent =
          `Índice actualizado: ${
            itemsGuardados.filter(
              i => i.tipo === 'archivo'
            ).length
          } archivo(s) y ${
            itemsGuardados.filter(
              i => i.tipo === 'enlace'
            ).length
          } enlace(s) detectados.` +
          (fallos
            ? ` No se pudieron consultar ${fallos} carpetas.`
            : '');
      }
    });

    // FILTROS
    filtroTipo.addEventListener('change', () => {
      if (input.value.trim()) dibujar();
    });

    filtroCurso.addEventListener('change', () => {
      if (input.value.trim()) dibujar();
    });

    input.addEventListener('input', () => {
      if (!input.value.trim()) {
        resultados.replaceChildren();
      }
    });
  }

  // INICIAR CUANDO CARGUE LA PÁGINA
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      iniciarBuscador
    );
  } else {
    iniciarBuscador();
  }

})();
