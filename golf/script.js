// Aparición suave de bloques al entrar en pantalla
(() => {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

  items.forEach((el) => observer.observe(el));
})();

// Instalaciones: la foto grande cambia al pasar el ratón o al enfocar con teclado
(() => {
  const items = [...document.querySelectorAll('.fac__item')];
  const shots = [...document.querySelectorAll('.fac__media img')];
  if (!items.length || !shots.length) return;

  const desktop = window.matchMedia('(min-width: 768px)');

  const show = (i) => {
    if (!desktop.matches) return;
    items.forEach((el, n) => {
      el.classList.toggle('is-active', n === i);
      el.setAttribute('aria-pressed', String(n === i));
    });
    shots.forEach((img, n) => img.classList.toggle('is-active', n === i));
  };

  items.forEach((el, i) => {
    el.addEventListener('pointerenter', () => show(i));
    el.addEventListener('focus', () => show(i));
    el.addEventListener('click', () => show(i));
  });
})();

// Reserva: recorrido, día y franja horaria
(() => {
  const section = document.getElementById('reserva');
  if (!section) return;

  const courses = [...section.querySelectorAll('.course')];
  const plans = [...section.querySelectorAll('.plan')];
  const days = [...section.querySelectorAll('.day')];
  const hours = [...section.querySelectorAll('.hour')];
  const planName = section.querySelector('[data-plan-name]');
  const planMeta = section.querySelector('[data-plan-meta]');
  const out = {
    course: section.querySelector('[data-summary="course"]'),
    day: section.querySelector('[data-summary="day"]'),
    hour: section.querySelector('[data-summary="hour"]'),
  };

  const DIAS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  // Los próximos siete días a partir de hoy
  const hoy = new Date();
  days.forEach((el) => {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + Number(el.dataset.offset));
    el.textContent = `${DIAS[fecha.getDay()]} ${fecha.getDate()}`;
    el.dataset.label = `${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
  });

  const pick = (list, el, write) => {
    list.forEach((item) => {
      const on = item === el;
      item.classList.toggle('is-active', on);
      item.setAttribute('aria-checked', String(on));
    });
    write(el);
  };

  // Recorrido: cambia el plano visible, el título, los datos y el resumen
  const selectCourse = (i, focus) => {
    const { key, name, meta } = courses[i].dataset;
    courses.forEach((el, n) => {
      el.classList.toggle('is-active', n === i);
      el.setAttribute('aria-checked', String(n === i));
      el.setAttribute('tabindex', n === i ? '0' : '-1');
    });
    plans.forEach((plan) => {
      const on = plan.dataset.plan === key;
      plan.classList.toggle('is-active', on);
      plan.toggleAttribute('aria-hidden', !on);
    });
    planName.textContent = name;
    planMeta.textContent = meta;
    out.course.textContent = name;
    if (focus) courses[i].focus();
  };

  courses.forEach((el, i) => {
    el.addEventListener('click', () => selectCourse(i));
    el.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      selectCourse((i + step + courses.length) % courses.length, true);
    });
  });

  days.forEach((el) => {
    el.addEventListener('click', () => pick(days, el, (d) => { out.day.textContent = d.dataset.label; }));
  });

  hours.forEach((el) => {
    el.addEventListener('click', () => pick(hours, el, (h) => { out.hour.textContent = h.textContent; }));
  });

  out.day.textContent = days[0].dataset.label;   // hoy viene seleccionado

  // Envío: sin backend, solo confirmación visible en la propia página
  const form = section.querySelector('.request');
  const done = section.querySelector('.request__done');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    done.hidden = false;
    form.querySelector('.cta').disabled = true;
  });
})();

// Membresía: el CTA revela la dirección de contacto, con opción de copiarla
(() => {
  const trigger = document.querySelector('.mem .cta');
  const block = document.getElementById('mem-mail');
  if (!trigger || !block) return;

  const address = block.querySelector('.mem__mail-address').textContent.trim();
  const copyBtn = block.querySelector('.mem__copy');
  const status = block.querySelector('.mem__copied');

  trigger.addEventListener('click', () => {
    if (!block.hidden) return;
    block.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    void block.offsetWidth;            // fuerza el reflujo para que la transición corra
    block.classList.add('is-visible');
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      // Sin permiso de portapapeles: se selecciona para copiar a mano
      const range = document.createRange();
      range.selectNodeContents(block.querySelector('.mem__mail-address'));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      status.textContent = 'Seleccionado';
      return;
    }
    status.textContent = 'Copiado';
    setTimeout(() => { status.textContent = ''; }, 2400);
  });
})();

// Menú móvil
(() => {
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('menu');
  if (!toggle || !menu) return;

  const close = menu.querySelector('.menu__close');

  // viaTeclado: el anillo de foco solo se muestra si se abrió/cerró con teclado
  const setOpen = (open, viaTeclado = true) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
    (open ? close : toggle).focus({ preventScroll: true, focusVisible: viaTeclado });
  };

  // event.detail === 0 cuando el click se dispara con teclado (Enter/Espacio)
  toggle.addEventListener('click', (e) => setOpen(true, e.detail === 0));
  close.addEventListener('click', (e) => setOpen(false, e.detail === 0));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false, false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
  });

  // Si se vuelve a escritorio con el menú abierto, se cierra
  window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
    if (e.matches && menu.classList.contains('is-open')) setOpen(false);
  });
})();
