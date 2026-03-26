/* ══════════════════════════════════════════════════
   edicion-inmueble.js
   Funcionalidad:
   - Si URL tiene ?id=X, carga ese inmueble del localStorage
   - Botón Guardar: valida campos y guarda en localStorage
   - Redirige a inmuebles-lista.html?guardado=1 al guardar
   - Botón ✕ vuelve a la lista sin guardar
══════════════════════════════════════════════════ */

// ── 1. REFERENCIAS DOM ────────────────────────────
const campos = {
  direccion:      document.getElementById('direccion'),
  tipo:           document.getElementById('tipo'),
  ciudad:         document.getElementById('ciudad'),
  departamento:   document.getElementById('departamento'),
  matricula:      document.getElementById('matricula'),
  area:           document.getElementById('area'),
  propietario:    document.getElementById('propietario'),
  identificacion: document.getElementById('identificacion'),
  valor:          document.getElementById('valor'),
  comercial:      document.getElementById('uso-comercial'),
};

const btnGuardar = document.querySelector('.btn-save');
const btnCerrar  = document.querySelector('.btn-close');
const toast      = document.getElementById('toast');
const cardTitle  = document.querySelector('.card-title');

// ── 2. CARGAR DATOS (modo edición) ────────────────
const params = new URLSearchParams(window.location.search);
const idEdicion = params.get('id') ? Number(params.get('id')) : null;

function cargarInmuebles() {
  const data = localStorage.getItem('inmuebles');
  return data ? JSON.parse(data) : [];
}

function guardarInmuebles(data) {
  localStorage.setItem('inmuebles', JSON.stringify(data));
}

if (idEdicion !== null) {
  cardTitle.textContent = 'Edición de Inmueble';
  const inmuebles = cargarInmuebles();
  const inm = inmuebles.find(i => i.id === idEdicion);

  if (inm) {
    campos.direccion.value      = inm.direccion      || '';
    campos.tipo.value           = inm.tipo           || '';
    campos.ciudad.value         = inm.ciudad         || '';
    campos.departamento.value   = inm.departamento   || '';
    campos.matricula.value      = inm.matricula      || '';
    campos.area.value           = inm.area           || '';
    campos.propietario.value    = inm.propietario    || '';
    campos.identificacion.value = inm.identificacion || '';
    campos.valor.value          = inm.valor          || '';
    campos.comercial.checked    = inm.comercial      || false;
  }
} else {
  cardTitle.textContent = 'Nuevo Inmueble';
}

// ── 3. VALIDACIÓN ─────────────────────────────────
const requeridos = ['direccion', 'tipo', 'ciudad', 'departamento',
                    'matricula', 'area', 'propietario', 'identificacion', 'valor'];

function validar() {
  let valido = true;

  requeridos.forEach(key => {
    const el = campos[key];
    const vacio = !el.value.trim();
    el.classList.toggle('campo-error', vacio);
    if (vacio) valido = false;
  });

  return valido;
}

// Quitar error al escribir
requeridos.forEach(key => {
  campos[key].addEventListener('input', () => {
    campos[key].classList.remove('campo-error');
  });
});

// ── 4. GUARDAR ────────────────────────────────────
btnGuardar.addEventListener('click', () => {
  if (!validar()) {
    mostrarToast('Por favor completa todos los campos requeridos.', 'error');
    return;
  }

  const inmuebles = cargarInmuebles();

  if (idEdicion !== null) {
    // Actualizar existente
    const idx = inmuebles.findIndex(i => i.id === idEdicion);
    if (idx !== -1) {
      inmuebles[idx] = {
        ...inmuebles[idx],
        direccion:      campos.direccion.value.trim(),
        tipo:           campos.tipo.value,
        ciudad:         campos.ciudad.value.trim(),
        departamento:   campos.departamento.value.trim(),
        matricula:      campos.matricula.value.trim(),
        area:           Number(campos.area.value),
        propietario:    campos.propietario.value.trim(),
        identificacion: campos.identificacion.value.trim(),
        valor:          campos.valor.value.trim(),
        comercial:      campos.comercial.checked,
      };
    }
  } else {
    // Crear nuevo
    const nuevoId = inmuebles.length > 0
      ? Math.max(...inmuebles.map(i => i.id)) + 1
      : 1;

    const thumbs = ['thumb-1','thumb-2','thumb-3','thumb-4','thumb-5'];
    const thumb  = thumbs[nuevoId % thumbs.length];

    inmuebles.push({
      id:             nuevoId,
      thumb,
      direccion:      campos.direccion.value.trim(),
      tipo:           campos.tipo.value,
      ciudad:         campos.ciudad.value.trim(),
      departamento:   campos.departamento.value.trim(),
      matricula:      campos.matricula.value.trim(),
      area:           Number(campos.area.value),
      propietario:    campos.propietario.value.trim(),
      identificacion: campos.identificacion.value.trim(),
      valor:          campos.valor.value.trim(),
      comercial:      campos.comercial.checked,
    });
  }

  guardarInmuebles(inmuebles);
  window.location.href = 'inmuebles-lista.html?guardado=1';
});

// ── 5. BOTÓN CERRAR ───────────────────────────────
btnCerrar.addEventListener('click', () => {
  window.location.href = 'inmuebles-lista.html';
});

// ── 6. TOAST ──────────────────────────────────────
function mostrarToast(mensaje, tipo = 'ok') {
  toast.textContent = mensaje;
  toast.className   = 'toast visible ' + tipo;
  setTimeout(() => toast.classList.remove('visible'), 3500);
}
