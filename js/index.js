document.addEventListener('DOMContentLoaded', () => {
    cargarPeliculasRecientes();
    cargarSeriesRecientes();
});

async function cargarPeliculasRecientes() {
    try {
        const response = await fetch(`${API_URL}/api/peliculas?por_pagina=6`);
        const data = await response.json();

        const grid = document.getElementById('peliculasGrid');
        grid.innerHTML = '';

        data.items.forEach((pelicula) => {
            grid.innerHTML += crearCard(pelicula, 'pelicula');
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('peliculasGrid').innerHTML =
            '<p style="color: #999; text-align: center;">Error al cargar películas</p>';
    }
}

async function cargarSeriesRecientes() {
    try {
        const response = await fetch(`${API_URL}/api/series?por_pagina=6`);
        const data = await response.json();

        const grid = document.getElementById('seriesGrid');
        grid.innerHTML = '';

        data.items.forEach((serie) => {
            grid.innerHTML += crearCard(serie, 'serie');
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('seriesGrid').innerHTML =
            '<p style="color: #999; text-align: center;">Error al cargar series</p>';
    }
}

function buscar() {
    const query = document.getElementById('searchInput').value;
    if (query) {
        window.location.href = `/peliculas.html?buscar=${encodeURIComponent(query)}`;
    }
}

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscar();
});