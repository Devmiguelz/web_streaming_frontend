let contenidoActual = null;
let parametros = {};

document.addEventListener('DOMContentLoaded', () => {
    // Obtener parámetros
    parametros = {
        tipo: obtenerParametroURL('tipo'),
        id: obtenerParametroURL('id'),
        temporada: obtenerParametroURL('temporada'),
        episodio: obtenerParametroURL('episodio'),
        servidor: parseInt(obtenerParametroURL('servidor')) || 0
    };
    
    if (!parametros.tipo || !parametros.id) {
        alert('Error: Parámetros inválidos');
        volverAtras();
        return;
    }
    
    if (parametros.tipo === 'pelicula') {
        cargarPelicula();
    } else if (parametros.tipo === 'serie') {
        cargarSerie();
    }
});

async function cargarPelicula() {
    try {
        const response = await fetch(`${API_URL}/api/pelicula/${parametros.id}`);
        contenidoActual = await response.json();
        
        document.getElementById('contenidoTitulo').textContent = contenidoActual.titulo;
        document.getElementById('contenidoDetalle').textContent = 
            `${contenidoActual.año || ''} | ${contenidoActual.duracion || ''} | ${contenidoActual.calidad || ''}`;
        
        mostrarServidores(contenidoActual.servidores);
        reproducirServidor(parametros.servidor);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar la película');
    }
}

async function cargarSerie() {
    try {
        const response = await fetch(`${API_URL}/api/serie/${parametros.id}`);
        contenidoActual = await response.json();
        
        const temporada = contenidoActual.temporadas[parametros.temporada];
        const episodio = temporada.episodios[parametros.episodio];
        
        document.getElementById('contenidoTitulo').textContent = 
            `${contenidoActual.titulo} - ${episodio.titulo}`;
        document.getElementById('contenidoDetalle').textContent = 
            `${temporada.nombre} | ${episodio.estado}`;
        
        mostrarServidores(episodio.servidores);
        reproducirServidor(parametros.servidor);
        mostrarNavegacionEpisodios(temporada, parametros.episodio);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar la serie');
    }
}

function mostrarServidores(servidores) {
    const lista = document.getElementById('servidoresList');
    
    if (!servidores || servidores.length === 0) {
        lista.innerHTML = '<p style="color: #999;">No hay servidores disponibles</p>';
        return;
    }
    
    lista.innerHTML = '';
    servidores.forEach((servidor, index) => {
        const activo = index === parametros.servidor ? 'active' : '';
        lista.innerHTML += `
            <button class="servidor-btn ${activo}" onclick="cambiarServidor(${index})">
                ${servidor.nombre} (${servidor.idioma || 'LAT'})
            </button>
        `;
    });
}

function reproducirServidor(index) {
    let servidores;
    
    if (parametros.tipo === 'pelicula') {
        servidores = contenidoActual.servidores;
    } else {
        const temporada = contenidoActual.temporadas[parametros.temporada];
        const episodio = temporada.episodios[parametros.episodio];
        servidores = episodio.servidores;
    }
    
    if (!servidores || !servidores[index]) {
        alert('Servidor no disponible');
        return;
    }
    
    const servidor = servidores[index];
    const iframe = document.getElementById('playerFrame');
    
    if (servidor.url_redirect) {
        iframe.src = servidor.url_redirect;
    } else {
        alert('URL del servidor no disponible');
    }
}

function cambiarServidor(index) {
    parametros.servidor = index;
    
    const url = new URL(window.location);
    url.searchParams.set('servidor', index);
    window.history.pushState({}, '', url);
    
    reproducirServidor(index);
    
    document.querySelectorAll('.servidor-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

function mostrarNavegacionEpisodios(temporada, episodioActual) {
    const nav = document.getElementById('episodiosNav');
    nav.style.display = 'flex';
    
    const totalEpisodios = temporada.episodios.length;
    const numEpisodio = parseInt(episodioActual);
    
    document.getElementById('episodioActual').textContent = 
        `Episodio ${numEpisodio + 1} de ${totalEpisodios}`;
    
    const btnAnterior = nav.querySelector('button:first-child');
    const btnSiguiente = nav.querySelector('button:last-child');
    
    btnAnterior.disabled = numEpisodio === 0;
    btnSiguiente.disabled = numEpisodio === totalEpisodios - 1;
}

function episodioAnterior() {
    const nuevoEpisodio = parseInt(parametros.episodio) - 1;
    if (nuevoEpisodio >= 0) {
        window.location.href = `/reproductor.html?tipo=serie&id=${parametros.id}&temporada=${parametros.temporada}&episodio=${nuevoEpisodio}&servidor=0`;
    }
}

function episodioSiguiente() {
    const temporada = contenidoActual.temporadas[parametros.temporada];
    const nuevoEpisodio = parseInt(parametros.episodio) + 1;
    
    if (nuevoEpisodio < temporada.episodios.length) {
        window.location.href = `/reproductor.html?tipo=serie&id=${parametros.id}&temporada=${parametros.temporada}&episodio=${nuevoEpisodio}&servidor=0`;
    }
}

function volverAtras() {
    if (parametros.tipo === 'pelicula') {
        window.location.href = `/detalle-pelicula.html?id=${parametros.id}`;
    } else if (parametros.tipo === 'serie') {
        window.location.href = `/detalle-serie.html?id=${parametros.id}`;
    } else {
        window.location.href = '/';
    }
}