let paginaActual = 1;
let filtros = {
    genero: '',
    año: '',
    calidad: '',
    ordenar: 'reciente',
    buscar: ''
};

document.addEventListener('DOMContentLoaded', () => {
    const busqueda = obtenerParametroURL('buscar');
    if (busqueda) {
        document.getElementById('searchInput').value = busqueda;
        filtros.buscar = busqueda;
    }
    
    cargarGeneros();
    cargarAños();
    cargarPeliculas();
});

async function cargarGeneros() {
    try {
        const response = await fetch(`${API_URL}/api/generos/peliculas`);
        const generos = await response.json();
        
        const select = document.getElementById('filtroGenero');
        generos.forEach(genero => {
            select.innerHTML += `<option value="${genero}">${genero}</option>`;
        });
    } catch (error) {
        console.error('Error cargando géneros:', error);
    }
}

function cargarAños() {
    const select = document.getElementById('filtroAño');
    const añoActual = new Date().getFullYear();
    
    for (let año = añoActual; año >= 1990; año--) {
        select.innerHTML += `<option value="${año}">${año}</option>`;
    }
}

async function cargarPeliculas(pagina = 1) {
    paginaActual = pagina;
    
    try {
        let url = `${API_URL}/api/peliculas?pagina=${pagina}&por_pagina=20`;
        
        if (filtros.genero) url += `&genero=${filtros.genero}`;
        if (filtros.año) url += `&año=${filtros.año}`;
        if (filtros.calidad) url += `&calidad=${filtros.calidad}`;
        if (filtros.ordenar) url += `&ordenar=${filtros.ordenar}`;
        
        if (filtros.buscar) {
            url = `${API_URL}/api/peliculas/buscar?q=${filtros.buscar}&pagina=${pagina}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        mostrarPeliculas(data);
        mostrarPaginacion(data);
        actualizarInfo(data);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('peliculasGrid', 'Error al cargar películas');
    }
}

function mostrarPeliculas(data) {
    const grid = document.getElementById('peliculasGrid');
    
    if (!data.items || data.items.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #999;">No se encontraron películas</p>';
        return;
    }
    
    grid.innerHTML = '';
    data.items.forEach((pelicula, index) => {
        const indiceGlobal = (data.pagina_actual - 1) * data.items_por_pagina + index;
        grid.innerHTML += crearCard(pelicula, 'pelicula', indiceGlobal);
    });
}

function mostrarPaginacion(data) {
    const paginacion = document.getElementById('pagination');
    
    if (data.total_paginas <= 1) {
        paginacion.innerHTML = '';
        return;
    }
    
    paginacion.innerHTML = crearPaginacion(
        data.pagina_actual, 
        data.total_paginas, 
        'cargarPeliculas'
    );
}

function actualizarInfo(data) {
    const info = document.getElementById('resultadosInfo');
    const inicio = (data.pagina_actual - 1) * data.items_por_pagina + 1;
    const fin = Math.min(inicio + data.items.length - 1, data.total_items);
    
    info.textContent = `Mostrando ${inicio}-${fin} de ${data.total_items} películas`;
}

function aplicarFiltros() {
    filtros.genero = document.getElementById('filtroGenero').value;
    filtros.año = document.getElementById('filtroAño').value;
    filtros.calidad = document.getElementById('filtroCalidad').value;
    filtros.ordenar = document.getElementById('ordenar').value;
    
    cargarPeliculas(1);
}

function limpiarFiltros() {
    document.getElementById('filtroGenero').value = '';
    document.getElementById('filtroAño').value = '';
    document.getElementById('filtroCalidad').value = '';
    document.getElementById('ordenar').value = 'reciente';
    document.getElementById('searchInput').value = '';
    
    filtros = {
        genero: '',
        año: '',
        calidad: '',
        ordenar: 'reciente',
        buscar: ''
    };
    
    if (window.location.search) {
        window.history.pushState({}, '', window.location.pathname);
    }
    
    cargarPeliculas(1);
}

function buscar() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (query) {
        filtros.buscar = query;
        cargarPeliculas(1);
    } else {
        filtros.buscar = '';
        cargarPeliculas(1);
    }
}

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscar();
});