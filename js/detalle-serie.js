let serieActual = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (slug) {
        cargarSerieBasica(slug);
    } else {
        window.location.href = '/series.html';
    }
});

/**
 * Carga la información básica de la serie (rápido: 2-3 seg)
 */
async function cargarSerieBasica(slug) {
    try {
        const response = await fetch(`${API_URL}/api/serie/${slug}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar la serie');
        }
        
        serieActual = await response.json();
        mostrarInfoBasica(serieActual);
        
        // Si hay temporadas, cargar automáticamente la primera
        if (serieActual.temporadas && serieActual.temporadas.length > 0) {
            cargarTemporada(slug, 1); // Cargar temporada 1 por defecto
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar la serie. Por favor, intenta nuevamente.');
    }
}

/**
 * Muestra la información básica de la serie
 */
function mostrarInfoBasica(serie) {
    document.title = `${serie.titulo} - Cinevo`;
    document.getElementById('titulo').textContent = serie.titulo;
    document.getElementById('poster').src = serie.imagen;
    document.getElementById('backdrop').style.backgroundImage = `url(${serie.imagen})`;
    document.getElementById('descripcion').textContent = serie.descripcion || 'Sin descripción disponible';
    document.getElementById('generos').textContent = (serie.generos || []).join(', ') || 'No disponible';
    
    // Mostrar cantidad de temporadas
    const numTemporadas = serie.temporadas ? serie.temporadas.length : 0;
    document.getElementById('temporadas').textContent = `${numTemporadas} temporada${numTemporadas !== 1 ? 's' : ''}`;
    
    // Llenar el selector de temporadas
    const selector = document.getElementById('selectorTemporada');
    selector.innerHTML = '';
    
    if (serie.temporadas && serie.temporadas.length > 0) {
        serie.temporadas.forEach((temp, index) => {
            selector.innerHTML += `<option value="${index + 1}">${temp.nombre}</option>`;
        });
        selector.disabled = false;
    } else {
        selector.innerHTML = '<option>No hay temporadas disponibles</option>';
        selector.disabled = true;
    }
}

/**
 * Carga una temporada específica bajo demanda (30-60 seg)
 */
async function cargarTemporada(slug, numeroTemporada) {
        
    const grid = document.getElementById('episodiosGrid');
    grid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Cargando episodios de la temporada ${numeroTemporada}...
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/api/serie/${slug}/temporada/${numeroTemporada}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar la temporada');
        }
        
        const temporadaData = await response.json();
                
        mostrarEpisodios(temporadaData);
        
    } catch (error) {
        console.error('Error al cargar temporada:', error);
        grid.innerHTML = `
            <div class="error-message">
                <p>Error al cargar los episodios.</p>
                <button class="btn btn-primary" onclick="cargarTemporada('${slug}', ${numeroTemporada})">
                    Reintentar
                </button>
            </div>
        `;
    }
}

/**
 * Maneja el cambio de temporada desde el selector
 */
function cambiarTemporada() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const selector = document.getElementById('selectorTemporada');
    const numeroTemporada = parseInt(selector.value);
    
    if (slug && numeroTemporada) {
        cargarTemporada(slug, numeroTemporada);
    }
}

/**
 * Muestra los episodios de una temporada
 */
function mostrarEpisodios(temporadaData) {
    const grid = document.getElementById('episodiosGrid');
    
    if (!temporadaData || !temporadaData.episodios || temporadaData.episodios.length === 0) {
        grid.innerHTML = '<p class="no-content">No hay episodios disponibles para esta temporada.</p>';
        return;
    }
    
    grid.innerHTML = '';
    
    temporadaData.episodios.forEach((episodio, index) => {
        const servidoresDisponibles = episodio.servidores && episodio.servidores.length > 0;
        const cardClass = servidoresDisponibles ? 'episodio-card' : 'episodio-card disabled';
        
        const card = document.createElement('div');
        card.className = cardClass;
        if (servidoresDisponibles) {
            card.onclick = () => reproducirEpisodio(temporadaData.temporada_numero, index);
        }
        
        card.innerHTML = `
            <img src="${episodio.imagen || serieActual.imagen}" 
                 alt="${episodio.titulo}"
                 onerror="this.src='${serieActual.imagen}'">
            <div class="episodio-info">
                <div class="episodio-numero">E${episodio.numero}</div>
                <div class="episodio-titulo">${episodio.titulo}</div>
                ${episodio.descripcion ? `<div class="episodio-descripcion">${episodio.descripcion}</div>` : ''}
                <div class="episodio-estado">${servidoresDisponibles ? 'Disponible' : 'No disponible'}</div>
            </div>
            ${servidoresDisponibles ? '<div class="play-icon">▶</div>' : ''}
        `;
        
        grid.appendChild(card);
    });
}

/**
 * Reproduce un episodio específico
 */
function reproducirEpisodio(numeroTemporada, episodioIndex) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    
    if (!slug) {
        alert('Error: No se pudo identificar la serie.');
        return;
    }
        
    window.location.href = `/reproductor.html?tipo=serie&slug=${slug}&temporada=${numeroTemporada}&episodio=${episodioIndex}&servidor=0`;
}

/**
 * Abre el trailer de la serie
 */
function verTrailer() {
    if (serieActual && serieActual.trailer) {
        window.open(serieActual.trailer, '_blank');
    } else {
        alert('Trailer no disponible para esta serie.');
    }
}