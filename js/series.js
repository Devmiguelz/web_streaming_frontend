let paginaActual = 1;
let filtros = {
    genero: '',
    ordenar: 'reciente',
    buscar: ''
};

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay búsqueda en URL
    const busqueda = obtenerParametroURL('buscar');
    if (busqueda) {
        document.getElementById('searchInput').value = busqueda;
        filtros.buscar = busqueda;
    }
    
    cargarGeneros();
    cargarSeries();
});

async function cargarGeneros() {
    try {
        const response = await fetch(`${API_URL}/api/generos/series`);
        const generos = await response.json();
        
        const select = document.getElementById('filtroGenero');
        generos.forEach(genero => {
            select.innerHTML += `<option value="${genero}">${genero}</option>`;
        });
    } catch (error) {
        console.error('Error cargando géneros:', error);
    }
}

async function cargarSeries(pagina = 1) {
    paginaActual = pagina;
    
    try {
        // Construir URL con filtros
        let url = `${API_URL}/api/series?pagina=${pagina}&por_pagina=20`;
        
        if (filtros.genero) url += `&genero=${filtros.genero}`;
        if (filtros.ordenar) url += `&ordenar=${filtros.ordenar}`;
        
        // Si hay búsqueda, usar endpoint de búsqueda
        if (filtros.buscar) {
            url = `${API_URL}/api/series/buscar?q=${filtros.buscar}&pagina=${pagina}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        mostrarSeries(data);
        mostrarPaginacion(data);
        actualizarInfo(data);
        
        // Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('seriesGrid', 'Error al cargar series');
    }
}

function mostrarSeries(data) {
    const grid = document.getElementById('seriesGrid');
    
    if (!data.items || data.items.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #999;">No se encontraron series</p>';
        return;
    }
    
    grid.innerHTML = '';
    data.items.forEach((serie, index) => {
        const indiceGlobal = (data.pagina_actual - 1) * data.items_por_pagina + index;
        grid.innerHTML += crearCard(serie, 'serie', indiceGlobal);
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
        'cargarSeries'
    );
}

function actualizarInfo(data) {
    const info = document.getElementById('resultadosInfo');
    const inicio = (data.pagina_actual - 1) * data.items_por_pagina + 1;
    const fin = Math.min(inicio + data.items.length - 1, data.total_items);
    
    info.textContent = `Mostrando ${inicio}-${fin} de ${data.total_items} series`;
}

function aplicarFiltros() {
    filtros.genero = document.getElementById('filtroGenero').value;
    filtros.ordenar = document.getElementById('ordenar').value;
    
    cargarSeries(1);
}

function limpiarFiltros() {
    document.getElementById('filtroGenero').value = '';
    document.getElementById('ordenar').value = 'reciente';
    document.getElementById('searchInput').value = '';
    
    filtros = {
        genero: '',
        ordenar: 'reciente',
        buscar: ''
    };
    
    // Limpiar URL si hay búsqueda
    if (window.location.search) {
        window.history.pushState({}, '', window.location.pathname);
    }
    
    cargarSeries(1);
}

function buscar() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (query) {
        filtros.buscar = query;
        cargarSeries(1);
    } else {
        filtros.buscar = '';
        cargarSeries(1);
    }
}

// Enter para buscar
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscar();
});