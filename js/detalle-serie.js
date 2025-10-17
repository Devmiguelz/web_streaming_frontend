let serieActual = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        cargarSerie(id);
    } else {
        window.location.href = '/series.html';
    }
});

async function cargarSerie(id) {
    try {
        const response = await fetch(`/api/serie/${id}`);
        serieActual = await response.json();

        mostrarDetalle(serieActual);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar la serie');
    }
}

function mostrarDetalle(serie) {
    document.title = `${serie.titulo} - Cinevo`;
    document.getElementById('titulo').textContent = serie.titulo;
    document.getElementById('poster').src = serie.imagen;
    document.getElementById('backdrop').style.backgroundImage =
        `url(${serie.imagen})`;
    document.getElementById('descripcion').textContent =
        serie.descripcion || 'Sin descripción disponible';
    document.getElementById('generos').textContent =
        (serie.generos || []).join(', ') || 'No disponible';

    const temporadas = serie.temporadas || [];
    document.getElementById('temporadas').textContent =
        `${temporadas.length} temporada${temporadas.length !== 1 ? 's' : ''}`;

    const selector = document.getElementById('selectorTemporada');
    selector.innerHTML = '';
    temporadas.forEach((temp, index) => {
        selector.innerHTML += `
                    <option value="${index}">${temp.nombre}</option>
                `;
    });

    if (temporadas.length > 0) {
        mostrarEpisodios(0);
    }
}

function cambiarTemporada() {
    const selector = document.getElementById('selectorTemporada');
    const index = parseInt(selector.value);
    mostrarEpisodios(index);
}

function mostrarEpisodios(temporadaIndex) {
    const temporada = serieActual.temporadas[temporadaIndex];
    const grid = document.getElementById('episodiosGrid');

    if (temporada && temporada.episodios && temporada.episodios.length > 0) {
        grid.innerHTML = '';
        temporada.episodios.forEach((episodio, epIndex) => {
            const servidoresDisponibles = episodio.servidores && episodio.servidores.length > 0;
            grid.innerHTML += `
                        <div class="episodio-card ${servidoresDisponibles ? '' : 'disabled'}" 
                             onclick="${servidoresDisponibles ? `reproducirEpisodio(${temporadaIndex}, ${epIndex})` : ''}">
                            <img src="${episodio.imagen}" alt="${episodio.titulo}">
                            <div class="episodio-info">
                                <div class="episodio-numero">${episodio.numero}</div>
                                <div class="episodio-titulo">${episodio.titulo}</div>
                                <div class="episodio-estado">${episodio.estado || 'No disponible'}</div>
                            </div>
                            ${servidoresDisponibles ? '<div class="play-icon">▶</div>' : ''}
                        </div>
                    `;
        });
    } else {
        grid.innerHTML = '<p>No hay episodios disponibles</p>';
    }
}

function reproducirEpisodio(temporadaIndex, episodioIndex) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    window.location.href = `/reproductor.html?tipo=serie&id=${id}&temporada=${temporadaIndex}&episodio=${episodioIndex}&servidor=0`;
}

function verTrailer() {
    if (serieActual && serieActual.trailer) {
        window.open(serieActual.trailer, '_blank');
    } else {
        alert('Trailer no disponible');
    }
}