
/*
  JHEIBOT - ASISTENTE ACADÉMICO
  Universidad Peruana Los Andes
  Lee los cursos y semanas del portafolio.
  No necesita API ni servicios de pago.
*/

document.addEventListener('DOMContentLoaded', () => {

  // CREAR EL CHATBOT AUTOMÁTICAMENTE
  const widget = document.createElement('div');
  widget.className = 'jhei-widget';

  widget.innerHTML = `
    <button id="jhei-open" type="button"
      aria-label="Abrir JheiBot"
      aria-expanded="false">
      <img src="robot-chatbot.png" alt="">
    </button>

    <section id="jhei-panel" role="dialog"
      aria-label="Chat con JheiBot" hidden>

      <header class="jhei-header">
        <img src="robot-chatbot.png" alt="">

        <div>
          <strong>JheiBot 🤖</strong>
          <small>Asistente académico · En línea</small>
        </div>

        <button id="jhei-close" type="button"
          aria-label="Cerrar chat">×</button>
      </header>

      <div id="jhei-messages" aria-live="polite"></div>

      <div class="jhei-suggestions">
        <button type="button"
          data-question="¿Cuáles son los cursos?">
          📚 Cursos
        </button>

        <button type="button"
          data-question="¿Cómo veo las tareas?">
          📂 Tareas
        </button>
      </div>

      <form id="jhei-form">
        <input id="jhei-input"
          autocomplete="off"
          maxlength="300"
          placeholder="Pregúntame algo..."
          aria-label="Tu mensaje"
          required>

        <button type="submit"
          aria-label="Enviar mensaje">➤</button>
      </form>

    </section>
  `;

  document.body.appendChild(widget);

  // ELEMENTOS
  const openBtn = document.getElementById('jhei-open');
  const panel = document.getElementById('jhei-panel');
  const closeBtn = document.getElementById('jhei-close');
  const messages = document.getElementById('jhei-messages');
  const form = document.getElementById('jhei-form');
  const input = document.getElementById('jhei-input');

  const courses = Array.from(
    document.querySelectorAll('.course-card')
  );

  let lastCourse = null;

  // NORMALIZAR TEXTO
  const clean = s => String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const courseName = c =>
    c?.querySelector('.course-header h3')
      ?.textContent.trim() || 'Curso';

  // ABRIR Y CERRAR CHAT
  function show(open) {
    panel.hidden = !open;
    openBtn.setAttribute('aria-expanded', String(open));

    if (open) input.focus();
  }

  openBtn.addEventListener('click', () => {
    show(panel.hidden);
  });

  closeBtn.addEventListener('click', () => {
    show(false);
  });

  // MOSTRAR MENSAJES
  function message(text, sender = 'bot', destination = null) {

    const row = document.createElement('div');
    row.className = `jhei-message ${sender}`;

    if (sender === 'bot') {
      const img = document.createElement('img');
      img.src = 'robot-chatbot.png';
      img.alt = 'JheiBot';
      row.appendChild(img);
    }

    const bubble = document.createElement('div');
    bubble.className = 'jhei-bubble';
    bubble.textContent = text;

    if (destination && destination.element) {

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '📍 Ir a esa sección';

      btn.addEventListener('click', () => {

        if (destination.unit) {

          const toggle = destination.unit
            .querySelector('.unit-toggle');

          if (toggle &&
              toggle.getAttribute('aria-expanded') !== 'true') {
            toggle.click();
          }
        }

        show(false);

        destination.element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      });

      bubble.appendChild(btn);
    }

    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  // RESPUESTAS AUTOMÁTICAS
  function answer(question) {

    const q = clean(question);

    let c = /algorit|estructura de datos|\baed\b/.test(q)
      ? courses[1]
      : /taller|desarrollo de aplicacion/.test(q)
      ? courses[0]
      : lastCourse;

    if (c) lastCourse = c;

    const week = q.match(/semana\s*(\d{1,2})/);
    const unit = q.match(/unidad\s*([1-4])/);

    // BUSCAR SEMANA
    if (week) {

      const n = Number(week[1]);

      if (n < 1 || n > 16) {
        return ['Cada curso tiene semanas del 1 al 16.'];
      }

      if (!c) {
        return [
          `¿La semana ${n} de Taller de Desarrollo de Aplicación o de Algoritmos y Estructura de Datos?`
        ];
      }

      for (const u of c.querySelectorAll('.unit-block')) {

        const w = Array.from(
          u.querySelectorAll('.week-item')
        ).find(e =>
          Number(
            e.querySelector('label')
              ?.textContent.match(/\d+/)?.[0]
          ) === n
        );

        if (w) {
          const topic = w.querySelector('span')
            ?.textContent.trim() || 'Sin tema';

          return [
            `${courseName(c)} · Semana ${n}\nTema: ${topic}`,
            { element: w, unit: u }
          ];
        }
      }

      return ['No encontré esa semana en el portafolio.'];
    }

    // BUSCAR UNIDAD
    if (unit) {

      if (!c) {
        return [
          `¿La unidad ${unit[1]} de cuál de los dos cursos?`
        ];
      }

      const u = c.querySelectorAll('.unit-block')[
        Number(unit[1]) - 1
      ];

      if (u) {

        const topics = Array.from(
          u.querySelectorAll('.week-item')
        ).map(w =>
          `${w.querySelector('label')?.textContent}: ${
            w.querySelector('span')?.textContent
          }`
        );

        return [
          `${courseName(c)} · Unidad ${unit[1]}\n${topics.join('\n')}`,
          { element: u, unit: u }
        ];
      }
    }

    // SALUDOS
    if (/hola|buenas|saludos/.test(q)) {
      return [
        '¡Hola! 👋 Soy JheiBot, el asistente de este portafolio. Pregúntame sobre cursos, unidades, semanas o tareas.'
      ];
    }

    // TAREAS Y ARCHIVOS
    if (/tarea|archivo|enlace|pdf|subir|descargar/.test(q)) {
      return [
        'Abre Cursos, selecciona una unidad y luego una semana. Allí puedes ver los archivos y enlaces publicados. Para subir contenido debes iniciar sesión.',
        { element: document.getElementById('cursos') }
      ];
    }

    // CURSOS
    if (/cursos|materias|asignaturas/.test(q)) {

      const listado = courses.map(
        (item, i) => `${i + 1}. ${courseName(item)}`
      ).join('\n');

      return [
        `Aquí encontrarás:\n${listado}\nCada curso tiene 4 unidades y 16 semanas.`,
        { element: document.getElementById('cursos') }
      ];
    }

    // PERFIL
    if (/sobre mi|perfil|estudiante|quien/.test(q)) {
      return [
        'Este es el portafolio académico de Harold Jheison Carbajal Fierro, estudiante de Ingeniería de Sistemas de la UPLA.',
        { element: document.getElementById('sobre-mi') }
      ];
    }

    // INFORMACIÓN DEL CURSO
    if (c) {
      return [
        `${courseName(c)} tiene 4 unidades y 16 semanas. Pregúntame, por ejemplo: «Semana 6 de ${courseName(c)}».`,
        { element: c }
      ];
    }

    // RESPUESTA POR DEFECTO
    return [
      'Soy JheiBot 🤖. Puedes preguntarme: «Cursos», «Semana 6 de Algoritmos», «Unidad 2 de Taller» o «¿Cómo veo las tareas?».'
    ];
  }

  // PROCESAR PREGUNTA
  function ask(question) {
    const q = question.trim();

    if (!q) return;

    message(q, 'user');

    const [text, location] = answer(q);
    message(text, 'bot', location || null);
  }

  // ENVIAR MENSAJE
  form.addEventListener('submit', e => {
    e.preventDefault();

    ask(input.value);
    input.value = '';
  });

  // BOTONES DE SUGERENCIAS
  widget.querySelectorAll('[data-question]').forEach(button => {
    button.addEventListener('click', () => {
      ask(button.dataset.question);
    });
  });

  // BIENVENIDA INICIAL
  message(
    '¡Hola! 👋 Soy JheiBot. ¿Quieres conocer mis cursos o encontrar una semana?'
  );

});
