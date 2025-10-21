let peliculaActual = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (slug) {
        cargarPelicula(slug);
    } else {
        window.location.href = '/peliculas.html';
    }
});

async function cargarPelicula(slug) {
    try {
        const response = await fetch(`${API_URL}/api/pelicula/${slug}`);
        peliculaActual = await response.json();

        mostrarDetalle(peliculaActual);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar la película');
    }
}

function mostrarDetalle(pelicula) {
    document.title = `${pelicula.titulo} - Cinevo`;
    document.getElementById('titulo').textContent = pelicula.titulo;
    document.getElementById('poster').src = pelicula.imagen;
    document.getElementById('backdrop').style.backgroundImage =
        `url(${pelicula.imagen})`;
    document.getElementById('descripcion').textContent =
        pelicula.descripcion || 'Sin descripción disponible';
    document.getElementById('año').textContent = pelicula.año || '';
    document.getElementById('duracion').textContent = pelicula.duracion || '';
    document.getElementById('calidad').textContent = pelicula.calidad || '';
    document.getElementById('rating').textContent =
        `⭐ ${pelicula.rating || 'N/A'}`;
    document.getElementById('director').textContent =
        (pelicula.director || []).join(', ') || 'No disponible';
    document.getElementById('actores').textContent =
        (pelicula.actores || []).slice(0, 5).join(', ') || 'No disponible';
    document.getElementById('generos').textContent =
        (pelicula.generos || []).join(', ') || 'No disponible';

    // Mostrar servidores
    const servidoresGrid = document.getElementById('servidoresGrid');
    if (pelicula.servidores && pelicula.servidores.length > 0) {
        servidoresGrid.innerHTML = '';
        pelicula.servidores.forEach((servidor, index) => {
            servidoresGrid.innerHTML += `
                        <div class="servidor-card" onclick="reproducirServidor(${index})">
                            <div class="servidor-nombre">${servidor.nombre}</div>
                            <div class="servidor-desc">${servidor.descripcion}</div>
                        </div>
                    `;
        });
    } else {
        servidoresGrid.innerHTML = '<p>No hay servidores disponibles</p>';
    }
}

function reproducir() {
    if (peliculaActual && peliculaActual.servidores && peliculaActual.servidores.length > 0) {
        reproducirServidor(0);
    }
}

function reproducirServidor(index) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    window.location.href = `/reproductor.html?tipo=pelicula&slug=${slug}&servidor=${index}`;
}

function verTrailer() {
    if (peliculaActual && peliculaActual.trailer) {
        window.open(peliculaActual.trailer, '_blank');
    } else {
        alert('Trailer no disponible');
    }
}