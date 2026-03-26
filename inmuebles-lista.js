/* ══════════════════════════════════════════════════
   inmuebles-lista.js
   Funcionalidad:
   - Datos de inmuebles en memoria
   - Renderizado de la lista con paginación
   - Filtro de búsqueda (tipo + dirección)
   - Botón Nuevo  → navega a edicion-inmueble.html
   - Botón Ver    → navega a edicion-inmueble.html con id
   - Botón Eliminar → modal de confirmación
   - Paginación numérica con flechas
══════════════════════════════════════════════════ */

// ── 1. DATOS ──────────────────────────────────────
const ITEMS_POR_PAGINA = 5;

// Se leen del localStorage (guardados desde edición) o se usan los de ejemplo
function cargarInmuebles() {
  const guardados = localStorage.getItem('inmuebles');
  if (guardados) return JSON.parse(guardados);

  // Datos de ejemplo iniciales
  return [
    { id: 1, tipo: 'Apartamento', direccion: 'CR. 101 # 25 – 98',  ciudad: 'Bogotá',       departamento: 'Cundinamarca', matricula: '50N-00001', area: 85,  propietario: 'Carlos Pérez',   identificacion: '80123456', valor: '$65.000.000',  comercial: false, thumb: 'thumb-1' },
    { id: 2, tipo: 'Casa',        direccion: 'CR. 102 # 24 – 99',  ciudad: 'Medellín',     departamento: 'Antioquia',   matricula: '05N-00002', area: 120, propietario: 'Laura Gómez',    identificacion: '43987654', valor: '$58.000.000',  comercial: false, thumb: 'thumb-2' },
    { id: 3, tipo: 'Casa',        direccion: 'CR. 10 # 250 – 08',  ciudad: 'Cali',         departamento: 'Valle',       matricula: '76N-00003', area: 200, propietario: 'Mario Torres',   identificacion: '16456789', valor: '$78.000.000',  comercial: false, thumb: 'thumb-3' },
    { id: 4, tipo: 'Apartamento', direccion: 'CR. 151 # 125 – 09', ciudad: 'Barranquilla', departamento: 'Atlántico',   matricula: '08N-00004', area: 95,  propietario: 'Sofía Vargas',   identificacion: '22334455', valor: '$249.000.000', comercial: true,  thumb: 'thumb-4' },
    { id: 5, tipo: 'Apartamento', direccion: 'CR. 131 # 01 – 08',  ciudad: 'Bogotá',       departamento: 'Cundinamarca', matricula: '50N-00005', area: 70,  propietario: 'Andrés Ruiz',   identificacion: '79001122', valor: '$65.000.000',  comercial: false, thumb: 'thumb-5' },
    { id: 6, tipo: 'Local comercial', direccion: 'AV. 68 # 12 – 55', ciudad: 'Bogotá',    departamento: 'Cundinamarca', matricula: '50N-00006', area: 45,  propietario: 'Diana Mora',    identificacion: '52667788', valor: '$120.000.000', comercial: true,  thumb: 'thumb-1' },
    { id: 7, tipo: 'Casa',        direccion: 'CL. 80 # 50 – 30',   ciudad: 'Bucaramanga', departamento: 'Santander',   matricula: '68N-00007', area: 180, propietario: 'Felipe Castro',  identificacion: '91223344', valor: '$95.000.000',  comercial: false, thumb: 'thumb-3' },
  ];
}

function guardarInmuebles(data) {
  localStorage.setItem('inmuebles', JSON.stringify(data));
}

let inmuebles    = cargarInmuebles();
let paginaActual = 1;
let filtro       = '';

// ── 2. REFERENCIAS DOM ────────────────────────────
const lista        = document.getElementById('property-list');
const paginacion   = document.getElementById('paginacion');
const searchInput  = document.querySelector('.search-input');
const searchBtn    = document.querySelector('.search-btn');
const btnNuevo     = document.getElementById('btn-nuevo');
const modal        = document.getElementById('modal-eliminar');
const modalCancel  = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');
const toast        = document.getElementById('toast');

let idAEliminar = null;

// ── 3. RENDER DE FILAS ────────────────────────────
function renderLista() {
  const filtrados = filtrarInmuebles();
  const totalPags = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));

  // Si la página actual quedó fuera de rango tras eliminar/filtrar
  if (paginaActual > totalPags) paginaActual = totalPags;

  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const slice  = filtrados.slice(inicio, inicio + ITEMS_POR_PAGINA);

  lista.innerHTML = '';

  if (slice.length === 0) {
    lista.innerHTML = `
      <div class="empty-state">
        <span>🏠</span>
        <p>No se encontraron inmuebles.</p>
      </div>`;
  } else {
    slice.forEach((inm, i) => {
      const row = document.createElement('div');
      row.className = 'property-row';
      row.style.animationDelay = `${i * 0.05}s`;
      row.innerHTML = `
        <div class="prop-thumb-placeholder ${inm.thumb}"></div>
        <div class="prop-type">${inm.tipo}</div>
        <div class="prop-address">${inm.direccion}</div>
        <div class="prop-price">${inm.valor}</div>
        <div class="prop-actions">
          <a class="link-ver" data-id="${inm.id}">Ver</a>
          <a class="link-del" data-id="${inm.id}">Eliminar</a>
        </div>`;
      lista.appendChild(row);
    });

    // Eventos de Ver y Eliminar
    lista.querySelectorAll('.link-ver').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = `edicion-inmueble.html?id=${btn.dataset.id}`;
      });
    });

    lista.querySelectorAll('.link-del').forEach(btn => {
      btn.addEventListener('click', () => abrirModal(Number(btn.dataset.id)));
    });
  }

  renderPaginacion(totalPags);
}

// ── 4. FILTRO ─────────────────────────────────────
function filtrarInmuebles() {
  const q = filtro.trim().toLowerCase();
  if (!q) return inmuebles;
  return inmuebles.filter(inm =>
    inm.tipo.toLowerCase().includes(q)      ||
    inm.direccion.toLowerCase().includes(q) ||
    inm.ciudad.toLowerCase().includes(q)    ||
    inm.propietario.toLowerCase().includes(q)
  );
}

searchInput.addEventListener('input', () => {
  filtro = searchInput.value;
  paginaActual = 1;
  renderLista();
});

searchBtn.addEventListener('click', () => {
  filtro = searchInput.value;
  paginaActual = 1;
  renderLista();
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    filtro = searchInput.value;
    paginaActual = 1;
    renderLista();
  }
});

// ── 5. PAGINACIÓN ─────────────────────────────────
function renderPaginacion(totalPags) {
  paginacion.innerHTML = '';

  // Flecha izquierda
  const prev = crearPagBtn('&#9664;', 'page-arrow');
  prev.addEventListener('click', () => {
    if (paginaActual > 1) { paginaActual--; renderLista(); }
  });
  paginacion.appendChild(prev);

  // Números
  for (let p = 1; p <= totalPags; p++) {
    const btn = crearPagBtn(p, p === paginaActual ? 'active' : '');
    btn.addEventListener('click', () => { paginaActual = p; renderLista(); });
    paginacion.appendChild(btn);
  }

  // Flecha derecha
  const next = crearPagBtn('&#9654;', 'page-arrow');
  next.addEventListener('click', () => {
    if (paginaActual < totalPags) { paginaActual++; renderLista(); }
  });
  paginacion.appendChild(next);
}

function crearPagBtn(contenido, extraClass) {
  const div = document.createElement('div');
  div.className = `page-btn ${extraClass}`;
  div.innerHTML = contenido;
  return div;
}

// ── 6. BOTÓN NUEVO ────────────────────────────────
btnNuevo.addEventListener('click', () => {
  window.location.href = 'edicion-inmueble.html';
});

// ── 7. MODAL ELIMINAR ─────────────────────────────
function abrirModal(id) {
  idAEliminar = id;
  modal.classList.add('visible');
}

function cerrarModal() {
  modal.classList.remove('visible');
  idAEliminar = null;
}

modalCancel.addEventListener('click', cerrarModal);

// Cierra modal al hacer clic fuera del cuadro
modal.addEventListener('click', e => {
  if (e.target === modal) cerrarModal();
});

modalConfirm.addEventListener('click', () => {
  inmuebles = inmuebles.filter(inm => inm.id !== idAEliminar);
  guardarInmuebles(inmuebles);
  cerrarModal();
  renderLista();
  mostrarToast('Inmueble eliminado correctamente.');
});

// ── 8. TOAST ──────────────────────────────────────
function mostrarToast(mensaje) {
  toast.textContent = mensaje;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ── 9. DETECTAR INMUEBLE RECIÉN GUARDADO ──────────
// Si venimos de edición con ?guardado=1, mostramos toast
const params = new URLSearchParams(window.location.search);
if (params.get('guardado') === '1') {
  mostrarToast('Inmueble guardado correctamente.');
  // Limpia el parámetro de la URL sin recargar
  history.replaceState({}, '', 'inmuebles-lista.html');
}

// ── 10. INIT ──────────────────────────────────────
renderLista();
