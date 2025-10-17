/**
 * Detecta el entorno y retorna la URL correcta del backend
 */
function getApiUrl() {
    const hostname = window.location.hostname;
    
    // Si estamos en localhost o 127.0.0.1 = desarrollo
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5400';
    }
    
    // Si estamos en producción = backend de Render
    return 'https://web-streaming-backend.onrender.com';
}

// API Base URL (se ajusta automáticamente)
const API_URL = getApiUrl();

/**
 * Crea una card HTML para película o serie
 */
function crearCard(item, tipo) {
    const calidad = item.calidad ? `<div class="badge-quality">${item.calidad}</div>` : '';
    const rating = item.rating ? `<div class="rating">⭐ ${item.rating}</div>` : '';
    const badge = tipo === 'serie' ? '<div class="badge">SERIE</div>' : '';
    
    const url = tipo === 'pelicula' 
        ? `/detalle-pelicula.html?id=${item.id}` 
        : `/detalle-serie.html?id=${item.id}`;
    
    return `
        <div class="card" onclick="window.location.href='${url}'">
            <img src="${item.imagen}" alt="${item.titulo}" loading="lazy">
            ${calidad}
            ${badge}
            ${rating}
            <div class="card-info">
                <div class="card-title">${item.titulo}</div>
                <div class="card-meta">
                    ${item.año ? `<span>${item.año}</span>` : ''}
                    ${item.generos ? item.generos.slice(0, 2).map(g => `<span>${g}</span>`).join('') : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Crea botones de paginación
 */
function crearPaginacion(paginaActual, totalPaginas, callback) {
    let html = '';
    
    // Botón anterior
    html += `<button ${paginaActual === 1 ? 'disabled' : ''} 
             onclick="${callback}(${paginaActual - 1})">← Anterior</button>`;
    
    // Páginas
    const rango = 2;
    const inicio = Math.max(1, paginaActual - rango);
    const fin = Math.min(totalPaginas, paginaActual + rango);
    
    if (inicio > 1) {
        html += `<button onclick="${callback}(1)">1</button>`;
        if (inicio > 2) html += `<span>...</span>`;
    }
    
    for (let i = inicio; i <= fin; i++) {
        html += `<button class="${i === paginaActual ? 'active' : ''}" 
                 onclick="${callback}(${i})">${i}</button>`;
    }
    
    if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) html += `<span>...</span>`;
        html += `<button onclick="${callback}(${totalPaginas})">${totalPaginas}</button>`;
    }
    
    // Botón siguiente
    html += `<button ${paginaActual === totalPaginas ? 'disabled' : ''} 
             onclick="${callback}(${paginaActual + 1})">Siguiente →</button>`;
    
    return html;
}

/**
 * Muestra un mensaje de error
 */
function mostrarError(contenedor, mensaje) {
    document.getElementById(contenedor).innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #999;">
            <p>${mensaje}</p>
        </div>
    `;
}

/**
 * Obtiene parámetros de la URL
 */
function obtenerParametroURL(nombre) {
    const params = new URLSearchParams(window.location.search);
    return params.get(nombre);
}

/**
 * Formatea duración
 */
function formatearDuracion(duracion) {
    if (!duracion) return '';
    return duracion;
}

/**
 * Trunca texto
 */
function truncarTexto(texto, limite) {
    if (!texto) return '';
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
}

function toggleFiltros() {
    const filtrosContent = document.querySelector('.filtros-content');
    const toggleButton = document.querySelector('.filtros-toggle');
    
    filtrosContent.classList.toggle('active');
    toggleButton.classList.toggle('active');
}