async function cargarRelacionados(itemId, tipo) {
    const grid = document.getElementById('relacionadosGrid');
    
    try {
        const tipoPlural = tipo === 'pelicula' ? 'peliculas' : 'series';
        const endpoint = `${API_URL}/api/${tipoPlural}/${itemId}/relacionados?limite=6`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error('Error al cargar relacionados');
        }
        
        const data = await response.json();
        const relacionados = data.relacionados || [];

        if (relacionados.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #999;">No se encontró contenido relacionado</p>';
            return;
        }

        grid.innerHTML = relacionados.map(item => crearCardRelacionado(item, tipo)).join('');

    } catch (error) {
        console.error('Error cargando relacionados:', error);
        grid.innerHTML = '<p style="text-align: center; color: #e50914;">Error al cargar contenido relacionado</p>';
    }
}

async function obtenerItemActual(itemId, tipo) {
    const endpoint = tipo === 'pelicula' ? '/api/peliculas' : '/api/series';
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        const data = await response.json();
        
        return data.find(item => item.id === itemId);
    } catch (error) {
        console.error('Error obteniendo item actual:', error);
        return null;
    }
}

async function buscarRelacionados(generos, año, tipo, idActual) {
    const endpoint = tipo === 'pelicula' ? '/api/peliculas' : '/api/series';
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        let items = await response.json();
        
        const relacionados = items.filter(item => {

            if (item.id === idActual) return false;
            
            const comparteGenero = generos && item.generos && 
                generos.some(g => item.generos.includes(g));
            
            const añoCercano = año && item.año && 
                Math.abs(parseInt(item.año) - parseInt(año)) <= 3;
            
            return comparteGenero || añoCercano;
        });

        relacionados.sort((a, b) => {
            const aGeneros = generos && a.generos ? 
                generos.filter(g => a.generos.includes(g)).length : 0;
            const bGeneros = generos && b.generos ? 
                generos.filter(g => b.generos.includes(g)).length : 0;
            
            return bGeneros - aGeneros;
        });

        return relacionados.slice(0, 6);

    } catch (error) {
        console.error('Error buscando relacionados:', error);
        return [];
    }
}

function crearCardRelacionado(item, tipo) {
    const url = tipo === 'pelicula' 
        ? `/detalle-pelicula.html?id=${item.id}` 
        : `/detalle-serie.html?id=${item.id}`;
    
    const imagen = item.poster || item.imagen || 'assets/images/nodisponible.png';
    const titulo = item.titulo || item.nombre || 'Sin título';
    const descripcion = item.descripcion || item.sinopsis || 'Sin descripción disponible';
    const año = item.año || 'N/A';
    const calificacion = item.calificacion || item.rating || 'N/A';
    
    // Obtener el primer género
    const genero = item.generos && item.generos.length > 0 
        ? item.generos[0] 
        : 'General';

    detalle = tipo === 'pelicula' ? `<span>⭐ ${calificacion}</span><span>📅 ${año}</span>` : ``;

    return `
        <article class="relacionado-card">
            <a class="relacionado-link" href="${url}">
                <span class="sr-only">${titulo}</span>
            </a>
            <img 
                width="48" 
                height="72" 
                src="${imagen}" 
                loading="lazy" 
                alt="${titulo}"
                onerror="this.src='assets/images/nodisponible.png'"
            >
            <div class="relacionado-content">
                <h2 class="relacionado-titulo">${titulo}</h2>
                <div class="relacionado-info">
                    <span class="relacionado-badge">${genero}</span>
                    ${detalle}                    
                </div>
                <p class="relacionado-descripcion">${descripcion}</p>
            </div>
        </article>
    `;
}

function inicializarRelacionados() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    const esPelicula = window.location.pathname.includes('pelicula.html');
    const tipo = esPelicula ? 'pelicula' : 'serie';
    
    if (id) {
        cargarRelacionados(id, tipo);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarRelacionados);
} else {
    inicializarRelacionados();
}